import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner@2.0.3";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ChevronRight, Plus, User, Users, Building2, Phone, Mail, CheckSquare, Upload, AlertTriangle, AlertCircle, Clock, MapPin, CheckCircle, Pencil, Trash2, ChevronDown, FileText, ChevronUp, Check, X, ChevronLeft, Search, Filter, Calendar, Package, Tag, ClipboardList, ChevronsUpDown, Download, Eye, File, MoreVertical  } from "@/app/lib/lucide-icons";
import { OtherTabsCreatePackDialog } from "./OtherTabsCreatePackDialog";
import { DateInput } from "../ui/date-input";
import { MedCodePicker, type MedCode } from "./MedCodePicker";
import { formatMdy } from "../../lib/dateFormat";

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

const AUDIT_FLAG_CODES = new Set(["ADS", "MDS", "EMP", "UNS", "WTU", "MPM", "ABS", "CON", "REF", "OTH"]);
const codeAuditFlag = (fullCodeValue: string): boolean => AUDIT_FLAG_CODES.has(fullCodeValue.split(" -- ")[0]);

interface OtherTabsPackMedsDialogsProps {
  [key: string]: any;
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  youthName: any;
}

export function OtherTabsPackMedsDialogs(props: OtherTabsPackMedsDialogsProps) {
  const { isCreatePackDialogOpen, setIsCreatePackDialogOpen, setCreatePackActiveTab, setDateRangeApplied, setNewPackForm, setAppliedDateRange, setPrnMedications, setOtcMedications, setSetPrimaryShowLog, setPackingPrepInnerTab, setSelectedPackId, selectedPackId, createPackActiveTab, countRows, setCountRows, dateRangeApplied, prnMedications, otcMedications, setPendingDateChange, setIsDateChangeWarningOpen, newPackForm, defaultPrnMedications, defaultOtcMedications, setIsModifyAllPrnDialogOpen, setSelectedPrnIndex, setIsModifyPrnDialogOpen, setPrimaryMedRows, setPrimaryPrnRows, setPrimaryOtcRowsData, setIsSetPrimaryModalOpen, setPrimaryShowLog, setSetPrimaryMedRows, setSetPrimaryPrnRows, setSetPrimaryOtcRowsData, setPrimaryLogEntries, packingPrepInnerTab, packPrepMedSelected, packPrepPrnSelected, packPrepOtcSelected, setIsLabelStyleModalOpen, appliedDateRange, setPackPrepMedSelected, setPackPrepPrnSelected, setPackPrepOtcSelected, isLabelStyleModalOpen, dispenseInnerTab, dispenseMedRows, dispensePrnRows, dispenseOtcRows, setDispenseMedRows, setDispensePrnRows, setDispenseOtcRows, setDispenseInnerTab, dispenseLogEntries, handOffMedRows, handOffPrnRows, handOffOtcRows, setIsYouthReceivedModalOpen, youthReceivedToggle, recipientType, recipientName, setHandOffMedRows, setHandOffPrnRows, setHandOffOtcRows, setYouthReceivedToggle, setRecipientType, setRecipientName, setPackComment, setHandOffInnerTab, handOffInnerTab, handOffLogEntries, isYouthReceivedModalOpen, packComment, handleCreatePack, isDateChangeWarningOpen, pendingDateChange, isSetPrimaryModalOpen, setSetPrimarySelectedCode, setSetPrimaryPackComment, setSetPrimaryCommentError, setPrimarySelectedCode, setPrimaryPackComment, setPrimaryCommentError, setSetPrimaryLogEntries, isModifyPrnDialogOpen, selectedPrnIndex, isModifyAllPrnDialogOpen, isAddOtcDialogOpen, setIsAddOtcDialogOpen, newOtcForm, setNewOtcForm, isViewPackDialogOpen, setIsViewPackDialogOpen, selectedPack, reviewMedRows, setReviewMedRows, reviewPrnRows, setReviewPrnRows, reviewOtcRows, setReviewOtcRows, reviewLogEntries, setReviewLogEntries, reviewInnerTab, setReviewInnerTab, isSetReviewStatusModalOpen, setIsSetReviewStatusModalOpen, reviewModalPrimaryCode, setReviewModalPrimaryCode, reviewModalComment, setReviewModalComment, reviewModalCommentError, setReviewModalCommentError, isReviewMedHistoryOpen, setIsReviewMedHistoryOpen, reviewHistoryMedication, setReviewHistoryMedication, disposalMedRows, setDisposalMedRows, disposalPrnRows, setDisposalPrnRows, disposalOtcRows, setDisposalOtcRows, disposalLogEntries, setDisposalLogEntries, disposalInnerTab, setDisposalInnerTab, isMassDisposalModalOpen, setIsMassDisposalModalOpen, massDisposalModalRows, setMassDisposalModalRows, massDisposalDate, setMassDisposalDate, massDisposalCancelConfirmOpen, setMassDisposalCancelConfirmOpen, youthName } = props;
  return (
    <>
                    <OtherTabsCreatePackDialog {...props} />
                    <Dialog open={isDateChangeWarningOpen} onOpenChange={setIsDateChangeWarningOpen}>
                        <DialogContent className="max-w-[480px]" style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                            <DialogHeader className="border-b pb-3" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                <DialogTitle className="slds-text-6 font-semibold flex items-center gap-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                    <AlertCircle className="h-5 w-5" style={{ color: '#e8650a' }} />
                                    Medications in Packing Process
                                </DialogTitle>
                                <DialogDescription className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                    Review before changing the date range.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                    Medications are currently in the packing process. By changing the selection range you will exclude these in-process medications from the packing process. Any changes needed for these excluded medications will need to be manually managed outside of the medication packing process.
                                </p>
                            </div>
                            <DialogFooter className="border-t pt-3 gap-2" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                <Button
                                    variant="outline"
                                    className="h-9 px-4 rounded-full slds-text-4"
                                    style={{ borderColor: 'var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                    onClick={() => { setIsDateChangeWarningOpen(false); setPendingDateChange(null); }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="h-9 px-4 rounded-full slds-text-4 text-white"
                                    style={{ backgroundColor: '#145F33' }}
                                    onClick={() => {
                                        if (pendingDateChange) {
                                            setNewPackForm(f => ({ ...f, ...pendingDateChange }));
                                            setDateRangeApplied(false);
                                            setPrnMedications([]);
                                            setOtcMedications([]);
                                        }
                                        setIsDateChangeWarningOpen(false);
                                        setPendingDateChange(null);
                                    }}
                                >
                                    Continue
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Set Primary Medication Code Modal */}
                    <Dialog open={isSetPrimaryModalOpen} onOpenChange={open => { setIsSetPrimaryModalOpen(open); if (!open) { setSetPrimarySelectedCode(""); setSetPrimaryPackComment(""); setSetPrimaryCommentError(false); } }}>
                        <DialogContent className="max-w-[560px]" style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                            <DialogHeader className="border-b pb-3" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                <DialogTitle className="slds-text-6 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Set Primary Medication Code</DialogTitle>
                                <DialogDescription className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>Assign a primary code to all selected medication rows.</DialogDescription>
                            </DialogHeader>
                            <div className="py-5 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        PRIMARY MEDICATION CODE <span className="text-red-600">*</span>
                                    </label>
                                    <MedCodePicker
                                        codes={SET_PRIMARY_CODES}
                                        value={setPrimarySelectedCode}
                                        onChange={setSetPrimarySelectedCode}
                                        placeholder="Select a code..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        PACK COMMENT <span className="text-red-600">*</span>
                                    </label>
                                    <textarea
                                        value={setPrimaryPackComment}
                                        onChange={e => { setSetPrimaryPackComment(e.target.value); if (e.target.value.trim()) setSetPrimaryCommentError(false); }}
                                        placeholder="Enter required comment..."
                                        rows={3}
                                        className="w-full px-3 py-2 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33] resize-none"
                                        style={{ border: `1px solid ${setPrimaryCommentError ? '#c23934' : 'var(--slds-g-color-border-base-1)'}`, color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                    />
                                    {setPrimaryCommentError && (
                                        <p className="slds-text-3" style={{ color: '#c23934' }}>Pack Comment is required.</p>
                                    )}
                                </div>
                            </div>
                            <DialogFooter className="border-t pt-4 flex flex-col gap-3" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                {/* Attestation + Submit row */}
                                <div className="flex items-center justify-end gap-4">
                                    <p className="slds-text-3 text-right" style={{ color: 'var(--slds-g-color-text-weak)', maxWidth: '280px' }}>
                                        I attest that I have followed the policies and procedure of Medicine Dispensation &amp; Documentation.
                                    </p>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => { setIsSetPrimaryModalOpen(false); setSetPrimarySelectedCode(""); setSetPrimaryPackComment(""); setSetPrimaryCommentError(false); }}
                                            className="h-9 px-4 rounded-full slds-text-4 font-medium"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-neutral-95)' }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!setPrimarySelectedCode) { toast.error("Primary Medication Code is required."); return; }
                                                if (!setPrimaryPackComment.trim()) { setSetPrimaryCommentError(true); return; }
                                                const now = formatMdy(new Date()) + " " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                                                const hasAuditFlag = codeAuditFlag(setPrimarySelectedCode);
                                                const newLogs: { id: number; timestamp: string; user: string; action: string; detail: string }[] = [];
                                                let nextId = setPrimaryLogEntries.length + 1;
                                                const commentSuffix = ` | Comment: ${setPrimaryPackComment.trim()}${hasAuditFlag ? " | Audit Flag: Yes" : ""}`;
                                                setSetPrimaryMedRows(prev => prev.map(r => {
                                                    if (r.selected && (r.packStatus === "Available" || r.packStatus === "Selected")) {
                                                        newLogs.push({ id: nextId++, timestamp: now, user: "Current User", action: "Code Assigned", detail: `${setPrimarySelectedCode} assigned to ${r.drugName}${commentSuffix}` });
                                                        return { ...r, packStatus: "Selected" as const, primaryCode: setPrimarySelectedCode, selected: false };
                                                    }
                                                    return r;
                                                }));
                                                setSetPrimaryPrnRows(prev => prev.map(r => {
                                                    if (r.selected && (r.packStatus === "Available" || r.packStatus === "Selected")) {
                                                        newLogs.push({ id: nextId++, timestamp: now, user: "Current User", action: "Code Assigned", detail: `${setPrimarySelectedCode} assigned to ${r.drugName} (PRN)${commentSuffix}` });
                                                        return { ...r, packStatus: "Selected" as const, primaryCode: setPrimarySelectedCode, selected: false };
                                                    }
                                                    return r;
                                                }));
                                                setSetPrimaryOtcRowsData(prev => prev.map(r => {
                                                    if (r.selected && (r.packStatus === "Available" || r.packStatus === "Selected")) {
                                                        newLogs.push({ id: nextId++, timestamp: now, user: "Current User", action: "Code Assigned", detail: `${setPrimarySelectedCode} assigned to ${r.drugName} (OTC)${commentSuffix}` });
                                                        return { ...r, packStatus: "Selected" as const, primaryCode: setPrimarySelectedCode, selected: false };
                                                    }
                                                    return r;
                                                }));
                                                setSetPrimaryLogEntries(prev => [...prev, ...newLogs]);
                                                setSetPrimarySelectedCode("");
                                                setSetPrimaryPackComment("");
                                                setSetPrimaryCommentError(false);
                                                setIsSetPrimaryModalOpen(false);
                                                toast.success("Primary codes assigned. Status updated to Selected.");
                                            }}
                                            className="h-9 px-5 rounded-full slds-text-4 font-medium text-white"
                                            style={{ backgroundColor: '#145F33' }}
                                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0e4524')}
                                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#145F33')}
                                        >
                                            Save &amp; Close
                                        </button>
                                    </div>
                                </div>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Modify Individual PRN Dialog */}
                    <Dialog open={isModifyPrnDialogOpen} onOpenChange={setIsModifyPrnDialogOpen}>
                        <DialogContent className="max-w-[420px]" style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                            <DialogHeader className="border-b pb-3" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                <DialogTitle className="slds-text-6 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Modify PRN</DialogTitle>
                                <DialogDescription className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>Update the dose count for this PRN medication.</DialogDescription>
                            </DialogHeader>
                            {selectedPrnIndex !== null && prnMedications[selectedPrnIndex] && (
                                <div className="py-4 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>MEDICATION</label>
                                        <div className="h-9 px-3 flex items-center rounded slds-text-4" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)', color: 'var(--slds-g-color-text-default)' }}>
                                            {prnMedications[selectedPrnIndex].medication}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            DOSES <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={prnMedications[selectedPrnIndex].doses}
                                            onChange={e => setPrnMedications(prev => prev.map((p, i) => i === selectedPrnIndex ? { ...p, doses: e.target.value } : p))}
                                            className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                        />
                                    </div>
                                </div>
                            )}
                            <DialogFooter className="border-t pt-3 flex gap-2 justify-end" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                <button
                                    onClick={() => setIsModifyPrnDialogOpen(false)}
                                    className="h-9 px-4 rounded-full slds-text-4 font-medium"
                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-neutral-95)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => { setIsModifyPrnDialogOpen(false); toast.success("PRN doses updated."); }}
                                    className="h-9 px-4 rounded-full slds-text-4 font-medium text-white"
                                    style={{ backgroundColor: '#145F33' }}
                                >
                                    Apply
                                </button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Modify All PRN Dialog */}
                    <Dialog open={isModifyAllPrnDialogOpen} onOpenChange={setIsModifyAllPrnDialogOpen}>
                        <DialogContent className="max-w-[520px]" style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                            <DialogHeader className="border-b pb-3" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                <DialogTitle className="slds-text-6 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Modify All PRN Doses</DialogTitle>
                                <DialogDescription className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>Update doses for all PRN medications at once.</DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <div className="rounded overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                    <table className="w-full slds-text-3">
                                        <thead>
                                            <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Medication</th>
                                                <th className="px-3 py-2 text-left font-semibold w-28" style={{ color: 'var(--slds-g-color-text-weak)' }}>Doses <span className="text-red-600">*</span></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {prnMedications.map((prn, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <td className="px-3 py-2 slds-text-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{prn.medication}</td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            value={prn.doses}
                                                            onChange={e => setPrnMedications(meds => meds.map((m, i) => i === idx ? { ...m, doses: e.target.value } : m))}
                                                            className="h-7 px-2 rounded slds-text-3 w-full"
                                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', outline: 'none', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <DialogFooter className="border-t pt-3 gap-2" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                <Button variant="outline" onClick={() => setIsModifyAllPrnDialogOpen(false)} className="h-9 px-4 rounded-full slds-text-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}>Cancel</Button>
                                <Button className="h-9 px-4 rounded-full slds-text-4 text-white" style={{ backgroundColor: '#145F33' }} onClick={() => { setIsModifyAllPrnDialogOpen(false); toast.success("PRN doses updated"); }}>
                                    Apply
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isAddOtcDialogOpen} onOpenChange={setIsAddOtcDialogOpen}>
                        <DialogContent className="max-w-[440px]" style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                            <DialogHeader className="border-b pb-3" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                <DialogTitle className="text-[15px] font-semibold text-[#080707]">Add OTC Medication</DialogTitle>
                                <DialogDescription className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Enter OTC medication details for this pack.</DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[12px] font-semibold" style={{ color: '#d8372a' }}>Medication *</Label>
                                    <Input value={newOtcForm.medication} onChange={(e) => setNewOtcForm({ ...newOtcForm, medication: e.target.value })} placeholder="e.g. Melatonin" className="h-8 text-[13px]" style={{ borderColor: 'var(--slds-g-color-border-base-4)' }} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-[12px] font-semibold" style={{ color: '#d8372a' }}>Dose *</Label>
                                        <Input value={newOtcForm.dose} onChange={(e) => setNewOtcForm({ ...newOtcForm, dose: e.target.value })} placeholder="e.g. 3mg" className="h-8 text-[13px]" style={{ borderColor: 'var(--slds-g-color-border-base-4)' }} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[12px] font-medium text-[#3e3e3c]">Quantity</Label>
                                        <Input value={newOtcForm.quantity} onChange={(e) => setNewOtcForm({ ...newOtcForm, quantity: e.target.value })} placeholder="e.g. 7" className="h-8 text-[13px]" style={{ borderColor: 'var(--slds-g-color-border-base-4)' }} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[12px] font-medium text-[#3e3e3c]">Doses</Label>
                                    <Input value={newOtcForm.doses} onChange={(e) => setNewOtcForm({ ...newOtcForm, doses: e.target.value })} placeholder="e.g. Bedtime" className="h-8 text-[13px]" style={{ borderColor: 'var(--slds-g-color-border-base-4)' }} />
                                </div>
                            </div>
                            <DialogFooter className="border-t pt-3 gap-2" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                <Button variant="outline" onClick={() => setIsAddOtcDialogOpen(false)} className="h-9 px-4 rounded-full text-[13px]" style={{ borderColor: 'var(--slds-g-color-border-base-4)', color: 'var(--slds-g-color-text-weak)' }}>Cancel</Button>
                                <Button
                                    className="h-9 px-4 rounded-full text-[13px]"
                                    style={{ backgroundColor: '#145F33', color: 'white' }}
                                    onClick={() => {
                                        if (!newOtcForm.medication || !newOtcForm.dose) { toast.error("Medication and Dose are required"); return; }
                                        setOtcMedications([...otcMedications, { ...newOtcForm }]);
                                        setIsAddOtcDialogOpen(false);
                                        toast.success("OTC medication added");
                                    }}
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* View Medication Pack Dialog */}
                    <Dialog open={isViewPackDialogOpen} onOpenChange={setIsViewPackDialogOpen}>
                        <DialogContent className="sm:max-w-[800px]" style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                            <DialogHeader className="border-b pb-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                <DialogTitle className="text-[15px] font-semibold text-[#080707] flex items-center gap-2">
                                    <Eye className="h-5 w-5" style={{ color: '#145F33' }} />
                                    Medication Pack Details
                                </DialogTitle>
                                <DialogDescription className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                    Viewing details for the selected medication pack.
                                </DialogDescription>
                            </DialogHeader>
                            {selectedPack && (
                                <div className="py-4 space-y-5 overflow-y-auto max-h-[65vh]">
                                    {/* Pack Identity */}
                                    <div
                                        className="rounded-lg p-4"
                                        style={{ backgroundColor: 'var(--slds-g-color-background-alt)', border: '1px solid var(--slds-g-color-border-base-1)' }}
                                    >
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <span className="slds-form-label block mb-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>Pack Name</span>
                                                <span className="slds-text-4 font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{selectedPack.packName}</span>
                                            </div>
                                            <div>
                                                <span className="slds-form-label block mb-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>Pack Status</span>
                                                <span className="slds-text-4 font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{selectedPack.packStatus}</span>
                                            </div>
                                            <div>
                                                <span className="slds-form-label block mb-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>Pack Type</span>
                                                <span className="slds-text-4 font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{selectedPack.packType}</span>
                                            </div>
                                            <div>
                                                <span className="slds-form-label block mb-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>Expected Handoff Date</span>
                                                <span className="slds-text-4 font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{selectedPack.expectedHandoffDate || '—'}</span>
                                            </div>
                                            <div>
                                                <span className="slds-form-label block mb-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>Record Status</span>
                                                <Badge className="text-[10px] rounded-full px-2 py-0" style={{ backgroundColor: selectedPack.status === "active" ? '#e6f2eb' : '#f3f2f2', color: selectedPack.status === "active" ? '#145F33' : '#706e6b', border: 'none' }}>
                                                    {selectedPack.status === "active" ? "Active" : "Archived"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date/Time Summary */}
                                    <div>
                                        <h4 className="slds-text-4 font-semibold mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>Pack Date &amp; Time</h4>
                                        <div
                                            className="rounded-lg p-4"
                                            style={{ backgroundColor: 'var(--slds-g-color-background-alt)', border: '1px solid var(--slds-g-color-border-base-1)' }}
                                        >
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="slds-form-label block mb-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>Start Date</span>
                                                    <span className="slds-text-4 font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{selectedPack.startDate}</span>
                                                </div>
                                                <div>
                                                    <span className="slds-form-label block mb-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>Start Time</span>
                                                    <span className="slds-text-4 font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{selectedPack.startTime}</span>
                                                </div>
                                                <div>
                                                    <span className="slds-form-label block mb-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>End Date</span>
                                                    <span className="slds-text-4 font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{selectedPack.endDate}</span>
                                                </div>
                                                <div>
                                                    <span className="slds-form-label block mb-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>End Time</span>
                                                    <span className="slds-text-4 font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{selectedPack.endTime}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Medications in Pack */}
                                    <div>
                                        <h4 className="slds-text-4 font-semibold mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>Medications in Pack</h4>
                                        {selectedPack.medications.length > 0 ? (
                                            <div
                                                className="rounded overflow-hidden"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                            >
                                                <table className="w-full slds-text-3">
                                                    <thead>
                                                        <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Medication</th>
                                                            <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Dose</th>
                                                            <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Frequency</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedPack.medications.map((med, idx) => (
                                                            <tr key={idx} style={{ borderBottom: idx < selectedPack.medications.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                                <td className="px-3 py-2" style={{ color: 'var(--slds-g-color-text-default)' }}>{med.name}</td>
                                                                <td className="px-3 py-2" style={{ color: 'var(--slds-g-color-text-default)' }}>{med.dose}</td>
                                                                <td className="px-3 py-2" style={{ color: 'var(--slds-g-color-text-default)' }}>{med.frequency}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="slds-text-4 pt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>No medications assigned to this pack yet.</p>
                                        )}
                                    </div>

                                    {/* Audit info */}
                                    <div className="grid grid-cols-2 gap-4 pt-2" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        <div>
                                            <span className="slds-form-label block mb-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>Created By</span>
                                            <span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{selectedPack.createdBy}</span>
                                        </div>
                                        <div>
                                            <span className="slds-form-label block mb-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>Created Date</span>
                                            <span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{selectedPack.createdDate}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <DialogFooter className="border-t pt-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsViewPackDialogOpen(false)}
                                    className="h-9 px-4 rounded-full text-[13px]"
                                    style={{
                                        borderColor: 'var(--slds-g-color-border-base-4)',
                                        color: 'var(--slds-g-color-text-weak)'
                                    }}
                                >
                                    Close
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
    </>
  );
}
