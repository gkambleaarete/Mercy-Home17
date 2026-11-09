import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner@2.0.3";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ChevronRight, Plus, User, Users, Building2, Phone, Mail, CheckSquare, Upload, AlertTriangle, Clock, MapPin, CheckCircle, Pencil, Trash2, ChevronDown, FileText, ChevronUp, Check, X, ChevronLeft, Search, Filter, Calendar, Package, Tag, ClipboardList, ChevronsUpDown, Download, Eye, File, MoreVertical , AlertCircle } from "@/app/lib/lucide-icons";
import { DateInput } from "../ui/date-input";
import { MedCodePicker, type MedCode } from "./MedCodePicker";
import { formatMdy } from "../../lib/dateFormat";
import { OtherTabsReviewTab } from "./OtherTabsReviewTab";
import { OtherTabsDisposalTab } from "./OtherTabsDisposalTab";

const MED_CODES: MedCode[] = [
    { code: "DRA", label: "Adjusted Dose - Medical Orders", type: "Coded - Routine", tooltip: "Medical professional advised adjusted dose" },
    { code: "PRN", label: "No Dose - Decline PRN", type: "Coded - Routine", tooltip: "Youth declined an AS NEEDED medication" },
    { code: "MED", label: "No Dose - Medical Orders", type: "Coded - Routine", tooltip: "Medical professional advised to skip dose" },
    { code: "HOS", label: "No Dose - Youth Hospitalized", type: "Coded - Routine", tooltip: "Youth hospitalized, medication managed by hospital" },
    { code: "PAK", label: "Packed - Pass/Outing", type: "Coded - Routine", tooltip: "Packed medication for pass or outing" },
    { code: "SCH", label: "Packed - School", type: "Coded - Routine", tooltip: "Packed for school or given at school" },
    { code: "WTA", label: "Wrong Time - Approved", type: "Coded - Routine", tooltip: "Dose provided outside dose window with approval" },
    { code: "ADS", label: "Adjusted Dose - Staff Error", type: "Coded - Staff Concern", tooltip: "Staff provided incorrect dose" },
    { code: "MDS", label: "Missed Dose - Staff Error", type: "Coded - Staff Concern", tooltip: "Staff did not offer or provide dose" },
    { code: "EMP", label: "No Dose - Out of Stock", type: "Coded - Staff Concern", tooltip: "No supply of medications in cart" },
    { code: "UNS", label: "Unapproved Dose - Staff Error", type: "Coded - Staff Concern", tooltip: "Unapproved Dose Given" },
    { code: "WTU", label: "Wrong Time - Unapproved", type: "Coded - Staff Concern", tooltip: "Dose provided outside dose window without approval" },
    { code: "MPM", label: "Missed Packed Med", type: "Coded - Youth Concern", tooltip: "Packed and received medication not taken" },
    { code: "ABS", label: "No Dose - Youth Absent", type: "Coded - Youth Concern", tooltip: "Youth absent during dose period" },
    { code: "CON", label: "No Dose - Youth Condition", type: "Coded - Youth Concern", tooltip: "Illness, Intoxication, Behavioral Concerns" },
    { code: "REF", label: "No Dose - Youth Refusal", type: "Coded - Youth Concern", tooltip: "Youth refused a scheduled dose" },
    { code: "OTH", label: "Other Reason Not Given", type: "Other", tooltip: "Dose not given - other codes do not apply" },
];

const SET_PRIMARY_CODES: MedCode[] = [
    MED_CODES.find(c => c.code === "PAK")!,
    MED_CODES.find(c => c.code === "SCH")!,
    MED_CODES.find(c => c.code === "DRA")!,
    MED_CODES.find(c => c.code === "PRN")!,
    MED_CODES.find(c => c.code === "MED")!,
    MED_CODES.find(c => c.code === "HOS")!,
    MED_CODES.find(c => c.code === "WTA")!,
    MED_CODES.find(c => c.code === "ADS")!,
    MED_CODES.find(c => c.code === "MDS")!,
    MED_CODES.find(c => c.code === "EMP")!,
    MED_CODES.find(c => c.code === "UNS")!,
    MED_CODES.find(c => c.code === "WTU")!,
    MED_CODES.find(c => c.code === "MPM")!,
    MED_CODES.find(c => c.code === "ABS")!,
    MED_CODES.find(c => c.code === "CON")!,
    MED_CODES.find(c => c.code === "REF")!,
    MED_CODES.find(c => c.code === "OTH")!,
];

interface OtherTabsPackMedsDialogsProps {
  [key: string]: any;
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  youthName: any;
}

