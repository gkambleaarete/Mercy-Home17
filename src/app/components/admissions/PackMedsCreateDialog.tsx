// @ts-nocheck
import React, { useState } from "react";
import { AlertTriangle, AlertCircle, FileText, X, Package, Tag, ChevronUp, ChevronDown, Check, ClipboardList } from "@/app/lib/lucide-icons";
import { PackMedsLogModal } from "./PackMedsLogModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { cn } from "../../lib/utils";
import { toast } from "sonner@2.0.3";
import { MedicationCodeSelector, type MedCode, MED_CODES, SET_PRIMARY_CODES, MED_CODE_MAP } from "./MedicationCodeSelector";
import { DateInput } from "../ui/date-input";
import { formatMdy } from "../../lib/dateFormat";

const SET_PRIMARY_CODES_LOCAL: MedCode[] = SET_PRIMARY_CODES;

const defaultPrnMedications = [
    { medication: "Ibuprofen 400mg", doses: "2" },
    { medication: "Albuterol Inhaler", doses: "1" },
    { medication: "Diphenhydramine (Benadryl) 25mg", doses: "1" },
];
const defaultOtcMedications = [
    { medication: "Melatonin", dose: "", quantity: "", doses: "", status: "Approved", availableDoses: ["1mg","2.5mg","3mg","5mg"] },
    { medication: "Acetaminophen (Tylenol)", dose: "", quantity: "", doses: "", status: "Approved", availableDoses: ["325mg","500mg","650mg"] },
    { medication: "Cetirizine (Zyrtec)", dose: "", quantity: "", doses: "", status: "Approved", availableDoses: ["5mg","10mg"] },
    { medication: "Miralax", dose: "", quantity: "", doses: "", status: "Not Approved", availableDoses: ["17g"] },
    { medication: "Loratadine (Claritin)", dose: "", quantity: "", doses: "", status: "Approved", availableDoses: ["5mg","10mg"] },
];

const tabOrderArr = ["doses", "setPrimary", "packingPrep", "dispense", "count", "handOff", "review", "disposal"] as const;
const tabOrder: Record<string, number> = Object.fromEntries(tabOrderArr.map((k, i) => [k, i]));

const codeAuditFlag = (fullCodeValue: string): boolean => {
    const code = fullCodeValue.split(" -- ")[0];
    return MED_CODE_MAP[code]?.auditFlag ?? false;
};

function MedCodePicker({ codes, value, onChange, allowNull, placeholder }) {
    const selected = codes.find(c => c.code === value.split(" -- ")[0]) ?? null;
    return (
        <MedicationCodeSelector
            codes={codes}
            value={selected}
            onChange={(c) => onChange(c ? c.fullLabel : "")}
            maxHeight={272}
        />
    );
}

