import { useState, useMemo, useEffect, useRef, useCallback } from "react";
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
import { ChevronRight, Plus, User, Users, Building2, Phone, Mail, CheckSquare, Upload, AlertTriangle, Clock, MapPin, CheckCircle, Pencil, Trash2, ChevronDown, FileText, ChevronUp, Check, X, ChevronLeft, Search, Filter, Calendar, Package, Tag, ClipboardList, ChevronsUpDown, Download, Eye, File, MoreVertical , Edit2 } from "@/app/lib/lucide-icons";
import { DateInput } from "../ui/date-input";
import { OtherTabsPackMedsDialogs } from "./OtherTabsPackMedsDialogs";

interface OtherTabsAdministrationSectionProps {
  activeHorizontalTab: any;
  setActiveHorizontalTab: any;
  dispenseLogEntries: any;
  handOffLogEntries: any;
  MED_CODES: any;
  SET_PRIMARY_CODES: any;
  SortIcon: any;
  activePackFilter: any;
  activePackSort: any;
  adminLogEntries: any;
  
  
  
  
  
  
  
  
  
  
  
  
  appliedDateRange: any;
  
  archivePackFilter: any;
  archivePackSort: any;
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  countRows: any;
  countRowsOriginal: any;
  createPackActiveTab: any;
  
  
  
  
  
  
  
  dateFilterDraftValue: any;
  dateFilterModalType: any;
  dateRangeApplied: any;
  
  
  
  defaultOtcMedications: any;
  defaultPrnMedications: any;
  
  
  
  
  dispenseInnerTab: any;
  dispenseMedRows: any;
  dispenseOtcRows: any;
  dispensePrnRows: any;
  disposalInnerTab: any;
  disposalLogEntries: any;
  disposalMedRows: any;
  disposalOtcRows: any;
  disposalPrnRows: any;
  
  
  
  
  
  
  
  
  
  endDateFilter: any;
  endDateFilterCustom: any;
  endDateFilterDraftValue: any;
  endDateFilterModalType: any;
  endDateFunnelRef: any;
  
  
  
  
  filterPacks: any;
  
  
  
  
  
  
  
  
  
  handOffInnerTab: any;
  handOffMedRows: any;
  handOffOtcRows: any;
  handOffPrnRows: any;
  
  
  
  
  handleCreatePack: any;
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  hasRowChanges: any;
  
  
  
  
  
  
  isAddOtcDialogOpen: any;
  
  
  isCreatePackDialogOpen: any;
  isDateChangeWarningOpen: any;
  
  isEndDateFilterOpen: any;
  
  isLabelStyleModalOpen: any;
  isMassDisposalModalOpen: any;
  isModifyAllPrnDialogOpen: any;
  isModifyPrnDialogOpen: any;
  
  
  isReviewMedHistoryOpen: any;
  
  
  
  
  isSetPrimaryModalOpen: any;
  isSetReviewStatusModalOpen: any;
  
  
  isStartDateFilterOpen: any;
  isViewPackDialogOpen: any;
  isYouthReceivedModalOpen: any;
  
  
  
  
  
  
  
  
  
  
  massDisposalCancelConfirmOpen: any;
  massDisposalDate: any;
  massDisposalModalRows: any;
  
  
  
  
  
  medicationPacks: any;
  
  
  
  
  
  newOtcForm: any;
  newPackForm: any;
  
  
  
  
  
  
  
  
  otcMedications: any;
  
  packComment: any;
  
  packMedsSubTab: any;
  packPrepMedSelected: any;
  packPrepOtcSelected: any;
  packPrepPrnSelected: any;
  
  
  packingPrepInnerTab: any;
  
  
  
  
  
  
  pendingDateChange: any;
  
  
  
  
  
  
  
  
  
  
  
  prnMedications: any;
  
  
  
  recipientName: any;
  recipientType: any;
  reviewHistoryMedication: any;
  reviewInnerTab: any;
  reviewLogEntries: any;
  reviewMedRows: any;
  reviewModalComment: any;
  reviewModalCommentError: any;
  reviewModalPrimaryCode: any;
  reviewOtcRows: any;
  reviewPrnRows: any;
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  selectedPack: any;
  selectedPackId: any;
  
  selectedPrnIndex: any;
  setActivePackFilter: any;
  setActivePackSort: any;
  setAdminLogEntries: any;
  setAppliedDateRange: any;
  setArchivePackFilter: any;
  setArchivePackSort: any;
  setCountRows: any;
  setCountRowsOriginal: any;
  setCreatePackActiveTab: any;
  setDateFilterDraftValue: any;
  setDateFilterModalType: any;
  setDateRangeApplied: any;
  setDispenseInnerTab: any;
  setDispenseMedRows: any;
  setDispenseOtcRows: any;
  setDispensePrnRows: any;
  setDisposalInnerTab: any;
  setDisposalLogEntries: any;
  setDisposalMedRows: any;
  setDisposalOtcRows: any;
  setDisposalPrnRows: any;
  setEndDateFilter: any;
  setEndDateFilterCustom: any;
  setEndDateFilterDraftValue: any;
  setEndDateFilterModalType: any;
  
  setHandOffInnerTab: any;
  setHandOffMedRows: any;
  setHandOffOtcRows: any;
  setHandOffPrnRows: any;
  setIsAddOtcDialogOpen: any;
  setIsCreatePackDialogOpen: any;
  setIsDateChangeWarningOpen: any;
  setIsEditing: any;
  setIsEndDateFilterOpen: any;
  setIsLabelStyleModalOpen: any;
  setIsMassDisposalModalOpen: any;
  setIsModifyAllPrnDialogOpen: any;
  setIsModifyPrnDialogOpen: any;
  setIsReviewMedHistoryOpen: any;
  setIsSetPrimaryModalOpen: any;
  setIsSetReviewStatusModalOpen: any;
  setIsStartDateFilterOpen: any;
  setIsViewPackDialogOpen: any;
  setIsYouthReceivedModalOpen: any;
  setMassDisposalCancelConfirmOpen: any;
  setMassDisposalDate: any;
  setMassDisposalModalRows: any;
  setNewOtcForm: any;
  setNewPackForm: any;
  setOtcMedications: any;
  setPackComment: any;
  setPackMedsSubTab: any;
  setPackPrepMedSelected: any;
  setPackPrepOtcSelected: any;
  setPackPrepPrnSelected: any;
  setPackingPrepInnerTab: any;
  setPendingDateChange: any;
  setPrimaryCommentError: any;
  setPrimaryLogEntries: any;
  setPrimaryMedRows: any;
  setPrimaryOtcRowsData: any;
  setPrimaryPackComment: any;
  setPrimaryPrnRows: any;
  setPrimarySelectedCode: any;
  setPrimaryShowLog: any;
  setPrnMedications: any;
  setRecipientName: any;
  setRecipientType: any;
  setReviewHistoryMedication: any;
  setReviewInnerTab: any;
  setReviewLogEntries: any;
  setReviewMedRows: any;
  setReviewModalComment: any;
  setReviewModalCommentError: any;
  setReviewModalPrimaryCode: any;
  setReviewOtcRows: any;
  setReviewPrnRows: any;
  setSelectedPackId: any;
  setSelectedPrnIndex: any;
  setSetPrimaryCommentError: any;
  setSetPrimaryLogEntries: any;
  setSetPrimaryMedRows: any;
  setSetPrimaryOtcRowsData: any;
  setSetPrimaryPackComment: any;
  setSetPrimaryPrnRows: any;
  setSetPrimarySelectedCode: any;
  setSetPrimaryShowLog: any;
  
  setStartDateFilter: any;
  setStartDateFilterCustom: any;
  setYouthReceivedToggle: any;
  
  
  
  
  
  
  
  
  
  sortPacks: any;
  
  
  
  
  
  
  
  
  