export function OtherTabsCreatePackDialog(props: OtherTabsPackMedsDialogsProps) {
  const { isCreatePackDialogOpen, setIsCreatePackDialogOpen, setCreatePackActiveTab, setDateRangeApplied, setNewPackForm, setAppliedDateRange, setPrnMedications, setOtcMedications, setSetPrimaryShowLog, setPackingPrepInnerTab, setSelectedPackId, selectedPackId, createPackActiveTab, countRows, setCountRows, dateRangeApplied, prnMedications, otcMedications, setPendingDateChange, setIsDateChangeWarningOpen, newPackForm, defaultPrnMedications, defaultOtcMedications, setIsModifyAllPrnDialogOpen, setSelectedPrnIndex, setIsModifyPrnDialogOpen, setPrimaryMedRows, setPrimaryPrnRows, setPrimaryOtcRowsData, setIsSetPrimaryModalOpen, setPrimaryShowLog, setSetPrimaryMedRows, setSetPrimaryPrnRows, setSetPrimaryOtcRowsData, setPrimaryLogEntries, packingPrepInnerTab, packPrepMedSelected, packPrepPrnSelected, packPrepOtcSelected, setIsLabelStyleModalOpen, appliedDateRange, setPackPrepMedSelected, setPackPrepPrnSelected, setPackPrepOtcSelected, isLabelStyleModalOpen, dispenseInnerTab, dispenseMedRows, dispensePrnRows, dispenseOtcRows, setDispenseMedRows, setDispensePrnRows, setDispenseOtcRows, setDispenseInnerTab, dispenseLogEntries, handOffMedRows, handOffPrnRows, handOffOtcRows, setIsYouthReceivedModalOpen, youthReceivedToggle, recipientType, recipientName, setHandOffMedRows, setHandOffPrnRows, setHandOffOtcRows, setYouthReceivedToggle, setRecipientType, setRecipientName, setPackComment, setHandOffInnerTab, handOffInnerTab, handOffLogEntries, isYouthReceivedModalOpen, packComment, handleCreatePack, isDateChangeWarningOpen, pendingDateChange, isSetPrimaryModalOpen, setSetPrimarySelectedCode, setSetPrimaryPackComment, setSetPrimaryCommentError, setPrimarySelectedCode, setPrimaryPackComment, setPrimaryCommentError, setSetPrimaryLogEntries, isModifyPrnDialogOpen, selectedPrnIndex, isModifyAllPrnDialogOpen, isAddOtcDialogOpen, setIsAddOtcDialogOpen, newOtcForm, setNewOtcForm, isViewPackDialogOpen, setIsViewPackDialogOpen, selectedPack, reviewMedRows, setReviewMedRows, reviewPrnRows, setReviewPrnRows, reviewOtcRows, setReviewOtcRows, reviewLogEntries, setReviewLogEntries, reviewInnerTab, setReviewInnerTab, isSetReviewStatusModalOpen, setIsSetReviewStatusModalOpen, reviewModalPrimaryCode, setReviewModalPrimaryCode, reviewModalComment, setReviewModalComment, reviewModalCommentError, setReviewModalCommentError, isReviewMedHistoryOpen, setIsReviewMedHistoryOpen, reviewHistoryMedication, setReviewHistoryMedication, disposalMedRows, setDisposalMedRows, disposalPrnRows, setDisposalPrnRows, disposalOtcRows, setDisposalOtcRows, disposalLogEntries, setDisposalLogEntries, disposalInnerTab, setDisposalInnerTab, isMassDisposalModalOpen, setIsMassDisposalModalOpen, massDisposalModalRows, setMassDisposalModalRows, massDisposalDate, setMassDisposalDate, massDisposalCancelConfirmOpen, setMassDisposalCancelConfirmOpen, youthName } = props;
  // Printouts belong to the selected pack's owner (pack names are "<Youth Name> <start>-<end>"); new packs use the current youth.
  const packOwnerName = ((selectedPackId && selectedPack?.packName) ? String(selectedPack.packName).replace(/\s+\d{1,2}\/\d{1,2}\/\d{2,4}.*$/, '').trim() : '') || props.youthName || '';
  return (
                    <Dialog open={isCreatePackDialogOpen} onOpenChange={(open) => {
                        setIsCreatePackDialogOpen(open);
                        if (!open) { setCreatePackActiveTab("doses"); setDateRangeApplied(false); setNewPackForm({ startDate: "", startTime: "", endDate: "", endTime: "", expectedHandoffDate: "" }); setAppliedDateRange({ startDate: "", startTime: "", endDate: "", endTime: "" }); setPrnMedications([]); setOtcMedications([]); setSetPrimaryShowLog(false); setPackingPrepInnerTab("checklist"); setSelectedPackId(null); }
                    }}>
                        <DialogContent
                            className="sm:max-w-[900px] max-h-[90vh] flex flex-col"
                            style={{
                                backgroundColor: 'var(--slds-g-color-background-base)',
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                padding: 0
                            }}
                        >
                            {/* Dialog Header */}
                            <DialogHeader className="px-6 pt-6 pb-4">
                                <DialogTitle className="text-[15px] font-semibold text-[#080707] flex items-center gap-2">
                                    <Package className="h-5 w-5" style={{ color: '#145F33' }} />
                                    {selectedPackId ? "Edit Medication Pack" : "Pack Medication"}
                                </DialogTitle>
                                <DialogDescription className="text-[13px] mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                    {selectedPackId ? "Update the details for this medication pack." : "Complete each step to create and finalize a medication pack."}
                                </DialogDescription>
                            </DialogHeader>

                            {/* Tab Navigation */}
                            <div
                                className="border-b"
                                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                            >
                            <div className="flex items-stretch w-full">
                                {([
                                    { key: "doses", label: "Doses" },
                                    { key: "setPrimary", label: "Set Primary" },
                                    { key: "packingPrep", label: "Packing Prep" },
                                    { key: "dispense", label: "Dispense" },
                                    { key: "count", label: "Count" },
                                    { key: "handOff", label: "Hand Off" },
                                    { key: "review", label: "Review" },
                                    { key: "disposal", label: "Disposal" }
                                ] as const).map((tab, idx) => {
                                    const isActive = createPackActiveTab === tab.key;
                                    const tabOrder: Record<string, number> = { doses: 0, setPrimary: 1, packingPrep: 2, dispense: 3, count: 4, handOff: 5, review: 6, disposal: 7 };
                                    const isCompleted = tabOrder[tab.key] < tabOrder[createPackActiveTab];
                                    return (
                                        <button
                                            key={tab.key}
                                            role="tab"
                                            aria-selected={isActive}
                                            onClick={() => {
                                                if (createPackActiveTab === "count" && countRows.some(r => r.currentCount !== "" || r.comments !== "")) {
                                                    if (!window.confirm("You have unsaved changes on the Count tab. Leave without saving?")) return;
                                                    setCountRows(prev => prev.map(r => ({ ...r, currentCount: "", comments: "", selected: false })));
                                                }
                                                setCreatePackActiveTab(tab.key);
                                            }}
                                            className="flex-1 relative flex flex-col items-center justify-center gap-1 py-3 px-1 font-medium transition-colors focus:outline-none"
                                            style={{
                                                color: isActive ? '#145F33' : isCompleted ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
                                                backgroundColor: isActive ? '#f0faf4' : 'transparent',
                                            }}
                                            onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--slds-g-color-background-alt)'; }}
                                            onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                                        >
                                            {/* Active tab indicator — absolutely positioned so it never clips */}
                                            <span
                                                className="absolute bottom-0 left-0 right-0 transition-opacity"
                                                style={{
                                                    height: '3px',
                                                    backgroundColor: '#145F33',
                                                    opacity: isActive ? 1 : 0,
                                                }}
                                            />
                                            {/* Step number / completion indicator */}
                                            <span
                                                className="inline-flex items-center justify-center h-5 w-5 rounded-full slds-text-3 font-semibold flex-shrink-0 transition-colors"
                                                style={{
                                                    backgroundColor: isActive ? '#145F33' : isCompleted ? '#e6f2eb' : 'var(--slds-g-color-background-alt)',
                                                    color: isActive ? '#ffffff' : isCompleted ? '#145F33' : 'var(--slds-g-color-text-weak)',
                                                    border: isCompleted && !isActive ? '1px solid #145F33' : 'none',
                                                }}
                                            >
                                                {isCompleted ? <Check className="h-3 w-3" /> : idx + 1}
                                            </span>
                                            <span className="text-center leading-tight whitespace-nowrap" style={{ fontSize: '11px' }}>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            </div>

                            {/* Tab Body — scrollable */}
                            <div className="flex-1 overflow-y-auto">

                                {/* ═══════ DOSES TAB ═══════ */}
                                {createPackActiveTab === "doses" && (() => {
                                    // helpers scoped to this tab
                                    const today60 = new Date(); today60.setDate(today60.getDate() + 60);
                                    const parseMMDDYYYY = (s: string) => { const [m, d, y] = s.split("/"); return m && d && y ? new Date(+y, +m - 1, +d) : null; };
                                    const formatMMDDYYYY = (s: string) => {
                                        const cleaned = s.replace(/\D/g, "");
                                        if (cleaned.length <= 2) return cleaned;
                                        if (cleaned.length <= 4) return `${cleaned.slice(0,2)}/${cleaned.slice(2)}`;
                                        return `${cleaned.slice(0,2)}/${cleaned.slice(2,4)}/${cleaned.slice(4,8)}`;
                                    };
                                    const formatHHMM = (s: string) => {
                                        // smart 12-hour format: "430" → "4:30 PM", "9" → "9:00 AM", etc.
                                        const digits = s.replace(/\D/g, "");
                                        if (!digits) return s;
                                        if (digits.length <= 2) {
                                            const h = parseInt(digits, 10);
                                            if (h >= 1 && h <= 12) return `${h}:00 ${h >= 8 ? "AM" : "PM"}`;
                                        }
                                        if (digits.length >= 3) {
                                            const h = parseInt(digits.slice(0, digits.length - 2), 10);
                                            const m = parseInt(digits.slice(-2), 10);
                                            if (h >= 1 && h <= 12 && m >= 0 && m <= 59) {
                                                return `${h}:${String(m).padStart(2,"0")} ${h >= 8 && h !== 12 ? "AM" : "PM"}`;
                                            }
                                        }
                                        return s;
                                    };
                                    const exceedsLimit = (dateStr: string) => {
                                        const d = parseMMDDYYYY(dateStr);
                                        return d ? d > today60 : false;
                                    };
                                    const hasInProcessMeds = dateRangeApplied && (prnMedications.length > 0 || otcMedications.length > 0);
                                    const handleDateChange = (field: keyof typeof newPackForm, rawValue: string) => {
                                        const value = ["startDate","endDate","expectedHandoffDate"].includes(field) ? formatMMDDYYYY(rawValue) : rawValue;
                                        if (hasInProcessMeds && ["startDate","startTime","endDate","endTime"].includes(field)) {
                                            setPendingDateChange({ [field]: value });
                                            setIsDateChangeWarningOpen(true);
                                        } else {
                                            setNewPackForm(f => ({ ...f, [field]: value }));
                                            if (["startDate","startTime","endDate","endTime"].includes(field)) setDateRangeApplied(false);
                                        }
                                    };
                                    const handleTimeChange = (field: "startTime" | "endTime", rawValue: string) => {
                                        setNewPackForm(f => ({ ...f, [field]: rawValue }));
                                    };
                                    return (
                                        <div className="px-6 py-6 space-y-5">

                                            {/* ── Packing Period Panel ── */}
                                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                {/* Header — matches PRN section header style */}
                                                <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Packing Period</span>
                                                    {dateRangeApplied && (
                                                        <span className="flex items-center gap-1.5 slds-text-3 px-2.5 py-1 rounded-full" style={{ backgroundColor: '#e6f2eb', color: '#145F33', border: '1px solid #a3d4b5' }}>
                                                            <Check className="h-3 w-3" />
                                                            Date range applied
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="p-5" style={{ backgroundColor: 'var(--slds-g-color-background-base)' }}>

                                                {/* Row 1: Start Date / Start Time / Expected Handoff Date */}
                                                <div className="grid grid-cols-3 gap-4 mb-4" style={{ overflow: 'visible' }}>
                                                    <div className="space-y-1.5">
                                                        <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                            START DATE <span className="text-red-600">*</span>
                                                        </label>
                                                        <DateInput
                                                            value={newPackForm.startDate}
                                                            onChange={v => handleDateChange("startDate", v)}
                                                            className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                                        />
                                                        {newPackForm.startDate && exceedsLimit(newPackForm.startDate) && (
                                                            <p className="flex items-center gap-1 slds-text-3" style={{ color: '#b57a00' }}>
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Date exceeds 60-day limit
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                            START TIME <span className="text-red-600">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="HH:MM AM/PM"
                                                            value={newPackForm.startTime}
                                                            onChange={e => handleTimeChange("startTime", e.target.value)}
                                                            onBlur={e => setNewPackForm(f => ({ ...f, startTime: formatHHMM(e.target.value) }))}
                                                            className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                            EXPECTED HANDOFF DATE <span className="text-red-600">*</span>
                                                        </label>
                                                        <DateInput
                                                            value={newPackForm.expectedHandoffDate}
                                                            onChange={v => setNewPackForm(f => ({ ...f, expectedHandoffDate: v }))}
                                                            className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Row 2: End Date / End Time / Apply */}
                                                <div className="grid grid-cols-3 gap-4" style={{ overflow: 'visible' }}>
                                                    <div className="space-y-1.5">
                                                        <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                            END DATE <span className="text-red-600">*</span>
                                                        </label>
                                                        <DateInput
                                                            value={newPackForm.endDate}
                                                            onChange={v => handleDateChange("endDate", v)}
                                                            className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                                        />
                                                        {newPackForm.endDate && exceedsLimit(newPackForm.endDate) && (
                                                            <p className="flex items-center gap-1 slds-text-3" style={{ color: '#b57a00' }}>
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Date exceeds 60-day limit
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                            END TIME <span className="text-red-600">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="HH:MM AM/PM"
                                                            value={newPackForm.endTime}
                                                            onChange={e => handleTimeChange("endTime", e.target.value)}
                                                            onBlur={e => setNewPackForm(f => ({ ...f, endTime: formatHHMM(e.target.value) }))}
                                                            className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                                        />
                                                    </div>
                                                    <div className="flex items-end">
                                                        <button
                                                            onClick={() => {
                                                                if (!newPackForm.startDate || !newPackForm.startTime || !newPackForm.endDate || !newPackForm.endTime) {
                                                                    toast.error("All date and time fields are required before applying.");
                                                                    return;
                                                                }
                                                                setAppliedDateRange({ startDate: newPackForm.startDate, startTime: newPackForm.startTime, endDate: newPackForm.endDate, endTime: newPackForm.endTime });
                                                                setDateRangeApplied(true);
                                                                setPrnMedications(defaultPrnMedications);
                                                                setOtcMedications(defaultOtcMedications);
                                                                toast.success("Date range applied. PRN and OTC sections populated.");
                                                            }}
                                                            className="h-9 px-5 rounded-full slds-text-4 font-medium text-white transition-colors"
                                                            style={{ backgroundColor: '#145F33' }}
                                                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0e4524')}
                                                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#145F33')}
                                                        >
                                                            Apply Changes
                                                        </button>
                                                    </div>
                                                </div>

                                                </div>{/* end content */}
                                            </div>

                                            {/* ── Validation banner: not yet applied ── */}
                                            {!dateRangeApplied && (
                                                <div className="flex items-center gap-2.5 rounded px-4 py-3 slds-text-4" style={{ backgroundColor: '#fef9ec', border: '1px solid #f4c97f', color: '#78520a' }}>
                                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                                    The date range must be applied prior to adding PRNs and OTCs.
                                                </div>
                                            )}

                                            {/* ── PRN Section ── */}
                                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>PRN</span>
                                                    {dateRangeApplied && (
                                                        <button
                                                            onClick={() => setIsModifyAllPrnDialogOpen(true)}
                                                            className="h-8 px-3 rounded-full slds-text-3 font-medium transition-colors"
                                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                                        >
                                                            Modify All
                                                        </button>
                                                    )}
                                                </div>

                                                {!dateRangeApplied ? (
                                                    <div className="px-4 py-8 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)', borderStyle: 'dashed' }}>
                                                        Apply a date range above to populate PRN medications.
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* PRN reminder */}
                                                        <div className="flex items-start gap-2 px-4 py-2.5 slds-text-3" style={{ backgroundColor: '#f0f7ff', borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: '#0176d3' }}>
                                                            <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                                                            Reminder: Account for all PRNs (e.g., inhalers) even if not all are being packed. Leave doses as 0 for any PRN not included.
                                                        </div>
                                                        <table className="w-full">
                                                            <thead>
                                                                <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                    <th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th>
                                                                    <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-default)' }}>Doses</th>
                                                                    <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {prnMedications.map((prn, idx) => (
                                                                    <tr key={idx} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                        <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{prn.medication}</td>
                                                                        <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{prn.doses}</td>
                                                                        <td className="px-4 py-2.5">
                                                                            <button
                                                                                onClick={() => { setSelectedPrnIndex(idx); setIsModifyPrnDialogOpen(true); }}
                                                                                className="slds-text-3 font-medium underline"
                                                                                style={{ color: '#0176d3' }}
                                                                            >
                                                                                Modify
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </>
                                                )}
                                            </div>

                                            {/* ── OTC Section ── */}
                                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>OTC</span>
                                                </div>

                                                {!dateRangeApplied ? (
                                                    <div className="px-4 py-8 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                        Apply a date range above to populate OTC medications.
                                                    </div>
                                                ) : (
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                <th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th>
                                                                <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-default)' }}>Status</th>
                                                                <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-36" style={{ color: 'var(--slds-g-color-text-default)' }}>Dose</th>
                                                                <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Quantity</th>
                                                                <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-default)' }}>Doses</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {otcMedications.map((otc, idx) => {
                                                                const notApproved = otc.status === "Not Approved";
                                                                return (
                                                                    <tr key={idx} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', opacity: notApproved ? 0.5 : 1 }}>
                                                                        <td className="px-4 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{otc.medication}</td>
                                                                        <td className="px-4 py-2.5">
                                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full slds-text-3 font-medium" style={{
                                                                                backgroundColor: notApproved ? '#fef2f2' : '#e6f2eb',
                                                                                color: notApproved ? '#c23934' : '#145F33',
                                                                                border: `1px solid ${notApproved ? '#f5c6c6' : '#a3d4b5'}`,
                                                                            }}>
                                                                                {otc.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-2.5">
                                                                            <select
                                                                                disabled={notApproved}
                                                                                value={otc.dose}
                                                                                onChange={e => setOtcMedications(prev => prev.map((o, i) => i === idx ? { ...o, dose: e.target.value } : o))}
                                                                                className="h-8 w-full px-2 rounded slds-text-3 focus:outline-none focus:ring-2 focus:ring-[#145F33] disabled:cursor-not-allowed"
                                                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                                                            >
                                                                                <option value="">Select</option>
                                                                                {otc.availableDoses.map(d => <option key={d} value={d}>{d}</option>)}
                                                                            </select>
                                                                        </td>
                                                                        <td className="px-4 py-2.5">
                                                                            <input
                                                                                type="text"
                                                                                disabled={notApproved}
                                                                                placeholder="Qty"
                                                                                value={otc.quantity}
                                                                                onChange={e => setOtcMedications(prev => prev.map((o, i) => i === idx ? { ...o, quantity: e.target.value } : o))}
                                                                                className="h-8 w-full px-2 rounded slds-text-3 focus:outline-none focus:ring-2 focus:ring-[#145F33] disabled:cursor-not-allowed"
                                                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                                                            />
                                                                        </td>
                                                                        <td className="px-4 py-2.5">
                                                                            <input
                                                                                type="text"
                                                                                disabled={notApproved}
                                                                                placeholder="#"
                                                                                value={otc.doses}
                                                                                onChange={e => setOtcMedications(prev => prev.map((o, i) => i === idx ? { ...o, doses: e.target.value } : o))}
                                                                                className="h-8 w-full px-2 rounded slds-text-3 focus:outline-none focus:ring-2 focus:ring-[#145F33] disabled:cursor-not-allowed"
                                                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>

                                        </div>
                                    );
                                })()}

                                {/* ═══════ SET PRIMARY TAB ═══════ */}
                                {createPackActiveTab === "setPrimary" && (() => {
                                    const allRows = [...setPrimaryMedRows, ...setPrimaryPrnRows, ...setPrimaryOtcRowsData];
                                    const anySelected = allRows.some(r => r.selected);
                                    const canSelect = (ps: PackStatus) => ps === "Available" || ps === "Selected";
                                    const packStatusBadge = (ps: PackStatus) => {
                                        const map: Record<PackStatus, { bg: string; color: string; border: string }> = {
                                            Available: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
                                            Selected: { bg: '#f0faf4', color: '#145F33', border: '#a3d4b5' },
                                            Dispensed: { bg: '#fef2f2', color: '#c23934', border: '#f5c6c6' },
                                            Received: { bg: '#fef9ec', color: '#92400e', border: '#fde68a' },
                                            Reviewed: { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' },
                                        };
                                        const s = map[ps];
                                        return (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full slds-text-3 font-medium whitespace-nowrap"
                                                style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                                                {ps}
                                            </span>
                                        );
                                    };

                                    // Sort helper: Pack Status priority then name (AC6, AC12, AC15)
                                    const packStatusOrder: Record<PackStatus, number> = { Available: 0, Selected: 1, Dispensed: 2, Received: 3, Reviewed: 4 };
                                    const sortByStatusName = <T extends { packStatus: PackStatus; drugName: string }>(rows: T[]): T[] =>
                                        [...rows].sort((a, b) => (packStatusOrder[a.packStatus] - packStatusOrder[b.packStatus]) || a.drugName.localeCompare(b.drugName));

                                    // Group med rows by date, each group sorted (AC6)
                                    const medGroups: Record<string, SetPrimaryMedRow[]> = {};
                                    setPrimaryMedRows.forEach(r => {
                                        const g = r.dateGroup || r.start;
                                        if (!medGroups[g]) medGroups[g] = [];
                                        medGroups[g].push(r);
                                    });
                                    // Sort within each group by Pack Status then name
                                    Object.keys(medGroups).forEach(g => { medGroups[g] = sortByStatusName(medGroups[g]); });
                                    // Sorted PRN and OTC rows (AC12, AC15)
                                    const sortedPrnRows = sortByStatusName(setPrimaryPrnRows);
                                    const sortedOtcRows = sortByStatusName(setPrimaryOtcRowsData);

                                    return (
                                        <div className="px-6 py-5 space-y-5">

                                            {/* ── Toolbar ── */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => { if (anySelected) setIsSetPrimaryModalOpen(true); else toast.error("Select at least one medication row first."); }}
                                                        className="h-9 px-4 rounded-full slds-text-4 font-medium text-white transition-colors"
                                                        style={{ backgroundColor: anySelected ? '#145F33' : 'var(--slds-g-color-neutral-95)', color: anySelected ? '#fff' : 'var(--slds-g-color-text-weak)', cursor: anySelected ? 'pointer' : 'default' }}
                                                    >
                                                        Set Primary Medication Code
                                                    </button>
                                                    <button
                                                        onClick={() => setSetPrimaryShowLog(v => !v)}
                                                        className="h-9 px-4 rounded-full slds-text-4 font-medium transition-colors flex items-center gap-1.5"
                                                        style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: setPrimaryShowLog ? '#145F33' : 'var(--slds-g-color-text-default)', backgroundColor: setPrimaryShowLog ? '#f0faf4' : 'var(--slds-g-color-background-base)' }}
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
                                                            setSetPrimaryMedRows(prev => prev.map(r => ({ ...r, selected: r.packStatus === "Available" ? true : r.selected })));
                                                            setSetPrimaryPrnRows(prev => prev.map(r => ({ ...r, selected: r.packStatus === "Available" ? true : r.selected })));
                                                            setSetPrimaryOtcRowsData(prev => prev.map(r => ({ ...r, selected: r.packStatus === "Available" ? true : r.selected })));
                                                        }}
                                                    >
                                                        Select All Available
                                                    </button>
                                                    <button
                                                        className="slds-text-3 font-medium underline"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        onClick={() => {
                                                            setSetPrimaryMedRows(prev => prev.map(r => ({ ...r, selected: false })));
                                                            setSetPrimaryPrnRows(prev => prev.map(r => ({ ...r, selected: false })));
                                                            setSetPrimaryOtcRowsData(prev => prev.map(r => ({ ...r, selected: false })));
                                                        }}
                                                    >
                                                        Deselect All
                                                    </button>
                                                </div>
                                            </div>

                                            {/* ── Log panel (toggle) ── */}
                                            {setPrimaryShowLog && (
                                                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                        <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Log</span>
                                                        <button onClick={() => setSetPrimaryShowLog(false)} style={{ color: 'var(--slds-g-color-text-weak)' }}><X className="h-4 w-4" /></button>
                                                    </div>
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                <th className="px-4 py-2 text-left slds-text-3 font-semibold w-40" style={{ color: 'var(--slds-g-color-text-default)' }}>Timestamp</th>
                                                                <th className="px-4 py-2 text-left slds-text-3 font-semibold w-44" style={{ color: 'var(--slds-g-color-text-default)' }}>User</th>
                                                                <th className="px-4 py-2 text-left slds-text-3 font-semibold w-32" style={{ color: 'var(--slds-g-color-text-default)' }}>Action</th>
                                                                <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Detail</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {setPrimaryLogEntries.length === 0 ? (
                                                                <tr><td colSpan={4} className="px-4 py-6 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No log entries yet</td></tr>
                                                            ) : (
                                                                [...setPrimaryLogEntries].reverse().map(e => (
                                                                    <tr key={e.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                        <td className="px-4 py-2 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{e.timestamp}</td>
                                                                        <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{e.user}</td>
                                                                        <td className="px-4 py-2"><span className="inline-block slds-text-3 px-2 py-0.5 rounded-full" style={{ backgroundColor: '#e6f2eb', color: '#145F33' }}>{e.action}</span></td>
                                                                        <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{e.detail}</td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}

                                            {/* ── Medications Grid ── */}
                                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medications</span>
                                                </div>
                                                <table className="w-full">
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <th className="px-4 py-2.5 w-10" />
                                                            <th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th>
                                                            <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-default)' }}>Start</th>
                                                            <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-default)' }}>Stop</th>
                                                            <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Pack Status</th>
                                                            <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-36" style={{ color: 'var(--slds-g-color-text-default)' }}>Primary Code</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.entries(medGroups).sort(([a], [b]) => a.localeCompare(b)).map(([dateGroup, rows]) => (
                                                            <>
                                                                {/* Date group header */}
                                                                <tr key={`dg-${dateGroup}`} style={{ backgroundColor: '#eef2f7', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                    <td colSpan={6} className="px-4 py-1.5 slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>{dateGroup}</td>
                                                                </tr>
                                                                {/* Rows grouped by dose period */}
                                                                {["Morning", "Afternoon", "Evening", "Bedtime", ""].map(period => {
                                                                    const periodRows = rows.filter(r => (r.dosePeriod || "") === period);
                                                                    if (periodRows.length === 0) return null;
                                                                    return (
                                                                        <>
                                                                            {period && (
                                                                                <tr key={`dp-${dateGroup}-${period}`} style={{ backgroundColor: '#f8f9fb', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                                    <td colSpan={6} className="px-6 py-1 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)', fontStyle: 'italic' }}>{period}</td>
                                                                                </tr>
                                                                            )}
                                                                            {periodRows.map(row => {
                                                                                const inactive = !canSelect(row.packStatus);
                                                                                return (
                                                                                    <tr
                                                                                        key={row.id}
                                                                                        style={{
                                                                                            borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                                                                                            backgroundColor: row.outOfRange ? '#fffbeb' : row.selected ? '#f0faf4' : 'white',
                                                                                            opacity: inactive ? 0.5 : 1,
                                                                                        }}
                                                                                    >
                                                                                        <td className="px-4 py-2 text-center">
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={row.selected}
                                                                                                disabled={inactive}
                                                                                                onChange={() => setSetPrimaryMedRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: !r.selected } : r))}
                                                                                                style={{ accentColor: '#145F33', cursor: inactive ? 'not-allowed' : 'pointer' }}
                                                                                            />
                                                                                        </td>
                                                                                        <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                                            {row.drugName}
                                                                                            {row.outOfRange && <span className="ml-2 slds-text-3 px-1.5 py-0.5 rounded" style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>Out of range</span>}
                                                                                        </td>
                                                                                        <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.start}</td>
                                                                                        <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.stop}</td>
                                                                                        <td className="px-4 py-2">{packStatusBadge(row.packStatus)}</td>
                                                                                        <td className="px-4 py-2 slds-text-4" style={{ color: row.primaryCode ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>{row.primaryCode || "—"}</td>
                                                                                    </tr>
                                                                                );
                                                                            })}
                                                                        </>
                                                                    );
                                                                })}
                                                            </>
                                                        ))}
                                                        {setPrimaryMedRows.length === 0 && (
                                                            <tr><td colSpan={6} className="px-4 py-8 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No medications. Complete the Doses tab first.</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                                {setPrimaryMedRows.length > 0 && (
                                                    <div className="px-4 py-2 slds-text-3 flex items-center gap-2" style={{ backgroundColor: '#fffbeb', borderTop: '1px solid var(--slds-g-color-border-base-1)', color: '#92400e' }}>
                                                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                                                        Amber-highlighted rows fall outside the pack date range by up to 24 hours and require staff review.
                                                    </div>
                                                )}
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
                                                            <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-default)' }}>Start</th>
                                                            <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-default)' }}>Stop</th>
                                                            <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Pack Status</th>
                                                            <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-36" style={{ color: 'var(--slds-g-color-text-default)' }}>Primary Code</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sortedPrnRows.length === 0 ? (
                                                            <tr><td colSpan={6} className="px-4 py-8 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No PRN medications. Complete the Doses tab first.</td></tr>
                                                        ) : (
                                                            sortedPrnRows.map(row => {
                                                                const inactive = !canSelect(row.packStatus);
                                                                return (
                                                                    <tr key={row.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: row.selected ? '#f0faf4' : 'white', opacity: inactive ? 0.5 : 1 }}>
                                                                        <td className="px-4 py-2 text-center">
                                                                            <input type="checkbox" checked={row.selected} disabled={inactive}
                                                                                onChange={() => setSetPrimaryPrnRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: !r.selected } : r))}
                                                                                style={{ accentColor: '#145F33', cursor: inactive ? 'not-allowed' : 'pointer' }} />
                                                                        </td>
                                                                        <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.drugName}</td>
                                                                        <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.start}</td>
                                                                        <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.stop}</td>
                                                                        <td className="px-4 py-2">{packStatusBadge(row.packStatus)}</td>
                                                                        <td className="px-4 py-2 slds-text-4" style={{ color: row.primaryCode ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>{row.primaryCode || "—"}</td>
                                                                    </tr>
                                                                );
                                                            })
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* ── OTC Section ── */}
                                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>OTC</span>
                                                </div>
                                                <table className="w-full">
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <th className="px-4 py-2.5 w-10" />
                                                            <th className="px-4 py-2.5 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th>
                                                            <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-default)' }}>Dose</th>
                                                            <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-24" style={{ color: 'var(--slds-g-color-text-default)' }}>Quantity</th>
                                                            <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-28" style={{ color: 'var(--slds-g-color-text-default)' }}>Pack Status</th>
                                                            <th className="px-4 py-2.5 text-left slds-text-3 font-semibold w-36" style={{ color: 'var(--slds-g-color-text-default)' }}>Primary Code</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sortedOtcRows.length === 0 ? (
                                                            <tr><td colSpan={6} className="px-4 py-8 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No OTC medications. Complete the Doses tab first.</td></tr>
                                                        ) : (
                                                            sortedOtcRows.map(row => {
                                                                const inactive = !canSelect(row.packStatus);
                                                                return (
                                                                    <tr key={row.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: row.selected ? '#f0faf4' : 'white', opacity: inactive ? 0.5 : 1 }}>
                                                                        <td className="px-4 py-2 text-center">
                                                                            <input type="checkbox" checked={row.selected} disabled={inactive}
                                                                                onChange={() => setSetPrimaryOtcRowsData(prev => prev.map(r => r.id === row.id ? { ...r, selected: !r.selected } : r))}
                                                                                style={{ accentColor: '#145F33', cursor: inactive ? 'not-allowed' : 'pointer' }} />
                                                                        </td>
                                                                        <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{row.drugName}</td>
                                                                        <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.dose}</td>
                                                                        <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>{row.quantity}</td>
                                                                        <td className="px-4 py-2">{packStatusBadge(row.packStatus)}</td>
                                                                        <td className="px-4 py-2 slds-text-4" style={{ color: row.primaryCode ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>{row.primaryCode || "—"}</td>
                                                                    </tr>
                                                                );
                                                            })
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                        </div>
                                    );
                                })()}

                                {/* ═══════ PACKING PREP TAB ═══════ */}
                                {/* ═══════ PACKING PREP TAB ═══════ */}
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

                                    // Label printing: OTC rows excluded from label output
                                    // Labels button: validate selection, then open Select Label Style modal
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

                                    // Label print generator — shared content, style-specific sizing
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

                                        // Group daily meds: date → dose period → [medications]
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
                                                .forEach(period => {
                                                    labelGroups.push({ dateStr, period, meds: byDatePeriod[dateStr][period] });
                                                });
                                        });

                                        // Sheet: Avery 5162 — 4" × 2", 2 cols × 5 rows = 10 per page (AC18)
                                        // Individual: 2.4" × 3.9" per label (AC19)
                                        const isSheet = style === "sheet";

                                        // AC14: reduce medication font size based on line count rather than truncating
                                        const medFontSize = (lineCount: number): string => {
                                            if (isSheet) {
                                                if (lineCount <= 3) return '7pt';
                                                if (lineCount <= 5) return '6pt';
                                                return '5pt';
                                            }
                                            if (lineCount <= 3) return '8.5pt';
                                            if (lineCount <= 5) return '7pt';
                                            return '6pt';
                                        };

                                        // Daily med label — includes time range
                                        const buildDailyLabelHtml = (youthName: string, period: string, dateAbbr: string, timeRange: string, medLines: string, lineCount: number): string => {
                                            const lw = isSheet ? '4in' : '2.4in';
                                            const lh = isSheet ? '2in' : '3.9in';
                                            const pad = isSheet ? '6pt 8pt' : '10pt 12pt';
                                            const extra = isSheet ? '' : 'page-break-after:always;';
                                            return `<div style="width:${lw};height:${lh};display:${isSheet ? 'inline-block' : 'block'};vertical-align:top;padding:${pad};box-sizing:border-box;border:0.5pt solid #dddbda;font-family:Arial,sans-serif;${extra}">
                                              <div style="font-size:${isSheet ? '7.5' : '9'}pt;font-weight:bold;color:#3e3e3c;border-bottom:0.5pt solid #145F33;padding-bottom:2pt;margin-bottom:3pt">${youthName}</div>
                                              <div style="font-size:${isSheet ? '7' : '8.5'}pt;color:#706e6b;margin-bottom:1pt"><strong style="color:#145F33">${period}</strong> &nbsp;|&nbsp; ${dateAbbr}</div>
                                              <div style="font-size:${isSheet ? '6.5' : '8'}pt;color:#706e6b;margin-bottom:3pt">${timeRange}</div>
                                              <div style="font-size:${medFontSize(lineCount)};color:#3e3e3c;line-height:1.35">${medLines}</div>
                                            </div>`;
                                        };

                                        // PRN label — NO time range, NO date (AC16)
                                        const buildPrnLabelHtml = (youthName: string, medLine: string): string => {
                                            const lw = isSheet ? '4in' : '2.4in';
                                            const lh = isSheet ? '2in' : '3.9in';
                                            const pad = isSheet ? '6pt 8pt' : '10pt 12pt';
                                            const extra = isSheet ? '' : 'page-break-after:always;';
                                            return `<div style="width:${lw};height:${lh};display:${isSheet ? 'inline-block' : 'block'};vertical-align:top;padding:${pad};box-sizing:border-box;border:0.5pt solid #dddbda;font-family:Arial,sans-serif;${extra}">
                                              <div style="font-size:${isSheet ? '7.5' : '9'}pt;font-weight:bold;color:#3e3e3c;border-bottom:0.5pt solid #145F33;padding-bottom:2pt;margin-bottom:3pt">${youthName}</div>
                                              <div style="font-size:${isSheet ? '7' : '8.5'}pt;color:#706e6b;margin-bottom:3pt"><strong style="color:#145F33">PRN</strong> &nbsp;|&nbsp; ALL DAY</div>
                                              <div style="font-size:${isSheet ? '7' : '8.5'}pt;color:#3e3e3c;line-height:1.35">${medLine}</div>
                                            </div>`;
                                        };

                                        const youthName = packOwnerName;
                                        let labelsHtml = '';

                                        // Daily medication labels (one per dose period per day)
                                        labelGroups.forEach(({ dateStr, period, meds }) => {
                                            const t = dosePeriodTimes[period] || { start: '—', end: '—' };
                                            const timeRange = `${t.start} – ${t.end}`;
                                            const dateAbbr = formatAbbrevDate(dateStr);
                                            const medLines = meds.map(m => `• ${m.drugName}`).join('<br>');
                                            labelsHtml += buildDailyLabelHtml(youthName, period, dateAbbr, timeRange, medLines, meds.length);
                                        });

                                        // PRN labels (one per PRN dose entry) — no time range (AC16), one per entry (AC17)
                                        [...selPrn].sort((a, b) => a.drugName.localeCompare(b.drugName)).forEach(r => {
                                            labelsHtml += buildPrnLabelHtml(youthName, `• ${r.drugName}`);
                                        });

                                        // AC18: Avery 5162 — letter page, top/bottom 0.5in, left/right 0.19in; labels 4in × 2in in 2-col flex
                                        // AC19: individual page sized exactly to label: 2.4in × 3.9in
                                        const pageStyle = isSheet
                                            ? `@page{size:letter portrait;margin:0.5in 0.19in}body{margin:0;padding:0}.page{width:100%;display:flex;flex-wrap:wrap;justify-content:space-between}`
                                            : `@page{size:2.4in 3.9in portrait;margin:0}body{margin:0;padding:0}`;

                                        const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>Medication Labels${isSheet ? ' — Sheet (Avery 5162)' : ' — Individual'}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