export function PackMedsCreateDialog(props: any) {
    const {
        isCreatePackDialogOpen, setIsCreatePackDialogOpen,
        createPackActiveTab, setCreatePackActiveTab,
        selectedPackId, setSelectedPackId,
        newPackForm, setNewPackForm,
        dateRangeApplied, setDateRangeApplied,
        appliedDateRange, setAppliedDateRange,
        isDateChangeWarningOpen, setIsDateChangeWarningOpen,
        pendingDateChange, setPendingDateChange,
        isModifyPrnDialogOpen, setIsModifyPrnDialogOpen,
        isModifyAllPrnDialogOpen, setIsModifyAllPrnDialogOpen,
        selectedPrnIndex, setSelectedPrnIndex,
        prnMedications, setPrnMedications,
        otcMedications, setOtcMedications,
        isSetPrimaryModalOpen, setIsSetPrimaryModalOpen,
        setPrimarySelectedCode, setSetPrimarySelectedCode,
        setPrimaryPackComment, setSetPrimaryPackComment,
        setPrimaryShowLog, setSetPrimaryShowLog,
        setPrimaryMedRows, setSetPrimaryMedRows,
        setPrimaryPrnRows, setSetPrimaryPrnRows,
        setPrimaryOtcRowsData, setSetPrimaryOtcRowsData,
        setPrimaryLogEntries, setSetPrimaryLogEntries,
        setPrimaryCommentError, setSetPrimaryCommentError,
        packingPrepInnerTab, setPackingPrepInnerTab,
        isLabelStyleModalOpen, setIsLabelStyleModalOpen,
        packPrepCarryStatuses,
        packPrepMedSelected, setPackPrepMedSelected,
        packPrepPrnSelected, setPackPrepPrnSelected,
        packPrepOtcSelected, setPackPrepOtcSelected,
        packPrepMedRows, setPackPrepMedRows,
        packPrepPrnRows, setPackPrepPrnRows,
        packPrepOtcRows, setPackPrepOtcRows,
        packPrepLogEntries,
        dispenseInnerTab, setDispenseInnerTab,
        dispenseMedRows, setDispenseMedRows,
        dispensePrnRows, setDispensePrnRows,
        dispenseOtcRows, setDispenseOtcRows,
        dispenseLogEntries,
        countRows, setCountRows,
        countRowsOriginal, setCountRowsOriginal,
        hasRowChanges,
        handOffInnerTab, setHandOffInnerTab,
        handOffMedRows, setHandOffMedRows,
        handOffPrnRows, setHandOffPrnRows,
        handOffOtcRows, setHandOffOtcRows,
        handOffLogEntries,
        isYouthReceivedModalOpen, setIsYouthReceivedModalOpen,
        youthReceivedToggle, setYouthReceivedToggle,
        recipientType, setRecipientType,
        recipientName, setRecipientName,
        packComment, setPackComment,
        reviewInnerTab, setReviewInnerTab,
        reviewMedRows, setReviewMedRows,
        reviewPrnRows, setReviewPrnRows,
        reviewOtcRows, setReviewOtcRows,
        reviewLogEntries, setReviewLogEntries,
        isSetReviewStatusModalOpen, setIsSetReviewStatusModalOpen,
        reviewModalPrimaryCode, setReviewModalPrimaryCode,
        reviewModalComment, setReviewModalComment,
        reviewModalCommentError, setReviewModalCommentError,
        isReviewMedHistoryOpen, setIsReviewMedHistoryOpen,
        reviewHistoryMedication, setReviewHistoryMedication,
        disposalMedRows, setDisposalMedRows,
        disposalPrnRows, setDisposalPrnRows,
        disposalOtcRows, setDisposalOtcRows,
        disposalLogEntries, setDisposalLogEntries,
        disposalInnerTab, setDisposalInnerTab,
        isMassDisposalModalOpen, setIsMassDisposalModalOpen,
        massDisposalModalRows, setMassDisposalModalRows,
        massDisposalDate, setMassDisposalDate,
        massDisposalCancelConfirmOpen, setMassDisposalCancelConfirmOpen,
        handleCreatePack,
        youthDisplayName,
    } = props;

    const [isPackMedLogOpen, setIsPackMedLogOpen] = useState(false);

    return (
        <>
            {/* ── Create / Edit Dialog ── */}
            <Dialog open={isCreatePackDialogOpen} onOpenChange={(open) => { setIsCreatePackDialogOpen(open); if (!open) { setCreatePackActiveTab("doses"); setDateRangeApplied(false); setNewPackForm({ startDate: "", startTime: "", endDate: "", endTime: "", expectedHandoffDate: "" }); setAppliedDateRange({ startDate: "", startTime: "", endDate: "", endTime: "" }); setPrnMedications([]); setOtcMedications([]); setSetPrimaryShowLog(false); setPackingPrepInnerTab("checklist"); setSelectedPackId(null); } }}>
                <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col" style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', padding: 0 }}>
                    <DialogHeader className="px-6 pt-6 pb-4">
                        <DialogTitle className="text-[15px] font-semibold text-[#080707] flex items-center gap-2"><Package className="h-5 w-5" style={{ color: '#145F33' }} />{selectedPackId ? "Edit Medication Pack" : "Pack Medication"}</DialogTitle>
                        <DialogDescription className="text-[13px] mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>{props.contextLabel ? `${props.contextLabel}. ` : ""}{selectedPackId ? "Update the details for this medication pack." : "Complete each step to create and finalize a medication pack."}</DialogDescription>
                    </DialogHeader>

                    {/* Tab Navigation */}
                    <div className="border-b" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                        <div className="flex items-stretch w-full">
                            {([{ key: "doses", label: "Doses" }, { key: "setPrimary", label: "Set Primary" }, { key: "packingPrep", label: "Packing Prep" }, { key: "dispense", label: "Dispense" }, { key: "count", label: "Count" }, { key: "handOff", label: "Hand Off" }, { key: "review", label: "Review" }, { key: "disposal", label: "Disposal" }] as const).map((tab, idx) => {
                                const isTabActive = createPackActiveTab === tab.key;
                                const isCompleted = tabOrder[tab.key] < tabOrder[createPackActiveTab];
                                return (
                                    <button key={tab.key} role="tab" aria-selected={isTabActive}
                                        onClick={() => { if (createPackActiveTab === "count" && countRows.some(r => r.currentCount !== "" || r.comments !== "")) { if (!window.confirm("You have unsaved changes on the Count tab. Leave without saving?")) return; setCountRows(prev => prev.map(r => ({ ...r, currentCount: "", comments: "", selected: false }))); } setCreatePackActiveTab(tab.key); }}
                                        className="flex-1 relative flex flex-col items-center justify-center gap-1 py-3 px-1 font-medium transition-colors focus:outline-none"
                                        style={{ color: isTabActive ? '#145F33' : isCompleted ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)', backgroundColor: isTabActive ? '#f0faf4' : 'transparent' }}
                                        onMouseEnter={e => { if (!isTabActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--slds-g-color-background-alt)'; }}
                                        onMouseLeave={e => { if (!isTabActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}>
                                        <span className="absolute bottom-0 left-0 right-0" style={{ height: '3px', backgroundColor: '#145F33', opacity: isTabActive ? 1 : 0 }} />
                                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full slds-text-3 font-semibold flex-shrink-0" style={{ backgroundColor: isTabActive ? '#145F33' : isCompleted ? '#e6f2eb' : 'var(--slds-g-color-background-alt)', color: isTabActive ? '#ffffff' : isCompleted ? '#145F33' : 'var(--slds-g-color-text-weak)', border: isCompleted && !isTabActive ? '1px solid #145F33' : 'none' }}>{isCompleted ? <Check className="h-3 w-3" /> : idx + 1}</span>
                                        <span className="text-center leading-tight whitespace-nowrap" style={{ fontSize: '11px' }}>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tab Body */}
                    <div className="flex-1 overflow-y-auto">

                        {/* DOSES TAB */}
                        {createPackActiveTab === "doses" && (() => {
                            const today60 = new Date(); today60.setDate(today60.getDate() + 60);
                            const parseMMDDYYYY = (s: string) => { const [m, d, y] = s.split("/"); return m && d && y ? new Date(+y, +m - 1, +d) : null; };
                            const formatMMDDYYYY = (s: string) => { const c = s.replace(/\D/g, ""); if (c.length <= 2) return c; if (c.length <= 4) return `${c.slice(0,2)}/${c.slice(2)}`; return `${c.slice(0,2)}/${c.slice(2,4)}/${c.slice(4,8)}`; };
                            const formatHHMM = (s: string) => { const d = s.replace(/\D/g, ""); if (!d) return s; if (d.length <= 2) { const h = parseInt(d, 10); if (h >= 1 && h <= 12) return `${h}:00 ${h >= 8 ? "AM" : "PM"}`; } if (d.length >= 3) { const h = parseInt(d.slice(0, d.length - 2), 10); const m = parseInt(d.slice(-2), 10); if (h >= 1 && h <= 12 && m >= 0 && m <= 59) return `${h}:${String(m).padStart(2,"0")} ${h >= 8 && h !== 12 ? "AM" : "PM"}`; } return s; };
                            const exceedsLimit = (ds: string) => { const dt = parseMMDDYYYY(ds); return dt ? dt > today60 : false; };
                            const hasInProcessMeds = dateRangeApplied && (prnMedications.length > 0 || otcMedications.length > 0);
                            const handleDateChange = (field: keyof typeof newPackForm, rawValue: string) => {
                                const value = ["startDate","endDate","expectedHandoffDate"].includes(field) ? formatMMDDYYYY(rawValue) : rawValue;
                                if (hasInProcessMeds && ["startDate","startTime","endDate","endTime"].includes(field)) { setPendingDateChange({ [field]: value }); setIsDateChangeWarningOpen(true); }
                                else { setNewPackForm(f => ({ ...f, [field]: value })); if (["startDate","startTime","endDate","endTime"].includes(field)) setDateRangeApplied(false); }
                            };
                            return (
                                <div className="px-6 py-6 space-y-5">
                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Packing Period</span>
                                            {dateRangeApplied && (<span className="flex items-center gap-1.5 slds-text-3 px-2.5 py-1 rounded-full" style={{ backgroundColor: '#e6f2eb', color: '#145F33', border: '1px solid #a3d4b5' }}><Check className="h-3 w-3" />Date range applied</span>)}
                                        </div>
                                        <div className="p-5" style={{ backgroundColor: 'var(--slds-g-color-background-base)' }}>
                                            <div className="grid grid-cols-3 gap-4 mb-4" style={{ overflow: 'visible' }}>
                                                <div className="space-y-1.5"><label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>START DATE <span className="text-red-600">*</span></label><DateInput value={newPackForm.startDate} onChange={v => handleDateChange("startDate", v)} className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }} />{newPackForm.startDate && exceedsLimit(newPackForm.startDate) && (<p className="flex items-center gap-1 slds-text-3" style={{ color: '#b57a00' }}><AlertTriangle className="h-3 w-3" />Date exceeds 60-day limit</p>)}</div>
                                                <div className="space-y-1.5"><label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>START TIME <span className="text-red-600">*</span></label><input type="text" placeholder="HH:MM AM/PM" value={newPackForm.startTime} onChange={e => setNewPackForm(f => ({ ...f, startTime: e.target.value }))} onBlur={e => setNewPackForm(f => ({ ...f, startTime: formatHHMM(e.target.value) }))} className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }} /></div>
                                                <div className="space-y-1.5"><label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>EXPECTED HANDOFF DATE <span className="text-red-600">*</span></label><DateInput value={newPackForm.expectedHandoffDate} onChange={v => setNewPackForm(f => ({ ...f, expectedHandoffDate: v }))} className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }} /></div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4" style={{ overflow: 'visible' }}>
                                                <div className="space-y-1.5"><label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>END DATE <span className="text-red-600">*</span></label><DateInput value={newPackForm.endDate} onChange={v => handleDateChange("endDate", v)} className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }} />{newPackForm.endDate && exceedsLimit(newPackForm.endDate) && (<p className="flex items-center gap-1 slds-text-3" style={{ color: '#b57a00' }}><AlertTriangle className="h-3 w-3" />Date exceeds 60-day limit</p>)}</div>
                                                <div className="space-y-1.5"><label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>END TIME <span className="text-red-600">*</span></label><input type="text" placeholder="HH:MM AM/PM" value={newPackForm.endTime} onChange={e => setNewPackForm(f => ({ ...f, endTime: e.target.value }))} onBlur={e => setNewPackForm(f => ({ ...f, endTime: formatHHMM(e.target.value) }))} className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }} /></div>
                                                <div className="flex items-end"><button onClick={() => { if (!newPackForm.startDate || !newPackForm.startTime || !newPackForm.endDate || !newPackForm.endTime) { toast.error("All date and time fields are required before applying."); return; } setAppliedDateRange({ startDate: newPackForm.startDate, startTime: newPackForm.startTime, endDate: newPackForm.endDate, endTime: newPackForm.endTime }); setDateRangeApplied(true); setPrnMedications(defaultPrnMedications); setOtcMedications(defaultOtcMedications); toast.success("Date range applied. PRN and OTC sections populated."); }} className="h-9 px-5 rounded-full slds-text-4 font-medium btn--outline-primary">Apply Changes</button></div>
                                            </div>
                                        </div>
                                    </div>
                                    {!dateRangeApplied && (<div className="flex items-center gap-2.5 rounded px-4 py-3 slds-text-4" style={{ backgroundColor: '#fef9ec', border: '1px solid #f4c97f', color: '#78520a' }}><AlertCircle className="h-4 w-4 flex-shrink-0" />The date range must be applied prior to adding PRNs and OTCs.</div>)}
                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>PRN</span>
                                            {dateRangeApplied && (<button onClick={() => setIsModifyAllPrnDialogOpen(true)} className="h-8 px-3 rounded-full slds-text-3 font-medium" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}>Modify All</button>)}
                                        </div>
                                        {!dateRangeApplied ? (<div className="px-4 py-8 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>Apply a date range above to populate PRN medications.</div>) : (
                                            <><div className="flex items-start gap-2 px-4 py-2.5 slds-text-3" style={{ backgroundColor: '#f0f7ff', borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: '#0176d3' }}><AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />Reminder: Account for all PRNs (e.g., inhalers) even if not all are being packed. Leave doses as 0 for any PRN not included.</div>
                                            <table className="w-full"><thead><tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}><th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th><th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-default)' }}>Doses</th><th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Actions</th></tr></thead>
                                            <tbody>{prnMedications.map((prn, idx) => (<tr key={idx} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}><td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{prn.medication}</td><td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{prn.doses}</td><td className="px-4 py-2.5"><button onClick={() => { setSelectedPrnIndex(idx); setIsModifyPrnDialogOpen(true); }} className="slds-text-3 font-medium underline" style={{ color: '#0176d3' }}>Modify</button></td></tr>))}</tbody></table></>
                                        )}
                                    </div>
                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}><span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>OTC</span></div>
                                        {!dateRangeApplied ? (<div className="px-4 py-8 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>Apply a date range above to populate OTC medications.</div>) : (
                                            <table className="w-full"><thead><tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}><th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th><th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-default)' }}>Status</th><th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-36" style={{ color: 'var(--slds-g-color-text-default)' }}>Dose</th><th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Quantity</th><th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-default)' }}>Doses</th></tr></thead>
                                            <tbody>{otcMedications.map((otc, idx) => { const notApproved = otc.status === "Not Approved"; return (<tr key={idx} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', opacity: notApproved ? 0.5 : 1 }}><td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{otc.medication}</td><td className="px-4 py-2.5"><span className="inline-flex items-center px-2 py-0.5 rounded-full slds-text-3 font-medium" style={{ backgroundColor: notApproved ? '#fef2f2' : '#e6f2eb', color: notApproved ? '#c23934' : '#145F33', border: `1px solid ${notApproved ? '#f5c6c6' : '#a3d4b5'}` }}>{otc.status}</span></td><td className="px-4 py-2.5"><select disabled={notApproved} value={otc.dose} onChange={e => setOtcMedications(prev => prev.map((o, i) => i === idx ? { ...o, dose: e.target.value } : o))} className="h-8 w-full px-2 rounded slds-text-3 disabled:cursor-not-allowed" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}><option value="">Select</option>{otc.availableDoses.map(d => <option key={d} value={d}>{d}</option>)}</select></td><td className="px-4 py-2.5"><input type="text" disabled={notApproved} placeholder="Qty" value={otc.quantity} onChange={e => setOtcMedications(prev => prev.map((o, i) => i === idx ? { ...o, quantity: e.target.value } : o))} className="h-8 w-full px-2 rounded slds-text-3 disabled:cursor-not-allowed" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }} /></td><td className="px-4 py-2.5"><input type="text" disabled={notApproved} placeholder="#" value={otc.doses} onChange={e => setOtcMedications(prev => prev.map((o, i) => i === idx ? { ...o, doses: e.target.value } : o))} className="h-8 w-full px-2 rounded slds-text-3 disabled:cursor-not-allowed" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }} /></td></tr>); })}</tbody></table>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* SET PRIMARY TAB */}
                        {createPackActiveTab === "setPrimary" && (() => {
                            const anySelected = [...setPrimaryMedRows, ...setPrimaryPrnRows, ...setPrimaryOtcRowsData].some(r => r.selected);
                            const packStatusOrder: Record<PackStatus, number> = { Available: 0, Selected: 1, Dispensed: 2, Received: 3, Reviewed: 4 };
                            const sortByStatusName = <T extends { packStatus: PackStatus; drugName: string }>(rows: T[]): T[] => [...rows].sort((a, b) => (packStatusOrder[a.packStatus] - packStatusOrder[b.packStatus]) || a.drugName.localeCompare(b.drugName));
                            const medGroups: Record<string, SetPrimaryMedRow[]> = {};
                            setPrimaryMedRows.forEach(r => { const g = r.dateGroup || r.start; if (!medGroups[g]) medGroups[g] = []; medGroups[g].push(r); });
                            Object.keys(medGroups).forEach(g => { medGroups[g] = sortByStatusName(medGroups[g]); });
                            const sortedPrnRows = sortByStatusName(setPrimaryPrnRows);
                            const sortedOtcRows = sortByStatusName(setPrimaryOtcRowsData);
                            const spBadge = (ps: PackStatus) => {
                                const m: Record<PackStatus, { bg: string; color: string; border: string }> = {
                                    Available: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
                                    Selected: { bg: '#f0faf4', color: '#145F33', border: '#a3d4b5' },
                                    Dispensed: { bg: '#fef2f2', color: '#c23934', border: '#f5c6c6' },
                                    Received: { bg: '#fef9ec', color: '#92400e', border: '#fde68a' },
                                    Reviewed: { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' },
                                };
                                const s = m[ps];
                                return <span className="inline-flex items-center px-2 py-0.5 rounded-full slds-text-3 font-medium whitespace-nowrap" style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{ps}</span>;
                            };
                            return (
                                <div className="px-6 py-5 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => { if (anySelected) setIsSetPrimaryModalOpen(true); else toast.error("Select at least one medication row first."); }} className="h-9 px-4 rounded-full slds-text-4 font-medium text-white" style={{ backgroundColor: anySelected ? '#145F33' : 'var(--slds-g-color-neutral-95)', color: anySelected ? '#fff' : 'var(--slds-g-color-text-weak)', cursor: anySelected ? 'pointer' : 'default' }}>Set Primary Medication Code</button>
                                            <button onClick={() => setIsPackMedLogOpen(true)} className="h-9 px-4 rounded-full slds-text-4 font-medium flex items-center gap-1.5" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}><FileText className="h-3.5 w-3.5" />Log</button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button className="slds-text-3 font-medium underline" style={{ color: '#145F33' }} onClick={() => { setSetPrimaryMedRows(prev => prev.map(r => ({ ...r, selected: r.packStatus === "Available" ? true : r.selected }))); setSetPrimaryPrnRows(prev => prev.map(r => ({ ...r, selected: r.packStatus === "Available" ? true : r.selected }))); setSetPrimaryOtcRowsData(prev => prev.map(r => ({ ...r, selected: r.packStatus === "Available" ? true : r.selected }))); }}>Select All Available</button>
                                            <button className="slds-text-3 font-medium underline" style={{ color: 'var(--slds-g-color-text-weak)' }} onClick={() => { setSetPrimaryMedRows(prev => prev.map(r => ({ ...r, selected: false }))); setSetPrimaryPrnRows(prev => prev.map(r => ({ ...r, selected: false }))); setSetPrimaryOtcRowsData(prev => prev.map(r => ({ ...r, selected: false }))); }}>Deselect All</button>
                                        </div>
                                    </div>
                                    {/* Medications */}
                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}><span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medications</span></div>
                                        <table className="w-full"><thead><tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}><th className="px-4 py-2.5 w-10" /><th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th><th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Start</th><th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Stop</th><th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Pack Status</th><th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Primary Code</th></tr></thead>
                                        <tbody>
                                            {Object.entries(medGroups).map(([dg, groupRows]) => (
                                                <React.Fragment key={dg}>
                                                    <tr><td colSpan={6} className="px-4 py-1.5 slds-text-3 font-semibold" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderTop: '1px solid var(--slds-g-color-border-base-1)', borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-weak)' }}>{dg}{groupRows[0]?.outOfRange && <span className="ml-2 slds-text-3 font-normal italic" style={{ color: '#D97706' }}>Out of range</span>}</td></tr>
                                                    {groupRows.map(row => {
                                                        const canSel = row.packStatus === "Available" || row.packStatus === "Selected";
                                                        return (<tr key={row.id} onClick={() => { if (canSel) setSetPrimaryMedRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: !r.selected } : r)); }} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: row.selected ? '#f0faf4' : 'var(--slds-g-color-background-base)', cursor: canSel ? 'pointer' : 'default', opacity: canSel ? 1 : 0.55 }}>
                                                            <td className="px-4 py-2.5"><input type="checkbox" checked={row.selected} disabled={!canSel} onChange={() => { if (canSel) setSetPrimaryMedRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: !r.selected } : r)); }} style={{ accentColor: '#145F33' }} /></td>
                                                            <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.drugName}</td>
                                                            <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.start}</td>
                                                            <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.stop}</td>
                                                            <td className="px-4 py-2.5">{spBadge(row.packStatus)}</td>
                                                            <td className="px-4 py-2.5 slds-text-4" style={{ color: row.primaryCode ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>{row.primaryCode || "—"}</td>
                                                        </tr>);
                                                    })}
                                                </React.Fragment>
                                            ))}
                                        </tbody></table>
                                    </div>
                                    {/* PRN */}
                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}><span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>PRN</span></div>
                                        <table className="w-full"><thead><tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}><th className="px-4 py-2.5 w-10" /><th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th><th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Start</th><th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Stop</th><th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Pack Status</th><th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Primary Code</th></tr></thead>
                                        <tbody>{sortedPrnRows.map(row => { const canSel = row.packStatus === "Available" || row.packStatus === "Selected"; return (<tr key={row.id} onClick={() => { if (canSel) setSetPrimaryPrnRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: !r.selected } : r)); }} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: row.selected ? '#f0faf4' : 'var(--slds-g-color-background-base)', cursor: canSel ? 'pointer' : 'default', opacity: canSel ? 1 : 0.55 }}><td className="px-4 py-2.5"><input type="checkbox" checked={row.selected} disabled={!canSel} onChange={() => { if (canSel) setSetPrimaryPrnRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: !r.selected } : r)); }} style={{ accentColor: '#145F33' }} /></td><td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.drugName}</td><td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.start}</td><td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.stop}</td><td className="px-4 py-2.5">{spBadge(row.packStatus)}</td><td className="px-4 py-2.5 slds-text-4" style={{ color: row.primaryCode ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>{row.primaryCode || "—"}</td></tr>); })}</tbody></table>
                                    </div>
                                    {/* OTC */}
                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}><span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>OTC</span></div>
                                        <table className="w-full"><thead><tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}><th className="px-4 py-2.5 w-10" /><th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th><th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-20" style={{ color: 'var(--slds-g-color-text-default)' }}>Dose</th><th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-20" style={{ color: 'var(--slds-g-color-text-default)' }}>Qty</th><th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Pack Status</th><th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Primary Code</th></tr></thead>
                                        <tbody>{sortedOtcRows.map(row => { const canSel = row.packStatus === "Available" || row.packStatus === "Selected"; return (<tr key={row.id} onClick={() => { if (canSel) setSetPrimaryOtcRowsData(prev => prev.map(r => r.id === row.id ? { ...r, selected: !r.selected } : r)); }} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: row.selected ? '#f0faf4' : 'var(--slds-g-color-background-base)', cursor: canSel ? 'pointer' : 'default', opacity: canSel ? 1 : 0.55 }}><td className="px-4 py-2.5"><input type="checkbox" checked={row.selected} disabled={!canSel} onChange={() => { if (canSel) setSetPrimaryOtcRowsData(prev => prev.map(r => r.id === row.id ? { ...r, selected: !r.selected } : r)); }} style={{ accentColor: '#145F33' }} /></td><td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.drugName}</td><td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.dose}</td><td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.quantity}</td><td className="px-4 py-2.5">{spBadge(row.packStatus)}</td><td className="px-4 py-2.5 slds-text-4" style={{ color: row.primaryCode ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>{row.primaryCode || "—"}</td></tr>); })}</tbody></table>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* PACKING PREP TAB */}
                        {createPackActiveTab === "packingPrep" && (() => {
                            // Only rows that had a Primary Code applied during Set Primary
                            const prepMedRows = setPrimaryMedRows.filter(r => r.primaryCode !== "");
                            const prepPrnRows = setPrimaryPrnRows.filter(r => r.primaryCode !== "");
                            const prepOtcRows = setPrimaryOtcRowsData.filter(r => r.primaryCode !== "");

                            // Sort: Pack Status priority (Selected → Dispensed → Received), then Medication name
                            const ppStatusOrder: Record<string, number> = { Selected: 0, Dispensed: 1, Received: 2 };
                            const sortRows = <T extends { packStatus: PackStatus; drugName: string }>(rows: T[]): T[] =>
                                [...rows].sort((a, b) => ((ppStatusOrder[a.packStatus] ?? 9) - (ppStatusOrder[b.packStatus] ?? 9)) || a.drugName.localeCompare(b.drugName));

                            // Group med rows by date then dose period
                            const medGroups: Record<string, SetPrimaryMedRow[]> = {};
                            prepMedRows.forEach(r => {
                                const g = r.dateGroup || r.start;
                                if (!medGroups[g]) medGroups[g] = [];
                                medGroups[g].push(r);
                            });
                            Object.keys(medGroups).forEach(g => { medGroups[g] = sortRows(medGroups[g]); });

                            const sortedPrnRows = sortRows(prepPrnRows);
                            const sortedOtcRows = sortRows(prepOtcRows);

                            const showLog = packingPrepInnerTab === "log";

                            // Pack Status badge (informational only on this tab)
                            const ppStatusBadge = (ps: PackStatus) => {
                                const map: Record<string, { bg: string; color: string; border: string }> = {
                                    Selected: { bg: '#f0faf4', color: '#145F33', border: '#a3d4b5' },
                                    Dispensed: { bg: '#fef2f2', color: '#c23934', border: '#f5c6c6' },
                                    Received: { bg: '#fef9ec', color: '#92400e', border: '#fde68a' },
                                };
                                const s = map[ps] || { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
                                return (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full slds-text-3 font-medium whitespace-nowrap"
                                        style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                                        {ps}
                                    </span>
                                );
                            };

                            // Labels: validate selection then open label style modal
                            const handleLabels = () => {
                                const selMed = prepMedRows.filter(r => packPrepMedSelected[r.id]);
                                const selPrn = prepPrnRows.filter(r => packPrepPrnSelected[r.id]);
                                const selOtc = prepOtcRows.filter(r => packPrepOtcSelected[r.id]);
                                const hasNonOtc = selMed.length > 0 || selPrn.length > 0;
                                const noneSelected = selMed.length === 0 && selPrn.length === 0 && selOtc.length === 0;
                                if (noneSelected) { toast.error("Select at least one row before printing labels."); return; }
                                if (!hasNonOtc) { toast.info("No labels will be printed. Standard OTC rows are excluded from label output."); return; }
                                setIsLabelStyleModalOpen(true);
                            };

                            // Label print generator
                            const generateLabelPrint = (style: "sheet" | "individual") => {
                                setIsLabelStyleModalOpen(false);
                                const selMed = prepMedRows.filter(r => packPrepMedSelected[r.id]);
                                const selPrn = prepPrnRows.filter(r => packPrepPrnSelected[r.id]);
                                const dosePeriodOrder: Record<string, number> = { Morning: 0, Afternoon: 1, Evening: 2, Bedtime: 3 };
                                const dosePeriodTimes: Record<string, { start: string; end: string }> = {
                                    Morning:   { start: '06:00 AM', end: '11:00 AM' },
                                    Afternoon: { start: '11:00 AM', end: '05:00 PM' },
                                    Evening:   { start: '05:00 PM', end: '09:00 PM' },
                                    Bedtime:   { start: '09:00 PM', end: '11:59 PM' },
                                };
                                const formatAbbrevDate = (mmddyyyy: string): string => {
                                    const [m, d, y] = mmddyyyy.split('/').map(Number);
                                    if (!m || !d || !y) return mmddyyyy;
                                    const date = new Date(y, m - 1, d);
                                    const dayAbbr = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][date.getDay()];
                                    return `${dayAbbr} - ${m}/${d}`;
                                };
                                interface LabelGroup { dateStr: string; period: string; meds: typeof selMed; }
                                const labelGroups: LabelGroup[] = [];
                                const byDatePeriod: Record<string, Record<string, typeof selMed>> = {};
                                selMed.forEach(r => {
                                    const dg = r.dateGroup || r.start;
                                    const dp = r.dosePeriod || 'Morning';
                                    if (!byDatePeriod[dg]) byDatePeriod[dg] = {};
                                    if (!byDatePeriod[dg][dp]) byDatePeriod[dg][dp] = [];
                                    byDatePeriod[dg][dp].push(r);
                                });
                                Object.keys(byDatePeriod).sort().forEach(dateStr => {
                                    Object.keys(byDatePeriod[dateStr])
                                        .sort((a, b) => (dosePeriodOrder[a] ?? 9) - (dosePeriodOrder[b] ?? 9))
                                        .forEach(period => { labelGroups.push({ dateStr, period, meds: byDatePeriod[dateStr][period] }); });
                                });
                                const isSheet = style === "sheet";
                                const medFontSize = (lineCount: number): string => {
                                    if (isSheet) { if (lineCount <= 3) return '7pt'; if (lineCount <= 5) return '6pt'; return '5pt'; }
                                    if (lineCount <= 3) return '8.5pt'; if (lineCount <= 5) return '7pt'; return '6pt';
                                };
                                const buildDailyLabelHtml = (youthName: string, period: string, dateAbbr: string, timeRange: string, medLines: string, lineCount: number): string => {
                                    const lw = isSheet ? '4in' : '2.4in'; const lh = isSheet ? '2in' : '3.9in';
                                    const pad = isSheet ? '6pt 8pt' : '10pt 12pt'; const extra = isSheet ? '' : 'page-break-after:always;';
                                    return `<div style="width:${lw};height:${lh};display:${isSheet ? 'inline-block' : 'block'};vertical-align:top;padding:${pad};box-sizing:border-box;border:0.5pt solid #dddbda;font-family:Arial,sans-serif;${extra}"><div style="font-size:${isSheet ? '7.5' : '9'}pt;font-weight:bold;color:#3e3e3c;border-bottom:0.5pt solid #145F33;padding-bottom:2pt;margin-bottom:3pt">${youthName}</div><div style="font-size:${isSheet ? '7' : '8.5'}pt;color:#706e6b;margin-bottom:1pt"><strong style="color:#145F33">${period}</strong> &nbsp;|&nbsp; ${dateAbbr}</div><div style="font-size:${isSheet ? '6.5' : '8'}pt;color:#706e6b;margin-bottom:3pt">${timeRange}</div><div style="font-size:${medFontSize(lineCount)};color:#3e3e3c;line-height:1.35">${medLines}</div></div>`;
                                };
                                const buildPrnLabelHtml = (youthName: string, medLine: string): string => {
                                    const lw = isSheet ? '4in' : '2.4in'; const lh = isSheet ? '2in' : '3.9in';
                                    const pad = isSheet ? '6pt 8pt' : '10pt 12pt'; const extra = isSheet ? '' : 'page-break-after:always;';
                                    return `<div style="width:${lw};height:${lh};display:${isSheet ? 'inline-block' : 'block'};vertical-align:top;padding:${pad};box-sizing:border-box;border:0.5pt solid #dddbda;font-family:Arial,sans-serif;${extra}"><div style="font-size:${isSheet ? '7.5' : '9'}pt;font-weight:bold;color:#3e3e3c;border-bottom:0.5pt solid #145F33;padding-bottom:2pt;margin-bottom:3pt">${youthName}</div><div style="font-size:${isSheet ? '7' : '8.5'}pt;color:#706e6b;margin-bottom:3pt"><strong style="color:#145F33">PRN</strong> &nbsp;|&nbsp; ALL DAY</div><div style="font-size:${isSheet ? '7' : '8.5'}pt;color:#3e3e3c;line-height:1.35">${medLine}</div></div>`;
                                };
                                const youthName = youthDisplayName || '';
                                let labelsHtml = '';
                                labelGroups.forEach(({ dateStr, period, meds }) => {
                                    const t = dosePeriodTimes[period] || { start: '—', end: '—' };
                                    labelsHtml += buildDailyLabelHtml(youthName, period, formatAbbrevDate(dateStr), `${t.start} – ${t.end}`, meds.map(m => `• ${m.drugName}`).join('<br>'), meds.length);
                                });
                                [...selPrn].sort((a, b) => a.drugName.localeCompare(b.drugName)).forEach(r => { labelsHtml += buildPrnLabelHtml(youthName, `• ${r.drugName}`); });
                                const pageStyle = isSheet
                                    ? `@page{size:letter portrait;margin:0.5in 0.19in}body{margin:0;padding:0}.page{width:100%;display:flex;flex-wrap:wrap;justify-content:space-between}`
                                    : `@page{size:2.4in 3.9in portrait;margin:0}body{margin:0;padding:0}`;
                                const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Medication Labels${isSheet ? ' — Sheet (Avery 5162)' : ' — Individual'}</title><style>*{box-sizing:border-box;margin:0;padding:0}${pageStyle}</style></head><body><div class="${isSheet ? 'page' : ''}">${labelsHtml}</div></body></html>`;
                                const win = window.open('', '_blank', `width=${isSheet ? 900 : 500},height=${isSheet ? 1100 : 700},scrollbars=yes`);
                                if (win) { win.document.write(html); win.document.close(); setTimeout(() => { win.focus(); win.print(); }, 350); }
                                else { toast.error("Pop-up blocked. Please allow pop-ups for this site and try again."); }
                            };

                            // Checklist: generate print-ready document for all pack contents
                            const handleChecklist = () => {
                                if (prepMedRows.length === 0 && prepPrnRows.length === 0 && prepOtcRows.length === 0) {
                                    toast.error("No medications in this pack to generate a checklist."); return;
                                }
                                const now = new Date();
                                const pad = (n: number) => String(n).padStart(2, '0');
                                const h12 = now.getHours() % 12 || 12;
                                const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
                                const runDate = `${pad(now.getMonth()+1)}/${pad(now.getDate())}/${now.getFullYear()} ${h12}:${pad(now.getMinutes())} ${ampm}`;
                                const dosePeriodOrder: Record<string, number> = { Morning: 0, Afternoon: 1, Evening: 2, Bedtime: 3 };
                                const dosePeriodTimes: Record<string, { start: string; end: string }> = {
                                    Morning:   { start: '08:00 AM', end: '09:00 AM' },
                                    Afternoon: { start: '12:00 PM', end: '01:00 PM' },
                                    Evening:   { start: '06:00 PM', end: '07:00 PM' },
                                    Bedtime:   { start: '09:00 PM', end: '10:00 PM' },
                                };
                                const formatFullDate = (mmddyyyy: string) => {
                                    const [m, d, y] = mmddyyyy.split('/').map(Number);
                                    if (!m || !d || !y) return mmddyyyy;
                                    return formatMdy(new Date(y, m - 1, d));
                                };
                                const medByDate: Record<string, Record<string, typeof prepMedRows>> = {};
                                prepMedRows.forEach(r => {
                                    const dg = r.dateGroup || r.start; const dp = r.dosePeriod || 'Morning';
                                    if (!medByDate[dg]) medByDate[dg] = {};
                                    if (!medByDate[dg][dp]) medByDate[dg][dp] = [];
                                    medByDate[dg][dp].push(r);
                                });
                                let dailyHTML = '';
                                Object.keys(medByDate).sort().forEach(dateStr => {
                                    dailyHTML += `<tr class="date-hdr"><td colspan="5">${formatFullDate(dateStr)}</td></tr>`;
                                    Object.keys(medByDate[dateStr]).sort((a, b) => (dosePeriodOrder[a] ?? 9) - (dosePeriodOrder[b] ?? 9)).forEach(period => {
                                        dailyHTML += `<tr class="period-hdr"><td colspan="5">${period}</td></tr>`;
                                        [...medByDate[dateStr][period]].sort((a, b) => a.drugName.localeCompare(b.drugName)).forEach(r => {
                                            const t = dosePeriodTimes[period] || { start: '—', end: '—' };
                                            dailyHTML += `<tr class="day-row"><td class="med-name"><em>${r.drugName}</em></td><td>—</td><td>${t.start}</td><td>${t.end}</td><td class="chk"><span class="cb"></span></td></tr>`;
                                        });
                                    });
                                });
                                const sd = appliedDateRange.startDate; const ed = appliedDateRange.endDate;
                                const packDays = (() => {
                                    if (!sd || !ed) return 1;
                                    const [sm,sdd,sy] = sd.split('/').map(Number); const [em,ed2,ey] = ed.split('/').map(Number);
                                    return Math.max(1, Math.floor((new Date(ey,em-1,ed2).getTime() - new Date(sy,sm-1,sdd).getTime()) / 86400000) + 1);
                                })();
                                let prnHTML = '';
                                const prnByName: Record<string, typeof prepPrnRows> = {};
                                [...prepPrnRows].sort((a,b) => a.drugName.localeCompare(b.drugName)).forEach(r => { if (!prnByName[r.drugName]) prnByName[r.drugName] = []; prnByName[r.drugName].push(r); });
                                Object.keys(prnByName).sort().forEach(name => {
                                    prnHTML += `<tr class="period-hdr"><td colspan="4">${name}</td></tr>`;
                                    prnByName[name].forEach(() => { for (let day = 0; day < packDays; day++) { prnHTML += `<tr><td>—</td><td>12:00 AM</td><td>11:59 PM</td><td class="chk"><span class="cb"></span></td></tr>`; } });
                                });
                                let otcHTML = '';
                                const otcByName: Record<string, typeof prepOtcRows> = {};
                                [...prepOtcRows].sort((a,b) => a.drugName.localeCompare(b.drugName)).forEach(r => { if (!otcByName[r.drugName]) otcByName[r.drugName] = []; otcByName[r.drugName].push(r); });
                                Object.keys(otcByName).sort().forEach(name => {
                                    otcHTML += `<tr class="period-hdr"><td colspan="4">${name}</td></tr>`;
                                    otcByName[name].forEach(r => { for (let day = 0; day < packDays; day++) { otcHTML += `<tr><td>${r.dose}</td><td>—</td><td>—</td><td class="chk"><span class="cb"></span></td></tr>`; } });
                                });
                                const startLabel = [appliedDateRange.startDate, appliedDateRange.startTime].filter(Boolean).join(' ') || '—';
                                const endLabel   = [appliedDateRange.endDate,   appliedDateRange.endTime  ].filter(Boolean).join(' ') || '—';
                                const youthName = youthDisplayName || '';
                                const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Pack Medication Checklist</title><style>@page{size:letter portrait;margin:0.5in 0.5in 0.68in 0.5in}@page{@bottom-left{content:"Run Date: ${runDate}";font-family:Arial,sans-serif;font-size:8pt;color:#706e6b}}@page{@bottom-right{content:"Page " counter(page) " of " counter(pages);font-family:Arial,sans-serif;font-size:8pt;color:#706e6b}}*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:10pt;color:#3e3e3c}.header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:8pt;margin-bottom:12pt;border-bottom:2pt solid #145F33}.logo-name{font-size:16pt;font-weight:bold;color:#145F33;line-height:1}.logo-sub{font-size:8pt;color:#706e6b;margin-top:2pt}.hdr-right{text-align:right}.doc-title{font-size:13pt;font-weight:bold;color:#3e3e3c;margin-bottom:5pt}.hdr-meta{font-size:9pt;color:#3e3e3c;line-height:1.7}.hdr-meta strong{font-weight:600}.youth{font-size:12pt;font-weight:bold;color:#145F33;margin-top:6pt}table{width:100%;border-collapse:collapse;font-size:9pt;margin-bottom:14pt;page-break-inside:auto}thead{display:table-header-group}th{background:#f4f6f9;color:#706e6b;font-size:7.5pt;font-weight:600;text-transform:uppercase;letter-spacing:.04em;padding:5pt 7pt;border-bottom:1.5pt solid #dddbda;text-align:left;white-space:nowrap}td{padding:4pt 7pt;border-bottom:.5pt solid #e5e5e5;color:#3e3e3c;vertical-align:middle}tr.section-hdr td{background:#145F33;color:#fff;font-weight:bold;font-size:9.5pt;padding:5pt 7pt}tr.date-hdr td{background:#e6f2eb;color:#0e4524;font-weight:bold;font-size:9pt;padding:4pt 7pt;border-top:1pt solid #a3d4b5;border-bottom:1pt solid #a3d4b5}tr.period-hdr td{background:#e5e5e5;color:#3e3e3c;font-weight:600;font-size:8.5pt;padding:3pt 7pt 3pt 12pt;border-bottom:.5pt solid #d0d0d0}tr.day-row td{background:#fff;color:#3e3e3c}.med-name em{font-style:italic}.chk{width:44pt;text-align:center}.cb{display:inline-block;width:10pt;height:10pt;border:1pt solid #3e3e3c}</style></head><body><div class="header"><div><div class="logo-name">Mercy Home</div><div class="logo-sub">for Boys &amp; Girls</div><div class="youth">${youthName}</div></div><div class="hdr-right"><div class="doc-title">Pack Medication Checklist</div><div class="hdr-meta"><strong>Start Date:</strong> ${startLabel}<br><strong>End Date:</strong> ${endLabel}</div></div></div><table><thead><tr class="section-hdr"><td colspan="5">Daily Medications</td></tr><tr><th>Medication Name</th><th>Dose</th><th>Start Time</th><th>End Time</th><th class="chk">Complete</th></tr></thead><tbody>${dailyHTML || '<tr><td colspan="5" style="text-align:center;color:#706e6b;padding:12pt 7pt">No daily medications in this pack.</td></tr>'}</tbody></table>${prnHTML ? `<table><thead><tr class="section-hdr"><td colspan="4">PRN Medications</td></tr><tr><th>Dose</th><th>Start Time</th><th>End Time</th><th class="chk">Complete</th></tr></thead><tbody>${prnHTML}</tbody></table>` : ''}${otcHTML ? `<table><thead><tr class="section-hdr"><td colspan="4">OTC Medications</td></tr><tr><th>Dose</th><th>Start Time</th><th>End Time</th><th class="chk">Complete</th></tr></thead><tbody>${otcHTML}</tbody></table>` : ''}</body></html>`;
                                const win = window.open('', '_blank', 'width=900,height=1100,scrollbars=yes');
                                if (win) { win.document.write(html); win.document.close(); setTimeout(() => { win.focus(); win.print(); }, 350); }
                                else { toast.error("Pop-up blocked. Please allow pop-ups for this site and try again."); }
                            };

                            return (
                                <React.Fragment>
                                <div className="px-6 py-5 space-y-5">

                                    {/* ── Toolbar ── */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleChecklist}
                                                className="h-9 px-4 rounded-full slds-text-4 font-medium text-white transition-colors flex items-center gap-1.5"
                                                style={{ backgroundColor: '#145F33' }}
                                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0e4524')}
                                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#145F33')}
                                            >
                                                <ClipboardList className="h-3.5 w-3.5" />
                                                Checklist
                                            </button>
                                            <button
                                                onClick={handleLabels}
                                                className="h-9 px-4 rounded-full slds-text-4 font-medium transition-colors flex items-center gap-1.5"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--slds-g-color-background-alt)'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--slds-g-color-background-base)'; }}
                                            >
                                                <Tag className="h-3.5 w-3.5" />
                                                Labels
                                            </button>
                                            <button
                                                onClick={() => setIsPackMedLogOpen(true)}
                                                className="h-9 px-4 rounded-full slds-text-4 font-medium transition-colors flex items-center gap-1.5"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                            >
                                                <FileText className="h-3.5 w-3.5" />
                                                Log
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                className="slds-text-3 font-medium underline"
                                                style={{ color: '#145F33' }}
                                                onClick={() => {
                                                    setPackPrepMedSelected(Object.fromEntries(prepMedRows.map(r => [r.id, r.packStatus === "Selected"])));
                                                    setPackPrepPrnSelected(Object.fromEntries(prepPrnRows.map(r => [r.id, r.packStatus === "Selected"])));
                                                    setPackPrepOtcSelected(Object.fromEntries(prepOtcRows.map(r => [r.id, r.packStatus === "Selected"])));
                                                }}
                                            >
                                                Select All Selected
                                            </button>
                                            <button
                                                className="slds-text-3 font-medium underline"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                onClick={() => {
                                                    setPackPrepMedSelected(Object.fromEntries(prepMedRows.map(r => [r.id, false])));
                                                    setPackPrepPrnSelected(Object.fromEntries(prepPrnRows.map(r => [r.id, false])));
                                                    setPackPrepOtcSelected(Object.fromEntries(prepOtcRows.map(r => [r.id, false])));
                                                }}
                                            >
                                                Deselect All
                                            </button>
                                        </div>
                                    </div>

                                    {/* ── Medications to Prepare Grid ── */}
                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medications to Prepare</span>
                                        </div>
                                        <table className="w-full">
                                            <thead>
                                                <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <th className="px-4 py-2.5 w-10" />
                                                    <th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th>
                                                    <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Start</th>
                                                    <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Stop</th>
                                                    <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {prepMedRows.length === 0 ? (
                                                    <tr><td colSpan={5} className="px-4 py-8 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No medications with a Primary Code applied. Complete the Set Primary step first.</td></tr>
                                                ) : (
                                                    Object.entries(medGroups).sort(([a], [b]) => a.localeCompare(b)).map(([dateGroup, rows]) => (
                                                        <React.Fragment key={`pp-dg-${dateGroup}`}>
                                                            <tr style={{ backgroundColor: '#eef2f7', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                <td colSpan={5} className="px-4 py-1.5 slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>{dateGroup}</td>
                                                            </tr>
                                                            {["Morning", "Afternoon", "Evening", "Bedtime", ""].map(period => {
                                                                const periodRows = rows.filter(r => (r.dosePeriod || "") === period);
                                                                if (periodRows.length === 0) return null;
                                                                return (
                                                                    <React.Fragment key={`pp-dp-${dateGroup}-${period || "other"}`}>
                                                                        {period && (
                                                                            <tr style={{ backgroundColor: '#f8f9fb', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                                <td colSpan={5} className="px-6 py-1 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)', fontStyle: 'italic' }}>{period}</td>
                                                                            </tr>
                                                                        )}
                                                                        {periodRows.map(row => (
                                                                            <tr key={row.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: packPrepMedSelected[row.id] ? '#f0faf4' : 'white' }}>
                                                                                <td className="px-4 py-2 text-center">
                                                                                    <input type="checkbox" checked={!!packPrepMedSelected[row.id]}
                                                                                        onChange={() => setPackPrepMedSelected(prev => ({ ...prev, [row.id]: !prev[row.id] }))}
                                                                                        style={{ accentColor: '#145F33', cursor: 'pointer' }} />
                                                                                </td>
                                                                                <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.drugName}</td>
                                                                                <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.start}</td>
                                                                                <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.stop}</td>
                                                                                <td className="px-4 py-2">{ppStatusBadge(row.packStatus)}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </React.Fragment>
                                                                );
                                                            })}
                                                        </React.Fragment>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* ── PRN Section ── */}
                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>PRN</span>
                                        </div>
                                        <table className="w-full">
                                            <thead>
                                                <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <th className="px-4 py-2.5 w-10" />
                                                    <th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th>
                                                    <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Start</th>
                                                    <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Stop</th>
                                                    <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedPrnRows.length === 0 ? (
                                                    <tr><td colSpan={5} className="px-4 py-8 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No PRN medications with a Primary Code applied.</td></tr>
                                                ) : (
                                                    sortedPrnRows.map(row => (
                                                        <tr key={row.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: packPrepPrnSelected[row.id] ? '#f0faf4' : 'white' }}>
                                                            <td className="px-4 py-2 text-center">
                                                                <input type="checkbox" checked={!!packPrepPrnSelected[row.id]}
                                                                    onChange={() => setPackPrepPrnSelected(prev => ({ ...prev, [row.id]: !prev[row.id] }))}
                                                                    style={{ accentColor: '#145F33', cursor: 'pointer' }} />
                                                            </td>
                                                            <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.drugName}</td>
                                                            <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.start}</td>
                                                            <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.stop}</td>
                                                            <td className="px-4 py-2">{ppStatusBadge(row.packStatus)}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* ── OTC Section ── */}
                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>OTC</span>
                                            <span className="inline-flex items-center gap-1 slds-text-3 px-2 py-0.5 rounded" style={{ backgroundColor: '#fef9ec', color: '#78520a', border: '1px solid #fde68a' }}>
                                                <AlertTriangle className="h-3 w-3" />
                                                Excluded from label printing
                                            </span>
                                        </div>
                                        <table className="w-full">
                                            <thead>
                                                <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <th className="px-4 py-2.5 w-10" />
                                                    <th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th>
                                                    <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-default)' }}>Dose</th>
                                                    <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-default)' }}>Quantity</th>
                                                    <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedOtcRows.length === 0 ? (
                                                    <tr><td colSpan={5} className="px-4 py-8 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No OTC medications with a Primary Code applied.</td></tr>
                                                ) : (
                                                    sortedOtcRows.map(row => (
                                                        <tr key={row.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: packPrepOtcSelected[row.id] ? '#f0faf4' : 'white' }}>
                                                            <td className="px-4 py-2 text-center">
                                                                <input type="checkbox" checked={!!packPrepOtcSelected[row.id]}
                                                                    onChange={() => setPackPrepOtcSelected(prev => ({ ...prev, [row.id]: !prev[row.id] }))}
                                                                    style={{ accentColor: '#145F33', cursor: 'pointer' }} />
                                                            </td>
                                                            <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.drugName}</td>
                                                            <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.dose}</td>
                                                            <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.quantity}</td>
                                                            <td className="px-4 py-2">{ppStatusBadge(row.packStatus)}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                </div>

                                {/* Label Style Modal — inside IIFE so generateLabelPrint is in scope */}
                                <Dialog open={isLabelStyleModalOpen} onOpenChange={open => { if (!open) setIsLabelStyleModalOpen(false); }}>
                                    <DialogContent className="max-w-sm" aria-describedby={undefined} style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        <DialogHeader>
                                            <DialogTitle className="slds-text-6 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                Select Label Style
                                            </DialogTitle>
                                        </DialogHeader>

                                        <div className="py-4 space-y-3">
                                            <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Choose the label format to use for printing.
                                            </p>

                                            <button
                                                onClick={() => generateLabelPrint("sheet")}
                                                className="w-full flex items-start rounded-lg px-4 py-3 text-left transition-colors"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--slds-g-color-background-alt)'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--slds-g-color-background-base)'; }}
                                            >
                                                <div>
                                                    <p className="slds-text-4 font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>Sheet Labels</p>
                                                    <p className="slds-text-3 mt-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>Avery 5162 — 2" × 4", 10 per page</p>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => generateLabelPrint("individual")}
                                                className="w-full flex items-start rounded-lg px-4 py-3 text-left transition-colors"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--slds-g-color-background-alt)'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--slds-g-color-background-base)'; }}
                                            >
                                                <div>
                                                    <p className="slds-text-4 font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>Individual Labels</p>
                                                    <p className="slds-text-3 mt-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>2.4" × 3.9" per label</p>
                                                </div>
                                            </button>
                                        </div>

                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsLabelStyleModalOpen(false)}
                                                className="rounded-full h-9 slds-text-4 font-medium px-5"
                                                style={{ borderColor: 'var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Cancel
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                </React.Fragment>
                            );
                        })()}

                        {/* DISPENSE TAB */}
                        {createPackActiveTab === "dispense" && (() => {
                            const isNonSelectable = (status: string) =>
                                status === "Dispensed" || status === "Received" || status === "Reviewed";

                            const showLog = dispenseInnerTab === "log";
                            // "reprintLabels" slot repurposed as attestation-pending state
                            const showAttestation = dispenseInnerTab === "reprintLabels";

                            const dStatusBadge = (status: string) => {
                                const configs: Record<string, { bg: string; color: string; border: string; label: string }> = {
                                    Selected:  { bg: '#f0faf4', color: '#145F33', border: '#a3d4b5', label: 'Selected' },
                                    Active:    { bg: '#f0faf4', color: '#145F33', border: '#a3d4b5', label: 'Active' },
                                    Dispensed: { bg: '#fef2f2', color: '#c23934', border: '#f5c6c6', label: 'Dispensed' },
                                    Received:  { bg: '#fef9ec', color: '#92400e', border: '#fde68a', label: 'Received' },
                                    Reviewed:  { bg: '#f3f4f6', color: '#374151', border: '#d1d5db', label: 'Reviewed' },
                                };
                                const cfg = configs[status] || { bg: 'var(--slds-g-color-background-alt)', color: 'var(--slds-g-color-text-weak)', border: 'var(--slds-g-color-border-base-1)', label: status };
                                return (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full slds-text-3 font-medium whitespace-nowrap"
                                        style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                                        {cfg.label}
                                    </span>
                                );
                            };

                            const dStatusOrder: Record<string, number> = { Selected: 0, Active: 0, Dispensed: 1, Received: 2, Reviewed: 3 };
                            const sortByStatusThenName = <T extends { status: string; drugName: string }>(rows: T[]): T[] =>
                                [...rows].sort((a, b) => ((dStatusOrder[a.status] ?? 9) - (dStatusOrder[b.status] ?? 9)) || a.drugName.localeCompare(b.drugName));

                            // Group Prescribed Medications by date, then sort within each date group
                            const medDateGroups: Record<string, DispenseRow[]> = {};
                            dispenseMedRows.forEach(r => {
                                const key = r.start;
                                if (!medDateGroups[key]) medDateGroups[key] = [];
                                medDateGroups[key].push(r);
                            });
                            const sortedMedGroups = Object.keys(medDateGroups)
                                .sort()
                                .map(date => ({ date, rows: sortByStatusThenName(medDateGroups[date]) }));

                            const sortedPrnRows = sortByStatusThenName(dispensePrnRows);
                            const sortedOtcRows = sortByStatusThenName(dispenseOtcRows);

                            const allSelected = [
                                ...dispenseMedRows.filter(r => r.selected && !isNonSelectable(r.status)),
                                ...dispensePrnRows.filter(r => r.selected && !isNonSelectable(r.status)),
                                ...dispenseOtcRows.filter(r => r.selected && !isNonSelectable(r.status)),
                            ];
                            const hasAnySelected = allSelected.length > 0;

                            const handleSelectAllSelected = () => {
                                setDispenseMedRows(prev => prev.map(r => ({ ...r, selected: !isNonSelectable(r.status) ? true : r.selected })));
                                setDispensePrnRows(prev => prev.map(r => ({ ...r, selected: !isNonSelectable(r.status) ? true : r.selected })));
                                setDispenseOtcRows(prev => prev.map(r => ({ ...r, selected: !isNonSelectable(r.status) ? true : r.selected })));
                            };

                            const handleDeselectAll = () => {
                                setDispenseMedRows(prev => prev.map(r => ({ ...r, selected: false })));
                                setDispensePrnRows(prev => prev.map(r => ({ ...r, selected: false })));
                                setDispenseOtcRows(prev => prev.map(r => ({ ...r, selected: false })));
                            };

                            const handleStaffDispensed = () => {
                                if (!hasAnySelected) { toast.warning("Select at least one medication row before dispensing."); return; }
                                setDispenseInnerTab("reprintLabels");
                            };

                            const handleAttestationConfirm = () => {
                                const count = allSelected.length;
                                setDispenseMedRows(prev => prev.map(r => r.selected ? { ...r, status: "Dispensed", selected: false } : r));
                                setDispensePrnRows(prev => prev.map(r => r.selected ? { ...r, status: "Dispensed", selected: false } : r));
                                setDispenseOtcRows(prev => prev.map(r => r.selected ? { ...r, status: "Dispensed", selected: false } : r));
                                setDispenseInnerTab("staffDispensed");
                                toast.success(`${count} medication${count !== 1 ? 's' : ''} dispensed successfully.`);
                            };

                            const handleAttestationCancel = () => { setDispenseInnerTab("staffDispensed"); };

                            return (
                                <div className="px-6 py-5 space-y-5">
                                    {/* Toolbar */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={handleStaffDispensed}
                                                    disabled={showAttestation}
                                                    className="rounded-full h-9 px-4 slds-text-4 font-medium text-white transition-colors"
                                                    style={{
                                                        backgroundColor: showAttestation ? 'var(--slds-g-color-neutral-95)' : '#145F33',
                                                        color: showAttestation ? 'var(--slds-g-color-text-weak)' : 'white',
                                                        cursor: showAttestation ? 'not-allowed' : 'pointer',
                                                    }}
                                                >
                                                    Staff Dispensed
                                                </button>
                                                <button
                                                    onClick={() => setIsPackMedLogOpen(true)}
                                                    className="h-9 px-4 rounded-full slds-text-4 font-medium transition-colors flex items-center gap-1.5"
                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                                >
                                                    <FileText className="h-3.5 w-3.5" />
                                                    Log
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={handleSelectAllSelected}
                                                        disabled={showAttestation}
                                                        className="slds-text-3 font-medium underline"
                                                        style={{ color: showAttestation ? 'var(--slds-g-color-text-weak)' : '#145F33' }}
                                                    >
                                                        Select All Selected
                                                    </button>
                                                    <button
                                                        onClick={handleDeselectAll}
                                                        disabled={showAttestation}
                                                        className="slds-text-3 font-medium underline"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Deselect All
                                                    </button>
                                                </div>
                                        </div>

                                        {/* Inline Attestation */}
                                        {showAttestation && (
                                            <div className="flex items-center gap-3 flex-wrap px-4 py-2 rounded-lg" style={{ backgroundColor: '#fff8e1', border: '1px solid #ffe082' }}>
                                                <span className="text-[11px] text-right italic font-medium">
                                                  I attest that I have followed Mercy Home's
                                                  policies and procedures for medication
                                                  dispensation & documentation.
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={handleAttestationConfirm}
                                                        className="rounded-full h-8 px-4 slds-text-4 font-medium text-white"
                                                        style={{ backgroundColor: '#145F33', whiteSpace: 'nowrap' }}
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={handleAttestationCancel}
                                                        className="rounded-full h-8 px-4 slds-text-4 font-medium"
                                                        style={{ backgroundColor: 'white', color: 'var(--slds-g-color-text-default)', border: '1px solid var(--slds-g-color-border-base-1)', whiteSpace: 'nowrap' }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Medication Grids */}
                                    <div className="space-y-5">
                                            {/* Prescribed Medications */}
                                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Prescribed Medications</span>
                                                </div>
                                                <table className="w-full">
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <th className="px-4 py-2 w-10"></th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold w-32" style={{ color: 'var(--slds-g-color-text-default)' }}>Start</th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold w-32" style={{ color: 'var(--slds-g-color-text-default)' }}>Stop</th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold w-32" style={{ color: 'var(--slds-g-color-text-default)' }}>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sortedMedGroups.length === 0 ? (
                                                            <tr><td colSpan={5} className="px-4 py-6 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No prescribed medications to dispense.</td></tr>
                                                        ) : (
                                                            sortedMedGroups.map(({ date, rows }) => (
                                                                <React.Fragment key={`date-${date}`}>
                                                                    <tr style={{ backgroundColor: '#eef2f7', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                        <td colSpan={5} className="px-4 py-1.5 slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>{date}</td>
                                                                    </tr>
                                                                    {rows.map((row) => {
                                                                        const inactive = isNonSelectable(row.status);
                                                                        return (
                                                                            <tr key={row.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', opacity: inactive ? 0.45 : 1, backgroundColor: 'white' }}>
                                                                                <td className="px-4 py-2.5 text-center">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={row.selected}
                                                                                        disabled={inactive || showAttestation}
                                                                                        onChange={(e) => setDispenseMedRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: e.target.checked } : r))}
                                                                                        className="w-4 h-4"
                                                                                        style={{ accentColor: '#145F33', cursor: inactive ? 'not-allowed' : 'pointer' }}
                                                                                    />
                                                                                </td>
                                                                                <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.drugName}</td>
                                                                                <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.start}</td>
                                                                                <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.stop}</td>
                                                                                <td className="px-4 py-2.5">{dStatusBadge(row.status)}</td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </React.Fragment>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* PRN Grid */}
                                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>PRN</span>
                                                </div>
                                                <table className="w-full">
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <th className="px-4 py-2 w-10"></th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold w-32" style={{ color: 'var(--slds-g-color-text-default)' }}>Start</th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold w-32" style={{ color: 'var(--slds-g-color-text-default)' }}>Stop</th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold w-32" style={{ color: 'var(--slds-g-color-text-default)' }}>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sortedPrnRows.length === 0 ? (
                                                            <tr><td colSpan={5} className="px-4 py-6 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No PRN medications to dispense.</td></tr>
                                                        ) : (
                                                            sortedPrnRows.map((row) => {
                                                                const inactive = isNonSelectable(row.status);
                                                                return (
                                                                    <tr key={row.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', opacity: inactive ? 0.45 : 1, backgroundColor: 'white' }}>
                                                                        <td className="px-4 py-2.5 text-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={row.selected}
                                                                                disabled={inactive || showAttestation}
                                                                                onChange={(e) => setDispensePrnRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: e.target.checked } : r))}
                                                                                className="w-4 h-4"
                                                                                style={{ accentColor: '#145F33', cursor: inactive ? 'not-allowed' : 'pointer' }}
                                                                            />
                                                                        </td>
                                                                        <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.drugName}</td>
                                                                        <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>ALL DAY</td>
                                                                        <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>ALL DAY</td>
                                                                        <td className="px-4 py-2.5">{dStatusBadge(row.status)}</td>
                                                                    </tr>
                                                                );
                                                            })
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* OTC Grid */}
                                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>OTC</span>
                                                </div>
                                                <table className="w-full">
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <th className="px-4 py-2 w-10"></th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Dose</th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-default)' }}>Quantity</th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold w-32" style={{ color: 'var(--slds-g-color-text-default)' }}>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sortedOtcRows.length === 0 ? (
                                                            <tr><td colSpan={5} className="px-4 py-6 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No OTC medications to dispense.</td></tr>
                                                        ) : (
                                                            sortedOtcRows.map((row) => {
                                                                const inactive = isNonSelectable(row.status);
                                                                return (
                                                                    <tr key={row.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', opacity: inactive ? 0.45 : 1, backgroundColor: 'white' }}>
                                                                        <td className="px-4 py-2.5 text-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={row.selected}
                                                                                disabled={inactive || showAttestation}
                                                                                onChange={(e) => setDispenseOtcRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: e.target.checked } : r))}
                                                                                className="w-4 h-4"
                                                                                style={{ accentColor: '#145F33', cursor: inactive ? 'not-allowed' : 'pointer' }}
                                                                            />
                                                                        </td>
                                                                        <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.drugName}</td>
                                                                        <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>—</td>
                                                                        <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>—</td>
                                                                        <td className="px-4 py-2.5">{dStatusBadge(row.status)}</td>
                                                                    </tr>
                                                                );
                                                            })
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                </div>
                            );
                        })()}

                        {/* COUNT TAB */}
                        {createPackActiveTab === "count" && (() => {
                            const today = new Date();
                            const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

                            // "selected" field repurposed: true = this row has unsaved data pending attestation
                            const hasUnsavedChanges = countRows.some(r => r.currentCount !== "" || r.comments !== "");
                            const showAttestation = countRows.some(r => r.selected);

                            // Default sort: Dose Period (Morning → Afternoon → Evening → Bedtime) then medication name
                            const periodOrder: Record<string, number> = { Morning: 0, Afternoon: 1, Evening: 2, Bedtime: 3 };
                            const sortedCountRows = [...countRows].sort((a, b) => {
                                const pa = periodOrder[a.dosePeriod] ?? 9;
                                const pb = periodOrder[b.dosePeriod] ?? 9;
                                return pa !== pb ? pa - pb : a.medicationDose.localeCompare(b.medicationDose);
                            });

                            const handleCancel = () => {
                                if (!window.confirm("Are you sure you want to cancel?")) return;
                                setCountRows(prev => prev.map(r => ({ ...r, currentCount: "", comments: "", selected: false })));
                            };

                            return (
                                <div className="px-6 py-5 space-y-5">
                                    {/* Date banner */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>Count Date:</span>
                                            <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>{todayStr}</span>
                                            <span className="slds-text-3 px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#e8f5e9', color: '#145F33' }}>Today</span>
                                        </div>
                                        <span className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>Standard OTC medications are excluded from this count.</span>
                                    </div>

                                    {/* Count grid */}
                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        <table className="w-full">
                                            <thead>
                                                <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Dose Period</th>
                                                    <th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication / Dose</th>
                                                    <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-default)' }}>Count Type</th>
                                                    <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-default)' }}>Last Count</th>
                                                    <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-36" style={{ color: 'var(--slds-g-color-text-default)' }}>Current Count</th>
                                                    <th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Comments</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedCountRows.length === 0 ? (
                                                    <tr><td colSpan={6} className="px-4 py-8 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No medications to count for today.</td></tr>
                                                ) : (
                                                    sortedCountRows.map((row) => {
                                                        const isPendingAttestation = row.selected;
                                                        const isInputDisabled = showAttestation;
                                                        return (
                                                            <tr
                                                                key={row.id}
                                                                style={{
                                                                    borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                                                                    backgroundColor: isPendingAttestation ? '#f0faf4' : 'white',
                                                                    opacity: showAttestation && !isPendingAttestation ? 0.45 : 1,
                                                                }}
                                                            >
                                                                <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.dosePeriod}</td>
                                                                <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.medicationDose}</td>
                                                                <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.countType}</td>
                                                                <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.lastCount || "0.00"}</td>
                                                                <td className="px-4 py-2.5">
                                                                    {row.countType === "Volume" ? (
                                                                        <select
                                                                            value={row.currentCount}
                                                                            disabled={isInputDisabled}
                                                                            onChange={(e) => setCountRows(prev => prev.map(r => r.id === row.id ? { ...r, currentCount: e.target.value } : r))}
                                                                            className="h-8 w-full px-2 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33] disabled:cursor-not-allowed"
                                                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                                                        >
                                                                            <option value="">Select</option>
                                                                            <option value="Full">Full</option>
                                                                            <option value="3/4">3/4</option>
                                                                            <option value="1/2">1/2</option>
                                                                            <option value="1/4">1/4</option>
                                                                            <option value="Empty">Empty</option>
                                                                        </select>
                                                                    ) : (
                                                                        <input
                                                                            type="text"
                                                                            value={row.currentCount}
                                                                            disabled={isInputDisabled}
                                                                            placeholder="0.00"
                                                                            onChange={(e) => {
                                                                                let val = e.target.value.replace(/[^0-9.]/g, '');
                                                                                const dotIdx = val.indexOf('.');
                                                                                if (dotIdx !== -1) {
                                                                                    const leading = val.slice(0, dotIdx).slice(0, 3);
                                                                                    const decimal = val.slice(dotIdx + 1).replace('.', '').slice(0, 2);
                                                                                    val = leading + '.' + decimal;
                                                                                } else {
                                                                                    val = val.slice(0, 3);
                                                                                }
                                                                                setCountRows(prev => prev.map(r => r.id === row.id ? { ...r, currentCount: val } : r));
                                                                            }}
                                                                            className="h-8 w-full px-2 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33] disabled:cursor-not-allowed"
                                                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                                                        />
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-2.5">
                                                                    <input
                                                                        type="text"
                                                                        value={row.comments}
                                                                        disabled={isInputDisabled}
                                                                        placeholder="Add comment..."
                                                                        onChange={(e) => setCountRows(prev => prev.map(r => r.id === row.id ? { ...r, comments: e.target.value } : r))}
                                                                        className="h-8 w-full px-2 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33] disabled:cursor-not-allowed"
                                                                        style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Submit / Cancel bar with inline attestation */}
                                    <div className="flex items-center justify-end gap-3">
                                        <p className="m-0 text-[12px] text-right italic font-medium">
              I attest that I have followed Mercy Home's
              policies and procedures for medication
              dispensation & documentation.
            </p>
                                        <button
                                            onClick={() => {
                                                if (!hasUnsavedChanges) return;
                                                const updatedCount = countRows.filter(r => r.currentCount !== "" || r.comments !== "").length;
                                                setCountRows(prev => prev.map(r =>
                                                    r.currentCount !== "" || r.comments !== ""
                                                        ? { ...r, lastCount: r.currentCount || r.lastCount, currentCount: "", comments: "", selected: false }
                                                        : r
                                                ));
                                                toast.success(`Count submitted for ${updatedCount} medication${updatedCount !== 1 ? 's' : ''}.`);
                                            }}
                                            disabled={!hasUnsavedChanges}
                                            className="rounded-full h-9 px-4 slds-text-4 font-medium transition-colors flex-shrink-0"
                                            style={{
                                                backgroundColor: hasUnsavedChanges ? '#145F33' : 'var(--slds-g-color-neutral-95)',
                                                color: hasUnsavedChanges ? 'white' : 'var(--slds-g-color-text-weak)',
                                                cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed',
                                            }}
                                            onMouseEnter={e => { if (hasUnsavedChanges) (e.currentTarget as HTMLElement).style.backgroundColor = '#0e4524'; }}
                                            onMouseLeave={e => { if (hasUnsavedChanges) (e.currentTarget as HTMLElement).style.backgroundColor = '#145F33'; }}
                                        >
                                            Submit
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={!hasUnsavedChanges}
                                            className="rounded-full h-9 px-4 slds-text-4 font-medium transition-colors flex-shrink-0"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                color: hasUnsavedChanges ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed',
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* HAND OFF TAB */}
                        {createPackActiveTab === "handOff" && (() => {
                            // Selectable: Dispensed, Selected, Active
                            const isSelectable = (status: string) => status === "Dispensed" || status === "Selected" || status === "Active";

                            const statusOrder: Record<string, number> = { "Dispensed": 0, "Selected": 1, "Active": 1, "Received": 2, "Reviewed": 3 };
                            const dosePeriodOrder: Record<string, number> = { "Morning": 0, "Afternoon": 1, "Evening": 2 };

                            // Group medications by Date|Dose Period key
                            const groupedMedRows = handOffMedRows.reduce((acc, row) => {
                                const key = `${row.dateGroup || ""}|${row.dosePeriod || ""}`;
                                if (!acc[key]) acc[key] = [];
                                acc[key].push(row);
                                return acc;
                            }, {} as Record<string, HandOffRow[]>);

                            Object.keys(groupedMedRows).forEach(key => {
                                groupedMedRows[key].sort((a, b) =>
                                    ((statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9)) ||
                                    a.drugName.localeCompare(b.drugName)
                                );
                            });

                            const sortedGroupKeys = Object.keys(groupedMedRows).sort((a, b) => {
                                const [dateA, periodA] = a.split("|");
                                const [dateB, periodB] = b.split("|");
                                const dateCompare = dateA.localeCompare(dateB);
                                if (dateCompare !== 0) return dateCompare;
                                return (dosePeriodOrder[periodA] ?? 99) - (dosePeriodOrder[periodB] ?? 99);
                            });

                            const sortByStatus = <T extends { status: string; drugName: string }>(rows: T[]): T[] =>
                                [...rows].sort((a, b) => ((statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9)) || a.drugName.localeCompare(b.drugName));

                            const sortedPrnRows = sortByStatus(handOffPrnRows);
                            const sortedOtcRows = sortByStatus(handOffOtcRows);

                            const anySelected = [...handOffMedRows, ...handOffPrnRows, ...handOffOtcRows].some(r => r.selected && isSelectable(r.status));

                            const handleYouthReceived = () => {
                                if (!anySelected) { toast.error("Select at least one medication row before proceeding."); return; }
                                setIsYouthReceivedModalOpen(true);
                            };

                            const handleYouthReceivedSubmit = () => {
                                if (youthReceivedToggle === "otherRecipient") {
                                    if (!recipientType) { toast.error("Recipient Type is required when Other Recipient is selected."); return; }
                                    if (recipientType === "Other" && !recipientName.trim()) { toast.error("Name is required when Recipient Type is Other."); return; }
                                }
                                const selectedMeds = [
                                    ...handOffMedRows.filter(r => r.selected && isSelectable(r.status)),
                                    ...handOffPrnRows.filter(r => r.selected && isSelectable(r.status)),
                                    ...handOffOtcRows.filter(r => r.selected && isSelectable(r.status))
                                ];
                                setHandOffMedRows(prev => prev.map(r => r.selected && isSelectable(r.status) ? { ...r, status: "Received", selected: false } : r));
                                setHandOffPrnRows(prev => prev.map(r => r.selected && isSelectable(r.status) ? { ...r, status: "Received", selected: false } : r));
                                setHandOffOtcRows(prev => prev.map(r => r.selected && isSelectable(r.status) ? { ...r, status: "Received", selected: false } : r));
                                setIsYouthReceivedModalOpen(false);
                                setYouthReceivedToggle("youthReceived");
                                setRecipientType("");
                                setRecipientName("");
                                setPackComment("");
                                toast.success(`${selectedMeds.length} medication${selectedMeds.length !== 1 ? 's' : ''} marked as received. Log and attestation records created.`);
                            };

                            const statusBadge = (status: string) => {
                                const configs: Record<string, { bg: string; color: string; border: string }> = {
                                    "Active":    { bg: '#f0faf4', color: '#145F33', border: '#a3d4b5' },
                                    "Dispensed": { bg: '#fef2f2', color: '#c23934', border: '#f5c6c6' },
                                    "Selected":  { bg: '#f0faf4', color: '#145F33', border: '#a3d4b5' },
                                    "Received":  { bg: '#fef9ec', color: '#92400e', border: '#fde68a' },
                                    "Reviewed":  { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' },
                                };
                                const cfg = configs[status] || { bg: 'var(--slds-g-color-background-alt)', color: 'var(--slds-g-color-text-weak)', border: 'var(--slds-g-color-border-base-1)' };
                                return (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full slds-text-3 font-medium whitespace-nowrap"
                                        style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                                        {status}
                                    </span>
                                );
                            };

                            return (
                                <React.Fragment>
                                <div className="px-6 py-5 space-y-5">
                                    {/* Toolbar */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={handleYouthReceived}
                                                className="h-9 px-4 rounded-full slds-text-4 font-medium text-white transition-colors"
                                                style={{
                                                    backgroundColor: anySelected ? '#145F33' : 'var(--slds-g-color-neutral-95)',
                                                    color: anySelected ? 'white' : 'var(--slds-g-color-text-weak)',
                                                    cursor: anySelected ? 'pointer' : 'not-allowed'
                                                }}
                                            >
                                                Youth Received
                                            </button>
                                            <button
                                                onClick={() => setIsPackMedLogOpen(true)}
                                                className="h-9 px-4 rounded-full slds-text-4 font-medium transition-colors flex items-center gap-1.5"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                            >
                                                <FileText className="h-3.5 w-3.5" />
                                                Log
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                                <button
                                                    className="slds-text-3 font-medium underline"
                                                    style={{ color: '#145F33' }}
                                                    onClick={() => {
                                                        setHandOffMedRows(prev => prev.map(r => ({ ...r, selected: isSelectable(r.status) })));
                                                        setHandOffPrnRows(prev => prev.map(r => ({ ...r, selected: isSelectable(r.status) })));
                                                        setHandOffOtcRows(prev => prev.map(r => ({ ...r, selected: isSelectable(r.status) })));
                                                    }}
                                                >
                                                    Select All Dispensed
                                                </button>
                                                <button
                                                    className="slds-text-3 font-medium underline"
                                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    onClick={() => {
                                                        setHandOffMedRows(prev => prev.map(r => ({ ...r, selected: false })));
                                                        setHandOffPrnRows(prev => prev.map(r => ({ ...r, selected: false })));
                                                        setHandOffOtcRows(prev => prev.map(r => ({ ...r, selected: false })));
                                                    }}
                                                >
                                                    Deselect All
                                                </button>
                                            </div>
                                    </div>

                                    {/* Main Content Area */}
                                    <div className="space-y-5">
                                            {/* Medication Ready for Youth — grouped by Date then Dose Period */}
                                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication Ready for Youth</span>
                                                </div>
                                                <table className="w-full">
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <th className="px-4 py-2 w-10"></th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Start</th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Stop</th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold w-32" style={{ color: 'var(--slds-g-color-text-default)' }}>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sortedGroupKeys.length === 0 ? (
                                                            <tr><td colSpan={5} className="px-4 py-6 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No medications available</td></tr>
                                                        ) : (
                                                            sortedGroupKeys.map((groupKey, groupIdx) => {
                                                                const [date, period] = groupKey.split("|");
                                                                const rows = groupedMedRows[groupKey];
                                                                const doseTimes: Record<string, { start: string; stop: string }> = {
                                                                    "Morning":   { start: "8:00 AM",  stop: "9:00 AM"  },
                                                                    "Afternoon": { start: "12:00 PM", stop: "1:00 PM"  },
                                                                    "Evening":   { start: "6:00 PM",  stop: "7:00 PM"  },
                                                                    "Bedtime":   { start: "9:00 PM",  stop: "10:00 PM" },
                                                                };
                                                                const periodTimes = doseTimes[period] ?? { start: "—", stop: "—" };
                                                                const prevDate = groupIdx > 0 ? sortedGroupKeys[groupIdx - 1].split("|")[0] : null;
                                                                const showDateHeader = date !== prevDate;
                                                                return (
                                                                    <React.Fragment key={groupKey}>
                                                                        {showDateHeader && (
                                                                            <tr style={{ backgroundColor: '#eef2f7', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                                <td colSpan={5} className="px-4 py-1.5 slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>{date}</td>
                                                                            </tr>
                                                                        )}
                                                                        {period && (
                                                                            <tr style={{ backgroundColor: '#f8f9fb', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                                <td colSpan={5} className="px-6 py-1 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)', fontStyle: 'italic' }}>{period}</td>
                                                                            </tr>
                                                                        )}
                                                                        {rows.map((row) => {
                                                                            const inactive = !isSelectable(row.status);
                                                                            return (
                                                                                <tr key={row.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', opacity: inactive ? 0.45 : 1, backgroundColor: row.selected ? '#f0faf4' : 'white' }}>
                                                                                    <td className="px-4 py-2.5 text-center">
                                                                                        <input type="checkbox" checked={row.selected} disabled={inactive}
                                                                                            onChange={(e) => setHandOffMedRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: e.target.checked } : r))}
                                                                                            className="w-4 h-4" style={{ accentColor: '#145F33', cursor: inactive ? 'not-allowed' : 'pointer' }} />
                                                                                    </td>
                                                                                    <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.drugName}</td>
                                                                                    <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>{periodTimes.start}</td>
                                                                                    <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>{periodTimes.stop}</td>
                                                                                    <td className="px-4 py-2.5">{statusBadge(row.status)}</td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </React.Fragment>
                                                                );
                                                            })
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* PRN Grid */}
                                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>PRN</span>
                                                </div>
                                                <table className="w-full">
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <th className="px-4 py-2 w-10"></th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Start</th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Stop</th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold w-32" style={{ color: 'var(--slds-g-color-text-default)' }}>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sortedPrnRows.length === 0 ? (
                                                            <tr><td colSpan={5} className="px-4 py-6 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No PRN medications</td></tr>
                                                        ) : (
                                                            sortedPrnRows.map((row) => {
                                                                const inactive = !isSelectable(row.status);
                                                                return (
                                                                    <tr key={row.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', opacity: inactive ? 0.45 : 1, backgroundColor: row.selected ? '#f0faf4' : 'white' }}>
                                                                        <td className="px-4 py-2.5 text-center">
                                                                            <input type="checkbox" checked={row.selected} disabled={inactive}
                                                                                onChange={(e) => setHandOffPrnRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: e.target.checked } : r))}
                                                                                className="w-4 h-4" style={{ accentColor: '#145F33', cursor: inactive ? 'not-allowed' : 'pointer' }} />
                                                                        </td>
                                                                        <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.drugName}</td>
                                                                        <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>12:00 AM</td>
                                                                        <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>11:59 PM</td>
                                                                        <td className="px-4 py-2.5">{statusBadge(row.status)}</td>
                                                                    </tr>
                                                                );
                                                            })
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* OTC Grid */}
                                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>OTC</span>
                                                </div>
                                                <table className="w-full">
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <th className="px-4 py-2 w-10"></th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Start</th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Stop</th>
                                                            <th className="px-4 py-2 text-left slds-text-3 font-semibold w-32" style={{ color: 'var(--slds-g-color-text-default)' }}>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sortedOtcRows.length === 0 ? (
                                                            <tr><td colSpan={5} className="px-4 py-6 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No OTC medications</td></tr>
                                                        ) : (
                                                            sortedOtcRows.map((row) => {
                                                                const inactive = !isSelectable(row.status);
                                                                return (
                                                                    <tr key={row.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', opacity: inactive ? 0.45 : 1, backgroundColor: row.selected ? '#f0faf4' : 'white' }}>
                                                                        <td className="px-4 py-2.5 text-center">
                                                                            <input type="checkbox" checked={row.selected} disabled={inactive}
                                                                                onChange={(e) => setHandOffOtcRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: e.target.checked } : r))}
                                                                                className="w-4 h-4" style={{ accentColor: '#145F33', cursor: inactive ? 'not-allowed' : 'pointer' }} />
                                                                        </td>
                                                                        <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.drugName}</td>
                                                                        <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>ALL DAY</td>
                                                                        <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>ALL DAY</td>
                                                                        <td className="px-4 py-2.5">{statusBadge(row.status)}</td>
                                                                    </tr>
                                                                );
                                                            })
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                </div>
                                </React.Fragment>
                            );
                        })()}

                        {/* REVIEW TAB */}
                        {createPackActiveTab === "review" && (() => {
                            const allReceivedMed = reviewMedRows.filter(r => r.status === "Received");
                            const allReceivedPrn = reviewPrnRows.filter(r => r.status === "Received");
                            const allReceivedOtc = reviewOtcRows.filter(r => r.status === "Received");
                            const anyReceivedSelected =
                                allReceivedMed.some(r => r.selected) ||
                                allReceivedPrn.some(r => r.selected) ||
                                allReceivedOtc.some(r => r.selected);

                            const selectAllReceived = () => {
                                setReviewMedRows(prev => prev.map(r => r.status === "Received" ? { ...r, selected: true } : r));
                                setReviewPrnRows(prev => prev.map(r => r.status === "Received" ? { ...r, selected: true } : r));
                                setReviewOtcRows(prev => prev.map(r => r.status === "Received" ? { ...r, selected: true } : r));
                            };
                            const deselectAll = () => {
                                setReviewMedRows(prev => prev.map(r => ({ ...r, selected: false })));
                                setReviewPrnRows(prev => prev.map(r => ({ ...r, selected: false })));
                                setReviewOtcRows(prev => prev.map(r => ({ ...r, selected: false })));
                            };

                            const openSetReviewModal = () => {
                                setReviewModalPrimaryCode("MPM -- Missed Packed Med");
                                setReviewModalComment("");
                                setReviewModalCommentError(false);
                                setIsSetReviewStatusModalOpen(true);
                            };

                            const submitSetReview = () => {
                                if (!reviewModalComment.trim()) { setReviewModalCommentError(true); return; }
                                const now = new Date();
                                const ts = `${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}/${now.getFullYear()} ${String(now.getHours() % 12 || 12).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
                                const newEntries: ReviewLogEntry[] = [];
                                const auditFlag = reviewModalPrimaryCode ? codeAuditFlag(reviewModalPrimaryCode) : false;

                                const processRows = (rows: { id: number; selected: boolean; medication: string; primaryCode: string }[], label: string) => {
                                    rows.filter(r => r.selected).forEach(r => {
                                        newEntries.push({ id: Date.now() + r.id, timestamp: ts, user: "Current Staff", action: "Review", originalCode: r.primaryCode, primaryCode: reviewModalPrimaryCode, comment: reviewModalComment, detail: `Pack Status set to Reviewed — ${r.medication}${label ? ` (${label})` : ""}${auditFlag ? " | Audit Flag: Yes" : ""}`, medication: r.medication });
                                        newEntries.push({ id: Date.now() + r.id + 10000, timestamp: ts, user: "Current Staff", action: "Attestation", originalCode: r.primaryCode, primaryCode: reviewModalPrimaryCode, comment: reviewModalComment, detail: `Attestation recorded — ${r.medication}`, medication: r.medication });
                                    });
                                };
                                processRows(reviewMedRows.filter(r => r.selected), "");
                                processRows(reviewPrnRows.filter(r => r.selected), "PRN");
                                processRows(reviewOtcRows.filter(r => r.selected), "OTC");

                                setReviewLogEntries(prev => [...prev, ...newEntries]);
                                setReviewMedRows(prev => prev.map(r => r.selected ? { ...r, selected: false, status: "Reviewed", primaryCode: reviewModalPrimaryCode } : r));
                                setReviewPrnRows(prev => prev.map(r => r.selected ? { ...r, selected: false, status: "Reviewed", primaryCode: reviewModalPrimaryCode } : r));
                                setReviewOtcRows(prev => prev.map(r => r.selected ? { ...r, selected: false, status: "Reviewed", primaryCode: reviewModalPrimaryCode } : r));
                                setIsSetReviewStatusModalOpen(false);
                            };

                            const sortReviewRows = <T extends { status: string; medication: string }>(rows: T[]): T[] => {
                                const order: Record<string, number> = { "Received": 0, "Dispensed": 1, "Reviewed": 2 };
                                return [...rows].sort((a, b) => ((order[a.status] ?? 9) - (order[b.status] ?? 9)) || a.medication.localeCompare(b.medication));
                            };

                            // Group med rows by dateGroup then dosePeriod
                            const medByDate: Record<string, Record<string, typeof reviewMedRows>> = {};
                            sortReviewRows(reviewMedRows).forEach(r => {
                                if (!medByDate[r.dateGroup]) medByDate[r.dateGroup] = {};
                                if (!medByDate[r.dateGroup][r.dosePeriod]) medByDate[r.dateGroup][r.dosePeriod] = [];
                                medByDate[r.dateGroup][r.dosePeriod].push(r);
                            });

                            const statusBadge = (status: string) => {
                                if (status === "Reviewed") return { bg: "#f3f4f6", color: "#374151", border: "#d1d5db" };
                                if (status === "Received") return { bg: "#fef9ec", color: "#92400e", border: "#fde68a" };
                                return { bg: "var(--slds-g-color-background-alt)", color: "var(--slds-g-color-text-weak)", border: "var(--slds-g-color-border-base-1)" };
                            };

                            const thStyle: React.CSSProperties = { backgroundColor: "#f4f6f9", color: "var(--slds-g-color-text-default)", borderBottom: "1px solid var(--slds-g-color-border-base-1)", padding: "8px 12px", textAlign: "left", whiteSpace: "nowrap", fontWeight: 600 };
                            const tdStyle: React.CSSProperties = { padding: "8px 12px", borderBottom: "1px solid var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-default)", verticalAlign: "middle" };

                            const clockIcon = <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

                            return (
                                <div className="flex flex-col h-full">
                                    {/* Toolbar */}
                                    <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{ backgroundColor: "var(--slds-g-color-background-base)" }}>
                                        <div className="flex items-center gap-3">
                                            <Button onClick={openSetReviewModal} disabled={!anyReceivedSelected} className="rounded-full h-9 slds-text-4 font-medium px-5 text-white transition-colors"
                                                style={{ backgroundColor: anyReceivedSelected ? "#145F33" : "var(--slds-g-color-neutral-95)", color: anyReceivedSelected ? "#fff" : "var(--slds-g-color-text-weak)", cursor: anyReceivedSelected ? "pointer" : "not-allowed" }}>
                                                Set Review Status
                                            </Button>
                                            <button onClick={() => setIsPackMedLogOpen(true)}
                                                className="h-9 px-4 rounded-full slds-text-4 font-medium transition-colors flex items-center gap-1.5"
                                                style={{ border: "1px solid var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-default)", backgroundColor: "var(--slds-g-color-background-base)" }}>
                                                <FileText className="h-3.5 w-3.5" />
                                                Log
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={selectAllReceived} className="slds-text-3 font-medium underline" style={{ color: "#145F33", background: "none", border: "none", cursor: "pointer" }}>Select All Received</button>
                                            <button onClick={deselectAll} className="slds-text-3 font-medium underline" style={{ color: "var(--slds-g-color-text-weak)", background: "none", border: "none", cursor: "pointer" }}>Deselect All</button>
                                        </div>
                                    </div>

                                    {/* Review grids */}
                                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                                            {/* Medications */}
                                            <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--slds-g-color-border-base-1)" }}>
                                                <div className="px-4 py-3" style={{ backgroundColor: "var(--slds-g-color-background-alt)", borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}><span className="slds-text-4 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>Medications</span></div>
                                                <table className="w-full border-collapse">
                                                    <thead>
                                                        <tr>
                                                            <th style={{ ...thStyle, width: 40 }}></th>
                                                            <th className="slds-text-3" style={thStyle}>Medication</th>
                                                            <th className="slds-text-3" style={thStyle}>Start</th>
                                                            <th className="slds-text-3" style={thStyle}>Stop</th>
                                                            <th className="slds-text-3" style={thStyle}>Status</th>
                                                            <th className="slds-text-3" style={thStyle}>Primary Code</th>
                                                            <th style={{ ...thStyle, width: 36 }}></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.keys(medByDate).sort().map(dateGroup => (
                                                            <React.Fragment key={dateGroup}>
                                                                <tr><td colSpan={7} style={{ padding: "6px 12px", backgroundColor: "#eef2f7", borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}><span className="slds-text-3 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>{dateGroup}</span></td></tr>
                                                                {Object.keys(medByDate[dateGroup]).map(dosePeriod => (
                                                                    <React.Fragment key={dosePeriod}>
                                                                        <tr><td colSpan={7} style={{ padding: "4px 20px", backgroundColor: "#f8f9fb", borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}><span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>{dosePeriod}</span></td></tr>
                                                                        {medByDate[dateGroup][dosePeriod].map(row => {
                                                                            const isReviewed = row.status === "Reviewed";
                                                                            const isSelectable = row.status === "Received";
                                                                            const badge = statusBadge(row.status);
                                                                            const rowHistory = reviewLogEntries.filter(e => e.medication === row.medication && e.action === "Review");
                                                                            return (
                                                                                <tr key={row.id} style={{ opacity: isReviewed ? 0.55 : 1 }}>
                                                                                    <td style={{ ...tdStyle, textAlign: "center" }}><input type="checkbox" checked={row.selected} disabled={!isSelectable} onChange={e => setReviewMedRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: e.target.checked } : r))} className="h-4 w-4 rounded" style={{ accentColor: "#145F33", cursor: isSelectable ? "pointer" : "not-allowed" }} /></td>
                                                                                    <td className="slds-text-4" style={tdStyle}>{row.medication}</td>
                                                                                    <td className="slds-text-4" style={{ ...tdStyle, color: "var(--slds-g-color-text-weak)" }}>{({"Morning":"8:00 AM","AM":"8:00 AM","Afternoon":"12:00 PM","Evening":"6:00 PM","PM":"6:00 PM","Bedtime":"9:00 PM"} as Record<string,string>)[row.dosePeriod] ?? "—"}</td>
                                                                                    <td className="slds-text-4" style={{ ...tdStyle, color: "var(--slds-g-color-text-weak)" }}>{({"Morning":"9:00 AM","AM":"9:00 AM","Afternoon":"1:00 PM","Evening":"7:00 PM","PM":"7:00 PM","Bedtime":"10:00 PM"} as Record<string,string>)[row.dosePeriod] ?? "—"}</td>
                                                                                    <td style={tdStyle}><span className="inline-flex items-center rounded-full px-2 py-0.5 slds-text-3 font-medium whitespace-nowrap" style={{ backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>{row.status}</span></td>
                                                                                    <td className="slds-text-4" style={{ ...tdStyle, color: "var(--slds-g-color-text-weak)" }}>{row.primaryCode || "—"}</td>
                                                                                    <td style={{ ...tdStyle, textAlign: "center", padding: "8px 6px" }}>
                                                                                        {rowHistory.length > 0 && (<button title="View change log" onClick={() => { setReviewHistoryMedication(row.medication); setIsReviewMedHistoryOpen(true); }} className="inline-flex items-center justify-center h-6 w-6 rounded transition-colors" style={{ color: "#0176d3", background: "none", border: "none", cursor: "pointer" }}>{clockIcon}</button>)}
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </React.Fragment>
                                                                ))}
                                                            </React.Fragment>
                                                        ))}
                                                        {reviewMedRows.length === 0 && (<tr><td colSpan={7} className="slds-text-4 text-center py-6" style={{ color: "var(--slds-g-color-text-weak)" }}>No medications.</td></tr>)}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* PRN */}
                                            <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--slds-g-color-border-base-1)" }}>
                                                <div className="px-4 py-3" style={{ backgroundColor: "var(--slds-g-color-background-alt)", borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}><span className="slds-text-4 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>PRN</span></div>
                                                <table className="w-full border-collapse">
                                                    <thead><tr><th style={{ ...thStyle, width: 40 }}></th><th className="slds-text-3" style={thStyle}>Medication</th><th className="slds-text-3" style={thStyle}>Start</th><th className="slds-text-3" style={thStyle}>Stop</th><th className="slds-text-3" style={thStyle}>Status</th><th className="slds-text-3" style={thStyle}>Primary Code</th><th style={{ ...thStyle, width: 36 }}></th></tr></thead>
                                                    <tbody>
                                                        {sortReviewRows(reviewPrnRows).map(row => {
                                                            const isReviewed = row.status === "Reviewed";
                                                            const isSelectable = row.status === "Received";
                                                            const badge = statusBadge(row.status);
                                                            const rowHistory = reviewLogEntries.filter(e => e.medication === row.medication && e.action === "Review");
                                                            return (
                                                                <tr key={row.id} style={{ opacity: isReviewed ? 0.55 : 1 }}>
                                                                    <td style={{ ...tdStyle, textAlign: "center" }}><input type="checkbox" checked={row.selected} disabled={!isSelectable} onChange={e => setReviewPrnRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: e.target.checked } : r))} className="h-4 w-4 rounded" style={{ accentColor: "#145F33", cursor: isSelectable ? "pointer" : "not-allowed" }} /></td>
                                                                    <td className="slds-text-4" style={tdStyle}>{row.medication}</td>
                                                                    <td className="slds-text-4" style={{ ...tdStyle, color: "var(--slds-g-color-text-weak)" }}>12:00 AM</td>
                                                                    <td className="slds-text-4" style={{ ...tdStyle, color: "var(--slds-g-color-text-weak)" }}>11:59 PM</td>
                                                                    <td style={tdStyle}><span className="inline-flex items-center rounded-full px-2 py-0.5 slds-text-3 font-medium whitespace-nowrap" style={{ backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>{row.status}</span></td>
                                                                    <td className="slds-text-4" style={{ ...tdStyle, color: "var(--slds-g-color-text-weak)" }}>{row.primaryCode || "—"}</td>
                                                                    <td style={{ ...tdStyle, textAlign: "center", padding: "8px 6px" }}>{rowHistory.length > 0 && (<button title="View change log" onClick={() => { setReviewHistoryMedication(row.medication); setIsReviewMedHistoryOpen(true); }} className="inline-flex items-center justify-center h-6 w-6 rounded" style={{ color: "#0176d3", background: "none", border: "none", cursor: "pointer" }}>{clockIcon}</button>)}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                        {reviewPrnRows.length === 0 && (<tr><td colSpan={7} className="slds-text-4 text-center py-6" style={{ color: "var(--slds-g-color-text-weak)" }}>No PRN medications.</td></tr>)}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* OTC */}
                                            <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--slds-g-color-border-base-1)" }}>
                                                <div className="px-4 py-3" style={{ backgroundColor: "var(--slds-g-color-background-alt)", borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}><span className="slds-text-4 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>OTC</span></div>
                                                <table className="w-full border-collapse">
                                                    <thead><tr><th style={{ ...thStyle, width: 40 }}></th><th className="slds-text-3" style={thStyle}>Medication</th><th className="slds-text-3" style={thStyle}>Dose</th><th className="slds-text-3" style={thStyle}>Quantity</th><th className="slds-text-3" style={thStyle}>Status</th><th className="slds-text-3" style={thStyle}>Primary Code</th><th style={{ ...thStyle, width: 36 }}></th></tr></thead>
                                                    <tbody>
                                                        {sortReviewRows(reviewOtcRows).map(row => {
                                                            const isReviewed = row.status === "Reviewed";
                                                            const isSelectable = row.status === "Received";
                                                            const badge = statusBadge(row.status);
                                                            const rowHistory = reviewLogEntries.filter(e => e.medication === row.medication && e.action === "Review");
                                                            return (
                                                                <tr key={row.id} style={{ opacity: isReviewed ? 0.55 : 1 }}>
                                                                    <td style={{ ...tdStyle, textAlign: "center" }}><input type="checkbox" checked={row.selected} disabled={!isSelectable} onChange={e => setReviewOtcRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: e.target.checked } : r))} className="h-4 w-4 rounded" style={{ accentColor: "#145F33", cursor: isSelectable ? "pointer" : "not-allowed" }} /></td>
                                                                    <td className="slds-text-4" style={tdStyle}>{row.medication}</td>
                                                                    <td className="slds-text-4" style={{ ...tdStyle, color: "var(--slds-g-color-text-weak)" }}>{row.dose}</td>
                                                                    <td className="slds-text-4" style={{ ...tdStyle, color: "var(--slds-g-color-text-weak)" }}>{row.quantity}</td>
                                                                    <td style={tdStyle}><span className="inline-flex items-center rounded-full px-2 py-0.5 slds-text-3 font-medium whitespace-nowrap" style={{ backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>{row.status}</span></td>
                                                                    <td className="slds-text-4" style={{ ...tdStyle, color: "var(--slds-g-color-text-weak)" }}>{row.primaryCode || "—"}</td>
                                                                    <td style={{ ...tdStyle, textAlign: "center", padding: "8px 6px" }}>{rowHistory.length > 0 && (<button title="View change log" onClick={() => { setReviewHistoryMedication(row.medication); setIsReviewMedHistoryOpen(true); }} className="inline-flex items-center justify-center h-6 w-6 rounded" style={{ color: "#0176d3", background: "none", border: "none", cursor: "pointer" }}>{clockIcon}</button>)}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                        {reviewOtcRows.length === 0 && (<tr><td colSpan={7} className="slds-text-4 text-center py-6" style={{ color: "var(--slds-g-color-text-weak)" }}>No OTC medications.</td></tr>)}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                    {/* Set Review Status Modal */}
                                    <Dialog open={isSetReviewStatusModalOpen} onOpenChange={open => { if (!open) setIsSetReviewStatusModalOpen(false); }}>
                                            <DialogContent
                                            size="xl"
                                            aria-describedby={undefined}
                                            onInteractOutside={(event) => {
                                              // Prevent the Dialog from closing when clicking outside
                                              event.preventDefault();
                                            }}
                                          >
                                            <DialogHeader>
                                              <div className="flex items-start gap-3">
                                                <DialogTitle className="slds-text-6 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>Set Review Status</DialogTitle>
                                                  </div>                                
                                            </DialogHeader>
                                                  <DialogBody className="space-y-6">
                                                    {/* Selected medications summary */}
                                                    <div className="rounded-lg px-4 py-3" style={{ backgroundColor: "var(--slds-g-color-background-alt)", border: "1px solid var(--slds-g-color-border-base-1)" }}>
                                                        <p className="slds-form-label mb-1.5" style={{ color: "var(--slds-g-color-text-weak)" }}>SELECTED MEDICATIONS</p>
                                                        <ul className="space-y-0.5">
                                                            {reviewMedRows.filter(r => r.selected).map(r => (<li key={r.id} className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{r.medication} — {r.dosePeriod}</li>))}
                                                            {reviewPrnRows.filter(r => r.selected).map(r => (<li key={r.id} className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{r.medication} (PRN)</li>))}
                                                            {reviewOtcRows.filter(r => r.selected).map(r => (<li key={r.id} className="slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{r.medication} (OTC)</li>))}
                                                        </ul>
                                                    </div>
                                                    {/* Primary Code */}
                                                    <div className="space-y-1.5">
                                                        <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>SELECT PRIMARY MEDICATION CODE</label>
                                                        <MedCodePicker codes={MED_CODES} value={reviewModalPrimaryCode} onChange={setReviewModalPrimaryCode} allowNull={true} placeholder="— No code —" />
                                                    </div>
                                                    {/* Pack Comment */}
                                                    <div>
                                                        <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>PACK COMMENT (MEDICATION COMMENT) <span className="text-red-600">*</span></label>
                                                        <textarea value={reviewModalComment} onChange={e => { setReviewModalComment(e.target.value); if (e.target.value.trim()) setReviewModalCommentError(false); }} placeholder="Enter required comment..." rows={3} className="w-full rounded-md px-3 py-2 slds-text-4 resize-none" style={{ border: `1px solid ${reviewModalCommentError ? "#c23934" : "var(--slds-g-color-border-base-1)"}`, color: "var(--slds-g-color-text-default)", backgroundColor: "var(--slds-g-color-background-base)" }} />
                                                        {reviewModalCommentError && (<p className="slds-text-3" style={{ color: "#c23934" }}>Pack Comment is required.</p>)}
                                                    </div>
                                                </DialogBody>
                                            <DialogFooter className="flex items-center justify-end gap-3 pt-2">
                                                <p className="m-0 text-[12px] text-right italic font-medium">
                                                  I attest that I have followed Mercy Home's
                                                  policies and procedures for medication
                                                  dispensation & documentation.
                                                </p>
                                                
                                                <Button variant="outline" onClick={() => setIsSetReviewStatusModalOpen(false)} className="rounded-full h-9 slds-text-4 font-medium px-5 flex-shrink-0" style={{ borderColor: "var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-default)" }}>Cancel</Button>
                                              <Button onClick={submitSetReview} className="rounded-full h-9 slds-text-4 font-medium px-5 text-white flex-shrink-0" style={{ backgroundColor: "#145F33" }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0e4524")} onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#145F33")}>Submit</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Medication Change Log Modal */}
                                    <Dialog open={isReviewMedHistoryOpen} onOpenChange={open => { if (!open) setIsReviewMedHistoryOpen(false); }}>
                                        <DialogContent className="max-w-xl" aria-describedby={undefined} style={{ maxHeight: "80vh", overflowY: "auto" }}>
                                            <DialogHeader>
                                                <DialogTitle className="slds-text-6 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>Change Log — {reviewHistoryMedication}</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-2 py-2">
                                                {reviewLogEntries.filter(e => e.medication === reviewHistoryMedication && e.action === "Review").length === 0 ? (
                                                    <p className="slds-text-4 text-center py-6" style={{ color: "var(--slds-g-color-text-weak)" }}>No change log entries for this medication.</p>
                                                ) : (
                                                    reviewLogEntries.filter(e => e.medication === reviewHistoryMedication && e.action === "Review").reverse().map(entry => (
                                                        <div key={entry.id} className="rounded-lg px-4 py-3 space-y-1" style={{ backgroundColor: "var(--slds-g-color-background-alt)", border: "1px solid var(--slds-g-color-border-base-1)" }}>
                                                            <div className="flex items-center justify-between gap-2">
                                                                <p className="slds-text-4 font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>{entry.detail}</p>
                                                                <p className="slds-text-3 flex-shrink-0" style={{ color: "var(--slds-g-color-text-weak)" }}>{entry.timestamp}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>Original code:</span>
                                                                <span className="slds-text-3 font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>{entry.originalCode || "None"}</span>
                                                                <span style={{ color: "#145F33" }}>→</span>
                                                                <span className="slds-text-3 font-medium" style={{ color: "#145F33" }}>{entry.primaryCode || "None"}</span>
                                                            </div>
                                                            {entry.comment && <p className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>Comment: {entry.comment}</p>}
                                                            <p className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>Staff: {entry.user}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsReviewMedHistoryOpen(false)} className="rounded-full h-9 slds-text-4 font-medium px-5" style={{ borderColor: "var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-default)" }}>Close</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            );
                        })()}

                        {/* DISPOSAL TAB */}
                        {createPackActiveTab === "disposal" && (() => {
                            const allReviewedMed = disposalMedRows.filter(r => r.status === "Reviewed");
                            const allReviewedPrn = disposalPrnRows.filter(r => r.status === "Reviewed");
                            const allReviewedOtc = disposalOtcRows.filter(r => r.status === "Reviewed");
                            const anyReviewedSelected =
                                allReviewedMed.some(r => r.selected) ||
                                allReviewedPrn.some(r => r.selected) ||
                                allReviewedOtc.some(r => r.selected);

                            const selectAllReviewed = () => {
                                setDisposalMedRows(prev => prev.map(r => r.status === "Reviewed" ? { ...r, selected: true } : r));
                                setDisposalPrnRows(prev => prev.map(r => r.status === "Reviewed" ? { ...r, selected: true } : r));
                                setDisposalOtcRows(prev => prev.map(r => r.status === "Reviewed" ? { ...r, selected: true } : r));
                            };
                            const deselectAll = () => {
                                setDisposalMedRows(prev => prev.map(r => ({ ...r, selected: false })));
                                setDisposalPrnRows(prev => prev.map(r => ({ ...r, selected: false })));
                                setDisposalOtcRows(prev => prev.map(r => ({ ...r, selected: false })));
                            };

                            const openMassDisposalModal = () => {
                                const now = new Date();
                                const today = `${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}/${now.getFullYear()}`;
                                const selectedMed = disposalMedRows.filter(r => r.selected && r.status === "Reviewed");
                                const selectedPrn = disposalPrnRows.filter(r => r.selected && r.status === "Reviewed");
                                const selectedOtc = disposalOtcRows.filter(r => r.selected && r.status === "Reviewed");
                                if (selectedMed.length + selectedPrn.length + selectedOtc.length === 0) {
                                    toast.error("Select at least one Reviewed medication row to add disposal."); return;
                                }
                                let nextId = 1;
                                const rows: MassDisposalModalRow[] = [
                                    ...selectedMed.map(r => ({ id: nextId++, medicationDosePeriod: `${r.medication} — ${r.dosePeriod}`, countType: r.countType, amountDisposed: "", comments: r.packComment, removePending: false })),
                                    ...selectedPrn.map(r => ({ id: nextId++, medicationDosePeriod: `${r.medication} — ${r.dosePeriod}`, countType: r.countType, amountDisposed: "", comments: r.packComment, removePending: false })),
                                    ...selectedOtc.map(r => ({ id: nextId++, medicationDosePeriod: `${r.medication} — ${r.dosePeriod}`, countType: r.countType, amountDisposed: "", comments: r.packComment, removePending: false })),
                                ];
                                setMassDisposalModalRows(rows);
                                setMassDisposalDate(today);
                                setIsMassDisposalModalOpen(true);
                            };

                            const handleMassDisposalSubmit = () => {
                                if (!massDisposalDate) { toast.error("Date is required."); return; }
                                const incomplete = massDisposalModalRows.filter(r => !r.amountDisposed.trim());
                                if (incomplete.length > 0) { toast.error("Amount Disposed is required for all rows."); return; }
                                const now = new Date();
                                const ts = `${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}/${now.getFullYear()} ${String(now.getHours()%12||12).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} ${now.getHours()>=12?'PM':'AM'}`;
                                const baseId = Date.now();
                                const newEntries: DisposalLogEntry[] = massDisposalModalRows.map((r, i) => ({ id: baseId + i, timestamp: ts, user: "Current User, RN", action: "Disposal", detail: `${r.medicationDosePeriod} — Amount: ${r.amountDisposed}${r.comments ? ` | Comment: ${r.comments}` : ''}` }));
                                const attestationEntries: DisposalLogEntry[] = massDisposalModalRows.map((r, i) => ({ id: baseId + massDisposalModalRows.length + i, timestamp: ts, user: "Current User, RN", action: "Attestation", detail: `Attested disposal of ${r.medicationDosePeriod} — "I attest that I have followed the policies and procedure of Medicine Dispensation & Documentation."` }));
                                setDisposalLogEntries(prev => [...newEntries, ...attestationEntries, ...prev]);
                                const submittedLabels = new Set(massDisposalModalRows.map(r => r.medicationDosePeriod));
                                setDisposalMedRows(prev => prev.map(r => submittedLabels.has(`${r.medication} — ${r.dosePeriod}`) && r.selected ? { ...r, status: "Disposed" as const, selected: false } : r));
                                setDisposalPrnRows(prev => prev.map(r => submittedLabels.has(`${r.medication} — ${r.dosePeriod}`) && r.selected ? { ...r, status: "Disposed" as const, selected: false } : r));
                                setDisposalOtcRows(prev => prev.map(r => submittedLabels.has(`${r.medication} — ${r.dosePeriod}`) && r.selected ? { ...r, status: "Disposed" as const, selected: false } : r));
                                setIsMassDisposalModalOpen(false);
                                setMassDisposalModalRows([]);
                                toast.success(`${massDisposalModalRows.length} disposal record${massDisposalModalRows.length !== 1 ? 's' : ''} created.`);
                            };

                            const statusBadge = (status: "Reviewed" | "Pending" | "Disposed") => {
                                const map = {
                                    Reviewed: { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' },
                                    Pending:  { bg: '#fef9ec', color: '#78520a', border: '#fde68a' },
                                    Disposed: { bg: '#f4f6f9', color: 'var(--slds-g-color-text-weak)', border: 'var(--slds-g-color-border-base-1)' },
                                };
                                const s = map[status];
                                return (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full slds-text-3 font-medium whitespace-nowrap"
                                        style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                                        {status}
                                    </span>
                                );
                            };

                            const statusOrder: Record<string, number> = { Reviewed: 0, Pending: 1, Disposed: 2 };
                            const sortRows = <T extends { status: string; medication: string }>(rows: T[]) =>
                                [...rows].sort((a, b) => {
                                    const sd = statusOrder[a.status] - statusOrder[b.status];
                                    return sd !== 0 ? sd : a.medication.localeCompare(b.medication);
                                });

                            const medDateGroups = [...new Set(disposalMedRows.map(r => r.dateGroup))].sort();
                            const sharedTh = "px-3 py-2.5 text-left slds-text-3 font-semibold";

                            return (
                                <div className="px-6 py-5 space-y-5">
                                    {/* Toolbar */}
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={openMassDisposalModal}
                                                disabled={!anyReviewedSelected}
                                                className="h-9 px-4 rounded-full slds-text-4 font-medium transition-colors"
                                                style={{ backgroundColor: anyReviewedSelected ? '#145F33' : 'var(--slds-g-color-neutral-95)', color: anyReviewedSelected ? 'white' : 'var(--slds-g-color-text-weak)', cursor: anyReviewedSelected ? 'pointer' : 'not-allowed' }}
                                            >
                                                Add Disposal
                                            </button>
                                            <button
                                                onClick={() => setIsPackMedLogOpen(true)}
                                                className="h-9 px-4 rounded-full slds-text-4 font-medium transition-colors flex items-center gap-1.5"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                            >
                                                <FileText className="h-3.5 w-3.5" />
                                                Log
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                                <button className="slds-text-3 font-medium underline" style={{ color: '#145F33' }} onClick={selectAllReviewed}>Select All Reviewed</button>
                                                <button className="slds-text-3 font-medium underline" style={{ color: 'var(--slds-g-color-text-weak)' }} onClick={deselectAll}>Deselect All</button>
                                            </div>
                                    </div>

                                    {/* Dispose view — three section tables */}
                                    <div className="space-y-5">
                                            {/* Medications Section */}
                                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medications</span>
                                                </div>
                                                <table className="w-full">
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <th className="px-3 py-2.5 w-10" />
                                                            <th className={sharedTh} style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th>
                                                            <th className={`${sharedTh} w-24`} style={{ color: 'var(--slds-g-color-text-default)' }}>Start</th>
                                                            <th className={`${sharedTh} w-24`} style={{ color: 'var(--slds-g-color-text-default)' }}>Stop</th>
                                                            <th className={`${sharedTh} w-28`} style={{ color: 'var(--slds-g-color-text-default)' }}>Status</th>
                                                            <th className={`${sharedTh} w-28`} style={{ color: 'var(--slds-g-color-text-default)' }}>Primary Code</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {disposalMedRows.length === 0 ? (
                                                            <tr><td colSpan={6} className="px-4 py-6 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No medication rows available.</td></tr>
                                                        ) : (
                                                            medDateGroups.map(dateGroup => {
                                                                const rowsInGroup = disposalMedRows.filter(r => r.dateGroup === dateGroup);
                                                                const dosePeriods = [...new Set(rowsInGroup.map(r => r.dosePeriod))].filter(dp => dp !== "AM" && dp !== "PM").sort();
                                                                return (
                                                                    <React.Fragment key={dateGroup}>
                                                                        <tr style={{ backgroundColor: '#eef2f7' }}>
                                                                            <td colSpan={6} className="px-3 py-1.5 slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>{dateGroup}</td>
                                                                        </tr>
                                                                        {dosePeriods.map(dp => {
                                                                            const dpRows = rowsInGroup.filter(r => r.dosePeriod === dp);
                                                                            return (
                                                                                <React.Fragment key={dp}>
                                                                                    <tr style={{ backgroundColor: '#f8f9fb' }}>
                                                                                        <td colSpan={6} className="px-4 py-1 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)', borderBottom: '1px solid var(--slds-g-color-border-base-1)', paddingLeft: '32px' }}>{dp}</td>
                                                                                    </tr>
                                                                                    {sortRows(dpRows).map(row => (
                                                                                        <tr key={row.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: row.selected ? '#f0faf4' : 'white' }}>
                                                                                            <td className="px-3 py-2.5 text-center">
                                                                                                {row.status === "Reviewed" ? (
                                                                                                    <input type="checkbox" checked={row.selected} onChange={e => setDisposalMedRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: e.target.checked } : r))} className="w-4 h-4" style={{ accentColor: '#145F33', cursor: 'pointer' }} />
                                                                                                ) : (<span className="inline-block w-4 h-4" />)}
                                                                                            </td>
                                                                                            <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.medication}</td>
                                                                                            <td className="px-3 py-2.5 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.start}</td>
                                                                                            <td className="px-3 py-2.5 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.stop}</td>
                                                                                            <td className="px-3 py-2.5">{statusBadge(row.status)}</td>
                                                                                            <td className="px-3 py-2.5 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.primaryCode || '—'}</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </React.Fragment>
                                                                            );
                                                                        })}
                                                                    </React.Fragment>
                                                                );
                                                            })
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* PRN Section */}
                                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>PRN</span>
                                                </div>
                                                <table className="w-full">
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <th className="px-3 py-2.5 w-10" />
                                                            <th className={sharedTh} style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th>
                                                            <th className={`${sharedTh} w-24`} style={{ color: 'var(--slds-g-color-text-default)' }}>Start</th>
                                                            <th className={`${sharedTh} w-24`} style={{ color: 'var(--slds-g-color-text-default)' }}>Stop</th>
                                                            <th className={`${sharedTh} w-28`} style={{ color: 'var(--slds-g-color-text-default)' }}>Status</th>
                                                            <th className={`${sharedTh} w-28`} style={{ color: 'var(--slds-g-color-text-default)' }}>Primary Code</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {disposalPrnRows.length === 0 ? (
                                                            <tr><td colSpan={6} className="px-4 py-6 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No PRN rows available.</td></tr>
                                                        ) : (
                                                            sortRows(disposalPrnRows).map(row => (
                                                                <tr key={row.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: row.selected ? '#f0faf4' : 'white' }}>
                                                                    <td className="px-3 py-2.5 text-center">
                                                                        {row.status === "Reviewed" ? (
                                                                            <input type="checkbox" checked={row.selected} onChange={e => setDisposalPrnRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: e.target.checked } : r))} className="w-4 h-4" style={{ accentColor: '#145F33', cursor: 'pointer' }} />
                                                                        ) : (<span className="inline-block w-4 h-4" />)}
                                                                    </td>
                                                                    <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.medication}</td>
                                                                    <td className="px-3 py-2.5 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.start}</td>
                                                                    <td className="px-3 py-2.5 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.stop}</td>
                                                                    <td className="px-3 py-2.5">{statusBadge(row.status)}</td>
                                                                    <td className="px-3 py-2.5 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.primaryCode || '—'}</td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* OTC Section */}
                                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>OTC</span>
                                                </div>
                                                <table className="w-full">
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <th className="px-3 py-2.5 w-10" />
                                                            <th className={sharedTh} style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th>
                                                            <th className={`${sharedTh} w-24`} style={{ color: 'var(--slds-g-color-text-default)' }}>Dose</th>
                                                            <th className={`${sharedTh} w-24`} style={{ color: 'var(--slds-g-color-text-default)' }}>Quantity</th>
                                                            <th className={`${sharedTh} w-28`} style={{ color: 'var(--slds-g-color-text-default)' }}>Status</th>
                                                            <th className={`${sharedTh} w-28`} style={{ color: 'var(--slds-g-color-text-default)' }}>Primary Code</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {disposalOtcRows.length === 0 ? (
                                                            <tr><td colSpan={6} className="px-4 py-6 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No OTC rows available.</td></tr>
                                                        ) : (
                                                            sortRows(disposalOtcRows).map(row => (
                                                                <tr key={row.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: row.selected ? '#f0faf4' : 'white' }}>
                                                                    <td className="px-3 py-2.5 text-center">
                                                                        {row.status === "Reviewed" ? (
                                                                            <input type="checkbox" checked={row.selected} onChange={e => setDisposalOtcRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: e.target.checked } : r))} className="w-4 h-4" style={{ accentColor: '#145F33', cursor: 'pointer' }} />
                                                                        ) : (<span className="inline-block w-4 h-4" />)}
                                                                    </td>
                                                                    <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.medication}</td>
                                                                    <td className="px-3 py-2.5 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.dose}</td>
                                                                    <td className="px-3 py-2.5 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.quantity}</td>
                                                                    <td className="px-3 py-2.5">{statusBadge(row.status)}</td>
                                                                    <td className="px-3 py-2.5 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.primaryCode || '—'}</td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                    {/* Mass Disposal Modal */}
                                    <Dialog open={isMassDisposalModalOpen} onOpenChange={() => {}}>
                                        <DialogContent size="xl"
          onInteractOutside={(event) => {
            // Prevent the Dialog from closing when clicking outside
            event.preventDefault();
          }} aria-describedby="mass-disposal-desc" style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <DialogHeader className="px-6 pt-5 pb-4 border-b flex-shrink-0" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                <DialogTitle className="slds-text-6 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Add Disposal</DialogTitle>
                                                <DialogDescription id="mass-disposal-desc" asChild>
                                                    <div className="mt-2 rounded px-4 py-3 slds-text-4" style={{ backgroundColor: '#fef9ec', border: '1px solid #fde68a', color: '#78520a' }}>
                                                        <p>Write the following info on coin envelope for disposal: DISCARD, staff initials, date, medication name, doses, and youth.</p>
                                                        <p className="mt-1">Please remember to notify a Med Admin that medications are in the disposal drawer.</p>
                                                    </div>
                                                </DialogDescription>
                                            </DialogHeader>
                                            {/* Full-submission fields */}
                                          <div className="space-y-6">
                                            <div
                                              className="px-6 pb-5 flex items-start gap-6 border-b flex-shrink-0"
                                              style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
                                            >
                                              {/* Date */}
                                              <div className="flex flex-col gap-1.5">
                                                <label
                                                  className="slds-form-label"
                                                  style={{ color: "var(--slds-g-color-text-weak)" }}
                                                >
                                                  DATE <span className="text-red-600">*</span>
                                                </label>
                                                <input
                                                  type="text"
                                                  placeholder="MM/DD/YYYY"
                                                  maxLength={10}
                                                  value={massDisposalDate}
                                                  onChange={(e) => {
                                                    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 8);
                                                    let fmt = cleaned;
                                                    if (cleaned.length > 4) {
                                                      fmt = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
                                                    } else if (cleaned.length > 2) {
                                                      fmt = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
                                                    }
                                                    setMassDisposalDate(fmt);
                                                  }}
                                                  className="h-9 w-36 px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                                                  style={{
                                                    border: "1px solid var(--slds-g-color-border-base-1)",
                                                    color: "var(--slds-g-color-text-default)",
                                                  }}
                                                />
                                              </div>
                                              <div className="space-y-1.5">
                                                <label
                                                  className="slds-form-label"
                                                  style={{ color: "var(--slds-g-color-text-weak)" }}
                                                >
                                                  YOUTH
                                                </label>
                                                <div
                                                  className="h-9 px-3 flex items-center rounded slds-text-4"
                                                  style={{
                                                    border: "1px solid var(--slds-g-color-border-base-1)",
                                                    backgroundColor: "var(--slds-g-color-background-alt)",
                                                    color: "var(--slds-g-color-text-default)",
                                                    minWidth: "160px",
                                                  }}
                                                >
                                                  Marcus Johnson
                                                </div>
                                              </div>
                                            </div>

                                            {/* Medication rows */}
                                            <div className="overflow-y-auto">
                                                  <div
                                                      className="rounded-lg overflow-hidden shadow-none"
                                                      style={{
                                                          border: '1px solid var(--slds-g-color-border-base-1)',
                                                          boxShadow: 'none'
                                                      }}
                                                  >
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                <th className="px-3 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication — Dose Period</th>
                                                                <th className="px-3 py-2.5 text-left slds-text-3 font-semibold w-40" style={{ color: 'var(--slds-g-color-text-default)' }}>Amount Disposed <span className="text-red-600">*</span></th>
                                                                <th className="px-3 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Comments <span className="text-red-600">*</span></th>
                                                                <th className="px-3 py-2.5 w-10" />
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {massDisposalModalRows.length === 0 ? (
                                                                <tr><td colSpan={4} className="px-4 py-8 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>All rows removed.</td></tr>
                                                            ) : (
                                                                massDisposalModalRows.map(row => (
                                                                    <tr key={row.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: row.removePending ? '#fef2f2' : 'white' }}>
                                                                        <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.medicationDosePeriod}</td>
                                                                        <td className="px-3 py-2.5">
                                                                            {row.countType === "Volume" ? (
                                                                                <select value={row.amountDisposed} disabled={row.removePending}
                                                                                    onChange={e => setMassDisposalModalRows(prev => prev.map(r => r.id === row.id ? { ...r, amountDisposed: e.target.value } : r))}
                                                                                    className="h-8 w-full px-2 rounded slds-text-3 focus:outline-none focus:ring-2 focus:ring-[#145F33] disabled:opacity-40"
                                                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: row.amountDisposed ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>
                                                                                    <option value="">Select...</option>
                                                                                    {["Full","3/4","1/2","1/4","Empty"].map(v => <option key={v} value={v}>{v}</option>)}
                                                                                </select>
                                                                            ) : (
                                                                                <input type="text" placeholder="0.00" value={row.amountDisposed} disabled={row.removePending}
                                                                                    onChange={e => { const val = e.target.value.replace(/[^0-9.]/g,'').slice(0,6); setMassDisposalModalRows(prev => prev.map(r => r.id === row.id ? { ...r, amountDisposed: val } : r)); }}
                                                                                    className="h-8 w-full px-2 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33] disabled:opacity-40"
                                                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }} />
                                                                            )}
                                                                        </td>
                                                                        <td className="px-3 py-2.5">
                                                                            {row.removePending ? (
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="slds-text-3" style={{ color: '#c23934' }}>Remove this row?</span>
                                                                                    <button onClick={() => setMassDisposalModalRows(prev => prev.filter(r => r.id !== row.id))} className="h-7 px-3 rounded-full slds-text-3 font-medium text-white" style={{ backgroundColor: '#c23934' }}>Yes</button>
                                                                                    <button onClick={() => setMassDisposalModalRows(prev => prev.map(r => r.id === row.id ? { ...r, removePending: false } : r))} className="h-7 px-3 rounded-full slds-text-3 font-medium" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}>No</button>
                                                                                </div>
                                                                            ) : (
                                                                                <input type="text" placeholder="Required comment..." value={row.comments}
                                                                                    onChange={e => setMassDisposalModalRows(prev => prev.map(r => r.id === row.id ? { ...r, comments: e.target.value } : r))}
                                                                                    className="h-8 w-full px-2 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                                                                                    style={{ border: `1px solid ${row.comments.trim() ? 'var(--slds-g-color-border-base-1)' : '#f5c6c6'}`, color: 'var(--slds-g-color-text-default)', backgroundColor: row.comments.trim() ? 'var(--slds-g-color-background-base)' : '#fff8f8' }} />
                                                                            )}
                                                                        </td>
                                                                        <td className="px-3 py-2.5 text-center">
                                                                            {!row.removePending && (
                                                                                <button onClick={() => setMassDisposalModalRows(prev => prev.map(r => r.id === row.id ? { ...r, removePending: true } : r))} aria-label="Remove row" className="rounded-full p-1 transition-colors hover:bg-red-50" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                                    <X className="h-3.5 w-3.5" />
                                                                                </button>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                          </div>
                                          <DialogFooter className="border-t px-6 py-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                            <div className="flex w-full items-center justify-between gap-6">
                                              <p className="m-0 text-[12px] text-right italic font-medium">
                                                I attest that I have followed Mercy Home's
                                                policies and procedures for medication
                                                dispensation & documentation.
                                              </p>
                                              <div className="flex items-center gap-3 shrink-0">
                                                <button
                                                  onClick={() => setMassDisposalCancelConfirmOpen(true)}
                                                  className="h-9 px-4 rounded-full slds-text-4 font-medium"
                                                  style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    color: 'var(--slds-g-color-text-default)',
                                                    backgroundColor: 'var(--slds-g-color-neutral-95)',
                                                  }}
                                                >
                                                  Cancel
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    const missingComments = massDisposalModalRows.some(
                                                      r => !r.removePending && !r.comments.trim()
                                                    );
                                          
                                                    if (missingComments) {
                                                      toast.error("Comments are required for all rows.");
                                                      return;
                                                    }
                                          
                                                    handleMassDisposalSubmit();
                                                  }}
                                                  disabled={massDisposalModalRows.length === 0}
                                                  className="h-9 px-5 rounded-full slds-text-4 font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                  style={{ backgroundColor: '#145F33' }}
                                                >
                                                  Submit
                                                </button>
                                              </div>
                                            </div>
                                          </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Cancel Confirmation Dialog */}
                                    <Dialog open={massDisposalCancelConfirmOpen} onOpenChange={setMassDisposalCancelConfirmOpen}>
                                        <DialogContent className="max-w-sm" aria-describedby="cancel-desc" style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <DialogHeader>
                                                <DialogTitle className="slds-text-6 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Cancel Disposal</DialogTitle>
                                                <DialogDescription id="cancel-desc" className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>Are you sure you want to cancel?</DialogDescription>
                                            </DialogHeader>
                                            <div className="flex justify-end gap-2 pt-2">
                                                <button onClick={() => setMassDisposalCancelConfirmOpen(false)} className="h-9 px-4 rounded-full slds-text-4 font-medium" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-neutral-95)' }}>No</button>
                                                <button onClick={() => { setMassDisposalCancelConfirmOpen(false); setIsMassDisposalModalOpen(false); setMassDisposalModalRows([]); deselectAll(); }} className="h-9 px-4 rounded-full slds-text-4 font-medium text-white" style={{ backgroundColor: '#c23934' }}>Yes, Cancel</button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            );
                        })()}

                    </div>{/* end Tab Body */}

                    {/* Dialog Footer */}
                    <div className="px-6 py-4 flex items-center justify-between border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                        <Button variant="outline" onClick={() => setIsCreatePackDialogOpen(false)} className="btn--neutral">Cancel</Button>
                        <div className="flex gap-2">
                            {/* Back: all tabs except Doses */}
                            {createPackActiveTab !== "doses" && (
                                <Button variant="outline" onClick={() => { const idx = tabOrderArr.indexOf(createPackActiveTab); if (idx > 0) setCreatePackActiveTab(tabOrderArr[idx-1]); }} className="btn--outline">Back</Button>
                            )}
                            {/* Next (no save): Packing Prep and Count only */}
                            {(createPackActiveTab === "packingPrep" || createPackActiveTab === "count") && (
                                <Button onClick={() => { const idx = tabOrderArr.indexOf(createPackActiveTab); if (idx < tabOrderArr.length - 1) setCreatePackActiveTab(tabOrderArr[idx+1]); }} className="btn--outline-primary">Next</Button>
                            )}
                            {/* Save & Next: Doses, Set Primary, Dispense, Hand Off, Review */}
                            {["doses", "setPrimary", "dispense", "handOff", "review"].includes(createPackActiveTab) && (
                                <Button onClick={() => { const idx = tabOrderArr.indexOf(createPackActiveTab); if (idx < tabOrderArr.length - 1) setCreatePackActiveTab(tabOrderArr[idx+1]); }} className="btn--outline-primary" >Save & Next</Button>
                            )}
                            {/* Save & Close: all tabs except Packing Prep and Count */}
                            {createPackActiveTab !== "packingPrep" && createPackActiveTab !== "count" && (
                                <Button onClick={handleCreatePack} className="btn--default">Save & Close</Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Medication Log Modal — contextual, filtered to current pack date range */}
            <PackMedsLogModal
                open={isPackMedLogOpen}
                onClose={() => setIsPackMedLogOpen(false)}
                startDate={newPackForm?.startDate || appliedDateRange?.startDate || ""}
                startTime={newPackForm?.startTime || appliedDateRange?.startTime || ""}
                endDate={newPackForm?.endDate || appliedDateRange?.endDate || ""}
                endTime={newPackForm?.endTime || appliedDateRange?.endTime || ""}
                youthName={youthDisplayName || ""}
            />
        </>
    );
}