  startDateFilter: any;
  startDateFilterCustom: any;
  startDateFunnelRef: any;
  
  
  
  
  
  
  
  tabs: any;
  
  
  
  
  
  
  
  toggleSort: any;
  
  
  
  
  
  
  
  
  youthDisplayName: any;
  youthName: any;
  youthReceivedToggle: any;
}

export function OtherTabsAdministrationSection({ activeHorizontalTab, setActiveHorizontalTab, dispenseLogEntries, handOffLogEntries, MED_CODES, SET_PRIMARY_CODES, SortIcon, activePackFilter, activePackSort, adminLogEntries, appliedDateRange, archivePackFilter, archivePackSort, countRows, countRowsOriginal, createPackActiveTab, dateFilterDraftValue, dateFilterModalType, dateRangeApplied, defaultOtcMedications, defaultPrnMedications, dispenseInnerTab, dispenseMedRows, dispenseOtcRows, dispensePrnRows, disposalInnerTab, disposalLogEntries, disposalMedRows, disposalOtcRows, disposalPrnRows, endDateFilter, endDateFilterCustom, endDateFilterDraftValue, endDateFilterModalType, endDateFunnelRef, filterPacks, handOffInnerTab, handOffMedRows, handOffOtcRows, handOffPrnRows, handleCreatePack, hasRowChanges, isAddOtcDialogOpen, isCreatePackDialogOpen, isDateChangeWarningOpen, isEndDateFilterOpen, isLabelStyleModalOpen, isMassDisposalModalOpen, isModifyAllPrnDialogOpen, isModifyPrnDialogOpen, isReviewMedHistoryOpen, isSetPrimaryModalOpen, isSetReviewStatusModalOpen, isStartDateFilterOpen, isViewPackDialogOpen, isYouthReceivedModalOpen, massDisposalCancelConfirmOpen, massDisposalDate, massDisposalModalRows, medicationPacks, newOtcForm, newPackForm, otcMedications, packComment, packMedsSubTab, packPrepMedSelected, packPrepOtcSelected, packPrepPrnSelected, packingPrepInnerTab, pendingDateChange, prnMedications, recipientName, recipientType, reviewHistoryMedication, reviewInnerTab, reviewLogEntries, reviewMedRows, reviewModalComment, reviewModalCommentError, reviewModalPrimaryCode, reviewOtcRows, reviewPrnRows, selectedPack, selectedPackId, selectedPrnIndex, setActivePackFilter, setActivePackSort, setAdminLogEntries, setAppliedDateRange, setArchivePackFilter, setArchivePackSort, setCountRows, setCountRowsOriginal, setCreatePackActiveTab, setDateFilterDraftValue, setDateFilterModalType, setDateRangeApplied, setDispenseInnerTab, setDispenseMedRows, setDispenseOtcRows, setDispensePrnRows, setDisposalInnerTab, setDisposalLogEntries, setDisposalMedRows, setDisposalOtcRows, setDisposalPrnRows, setEndDateFilter, setEndDateFilterCustom, setEndDateFilterDraftValue, setEndDateFilterModalType, setHandOffInnerTab, setHandOffMedRows, setHandOffOtcRows, setHandOffPrnRows, setIsAddOtcDialogOpen, setIsCreatePackDialogOpen, setIsDateChangeWarningOpen, setIsEditing, setIsEndDateFilterOpen, setIsLabelStyleModalOpen, setIsMassDisposalModalOpen, setIsModifyAllPrnDialogOpen, setIsModifyPrnDialogOpen, setIsReviewMedHistoryOpen, setIsSetPrimaryModalOpen, setIsSetReviewStatusModalOpen, setIsStartDateFilterOpen, setIsViewPackDialogOpen, setIsYouthReceivedModalOpen, setMassDisposalCancelConfirmOpen, setMassDisposalDate, setMassDisposalModalRows, setNewOtcForm, setNewPackForm, setOtcMedications, setPackComment, setPackMedsSubTab, setPackPrepMedSelected, setPackPrepOtcSelected, setPackPrepPrnSelected, setPackingPrepInnerTab, setPendingDateChange, setPrimaryCommentError, setPrimaryLogEntries, setPrimaryMedRows, setPrimaryOtcRowsData, setPrimaryPackComment, setPrimaryPrnRows, setPrimarySelectedCode, setPrimaryShowLog, setPrnMedications, setRecipientName, setRecipientType, setReviewHistoryMedication, setReviewInnerTab, setReviewLogEntries, setReviewMedRows, setReviewModalComment, setReviewModalCommentError, setReviewModalPrimaryCode, setReviewOtcRows, setReviewPrnRows, setSelectedPackId, setSelectedPrnIndex, setSetPrimaryCommentError, setSetPrimaryLogEntries, setSetPrimaryMedRows, setSetPrimaryOtcRowsData, setSetPrimaryPackComment, setSetPrimaryPrnRows, setSetPrimarySelectedCode, setSetPrimaryShowLog, setStartDateFilter, setStartDateFilterCustom, setYouthReceivedToggle, sortPacks, startDateFilter, startDateFilterCustom, startDateFunnelRef, tabs, toggleSort, youthDisplayName, youthName, youthReceivedToggle }: OtherTabsAdministrationSectionProps) {
  return (
    <>
                <div className="p-6 space-y-5 max-w-6xl">
                    {/* Horizontal Tabs with Create Button */}
                    <div className="rounded-lg shadow-sm mb-4" style={{ backgroundColor: 'var(--slds-g-color-background-base)' }}>
                        <nav className="flex items-center border-b rounded-lg" style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}>
                            <div className="flex items-center gap-6">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveHorizontalTab(tab.id);
                                            setIsEditing(false);
                                        }}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-3 slds-text-4 font-semibold whitespace-nowrap relative transition-colors",
                                            activeHorizontalTab === tab.id && "rounded-t-lg"
                                        )}
                                        style={{
                                            color: activeHorizontalTab === tab.id ? 'var(--color-brand-primary)' : 'var(--slds-g-color-text-default)',
                                            borderBottom: activeHorizontalTab === tab.id ? '3px solid var(--color-brand-primary)' : '3px solid transparent',
                                            marginBottom: '-1px'
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </nav>
                    </div>

                    {activeHorizontalTab === "pack-meds" && (() => {
                        // ── helpers scoped to pack-meds render ──
                        // AC27: packs whose endDate has passed are effectively archived regardless of stored status
                        const today = new Date(); today.setHours(0, 0, 0, 0);
                        const isEffectivelyArchived = (p: MedicationPack) => {
                            if (p.status === "archived") return true;
                            if (!p.endDate) return false;
                            const [m, d, y] = p.endDate.split("/").map(Number);
                            const end = new Date(y, m - 1, d); end.setHours(0, 0, 0, 0);
                            return end < today;
                        };
                        const isActive = packMedsSubTab === "active";
                        const rawPacks = medicationPacks.filter(p => isActive ? !isEffectivelyArchived(p) : isEffectivelyArchived(p));
                        const sort = isActive ? activePackSort : archivePackSort;
                        const setSort = isActive ? setActivePackSort : setArchivePackSort;
                        const filter = isActive ? activePackFilter : archivePackFilter;
                        const setFilter = isActive ? setActivePackFilter : setArchivePackFilter;
                        const parseD = (s: string) => { const [m,d,y] = s.split("/").map(Number); return new Date(y, m-1, d); };
                        function applyDateFilter(packs: MedicationPack[], dateKey: "startDate" | "endDate", filterVal: string, customVal: string): MedicationPack[] {
                            if (filterVal === "all") return packs;
                            const now = new Date(); now.setHours(0, 0, 0, 0);
                            return packs.filter(p => {
                                const raw = p[dateKey] as string | undefined;
                                if (!raw) return false;
                                const pd = parseD(raw); pd.setHours(0,0,0,0);
                                if (filterVal === "today") return pd.getTime() === now.getTime();
                                if (filterVal === "yesterday") { const y = new Date(now); y.setDate(y.getDate()-1); return pd.getTime() === y.getTime(); }
                                if (filterVal === "this-week") { const ws = new Date(now); ws.setDate(now.getDate()-now.getDay()); return pd >= ws && pd <= now; }
                                if (filterVal === "last-week") { const lws = new Date(now); lws.setDate(now.getDate()-now.getDay()-7); const lwe = new Date(lws); lwe.setDate(lws.getDate()+6); return pd >= lws && pd <= lwe; }
                                if (filterVal === "this-month") return pd.getMonth()===now.getMonth() && pd.getFullYear()===now.getFullYear();
                                if (filterVal === "last-month") { const lm = new Date(now.getFullYear(), now.getMonth()-1, 1); return pd.getMonth()===lm.getMonth() && pd.getFullYear()===lm.getFullYear(); }
                                if (filterVal === "this-year") return pd.getFullYear()===now.getFullYear();
                                if (filterVal === "last-year") return pd.getFullYear()===now.getFullYear()-1;
                                if (filterVal === "custom" && customVal) { try { return pd.getTime() === parseD(customVal).getTime(); } catch { return true; } }
                                return true;
                            });
                        }
                        const visiblePacks = sortPacks(
                            applyDateFilter(
                                applyDateFilter(filterPacks(rawPacks, filter), "startDate", startDateFilter, startDateFilterCustom),
                                "endDate", endDateFilter, endDateFilterCustom
                            ),
                            sort
                        );

                        function SortIcon({ col }: { col: PackSortCol }) {
                            if (sort.col !== col) return <ChevronsUpDown className="h-3 w-3 opacity-40 ml-0.5 flex-shrink-0" />;
                            return sort.dir === "asc"
                                ? <ChevronUp className="h-3 w-3 ml-0.5 flex-shrink-0" style={{ color: '#145F33' }} />
                                : <ChevronDown className="h-3 w-3 ml-0.5 flex-shrink-0" style={{ color: '#145F33' }} />;
                        }

                        function packStatusBadge(s: MedicationPack["packStatus"]) {
                            const map: Record<MedicationPack["packStatus"], { bg: string; color: string; border: string }> = {
                                Available: { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' },
                                Dispensed: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
                                Selected:  { bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
                                Received:  { bg: '#dcfce7', color: '#166534', border: '#86efac' },
                            };
                            const st = map[s];
                            return (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full slds-text-3 font-medium whitespace-nowrap" style={{ backgroundColor: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                                    {s}
                                </span>
                            );
                        }

                        function thBtn(label: string, col: PackSortCol) {
                            return (
                                <button
                                    onClick={() => toggleSort(sort, col, setSort)}
                                    className="flex items-center gap-0.5 slds-text-3 font-semibold whitespace-nowrap hover:opacity-80 transition-opacity"
                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                >
                                    {label}
                                    <SortIcon col={col} />
                                </button>
                            );
                        }

                        return (
                            <div className="space-y-0">
                                {/* Sub-tab bar */}
                                <div
                                    className="flex items-center justify-between px-4 py-2 rounded-t-lg gap-3 flex-wrap"
                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderBottom: 'none', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                >
                                    {/* Active / Archive switcher + inline Clear Filters */}
                                    <div className="flex items-center gap-0 flex-shrink-0">
                                        {(["active", "archive"] as const).map((tab) => {
                                            const label = tab === "active" ? "Active" : "Archive";
                                            const count = medicationPacks.filter(p => tab === "active" ? !isEffectivelyArchived(p) : isEffectivelyArchived(p)).length;
                                            const isSelected = packMedsSubTab === tab;
                                            return (
                                                <button
                                                    key={tab}
                                                    onClick={() => setPackMedsSubTab(tab)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 slds-text-4 font-semibold transition-colors relative"
                                                    style={{
                                                        color: isSelected ? '#145F33' : 'var(--slds-g-color-text-weak)',
                                                        borderBottom: isSelected ? '2px solid #145F33' : '2px solid transparent',
                                                    }}
                                                >
                                                    {label}
                                                    <span
                                                        className="slds-text-3 px-1.5 py-0.5 rounded-full font-medium"
                                                        style={{
                                                            backgroundColor: isSelected ? '#e6f2eb' : 'var(--slds-g-color-background-alt)',
                                                            color: isSelected ? '#145F33' : 'var(--slds-g-color-text-weak)',
                                                        }}
                                                    >
                                                        {count}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                        {/* Clear Filters — shown inline beside Archive when any date filter is active */}
                                        {(startDateFilter !== "all" || endDateFilter !== "all") && (
                                            <>
                                                <div className="mx-2 h-4 w-px flex-shrink-0" style={{ backgroundColor: 'var(--slds-g-color-border-base-1)' }} />
                                                <button
                                                    onClick={() => {
                                                        setStartDateFilter("all");
                                                        setStartDateFilterCustom("");
                                                        setEndDateFilter("all");
                                                        setEndDateFilterCustom("");
                                                    }}
                                                    className="flex items-center gap-1.5 h-7 px-3 rounded-full slds-text-3 font-medium transition-colors flex-shrink-0"
                                                    style={{ backgroundColor: '#fef2f2', color: '#c23934', border: '1px solid #f5c6c6', cursor: 'pointer' }}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fee2e2'; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fef2f2'; }}
                                                    title="Clear all date filters"
                                                >
                                                    <X className="h-3 w-3" />
                                                    Clear Filters
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Right: Create button */}
                                    <div className="flex items-center flex-shrink-0">
                                        {isActive && (
                                            <Button
                                                size="sm"
                                                className="h-8 rounded-full slds-text-3 text-white gap-1.5"
                                                style={{ backgroundColor: '#145F33', border: '1px solid #145F33' }}
                                                onClick={() => {
                                                    setNewPackForm({ startDate: "", startTime: "", endDate: "", endTime: "", expectedHandoffDate: "" });
                                                    setCreatePackActiveTab("doses");
                                                    setDateRangeApplied(false);
                                                    setAppliedDateRange({ startDate: "", startTime: "", endDate: "", endTime: "" });
                                                    setPrnMedications([]);
                                                    setOtcMedications([]);
                                                    setSetPrimaryShowLog(false);
                                                    setPackingPrepInnerTab("checklist");
                                                    setDispenseInnerTab("staffDispensed");
                                                    setHandOffInnerTab("youthReceived");
                                                    setReviewInnerTab("setSecondaryCode");
                                                    setIsCreatePackDialogOpen(true);
                                                }}
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Create New Medication Pack
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Table */}
                                <div
                                    className="overflow-x-auto rounded-b-lg"
                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                >
                                    <table className="w-full slds-text-4" style={{ minWidth: '900px' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                <th className="px-3 py-2.5 text-left">{thBtn("Pack Name", "packName")}</th>
                                                <th className="px-3 py-2.5 text-left">{thBtn("Status", "packStatus")}</th>
                                                <th className="px-3 py-2.5 text-left">{thBtn("Pack Type", "packType")}</th>
                                                <th className="px-3 py-2.5 text-left whitespace-nowrap">{thBtn("Expected Handoff Date", "expectedHandoffDate")}</th>
                                                <th className="px-3 py-2.5 text-left whitespace-nowrap">
                                                    <div ref={startDateFunnelRef} style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                        {thBtn("Start Date", "startDate")}
                                                        {/* Funnel / filter button */}
                                                        <button
                                                            title="Filter by Start Date"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                const isSpec = startDateFilter === "custom";
                                                                setDateFilterModalType(isSpec ? "specific" : "relative");
                                                                setDateFilterDraftValue(isSpec ? "custom" : startDateFilter);
                                                                setIsStartDateFilterOpen(o => !o);
                                                            }}
                                                            style={{
                                                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                                                width: "20px", height: "20px", borderRadius: "4px", border: "none",
                                                                cursor: "pointer", flexShrink: 0, transition: "background 0.15s",
                                                                backgroundColor: startDateFilter !== "all" ? "#e6f2eb" : "transparent",
                                                                color: startDateFilter !== "all" ? "#145F33" : "var(--slds-g-color-text-weak)",
                                                            }}
                                                            onMouseEnter={e => { if (startDateFilter === "all") (e.currentTarget as HTMLElement).style.backgroundColor = "var(--slds-g-color-background-alt-2)"; }}
                                                            onMouseLeave={e => { if (startDateFilter === "all") (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                                                            </svg>
                                                        </button>

                                                        {/* ── Unified Date Filter Dropdown ── */}
                                                        {isStartDateFilterOpen && (
                                                            <div
                                                                style={{
                                                                    position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 9999,
                                                                    backgroundColor: "var(--slds-g-color-background-base)",
                                                                    borderRadius: "10px", minWidth: "340px",
                                                                    boxShadow: "0 4px 20px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)",
                                                                    border: "1px solid var(--slds-g-color-border-base-1)",
                                                                    overflow: "hidden",
                                                                }}
                                                            >
                                                                    {/* Modal Header */}
                                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px 13px", borderBottom: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-alt)" }}>
                                                                        <div style={{ height: "28px", width: "28px", borderRadius: "6px", backgroundColor: "#e6f2eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                                            <Filter className="h-3.5 w-3.5" style={{ color: "#145F33" }} />
                                                                        </div>
                                                                        <div>
                                                                            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--slds-g-color-text-default)", margin: 0, lineHeight: 1.3 }}>Filter by Start Date</p>
                                                                            <p style={{ fontSize: "11px", color: "var(--slds-g-color-text-weak)", margin: 0, lineHeight: 1.3 }}>Select a filter type and value below</p>
                                                                        </div>
                                                                    </div>

                                                                    {/* Modal Body */}
                                                                    <div style={{ padding: "16px 18px 18px" }}>

                                                                        {/* Row 1 — Filter Type */}
                                                                        <div style={{ marginBottom: "16px" }}>
                                                                            <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)", display: "block", marginBottom: "6px" }}>
                                                                                FILTER TYPE
                                                                            </label>
                                                                            <select
                                                                                value={dateFilterModalType}
                                                                                onChange={e => {
                                                                                    const t = e.target.value as "relative" | "specific";
                                                                                    setDateFilterModalType(t);
                                                                                    if (t === "relative") setDateFilterDraftValue("all");
                                                                                }}
                                                                                style={{
                                                                                    width: "100%", height: "36px", padding: "0 10px",
                                                                                    borderRadius: "6px", border: "1px solid var(--slds-g-color-border-base-1)",
                                                                                    fontSize: "13px", color: "var(--slds-g-color-text-default)",
                                                                                    backgroundColor: "var(--slds-g-color-background-base)",
                                                                                    outline: "none", cursor: "pointer",
                                                                                }}
                                                                            >
                                                                                <option value="relative">Relative Date</option>
                                                                                <option value="specific">Specific Date</option>
                                                                            </select>
                                                                        </div>

                                                                        {/* Row 2 — Dynamic content */}
                                                                        {dateFilterModalType === "relative" ? (
                                                                            <div>
                                                                                <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)", display: "block", marginBottom: "8px" }}>
                                                                                    RELATIVE DATE
                                                                                </label>
                                                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                                                                    {[
                                                                                        { key: "today",      label: "Today"      },
                                                                                        { key: "yesterday",  label: "Yesterday"  },
                                                                                        { key: "this-week",  label: "This Week"  },
                                                                                        { key: "last-week",  label: "Last Week"  },
                                                                                        { key: "this-month", label: "This Month" },
                                                                                        { key: "last-month", label: "Last Month" },
                                                                                        { key: "this-year",  label: "This Year"  },
                                                                                        { key: "last-year",  label: "Last Year"  },
                                                                                    ].map(({ key, label }) => {
                                                                                        const isSelected = dateFilterDraftValue === key;
                                                                                        return (
                                                                                            <button
                                                                                                key={key}
                                                                                                onClick={() => setDateFilterDraftValue(key)}
                                                                                                style={{
                                                                                                    height: "34px", padding: "0 10px", borderRadius: "6px",
                                                                                                    border: isSelected ? "1.5px solid #145F33" : "1px solid var(--slds-g-color-border-base-1)",
                                                                                                    backgroundColor: isSelected ? "#f0faf4" : "var(--slds-g-color-background-base)",
                                                                                                    color: isSelected ? "#145F33" : "var(--slds-g-color-text-default)",
                                                                                                    fontSize: "13px", fontWeight: isSelected ? 600 : 400,
                                                                                                    cursor: "pointer", textAlign: "left",
                                                                                                    display: "flex", alignItems: "center", gap: "6px",
                                                                                                    transition: "background 0.1s, border-color 0.1s",
                                                                                                }}
                                                                                                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--slds-g-color-background-alt)"; }}
                                                                                                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--slds-g-color-background-base)"; }}
                                                                                            >
                                                                                                <span style={{ width: "14px", flexShrink: 0, display: "flex", alignItems: "center" }}>
                                                                                                    {isSelected && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#145F33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                                                                                </span>
                                                                                                {label}
                                                                                            </button>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div>
                                                                                <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)", display: "block", marginBottom: "6px" }}>
                                                                                    SPECIFIC DATE <span className="text-red-600">*</span>
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="MM/DD/YYYY"
                                                                                    value={startDateFilterCustom}
                                                                                    onChange={e => {
                                                                                        const cleaned = e.target.value.replace(/\D/g, "").slice(0, 8);
                                                                                        let fmt = cleaned;
                                                                                        if (cleaned.length > 4) fmt = `${cleaned.slice(0,2)}/${cleaned.slice(2,4)}/${cleaned.slice(4)}`;
                                                                                        else if (cleaned.length > 2) fmt = `${cleaned.slice(0,2)}/${cleaned.slice(2)}`;
                                                                                        setStartDateFilterCustom(fmt);
                                                                                    }}
                                                                                    maxLength={10}
                                                                                    autoFocus
                                                                                    style={{
                                                                                        width: "100%", height: "36px", padding: "0 12px",
                                                                                        borderRadius: "6px", border: "1px solid var(--slds-g-color-border-base-1)",
                                                                                        fontSize: "13px", color: "var(--slds-g-color-text-default)",
                                                                                        outline: "none", boxSizing: "border-box" as const,
                                                                                        backgroundColor: "var(--slds-g-color-background-base)",
                                                                                    }}
                                                                                    onFocus={e => { e.currentTarget.style.borderColor = "#145F33"; e.currentTarget.style.boxShadow = "0 0 0 2px #145F3330"; }}
                                                                                    onBlur={e => { e.currentTarget.style.borderColor = "var(--slds-g-color-border-base-1)"; e.currentTarget.style.boxShadow = "none"; }}
                                                                                />
                                                                                <p style={{ fontSize: "11px", color: "var(--slds-g-color-text-weak)", marginTop: "5px", marginBottom: 0 }}>
                                                                                    Auto-formatted as MM/DD/YYYY
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Modal Footer */}
                                                                    <div style={{
                                                                        display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px",
                                                                        padding: "12px 18px",
                                                                        borderTop: "1px solid var(--slds-g-color-border-base-1)",
                                                                        backgroundColor: "var(--slds-g-color-background-alt)",
                                                                    }}>
                                                                        <button
                                                                            onClick={() => {
                                                                                setStartDateFilter("all");
                                                                                setStartDateFilterCustom("");
                                                                                setDateFilterDraftValue("all");
                                                                                setIsStartDateFilterOpen(false);
                                                                            }}
                                                                            style={{
                                                                                height: "32px", padding: "0 16px", borderRadius: "20px",
                                                                                border: "1px solid var(--slds-g-color-border-base-1)",
                                                                                backgroundColor: "var(--slds-g-color-background-base)",
                                                                                fontSize: "13px", cursor: "pointer",
                                                                                color: "var(--slds-g-color-text-weak)",
                                                                            }}
                                                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--slds-g-color-background-alt-2)"; }}
                                                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--slds-g-color-background-base)"; }}
                                                                        >
                                                                            Clear
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                if (dateFilterModalType === "relative") {
                                                                                    setStartDateFilter(dateFilterDraftValue === "all" ? "all" : dateFilterDraftValue);
                                                                                    setStartDateFilterCustom("");
                                                                                } else {
                                                                                    if (startDateFilterCustom) setStartDateFilter("custom");
                                                                                }
                                                                                setIsStartDateFilterOpen(false);
                                                                            }}
                                                                            style={{
                                                                                height: "32px", padding: "0 18px", borderRadius: "20px",
                                                                                border: "none", backgroundColor: "#145F33",
                                                                                color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                                                                            }}
                                                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#0e4524"; }}
                                                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#145F33"; }}
                                                                        >
                                                                            Apply
                                                                        </button>
                                                                    </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </th>
                                                <th className="px-3 py-2.5 text-left whitespace-nowrap">{thBtn("Start Time", "startTime")}</th>
                                                <th className="px-3 py-2.5 text-left whitespace-nowrap">
                                                    <div ref={endDateFunnelRef} style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                        {thBtn("End Date", "endDate")}
                                                        {/* Funnel / filter button */}
                                                        <button
                                                            title="Filter by End Date"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                const isSpec = endDateFilter === "custom";
                                                                setEndDateFilterModalType(isSpec ? "specific" : "relative");
                                                                setEndDateFilterDraftValue(isSpec ? "custom" : endDateFilter);
                                                                setIsEndDateFilterOpen(o => !o);
                                                            }}
                                                            style={{
                                                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                                                width: "20px", height: "20px", borderRadius: "4px", border: "none",
                                                                cursor: "pointer", flexShrink: 0, transition: "background 0.15s",
                                                                backgroundColor: endDateFilter !== "all" ? "#e6f2eb" : "transparent",
                                                                color: endDateFilter !== "all" ? "#145F33" : "var(--slds-g-color-text-weak)",
                                                            }}
                                                            onMouseEnter={e => { if (endDateFilter === "all") (e.currentTarget as HTMLElement).style.backgroundColor = "var(--slds-g-color-background-alt-2)"; }}
                                                            onMouseLeave={e => { if (endDateFilter === "all") (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                                                            </svg>
                                                        </button>

                                                        {/* ── End Date Filter Dropdown ── */}
                                                        {isEndDateFilterOpen && (
                                                            <div
                                                                style={{
                                                                    position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 9999,
                                                                    backgroundColor: "var(--slds-g-color-background-base)",
                                                                    borderRadius: "10px", minWidth: "340px",
                                                                    boxShadow: "0 4px 20px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)",
                                                                    border: "1px solid var(--slds-g-color-border-base-1)",
                                                                    overflow: "hidden",
                                                                }}
                                                            >
                                                                {/* Header */}
                                                                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px 13px", borderBottom: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-alt)" }}>
                                                                    <div style={{ height: "28px", width: "28px", borderRadius: "6px", backgroundColor: "#e6f2eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                                        <Filter className="h-3.5 w-3.5" style={{ color: "#145F33" }} />
                                                                    </div>
                                                                    <div>
                                                                        <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--slds-g-color-text-default)", margin: 0, lineHeight: 1.3 }}>Filter by End Date</p>
                                                                        <p style={{ fontSize: "11px", color: "var(--slds-g-color-text-weak)", margin: 0, lineHeight: 1.3 }}>Select a filter type and value below</p>
                                                                    </div>
                                                                </div>

                                                                {/* Body */}
                                                                <div style={{ padding: "16px 18px 18px" }}>
                                                                    {/* Row 1 — Filter Type */}
                                                                    <div style={{ marginBottom: "16px" }}>
                                                                        <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)", display: "block", marginBottom: "6px" }}>FILTER TYPE</label>
                                                                        <select
                                                                            value={endDateFilterModalType}
                                                                            onChange={e => {
                                                                                const t = e.target.value as "relative" | "specific";
                                                                                setEndDateFilterModalType(t);
                                                                                if (t === "relative") setEndDateFilterDraftValue("all");
                                                                            }}
                                                                            style={{ width: "100%", height: "36px", padding: "0 10px", borderRadius: "6px", border: "1px solid var(--slds-g-color-border-base-1)", fontSize: "13px", color: "var(--slds-g-color-text-default)", backgroundColor: "var(--slds-g-color-background-base)", outline: "none", cursor: "pointer" }}
                                                                        >
                                                                            <option value="relative">Relative Date</option>
                                                                            <option value="specific">Specific Date</option>
                                                                        </select>
                                                                    </div>

                                                                    {/* Row 2 — Dynamic content */}
                                                                    {endDateFilterModalType === "relative" ? (
                                                                        <div>
                                                                            <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)", display: "block", marginBottom: "8px" }}>RELATIVE DATE</label>
                                                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                                                                {[
                                                                                    { key: "today",      label: "Today"      },
                                                                                    { key: "yesterday",  label: "Yesterday"  },
                                                                                    { key: "this-week",  label: "This Week"  },
                                                                                    { key: "last-week",  label: "Last Week"  },
                                                                                    { key: "this-month", label: "This Month" },
                                                                                    { key: "last-month", label: "Last Month" },
                                                                                    { key: "this-year",  label: "This Year"  },
                                                                                    { key: "last-year",  label: "Last Year"  },
                                                                                ].map(({ key, label }) => {
                                                                                    const isSel = endDateFilterDraftValue === key;
                                                                                    return (
                                                                                        <button
                                                                                            key={key}
                                                                                            onClick={() => setEndDateFilterDraftValue(key)}
                                                                                            style={{
                                                                                                height: "34px", padding: "0 10px", borderRadius: "6px",
                                                                                                border: isSel ? "1.5px solid #145F33" : "1px solid var(--slds-g-color-border-base-1)",
                                                                                                backgroundColor: isSel ? "#f0faf4" : "var(--slds-g-color-background-base)",
                                                                                                color: isSel ? "#145F33" : "var(--slds-g-color-text-default)",
                                                                                                fontSize: "13px", fontWeight: isSel ? 600 : 400,
                                                                                                cursor: "pointer", textAlign: "left",
                                                                                                display: "flex", alignItems: "center", gap: "6px",
                                                                                                transition: "background 0.1s, border-color 0.1s",
                                                                                            }}
                                                                                            onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--slds-g-color-background-alt)"; }}
                                                                                            onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--slds-g-color-background-base)"; }}
                                                                                        >
                                                                                            <span style={{ width: "14px", flexShrink: 0, display: "flex", alignItems: "center" }}>
                                                                                                {isSel && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#145F33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                                                                            </span>
                                                                                            {label}
                                                                                        </button>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div>
                                                                            <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)", display: "block", marginBottom: "6px" }}>
                                                                                SPECIFIC DATE <span className="text-red-600">*</span>
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                placeholder="MM/DD/YYYY"
                                                                                value={endDateFilterCustom}
                                                                                onChange={e => {
                                                                                    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 8);
                                                                                    let fmt = cleaned;
                                                                                    if (cleaned.length > 4) fmt = `${cleaned.slice(0,2)}/${cleaned.slice(2,4)}/${cleaned.slice(4)}`;
                                                                                    else if (cleaned.length > 2) fmt = `${cleaned.slice(0,2)}/${cleaned.slice(2)}`;
                                                                                    setEndDateFilterCustom(fmt);
                                                                                }}
                                                                                maxLength={10}
                                                                                autoFocus
                                                                                style={{ width: "100%", height: "36px", padding: "0 12px", borderRadius: "6px", border: "1px solid var(--slds-g-color-border-base-1)", fontSize: "13px", color: "var(--slds-g-color-text-default)", outline: "none", boxSizing: "border-box" as const, backgroundColor: "var(--slds-g-color-background-base)" }}
                                                                                onFocus={e => { e.currentTarget.style.borderColor = "#145F33"; e.currentTarget.style.boxShadow = "0 0 0 2px #145F3330"; }}
                                                                                onBlur={e => { e.currentTarget.style.borderColor = "var(--slds-g-color-border-base-1)"; e.currentTarget.style.boxShadow = "none"; }}
                                                                            />
                                                                            <p style={{ fontSize: "11px", color: "var(--slds-g-color-text-weak)", marginTop: "5px", marginBottom: 0 }}>Auto-formatted as MM/DD/YYYY</p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Footer */}
                                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", padding: "12px 18px", borderTop: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-alt)" }}>
                                                                    <button
                                                                        onClick={() => { setEndDateFilter("all"); setEndDateFilterCustom(""); setEndDateFilterDraftValue("all"); setIsEndDateFilterOpen(false); }}
                                                                        style={{ height: "32px", padding: "0 16px", borderRadius: "20px", border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", fontSize: "13px", cursor: "pointer", color: "var(--slds-g-color-text-weak)" }}
                                                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--slds-g-color-background-alt-2)"; }}
                                                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--slds-g-color-background-base)"; }}
                                                                    >
                                                                        Clear
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (endDateFilterModalType === "relative") {
                                                                                setEndDateFilter(endDateFilterDraftValue === "all" ? "all" : endDateFilterDraftValue);
                                                                                setEndDateFilterCustom("");
                                                                            } else {
                                                                                if (endDateFilterCustom) setEndDateFilter("custom");
                                                                            }
                                                                            setIsEndDateFilterOpen(false);
                                                                        }}
                                                                        style={{ height: "32px", padding: "0 18px", borderRadius: "20px", border: "none", backgroundColor: "#145F33", color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                                                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#0e4524"; }}
                                                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#145F33"; }}
                                                                    >
                                                                        Apply
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </th>
                                                <th className="px-3 py-2.5 text-left whitespace-nowrap">{thBtn("End Time", "endTime")}</th>
                                                <th className="px-3 py-2.5 text-left slds-text-3 font-semibold whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {visiblePacks.length === 0 ? (
                                                <tr>
                                                    <td colSpan={9} className="px-3 py-10 text-center" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Package className="h-8 w-8 opacity-30" />
                                                            <span className="slds-text-4">
                                                                {filter
                                                                    ? `No ${isActive ? "active" : "archived"} packs match "${filter}". `
                                                                    : isActive
                                                                        ? 'No active medication packs. Click "Create Medication Pack" to get started.'
                                                                        : 'No archived medication packs found.'}
                                                                {filter && (
                                                                    <button onClick={() => setFilter("")} className="underline ml-1" style={{ color: '#145F33' }}>Clear filter</button>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                visiblePacks.map((pack, idx) => (
                                                    <tr
                                                        key={pack.id}
                                                        className="transition-colors"
                                                        style={{
                                                            borderBottom: idx < visiblePacks.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-alt)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-base)'; }}
                                                    >
                                                        <td className="px-3 py-2.5" style={{ color: 'var(--slds-g-color-text-default)', maxWidth: '240px' }}>
                                                            <span className="block truncate slds-text-4" title={pack.packName}>{pack.packName}</span>
                                                        </td>
                                                        <td className="px-3 py-2.5">{packStatusBadge(pack.packStatus)}</td>
                                                        <td className="px-3 py-2.5 slds-text-3" style={{ color: 'var(--slds-g-color-text-default)', maxWidth: '180px' }}>
                                                            <span className="block truncate" title={pack.packType}>{pack.packType}</span>
                                                        </td>
                                                        <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{pack.expectedHandoffDate}</td>
                                                        <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{pack.startDate}</td>
                                                        <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{pack.startTime}</td>
                                                        <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{pack.endDate}</td>
                                                        <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{pack.endTime}</td>
                                                        <td className="px-3 py-2.5">
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => { setSelectedPackId(pack.id); setIsViewPackDialogOpen(true); }}
                                                                    title="View"
                                                                    className="p-1.5 rounded transition-colors"
                                                                    style={{ color: '#0176d3', backgroundColor: 'transparent' }}
                                                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#e8f4fd'; }}
                                                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedPackId(pack.id);
                                                                        setNewPackForm({ startDate: pack.startDate, startTime: pack.startTime, endDate: pack.endDate, endTime: pack.endTime, expectedHandoffDate: pack.expectedHandoffDate });
                                                                        setAppliedDateRange({ startDate: pack.startDate, startTime: pack.startTime, endDate: pack.endDate, endTime: pack.endTime });
                                                                        setDateRangeApplied(true);
                                                                        setIsCreatePackDialogOpen(true);
                                                                    }}
                                                                    title="Edit"
                                                                    className="p-1.5 rounded transition-colors"
                                                                    style={{ color: '#145F33', backgroundColor: 'transparent' }}
                                                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#e6f2eb'; }}
                                                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                                                                >
                                                                    <Edit2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Row count footer */}
                                {visiblePacks.length > 0 && (
                                    <div className="flex items-center justify-between px-3 pt-2">
                                        <span className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            {visiblePacks.length} record{visiblePacks.length !== 1 ? "s" : ""}
                                            {filter && ` (filtered from ${rawPacks.length})`}
                                        </span>
                                        {filter && (
                                            <button onClick={() => setFilter("")} className="slds-text-3 underline" style={{ color: '#145F33' }}>
                                                Clear filter
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {/* Count and Log sub-tabs placeholder */}
                    {activeHorizontalTab === "count" && (
                        <div 
                            className="overflow-hidden"
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                borderRadius: 'var(--slds-c-card-radius-border)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                        >
                            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                <h3 className="text-[13px] font-semibold text-[#080707]">Medication Count</h3>
                            </div>
                            <div className="p-4">
                                <div className="rounded overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-2)' }}>
                                    <table className="w-full text-[13px]">
                                        <thead>
                                            <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-2)' }}>
                                                <th className="px-3 py-2.5 text-left font-semibold text-[#080707] w-[120px]">Dose Period</th>
                                                <th className="px-3 py-2.5 text-left font-semibold text-[#080707]">Medication / Dose</th>
                                                <th className="px-3 py-2.5 text-left font-semibold text-[#080707] w-[100px]">Count Type</th>
                                                <th className="px-3 py-2.5 text-left font-semibold text-[#080707] w-[100px]">Last Count</th>
                                                <th className="px-3 py-2.5 text-left font-semibold text-[#080707] w-[120px]">Current Count</th>
                                                <th className="px-3 py-2.5 text-left font-semibold text-[#080707] w-[180px]">Comments</th>
                                                <th className="px-3 py-2.5 text-center font-semibold text-[#080707] w-[80px]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {countRows.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-3 py-10 text-center text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Package className="h-8 w-8 opacity-30" />
                                                            <span>No medications to count</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                countRows.map((row, index) => (
                                                    <tr
                                                        key={row.id}
                                                        className="transition-colors hover:bg-[#f4f6f9]"
                                                        style={{
                                                            borderBottom: index < countRows.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                                            backgroundColor: 'white'
                                                        }}
                                                    >
                                                        <td className="px-3 py-2.5" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {row.dosePeriod}
                                                        </td>
                                                        <td className="px-3 py-2.5" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {row.medicationDose}
                                                        </td>
                                                        <td className="px-3 py-2.5" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {row.countType}
                                                        </td>
                                                        <td className="px-3 py-2.5" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {row.lastCount}
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <Input
                                                                type="text"
                                                                value={row.currentCount}
                                                                onChange={(e) => setCountRows(countRows.map(r => r.id === row.id ? { ...r, currentCount: e.target.value } : r))}
                                                                placeholder="0.00"
                                                                className="h-8 text-[13px] w-full"
                                                                style={{ borderColor: '#dddbda' }}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <Input
                                                                type="text"
                                                                value={row.comments}
                                                                onChange={(e) => setCountRows(countRows.map(r => r.id === row.id ? { ...r, comments: e.target.value } : r))}
                                                                placeholder="Add note..."
                                                                className="h-8 text-[13px] w-full"
                                                                style={{ borderColor: '#dddbda' }}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    className={`p-1 rounded transition-colors ${
                                                                        hasRowChanges(row.id, row.currentCount, row.comments)
                                                                            ? 'hover:bg-[#e6f2eb] cursor-pointer'
                                                                            : 'cursor-not-allowed opacity-40'
                                                                    }`}
                                                                    disabled={!hasRowChanges(row.id, row.currentCount, row.comments)}
                                                                    onClick={() => {
                                                                        if (hasRowChanges(row.id, row.currentCount, row.comments)) {
                                                                            // Save the row
                                                                            console.log(`Saving row ${row.id}:`, { currentCount: row.currentCount, comments: row.comments });
                                                                            // Update original values to reflect saved state
                                                                            setCountRowsOriginal({
                                                                                ...countRowsOriginal,
                                                                                [row.id]: { currentCount: row.currentCount, comments: row.comments }
                                                                            });
                                                                        }
                                                                    }}
                                                                    title={hasRowChanges(row.id, row.currentCount, row.comments) ? "Save changes" : "No changes to save"}
                                                                >
                                                                    <Check 
                                                                        className="h-4 w-4" 
                                                                        style={{ 
                                                                            color: hasRowChanges(row.id, row.currentCount, row.comments) ? '#145F33' : '#706e6b'
                                                                        }} 
                                                                    />
                                                                </button>
                                                                <button
                                                                    className="p-1 hover:bg-[#f3f2f1] rounded transition-colors"
                                                                    onClick={() => {
                                                                        // Delete the row
                                                                        console.log(`Delete row ${row.id}`);
                                                                        setCountRows(countRows.filter(r => r.id !== row.id));
                                                                        // Also remove from original tracking
                                                                        const newOriginal = { ...countRowsOriginal };
                                                                        delete newOriginal[row.id];
                                                                        setCountRowsOriginal(newOriginal);
                                                                    }}
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="h-4 w-4" style={{ color: '#706e6b' }} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeHorizontalTab === "log" && (
                        <div 
                            className="overflow-hidden"
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                borderRadius: 'var(--slds-c-card-radius-border)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                        >
                            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                <h3 className="text-[13px] font-semibold text-[#080707]">Administration Log</h3>
                            </div>
                            <div className="p-4">
                                <div className="rounded overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-2)' }}>
                                    <table className="w-full text-[13px]">
                                        <thead>
                                            <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '1px solid var(--slds-g-color-border-base-2)' }}>
                                                <th className="px-3 py-2.5 text-center font-semibold text-[#080707] w-[40px]">
                                                    <input
                                                        type="checkbox"
                                                        checked={adminLogEntries.every(e => e.selected)}
                                                        onChange={(e) => {
                                                            setAdminLogEntries(adminLogEntries.map(entry => ({ ...entry, selected: e.target.checked })));
                                                        }}
                                                        className="rounded"
                                                        style={{ accentColor: '#145F33' }}
                                                    />
                                                </th>
                                                <th className="px-3 py-2.5 text-left font-semibold text-[#080707] w-[100px]">Dose Date</th>
                                                <th className="px-3 py-2.5 text-left font-semibold text-[#080707] w-[90px]">Dose Period</th>
                                                <th className="px-3 py-2.5 text-left font-semibold text-[#080707] w-[60px]">Inst</th>
                                                <th className="px-3 py-2.5 text-left font-semibold text-[#080707] w-[60px]">Seq</th>
                                                <th className="px-3 py-2.5 text-left font-semibold text-[#080707] w-[160px]">Log Type</th>
                                                <th className="px-3 py-2.5 text-left font-semibold text-[#080707] w-[60px]">#</th>
                                                <th className="px-3 py-2.5 text-left font-semibold text-[#080707] w-[110px]">Primary Code</th>
                                                <th className="px-3 py-2.5 text-left font-semibold text-[#080707] w-[120px]">Secondary Code</th>
                                                <th className="px-3 py-2.5 text-left font-semibold text-[#080707] w-[150px]">Attestation Date</th>
                                                <th className="px-3 py-2.5 text-left font-semibold text-[#080707] w-[140px]">Attestation Staff</th>
                                                <th className="px-3 py-2.5 text-left font-semibold text-[#080707]">Medication / Dose</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {adminLogEntries.length === 0 ? (
                                                <tr>
                                                    <td colSpan={12} className="px-3 py-10 text-center text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                        <div className="flex flex-col items-center gap-2">
                                                            <FileText className="h-8 w-8 opacity-30" />
                                                            <span>No administration log entries</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                adminLogEntries.map((entry, index) => (
                                                    <tr
                                                        key={entry.id}
                                                        className="transition-colors hover:bg-[#f4f6f9]"
                                                        style={{
                                                            borderBottom: index < adminLogEntries.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                                            backgroundColor: entry.selected ? '#e6f2eb' : 'white'
                                                        }}
                                                    >
                                                        <td className="px-3 py-2.5 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={entry.selected}
                                                                onChange={(e) => {
                                                                    setAdminLogEntries(adminLogEntries.map(e => e.id === entry.id ? { ...e, selected: e.target.checked } : e));
                                                                }}
                                                                className="rounded"
                                                                style={{ accentColor: '#145F33' }}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2.5" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {entry.doseDate}
                                                        </td>
                                                        <td className="px-3 py-2.5" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {entry.dosePeriod}
                                                        </td>
                                                        <td className="px-3 py-2.5" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {entry.inst}
                                                        </td>
                                                        <td className="px-3 py-2.5" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {entry.seq}
                                                        </td>
                                                        <td className="px-3 py-2.5" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {entry.logType}
                                                        </td>
                                                        <td className="px-3 py-2.5" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {entry.quantity || '—'}
                                                        </td>
                                                        <td className="px-3 py-2.5" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {entry.primaryCode || '—'}
                                                        </td>
                                                        <td className="px-3 py-2.5" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {entry.secondaryCode || '—'}
                                                        </td>
                                                        <td className="px-3 py-2.5" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {entry.attestationDate}
                                                        </td>
                                                        <td className="px-3 py-2.5" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {entry.attestationStaff}
                                                        </td>
                                                        <td className="px-3 py-2.5" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {entry.medicationDose}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                    {/* Create New Medication Pack Dialog — Multi-Step */}
                    <OtherTabsPackMedsDialogs
                      isCreatePackDialogOpen={isCreatePackDialogOpen}
                      setIsCreatePackDialogOpen={setIsCreatePackDialogOpen}
                      setCreatePackActiveTab={setCreatePackActiveTab}
                      setDateRangeApplied={setDateRangeApplied}
                      setNewPackForm={setNewPackForm}
                      setAppliedDateRange={setAppliedDateRange}
                      setPrnMedications={setPrnMedications}
                      setOtcMedications={setOtcMedications}
                      setSetPrimaryShowLog={setSetPrimaryShowLog}
                      setPackingPrepInnerTab={setPackingPrepInnerTab}
                      setSelectedPackId={setSelectedPackId}
                      selectedPackId={selectedPackId}
                      createPackActiveTab={createPackActiveTab}
                      countRows={countRows}
                      setCountRows={setCountRows}
                      dateRangeApplied={dateRangeApplied}
                      prnMedications={prnMedications}
                      otcMedications={otcMedications}
                      setPendingDateChange={setPendingDateChange}
                      setIsDateChangeWarningOpen={setIsDateChangeWarningOpen}
                      newPackForm={newPackForm}
                      defaultPrnMedications={defaultPrnMedications}
                      defaultOtcMedications={defaultOtcMedications}
                      setIsModifyAllPrnDialogOpen={setIsModifyAllPrnDialogOpen}
                      setSelectedPrnIndex={setSelectedPrnIndex}
                      setIsModifyPrnDialogOpen={setIsModifyPrnDialogOpen}
                      setPrimaryMedRows={setPrimaryMedRows}
                      setPrimaryPrnRows={setPrimaryPrnRows}
                      setPrimaryOtcRowsData={setPrimaryOtcRowsData}
                      setIsSetPrimaryModalOpen={setIsSetPrimaryModalOpen}
                      setPrimaryShowLog={setPrimaryShowLog}
                      setSetPrimaryMedRows={setSetPrimaryMedRows}
                      setSetPrimaryPrnRows={setSetPrimaryPrnRows}
                      setSetPrimaryOtcRowsData={setSetPrimaryOtcRowsData}
                      setPrimaryLogEntries={setPrimaryLogEntries}
                      packingPrepInnerTab={packingPrepInnerTab}
                      packPrepMedSelected={packPrepMedSelected}
                      packPrepPrnSelected={packPrepPrnSelected}
                      packPrepOtcSelected={packPrepOtcSelected}
                      setIsLabelStyleModalOpen={setIsLabelStyleModalOpen}
                      appliedDateRange={appliedDateRange}
                      setPackPrepMedSelected={setPackPrepMedSelected}
                      setPackPrepPrnSelected={setPackPrepPrnSelected}
                      setPackPrepOtcSelected={setPackPrepOtcSelected}
                      isLabelStyleModalOpen={isLabelStyleModalOpen}
                      dispenseInnerTab={dispenseInnerTab}
                      dispenseMedRows={dispenseMedRows}
                      dispensePrnRows={dispensePrnRows}
                      dispenseOtcRows={dispenseOtcRows}
                      setDispenseMedRows={setDispenseMedRows}
                      setDispensePrnRows={setDispensePrnRows}
                      setDispenseOtcRows={setDispenseOtcRows}
                      setDispenseInnerTab={setDispenseInnerTab}
                      dispenseLogEntries={dispenseLogEntries}
                      handOffMedRows={handOffMedRows}
                      handOffPrnRows={handOffPrnRows}
                      handOffOtcRows={handOffOtcRows}
                      setIsYouthReceivedModalOpen={setIsYouthReceivedModalOpen}
                      youthReceivedToggle={youthReceivedToggle}
                      recipientType={recipientType}
                      recipientName={recipientName}
                      setHandOffMedRows={setHandOffMedRows}
                      setHandOffPrnRows={setHandOffPrnRows}
                      setHandOffOtcRows={setHandOffOtcRows}
                      setYouthReceivedToggle={setYouthReceivedToggle}
                      setRecipientType={setRecipientType}
                      setRecipientName={setRecipientName}
                      setPackComment={setPackComment}
                      setHandOffInnerTab={setHandOffInnerTab}
                      handOffInnerTab={handOffInnerTab}
                      handOffLogEntries={handOffLogEntries}
                      isYouthReceivedModalOpen={isYouthReceivedModalOpen}
                      packComment={packComment}
                      handleCreatePack={handleCreatePack}
                      isDateChangeWarningOpen={isDateChangeWarningOpen}
                      pendingDateChange={pendingDateChange}
                      isSetPrimaryModalOpen={isSetPrimaryModalOpen}
                      setSetPrimarySelectedCode={setSetPrimarySelectedCode}
                      setSetPrimaryPackComment={setSetPrimaryPackComment}
                      setSetPrimaryCommentError={setSetPrimaryCommentError}
                      setPrimarySelectedCode={setPrimarySelectedCode}
                      setPrimaryPackComment={setPrimaryPackComment}
                      setPrimaryCommentError={setPrimaryCommentError}
                      setSetPrimaryLogEntries={setSetPrimaryLogEntries}
                      isModifyPrnDialogOpen={isModifyPrnDialogOpen}
                      selectedPrnIndex={selectedPrnIndex}
                      isModifyAllPrnDialogOpen={isModifyAllPrnDialogOpen}
                      isAddOtcDialogOpen={isAddOtcDialogOpen}
                      setIsAddOtcDialogOpen={setIsAddOtcDialogOpen}
                      newOtcForm={newOtcForm}
                      setNewOtcForm={setNewOtcForm}
                      isViewPackDialogOpen={isViewPackDialogOpen}
                      setIsViewPackDialogOpen={setIsViewPackDialogOpen}
                      selectedPack={selectedPack}
                      reviewMedRows={reviewMedRows}
                      setReviewMedRows={setReviewMedRows}
                      reviewPrnRows={reviewPrnRows}
                      setReviewPrnRows={setReviewPrnRows}
                      reviewOtcRows={reviewOtcRows}
                      setReviewOtcRows={setReviewOtcRows}
                      reviewLogEntries={reviewLogEntries}
                      setReviewLogEntries={setReviewLogEntries}
                      reviewInnerTab={reviewInnerTab}
                      setReviewInnerTab={setReviewInnerTab}
                      isSetReviewStatusModalOpen={isSetReviewStatusModalOpen}
                      setIsSetReviewStatusModalOpen={setIsSetReviewStatusModalOpen}
                      reviewModalPrimaryCode={reviewModalPrimaryCode}
                      setReviewModalPrimaryCode={setReviewModalPrimaryCode}
                      reviewModalComment={reviewModalComment}
                      setReviewModalComment={setReviewModalComment}
                      reviewModalCommentError={reviewModalCommentError}
                      setReviewModalCommentError={setReviewModalCommentError}
                      isReviewMedHistoryOpen={isReviewMedHistoryOpen}
                      setIsReviewMedHistoryOpen={setIsReviewMedHistoryOpen}
                      reviewHistoryMedication={reviewHistoryMedication}
                      setReviewHistoryMedication={setReviewHistoryMedication}
                      disposalMedRows={disposalMedRows}
                      setDisposalMedRows={setDisposalMedRows}
                      disposalPrnRows={disposalPrnRows}
                      setDisposalPrnRows={setDisposalPrnRows}
                      disposalOtcRows={disposalOtcRows}
                      setDisposalOtcRows={setDisposalOtcRows}
                      disposalLogEntries={disposalLogEntries}
                      setDisposalLogEntries={setDisposalLogEntries}
                      disposalInnerTab={disposalInnerTab}
                      setDisposalInnerTab={setDisposalInnerTab}
                      isMassDisposalModalOpen={isMassDisposalModalOpen}
                      setIsMassDisposalModalOpen={setIsMassDisposalModalOpen}
                      massDisposalModalRows={massDisposalModalRows}
                      setMassDisposalModalRows={setMassDisposalModalRows}
                      massDisposalDate={massDisposalDate}
                      setMassDisposalDate={setMassDisposalDate}
                      massDisposalCancelConfirmOpen={massDisposalCancelConfirmOpen}
                      setMassDisposalCancelConfirmOpen={setMassDisposalCancelConfirmOpen}
                      youthName={youthName}
                    />
    </>
  );
}
