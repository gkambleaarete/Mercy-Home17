import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Edit2, Save, Plus, Check, AlertCircle, AlertTriangle, MoreHorizontal, Eye, RefreshCw, Download, FileText, ClipboardList, Printer, X, Search, Package, Settings, Tag, Trash2, Calculator, ChevronUp, ChevronDown, ChevronsUpDown, Filter } from "@/app/lib/lucide-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { cn } from "../../lib/utils";
import { toast } from "sonner@2.0.3";
import { PassList } from "../passes/PassList";
import { findYouthIdByName } from "../../data/mockYouthProgramData";
import { LegalInvolvementSection } from "./LegalInvolvementSection";
import { LegalHistorySection } from "./LegalHistorySection";
import { TraumaHistorySection } from "./TraumaHistorySection";
import { TestingAssessmentsSection } from "./TestingAssessmentsSection";
import { CurrentMedicalNeedsSection } from "./CurrentMedicalNeedsSection";
import { PhysicalHealthHistorySection } from "./PhysicalHealthHistorySection";
import { PhysicalHealthConnectionsSection } from "./PhysicalHealthConnectionsSection";
import { MentalHealthOverviewSection } from "./MentalHealthOverviewSection";
import { MentalHealthHistorySection } from "./MentalHealthHistorySection";
import { MentalHealthConnectionsSection } from "./MentalHealthConnectionsSection";
import { PTPSection } from "./PTPSection";
import { PersonalDevelopmentGoalsSection } from "./PersonalDevelopmentGoalsSection";
import { PersonalDevelopmentStrengthsSection } from "./PersonalDevelopmentStrengthsSection";
import { PersonalDevelopmentCopingSkillsSection } from "./PersonalDevelopmentCopingSkillsSection";
import { PersonalDevelopmentTriggersSection } from "./PersonalDevelopmentTriggersSection";
import { TreatmentSupplementalPlansSection } from "./TreatmentSupplementalPlansSection";
import { IndividualTreatmentPlanSection } from "./IndividualTreatmentPlanSection";
import { TransitionPlanningSection } from "./TransitionPlanningSection";
import { PrescriptionsSection } from "./PrescriptionsSection";
import { MedCodePicker, type MedCode } from "./MedCodePicker";
import { OtherTabsMedicationsSection } from "./OtherTabsMedicationsSection";
import { OtherTabsAdministrationSection } from "./OtherTabsAdministrationSection";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, formatMdy, localTodayIso } from "../../lib/dateFormat";
import { getDemoUserName } from "../../lib/demoIdentity";

// Canonical medication codes — single source of truth for all contexts
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

// Codes that trigger audit flag automatically on submission
const AUDIT_FLAG_CODES = new Set(["ADS", "MDS", "EMP", "UNS", "WTU", "MPM", "ABS", "CON", "REF", "OTH"]);

// Set Primary flat list: PAK/SCH first, then remaining in spec order
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

const codeAuditFlag = (fullCodeValue: string): boolean => {
    const code = fullCodeValue.split(" -- ")[0];
    return AUDIT_FLAG_CODES.has(code);
};

interface OtherTabsContentRendererProps {
    activeTab: string;
    activeDropdownItem: string;
    activeHorizontalTab: string;
    setActiveHorizontalTab: (tab: string) => void;
    youth?: { id: string | number; name: string };
}