${pageStyle}
</style></head>
<body><div class="${isSheet ? 'page' : ''}">${labelsHtml}</div></body></html>`;

                                        const win = window.open('', '_blank', `width=${isSheet ? 900 : 500},height=${isSheet ? 1100 : 700},scrollbars=yes`);
                                        if (win) {
                                            win.document.write(html);
                                            win.document.close();
                                            setTimeout(() => { win.focus(); win.print(); }, 350);
                                        } else {
                                            toast.error("Pop-up blocked. Please allow pop-ups for this site and try again.");
                                        }
                                    };

                                    // Checklist: generate print-ready document for all pack contents
                                    const handleChecklist = () => {
                                        if (prepMedRows.length === 0 && prepPrnRows.length === 0 && prepOtcRows.length === 0) {
                                            toast.error("No medications in this pack to generate a checklist.");
                                            return;
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
                                            const date = new Date(y, m - 1, d);
                                            return formatMdy(date);
                                        };

                                        // Group daily meds by date → dose period, sorted by dose period order
                                        const medByDate: Record<string, Record<string, typeof prepMedRows>> = {};
                                        prepMedRows.forEach(r => {
                                            const dg = r.dateGroup || r.start;
                                            const dp = r.dosePeriod || 'Morning';
                                            if (!medByDate[dg]) medByDate[dg] = {};
                                            if (!medByDate[dg][dp]) medByDate[dg][dp] = [];
                                            medByDate[dg][dp].push(r);
                                        });

                                        let dailyHTML = '';
                                        Object.keys(medByDate).sort().forEach(dateStr => {
                                            dailyHTML += `<tr class="date-hdr"><td colspan="5">${formatFullDate(dateStr)}</td></tr>`;
                                            const periods = Object.keys(medByDate[dateStr]).sort((a, b) => (dosePeriodOrder[a] ?? 9) - (dosePeriodOrder[b] ?? 9));
                                            periods.forEach(period => {
                                                dailyHTML += `<tr class="period-hdr"><td colspan="5">${period}</td></tr>`;
                                                [...medByDate[dateStr][period]].sort((a, b) => a.drugName.localeCompare(b.drugName)).forEach(r => {
                                                    const t = dosePeriodTimes[period] || { start: '—', end: '—' };
                                                    dailyHTML += `<tr class="day-row"><td class="med-name"><em>${r.drugName}</em></td><td>—</td><td>${t.start}</td><td>${t.end}</td><td class="chk"><span class="cb"></span></td></tr>`;
                                                });
                                            });
                                        });

                                        // Calculate pack days so PRN/OTC rows repeat per dose per day (AC18, AC23)
                                        const calcPackDays = (): number => {
                                            const sd = appliedDateRange.startDate;
                                            const ed = appliedDateRange.endDate;
                                            if (!sd || !ed) return 1;
                                            const [sm, sdd, sy] = sd.split('/').map(Number);
                                            const [em, ed2, ey] = ed.split('/').map(Number);
                                            const start = new Date(sy, sm - 1, sdd);
                                            const end   = new Date(ey, em - 1, ed2);
                                            const diff  = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
                                            return Math.max(1, diff);
                                        };
                                        const packDays = calcPackDays();

                                        // PRN: group by medication name subheader, sort alphabetically; each row repeats per pack day (AC18)
                                        let prnHTML = '';
                                        const prnByName: Record<string, typeof prepPrnRows> = {};
                                        [...prepPrnRows].sort((a, b) => a.drugName.localeCompare(b.drugName)).forEach(r => {
                                            if (!prnByName[r.drugName]) prnByName[r.drugName] = [];
                                            prnByName[r.drugName].push(r);
                                        });
                                        Object.keys(prnByName).sort().forEach(name => {
                                            prnHTML += `<tr class="period-hdr"><td colspan="4">${name}</td></tr>`;
                                            prnByName[name].forEach(() => {
                                                for (let day = 0; day < packDays; day++) {
                                                    prnHTML += `<tr><td>—</td><td>12:00 AM</td><td>11:59 PM</td><td class="chk"><span class="cb"></span></td></tr>`;
                                                }
                                            });
                                        });

                                        // OTC: group by medication name subheader, sort alphabetically; each row repeats per pack day (AC23)
                                        let otcHTML = '';
                                        const otcByName: Record<string, typeof prepOtcRows> = {};
                                        [...prepOtcRows].sort((a, b) => a.drugName.localeCompare(b.drugName)).forEach(r => {
                                            if (!otcByName[r.drugName]) otcByName[r.drugName] = [];
                                            otcByName[r.drugName].push(r);
                                        });
                                        Object.keys(otcByName).sort().forEach(name => {
                                            otcHTML += `<tr class="period-hdr"><td colspan="4">${name}</td></tr>`;
                                            otcByName[name].forEach(r => {
                                                for (let day = 0; day < packDays; day++) {
                                                    otcHTML += `<tr><td>${r.dose}</td><td>—</td><td>—</td><td class="chk"><span class="cb"></span></td></tr>`;
                                                }
                                            });
                                        });

                                        const startLabel = [appliedDateRange.startDate, appliedDateRange.startTime].filter(Boolean).join(' ') || '—';
                                        const endLabel   = [appliedDateRange.endDate,   appliedDateRange.endTime  ].filter(Boolean).join(' ') || '—';

                                        const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>Pack Medication Checklist</title>
<style>
@page {
  size: letter portrait;
  margin: 0.5in 0.5in 0.68in 0.5in;
}
@page { @bottom-left { content: "Run Date: ${runDate}"; font-family: Arial,sans-serif; font-size: 8pt; color: #706e6b; } }
@page { @bottom-right { content: "Page " counter(page) " of " counter(pages); font-family: Arial,sans-serif; font-size: 8pt; color: #706e6b; } }
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;font-size:10pt;color:#3e3e3c}
.header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:8pt;margin-bottom:12pt;border-bottom:2pt solid #145F33}
.logo-name{font-size:16pt;font-weight:bold;color:#145F33;line-height:1}
.logo-sub{font-size:8pt;color:#706e6b;margin-top:2pt}
.hdr-right{text-align:right}
.doc-title{font-size:13pt;font-weight:bold;color:#3e3e3c;margin-bottom:5pt}
.hdr-meta{font-size:9pt;color:#3e3e3c;line-height:1.7}
.hdr-meta strong{font-weight:600}
.youth{font-size:12pt;font-weight:bold;color:#145F33;margin-top:6pt}
table{width:100%;border-collapse:collapse;font-size:9pt;margin-bottom:14pt;page-break-inside:auto}
thead{display:table-header-group}
th{background:#f4f6f9;color:#706e6b;font-size:7.5pt;font-weight:600;text-transform:uppercase;letter-spacing:.04em;padding:5pt 7pt;border-bottom:1.5pt solid #dddbda;text-align:left;white-space:nowrap}
td{padding:4pt 7pt;border-bottom:.5pt solid #e5e5e5;color:#3e3e3c;vertical-align:middle}
tr.section-hdr td{background:#145F33;color:#fff;font-weight:bold;font-size:9.5pt;padding:5pt 7pt}
tr.date-hdr td{background:#e6f2eb;color:#0e4524;font-weight:bold;font-size:9pt;padding:4pt 7pt;border-top:1pt solid #a3d4b5;border-bottom:1pt solid #a3d4b5}
tr.day-row td{background:#f4f4f4;color:#3e3e3c}
tr.period-hdr td{background:#e5e5e5;color:#3e3e3c;font-weight:600;font-size:8.5pt;padding:3pt 7pt 3pt 12pt;border-bottom:.5pt solid #d0d0d0}
tr.day-row td{background:#fff;color:#3e3e3c}
.med-name em{font-style:italic}
.chk{width:44pt;text-align:center}
.cb{display:inline-block;width:10pt;height:10pt;border:1pt solid #3e3e3c}
</style></head>
<body>
<div class="header">
  <div>
    <div class="logo-name">Mercy Home</div>
    <div class="logo-sub">for Boys &amp; Girls</div>
    <div class="youth">${packOwnerName}</div>
  </div>
  <div class="hdr-right">
    <div class="doc-title">Pack Medication Checklist</div>
    <div class="hdr-meta">
      <strong>Start Date:</strong> ${startLabel}<br>
      <strong>End Date:</strong> ${endLabel}
    </div>
  </div>
</div>

<table>
  <thead>
    <tr class="section-hdr"><td colspan="5">Daily Medications</td></tr>
    <tr><th>Medication Name</th><th>Dose</th><th>Start Time</th><th>End Time</th><th class="chk">Complete</th></tr>
  </thead>
  <tbody>
    ${dailyHTML || '<tr><td colspan="5" style="text-align:center;color:#706e6b;padding:12pt 7pt">No daily medications in this pack.</td></tr>'}
  </tbody>
</table>

${prnHTML ? `<table>
  <thead>
    <tr class="section-hdr"><td colspan="4">PRN Medications</td></tr>
    <tr><th>Dose</th><th>Start Time</th><th>End Time</th><th class="chk">Complete</th></tr>
  </thead>
  <tbody>${prnHTML}</tbody>