export function OtherTabsContentRenderer({ activeTab, activeDropdownItem, activeHorizontalTab, setActiveHorizontalTab, youth }: OtherTabsContentRendererProps) {
    const navigate = useNavigate();
    const params = useParams();
    const [isEditing, setIsEditing] = useState(false);

    // Get youth ID from prop or URL params
    const youthId = youth?.id || params.id;
    const [prescriptionSubTab, setPrescriptionSubTab] = useState<"Current" | "Pending" | "Archived">("Current");
    const [isMedHistoryDialogOpen, setIsMedHistoryDialogOpen] = useState(false);
    const [selectedMedication, setSelectedMedication] = useState<any>(null);
    const [isAddPrescriptionDialogOpen, setIsAddPrescriptionDialogOpen] = useState(false);
    const [createPlanTrigger, setCreatePlanTrigger] = useState(0);
    const [addSupPlanTrigger, setAddSupPlanTrigger] = useState(0); // trigger for supplemental plans add dialog
    const [isTestSetDialogOpen, setIsTestSetDialogOpen] = useState(false);
    const [testSetData, setTestSetData] = useState({
        date: localTodayIso(),
        time: '12:00',
        reason: ''
    });
    const [testRecords, setTestRecords] = useState<Array<{
        id: number;
        date: string;
        time: string;
        reason: string;
        newUse: string;
        result: 'negative' | 'positive' | 'pending';
    }>>([
        {
            id: 1,
            date: '02/20/2026',
            time: '10:30 AM',
            reason: 'Program Random Test',
            newUse: 'None',
            result: 'negative'
        },
        {
            id: 2,
            date: '02/15/2026',
            time: '02:15 PM',
            reason: 'Admissions Test',
            newUse: 'Cannabis',
            result: 'positive'
        },
        {
            id: 3,
            date: '02/10/2026',
            time: '09:45 AM',
            reason: 'Treatment Plan',
            newUse: 'None',
            result: 'negative'
        },
        {
            id: 4,
            date: '02/05/2026',
            time: '11:20 AM',
            reason: 'Suspicion of Use',
            newUse: 'Alcohol',
            result: 'pending'
        },
        {
            id: 5,
            date: '01/28/2026',
            time: '03:00 PM',
            reason: 'Self-Disclosure',
            newUse: 'Marijuana, Alcohol',
            result: 'positive'
        }
    ]);
    const [isDisclosureDialogOpen, setIsDisclosureDialogOpen] = useState(false);
    const [disclosureData, setDisclosureData] = useState({
        date: localTodayIso(),
        time: '12:00',
        relatedToTest: 'No',
        reporter: '',
        substances: '',
        comments: ''
    });

    // Pack Meds State
    const [packMedsSubTab, setPackMedsSubTab] = useState<"active" | "archive">("active");
    const [selectedPackId, setSelectedPackId] = useState<number | null>(null);
    const [isCreatePackDialogOpen, setIsCreatePackDialogOpen] = useState(false);
    const [isViewPackDialogOpen, setIsViewPackDialogOpen] = useState(false);
    interface MedicationPack {
        id: number;
        packName: string;
        packStatus: "Available" | "Selected" | "Dispensed" | "Received";
        packType: string;
        expectedHandoffDate: string;
        startDate: string;
        startTime: string;
        endDate: string;
        endTime: string;
        status: "active" | "archived";
        medications: Array<{ name: string; dose: string; frequency: string }>;
        createdBy: string;
        createdDate: string;
    }
    const youthDisplayName = youth?.name || "Alex Martinez";
    const [medicationPacks, setMedicationPacks] = useState<MedicationPack[]>([
        { id: 6, packName: "Alex Martinez 06/22/2026-06/28/2026", packStatus: "Available", packType: "Non-Scheduled",  expectedHandoffDate: "07/01/2026", startDate: "06/22/2026", startTime: "08:00 AM", endDate: "06/28/2026", endTime: "08:00 AM", status: "active",   medications: [{ name: "Abilify (Aripiprazole)", dose: "10mg", frequency: "Morning" }], createdBy: "Sarah Johnson, MSW", createdDate: "06/22/2026" },
        { id: 4, packName: "Alex Martinez 06/15/2026-06/21/2026", packStatus: "Available", packType: "Scheduled II",   expectedHandoffDate: "06/20/2026", startDate: "06/15/2026", startTime: "08:00 AM", endDate: "06/21/2026", endTime: "08:00 AM", status: "active",   medications: [{ name: "Lexapro (Escitalopram)", dose: "20mg", frequency: "Morning" }], createdBy: "Sarah Johnson, MSW", createdDate: "06/15/2026" },
        { id: 3, packName: "Alex Martinez 06/08/2026-06/14/2026", packStatus: "Dispensed", packType: "Non-Scheduled",  expectedHandoffDate: "06/15/2026", startDate: "06/08/2026", startTime: "09:00 AM", endDate: "06/14/2026", endTime: "09:00 AM", status: "active",   medications: [{ name: "Concerta (Methylphenidate)", dose: "36mg", frequency: "Morning" }], createdBy: "Dr. Emily Martinez", createdDate: "06/08/2026" },
        { id: 2, packName: "Alex Martinez 06/05/2026-06/22/2026", packStatus: "Selected",  packType: "Scheduled IV",   expectedHandoffDate: "06/12/2026", startDate: "06/05/2026", startTime: "12:00 PM", endDate: "06/22/2026", endTime: "12:00 PM", status: "active",   medications: [{ name: "Abilify (Aripiprazole)", dose: "10mg", frequency: "Morning" }, { name: "Melatonin", dose: "3mg", frequency: "Bedtime" }], createdBy: "Dr. Emily Martinez", createdDate: "06/05/2026" },
        { id: 1, packName: "Alex Martinez 06/01/2026-06/07/2026", packStatus: "Available", packType: "Scheduled II",   expectedHandoffDate: "06/10/2026", startDate: "06/01/2026", startTime: "08:00 AM", endDate: "06/07/2026", endTime: "08:00 PM", status: "active",   medications: [{ name: "Lexapro (Escitalopram)", dose: "20mg", frequency: "Morning" }], createdBy: "Sarah Johnson, MSW", createdDate: "06/01/2026" },
        { id: 5, packName: "Alex Martinez 06/01/2026-06/07/2026", packStatus: "Received",  packType: "Scheduled III",  expectedHandoffDate: "06/08/2026", startDate: "06/01/2026", startTime: "10:00 AM", endDate: "06/07/2026", endTime: "10:00 AM", status: "archived", medications: [{ name: "Concerta (Methylphenidate)", dose: "36mg", frequency: "Morning" }, { name: "Abilify (Aripiprazole)", dose: "10mg", frequency: "Morning" }], createdBy: "Dr. Emily Martinez", createdDate: "06/01/2026" },
    ]);

    type PackSortCol = "packName" | "packStatus" | "packType" | "expectedHandoffDate" | "startDate" | "startTime" | "endDate" | "endTime";
    const [activePackSort, setActivePackSort] = useState<{ col: PackSortCol; dir: "asc" | "desc" }>({ col: "startDate", dir: "desc" });
    const [archivePackSort, setArchivePackSort] = useState<{ col: PackSortCol; dir: "asc" | "desc" }>({ col: "startDate", dir: "desc" });
    const [activePackFilter, setActivePackFilter] = useState("");
    const [archivePackFilter, setArchivePackFilter] = useState("");
    // Start Date funnel filter
    const [startDateFilter, setStartDateFilter] = useState<string>("all");
    const [startDateFilterCustom, setStartDateFilterCustom] = useState<string>("");
    const [isStartDateFilterOpen, setIsStartDateFilterOpen] = useState(false);
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
    const [dateFilterModalType, setDateFilterModalType] = useState<"relative" | "specific">("relative");
    const [dateFilterDraftValue, setDateFilterDraftValue] = useState<string>("all");
    const startDateFunnelRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (!isStartDateFilterOpen) return;
        const handler = (e: MouseEvent) => {
            if (startDateFunnelRef.current && !startDateFunnelRef.current.contains(e.target as Node)) {
                setIsStartDateFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isStartDateFilterOpen]);

    // End Date funnel filter
    const [endDateFilter, setEndDateFilter] = useState<string>("all");
    const [endDateFilterCustom, setEndDateFilterCustom] = useState<string>("");
    const [isEndDateFilterOpen, setIsEndDateFilterOpen] = useState(false);
    const [endDateFilterModalType, setEndDateFilterModalType] = useState<"relative" | "specific">("relative");
    const [endDateFilterDraftValue, setEndDateFilterDraftValue] = useState<string>("all");
    const endDateFunnelRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (!isEndDateFilterOpen) return;
        const handler = (e: MouseEvent) => {
            if (endDateFunnelRef.current && !endDateFunnelRef.current.contains(e.target as Node)) {
                setIsEndDateFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isEndDateFilterOpen]);

    const DATE_COLS = new Set<PackSortCol>(["startDate", "endDate", "expectedHandoffDate"]);
    // Parse MM/DD/YYYY to a sortable timestamp (returns 0 for invalid)
    function parseDateMMDDYYYY(s: string): number {
        const [m, d, y] = s.split("/").map(Number);
        if (!m || !d || !y) return 0;
        return new Date(y, m - 1, d).getTime();
    }
    function sortPacks(packs: MedicationPack[], sort: { col: PackSortCol; dir: "asc" | "desc" }) {
        return [...packs].sort((a, b) => {
            const av = a[sort.col] ?? "";
            const bv = b[sort.col] ?? "";
            let cmp: number;
            if (DATE_COLS.has(sort.col)) {
                cmp = parseDateMMDDYYYY(av) - parseDateMMDDYYYY(bv);
            } else {
                cmp = av < bv ? -1 : av > bv ? 1 : 0;
            }
            return sort.dir === "asc" ? cmp : -cmp;
        });
    }
    function filterPacks(packs: MedicationPack[], query: string) {
        if (!query.trim()) return packs;
        const q = query.toLowerCase();
        return packs.filter(p =>
            p.packName.toLowerCase().includes(q) ||
            p.packStatus.toLowerCase().includes(q) ||
            p.packType.toLowerCase().includes(q) ||
            p.startDate.includes(q) ||
            p.endDate.includes(q) ||
            p.expectedHandoffDate.includes(q)
        );
    }
    function toggleSort(current: { col: PackSortCol; dir: "asc" | "desc" }, col: PackSortCol, setter: (v: { col: PackSortCol; dir: "asc" | "desc" }) => void) {
        setter(current.col === col ? { col, dir: current.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" });
    }
    const [newPackForm, setNewPackForm] = useState({
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        expectedHandoffDate: ""
    });

    // Create Pack Dialog multi-step state
    const [createPackActiveTab, setCreatePackActiveTab] = useState<"doses" | "setPrimary" | "packingPrep" | "dispense" | "count" | "handOff" | "review" | "disposal">("doses");
    const [dateRangeApplied, setDateRangeApplied] = useState(false);
    const [appliedDateRange, setAppliedDateRange] = useState({ startDate: "", startTime: "", endDate: "", endTime: "" });
    const [isDateChangeWarningOpen, setIsDateChangeWarningOpen] = useState(false);
    const [pendingDateChange, setPendingDateChange] = useState<Partial<typeof newPackForm> | null>(null);
    const [isAddOtcDialogOpen, setIsAddOtcDialogOpen] = useState(false);
    const [isModifyPrnDialogOpen, setIsModifyPrnDialogOpen] = useState(false);
    const [isModifyAllPrnDialogOpen, setIsModifyAllPrnDialogOpen] = useState(false);
    const [isModifyOtcDialogOpen, setIsModifyOtcDialogOpen] = useState(false);
    const [selectedPrnIndex, setSelectedPrnIndex] = useState<number | null>(null);
    const [selectedOtcIndex, setSelectedOtcIndex] = useState<number | null>(null);

    interface PrnMedication {
        medication: string;
        doses: string;
    }
    interface OtcMedication {
        medication: string;
        dose: string;
        quantity: string;
        doses: string;
        status: "Approved" | "Not Approved";
        availableDoses: string[];
    }
    const defaultPrnMedications: PrnMedication[] = [
        { medication: "Ibuprofen 400mg", doses: "2" },
        { medication: "Albuterol Inhaler", doses: "1" },
        { medication: "Diphenhydramine (Benadryl) 25mg", doses: "1" },
    ];
    const defaultOtcMedications: OtcMedication[] = [
        { medication: "Melatonin", dose: "", quantity: "", doses: "", status: "Approved", availableDoses: ["1mg", "2.5mg", "3mg", "5mg"] },
        { medication: "Acetaminophen (Tylenol)", dose: "", quantity: "", doses: "", status: "Approved", availableDoses: ["325mg", "500mg", "650mg"] },
        { medication: "Cetirizine (Zyrtec)", dose: "", quantity: "", doses: "", status: "Approved", availableDoses: ["5mg", "10mg"] },
        { medication: "Miralax", dose: "", quantity: "", doses: "", status: "Not Approved", availableDoses: ["17g"] },
        { medication: "Loratadine (Claritin)", dose: "", quantity: "", doses: "", status: "Approved", availableDoses: ["5mg", "10mg"] },
    ];
    const [prnMedications, setPrnMedications] = useState<PrnMedication[]>([]);
    const [otcMedications, setOtcMedications] = useState<OtcMedication[]>([]);
    const [newOtcForm, setNewOtcForm] = useState<OtcMedication>({ medication: "", dose: "", quantity: "", doses: "", status: "Approved", availableDoses: [] });

    // Set Primary Tab State
    const [isSetPrimaryModalOpen, setIsSetPrimaryModalOpen] = useState(false);
    const [setPrimarySelectedCode, setSetPrimarySelectedCode] = useState("");
    const [setPrimaryPackComment, setSetPrimaryPackComment] = useState("");
    const [setPrimaryShowLog, setSetPrimaryShowLog] = useState(false);
    type PackStatus = "Available" | "Selected" | "Dispensed" | "Received" | "Reviewed";
    interface SetPrimaryMedRow {
        id: number;
        selected: boolean;
        drugName: string;
        start: string;
        stop: string;
        packStatus: PackStatus;
        primaryCode: string;
        dateGroup?: string;
        dosePeriod?: string;
        outOfRange?: boolean;
    }
    interface SetPrimaryOtcRow {
        id: number;
        selected: boolean;
        drugName: string;
        dose: string;
        quantity: string;
        packStatus: PackStatus;
        primaryCode: string;
    }
    const [setPrimaryMedRows, setSetPrimaryMedRows] = useState<SetPrimaryMedRow[]>([
        { id: 1, selected: false, drugName: "Abilify (Aripiprazole) 10mg", start: "06/22/2026", stop: "06/22/2026", packStatus: "Available", primaryCode: "", dateGroup: "06/22/2026", dosePeriod: "Morning" },
        { id: 2, selected: false, drugName: "Lexapro (Escitalopram) 20mg", start: "06/22/2026", stop: "06/22/2026", packStatus: "Available", primaryCode: "", dateGroup: "06/22/2026", dosePeriod: "Morning" },
        { id: 3, selected: false, drugName: "Concerta (Methylphenidate) 36mg", start: "06/22/2026", stop: "06/22/2026", packStatus: "Dispensed", primaryCode: "P-001", dateGroup: "06/22/2026", dosePeriod: "Morning" },
        { id: 4, selected: false, drugName: "Abilify (Aripiprazole) 10mg", start: "06/22/2026", stop: "06/22/2026", packStatus: "Available", primaryCode: "", dateGroup: "06/22/2026", dosePeriod: "Evening" },
        { id: 5, selected: false, drugName: "Lexapro (Escitalopram) 20mg", start: "06/23/2026", stop: "06/23/2026", packStatus: "Available", primaryCode: "", dateGroup: "06/23/2026", dosePeriod: "Morning" },
        { id: 6, selected: false, drugName: "Concerta (Methylphenidate) 36mg", start: "06/23/2026", stop: "06/23/2026", packStatus: "Selected", primaryCode: "P-002", dateGroup: "06/23/2026", dosePeriod: "Morning" },
        { id: 7, selected: false, drugName: "Abilify (Aripiprazole) 10mg", start: "06/21/2026", stop: "06/21/2026", packStatus: "Available", primaryCode: "", dateGroup: "06/21/2026", dosePeriod: "Evening", outOfRange: true },
    ]);
    const [setPrimaryPrnRows, setSetPrimaryPrnRows] = useState<SetPrimaryMedRow[]>([
        { id: 10, selected: false, drugName: "Ibuprofen 400mg", start: "ALL DAY", stop: "ALL DAY", packStatus: "Available", primaryCode: "" },
        { id: 11, selected: false, drugName: "Ibuprofen 400mg", start: "ALL DAY", stop: "ALL DAY", packStatus: "Available", primaryCode: "" },
        { id: 12, selected: false, drugName: "Albuterol Inhaler", start: "ALL DAY", stop: "ALL DAY", packStatus: "Dispensed", primaryCode: "P-001" },
    ]);
    const [setPrimaryOtcRowsData, setSetPrimaryOtcRowsData] = useState<SetPrimaryOtcRow[]>([
        { id: 20, selected: false, drugName: "Melatonin", dose: "3mg", quantity: "7", packStatus: "Available", primaryCode: "" },
        { id: 21, selected: false, drugName: "Acetaminophen (Tylenol)", dose: "500mg", quantity: "14", packStatus: "Selected", primaryCode: "P-003" },
    ]);
    interface SetPrimaryLogEntry {
        id: number;
        timestamp: string;
        user: string;
        action: string;
        detail: string;
    }
    const [setPrimaryLogEntries, setSetPrimaryLogEntries] = useState<SetPrimaryLogEntry[]>([
        { id: 1, timestamp: "06/22/2026 09:15 AM", user: "Sarah Johnson, MSW", action: "Code Assigned", detail: "PAK -- Packed - Pass/Outing assigned to Concerta (Methylphenidate) 36mg" },
        { id: 2, timestamp: "06/22/2026 09:16 AM", user: "Sarah Johnson, MSW", action: "Code Assigned", detail: "PAK -- Packed - Pass/Outing assigned to Albuterol Inhaler (PRN)" },
    ]);
    const [setPrimaryCommentError, setSetPrimaryCommentError] = useState(false);

    // Packing Prep Tab State
    const [packingPrepInnerTab, setPackingPrepInnerTab] = useState<"checklist" | "labels" | "log">("checklist");
    const [isLabelStyleModalOpen, setIsLabelStyleModalOpen] = useState(false);
    interface PackPrepRow {
        id: number;
        selected: boolean;
        drugName: string;
        start: string;
        stop: string;
        status: string;
    }
    // AC3: Only rows with Pack Status of Selected, Dispensed, Received, or Reviewed carry forward from Set Primary
    const packPrepCarryStatuses: PackStatus[] = ["Selected", "Dispensed", "Received", "Reviewed"];
    const [packPrepMedSelected, setPackPrepMedSelected] = useState<Record<number, boolean>>({});
    const [packPrepPrnSelected, setPackPrepPrnSelected] = useState<Record<number, boolean>>({});
    const [packPrepOtcSelected, setPackPrepOtcSelected] = useState<Record<number, boolean>>({});
    const packPrepMedRows: PackPrepRow[] = setPrimaryMedRows
        .filter(r => packPrepCarryStatuses.includes(r.packStatus))
        .map(r => ({ id: r.id, selected: packPrepMedSelected[r.id] ?? false, drugName: r.drugName, start: r.start, stop: r.stop, status: r.packStatus }));
    const setPackPrepMedRows = (updater: PackPrepRow[] | ((prev: PackPrepRow[]) => PackPrepRow[])) => {
        const next = typeof updater === "function" ? updater(packPrepMedRows) : updater;
        setPackPrepMedSelected(Object.fromEntries(next.map(r => [r.id, r.selected])));
    };
    const packPrepPrnRows: PackPrepRow[] = setPrimaryPrnRows
        .filter(r => packPrepCarryStatuses.includes(r.packStatus))
        .map(r => ({ id: r.id, selected: packPrepPrnSelected[r.id] ?? false, drugName: r.drugName, start: r.start, stop: r.stop, status: r.packStatus }));
    const setPackPrepPrnRows = (updater: PackPrepRow[] | ((prev: PackPrepRow[]) => PackPrepRow[])) => {
        const next = typeof updater === "function" ? updater(packPrepPrnRows) : updater;
        setPackPrepPrnSelected(Object.fromEntries(next.map(r => [r.id, r.selected])));
    };
    const packPrepOtcRows: PackPrepRow[] = setPrimaryOtcRowsData
        .filter(r => packPrepCarryStatuses.includes(r.packStatus))
        .map(r => ({ id: r.id, selected: packPrepOtcSelected[r.id] ?? false, drugName: r.drugName, start: r.dose, stop: r.quantity, status: r.packStatus }));
    const setPackPrepOtcRows = (updater: PackPrepRow[] | ((prev: PackPrepRow[]) => PackPrepRow[])) => {
        const next = typeof updater === "function" ? updater(packPrepOtcRows) : updater;
        setPackPrepOtcSelected(Object.fromEntries(next.map(r => [r.id, r.selected])));
    };
    interface PackPrepLogEntry {
        id: number;
        timestamp: string;
        user: string;
        action: string;
        detail: string;
    }
    const [packPrepLogEntries] = useState<PackPrepLogEntry[]>([
        { id: 1, timestamp: "02/10/2026 10:30 AM", user: "Sarah Johnson, MSW", action: "Prepared", detail: "Abilify (Aripiprazole) 10mg prepared for packing" },
        { id: 2, timestamp: "02/10/2026 10:32 AM", user: "Sarah Johnson, MSW", action: "Label Printed", detail: "Label generated for Lexapro (Escitalopram) 20mg" },
    ]);

    // Dispense Tab State
    const [dispenseInnerTab, setDispenseInnerTab] = useState<"staffDispensed" | "reprintLabels" | "log">("staffDispensed");
    interface DispenseRow {
        id: number;
        selected: boolean;
        drugName: string;
        start: string;
        stop: string;
        status: string;
    }
    const [dispenseMedRows, setDispenseMedRows] = useState<DispenseRow[]>([
        { id: 1, selected: false, drugName: "Abilify (Aripiprazole) 10mg", start: "02/10/2026", stop: "02/14/2026", status: "Active" },
        { id: 2, selected: false, drugName: "Lexapro (Escitalopram) 20mg", start: "02/10/2026", stop: "02/14/2026", status: "Active" },
        { id: 3, selected: false, drugName: "Concerta (Methylphenidate) 36mg", start: "02/03/2026", stop: "02/07/2026", status: "Active" },
    ]);
    const [dispensePrnRows, setDispensePrnRows] = useState<DispenseRow[]>([
        { id: 10, selected: false, drugName: "Ibuprofen 400mg", start: "02/10/2026", stop: "02/14/2026", status: "Active" },
    ]);
    const [dispenseOtcRows, setDispenseOtcRows] = useState<DispenseRow[]>([
        { id: 20, selected: false, drugName: "Melatonin 3mg", start: "02/10/2026", stop: "02/14/2026", status: "Active" },
    ]);
    interface DispenseLogEntry {
        id: number;
        timestamp: string;
        user: string;
        action: string;
        detail: string;
    }
    const [dispenseLogEntries] = useState<DispenseLogEntry[]>([
        { id: 1, timestamp: "02/11/2026 08:15 AM", user: "Sarah Johnson, MSW", action: "Dispensed", detail: "Abilify (Aripiprazole) 10mg dispensed to youth" },
        { id: 2, timestamp: "02/11/2026 08:16 AM", user: "Sarah Johnson, MSW", action: "Dispensed", detail: "Lexapro (Escitalopram) 20mg dispensed to youth" },
    ]);

    // Count Tab State
    interface CountRow {
        id: number;
        dosePeriod: string;
        medicationDose: string;
        countType: string;
        lastCount: string;
        currentCount: string;
        comments: string;
        selected: boolean;
    }
    const [countRows, setCountRows] = useState<CountRow[]>([
        { id: 1, dosePeriod: "Morning", medicationDose: "Abilify (Aripiprazole) 10mg", countType: "Units", lastCount: "5.00", currentCount: "", comments: "", selected: false },
        { id: 2, dosePeriod: "Morning", medicationDose: "Lexapro (Escitalopram) 20mg", countType: "Units", lastCount: "7.00", currentCount: "", comments: "", selected: false },
        { id: 3, dosePeriod: "Afternoon", medicationDose: "Acetaminophen and Codeine 34", countType: "Units", lastCount: "3.00", currentCount: "", comments: "", selected: false },
        { id: 4, dosePeriod: "Evening", medicationDose: "Melatonin 3mg", countType: "Units", lastCount: "10.00", currentCount: "", comments: "", selected: false },
    ]);

    // Track original values for count rows to enable/disable save button
    const [countRowsOriginal, setCountRowsOriginal] = useState<Record<number, { currentCount: string; comments: string }>>({
        1: { currentCount: "", comments: "" },
        2: { currentCount: "", comments: "" },
        3: { currentCount: "", comments: "" },
        4: { currentCount: "", comments: "" },
    });

    // Helper function to check if a row has unsaved changes
    const hasRowChanges = (rowId: number, currentCount: string, comments: string) => {
        const original = countRowsOriginal[rowId];
        if (!original) return false;
        return original.currentCount !== currentCount || original.comments !== comments;
    };

    // Administration Log State
    interface AdminLogEntry {
        id: number;
        selected: boolean;
        doseDate: string;
        dosePeriod: string;
        inst: string;
        seq: string;
        logType: string;
        quantity: string;
        primaryCode: string;
        secondaryCode: string;
        attestationDate: string;
        attestationStaff: string;
        medicationDose: string;
    }
    const [adminLogEntries, setAdminLogEntries] = useState<AdminLogEntry[]>([
        {
            id: 1,
            selected: false,
            doseDate: "08/27/2025",
            dosePeriod: "1",
            inst: "1",
            seq: "1",
            logType: "Unapproved Dispensation",
            quantity: "",
            primaryCode: "",
            secondaryCode: "",
            attestationDate: "08/27/2025 10:50 AM",
            attestationStaff: "Lucila Kovalevych",
            medicationDose: "Abilify Maintena test"
        },
        {
            id: 2,
            selected: false,
            doseDate: "08/27/2025",
            dosePeriod: "1",
            inst: "1",
            seq: "1",
            logType: "OTC Dispensation",
            quantity: "34.00",
            primaryCode: "",
            secondaryCode: "",
            attestationDate: "08/27/2025 10:49 AM",
            attestationStaff: "Lucila Kovalevych",
            medicationDose: "Calcium Carbonate Antacid 500mg"
        }
    ]);

    // Hand Off Tab State
    const [handOffInnerTab, setHandOffInnerTab] = useState<"youthReceived" | "log">("youthReceived");
    interface HandOffRow {
        id: number;
        selected: boolean;
        drugName: string;
        start: string;
        stop: string;
        status: string;
        dateGroup?: string;
        dosePeriod?: string;
    }
    const [handOffMedRows, setHandOffMedRows] = useState<HandOffRow[]>([
        { id: 1, selected: false, drugName: "Abilify (Aripiprazole) 10mg", start: "02/10/2026", stop: "02/14/2026", status: "Dispensed", dateGroup: "02/10/2026", dosePeriod: "Morning" },
        { id: 2, selected: false, drugName: "Lexapro (Escitalopram) 20mg", start: "02/10/2026", stop: "02/14/2026", status: "Dispensed", dateGroup: "02/10/2026", dosePeriod: "Morning" },
        { id: 5, selected: false, drugName: "Prozac (Fluoxetine) 20mg", start: "02/10/2026", stop: "02/14/2026", status: "Selected", dateGroup: "02/10/2026", dosePeriod: "Evening" },
        { id: 3, selected: false, drugName: "Concerta (Methylphenidate) 36mg", start: "02/11/2026", stop: "02/14/2026", status: "Received", dateGroup: "02/11/2026", dosePeriod: "Afternoon" },
        { id: 4, selected: false, drugName: "Zoloft (Sertraline) 50mg", start: "02/12/2026", stop: "02/14/2026", status: "Reviewed", dateGroup: "02/12/2026", dosePeriod: "Morning" },
    ]);
    const [handOffPrnRows, setHandOffPrnRows] = useState<HandOffRow[]>([
        { id: 10, selected: false, drugName: "Ibuprofen 400mg", start: "02/10/2026", stop: "02/14/2026", status: "Dispensed" },
        { id: 12, selected: false, drugName: "Diphenhydramine (Benadryl) 25mg", start: "02/10/2026", stop: "02/14/2026", status: "Selected" },
        { id: 11, selected: false, drugName: "Albuterol Inhaler", start: "02/10/2026", stop: "02/14/2026", status: "Received" },
    ]);
    const [handOffOtcRows, setHandOffOtcRows] = useState<HandOffRow[]>([
        { id: 20, selected: false, drugName: "Melatonin 3mg", start: "02/10/2026", stop: "02/14/2026", status: "Dispensed" },
        { id: 21, selected: false, drugName: "Acetaminophen (Tylenol) 500mg", start: "02/10/2026", stop: "02/14/2026", status: "Dispensed" },
        { id: 22, selected: false, drugName: "Cetirizine (Zyrtec) 10mg", start: "02/10/2026", stop: "02/14/2026", status: "Selected" },
    ]);
    interface HandOffLogEntry {
        id: number;
        timestamp: string;
        user: string;
        action: string;
        detail: string;
    }
    const [handOffLogEntries] = useState<HandOffLogEntry[]>([
        { id: 1, timestamp: "02/12/2026 03:45 PM", user: "Mike Torres, RN", action: "Handed Off", detail: "Pack handed off to youth — Abilify (Aripiprazole) 10mg confirmed received" },
    ]);

    // Youth Received Modal State
    const [isYouthReceivedModalOpen, setIsYouthReceivedModalOpen] = useState(false);
    const [youthReceivedToggle, setYouthReceivedToggle] = useState<"youthReceived" | "otherRecipient">("youthReceived");
    const [recipientType, setRecipientType] = useState("");
    const [recipientName, setRecipientName] = useState("");
    const [packComment, setPackComment] = useState("");

    // Review Tab State
    const [reviewInnerTab, setReviewInnerTab] = useState<"review" | "log">("review");
    interface ReviewMedRow {
        id: number;
        selected: boolean;
        medication: string;
        start: string;
        stop: string;
        status: "Received" | "Reviewed" | "Dispensed";
        primaryCode: string;
        dosePeriod: string;
        dateGroup: string;
    }
    interface ReviewPrnRow {
        id: number;
        selected: boolean;
        medication: string;
        start: string;
        stop: string;
        status: "Received" | "Reviewed" | "Dispensed";
        primaryCode: string;
    }
    interface ReviewOtcRow {
        id: number;
        selected: boolean;
        medication: string;
        dose: string;
        quantity: string;
        status: "Received" | "Reviewed" | "Dispensed";
        primaryCode: string;
    }
    interface ReviewLogEntry {
        id: number;
        timestamp: string;
        user: string;
        action: string;
        originalCode: string;
        primaryCode: string;
        comment: string;
        detail: string;
        medication: string;
    }
    const [reviewMedRows, setReviewMedRows] = useState<ReviewMedRow[]>([
        { id: 1, selected: false, medication: "Abilify (Aripiprazole) 10mg", start: "01/15/2026", stop: "06/30/2026", status: "Received", primaryCode: "", dosePeriod: "AM", dateGroup: "06/09/2026" },
        { id: 2, selected: false, medication: "Lexapro (Escitalopram) 20mg", start: "02/01/2026", stop: "07/31/2026", status: "Received", primaryCode: "", dosePeriod: "AM", dateGroup: "06/09/2026" },
        { id: 3, selected: false, medication: "Clonidine 0.1mg", start: "03/10/2026", stop: "06/30/2026", status: "Reviewed", primaryCode: "MPM -- Missed Packed Med", dosePeriod: "PM", dateGroup: "06/09/2026" },
        { id: 4, selected: false, medication: "Risperdal (Risperidone) 1mg", start: "01/15/2026", stop: "06/30/2026", status: "Received", primaryCode: "", dosePeriod: "AM", dateGroup: "06/10/2026" },
    ]);
    const [reviewPrnRows, setReviewPrnRows] = useState<ReviewPrnRow[]>([
        { id: 10, selected: false, medication: "Ibuprofen 400mg", start: "01/01/2026", stop: "12/31/2026", status: "Received", primaryCode: "" },
        { id: 11, selected: false, medication: "Melatonin 3mg", start: "03/01/2026", stop: "12/31/2026", status: "Reviewed", primaryCode: "MPM -- Missed Packed Med" },
    ]);
    const [reviewOtcRows, setReviewOtcRows] = useState<ReviewOtcRow[]>([
        { id: 20, selected: false, medication: "Vitamin D3 1000IU", dose: "1000IU", quantity: "30", status: "Received", primaryCode: "" },
        { id: 21, selected: false, medication: "Zinc 25mg", dose: "25mg", quantity: "60", status: "Reviewed", primaryCode: "MPM -- Missed Packed Med" },
    ]);
    const [reviewLogEntries, setReviewLogEntries] = useState<ReviewLogEntry[]>([
        { id: 1, timestamp: "06/09/2026 04:10 PM", user: "Sarah Johnson, MSW", action: "Review", originalCode: "", primaryCode: "MPM -- Missed Packed Med", comment: "Youth refused evening dose.", detail: "Pack Status set to Reviewed — Clonidine 0.1mg (PM)", medication: "Clonidine 0.1mg" },
    ]);
    const [isSetReviewStatusModalOpen, setIsSetReviewStatusModalOpen] = useState(false);
    const [reviewModalPrimaryCode, setReviewModalPrimaryCode] = useState("MPM -- Missed Packed Med");
    const [reviewModalComment, setReviewModalComment] = useState("");
    const [reviewModalCommentError, setReviewModalCommentError] = useState(false);
    const [isReviewMedHistoryOpen, setIsReviewMedHistoryOpen] = useState(false);
    const [reviewHistoryMedication, setReviewHistoryMedication] = useState("");

    // Disposal Tab State
    interface DisposalMedRow {
        id: number;
        selected: boolean;
        medication: string;
        start: string;
        stop: string;
        status: "Reviewed" | "Pending" | "Disposed";
        primaryCode: string;
        dosePeriod: string;
        dateGroup: string;
        packComment: string;
        countType: "Units" | "Volume";
    }
    interface DisposalPrnRow {
        id: number;
        selected: boolean;
        medication: string;
        start: string;
        stop: string;
        status: "Reviewed" | "Pending" | "Disposed";
        primaryCode: string;
        dosePeriod: string;
        packComment: string;
        countType: "Units" | "Volume";
    }
    interface DisposalOtcRow {
        id: number;
        selected: boolean;
        medication: string;
        dose: string;
        quantity: string;
        status: "Reviewed" | "Pending" | "Disposed";
        primaryCode: string;
        dosePeriod: string;
        packComment: string;
        countType: "Units" | "Volume";
    }
    interface DisposalLogEntry {
        id: number;
        timestamp: string;
        user: string;
        action: string;
        detail: string;
    }
    interface MassDisposalModalRow {
        id: number;
        medicationDosePeriod: string;
        countType: "Units" | "Volume";
        amountDisposed: string;
        comments: string;
        removePending: boolean;
    }
    const [disposalMedRows, setDisposalMedRows] = useState<DisposalMedRow[]>([
        { id: 1, selected: false, medication: "Abilify (Aripiprazole) 10mg", start: "01/15/2026", stop: "06/30/2026", status: "Reviewed", primaryCode: "SC-4521", dosePeriod: "AM", dateGroup: "06/09/2026", packComment: "Administered without issue.", countType: "Units" },
        { id: 2, selected: false, medication: "Lexapro (Escitalopram) 20mg", start: "02/01/2026", stop: "07/31/2026", status: "Reviewed", primaryCode: "SC-4521", dosePeriod: "AM", dateGroup: "06/09/2026", packComment: "", countType: "Units" },
        { id: 3, selected: false, medication: "Clonidine 0.1mg", start: "03/10/2026", stop: "06/30/2026", status: "Pending", primaryCode: "", dosePeriod: "PM", dateGroup: "06/09/2026", packComment: "", countType: "Units" },
        { id: 4, selected: false, medication: "Risperdal (Risperidone) 1mg", start: "01/15/2026", stop: "06/30/2026", status: "Reviewed", primaryCode: "SC-4521", dosePeriod: "AM", dateGroup: "06/10/2026", packComment: "Youth cooperative.", countType: "Units" },
    ]);
    const [disposalPrnRows, setDisposalPrnRows] = useState<DisposalPrnRow[]>([
        { id: 1, selected: false, medication: "Ibuprofen 400mg", start: "01/01/2026", stop: "12/31/2026", status: "Reviewed", primaryCode: "SC-4521", dosePeriod: "PRN", packComment: "", countType: "Units" },
        { id: 2, selected: false, medication: "Melatonin 3mg", start: "03/01/2026", stop: "12/31/2026", status: "Pending", primaryCode: "", dosePeriod: "PRN", packComment: "", countType: "Units" },
    ]);
    const [disposalOtcRows, setDisposalOtcRows] = useState<DisposalOtcRow[]>([
        { id: 1, selected: false, medication: "Vitamin D3 1000IU", dose: "1000IU", quantity: "30", status: "Reviewed", primaryCode: "SC-4521", dosePeriod: "AM", packComment: "", countType: "Units" },
        { id: 2, selected: false, medication: "Zinc 25mg", dose: "25mg", quantity: "60", status: "Pending", primaryCode: "", dosePeriod: "AM", packComment: "", countType: "Units" },
    ]);
    const [disposalLogEntries, setDisposalLogEntries] = useState<DisposalLogEntry[]>([]);
    const [disposalInnerTab, setDisposalInnerTab] = useState<"dispose" | "log">("dispose");
    const [isMassDisposalModalOpen, setIsMassDisposalModalOpen] = useState(false);
    const [massDisposalModalRows, setMassDisposalModalRows] = useState<MassDisposalModalRow[]>([]);
    const [massDisposalDate, setMassDisposalDate] = useState("");
    const [massDisposalCancelConfirmOpen, setMassDisposalCancelConfirmOpen] = useState(false);

    // Add Prescription Form State
    const [prescriptionForm, setPrescriptionForm] = useState({
        medication: "",
        package: "",
        dose: "",
        startDate: "",
        endDate: "",
        consentReceived: false,
        dosingPeriod: "",
        days: {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false
        },
        timeRanges: [{ from: "", to: "" }],
        treatmentPurpose: "",
        dosingLimits: "",
        countType: "",
        count: "",
        instructions: ""
    });

    // Mock medication and package options
    const medicationOptions = [
        { value: "abilify", label: "Abilify (Aripiprazole)" },
        { value: "adderall", label: "Adderall XR (Amphetamine/Dextroamphetamine)" },
        { value: "clonidine", label: "Clonidine (Clonidine HCl)" },
        { value: "concerta", label: "Concerta (Methylphenidate)" },
        { value: "intuniv", label: "Intuniv (Guanfacine)" },
        { value: "lexapro", label: "Lexapro (Escitalopram)" },
        { value: "prozac", label: "Prozac (Fluoxetine)" },
        { value: "risperdal", label: "Risperdal (Risperidone)" },
        { value: "seroquel", label: "Seroquel (Quetiapine)" },
        { value: "strattera", label: "Strattera (Atomoxetine)" },
        { value: "vyvanse", label: "Vyvanse (Lisdexamfetamine)" },
        { value: "zoloft", label: "Zoloft (Sertraline)" }
    ];

    const packageOptions = [
        { value: "30-tab-bottle", label: "30 Tablet Bottle" },
        { value: "60-tab-bottle", label: "60 Tablet Bottle" },
        { value: "90-tab-bottle", label: "90 Tablet Bottle" },
        { value: "30-cap-bottle", label: "30 Capsule Bottle" },
        { value: "60-cap-bottle", label: "60 Capsule Bottle" },
        { value: "90-cap-bottle", label: "90 Capsule Bottle" },
        { value: "liquid-120ml", label: "Liquid 120ml" },
        { value: "liquid-240ml", label: "Liquid 240ml" }
    ];

    const dosingPeriodOptions = [
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
        { value: "biweekly", label: "Bi-Weekly" },
        { value: "monthly", label: "Monthly" },
        { value: "as-needed", label: "As Needed (PRN)" }
    ];

    const countTypeOptions = [
        { value: "tablets", label: "Tablets" },
        { value: "capsules", label: "Capsules" },
        { value: "ml", label: "Milliliters (mL)" },
        { value: "doses", label: "Doses" }
    ];

    // Mock medication history data
    const medicationHistory = [
        {
            id: 1,
            name: "Abilify",
            genericName: "Aripiprazole",
            startDate: "06/12/2018",
            endDate: "08/15/2018",
            dose: "5mg once daily",
            psychotropic: true,
            details: "Discontinued due to side effects",
            prescriber: "Dr. Sarah Martinez",
            pharmacy: "CVS Pharmacy - Main St",
            reason: "Treatment of mood dysregulation",
            sideEffects: "Weight gain, drowsiness, increased appetite",
            discontinuedReason: "Patient experienced severe sedation and weight gain",
            notes: "Consider alternative antipsychotic if symptoms return"
        },
        {
            id: 2,
            name: "Adderall XR",
            genericName: "Amphetamine/Dextroamphetamine",
            startDate: "09/20/2018",
            endDate: "12/10/2019",
            dose: "20mg once daily",
            psychotropic: true,
            details: "Transitioned to Vyvanse",
            prescriber: "Dr. Michael Chen",
            pharmacy: "Walgreens - Park Ave",
            reason: "ADHD management",
            sideEffects: "Decreased appetite, insomnia, irritability",
            discontinuedReason: "Switched to longer-acting formulation for better coverage",
            notes: "Patient responded well but needed longer duration of action"
        },
        {
            id: 3,
            name: "Clonidine",
            genericName: "Clonidine HCl",
            startDate: "06/12/2018",
            endDate: "03/15/2019",
            dose: "0.1mg twice daily",
            psychotropic: true,
            details: "Replaced with Tenex",
            prescriber: "Dr. Sarah Martinez",
            pharmacy: "CVS Pharmacy - Main St",
            reason: "Hyperactivity and impulsivity management",
            sideEffects: "Dry mouth, fatigue, dizziness",
            discontinuedReason: "Transitioned to guanfacine for improved efficacy",
            notes: "Patient tolerated well but needed medication with better half-life"
        },
        {
            id: 4,
            name: "Melatonin",
            genericName: "Melatonin",
            startDate: "07/01/2018",
            endDate: "10/20/2018",
            dose: "3mg at bedtime",
            psychotropic: false,
            details: "OTC supplement, no longer needed",
            prescriber: "Dr. Sarah Martinez",
            pharmacy: "Over-the-counter",
            reason: "Sleep initiation support",
            sideEffects: "None reported",
            discontinuedReason: "Sleep patterns normalized, supplement no longer necessary",
            notes: "May restart if sleep difficulties recur"
        },
        {
            id: 5,
            name: "Risperdal",
            genericName: "Risperidone",
            startDate: "08/15/2018",
            endDate: "09/18/2018",
            dose: "0.5mg twice daily",
            psychotropic: true,
            details: "Ineffective, switched to Abilify",
            prescriber: "Dr. Lisa Thompson",
            pharmacy: "CVS Pharmacy - Main St",
            reason: "Mood stabilization and aggression management",
            sideEffects: "Minimal effectiveness, slight sedation",
            discontinuedReason: "Insufficient therapeutic benefit after 4 weeks",
            notes: "Consider alternative if first-line treatments fail"
        },
        {
            id: 6,
            name: "Strattera",
            genericName: "Atomoxetine",
            startDate: "01/10/2019",
            endDate: "08/30/2019",
            dose: "40mg once daily",
            psychotropic: true,
            details: "Discontinued, minimal benefit",
            prescriber: "Dr. Michael Chen",
            pharmacy: "Walgreens - Park Ave",
            reason: "Non-stimulant ADHD treatment",
            sideEffects: "Nausea, decreased appetite, mood changes",
            discontinuedReason: "Limited improvement in attention and focus",
            notes: "Stimulant medications more effective for this patient"
        },
        {
            id: 7,
            name: "Tenex",
            genericName: "Guanfacine",
            startDate: "03/16/2019",
            endDate: "06/15/2020",
            dose: "2mg twice daily",
            psychotropic: true,
            details: "Dose adjusted to 2.5mg afternoon only",
            prescriber: "Dr. Sarah Martinez",
            pharmacy: "CVS Pharmacy - Main St",
            reason: "ADHD and impulse control",
            sideEffects: "Mild fatigue, blood pressure changes",
            discontinuedReason: "Dose optimization - transitioned to single afternoon dose",
            notes: "Current regimen more effective with fewer side effects"
        },
        {
            id: 8,
            name: "Zoloft",
            genericName: "Sertraline",
            startDate: "11/05/2019",
            endDate: "02/20/2020",
            dose: "25mg once daily",
            psychotropic: true,
            details: "Increased anxiety, discontinued",
            prescriber: "Dr. Lisa Thompson",
            pharmacy: "CVS Pharmacy - Main St",
            reason: "Depression and anxiety management",
            sideEffects: "Paradoxical increase in anxiety, restlessness",
            discontinuedReason: "Adverse reaction - increased anxiety symptoms",
            notes: "Patient may respond better to different SSRI class"
        }
    ];

    const handleViewMedication = (medication: any) => {
        setSelectedMedication(medication);
        setIsMedHistoryDialogOpen(true);
    };

    const handleViewAllMedications = () => {
        setSelectedMedication(null); // null indicates "show all"
        setIsMedHistoryDialogOpen(true);
    };

    const handleAddPrescription = () => {
        setIsAddPrescriptionDialogOpen(true);
    };

    const handleSavePrescription = () => {
        // Handle saving prescription logic here
        console.log("Saving prescription:", prescriptionForm);
        setIsAddPrescriptionDialogOpen(false);
        // Reset form
        setPrescriptionForm({
            medication: "",
            package: "",
            dose: "",
            startDate: "",
            endDate: "",
            consentReceived: false,
            dosingPeriod: "",
            days: {
                monday: false,
                tuesday: false,
                wednesday: false,
                thursday: false,
                friday: false,
                saturday: false,
                sunday: false
            },
            timeRanges: [{ from: "", to: "" }],
            treatmentPurpose: "",
            dosingLimits: "",
            countType: "",
            count: "",
            instructions: ""
        });
    };

    const addTimeRange = () => {
        setPrescriptionForm({
            ...prescriptionForm,
            timeRanges: [...prescriptionForm.timeRanges, { from: "", to: "" }]
        });
    };

    const removeTimeRange = (index: number) => {
        const newTimeRanges = prescriptionForm.timeRanges.filter((_, i) => i !== index);
        setPrescriptionForm({
            ...prescriptionForm,
            timeRanges: newTimeRanges.length > 0 ? newTimeRanges : [{ from: "", to: "" }]
        });
    };

    // Horizontal Tab Navigation Component
    const HorizontalTabNav = ({ tabs, activeTab, onTabChange }: { tabs: Array<{ id: string; label: string; icon?: any }>, activeTab: string, onTabChange: (id: string) => void }) => (
        <div className="bg-white rounded-lg shadow-sm mb-6">
            <nav className="flex items-center gap-6 border-b min-w-max rounded-lg" style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'white' }}>
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                onTabChange(tab.id);
                                setIsEditing(false);
                            }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 text-[13px] font-semibold whitespace-nowrap relative transition-colors",
                                activeTab === tab.id && "rounded-t-lg"
                            )}
                            style={{
                                color: activeTab === tab.id ? 'var(--color-brand-primary)' : 'var(--slds-g-color-text-default)',
                                borderBottom: activeTab === tab.id ? '3px solid var(--color-brand-primary)' : '3px solid transparent',
                                marginBottom: '-1px'
                            }}
                        >
                            {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                            {tab.label}
                        </button>
                    );
                })
                }
            </nav>
        </div>
    );

    // ============ PROGRAM MANAGEMENT TAB ============
    if (activeTab === "program") {
        // Program Overview
        // Program Overview — the youth's Passes, using the shared 19992 Pass
        // List scoped to this youth (replaces the legacy PassScheduleSection
        // here). Program Log youth ids differ from the Pass store's, so the
        // youth is resolved by name.
        if (activeDropdownItem === "program-overview") {
            const youthId = youth ? findYouthIdByName(youth.name) : null;
            return youthId ? (
                <PassList scope="youth" youthId={youthId} />
            ) : (
                <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
                    No Pass records are linked to this youth.
                </p>
            );
        }

        // Legal Matters
        if (activeDropdownItem === "legal-matters") {
            const tabs = [
                { id: "legal-involvement", label: "Legal Involvement" },
                { id: "legal-history", label: "Legal History" }
            ];
            return (
                <div className="p-6 max-w-6xl">
                    <HorizontalTabNav tabs={tabs} activeTab={activeHorizontalTab} onTabChange={setActiveHorizontalTab} />
                    {activeHorizontalTab === "legal-involvement" && <LegalInvolvementSection />}
                    {activeHorizontalTab === "legal-history" && <LegalHistorySection />}
                </div>
            );
        }

        // Assessments & Trauma
        if (activeDropdownItem === "assessments-trauma") {
            const tabs = [
                { id: "trauma-history", label: "Trauma History" },
                { id: "testing-assessments", label: "Testing & Assessments" }
            ];
            return (
                <div className="p-6 max-w-6xl">
                    <HorizontalTabNav tabs={tabs} activeTab={activeHorizontalTab} onTabChange={setActiveHorizontalTab} />
                    {activeHorizontalTab === "trauma-history" && <TraumaHistorySection />}
                    {activeHorizontalTab === "testing-assessments" && <TestingAssessmentsSection />}
                </div>
            );
        }
    }

    // ============ HEALTH TAB ============
    if (activeTab === "health") {
        // Physical Health
        if (activeDropdownItem === "physical-health") {
            const tabs = [
                { id: "current-medical-needs", label: "Current Medical Needs" },
                { id: "physical-health-history", label: "Physical Health History" },
                { id: "physical-health-connections", label: "Physical Health Connections" }
            ];
            return (
                <div className="p-6 max-w-6xl">
                    <HorizontalTabNav tabs={tabs} activeTab={activeHorizontalTab} onTabChange={setActiveHorizontalTab} />
                    {activeHorizontalTab === "current-medical-needs" && <CurrentMedicalNeedsSection />}
                    {activeHorizontalTab === "physical-health-history" && <PhysicalHealthHistorySection />}
                    {activeHorizontalTab === "physical-health-connections" && <PhysicalHealthConnectionsSection />}
                </div>
            );
        }

        // Mental Health
        if (activeDropdownItem === "mental-health") {
            const tabs = [
                { id: "mental-health-overview", label: "Mental Health Overview" },
                { id: "mental-health-history", label: "Mental Health History" },
                { id: "mental-health-connections", label: "Mental Health Connections" }
            ];
            return (
                <div className="p-6 max-w-6xl">
                    <HorizontalTabNav tabs={tabs} activeTab={activeHorizontalTab} onTabChange={setActiveHorizontalTab} />
                    {activeHorizontalTab === "mental-health-overview" && <MentalHealthOverviewSection />}
                    {activeHorizontalTab === "mental-health-history" && <MentalHealthHistorySection />}
                    {activeHorizontalTab === "mental-health-connections" && <MentalHealthConnectionsSection />}
                </div>
            );
        }
    }

    // ============ TREATMENT PLANNING TAB ============
    if (activeTab === "treatment") {
        // Positive Transition Planning (no horizontal tabs)
        if (activeDropdownItem === "positive-transition") {
            return <PTPSection />;
        }

        // Personal Development
        if (activeDropdownItem === "personal-development") {
            const tabs = [
                { id: "goals", label: "Goals" },
                { id: "strengths", label: "Strengths" },
                { id: "coping-skills", label: "Coping Skills" },
                { id: "triggers", label: "Triggers" }
            ];
            return (
                <div className="p-6 space-y-6 max-w-6xl">
                    <HorizontalTabNav tabs={tabs} activeTab={activeHorizontalTab} onTabChange={setActiveHorizontalTab} />
                    {activeHorizontalTab === "goals" && <PersonalDevelopmentGoalsSection />}
                    {activeHorizontalTab === "strengths" && <PersonalDevelopmentStrengthsSection />}
                    {activeHorizontalTab === "coping-skills" && <PersonalDevelopmentCopingSkillsSection />}
                    {activeHorizontalTab === "triggers" && <PersonalDevelopmentTriggersSection />}
                </div>
            );
        }

        // Other treatment items without horizontal tabs
        if (["supplemental-plans", "individual-treatment", "transition-planning"].includes(activeDropdownItem)) {
            const titles: Record<string, string> = {
                "supplemental-plans": "Supplemental Plans",
                "individual-treatment": "Individual Treatment Plan",
                "transition-planning": "Transition Planning"
            };
            
            // Supplemental Plans has its own component
            if (activeDropdownItem === "supplemental-plans") {
                return (
                    <div className="p-6 space-y-6 max-w-6xl">
                        <div 
                            className="overflow-hidden"
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                borderRadius: 'var(--slds-c-card-radius-border)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                        >
                            <div 
                                className="px-4 py-3"
                                style={{
                                    borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                                    backgroundColor: 'var(--slds-g-color-background-alt)'
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[13px] font-semibold text-[#080707]">Supplemental Plans</h3>
                                    <Button
                                        onClick={() => setAddSupPlanTrigger(prev => prev + 1)}
                                        className="h-7 px-3 rounded-full text-[12px] gap-1.5"
                                        style={{
                                            backgroundColor: '#145F33',
                                            color: 'white'
                                        }}
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Add Plan
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4">
                                <TreatmentSupplementalPlansSection addPlanTrigger={addSupPlanTrigger} />
                            </div>
                        </div>
                    </div>
                );
            }
            
            // Individual Treatment Plan has its own component
            if (activeDropdownItem === "individual-treatment") {
                return (
                    <div className="p-6 space-y-6 max-w-6xl">
                        <div 
                            className="overflow-hidden"
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                borderRadius: 'var(--slds-c-card-radius-border)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                        >
                            <div 
                                className="px-4 py-3"
                                style={{
                                    borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                                    backgroundColor: 'var(--slds-g-color-background-alt)'
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[13px] font-semibold text-[#080707]">Individual Treatment Plan</h3>
                                    <Button
                                        onClick={() => setCreatePlanTrigger(prev => prev + 1)}
                                        className="h-7 px-3 rounded-full text-[12px] gap-1.5"
                                        style={{
                                            backgroundColor: '#145F33',
                                            color: 'white'
                                        }}
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Create New Plan
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4">
                                <IndividualTreatmentPlanSection createNewPlanTrigger={createPlanTrigger} />
                            </div>
                        </div>
                    </div>
                );
            }
            
            // Transition Planning has its own component
            if (activeDropdownItem === "transition-planning") {
                return (
                    <div className="p-6 space-y-6 max-w-6xl">
                        <div 
                            className="overflow-hidden"
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                borderRadius: 'var(--slds-c-card-radius-border)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                        >
                            <div 
                                className="px-4 py-3"
                                style={{
                                    borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                                    backgroundColor: 'var(--slds-g-color-background-alt)'
                                }}
                            >
                                <h3 className="text-[13px] font-semibold text-[#080707]">Transition Planning</h3>
                            </div>
                            <div className="p-4">
                                <TransitionPlanningSection />
                            </div>
                        </div>
                    </div>
                );
            }
            
            // Other treatment items use placeholder
            return (
                <div className="p-6 space-y-6 max-w-6xl">
                    {/* Action Buttons Bar */}
                    <div className="mb-6 flex flex-wrap gap-2">
                        <Button 
                            className="h-9 px-4 text-[13px] rounded-full font-medium"
                            style={{
                                backgroundColor: '#145F33',
                                color: 'white'
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Plan
                        </Button>
                        <Button 
                            variant="outline"
                            className="h-9 px-4 text-[13px] rounded-full font-medium"
                            style={{
                                borderColor: 'var(--slds-g-color-border-base-4)',
                                color: 'var(--slds-g-color-text-default)'
                            }}
                        >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                        <Button 
                            variant="outline"
                            className="h-9 px-4 text-[13px] rounded-full font-medium"
                            style={{
                                borderColor: 'var(--slds-g-color-border-base-4)',
                                color: 'var(--slds-g-color-text-default)'
                            }}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                        </Button>
                        <Button 
                            variant="outline"
                            className="h-9 px-4 text-[13px] rounded-full font-medium"
                            style={{
                                borderColor: 'var(--slds-g-color-border-base-4)',
                                color: 'var(--slds-g-color-text-default)'
                            }}
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button 
                            variant="outline"
                            className="h-9 px-4 text-[13px] rounded-full font-medium"
                            style={{
                                borderColor: 'var(--slds-g-color-border-base-4)',
                                color: 'var(--slds-g-color-text-default)'
                            }}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                        <Button 
                            variant="outline"
                            className="h-9 px-4 text-[13px] rounded-full font-medium"
                            style={{
                                borderColor: 'var(--slds-g-color-border-base-4)',
                                color: 'var(--slds-g-color-text-default)'
                            }}
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Report
                        </Button>
                        <Button 
                            variant="outline"
                            className="h-9 px-4 text-[13px] rounded-full font-medium"
                            style={{
                                borderColor: 'var(--slds-g-color-border-base-4)',
                                color: 'var(--slds-g-color-text-default)'
                            }}
                        >
                            <ClipboardList className="h-4 w-4 mr-2" />
                            Care Planning Summary
                        </Button>
                    </div>

                    {/* Data Table Card */}
                    <div 
                        className="overflow-hidden"
                        style={{
                            border: '1px solid var(--slds-g-color-border-base-1)',
                            borderRadius: 'var(--slds-c-card-radius-border)',
                            backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                    >
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        <TableHead 
                                            className="text-[11px] uppercase tracking-wide font-medium py-3 px-4"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Period
                                        </TableHead>
                                        <TableHead 
                                            className="text-[11px] uppercase tracking-wide font-medium py-3 px-4"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Program
                                        </TableHead>
                                        <TableHead 
                                            className="text-[11px] uppercase tracking-wide font-medium py-3 px-4"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Contributors
                                        </TableHead>
                                        <TableHead 
                                            className="text-[11px] uppercase tracking-wide font-medium py-3 px-4"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Status
                                        </TableHead>
                                        <TableHead 
                                            className="text-[11px] uppercase tracking-wide font-medium py-3 px-4 w-[80px]"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow 
                                        className="hover:bg-gray-50 cursor-pointer"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                    >
                                        <TableCell 
                                            className="py-4 px-4 text-[13px]"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            2024 Q1
                                        </TableCell>
                                        <TableCell 
                                            className="py-4 px-4 text-[13px]"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Residential Treatment Program
                                        </TableCell>
                                        <TableCell 
                                            className="py-4 px-4 text-[13px]"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Dr. Sarah Johnson, Mike Peters
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <Badge 
                                                className="text-[11px] font-medium px-3 py-1 rounded-full"
                                                style={{
                                                    backgroundColor: 'rgba(20, 95, 51, 0.1)',
                                                    color: '#145F33'
                                                }}
                                            >
                                                Active
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 rounded-full"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow 
                                        className="hover:bg-gray-50 cursor-pointer"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                    >
                                        <TableCell 
                                            className="py-4 px-4 text-[13px]"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            2023 Q4
                                        </TableCell>
                                        <TableCell 
                                            className="py-4 px-4 text-[13px]"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Independent Living Skills
                                        </TableCell>
                                        <TableCell 
                                            className="py-4 px-4 text-[13px]"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Jennifer Williams, Tom Anderson
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <Badge 
                                                className="text-[11px] font-medium px-3 py-1 rounded-full"
                                                style={{
                                                    backgroundColor: 'rgba(75, 85, 99, 0.1)',
                                                    color: 'rgba(75, 85, 99, 1)'
                                                }}
                                            >
                                                Completed
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 rounded-full"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow 
                                        className="hover:bg-gray-50 cursor-pointer"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                    >
                                        <TableCell 
                                            className="py-4 px-4 text-[13px]"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            2023 Q3
                                        </TableCell>
                                        <TableCell 
                                            className="py-4 px-4 text-[13px]"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Day Program - Academic Support
                                        </TableCell>
                                        <TableCell 
                                            className="py-4 px-4 text-[13px]"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Lisa Brown, Kevin Martinez
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <Badge 
                                                className="text-[11px] font-medium px-3 py-1 rounded-full"
                                                style={{
                                                    backgroundColor: 'rgba(75, 85, 99, 0.1)',
                                                    color: 'rgba(75, 85, 99, 1)'
                                                }}
                                            >
                                                Completed
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 rounded-full"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow 
                                        className="hover:bg-gray-50 cursor-pointer"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                    >
                                        <TableCell 
                                            className="py-4 px-4 text-[13px]"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            2023 Q2
                                        </TableCell>
                                        <TableCell 
                                            className="py-4 px-4 text-[13px]"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Intake & Assessment
                                        </TableCell>
                                        <TableCell 
                                            className="py-4 px-4 text-[13px]"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Dr. Robert Davis
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <Badge 
                                                className="text-[11px] font-medium px-3 py-1 rounded-full"
                                                style={{
                                                    backgroundColor: 'rgba(75, 85, 99, 0.1)',
                                                    color: 'rgba(75, 85, 99, 1)'
                                                }}
                                            >
                                                Completed
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 rounded-full"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow 
                                        className="hover:bg-gray-50 cursor-pointer"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                    >
                                        <TableCell 
                                            className="py-4 px-4 text-[13px]"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            2023 Q1
                                        </TableCell>
                                        <TableCell 
                                            className="py-4 px-4 text-[13px]"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Initial Consultation
                                        </TableCell>
                                        <TableCell 
                                            className="py-4 px-4 text-[13px]"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Dr. Emily Chen
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <Badge 
                                                className="text-[11px] font-medium px-3 py-1 rounded-full"
                                                style={{
                                                    backgroundColor: 'rgba(75, 85, 99, 0.1)',
                                                    color: 'rgba(75, 85, 99, 1)'
                                                }}
                                            >
                                                Completed
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 rounded-full"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            );
        }
    }

    // ============ MEDICATIONS TAB ============
    if (activeTab === "medications") {
        // Medication Overview
        if (activeDropdownItem === "medication-overview") {
            const tabs = [
                { id: "prescriptions", label: "Prescriptions" },
                { id: "medication-history", label: "Medication History" }
            ];
            return (
                <OtherTabsMedicationsSection
                  HorizontalTabNav={HorizontalTabNav}
                  activeHorizontalTab={activeHorizontalTab}
                  setActiveHorizontalTab={setActiveHorizontalTab}
                  addTimeRange={addTimeRange}
                  countTypeOptions={countTypeOptions}
                  dosingPeriodOptions={dosingPeriodOptions}
                  handleAddPrescription={handleAddPrescription}
                  handleSavePrescription={handleSavePrescription}
                  handleViewAllMedications={handleViewAllMedications}
                  isAddPrescriptionDialogOpen={isAddPrescriptionDialogOpen}
                  isMedHistoryDialogOpen={isMedHistoryDialogOpen}
                  medicationHistory={medicationHistory}
                  medicationOptions={medicationOptions}
                  packageOptions={packageOptions}
                  prescriptionForm={prescriptionForm}
                  removeTimeRange={removeTimeRange}
                  selectedMedication={selectedMedication}
                  setIsAddPrescriptionDialogOpen={setIsAddPrescriptionDialogOpen}
                  setIsMedHistoryDialogOpen={setIsMedHistoryDialogOpen}
                  setPrescriptionForm={setPrescriptionForm}
                  tabs={tabs}
                  youthId={youthId}
                />
            );
        }

        // Administration
        if (activeDropdownItem === "administration") {
            const tabs = [
                { id: "pack-meds", label: "Pack Meds" },
                { id: "count", label: "Count" },
                { id: "log", label: "Log" }
            ];

            const selectedPack = medicationPacks.find(p => p.id === selectedPackId) || null;

            const handleCreatePack = () => {
                if (!newPackForm.startDate || !newPackForm.startTime || !newPackForm.endDate || !newPackForm.endTime) {
                    toast.error("Start Date, Start Time, End Date, and End Time are required");
                    return;
                }
                const autoPackName = `${youthDisplayName} ${newPackForm.startDate}-${newPackForm.endDate}`;
                if (selectedPackId) {
                    // Edit mode: update existing pack
                    setMedicationPacks(medicationPacks.map(p =>
                        p.id === selectedPackId
                            ? { ...p, packName: autoPackName, expectedHandoffDate: newPackForm.expectedHandoffDate || newPackForm.endDate, startDate: newPackForm.startDate, startTime: newPackForm.startTime, endDate: newPackForm.endDate, endTime: newPackForm.endTime }
                            : p
                    ));
                    toast.success("Medication pack updated successfully");
                } else {
                    // Create mode: add new pack
                    const today = formatMdy(new Date());
                    const newId = Math.max(...medicationPacks.map(p => p.id), 0) + 1;
                    setMedicationPacks([
                        { id: newId, packName: autoPackName, packStatus: "Available", packType: "Non-Scheduled", expectedHandoffDate: newPackForm.expectedHandoffDate || newPackForm.endDate, startDate: newPackForm.startDate, startTime: newPackForm.startTime, endDate: newPackForm.endDate, endTime: newPackForm.endTime, status: "active", medications: [], createdBy: getDemoUserName(), createdDate: today },
                        ...medicationPacks
                    ]);
                    toast.success("Medication pack created successfully");
                }
                setNewPackForm({ startDate: "", startTime: "", endDate: "", endTime: "", expectedHandoffDate: "" });
                setIsCreatePackDialogOpen(false);
                setCreatePackActiveTab("doses");
                setDateRangeApplied(false);
                setAppliedDateRange({ startDate: "", startTime: "", endDate: "", endTime: "" });
                setPrnMedications([]);
                setOtcMedications([]);
                setSelectedPackId(null);
                setDispenseInnerTab("staffDispensed");
                setHandOffInnerTab("youthReceived");
                setReviewInnerTab("setSecondaryCode");
            };

            const handleArchivePack = () => {
                if (!selectedPackId) { toast.error("Please select a pack first"); return; }
                setMedicationPacks(medicationPacks.map(p => p.id === selectedPackId ? { ...p, status: "archived" as const } : p));
                setSelectedPackId(null);
                toast.success("Pack archived successfully");
            };

            return (
                <OtherTabsAdministrationSection
                  activeHorizontalTab={activeHorizontalTab}
                  setActiveHorizontalTab={setActiveHorizontalTab}
                  dispenseLogEntries={dispenseLogEntries}
                  handOffLogEntries={handOffLogEntries}
                  MED_CODES={MED_CODES}
                  SET_PRIMARY_CODES={SET_PRIMARY_CODES}
                  activePackFilter={activePackFilter}
                  activePackSort={activePackSort}
                  adminLogEntries={adminLogEntries}
                  appliedDateRange={appliedDateRange}
                  archivePackFilter={archivePackFilter}
                  archivePackSort={archivePackSort}
                  countRows={countRows}
                  countRowsOriginal={countRowsOriginal}
                  createPackActiveTab={createPackActiveTab}
                  dateFilterDraftValue={dateFilterDraftValue}
                  dateFilterModalType={dateFilterModalType}
                  dateRangeApplied={dateRangeApplied}
                  defaultOtcMedications={defaultOtcMedications}
                  defaultPrnMedications={defaultPrnMedications}
                  dispenseInnerTab={dispenseInnerTab}
                  dispenseMedRows={dispenseMedRows}
                  dispenseOtcRows={dispenseOtcRows}
                  dispensePrnRows={dispensePrnRows}
                  disposalInnerTab={disposalInnerTab}
                  disposalLogEntries={disposalLogEntries}
                  disposalMedRows={disposalMedRows}
                  disposalOtcRows={disposalOtcRows}
                  disposalPrnRows={disposalPrnRows}
                  endDateFilter={endDateFilter}
                  endDateFilterCustom={endDateFilterCustom}
                  endDateFilterDraftValue={endDateFilterDraftValue}
                  endDateFilterModalType={endDateFilterModalType}
                  endDateFunnelRef={endDateFunnelRef}
                  filterPacks={filterPacks}
                  handOffInnerTab={handOffInnerTab}
                  handOffMedRows={handOffMedRows}
                  handOffOtcRows={handOffOtcRows}
                  handOffPrnRows={handOffPrnRows}
                  handleCreatePack={handleCreatePack}
                  hasRowChanges={hasRowChanges}
                  isAddOtcDialogOpen={isAddOtcDialogOpen}
                  isCreatePackDialogOpen={isCreatePackDialogOpen}
                  isDateChangeWarningOpen={isDateChangeWarningOpen}
                  isEndDateFilterOpen={isEndDateFilterOpen}
                  isLabelStyleModalOpen={isLabelStyleModalOpen}
                  isMassDisposalModalOpen={isMassDisposalModalOpen}
                  isModifyAllPrnDialogOpen={isModifyAllPrnDialogOpen}
                  isModifyPrnDialogOpen={isModifyPrnDialogOpen}
                  isReviewMedHistoryOpen={isReviewMedHistoryOpen}
                  isSetPrimaryModalOpen={isSetPrimaryModalOpen}
                  isSetReviewStatusModalOpen={isSetReviewStatusModalOpen}
                  isStartDateFilterOpen={isStartDateFilterOpen}
                  isViewPackDialogOpen={isViewPackDialogOpen}
                  isYouthReceivedModalOpen={isYouthReceivedModalOpen}
                  massDisposalCancelConfirmOpen={massDisposalCancelConfirmOpen}
                  massDisposalDate={massDisposalDate}
                  massDisposalModalRows={massDisposalModalRows}
                  medicationPacks={medicationPacks}
                  newOtcForm={newOtcForm}
                  newPackForm={newPackForm}
                  otcMedications={otcMedications}
                  packComment={packComment}
                  packMedsSubTab={packMedsSubTab}
                  packPrepMedSelected={packPrepMedSelected}
                  packPrepOtcSelected={packPrepOtcSelected}
                  packPrepPrnSelected={packPrepPrnSelected}
                  packingPrepInnerTab={packingPrepInnerTab}
                  pendingDateChange={pendingDateChange}
                  prnMedications={prnMedications}
                  recipientName={recipientName}
                  recipientType={recipientType}
                  reviewHistoryMedication={reviewHistoryMedication}
                  reviewInnerTab={reviewInnerTab}
                  reviewLogEntries={reviewLogEntries}
                  reviewMedRows={reviewMedRows}
                  reviewModalComment={reviewModalComment}
                  reviewModalCommentError={reviewModalCommentError}
                  reviewModalPrimaryCode={reviewModalPrimaryCode}
                  reviewOtcRows={reviewOtcRows}
                  reviewPrnRows={reviewPrnRows}
                  selectedPack={selectedPack}
                  selectedPackId={selectedPackId}
                  selectedPrnIndex={selectedPrnIndex}
                  setActivePackFilter={setActivePackFilter}
                  setActivePackSort={setActivePackSort}
                  setAdminLogEntries={setAdminLogEntries}
                  setAppliedDateRange={setAppliedDateRange}
                  setArchivePackFilter={setArchivePackFilter}
                  setArchivePackSort={setArchivePackSort}
                  setCountRows={setCountRows}
                  setCountRowsOriginal={setCountRowsOriginal}
                  setCreatePackActiveTab={setCreatePackActiveTab}
                  setDateFilterDraftValue={setDateFilterDraftValue}
                  setDateFilterModalType={setDateFilterModalType}
                  setDateRangeApplied={setDateRangeApplied}
                  setDispenseInnerTab={setDispenseInnerTab}
                  setDispenseMedRows={setDispenseMedRows}
                  setDispenseOtcRows={setDispenseOtcRows}
                  setDispensePrnRows={setDispensePrnRows}
                  setDisposalInnerTab={setDisposalInnerTab}
                  setDisposalLogEntries={setDisposalLogEntries}
                  setDisposalMedRows={setDisposalMedRows}
                  setDisposalOtcRows={setDisposalOtcRows}
                  setDisposalPrnRows={setDisposalPrnRows}
                  setEndDateFilter={setEndDateFilter}
                  setEndDateFilterCustom={setEndDateFilterCustom}
                  setEndDateFilterDraftValue={setEndDateFilterDraftValue}
                  setEndDateFilterModalType={setEndDateFilterModalType}
                  setHandOffInnerTab={setHandOffInnerTab}
                  setHandOffMedRows={setHandOffMedRows}
                  setHandOffOtcRows={setHandOffOtcRows}
                  setHandOffPrnRows={setHandOffPrnRows}
                  setIsAddOtcDialogOpen={setIsAddOtcDialogOpen}
                  setIsCreatePackDialogOpen={setIsCreatePackDialogOpen}
                  setIsDateChangeWarningOpen={setIsDateChangeWarningOpen}
                  setIsEditing={setIsEditing}
                  setIsEndDateFilterOpen={setIsEndDateFilterOpen}
                  setIsLabelStyleModalOpen={setIsLabelStyleModalOpen}
                  setIsMassDisposalModalOpen={setIsMassDisposalModalOpen}
                  setIsModifyAllPrnDialogOpen={setIsModifyAllPrnDialogOpen}
                  setIsModifyPrnDialogOpen={setIsModifyPrnDialogOpen}
                  setIsReviewMedHistoryOpen={setIsReviewMedHistoryOpen}
                  setIsSetPrimaryModalOpen={setIsSetPrimaryModalOpen}
                  setIsSetReviewStatusModalOpen={setIsSetReviewStatusModalOpen}
                  setIsStartDateFilterOpen={setIsStartDateFilterOpen}
                  setIsViewPackDialogOpen={setIsViewPackDialogOpen}
                  setIsYouthReceivedModalOpen={setIsYouthReceivedModalOpen}
                  setMassDisposalCancelConfirmOpen={setMassDisposalCancelConfirmOpen}
                  setMassDisposalDate={setMassDisposalDate}
                  setMassDisposalModalRows={setMassDisposalModalRows}
                  setNewOtcForm={setNewOtcForm}
                  setNewPackForm={setNewPackForm}
                  setOtcMedications={setOtcMedications}
                  setPackComment={setPackComment}
                  setPackMedsSubTab={setPackMedsSubTab}
                  setPackPrepMedSelected={setPackPrepMedSelected}
                  setPackPrepOtcSelected={setPackPrepOtcSelected}
                  setPackPrepPrnSelected={setPackPrepPrnSelected}
                  setPackingPrepInnerTab={setPackingPrepInnerTab}
                  setPendingDateChange={setPendingDateChange}
                  setPrimaryCommentError={setPrimaryCommentError}
                  setPrimaryLogEntries={setPrimaryLogEntries}
                  setPrimaryMedRows={setPrimaryMedRows}
                  setPrimaryOtcRowsData={setPrimaryOtcRowsData}
                  setPrimaryPackComment={setPrimaryPackComment}
                  setPrimaryPrnRows={setPrimaryPrnRows}
                  setPrimarySelectedCode={setPrimarySelectedCode}
                  setPrimaryShowLog={setPrimaryShowLog}
                  setPrnMedications={setPrnMedications}
                  setRecipientName={setRecipientName}
                  setRecipientType={setRecipientType}
                  setReviewHistoryMedication={setReviewHistoryMedication}
                  setReviewInnerTab={setReviewInnerTab}
                  setReviewLogEntries={setReviewLogEntries}
                  setReviewMedRows={setReviewMedRows}
                  setReviewModalComment={setReviewModalComment}
                  setReviewModalCommentError={setReviewModalCommentError}
                  setReviewModalPrimaryCode={setReviewModalPrimaryCode}
                  setReviewOtcRows={setReviewOtcRows}
                  setReviewPrnRows={setReviewPrnRows}
                  setSelectedPackId={setSelectedPackId}
                  setSelectedPrnIndex={setSelectedPrnIndex}
                  setSetPrimaryCommentError={setSetPrimaryCommentError}
                  setSetPrimaryLogEntries={setSetPrimaryLogEntries}
                  setSetPrimaryMedRows={setSetPrimaryMedRows}
                  setSetPrimaryOtcRowsData={setSetPrimaryOtcRowsData}
                  setSetPrimaryPackComment={setSetPrimaryPackComment}
                  setSetPrimaryPrnRows={setSetPrimaryPrnRows}
                  setSetPrimarySelectedCode={setSetPrimarySelectedCode}
                  setSetPrimaryShowLog={setSetPrimaryShowLog}
                  setStartDateFilter={setStartDateFilter}
                  setStartDateFilterCustom={setStartDateFilterCustom}
                  setYouthReceivedToggle={setYouthReceivedToggle}
                  sortPacks={sortPacks}
                  startDateFilter={startDateFilter}
                  startDateFilterCustom={startDateFilterCustom}
                  startDateFunnelRef={startDateFunnelRef}
                  tabs={tabs}
                  toggleSort={toggleSort}
                  youthDisplayName={youthDisplayName}
                  youthName={youthDisplayName}
                  youthReceivedToggle={youthReceivedToggle}
                />
            );
        }

        // Compliance
        if (activeDropdownItem === "compliance") {
            return (
                <div className="p-6 flex items-center justify-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <FileText className="h-14 w-14 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
                        <h3 className="text-[16px] font-semibold mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication Compliance</h3>
                        <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Track medication compliance and adherence.</p>
                    </div>
                </div>
            );
        }
    }

    // ============ SUBSTANCE USE TAB ============
    if (activeTab === "substance") {
        // Substance Use Overview
        if (activeDropdownItem === "substance-overview") {
            const tabs = [
                { id: "testing", label: "Testing" },
                { id: "disclosures", label: "Disclosures" }
            ];
            return (
                <div className="p-6 space-y-6 max-w-6xl">
                    <HorizontalTabNav tabs={tabs} activeTab={activeHorizontalTab} onTabChange={setActiveHorizontalTab} />
                    <div className="flex items-center justify-center p-12">
                        <div className="text-center">
                            <FileText className="h-14 w-14 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
                            <h3 className="text-[16px] font-semibold mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                {activeHorizontalTab === "testing" ? "Substance Testing" : "Disclosures"}
                            </h3>
                            <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                {activeHorizontalTab === "testing"
                                    ? "View and manage substance use testing records."
                                    : "Track substance use disclosures and self-reports."}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
    }

    // ============ SUBSTANCE USE TAB ============
    if (activeTab === "substance") {
        // Substance Use Overview
        if (activeDropdownItem === "substance-overview") {
            const tabs = [
                { id: "testing", label: "Testing" },
                { id: "disclosures", label: "Disclosures" }
            ];
            return (
                <div className="p-6 space-y-6 max-w-6xl">
                    <HorizontalTabNav tabs={tabs} activeTab={activeHorizontalTab} onTabChange={setActiveHorizontalTab} />
                    <div 
                        className="overflow-hidden"
                        style={{
                            border: '1px solid var(--slds-g-color-border-base-1)',
                            borderRadius: 'var(--slds-c-card-radius-border)',
                            backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                    >
                        <div 
                            className="px-4 py-3"
                            style={{
                                borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                                backgroundColor: 'var(--slds-g-color-background-alt)'
                            }}
                        >
                            {activeHorizontalTab === "testing" ? (
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[13px] font-semibold text-[#080707]">Substance Testing</h3>
                                    <button
                                        onClick={() => setIsTestSetDialogOpen(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
                                        style={{
                                            backgroundColor: '#145F33',
                                            color: 'white',
                                            border: '1px solid #145F33'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#0f4526';
                                            e.currentTarget.style.borderColor = '#0f4526';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#145F33';
                                            e.currentTarget.style.borderColor = '#145F33';
                                        }}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                        </svg>
                                        Create New Test Set
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[13px] font-semibold text-[#080707]">Disclosures</h3>
                                    <button
                                        onClick={() => setIsDisclosureDialogOpen(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
                                        style={{
                                            backgroundColor: '#145F33',
                                            color: 'white',
                                            border: '1px solid #145F33'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#0f4526';
                                            e.currentTarget.style.borderColor = '#0f4526';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#145F33';
                                            e.currentTarget.style.borderColor = '#145F33';
                                        }}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                        </svg>
                                        Create New Disclosure
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            {activeHorizontalTab === "testing" ? (
                                <div className="space-y-4">
                                    {/* Testing Table */}
                                    <div 
                                        className="rounded overflow-hidden"
                                        style={{
                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                        }}
                                    >
                                        <table className="w-full">
                                            <thead>
                                                <tr 
                                                    className="text-[12px]"
                                                    style={{
                                                        backgroundColor: 'var(--slds-g-color-background-alt)',
                                                        borderBottom: '1px solid var(--slds-g-color-border-base-1)'
                                                    }}
                                                >
                                                    <th className="text-left px-4 py-2.5 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Date/Time</th>
                                                    <th className="text-left px-4 py-2.5 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Test Reason</th>
                                                    <th className="text-left px-4 py-2.5 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Substances Identified</th>
                                                    <th className="text-left px-4 py-2.5 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Result</th>
                                                    <th className="text-right px-4 py-2.5 font-semibold" style={{ color: 'var(--slds-g-color-text-default)', width: '60px' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {testRecords.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="px-4 py-12 text-center">
                                                            <div className="flex flex-col items-center gap-3">
                                                                <div 
                                                                    className="w-12 h-12 rounded-full flex items-center justify-center"
                                                                    style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}
                                                                >
                                                                    <ClipboardList className="w-6 h-6" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[13px] font-medium mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                        No Test Records Yet
                                                                    </p>
                                                                    <p className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                        Click "Create New Test Set" to add your first test record
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    testRecords.map((record, index) => (
                                                        <tr 
                                                            key={record.id}
                                                            className="text-[13px] group transition-colors"
                                                            style={{
                                                                borderBottom: index !== testRecords.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                                                cursor: 'pointer'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-alt)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                            }}
                                                        >
                                                            <td className="px-4 py-3.5">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                        {record.date}
                                                                    </span>
                                                                    <span className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                        {record.time}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3.5" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {record.reason}
                                                            </td>
                                                            <td className="px-4 py-3.5">
                                                                <span style={{ 
                                                                    color: record.newUse === 'None' || record.newUse === 'Pending Review' 
                                                                        ? 'var(--slds-g-color-text-weak)' 
                                                                        : 'var(--slds-g-color-text-default)' 
                                                                }}>
                                                                    {record.newUse}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3.5">
                                                                <Badge 
                                                                    className="text-[11px] font-medium px-2.5 py-0.5"
                                                                    style={{
                                                                        borderRadius: '4px',
                                                                        border: '1px solid',
                                                                        ...(record.result === 'negative' && {
                                                                            backgroundColor: '#e6f2eb',
                                                                            color: '#145F33',
                                                                            borderColor: '#145F33'
                                                                        }),
                                                                        ...(record.result === 'positive' && {
                                                                            backgroundColor: '#fde8e7',
                                                                            color: '#d8372a',
                                                                            borderColor: '#d8372a'
                                                                        }),
                                                                        ...(record.result === 'pending' && {
                                                                            backgroundColor: '#fef3cd',
                                                                            color: '#6b5d1a',
                                                                            borderColor: '#f4d88a'
                                                                        })
                                                                    }}
                                                                >
                                                                    {record.result.charAt(0).toUpperCase() + record.result.slice(1)}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-4 py-3.5 text-right">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        // View test details
                                                                    }}
                                                                    className="inline-flex items-center justify-center w-7 h-7 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    style={{
                                                                        color: 'var(--slds-g-color-text-weak)'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-alt)';
                                                                        e.currentTarget.style.color = 'var(--slds-g-color-text-default)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                                        e.currentTarget.style.color = 'var(--slds-g-color-text-weak)';
                                                                    }}
                                                                    title="View details"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Test Set Dialog */}
                                    <Dialog open={isTestSetDialogOpen} onOpenChange={setIsTestSetDialogOpen}>
                                        <DialogContent className="sm:max-w-[600px]">
                                            <DialogHeader className="border-b pb-3" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                <DialogTitle className="text-[15px]" style={{ color: 'var(--slds-g-color-text-default)' }}>Test Set</DialogTitle>
                                                <DialogDescription className="sr-only">
                                                    Create a new substance test set by providing the sample date, time, and test reason
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 pt-4">
                                                {/* Sample Date/Time */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="test-date" className="text-[12px] font-semibold mb-1.5 block" style={{ color: '#080707' }}>
                                                            Sample Date/Time:
                                                        </Label>
                                                        <DateInput
                                                            id="test-date"
value={isoToMdy(testSetData.date)}
                                                            onChange={(v) => ((e) => setTestSetData({ ...testSetData, date: e.target.value }))({ target: { value: mdyToIso(v) } })}
                                                            className="h-8 text-[13px]"
                                                            style={{
                                                                border: '1px solid var(--slds-g-color-border-base-4)',
                                                                borderRadius: '4px'
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="test-time" className="text-[12px] font-semibold mb-1.5 block opacity-0">
                                                            Time
                                                        </Label>
                                                        <Input
                                                            id="test-time"
                                                            type="time"
                                                            value={testSetData.time}
                                                            onChange={(e) => setTestSetData({ ...testSetData, time: e.target.value })}
                                                            className="h-8 text-[13px]"
                                                            style={{
                                                                border: '1px solid var(--slds-g-color-border-base-4)',
                                                                borderRadius: '4px'
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Test Reason */}
                                                <div>
                                                    <Label htmlFor="test-reason" className="text-[12px] font-semibold mb-1.5 block" style={{ color: '#080707' }}>
                                                        Test Reason:
                                                    </Label>
                                                    <Select value={testSetData.reason} onValueChange={(value) => setTestSetData({ ...testSetData, reason: value })}>
                                                        <SelectTrigger 
                                                            id="test-reason"
                                                            className="h-8 text-[13px]"
                                                            style={{
                                                                border: '1px solid var(--slds-g-color-border-base-4)',
                                                                borderRadius: '4px'
                                                            }}
                                                        >
                                                            <SelectValue placeholder="Test Reason" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="program-random">Program Random Test</SelectItem>
                                                            <SelectItem value="admissions">Admissions Test</SelectItem>
                                                            <SelectItem value="treatment-plan">Treatment Plan</SelectItem>
                                                            <SelectItem value="suspicion">Suspicion of Use</SelectItem>
                                                            <SelectItem value="self-disclosure">Self-Disclosure</SelectItem>
                                                            <SelectItem value="disclosure-other">Disclosure From Other</SelectItem>
                                                            <SelectItem value="other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            
                                            {/* Action Buttons at Bottom */}
                                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#dddbda]">
                                                <button
                                                    onClick={() => {
                                                        setIsTestSetDialogOpen(false);
                                                        setTestSetData({
                                                            date: localTodayIso(),
                                                            time: '12:00',
                                                            reason: ''
                                                        });
                                                    }}
                                                    className="rounded-full h-9 px-6 text-[13px] font-medium border border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        // Validate required fields
                                                        if (!testSetData.date || !testSetData.time) {
                                                            return;
                                                        }

                                                        // Format time to 12-hour format with AM/PM
                                                        const [hours, minutes] = testSetData.time.split(':');
                                                        const hour = parseInt(hours);
                                                        const ampm = hour >= 12 ? 'PM' : 'AM';
                                                        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                                                        const formattedTime = `${displayHour}:${minutes} ${ampm}`;

                                                        // Format date to MM/DD/YYYY
                                                        const dateObj = new Date(testSetData.date);
                                                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                                                        const day = String(dateObj.getDate()).padStart(2, '0');
                                                        const year = dateObj.getFullYear();
                                                        const formattedDate = `${month}/${day}/${year}`;

                                                        // Map reason value to display text
                                                        const reasonMap: Record<string, string> = {
                                                            'program-random': 'Program Random Test',
                                                            'admissions': 'Admissions Test',
                                                            'treatment-plan': 'Treatment Plan',
                                                            'suspicion': 'Suspicion of Use',
                                                            'self-disclosure': 'Self-Disclosure',
                                                            'disclosure-other': 'Disclosure From Other',
                                                            'other': 'Other'
                                                        };

                                                        // Create new test record
                                                        const newRecord = {
                                                            id: Math.max(...testRecords.map(r => r.id), 0) + 1,
                                                            date: formattedDate,
                                                            time: formattedTime,
                                                            reason: reasonMap[testSetData.reason] || testSetData.reason,
                                                            newUse: 'Pending Review',
                                                            result: 'pending' as const
                                                        };

                                                        // Add to test records
                                                        setTestRecords([newRecord, ...testRecords]);

                                                        // Close dialog and reset form
                                                        setIsTestSetDialogOpen(false);
                                                        setTestSetData({
                                                            date: localTodayIso(),
                                                            time: '12:00',
                                                            reason: ''
                                                        });
                                                    }}
                                                    disabled={!testSetData.date || !testSetData.time}
                                                    className="rounded-full h-9 px-6 text-[13px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#145F33]"
                                                >
                                                    Save & Create
                                                </button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Disclosures Table */}
                                    <div 
                                        className="rounded overflow-hidden"
                                        style={{
                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                        }}
                                    >
                                        <table className="w-full">
                                            <thead>
                                                <tr 
                                                    className="text-[12px]"
                                                    style={{
                                                        backgroundColor: 'var(--slds-g-color-background-alt)',
                                                        borderBottom: '1px solid var(--slds-g-color-border-base-1)'
                                                    }}
                                                >
                                                    <th className="text-left px-4 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Disclosure Date & Time</th>
                                                    <th className="text-left px-4 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Related to Test</th>
                                                    <th className="text-left px-4 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Substance(s)</th>
                                                    <th className="text-left px-4 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Comments</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-8 text-center text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                        No disclosure records available
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Disclosure Dialog */}
                                    <Dialog open={isDisclosureDialogOpen} onOpenChange={setIsDisclosureDialogOpen}>
                                        <DialogContent className="sm:max-w-[600px]">
                                            <DialogHeader className="border-b pb-3" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                <div className="flex items-center justify-between">
                                                    <DialogTitle className="text-[15px]" style={{ color: 'var(--slds-g-color-text-default)' }}>New Disclosure</DialogTitle>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                // Validate required fields
                                                                if (!disclosureData.date || !disclosureData.time || !disclosureData.reporter || !disclosureData.substances) {
                                                                    return; // Silent validation - don't close dialog
                                                                }
                                                                // Handle save logic here
                                                                setIsDisclosureDialogOpen(false);
                                                                // Reset form
                                                                setDisclosureData({
                                                                    date: localTodayIso(),
                                                                    time: '12:00',
                                                                    relatedToTest: 'No',
                                                                    reporter: '',
                                                                    substances: '',
                                                                    comments: ''
                                                                });
                                                            }}
                                                            disabled={!disclosureData.date || !disclosureData.time || !disclosureData.reporter || !disclosureData.substances}
                                                            className="flex items-center gap-2 px-3 py-1.5 rounded text-[13px] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                            style={{
                                                                backgroundColor: '#145F33',
                                                                color: 'white',
                                                                border: '1px solid #145F33'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (!e.currentTarget.disabled) {
                                                                    e.currentTarget.style.backgroundColor = '#0f4526';
                                                                    e.currentTarget.style.borderColor = '#0f4526';
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (!e.currentTarget.disabled) {
                                                                    e.currentTarget.style.backgroundColor = '#145F33';
                                                                    e.currentTarget.style.borderColor = '#145F33';
                                                                }
                                                            }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                                                <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                                                            </svg>
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setIsDisclosureDialogOpen(false);
                                                                setDisclosureData({
                                                                    date: localTodayIso(),
                                                                    time: '12:00',
                                                                    relatedToTest: 'No',
                                                                    reporter: '',
                                                                    substances: '',
                                                                    comments: ''
                                                                });
                                                            }}
                                                            className="flex items-center gap-2 px-3 py-1.5 rounded text-[13px] font-medium transition-all"
                                                            style={{
                                                                backgroundColor: '#d8372a',
                                                                color: 'white',
                                                                border: '1px solid #d8372a'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#b82e23';
                                                                e.currentTarget.style.borderColor = '#b82e23';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#d8372a';
                                                                e.currentTarget.style.borderColor = '#d8372a';
                                                            }}
                                                        >
                                                            <X className="w-4 h-4" />
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                                <DialogDescription className="sr-only">
                                                    Record a new substance use disclosure including date, time, reporter, and substances disclosed
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 pt-4">
                                                {/* Disclosure Date/Time */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="disclosure-date" className="text-[12px] font-semibold mb-1.5 block" style={{ color: '#d8372a' }}>
                                                            Disclosure Date <span className="text-red-600">*</span>
                                                        </Label>
                                                        <DateInput
                                                            id="disclosure-date"
value={isoToMdy(disclosureData.date)}
                                                            onChange={(v) => ((e) => setDisclosureData({ ...disclosureData, date: e.target.value }))({ target: { value: mdyToIso(v) } })}
                                                            className="h-8 text-[13px]"
                                                            style={{
                                                                border: '1px solid var(--slds-g-color-border-base-4)',
                                                                borderRadius: '4px'
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="disclosure-time" className="text-[12px] font-semibold mb-1.5 block" style={{ color: '#d8372a' }}>
                                                            Time <span className="text-red-600">*</span>
                                                        </Label>
                                                        <Input
                                                            id="disclosure-time"
                                                            type="time"
                                                            value={disclosureData.time}
                                                            onChange={(e) => setDisclosureData({ ...disclosureData, time: e.target.value })}
                                                            className="h-8 text-[13px]"
                                                            style={{
                                                                border: '1px solid var(--slds-g-color-border-base-4)',
                                                                borderRadius: '4px'
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Reporter */}
                                                <div>
                                                    <Label htmlFor="reporter" className="text-[12px] font-semibold mb-1.5 block" style={{ color: '#d8372a' }}>
                                                        Reporter <span className="text-red-600">*</span>
                                                    </Label>
                                                    <Input
                                                        id="reporter"
                                                        type="text"
                                                        value={disclosureData.reporter}
                                                        onChange={(e) => setDisclosureData({ ...disclosureData, reporter: e.target.value })}
                                                        placeholder="Enter reporter name"
                                                        className="h-8 text-[13px]"
                                                        style={{
                                                            border: '1px solid var(--slds-g-color-border-base-4)',
                                                            borderRadius: '4px'
                                                        }}
                                                    />
                                                </div>

                                                {/* Related to Test - Radio buttons */}
                                                <div>
                                                    <Label className="text-[12px] font-semibold mb-1.5 block" style={{ color: '#d8372a' }}>
                                                        Related to Test
                                                    </Label>
                                                    <div className="flex gap-6">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="relatedToTest"
                                                                value="Yes"
                                                                checked={disclosureData.relatedToTest === 'Yes'}
                                                                onChange={(e) => setDisclosureData({ ...disclosureData, relatedToTest: e.target.value })}
                                                                className="w-4 h-4"
                                                                style={{ accentColor: '#145F33' }}
                                                            />
                                                            <span className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>Yes</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="relatedToTest"
                                                                value="No"
                                                                checked={disclosureData.relatedToTest === 'No'}
                                                                onChange={(e) => setDisclosureData({ ...disclosureData, relatedToTest: e.target.value })}
                                                                className="w-4 h-4"
                                                                style={{ accentColor: '#145F33' }}
                                                            />
                                                            <span className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>No</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* Substance(s) */}
                                                <div>
                                                    <Label htmlFor="substances" className="text-[12px] font-semibold mb-1.5 block" style={{ color: '#d8372a' }}>
                                                        Substance(s) <span className="text-red-600">*</span>
                                                    </Label>
                                                    <Select value={disclosureData.substances} onValueChange={(value) => setDisclosureData({ ...disclosureData, substances: value })}>
                                                        <SelectTrigger 
                                                            id="substances"
                                                            className="h-8 text-[13px]"
                                                            style={{
                                                                border: '1px solid var(--slds-g-color-border-base-4)',
                                                                borderRadius: '4px'
                                                            }}
                                                        >
                                                            <SelectValue placeholder="Select substance" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="alcohol-ethanol">Alcohol (Ethanol)</SelectItem>
                                                            <SelectItem value="alcohol-instant">Alcohol (Instant)</SelectItem>
                                                            <SelectItem value="alcohol-lab">Alcohol (Lab)</SelectItem>
                                                            <SelectItem value="amphetamines">Amphetamines</SelectItem>
                                                            <SelectItem value="barbiturates">Barbiturates</SelectItem>
                                                            <SelectItem value="benzodiazepines">Benzodiazepines</SelectItem>
                                                            <SelectItem value="buprenorphine">Buprenorphine</SelectItem>
                                                            <SelectItem value="cannabis">Cannabis (Marijuana)</SelectItem>
                                                            <SelectItem value="cocaine">Cocaine</SelectItem>
                                                            <SelectItem value="fentanyl">Fentanyl</SelectItem>
                                                            <SelectItem value="hallucinogens">Hallucinogens</SelectItem>
                                                            <SelectItem value="heroin">Heroin</SelectItem>
                                                            <SelectItem value="inhalants">Inhalants</SelectItem>
                                                            <SelectItem value="ketamine">Ketamine</SelectItem>
                                                            <SelectItem value="mdma">MDMA (Ecstasy)</SelectItem>
                                                            <SelectItem value="methamphetamine">Methamphetamine</SelectItem>
                                                            <SelectItem value="opiates">Opiates</SelectItem>
                                                            <SelectItem value="oxycodone">Oxycodone</SelectItem>
                                                            <SelectItem value="pcp">PCP</SelectItem>
                                                            <SelectItem value="synthetic-cannabinoids">Synthetic Cannabinoids</SelectItem>
                                                            <SelectItem value="other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Comments */}
                                                <div>
                                                    <Label htmlFor="disclosure-comments" className="text-[12px] font-semibold mb-1.5 block" style={{ color: '#d8372a' }}>
                                                        Comments
                                                    </Label>
                                                    <Textarea
                                                        id="disclosure-comments"
                                                        value={disclosureData.comments}
                                                        onChange={(e) => setDisclosureData({ ...disclosureData, comments: e.target.value })}
                                                        placeholder="Enter additional details or comments"
                                                        className="min-h-[80px] text-[13px]"
                                                        style={{
                                                            border: '1px solid var(--slds-g-color-border-base-4)',
                                                            borderRadius: '4px'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // Other substance items without horizontal tabs
        if (["plan-of-action", "substance-history"].includes(activeDropdownItem)) {
            const titles: Record<string, string> = {
                "plan-of-action": "Plan of Action",
                "substance-history": "Substance Use History"
            };
            return (
                <div className="p-6 space-y-6 max-w-6xl">
                    <div 
                        className="overflow-hidden"
                        style={{
                            border: '1px solid var(--slds-g-color-border-base-1)',
                            borderRadius: 'var(--slds-c-card-radius-border)',
                            backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                    >
                        <div 
                            className="px-4 py-3"
                            style={{
                                borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                                backgroundColor: 'var(--slds-g-color-background-alt)'
                            }}
                        >
                            <h3 className="text-[13px] font-semibold text-[#080707]">{titles[activeDropdownItem]}</h3>
                        </div>
                        <div className="p-4">
                            <div className="text-[14px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>No records available</div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    // ============ EDUCATION & VOCATION TAB ============
    if (activeTab === "education") {
        // Academic Overview
        if (activeDropdownItem === "academic-overview") {
            const tabs = [
                { id: "academics", label: "Academics" },
                { id: "classes", label: "Classes" }
            ];
            return (
                <div className="p-6 space-y-6 max-w-6xl">
                    <HorizontalTabNav tabs={tabs} activeTab={activeHorizontalTab} onTabChange={setActiveHorizontalTab} />
                    <div 
                        className="overflow-hidden"
                        style={{
                            border: '1px solid var(--slds-g-color-border-base-1)',
                            borderRadius: 'var(--slds-c-card-radius-border)',
                            backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                    >
                        <div 
                            className="px-4 py-3 flex items-center justify-between"
                            style={{
                                borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                                backgroundColor: 'var(--slds-g-color-background-alt)'
                            }}
                        >
                            <h3 className="text-[13px] font-semibold text-[#080707]">{activeHorizontalTab === "academics" ? "Academic Information" : "Classes"}</h3>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setIsEditing(!isEditing)} 
                                className="h-7 rounded-full text-[11px] shadow-none"
                                style={{
                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    color: 'var(--color-brand-primary)'
                                }}
                            >
                                {isEditing ? <><Save className="h-3 w-3 mr-1" />Save</> : <><Edit2 className="h-3 w-3 mr-1" />Edit</>}
                            </Button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="schoolName" className="text-[11px] font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        School Name
                                    </Label>
                                    <Input 
                                        id="schoolName"
                                        value="Mercy Home Academy"
                                        className="h-8 text-[13px]"
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="gradeLevel" className="text-[11px] font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Grade Level
                                    </Label>
                                    <Select value="10" disabled={!isEditing}>
                                        <SelectTrigger className="h-8 text-[13px]">
                                            <SelectValue placeholder="Select grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="9">9th Grade</SelectItem>
                                            <SelectItem value="10">10th Grade</SelectItem>
                                            <SelectItem value="11">11th Grade</SelectItem>
                                            <SelectItem value="12">12th Grade</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Career Development
        if (activeDropdownItem === "career-development") {
            const tabs = [
                { id: "credentials", label: "Credentials" },
                { id: "employment", label: "Employment" },
                { id: "financial-literacy", label: "Financial Literacy" },
                { id: "org-system", label: "Org System" }
            ];
            return (
                <div className="p-6 space-y-6 max-w-6xl">
                    <HorizontalTabNav tabs={tabs} activeTab={activeHorizontalTab} onTabChange={setActiveHorizontalTab} />
                    <div 
                        className="overflow-hidden"
                        style={{
                            border: '1px solid var(--slds-g-color-border-base-1)',
                            borderRadius: 'var(--slds-c-card-radius-border)',
                            backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                    >
                        <div 
                            className="px-4 py-3"
                            style={{
                                borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                                backgroundColor: 'var(--slds-g-color-background-alt)'
                            }}
                        >
                            <h3 className="text-[13px] font-semibold text-[#080707]">Career Development - {activeHorizontalTab}</h3>
                        </div>
                        <div className="p-4">
                            <div className="text-[14px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Career development information</div>
                        </div>
                    </div>
                </div>
            );
        }

        // Tutoring
        if (activeDropdownItem === "tutoring") {
            const tabs = [
                { id: "tutor-matches", label: "Tutor Matches" },
                { id: "tutor-scheduled-sessions", label: "Tutor Scheduled Sessions" }
            ];
            return (
                <div className="p-6 space-y-6 max-w-6xl">
                    <HorizontalTabNav tabs={tabs} activeTab={activeHorizontalTab} onTabChange={setActiveHorizontalTab} />
                    <div 
                        className="overflow-hidden"
                        style={{
                            border: '1px solid var(--slds-g-color-border-base-1)',
                            borderRadius: 'var(--slds-c-card-radius-border)',
                            backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                    >
                        <div 
                            className="px-4 py-3"
                            style={{
                                borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                                backgroundColor: 'var(--slds-g-color-background-alt)'
                            }}
                        >
                            <h3 className="text-[13px] font-semibold text-[#080707]">{activeHorizontalTab === "tutor-matches" ? "Tutor Matches" : "Scheduled Sessions"}</h3>
                        </div>
                        <div className="p-4">
                            <div className="text-[14px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>No active tutoring sessions</div>
                        </div>
                    </div>
                </div>
            );
        }

        // Post Secondary Options (no horizontal tabs)
        if (activeDropdownItem === "post-secondary") {
            return (
                <div className="p-6 space-y-6 max-w-6xl">
                    <div 
                        className="overflow-hidden"
                        style={{
                            border: '1px solid var(--slds-g-color-border-base-1)',
                            borderRadius: 'var(--slds-c-card-radius-border)',
                            backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                    >
                        <div 
                            className="px-4 py-3"
                            style={{
                                borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                                backgroundColor: 'var(--slds-g-color-background-alt)'
                            }}
                        >
                            <h3 className="text-[13px] font-semibold text-[#080707]">Post Secondary Options</h3>
                        </div>
                        <div className="p-4">
                            <div className="text-[14px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Post-secondary planning information</div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    return <div className="p-6">Content not yet implemented</div>;
}