</table>` : ''}

${otcHTML ? `<table>
  <thead>
    <tr class="section-hdr"><td colspan="4">OTC Medications</td></tr>
    <tr><th>Dose</th><th>Start Time</th><th>End Time</th><th class="chk">Complete</th></tr>
  </thead>
  <tbody>${otcHTML}</tbody>
</table>` : ''}
</body></html>`;

                                        const win = window.open('', '_blank', 'width=900,height=1100,scrollbars=yes');
                                        if (win) {
                                            win.document.write(html);
                                            win.document.close();
                                            setTimeout(() => { win.focus(); win.print(); }, 350);
                                        } else {
                                            toast.error("Pop-up blocked. Please allow pop-ups for this site and try again.");
                                        }
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
                                                        onClick={() => setPackingPrepInnerTab(showLog ? "checklist" : "log")}
                                                        className="h-9 px-4 rounded-full slds-text-4 font-medium transition-colors flex items-center gap-1.5"
                                                        style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: showLog ? '#145F33' : 'var(--slds-g-color-text-default)', backgroundColor: showLog ? '#f0faf4' : 'var(--slds-g-color-background-base)' }}
                                                    >
                                                        <FileText className="h-3.5 w-3.5" />
                                                        Log
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {/* Select All Selected: only rows with PackStatus === "Selected" */}
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

                                            {/* ── Log panel (toggleable via Log button) ── */}
                                            {showLog && (
                                                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                        <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Log</span>
                                                        <button onClick={() => setPackingPrepInnerTab("checklist")} style={{ color: 'var(--slds-g-color-text-weak)' }}><X className="h-4 w-4" /></button>
                                                    </div>
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                <th className="px-4 py-2 text-left slds-text-3 font-semibold w-40" style={{ color: 'var(--slds-g-color-text-default)' }}>Timestamp</th>
                                                                <th className="px-4 py-2 text-left slds-text-3 font-semibold w-44" style={{ color: 'var(--slds-g-color-text-default)' }}>User</th>
                                                                <th className="px-4 py-2 text-left slds-text-3 font-semibold w-32" style={{ color: 'var(--slds-g-color-text-default)' }}>Action</th>
                                                                <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Detail</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {setPrimaryLogEntries.length === 0 ? (
                                                                <tr><td colSpan={4} className="px-4 py-6 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No log entries for this pack</td></tr>
                                                            ) : (
                                                                [...setPrimaryLogEntries].reverse().map(e => (
                                                                    <tr key={e.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                        <td className="px-4 py-2 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{e.timestamp}</td>
                                                                        <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{e.user}</td>
                                                                        <td className="px-4 py-2"><span className="inline-block slds-text-3 px-2 py-0.5 rounded-full" style={{ backgroundColor: '#e6f2eb', color: '#145F33' }}>{e.action}</span></td>
                                                                        <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{e.detail}</td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}

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
                                                                <>
                                                                    <tr key={`pp-dg-${dateGroup}`} style={{ backgroundColor: '#eef2f7', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                        <td colSpan={5} className="px-4 py-1.5 slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>{dateGroup}</td>
                                                                    </tr>
                                                                    {["Morning", "Afternoon", "Evening", "Bedtime", ""].map(period => {
                                                                        const periodRows = rows.filter(r => (r.dosePeriod || "") === period);
                                                                        if (periodRows.length === 0) return null;
                                                                        return (
                                                                            <>
                                                                                {period && (
                                                                                    <tr key={`pp-dp-${dateGroup}-${period}`} style={{ backgroundColor: '#f8f9fb', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
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
                                                                            </>
                                                                        );
                                                                    })}
                                                                </>
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

                                        {/* Select Label Style Modal */}
                                        <Dialog open={isLabelStyleModalOpen} onOpenChange={open => { if (!open) setIsLabelStyleModalOpen(false); }}>
                                            <DialogContent className="max-w-sm" style={{ maxHeight: "90vh" }}>
                                                <DialogHeader>
                                                    <DialogTitle className="slds-text-6 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
                                                        Select Label Style
                                                    </DialogTitle>
                                                </DialogHeader>

                                                <div className="py-4 space-y-3">
                                                    <p className="slds-text-4" style={{ color: "var(--slds-g-color-text-weak)" }}>
                                                        Choose the label format to use for printing.
                                                    </p>

                                                    <button
                                                        onClick={() => generateLabelPrint("sheet")}
                                                        className="w-full flex items-start rounded-lg px-4 py-3 text-left transition-colors"
                                                        style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)" }}
                                                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-alt)")}
                                                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-base)")}
                                                    >
                                                        <div>
                                                            <p className="slds-text-4 font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>Sheet Labels</p>
                                                            <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>Avery 5162 — 2" × 4", 10 per page</p>
                                                        </div>
                                                    </button>

                                                    <button
                                                        onClick={() => generateLabelPrint("individual")}
                                                        className="w-full flex items-start rounded-lg px-4 py-3 text-left transition-colors"
                                                        style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)" }}
                                                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-alt)")}
                                                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-base)")}
                                                    >
                                                        <div>
                                                            <p className="slds-text-4 font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>Individual Labels</p>
                                                            <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>2.4" × 3.9" per label</p>
                                                        </div>
                                                    </button>
                                                </div>

                                                <DialogFooter>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setIsLabelStyleModalOpen(false)}
                                                        className="rounded-full h-9 slds-text-4 font-medium px-5"
                                                        style={{ borderColor: "var(--slds-g-color-border-base-1)", color: "var(--slds-g-color-text-default)" }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                        </React.Fragment>
                                    );
                                })()}

                                {/* ═══════ DISPENSE TAB ═══════ */}
                                {createPackActiveTab === "dispense" && (() => {
                                    const isNonSelectable = (status: string) =>
                                        status === "Dispensed" || status === "Received" || status === "Reviewed";

                                    const showLog = dispenseInnerTab === "log";
                                    // reprintLabels value repurposed as attestation-pending state
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
                                        if (!hasAnySelected) {
                                            toast.warning("Select at least one medication row before dispensing.");
                                            return;
                                        }
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

                                    const handleAttestationCancel = () => {
                                        setDispenseInnerTab("staffDispensed");
                                    };

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
                                                            onClick={() => setDispenseInnerTab(showLog ? "staffDispensed" : "log")}
                                                            className="h-9 px-4 rounded-full slds-text-4 font-medium transition-colors flex items-center gap-1.5"
                                                            style={{
                                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                                color: showLog ? '#145F33' : 'var(--slds-g-color-text-default)',
                                                                backgroundColor: showLog ? '#f0faf4' : 'var(--slds-g-color-background-base)',
                                                            }}
                                                        >
                                                            <FileText className="h-3.5 w-3.5" />
                                                            Log
                                                        </button>
                                                    </div>
                                                    {!showLog && (
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
                                                    )}
                                                </div>

                                                {/* Inline Attestation */}
                                                {showAttestation && (
                                                    <div className="flex items-center gap-3 flex-wrap px-4 py-2 rounded-lg" style={{ backgroundColor: '#fff8e1', border: '1px solid #ffe082' }}>
                                                        <span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            I attest that I have reviewed and am dispensing the selected medications to the youth as documented.
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

                                            {/* Log Panel */}
                                            {showLog && (
                                                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                        <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Dispense Log</span>
                                                        <button onClick={() => setDispenseInnerTab("staffDispensed")} style={{ color: 'var(--slds-g-color-text-weak)' }}><X className="h-4 w-4" /></button>
                                                    </div>
                                                    {dispenseLogEntries.length === 0 ? (
                                                        <div className="px-4 py-8 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No log records found.</div>
                                                    ) : (
                                                        <div className="divide-y" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                            {dispenseLogEntries.map(entry => (
                                                                <div key={entry.id} className="px-4 py-3 flex items-start gap-4">
                                                                    <div className="flex-shrink-0 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: 160 }}>{entry.timestamp}</div>
                                                                    <div className="flex-shrink-0 slds-text-3 font-medium" style={{ color: '#145F33', minWidth: 80 }}>{entry.action}</div>
                                                                    <div className="flex-1 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{entry.detail}</div>
                                                                    <div className="flex-shrink-0 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{entry.user}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Medication Grids */}
                                            {!showLog && (
                                                <div className="space-y-5">
                                                    {/* Prescribed Medications */}
                                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                        <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Prescribed Medications</span>
                                                        </div>
                                                        <div>
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
                                                                            <>
                                                                                <tr key={`date-${date}`} style={{ backgroundColor: '#eef2f7', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
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
                                                                            </>
                                                                        ))
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>

                                                    {/* PRN Grid */}
                                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                        <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>PRN</span>
                                                        </div>
                                                        <div>
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
                                                    </div>

                                                    {/* OTC Grid */}
                                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                        <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>OTC</span>
                                                        </div>
                                                        <div>
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
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* ═══════ COUNT TAB ═══════ */}
                                {/* ═══════ COUNT TAB ═══════ */}
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

                                    const handleSubmit = () => {
                                        if (!hasUnsavedChanges) return;
                                        setCountRows(prev => prev.map(r =>
                                            r.currentCount !== "" || r.comments !== "" ? { ...r, selected: true } : r
                                        ));
                                    };

                                    const handleAttestationConfirm = () => {
                                        const updatedCount = countRows.filter(r => r.selected).length;
                                        setCountRows(prev => prev.map(r =>
                                            r.selected ? { ...r, lastCount: r.currentCount || r.lastCount, currentCount: "", comments: "", selected: false } : r
                                        ));
                                        toast.success(`Count submitted for ${updatedCount} medication${updatedCount !== 1 ? 's' : ''}.`);
                                    };

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
                                                                                        // Enforce 999.99: max 3 leading digits, max 2 decimal places
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
                                                <p className="slds-text-3 italic" style={{ color: 'var(--slds-g-color-text-weak)', maxWidth: '320px', textAlign: 'right' }}>
                                                    I attest that I have followed the policies and procedure of Medicine Dispensation &amp; Documentation.
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

                                {/* ═══════ HAND OFF TAB ═══════ */}
                                {createPackActiveTab === "handOff" && (() => {
                                    // AC3/AC5: Include Selected status as selectable
                                    const isSelectable = (status: string) => status === "Dispensed" || status === "Selected" || status === "Active";
                                    
                                    // AC7: Group by Date, then Dose Period, sort by PackStatus then Drug Name
                                    const statusOrder: Record<string, number> = { "Dispensed": 0, "Selected": 1, "Active": 1, "Received": 2, "Reviewed": 3 };
                                    const dosePeriodOrder: Record<string, number> = { "Morning": 0, "Afternoon": 1, "Evening": 2 };
                                    
                                    // Group medications by Date and Dose Period
                                    const groupedMedRows = handOffMedRows.reduce((acc, row) => {
                                        const key = `${row.dateGroup || ""}|${row.dosePeriod || ""}`;
                                        if (!acc[key]) acc[key] = [];
                                        acc[key].push(row);
                                        return acc;
                                    }, {} as Record<string, HandOffRow[]>);
                                    
                                    // Sort each group by PackStatus then Drug Name
                                    Object.keys(groupedMedRows).forEach(key => {
                                        groupedMedRows[key].sort((a, b) => 
                                            ((statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9)) || 
                                            a.drugName.localeCompare(b.drugName)
                                        );
                                    });
                                    
                                    // Sort groups by Date then Dose Period
                                    const sortedGroupKeys = Object.keys(groupedMedRows).sort((a, b) => {
                                        const [dateA, periodA] = a.split("|");
                                        const [dateB, periodB] = b.split("|");
                                        const dateCompare = dateA.localeCompare(dateB);
                                        if (dateCompare !== 0) return dateCompare;
                                        return (dosePeriodOrder[periodA] ?? 99) - (dosePeriodOrder[periodB] ?? 99);
                                    });
                                    
                                    // AC8/AC9: Sort PRN/OTC by PackStatus then Drug Name
                                    const sortByStatus = <T extends { status: string; drugName: string }>(rows: T[]): T[] =>
                                        [...rows].sort((a, b) => ((statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9)) || a.drugName.localeCompare(b.drugName));

                                    const sortedPrnRows = sortByStatus(handOffPrnRows);
                                    const sortedOtcRows = sortByStatus(handOffOtcRows);

                                    const anySelected = [...handOffMedRows, ...handOffPrnRows, ...handOffOtcRows].some(r => r.selected && isSelectable(r.status));

                                    const handleYouthReceived = () => {
                                        if (!anySelected) {
                                            toast.error("Select at least one medication row before proceeding.");
                                            return;
                                        }
                                        setIsYouthReceivedModalOpen(true);
                                    };

                                    const handleYouthReceivedSubmit = () => {
                                        // Validation
                                        if (youthReceivedToggle === "otherRecipient") {
                                            if (!recipientType) {
                                                toast.error("Recipient Type is required when Other Recipient is selected.");
                                                return;
                                            }
                                            if (recipientType === "Other" && !recipientName.trim()) {
                                                toast.error("Name is required when Recipient Type is Other.");
                                                return;
                                            }
                                        }

                                        // Generate log and attestation for each selected medication
                                        const selectedMeds = [
                                            ...handOffMedRows.filter(r => r.selected && isSelectable(r.status)),
                                            ...handOffPrnRows.filter(r => r.selected && isSelectable(r.status)),
                                            ...handOffOtcRows.filter(r => r.selected && isSelectable(r.status))
                                        ];

                                        // Update PackStatus to "Received"
                                        setHandOffMedRows(prev => prev.map(r => r.selected && isSelectable(r.status) ? { ...r, status: "Received", selected: false } : r));
                                        setHandOffPrnRows(prev => prev.map(r => r.selected && isSelectable(r.status) ? { ...r, status: "Received", selected: false } : r));
                                        setHandOffOtcRows(prev => prev.map(r => r.selected && isSelectable(r.status) ? { ...r, status: "Received", selected: false } : r));

                                        // Close modal and reset form
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
                                                        onClick={() => setHandOffInnerTab(handOffInnerTab === "log" ? "youthReceived" : "log")}
                                                        className="h-9 px-4 rounded-full slds-text-4 font-medium transition-colors flex items-center gap-1.5"
                                                        style={{
                                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                                            color: handOffInnerTab === "log" ? '#145F33' : 'var(--slds-g-color-text-default)',
                                                            backgroundColor: handOffInnerTab === "log" ? '#f0faf4' : 'var(--slds-g-color-background-base)'
                                                        }}
                                                    >
                                                        <FileText className="h-3.5 w-3.5" />
                                                        Log
                                                    </button>
                                                </div>

                                                {handOffInnerTab === "youthReceived" && (
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
                                                )}
                                            </div>

                                            {/* Main Content Area */}
                                            {handOffInnerTab === "youthReceived" ? (
                                                <div className="space-y-5">
                                                    {/* Medication Ready for Youth Grid - AC7: Grouped by Date, then Dose Period */}
                                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                        <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication Ready for Youth</span>
                                                        </div>
                                                        <div>
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
                                                                                    {/* Date subheader — only rendered when date changes */}
                                                                                    {showDateHeader && (
                                                                                        <tr style={{ backgroundColor: '#eef2f7', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                                            <td colSpan={5} className="px-4 py-1.5 slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                                                {date}
                                                                                            </td>
                                                                                        </tr>
                                                                                    )}
                                                                                    {/* Dosing period sub-row */}
                                                                                    {period && (
                                                                                        <tr style={{ backgroundColor: '#f8f9fb', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                                            <td colSpan={5} className="px-6 py-1 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)', fontStyle: 'italic' }}>{period}</td>
                                                                                        </tr>
                                                                                    )}
                                                                                    {/* Group Rows */}
                                                                                    {rows.map((row) => {
                                                                                        const inactive = !isSelectable(row.status);
                                                                                        return (
                                                                                            <tr key={row.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', opacity: inactive ? 0.45 : 1, backgroundColor: row.selected ? '#f0faf4' : 'white' }}>
                                                                                                <td className="px-4 py-2.5 text-center">
                                                                                                    <input
                                                                                                        type="checkbox"
                                                                                                        checked={row.selected}
                                                                                                        disabled={inactive}
                                                                                                        onChange={(e) => setHandOffMedRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: e.target.checked } : r))}
                                                                                                        className="w-4 h-4"
                                                                                                        style={{ accentColor: '#145F33', cursor: inactive ? 'not-allowed' : 'pointer' }}
                                                                                                    />
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
                                                    </div>

                                                    {/* PRN Grid */}
                                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                        <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>PRN</span>
                                                        </div>
                                                        <div>
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
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={row.selected}
                                                                                            disabled={inactive}
                                                                                            onChange={(e) => setHandOffPrnRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: e.target.checked } : r))}
                                                                                            className="w-4 h-4"
                                                                                            style={{ accentColor: '#145F33', cursor: inactive ? 'not-allowed' : 'pointer' }}
                                                                                        />
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
                                                    </div>

                                                    {/* OTC Grid */}
                                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                        <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>OTC</span>
                                                        </div>
                                                        <div>
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
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={row.selected}
                                                                                            disabled={inactive}
                                                                                            onChange={(e) => setHandOffOtcRows(prev => prev.map(r => r.id === row.id ? { ...r, selected: e.target.checked } : r))}
                                                                                            className="w-4 h-4"
                                                                                            style={{ accentColor: '#145F33', cursor: inactive ? 'not-allowed' : 'pointer' }}
                                                                                        />
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
                                            ) : (
                                                /* Log Panel */
                                                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                        <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Hand Off Log</span>
                                                        <button onClick={() => setHandOffInnerTab("youthReceived")} style={{ color: 'var(--slds-g-color-text-weak)' }}><X className="h-4 w-4" /></button>
                                                    </div>
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                <th className="px-4 py-2 text-left slds-text-3 font-semibold w-40" style={{ color: 'var(--slds-g-color-text-default)' }}>Timestamp</th>
                                                                <th className="px-4 py-2 text-left slds-text-3 font-semibold w-44" style={{ color: 'var(--slds-g-color-text-default)' }}>User</th>
                                                                <th className="px-4 py-2 text-left slds-text-3 font-semibold w-32" style={{ color: 'var(--slds-g-color-text-default)' }}>Action</th>
                                                                <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Detail</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {handOffLogEntries.length === 0 ? (
                                                                <tr><td colSpan={4} className="px-4 py-6 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>No log entries yet</td></tr>
                                                            ) : (
                                                                [...handOffLogEntries].reverse().map(e => (
                                                                    <tr key={e.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                        <td className="px-4 py-2 slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>{e.timestamp}</td>
                                                                        <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{e.user}</td>
                                                                        <td className="px-4 py-2"><span className="inline-block slds-text-3 px-2 py-0.5 rounded-full" style={{ backgroundColor: '#e6f2eb', color: '#145F33' }}>{e.action}</span></td>
                                                                        <td className="px-4 py-2 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{e.detail}</td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}

                                            {/* Youth Received Modal */}
                                            <Dialog open={isYouthReceivedModalOpen} onOpenChange={setIsYouthReceivedModalOpen}>
                                                <DialogContent className="sm:max-w-[520px]" style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', padding: 0 }}>
                                                    <DialogHeader className="px-6 pt-6 pb-4">
                                                        <DialogTitle className="slds-text-5 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Youth Received</DialogTitle>
                                                        <DialogDescription className="slds-text-4 mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                            Confirm recipient and add any comments about this handoff.
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    <div className="px-6 py-4 space-y-4">
                                                        {/* Toggle: Youth Received / Other Recipient */}
                                                        <div className="space-y-2">
                                                            <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                RECIPIENT <span className="text-red-600">*</span>
                                                            </label>
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    onClick={() => setYouthReceivedToggle("youthReceived")}
                                                                    className="flex-1 h-10 px-4 rounded slds-text-4 font-medium transition-colors"
                                                                    style={{
                                                                        backgroundColor: youthReceivedToggle === "youthReceived" ? '#145F33' : 'var(--slds-g-color-background-base)',
                                                                        color: youthReceivedToggle === "youthReceived" ? 'white' : 'var(--slds-g-color-text-default)',
                                                                        border: '1px solid ' + (youthReceivedToggle === "youthReceived" ? '#145F33' : 'var(--slds-g-color-border-base-1)')
                                                                    }}
                                                                >
                                                                    Youth Received
                                                                </button>
                                                                <button
                                                                    onClick={() => setYouthReceivedToggle("otherRecipient")}
                                                                    className="flex-1 h-10 px-4 rounded slds-text-4 font-medium transition-colors"
                                                                    style={{
                                                                        backgroundColor: youthReceivedToggle === "otherRecipient" ? '#145F33' : 'var(--slds-g-color-background-base)',
                                                                        color: youthReceivedToggle === "otherRecipient" ? 'white' : 'var(--slds-g-color-text-default)',
                                                                        border: '1px solid ' + (youthReceivedToggle === "otherRecipient" ? '#145F33' : 'var(--slds-g-color-border-base-1)')
                                                                    }}
                                                                >
                                                                    Other Recipient
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Recipient Type (only if Other Recipient) */}
                                                        {youthReceivedToggle === "otherRecipient" && (
                                                            <div className="space-y-1.5">
                                                                <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                    RECIPIENT TYPE <span className="text-red-600">*</span>
                                                                </label>
                                                                <Select value={recipientType} onValueChange={setRecipientType}>
                                                                    <SelectTrigger className="h-10 w-full rounded slds-text-4" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}>
                                                                        <SelectValue placeholder="Select recipient type" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="Parent">Parent</SelectItem>
                                                                        <SelectItem value="Guardian">Guardian</SelectItem>
                                                                        <SelectItem value="School">School</SelectItem>
                                                                        <SelectItem value="Other">Other</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        )}

                                                        {/* Name (only if Recipient Type is Other) */}
                                                        {youthReceivedToggle === "otherRecipient" && recipientType === "Other" && (
                                                            <div className="space-y-1.5">
                                                                <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                    NAME <span className="text-red-600">*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={recipientName}
                                                                    onChange={(e) => setRecipientName(e.target.value)}
                                                                    placeholder="Enter recipient name"
                                                                    className="h-10 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Pack Comment */}
                                                        <div className="space-y-1.5">
                                                            <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                PACK COMMENT (MEDICATION COMMENT)
                                                            </label>
                                                            <Textarea
                                                                value={packComment}
                                                                onChange={(e) => setPackComment(e.target.value)}
                                                                placeholder="Enter any comments about this handoff..."
                                                                className="w-full px-3 py-2 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33] min-h-[80px]"
                                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <DialogFooter className="px-6 py-4 border-t flex items-center justify-end gap-3" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                        <p className="slds-text-3 italic text-right" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                            I attest that I have followed the policies and procedure of Medicine Dispensation &amp; Documentation.
                                                        </p>
                                                        <Button
                                                            onClick={handleYouthReceivedSubmit}
                                                            className="h-9 px-4 rounded-full slds-text-4 text-white"
                                                            style={{ backgroundColor: '#145F33' }}
                                                        >
                                                            Submit
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setIsYouthReceivedModalOpen(false);
                                                                setYouthReceivedToggle("youthReceived");
                                                                setRecipientType("");
                                                                setRecipientName("");
                                                                setPackComment("");
                                                            }}
                                                            className="h-9 px-4 rounded-full slds-text-4"
                                                            style={{ borderColor: 'var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    );
                                })()}

                                {/* ═══════ REVIEW TAB ═══════ */}
                                {createPackActiveTab === "review" && <OtherTabsReviewTab {...props} />}

                                {/* ═══════ DISPOSAL TAB ═══════ */}
                                {createPackActiveTab === "disposal" && <OtherTabsDisposalTab {...props} />}
                            </div>

                            {/* Dialog Footer */}
                            <DialogFooter
                                className="px-6 py-4 border-t flex justify-between gap-2"
                                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                            >
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCreatePackDialogOpen(false)}
                                    className="h-9 px-4 rounded-full text-[13px]"
                                    style={{
                                        borderColor: 'var(--slds-g-color-border-base-4)',
                                        color: 'var(--slds-g-color-text-weak)'
                                    }}
                                >
                                    Cancel
                                </Button>
                                <div className="flex items-center gap-2">
                                    {createPackActiveTab !== "doses" && (
                                        <Button
                                            variant="outline"
                                            className="h-9 px-4 rounded-full text-[13px]"
                                            style={{
                                                borderColor: 'var(--slds-g-color-border-base-4)',
                                                color: 'var(--slds-g-color-text-weak)'
                                            }}
                                            onClick={() => {
                                                const order: typeof createPackActiveTab[] = ["doses", "setPrimary", "packingPrep", "dispense", "count", "handOff", "review", "disposal"];
                                                const curIdx = order.indexOf(createPackActiveTab);
                                                if (curIdx > 0) {
                                                    if (createPackActiveTab === "count" && countRows.some(r => r.currentCount !== "" || r.comments !== "")) {
                                                        if (!window.confirm("You have unsaved changes on the Count tab. Leave without saving?")) return;
                                                        setCountRows(prev => prev.map(r => ({ ...r, currentCount: "", comments: "", selected: false })));
                                                    }
                                                    setCreatePackActiveTab(order[curIdx - 1]);
                                                }
                                            }}
                                        >
                                            Back
                                        </Button>
                                    )}
                                    {createPackActiveTab !== "disposal" ? (
                                        <Button
                                            className="h-9 px-4 rounded-full text-[13px]"
                                            style={{ backgroundColor: '#145F33', color: 'white' }}
                                            onClick={() => {
                                                const order: typeof createPackActiveTab[] = ["doses", "setPrimary", "packingPrep", "dispense", "count", "handOff", "review", "disposal"];
                                                const curIdx = order.indexOf(createPackActiveTab);
                                                if (curIdx < order.length - 1) {
                                                    if (createPackActiveTab === "count" && countRows.some(r => r.currentCount !== "" || r.comments !== "")) {
                                                        if (!window.confirm("You have unsaved changes on the Count tab. Leave without saving?")) return;
                                                        setCountRows(prev => prev.map(r => ({ ...r, currentCount: "", comments: "", selected: false })));
                                                    }
                                                    setCreatePackActiveTab(order[curIdx + 1]);
                                                }
                                            }}
                                        >
                                            Next
                                        </Button>
                                    ) : (
                                        <Button
                                            className="h-9 px-4 rounded-full text-[13px]"
                                            style={{ backgroundColor: '#145F33', color: 'white' }}
                                            onClick={handleCreatePack}
                                        >
                                            {selectedPackId ? (
                                                <><Check className="h-3.5 w-3.5 mr-1" />Save Changes</>
                                            ) : (
                                                <><Plus className="h-3.5 w-3.5 mr-1" />Create Pack</>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

  );
}
