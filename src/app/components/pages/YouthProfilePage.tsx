import { useState } from "react";
import { YouthAlertIcons } from "../youth/YouthAlertIcons";
import { useParams, useNavigate } from "react-router";
import { User, ArrowLeft, Sunrise, Sun, Sunset, Moon, AlertCircle, Calendar, MapPin, Phone, Mail, FileText, Activity, Heart, Shield, Clock, Package, MessageSquare, CheckCircle2, ChevronDown, ChevronUp, Star, Printer, ClipboardCheck, CheckSquare, RefreshCw, Eye, Edit, Plus, Archive, Pill, Pencil, XCircle } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";
import { NewMedicationDialog } from "./NewMedicationDialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { useViewMode } from "../../contexts/ViewModeContext";
import { OTCConsentManagement } from "../admissions/OTCConsentManagement";
import { MedicationOverviewSections, type ActiveMedication as MedicationOverviewType, type OTCConsent } from "../medications/MedicationOverviewSections";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, formatMdy, localTodayIso, toLocalIso } from "../../lib/dateFormat";

// Medication Row Component
function MedicationRow({ 
  medication, 
  startTime, 
  stopTime, 
  quantity, 
  staffConsent = true, 
  constituentConsent = true, 
  code = "Add",
  codeOptions,
  onCodeClick,
  onQuantityClick,
  onQuantityChange,
  comment = "",
  onAnyChange,
  lastCount = 0
}: { 
  medication: any; 
  startTime: string; 
  stopTime: string; 
  quantity: number; 
  staffConsent?: boolean; 
  constituentConsent?: boolean; 
  code?: string;
  codeOptions: Array<{ code: string; label: string; color: string }>;
  onCodeClick: () => void;
  onQuantityClick: () => void;
  onQuantityChange?: (value: number) => void;
  comment?: string;
  onAnyChange?: () => void;
  lastCount?: number;
}) {
  const [staffYes, setStaffYes] = useState(staffConsent);
  const [constituentYes, setConstituentYes] = useState(constituentConsent);

  // Get the color for the current code
  const currentCodeOption = codeOptions.find(opt => opt.code === code);
  const codeColor = currentCodeOption?.color || "";

  const handleStaffToggle = () => {
    setStaffYes(!staffYes);
    onAnyChange?.();
  };

  const handleConstituentToggle = () => {
    setConstituentYes(!constituentYes);
    onAnyChange?.();
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQuantityChange?.(parseInt(e.target.value) || 0);
    onAnyChange?.();
  };

  return (
    <tr 
      className="hover:bg-gray-50/80 transition-colors"
      style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
    >
      <td className="px-4 py-4 text-[13px] font-medium">{medication.name}</td>
      <td className="px-4 py-4 text-[13px]">{medication.dose}</td>
      <td className="px-4 py-4 text-[13px]">
        {medication.frequency.toLowerCase().includes('bedtime') 
          ? 'Take at bedtime with a glass of water' 
          : 'Take in the morning with food'}
      </td>
      <td className="px-4 py-4 text-center text-[13px]">{startTime}</td>
      <td className="px-4 py-4 text-center text-[13px]">{stopTime}</td>
      <td className="px-4 py-4 text-center">
        <Input
          type="number"
          value={quantity}
          onChange={handleQuantityChange}
          className="h-8 w-16 text-center text-[13px] font-semibold mx-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          min="0"
        />
      </td>
      <td className="px-4 py-4 text-center">
        <div className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
          {lastCount}
        </div>
      </td>
      <td className="px-4 py-4 text-center">
        <Button
          size="sm"
          onClick={handleStaffToggle}
          className={cn(
            "h-9 px-5 text-[13px] font-bold rounded-md min-w-[70px]",
            staffYes 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-red-600 hover:bg-red-700 text-white"
          )}
        >
          {staffYes ? "YES" : "NO"}
        </Button>
      </td>
      <td className="px-4 py-4 text-center">
        <Button
          size="sm"
          onClick={handleConstituentToggle}
          className={cn(
            "h-9 px-5 text-[13px] font-bold rounded-md min-w-[70px]",
            constituentYes 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-red-600 hover:bg-red-700 text-white"
          )}
        >
          {constituentYes ? "YES" : "NO"}
        </Button>
      </td>
      <td className="px-4 py-4 text-center">
        <Button
          size="sm"
          variant="outline"
          onClick={onCodeClick}
          className="h-8 px-4 text-[13px] font-semibold text-blue-600 border-2 border-gray-300 hover:bg-blue-50 rounded-md"
        >
          {code}
        </Button>
      </td>
      <td className="px-4 py-4 text-center">
        <button
          onClick={onQuantityClick}
          className="inline-flex items-center justify-center hover:bg-gray-100 p-1.5 rounded-md transition-colors"
          title={comment ? "View/Edit Comment" : "Add Comment"}
        >
          <MessageSquare 
            className={cn(
              "h-4 w-4",
              comment ? "text-blue-600 fill-blue-100" : "text-gray-400"
            )} 
          />
        </button>
      </td>
    </tr>
  );
}

// Mock constituent data
const MOCK_CONSTITUENT_DATA: Record<string, any> = {
  "1": {
    id: "1",
    firstName: "Fozzie",
    lastName: "Bear",
    fullName: "Fozzie Bear",
    initials: "FB",
    dob: "03/15/2007",
    age: 17,
    program: "Mahoney House",
    allergies: ["Peanuts"],
    diagnoses: ["ADHD", "Sleep Disorder"],
    hasPackedMeds: true,
    medications: [
      { name: "Adderall XR", dose: "20mg", frequency: "Morning", prescriber: "Dr. Martinez" },
      { name: "Vitamin D", dose: "1000 IU", frequency: "Morning", prescriber: "Dr. Chen" },
      { name: "Fish Oil", dose: "1000mg", frequency: "Afternoon", prescriber: "Dr. Chen" },
      { name: "Multivitamin", dose: "1 tablet", frequency: "Afternoon", prescriber: "Dr. Chen" },
      { name: "Omega-3", dose: "500mg", frequency: "Evening", prescriber: "Dr. Chen" },
      { name: "Melatonin", dose: "5mg", frequency: "Bedtime", prescriber: "Dr. Martinez" },
      { name: "Ibuprofen", dose: "200mg", frequency: "PRN", prescriber: "Dr. Martinez" },
      { name: "Diphenhydramine", dose: "25mg", frequency: "PRN", prescriber: "Dr. Martinez" }
    ]
  },
  "2": {
    id: "2",
    firstName: "Kermit",
    lastName: "the Frog",
    fullName: "Kermit the Frog",
    initials: "KF",
    dob: "05/09/2008",
    age: 16,
    program: "Mahoney House",
    allergies: [],
    diagnoses: ["Anxiety Disorder", "Depression"],
    hasPackedMeds: false,
    medications: [
      { name: "Zoloft", dose: "50mg", frequency: "Morning", prescriber: "Dr. Wilson" },
      { name: "Clonidine", dose: "0.1mg", frequency: "Evening", prescriber: "Dr. Wilson" }
    ]
  },
  "3": {
    id: "3",
    firstName: "Red",
    lastName: "Fraggle",
    fullName: "Red Fraggle",
    initials: "RF",
    dob: "11/22/2007",
    age: 17,
    program: "Mahoney House",
    allergies: ["Penicillin", "Latex"],
    diagnoses: ["Bipolar Disorder", "ADHD"],
    hasPackedMeds: true,
    medications: [
      { name: "Risperidone", dose: "2mg", frequency: "Morning", prescriber: "Dr. Martinez" },
      { name: "Risperidone", dose: "2mg", frequency: "Evening", prescriber: "Dr. Martinez" },
      { name: "Prozac", dose: "20mg", frequency: "Morning", prescriber: "Dr. Martinez" },
      { name: "Trazodone", dose: "50mg", frequency: "Bedtime", prescriber: "Dr. Martinez" },
      { name: "Multivitamin", dose: "1 tablet", frequency: "Morning", prescriber: "Dr. Chen" }
    ]
  },
  "4": {
    id: "4",
    firstName: "Miss",
    lastName: "Piggy",
    fullName: "Miss Piggy",
    initials: "MP",
    dob: "08/30/2008",
    age: 16,
    program: "Mahoney House",
    allergies: [],
    diagnoses: ["Social Anxiety"],
    hasPackedMeds: false,
    medications: [
      { name: "Lexapro", dose: "10mg", frequency: "Morning", prescriber: "Dr. Wilson" }
    ]
  },
  "5": {
    id: "5",
    firstName: "Gonzo",
    lastName: "the Great",
    fullName: "Gonzo the Great",
    initials: "GG",
    dob: "01/17/2009",
    age: 15,
    program: "Rydell House",
    allergies: ["Sulfa drugs"],
    diagnoses: ["Psychotic Disorder NOS", "PTSD"],
    hasPackedMeds: false,
    medications: [
      { name: "Abilify", dose: "5mg", frequency: "Morning", prescriber: "Dr. Martinez" },
      { name: "Propranolol", dose: "20mg", frequency: "Morning", prescriber: "Dr. Martinez" },
      { name: "Propranolol", dose: "20mg", frequency: "Afternoon", prescriber: "Dr. Martinez" }
    ]
  },
  "6": {
    id: "6",
    firstName: "Animal",
    lastName: "",
    fullName: "Animal",
    initials: "AN",
    dob: "04/12/2008",
    age: 16,
    program: "Rydell House",
    allergies: [],
    diagnoses: ["ADHD", "ODD"],
    hasPackedMeds: true,
    medications: [
      { name: "Concerta", dose: "36mg", frequency: "Morning", prescriber: "Dr. Chen" },
      { name: "Guanfacine", dose: "1mg", frequency: "Morning", prescriber: "Dr. Chen" },
      { name: "Guanfacine", dose: "1mg", frequency: "Evening", prescriber: "Dr. Chen" },
      { name: "Melatonin", dose: "3mg", frequency: "Bedtime", prescriber: "Dr. Chen" }
    ]
  },
  "7": {
    id: "7",
    firstName: "Scooter",
    lastName: "",
    fullName: "Scooter",
    initials: "SC",
    dob: "09/25/2009",
    age: 15,
    program: "Walsh Campus",
    allergies: ["Aspirin"],
    diagnoses: ["ADHD"],
    hasPackedMeds: false,
    medications: [
      { name: "Strattera", dose: "40mg", frequency: "Morning", prescriber: "Dr. Wilson" }
    ]
  },
  "8": {
    id: "8",
    firstName: "Rizzo",
    lastName: "the Rat",
    fullName: "Rizzo the Rat",
    initials: "RR",
    dob: "12/03/2007",
    age: 17,
    program: "Walsh Campus",
    allergies: ["Shellfish"],
    diagnoses: ["Major Depressive Disorder", "ADHD"],
    hasPackedMeds: false,
    medications: [
      { name: "Seroquel", dose: "100mg", frequency: "Evening", prescriber: "Dr. Martinez" },
      { name: "Wellbutrin", dose: "150mg", frequency: "Morning", prescriber: "Dr. Martinez" }
    ]
  }
};

// ConstituentProfilePage - Main profile page component
export function ConstituentProfilePage() {
  const { id } = useParams<{ id: string }>();
  
  const navigate = useNavigate();
  const { viewMode } = useViewMode();
  const [activeTab, setActiveTab] = useState("medications");
  const [activeMedicationTab, setActiveMedicationTab] = useState("admh-medication");
  const [healthMedTab, setHealthMedTab] = useState("medications");
  const [isRefreshingMedications, setIsRefreshingMedications] = useState(false);

  // Dialog states
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<any>(null);
  const [selectedCode, setSelectedCode] = useState("");
  const [comment, setComment] = useState("");
  const [codeComment, setCodeComment] = useState(""); // Comment for code selection
  const [showCodeCommentError, setShowCodeCommentError] = useState(false); // Error state for missing comment
  
  // Consent dialog states
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [selectedConsentMedication, setSelectedConsentMedication] = useState<any>(null);
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);
  
  // Medication dialog state
  const [showMedicationDialog, setShowMedicationDialog] = useState(false);
  
  // Track codes for each medication (medicationName -> code)
  const [medicationCodes, setMedicationCodes] = useState<Record<string, string>>({});
  
  // Track comments for each medication (medicationName -> comment)
  const [medicationComments, setMedicationComments] = useState<Record<string, string>>({});

  // Track quantities for each medication (medicationName -> quantity)
  const [medicationQuantities, setMedicationQuantities] = useState<Record<string, number>>({});

  // Track last count for each medication (medicationName -> lastCount)
  const [medicationLastCounts, setMedicationLastCounts] = useState<Record<string, number>>({
    "Adderall XR": 30,
    "Melatonin": 45,
    "Vitamin D": 60,
    "Zoloft": 28,
    "Clonidine": 22,
    "Risperidone": 40,
    "Prozac": 35,
    "Trazodone": 25,
    "Multivitamin": 50,
    "Lexapro": 32,
    "Abilify": 38,
    "Propranolol": 44,
    "Concerta": 27,
    "Guanfacine": 33,
    "Strattera": 29,
    "Seroquel": 31,
    "Wellbutrin": 36
  });

  // Track changes and submission status for each period
  const [periodChanges, setPeriodChanges] = useState<Record<string, boolean>>({
    Morning: false,
    Afternoon: false,
    Evening: false,
    Bedtime: false,
    PRN: false
  });
  
  const [periodSubmitted, setPeriodSubmitted] = useState<Record<string, boolean>>({
    Morning: false,
    Afternoon: false,
    Evening: false,
    Bedtime: false,
    PRN: false
  });

  // Pack Meds state
  const [packMedsActiveTab, setPackMedsActiveTab] = useState("doses");
  const [startDate, setStartDate] = useState("12/12/2025");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  
  // Track which medications are checked for packing
  const [packedMedications, setPackedMedications] = useState<Set<string>>(new Set());
  
  // Track which medications are selected for handoff (medication name + period)
  const [selectedMedicationsForHandoff, setSelectedMedicationsForHandoff] = useState<Set<string>>(new Set());
  
  // Track collapsed/expanded state for date sections and periods
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const [collapsedPeriods, setCollapsedPeriods] = useState<Set<string>>(new Set());
  
  // Packing confirmation dialog
  const [showPackingConfirmDialog, setShowPackingConfirmDialog] = useState(false);
  
  // Handoff dialog state
  const [showHandoffDialog, setShowHandoffDialog] = useState(false);
  const [handoffStartDate, setHandoffStartDate] = useState("12/12/2025");
  const [handoffStartTime, setHandoffStartTime] = useState("08:00");
  const [handoffEndDate, setHandoffEndDate] = useState("");
  const [handoffEndTime, setHandoffEndTime] = useState("");
  const [handoffRecipient, setHandoffRecipient] = useState("");
  const [handoffNotes, setHandoffNotes] = useState("");
  const [recipientType, setRecipientType] = useState("");
  const [constituentReceived, setConstituentReceived] = useState(false);
  
  // Date-specific handoff state
  const [showDateHandoffDialog, setShowDateHandoffDialog] = useState(false);
  const [selectedHandoffDate, setSelectedHandoffDate] = useState("");
  const [dateHandoffRecipient, setDateHandoffRecipient] = useState("");
  const [dateHandoffNotes, setDateHandoffNotes] = useState("");

  // Staff Dispense state
  const [showStaffDispenseDialog, setShowStaffDispenseDialog] = useState(false);
  const [staffDispenseDate, setStaffDispenseDate] = useState("");
  const [staffDispenseTime, setStaffDispenseTime] = useState("");
  const [staffDispenseStaffName, setStaffDispenseStaffName] = useState("");
  const [staffDispenseNotes, setStaffDispenseNotes] = useState("");
  
  // Print Labels state
  const [showPrintPreviewDialog, setShowPrintPreviewDialog] = useState(false);
  const [printPreviewDate, setPrintPreviewDate] = useState("");
  const [printPreviewMedications, setPrintPreviewMedications] = useState<any[]>([]);
  
  // Primary day state
  const [primaryPackingDay, setPrimaryPackingDay] = useState<string>("");
  
  // Selected day for packing
  const [selectedPackingDay, setSelectedPackingDay] = useState<string>("");
  
  // Checklist state - tracks completion status for each day
  const [dayChecklists, setDayChecklists] = useState<Record<string, {
    packed: boolean;
    labeled: boolean;
    verified: boolean;
    dispensed: boolean;
  }>>({});

  // Medication Pack List state
  const [medicationPacks, setMedicationPacks] = useState<Array<{
    id: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    status: 'active' | 'archived';
    createdBy: string;
    createdAt: string;
  }>>([
    { id: '1', startDate: '2024-12-16', startTime: '08:00', endDate: '2024-12-23', endTime: '08:00', status: 'active', createdBy: 'Sarah Johnson', createdAt: '2024-12-15 10:30' },
    { id: '2', startDate: '2024-12-09', startTime: '08:00', endDate: '2024-12-16', endTime: '08:00', status: 'active', createdBy: 'Michael Chen', createdAt: '2024-12-08 14:15' },
    { id: '3', startDate: '2024-12-02', startTime: '08:00', endDate: '2024-12-09', endTime: '08:00', status: 'archived', createdBy: 'Emily Rodriguez', createdAt: '2024-12-01 09:45' }
  ]);
  const [showCreatePackDialog, setShowCreatePackDialog] = useState(false);
  const [packFilter, setPackFilter] = useState<'active' | 'archived'>('active');
  const [selectedPackIds, setSelectedPackIds] = useState<string[]>([]);
  const [editingPack, setEditingPack] = useState<any>(null);
  
  // Create/Edit Pack form state
  const [packStartDate, setPackStartDate] = useState("");
  const [packStartTime, setPackStartTime] = useState("08:00");
  const [packEndDate, setPackEndDate] = useState("");
  const [packEndTime, setPackEndTime] = useState("08:00");

  // OTC Medications state
  const [otcEntries, setOtcEntries] = useState<Array<{
    id: string;
    date: string;
    time: string;
    medication: string;
    quantity: number;
    comments: string;
  }>>([
    { id: '1', date: '2024-12-16', time: '09:30', medication: 'tylenol', quantity: 2, comments: 'Headache relief' },
    { id: '2', date: '2024-12-16', time: '20:00', medication: 'tums', quantity: 2, comments: 'Upset stomach after dinner' }
  ]);

  // Unapproved OTC Medications state
  const [unapprovedOtcEntries, setUnapprovedOtcEntries] = useState<Array<{
    id: string;
    date: string;
    time: string;
    medication: string;
    quantity: number;
    comments: string;
    doseDetail: string;
    dispensationDescription: string;
  }>>([
    { id: '1', date: '2024-12-16', time: '14:15', medication: 'vitamin-d', quantity: 1, comments: 'Daily vitamin supplement', doseDetail: '', dispensationDescription: '' }
  ]);

  // PRN Medications state
  const [prnEntries, setPrnEntries] = useState<Array<{
    id: string;
    date: string;
    time: string;
    medication: string;
    quantity: number;
    comments: string;
  }>>([
    { id: '1', date: '2024-12-16', time: '10:45', medication: 'Epi-Pen', quantity: 1, comments: 'Emergency allergy response' }
  ]);

  // Medication History state
  const [medicationHistory, setMedicationHistory] = useState<Array<{
    id: string;
    medicationName: string;
    startDate: string;
    endDate: string;
    dose: string;
    psychotropic: boolean;
    details: string;
    createdAt: string;
    createdBy: string;
  }>>([
    {
      id: '1',
      medicationName: 'Adderall XR',
      startDate: '01/15/2024',
      endDate: '',
      dose: '20mg',
      psychotropic: true,
      details: 'For ADHD management',
      createdAt: '01/15/2024 09:30 AM',
      createdBy: 'Dr. Martinez'
    },
    {
      id: '2',
      medicationName: 'Melatonin',
      startDate: '01/15/2024',
      endDate: '',
      dose: '5mg',
      psychotropic: false,
      details: 'Sleep support',
      createdAt: '01/15/2024 09:30 AM',
      createdBy: 'Dr. Martinez'
    },
    {
      id: '3',
      medicationName: 'Vitamin D',
      startDate: '02/01/2024',
      endDate: '',
      dose: '1000 IU',
      psychotropic: false,
      details: 'Vitamin supplement',
      createdAt: '02/01/2024 10:15 AM',
      createdBy: 'Dr. Chen'
    },
    {
      id: '4',
      medicationName: 'Risperidone',
      startDate: '11/01/2023',
      endDate: '12/31/2023',
      dose: '1mg',
      psychotropic: true,
      details: 'Discontinued due to side effects',
      createdAt: '11/01/2023 02:20 PM',
      createdBy: 'Dr. Wilson'
    }
  ]);

  const [historySort, setHistorySort] = useState<{
    column: 'medicationName' | 'startDate' | 'endDate' | 'dose' | 'psychotropic';
    direction: 'asc' | 'desc';
  }>({
    column: 'startDate',
    direction: 'desc'
  });

  const [showMedicationHistoryDialog, setShowMedicationHistoryDialog] = useState(false);
  const [editingHistoryRecord, setEditingHistoryRecord] = useState<any>(null);
  const [historyFormData, setHistoryFormData] = useState({
    medicationName: '',
    otherMedicationName: '',
    startDate: '',
    endDate: '',
    dose: '',
    psychotropic: false,
    details: ''
  });

  // Mock Blueprint medication list (would be fetched from API)
  const BLUEPRINT_MEDICATIONS = [
    { id: 'adderall', name: 'Adderall XR', psychotropic: true },
    { id: 'abilify', name: 'Abilify', psychotropic: true },
    { id: 'clonidine', name: 'Clonidine', psychotropic: true },
    { id: 'concerta', name: 'Concerta', psychotropic: true },
    { id: 'guanfacine', name: 'Guanfacine', psychotropic: true },
    { id: 'haldol', name: 'Haldol', psychotropic: true },
    { id: 'lexapro', name: 'Lexapro', psychotropic: true },
    { id: 'prozac', name: 'Prozac', psychotropic: true },
    { id: 'risperidone', name: 'Risperidone', psychotropic: true },
    { id: 'seroquel', name: 'Seroquel', psychotropic: true },
    { id: 'strattera', name: 'Strattera', psychotropic: true },
    { id: 'trazodone', name: 'Trazodone', psychotropic: true },
    { id: 'wellbutrin', name: 'Wellbutrin', psychotropic: true },
    { id: 'zoloft', name: 'Zoloft', psychotropic: true },
    { id: 'fish-oil', name: 'Fish Oil', psychotropic: false },
    { id: 'ibuprofen', name: 'Ibuprofen', psychotropic: false },
    { id: 'melatonin', name: 'Melatonin', psychotropic: false },
    { id: 'multivitamin', name: 'Multivitamin', psychotropic: false },
    { id: 'omega-3', name: 'Omega-3', psychotropic: false },
    { id: 'vitamin-d', name: 'Vitamin D', psychotropic: false },
    { id: 'other', name: 'Other', psychotropic: false }
  ];

  // Audit log state (immutable records)
  const [medicationHistoryAuditLog, setMedicationHistoryAuditLog] = useState<Array<{
    id: string;
    timestamp: string;
    action: 'create' | 'modify';
    recordId: string;
    performedBy: string;
    changes: any;
  }>>([]);

  // Attestation records (immutable)
  const [medicationHistoryAttestations, setMedicationHistoryAttestations] = useState<Array<{
    id: string;
    timestamp: string;
    recordId: string;
    attestedBy: string;
    statement: string;
  }>>([]);

  const constituent = id ? MOCK_CONSTITUENT_DATA[id] : null;

  // Medication codes
  const codeOptions = [
    { code: "MA", label: "Medication Administered", color: "bg-green-100 text-green-800 border-green-300" },
    { code: "YR", label: "Constituent Refused", color: "bg-red-100 text-red-800 border-red-300" },
    { code: "NA", label: "Not Available", color: "bg-orange-100 text-orange-800 border-orange-300" },
    { code: "AS", label: "Constituent Asleep", color: "bg-blue-100 text-blue-800 border-blue-300" },
    { code: "AW", label: "Constituent Away", color: "bg-purple-100 text-purple-800 border-purple-300" },
    { code: "HO", label: "Held - Out of Stock", color: "bg-gray-100 text-gray-800 border-gray-300" },
  ];

  // Mock OTC Consent data for Medication Overview (AC6, AC9)
  const mockOTCConsents: OTCConsent[] = [
    {
      id: "OTC-001",
      status: "Active",
      selectedOTCs: ["Acetaminophen 325mg", "Ibuprofen 200mg", "Diphenhydramine 25mg", "Cetirizine 10mg"]
    }
  ];

  // Helper function to transform constituent medications to ActiveMedication format
  const transformToActiveMedications = (medications: any[]): MedicationOverviewType[] => {
    const frequencyToDosePeriod = (frequency: string): "Morning" | "Afternoon" | "Evening" | "Bedtime" | "PRN" => {
      const freq = frequency.toLowerCase();
      if (freq.includes('morning') || freq.includes('am') || freq.includes('daily')) return "Morning";
      if (freq.includes('afternoon') || freq.includes('midday')) return "Afternoon";
      if (freq.includes('evening') || freq.includes('pm')) return "Evening";
      if (freq.includes('bedtime') || freq.includes('night')) return "Bedtime";
      return "PRN";
    };

    const getTimeRange = (dosePeriod: "Morning" | "Afternoon" | "Evening" | "Bedtime" | "PRN"): { startTime: string; endTime: string } => {
      switch (dosePeriod) {
        case "Morning": return { startTime: "6:00 AM", endTime: "11:59 AM" };
        case "Afternoon": return { startTime: "12:00 PM", endTime: "4:59 PM" };
        case "Evening": return { startTime: "5:00 PM", endTime: "7:59 PM" };
        case "Bedtime": return { startTime: "8:00 PM", endTime: "11:59 PM" };
        case "PRN": return { startTime: "", endTime: "" };
      }
    };

    return medications.map((med, index) => {
      const dosePeriod = frequencyToDosePeriod(med.frequency);
      const { startTime, endTime } = getTimeRange(dosePeriod);

      return {
        id: index + 1,
        dosePeriod,
        medication: med.name,
        genericName: undefined, // Mock data doesn't include generic names
        dose: med.dose,
        startTime,
        endTime,
        prescriptionStart: "01/01/2026", // Mock active date range
        prescriptionEnd: "12/31/2026"
      };
    });
  };

  // Helper function to get combined comments (code + quantity)
  const getCombinedComment = (medicationName: string) => {
    const codeComment = medicationComments[`${medicationName}_code`] || "";
    const quantityComment = medicationComments[medicationName] || "";
    
    // If both exist, return a combined indicator that shows there are multiple comments
    if (codeComment && quantityComment) {
      return `${codeComment}\n---\n${quantityComment}`;
    }
    
    // Return whichever exists
    return codeComment || quantityComment;
  };

  const handleCodeClick = (medication: any) => {
    setSelectedMedication(medication);
    setSelectedCode(medicationCodes[medication.name] || "");
    setCodeComment(medicationComments[`${medication.name}_code`] || ""); // Load existing code comment
    setShowCodeCommentError(false); // Reset error state
    setShowCodeDialog(true);
  };

  const handleQuantityClick = (medication: any) => {
    setSelectedMedication(medication);
    // Load the quantity comment
    setComment(medicationComments[medication.name] || "");
    // Load the code comment for display
    setCodeComment(medicationComments[`${medication.name}_code`] || "");
    setShowCommentDialog(true);
  };

  const handleRefreshMedications = async () => {
    setIsRefreshingMedications(true);
    // Simulate data reload - in production this would fetch fresh data from API
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsRefreshingMedications(false);
  };

  // Medication History handlers
  const handleSortHistory = (column: 'medicationName' | 'startDate' | 'endDate' | 'dose' | 'psychotropic') => {
    setHistorySort(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedMedicationHistory = () => {
    const sorted = [...medicationHistory].sort((a, b) => {
      let aValue: any = a[historySort.column];
      let bValue: any = b[historySort.column];

      // Handle date sorting
      if (historySort.column === 'startDate' || historySort.column === 'endDate') {
        const parseDate = (dateStr: string) => {
          if (!dateStr) return new Date(0);
          const [month, day, year] = dateStr.split('/');
          return new Date(`${year}-${month}-${day}`);
        };
        aValue = parseDate(aValue);
        bValue = parseDate(bValue);
      }

      // Handle boolean sorting
      if (historySort.column === 'psychotropic') {
        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        return historySort.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle number and date sorting
      if (historySort.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    return sorted;
  };

  const handleOpenAddMedicationHistory = () => {
    setEditingHistoryRecord(null);
    setHistoryFormData({
      medicationName: '',
      otherMedicationName: '',
      startDate: '',
      endDate: '',
      dose: '',
      psychotropic: false,
      details: ''
    });
    setShowMedicationHistoryDialog(true);
  };

  const handleOpenEditMedicationHistory = (record: any) => {
    setEditingHistoryRecord(record);
    setHistoryFormData({
      medicationName: record.medicationName,
      otherMedicationName: '',
      startDate: record.startDate,
      endDate: record.endDate,
      dose: record.dose,
      psychotropic: record.psychotropic,
      details: record.details
    });
    setShowMedicationHistoryDialog(true);
  };

  const handleMedicationHistoryFieldChange = (field: string, value: any) => {
    setHistoryFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-check psychotropic if medication is in the list
      if (field === 'medicationName' && value !== 'Other') {
        const selectedMed = BLUEPRINT_MEDICATIONS.find(m => m.name === value);
        if (selectedMed) {
          updated.psychotropic = selectedMed.psychotropic;
        }
      }

      return updated;
    });
  };

  const validateMedicationHistoryForm = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Medication Name required
    if (!historyFormData.medicationName) {
      errors.push('Medication Name is required');
    }

    // If "Other" selected, other medication name is required
    if (historyFormData.medicationName === 'Other' && !historyFormData.otherMedicationName.trim()) {
      errors.push('Please enter medication name when "Other" is selected');
    }

    // Start Date validation
    if (historyFormData.startDate) {
      const [month, day, year] = historyFormData.startDate.split('/');
      const startDate = new Date(`${year}-${month}-${day}`);
      startDate.setHours(0, 0, 0, 0);

      if (startDate > today) {
        errors.push('Start Date must be less than or equal to today');
      }

      // If End Date is populated, Start Date is required and must be <= End Date
      if (historyFormData.endDate) {
        const [eMonth, eDay, eYear] = historyFormData.endDate.split('/');
        const endDate = new Date(`${eYear}-${eMonth}-${eDay}`);
        endDate.setHours(0, 0, 0, 0);

        if (startDate > endDate) {
          errors.push('Start Date must be less than or equal to End Date');
        }
      }
    }

    // End Date validation
    if (historyFormData.endDate) {
      if (!historyFormData.startDate) {
        errors.push('Start Date is required when End Date is provided');
      }

      const [eMonth, eDay, eYear] = historyFormData.endDate.split('/');
      const endDate = new Date(`${eYear}-${eMonth}-${eDay}`);
      endDate.setHours(0, 0, 0, 0);

      if (endDate > today) {
        errors.push('End Date must be less than or equal to today');
      }
    }

    return { valid: errors.length === 0, errors };
  };

  const handleSaveMedicationHistory = () => {
    const validation = validateMedicationHistoryForm();

    if (!validation.valid) {
      alert(validation.errors.join('\n'));
      return;
    }

    const timestamp = new Date().toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const currentUser = 'Current Staff'; // Would come from auth context

    if (editingHistoryRecord) {
      // Modify existing record
      const updatedRecord = {
        ...editingHistoryRecord,
        medicationName: historyFormData.medicationName === 'Other'
          ? historyFormData.otherMedicationName
          : historyFormData.medicationName,
        startDate: historyFormData.startDate,
        endDate: historyFormData.endDate,
        dose: historyFormData.dose,
        psychotropic: historyFormData.psychotropic,
        details: historyFormData.details
      };

      setMedicationHistory(prev =>
        prev.map(record => record.id === editingHistoryRecord.id ? updatedRecord : record)
      );

      // Create audit log entry (immutable)
      const auditEntry = {
        id: `audit-${Date.now()}`,
        timestamp,
        action: 'modify' as const,
        recordId: editingHistoryRecord.id,
        performedBy: currentUser,
        changes: {
          before: editingHistoryRecord,
          after: updatedRecord
        }
      };
      setMedicationHistoryAuditLog(prev => [...prev, auditEntry]);

      // Create attestation record (immutable)
      const attestationEntry = {
        id: `attest-${Date.now()}`,
        timestamp,
        recordId: editingHistoryRecord.id,
        attestedBy: currentUser,
        statement: 'I attest that this medication history record modification is accurate and complete.'
      };
      setMedicationHistoryAttestations(prev => [...prev, attestationEntry]);

    } else {
      // Create new record
      const newRecord = {
        id: `med-hist-${Date.now()}`,
        medicationName: historyFormData.medicationName === 'Other'
          ? historyFormData.otherMedicationName
          : historyFormData.medicationName,
        startDate: historyFormData.startDate,
        endDate: historyFormData.endDate,
        dose: historyFormData.dose,
        psychotropic: historyFormData.psychotropic,
        details: historyFormData.details,
        createdAt: timestamp,
        createdBy: currentUser
      };

      setMedicationHistory(prev => [...prev, newRecord]);

      // Create audit log entry (immutable)
      const auditEntry = {
        id: `audit-${Date.now()}`,
        timestamp,
        action: 'create' as const,
        recordId: newRecord.id,
        performedBy: currentUser,
        changes: { created: newRecord }
      };
      setMedicationHistoryAuditLog(prev => [...prev, auditEntry]);

      // Create attestation record (immutable)
      const attestationEntry = {
        id: `attest-${Date.now()}`,
        timestamp,
        recordId: newRecord.id,
        attestedBy: currentUser,
        statement: 'I attest that this medication history record is accurate and complete.'
      };
      setMedicationHistoryAttestations(prev => [...prev, attestationEntry]);
    }

    setShowMedicationHistoryDialog(false);
    setEditingHistoryRecord(null);
  };

  const handleQuantityChange = (medicationName: string, newQuantity: number) => {
    setMedicationQuantities(prev => ({
      ...prev,
      [medicationName]: newQuantity
    }));
  };

  const handleViewConsentDetails = (medication: any) => {
    setSelectedConsentMedication(medication);
    setConsentAcknowledged(false);
    setShowConsentDialog(true);
  };

  const handleAcknowledgeConsent = () => {
    if (consentAcknowledged) {
      setShowConsentDialog(false);
      setSelectedConsentMedication(null);
      setConsentAcknowledged(false);
    }
  };

  // Packing handlers
  const handleToggleMedication = (medicationName: string) => {
    setPackedMedications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(medicationName)) {
        newSet.delete(medicationName);
      } else {
        newSet.add(medicationName);
      }
      return newSet;
    });
  };

  const handlePackAllByPeriod = (period: string) => {
    const medsInPeriod = constituent?.medications.filter((m: any) => m.frequency === period) || [];
    setPackedMedications(prev => {
      const newSet = new Set(prev);
      medsInPeriod.forEach((med: any) => newSet.add(med.name));
      return newSet;
    });
  };

  const handleCompletePacking = () => {
    if (packedMedications.size === 0) {
      return;
    }
    setShowPackingConfirmDialog(true);
  };

  const handleConfirmPacking = () => {
    // Here you would typically send the data to your backend
    
    // Reset the packing state
    setPackedMedications(new Set());
    setShowPackingConfirmDialog(false);
  };

  const getScheduledMedications = () => {
    return constituent?.medications.filter((m: any) => 
      !['PRN', 'As needed'].includes(m.frequency)
    ) || [];
  };

  const getPackedCount = () => packedMedications.size;
  const getTotalScheduledCount = () => getScheduledMedications().length;
  const getRemainingCount = () => getTotalScheduledCount() - getPackedCount();

  // Date and period collapse handlers
  const toggleDateCollapse = (dateKey: string) => {
    setCollapsedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateKey)) {
        newSet.delete(dateKey);
      } else {
        newSet.add(dateKey);
      }
      return newSet;
    });
  };

  const togglePeriodCollapse = (periodKey: string) => {
    setCollapsedPeriods(prev => {
      const newSet = new Set(prev);
      if (newSet.has(periodKey)) {
        newSet.delete(periodKey);
      } else {
        newSet.add(periodKey);
      }
      return newSet;
    });
  };

  // Generate packing dates based on date range
  const generatePackingDates = () => {
    // For demo purposes, generate 7 days from start date
    const dates = [];
    const start = new Date(2024, 11, 30); // Dec 30, 2024
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      dates.push({
        dateKey: toLocalIso(currentDate),
        displayDate: formatMdy(currentDate),
        dayOfWeek: formatMdy(currentDate)
      });
    }
    return dates;
  };

  // Select/deselect all medications in a period for a specific date
  const handleSelectAllInDatePeriod = (dateKey: string, period: string) => {
    const medsInPeriod = constituent?.medications.filter((m: any) => m.frequency === period) || [];
    setPackedMedications(prev => {
      const newSet = new Set(prev);
      medsInPeriod.forEach((med: any) => {
        const key = `${dateKey}-${period}-${med.name}`;
        newSet.add(key);
      });
      return newSet;
    });
  };

  const handleDeselectAllInDatePeriod = (dateKey: string, period: string) => {
    const medsInPeriod = constituent?.medications.filter((m: any) => m.frequency === period) || [];
    setPackedMedications(prev => {
      const newSet = new Set(prev);
      medsInPeriod.forEach((med: any) => {
        const key = `${dateKey}-${period}-${med.name}`;
        newSet.delete(key);
      });
      return newSet;
    });
  };

  // Check if all meds in a period are selected
  const areAllSelectedInDatePeriod = (dateKey: string, period: string) => {
    const medsInPeriod = constituent?.medications.filter((m: any) => m.frequency === period) || [];
    return medsInPeriod.every((med: any) => {
      const key = `${dateKey}-${period}-${med.name}`;
      return packedMedications.has(key);
    });
  };

  // Get medication status
  const getMedicationStatus = (dateKey: string, period: string, medName: string) => {
    const key = `${dateKey}-${period}-${medName}`;
    if (packedMedications.has(key)) {
      return { label: 'Ready', color: '#10b981', bgColor: '#d1fae5' };
    }
    return { label: 'Pending', color: '#f59e0b', bgColor: '#fef3c7' };
  };

  // Medication selection handlers for handoff
  const handleToggleMedicationSelection = (medicationKey: string) => {
    setSelectedMedicationsForHandoff(prev => {
      const newSet = new Set(prev);
      if (newSet.has(medicationKey)) {
        newSet.delete(medicationKey);
      } else {
        newSet.add(medicationKey);
      }
      return newSet;
    });
  };

  const handleSelectAllInPeriod = (period: string, medications: any[]) => {
    setSelectedMedicationsForHandoff(prev => {
      const newSet = new Set(prev);
      medications.forEach((med: any) => {
        const key = `${med.name}-${period}`;
        newSet.add(key);
      });
      return newSet;
    });
  };

  const handleDeselectAllInPeriod = (period: string, medications: any[]) => {
    setSelectedMedicationsForHandoff(prev => {
      const newSet = new Set(prev);
      medications.forEach((med: any) => {
        const key = `${med.name}-${period}`;
        newSet.delete(key);
      });
      return newSet;
    });
  };

  // Mark that a period has changes
  const markPeriodChanged = (period: string) => {
    setPeriodChanges(prev => ({ ...prev, [period]: true }));
    setPeriodSubmitted(prev => ({ ...prev, [period]: false }));
  };

  // Update handlers for each time period
  const handleUpdatePeriod = (period: string) => {
    // Get medications for this period
    const periodMedications = constituent?.medications.filter((med: any) => {
      const freq = med.frequency.toLowerCase();
      if (period === 'Morning') {
        return freq.includes('morning') || freq.includes('am') || freq.includes('daily');
      } else if (period === 'Afternoon') {
        return freq.includes('afternoon') || freq.includes('midday');
      } else if (period === 'Evening') {
        return freq.includes('evening') || freq.includes('pm');
      } else if (period === 'Bedtime') {
        return freq.includes('bedtime') || freq.includes('night');
      } else if (period === 'PRN') {
        return freq.includes('prn') || freq.includes('as needed');
      }
      return false;
    }) || [];

    // Count how many medications have updates
    let updateCount = 0;
    periodMedications.forEach((med: any) => {
      if (medicationQuantities[med.name] !== undefined || 
          medicationCodes[med.name] !== undefined || 
          medicationComments[med.name] !== undefined) {
        updateCount++;
      }
    });

    // Mark as submitted
    setPeriodSubmitted(prev => ({ ...prev, [period]: true }));
    setPeriodChanges(prev => ({ ...prev, [period]: false }));

    console.log(`Submitted ${period} period:`, {
      medications: periodMedications.length,
      quantities: medicationQuantities,
      codes: medicationCodes,
      comments: medicationComments
    });
  };

  const handleHandoff = () => {
    // Navigate to Pack Meds tab
    setActiveMedicationTab('pack-meds');
  };

  const handleConfirmHandoff = () => {
    if (!recipientType) {
      return;
    }
    if (recipientType === 'Other' && !handoffNotes.trim()) {
      return;
    }
    if (!constituentReceived) {
      return;
    }
    if (!handoffEndDate) {
      return;
    }
    
    // Reset states
    setShowHandoffDialog(false);
    setSelectedMedicationsForHandoff(new Set());
    setHandoffRecipient("");
    setHandoffNotes("");
    setHandoffEndDate("");
    setHandoffEndTime("");
    setRecipientType("");
    setConstituentReceived(false);
  };

  // Date-specific handoff handlers
  const handleDateHandoff = (dateKey: string, displayDate: string) => {
    setSelectedHandoffDate(displayDate);
    setShowDateHandoffDialog(true);
  };

  const handleConfirmDateHandoff = () => {
    if (!dateHandoffRecipient.trim()) {
      return;
    }
    
    // Here you would typically send the handoff data to your backend
    console.log('Handoff medications for date:', selectedHandoffDate);
    console.log('Recipient:', dateHandoffRecipient);
    console.log('Notes:', dateHandoffNotes);
    
    // Reset states
    setShowDateHandoffDialog(false);
    setSelectedHandoffDate("");
    setDateHandoffRecipient("");
    setDateHandoffNotes("");
  };

  // Staff Dispense handlers
  const handleStaffDispense = (dateKey: string, displayDate: string) => {
    setStaffDispenseDate(displayDate);
    setStaffDispenseTime(new Date().toTimeString().slice(0, 5));
    setShowStaffDispenseDialog(true);
  };

  const handleConfirmStaffDispense = () => {
    if (!staffDispenseStaffName.trim()) {
      return;
    }
    
    console.log('Staff Dispense for date:', staffDispenseDate);
    console.log('Staff Name:', staffDispenseStaffName);
    console.log('Time:', staffDispenseTime);
    console.log('Notes:', staffDispenseNotes);
    
    // Update checklist
    const dateKey = staffDispenseDate;
    setDayChecklists(prev => ({
      ...prev,
      [dateKey]: {
        ...(prev[dateKey] || { packed: false, labeled: false, verified: false, dispensed: false }),
        dispensed: true
      }
    }));
    
    // Reset states
    setShowStaffDispenseDialog(false);
    setStaffDispenseDate("");
    setStaffDispenseTime("");
    setStaffDispenseStaffName("");
    setStaffDispenseNotes("");
  };

  // Print Labels handlers
  const handlePrintLabels = (dateKey: string, displayDate: string) => {
    // Get all medications for this date
    const allMeds: any[] = [];
    ['Morning', 'Afternoon', 'Evening', 'Bedtime'].forEach(period => {
      const medsInPeriod = constituent?.medications.filter((m: any) => m.frequency === period) || [];
      medsInPeriod.forEach(med => {
        allMeds.push({
          ...med,
          period,
          date: displayDate
        });
      });
    });
    
    setPrintPreviewDate(displayDate);
    setPrintPreviewMedications(allMeds);
    setShowPrintPreviewDialog(true);
  };

  const handleConfirmPrint = () => {
    console.log('Printing labels for:', printPreviewDate);
    console.log('Medications:', printPreviewMedications);
    
    // Update checklist
    setDayChecklists(prev => ({
      ...prev,
      [printPreviewDate]: {
        ...(prev[printPreviewDate] || { packed: false, labeled: false, verified: false, dispensed: false }),
        labeled: true
      }
    }));
    
    // Here you would trigger actual print
    window.print();
    
    setShowPrintPreviewDialog(false);
  };

  // Primary day handlers
  const handleSetPrimaryDay = (dateKey: string) => {
    if (primaryPackingDay === dateKey) {
      setPrimaryPackingDay("");
    } else {
      setPrimaryPackingDay(dateKey);
    }
  };

  // Select day for packing
  const handleSelectPackingDay = (dateKey: string) => {
    if (selectedPackingDay === dateKey) {
      setSelectedPackingDay("");
    } else {
      setSelectedPackingDay(dateKey);
    }
  };

  // Checklist handlers
  const handleToggleChecklistItem = (dateKey: string, item: 'packed' | 'labeled' | 'verified' | 'dispensed') => {
    setDayChecklists(prev => ({
      ...prev,
      [dateKey]: {
        ...(prev[dateKey] || { packed: false, labeled: false, verified: false, dispensed: false }),
        [item]: !prev[dateKey]?.[item]
      }
    }));
  };

  const getChecklistProgress = (dateKey: string) => {
    const checklist = dayChecklists[dateKey];
    if (!checklist) return 0;
    const completed = [checklist.packed, checklist.labeled, checklist.verified, checklist.dispensed].filter(Boolean).length;
    return (completed / 4) * 100;
  };

  // Medication Pack handlers
  const handleCreateNewPack = () => {
    setEditingPack(null);
    setPackStartDate("");
    setPackStartTime("08:00");
    setPackEndDate("");
    setPackEndTime("08:00");
    setShowCreatePackDialog(true);
  };

  const handleEditPack = () => {
    if (selectedPackIds.length !== 1) return;
    const pack = medicationPacks.find(p => p.id === selectedPackIds[0]);
    if (!pack) return;
    
    setEditingPack(pack);
    setPackStartDate(pack.startDate);
    setPackStartTime(pack.startTime);
    setPackEndDate(pack.endDate);
    setPackEndTime(pack.endTime);
    setShowCreatePackDialog(true);
  };

  const handleViewPack = () => {
    if (selectedPackIds.length !== 1) return;
    const pack = medicationPacks.find(p => p.id === selectedPackIds[0]);
    if (!pack) return;
    
    console.log('Viewing pack:', pack);
    // Navigate to pack detail view or show in dialog
  };

  const handleRefreshPacks = () => {
    console.log('Refreshing medication packs...');
    // In real app, this would fetch fresh data from API
  };

  const handlePrintPack = () => {
    if (selectedPackIds.length === 0) return;
    console.log('Printing packs:', selectedPackIds);
    window.print();
  };

  const handleSavePack = () => {
    if (!packStartDate || !packEndDate) return;

    if (editingPack) {
      // Update existing pack
      setMedicationPacks(prev => prev.map(p => 
        p.id === editingPack.id
          ? { ...p, startDate: packStartDate, startTime: packStartTime, endDate: packEndDate, endTime: packEndTime }
          : p
      ));
    } else {
      // Create new pack
      const newPack = {
        id: Date.now().toString(),
        startDate: packStartDate,
        startTime: packStartTime,
        endDate: packEndDate,
        endTime: packEndTime,
        status: 'active' as const,
        createdBy: 'Current User',
        createdAt: new Date().toISOString()
      };
      setMedicationPacks(prev => [...prev, newPack]);
    }

    setShowCreatePackDialog(false);
    setEditingPack(null);
  };

  const handleArchivePack = () => {
    if (selectedPackIds.length === 0) return;
    
    setMedicationPacks(prev => prev.map(p => 
      selectedPackIds.includes(p.id)
        ? { ...p, status: p.status === 'active' ? 'archived' : 'active' as const }
        : p
    ));
    setSelectedPackIds([]);
  };

  const handleTogglePackSelection = (packId: string) => {
    setSelectedPackIds(prev => 
      prev.includes(packId) 
        ? prev.filter(id => id !== packId)
        : [...prev, packId]
    );
  };

  const handleSelectAllPacks = () => {
    const filteredPacks = medicationPacks.filter(p => p.status === packFilter);
    if (selectedPackIds.length === filteredPacks.length) {
      setSelectedPackIds([]);
    } else {
      setSelectedPackIds(filteredPacks.map(p => p.id));
    }
  };

  const getFilteredPacks = () => {
    return medicationPacks.filter(p => p.status === packFilter);
  };

  // OTC Medication handlers
  const handleAddOtcEntry = () => {
    const newEntry = {
      id: Date.now().toString(),
      date: localTodayIso(),
      time: new Date().toTimeString().slice(0, 5),
      medication: 'tylenol',
      quantity: 1,
      comments: ''
    };
    setOtcEntries(prev => [...prev, newEntry]);
  };

  const handleUpdateOtcEntry = (id: string, field: string, value: any) => {
    setOtcEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const handleDeleteOtcEntry = (id: string) => {
    setOtcEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const handleUpdateOtcSection = () => {
    // OTC medications updated
  };

  // Unapproved OTC Medication handlers
  const handleAddUnapprovedOtcEntry = () => {
    const newEntry = {
      id: Date.now().toString(),
      date: localTodayIso(),
      time: new Date().toTimeString().slice(0, 5),
      medication: 'tylenol',
      quantity: 1,
      comments: '',
      doseDetail: '',
      dispensationDescription: ''
    };
    setUnapprovedOtcEntries(prev => [...prev, newEntry]);
  };

  const handleUpdateUnapprovedOtcEntry = (id: string, field: string, value: any) => {
    setUnapprovedOtcEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const handleDeleteUnapprovedOtcEntry = (id: string) => {
    setUnapprovedOtcEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const handleUpdateUnapprovedOtcSection = () => {
    // Unapproved OTC medications updated
  };

  // PRN Medication handlers
  const handleAddPrnEntry = () => {
    const newEntry = {
      id: Date.now().toString(),
      date: localTodayIso(),
      time: new Date().toTimeString().slice(0, 5),
      medication: 'Epi-Pen',
      quantity: 1,
      comments: ''
    };
    setPrnEntries(prev => [...prev, newEntry]);
  };

  const handleUpdatePrnEntry = (id: string, field: string, value: any) => {
    setPrnEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const handleDeletePrnEntry = (id: string) => {
    setPrnEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const handleUpdatePrnSection = () => {
    // PRN medications updated
  };

  const handlePrintPackingList = () => {
    if (packedMedications.size === 0) {
      return;
    }

    // Create print content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      return;
    }

    const packedMedsList = Array.from(packedMedications).map(medName => {
      const medDetails = constituent?.medications.find((m: any) => m.name === medName);
      return { name: medName, ...medDetails };
    });

    const medRows = packedMedsList.map(function(med) {
      return "<tr><td class='checkbox-cell'><span class='checkbox'></span></td><td><strong>" + (med.name) + "</strong></td><td>" + (med.dose || "N/A") + "</td><td>" + (med.frequency || "N/A") + "</td><td>" + (med.prescriber || "N/A") + "</td><td>7</td></tr>";
    }).join("");
    var allergyNote = (constituent?.allergies.length > 0) ? constituent.allergies.join(", ") : "None reported";
    var allergyWarning = (constituent?.allergies.length > 0) ? ("ALLERGIES: " + constituent.allergies.join(", ")) : "";
    var packingPeriod = "From: " + startDate + (endDate ? " To: " + endDate : "");
    var generatedDate = new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
    const printContent = [
      "<!DOCTYPE html><html><head>",
      "<title>Medication Packing List - " + (constituent?.fullName || "") + "</title>",
      "<style>",
      "@media print { @page { margin: 0.5in; } }",
      "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1a1a1a; }",
      ".header { border-bottom: 3px solid #145F33; padding-bottom: 20px; margin-bottom: 30px; }",
      ".logo { font-size: 24px; font-weight: bold; color: #145F33; margin-bottom: 10px; }",
      "h1 { margin: 0; font-size: 28px; color: #145F33; }",
      ".meta-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; padding: 20px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }",
      ".medications-table { width: 100%; border-collapse: collapse; margin: 30px 0; }",
      ".medications-table th { background: #145F33; color: white; padding: 12px; text-align: left; font-size: 13px; }",
      ".medications-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }",
      ".checkbox-cell { text-align: center; width: 50px; }",
      ".checkbox { width: 18px; height: 18px; border: 2px solid #145F33; display: inline-block; border-radius: 3px; }",
      ".footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #e5e7eb; }",
      ".signature-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }",
      ".signature-line { border-top: 2px solid #1a1a1a; margin-top: 50px; padding-top: 8px; font-size: 12px; color: #6b7280; }",
      ".print-date { text-align: right; color: #6b7280; font-size: 12px; margin-top: 20px; }",
      "@media print { button { display: none; } }",
      ".print-btn { background: #145F33; color: white; border: none; padding: 12px 24px; border-radius: 24px; font-size: 14px; cursor: pointer; margin-right: 10px; }",
      ".close-btn { background: #6b7280; color: white; border: none; padding: 12px 24px; border-radius: 24px; font-size: 14px; cursor: pointer; }",
      "</style></head><body>",
      "<div style='margin:20px 0;text-align:center'><button class='print-btn' onclick='window.print()'>Print List</button><button class='close-btn' onclick='window.close()'>Close</button></div>",
      "<div class='header'><div class='logo'>Mercy Home</div><h1>Medication Packing List</h1></div>",
      "<div class='meta-info'><div>",
      "<div style='margin-bottom:10px'><div style='font-weight:600;color:#6b7280;font-size:12px'>Constituent Name</div><div style='font-size:16px;margin-top:4px'>" + (constituent?.fullName || "") + "</div></div>",
      "<div style='margin-bottom:10px'><div style='font-weight:600;color:#6b7280;font-size:12px'>Date of Birth</div><div style='font-size:16px;margin-top:4px'>" + (constituent?.dob || "") + " (Age " + (constituent?.age || "") + ")</div></div>",
      "<div style='margin-bottom:10px'><div style='font-weight:600;color:#6b7280;font-size:12px'>Program</div><div style='font-size:16px;margin-top:4px'>" + (constituent?.program || "") + "</div></div>",
      "</div><div>",
      "<div style='margin-bottom:10px'><div style='font-weight:600;color:#6b7280;font-size:12px'>Packing Period</div><div style='font-size:16px;margin-top:4px'>" + packingPeriod + "</div></div>",
      "<div style='margin-bottom:10px'><div style='font-weight:600;color:#6b7280;font-size:12px'>Total Medications</div><div style='font-size:16px;margin-top:4px'>" + packedMedications.size + " medication(s)</div></div>",
      "<div style='margin-bottom:10px'><div style='font-weight:600;color:#6b7280;font-size:12px'>Allergies</div><div style='font-size:16px;margin-top:4px'>" + allergyNote + "</div></div>",
      "</div></div>",
      "<table class='medications-table'><thead><tr><th class='checkbox-cell'>Packed</th><th>Medication Name</th><th>Dose</th><th>Frequency</th><th>Prescriber</th><th>Quantity</th></tr></thead>",
      "<tbody>" + medRows + "</tbody></table>",
      "<div class='footer'>",
      "<div style='margin-bottom:20px'><div style='font-weight:600;color:#6b7280;font-size:12px'>Special Instructions / Notes</div>",
      "<div style='min-height:60px;margin-top:10px;padding:12px;border:1px solid #e5e7eb;border-radius:4px;background:white'>" + allergyWarning + "</div></div>",
      "<div class='signature-section'><div><div class='signature-line'>Packed By (Print Name and Sign)</div></div><div><div class='signature-line'>Date and Time</div></div></div>",
      "<div class='signature-section'><div><div class='signature-line'>Received By (Print Name and Sign)</div></div><div><div class='signature-line'>Date and Time</div></div></div>",
      "<div class='print-date'>Generated: " + generatedDate + "</div></div>",
      "</body></html>"
    ].join("\n");

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleSaveCode = () => {
    // Validate: if a code is selected, a comment must be provided
    if (selectedCode && !codeComment.trim()) {
      setShowCodeCommentError(true);
      return;
    }
    
    if (selectedCode && selectedMedication) {
      setMedicationCodes(prev => ({
        ...prev,
        [selectedMedication.name]: selectedCode
      }));
      
      // Save the code comment
      setMedicationComments(prev => ({
        ...prev,
        [`${selectedMedication.name}_code`]: codeComment
      }));
      
      setShowCodeDialog(false);
      setSelectedCode("");
      setCodeComment("");
      setShowCodeCommentError(false);
      setSelectedMedication(null);
    } else if (!selectedCode && selectedMedication) {
      // Allow closing without selecting a code (clearing)
      setShowCodeDialog(false);
      setSelectedCode("");
      setCodeComment("");
      setShowCodeCommentError(false);
      setSelectedMedication(null);
    }
  };

  const handleSaveComment = () => {
    if (selectedMedication) {
      setMedicationComments(prev => ({
        ...prev,
        [selectedMedication.name]: comment
      }));
      setShowCommentDialog(false);
      setComment("");
      setSelectedMedication(null);
    }
  };

  if (!constituent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Constituent Not Found</h2>
          <Button onClick={() => navigate('/program-log')} className="rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Program Log
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Unified Constituent Profile Header */}
      <div 
        className="px-6 py-4"
        style={{
          backgroundColor: 'var(--slds-g-color-background-base)',
          borderBottom: '1px solid var(--slds-g-color-border-base-1)'
        }}
      >
        {/* Breadcrumbs */}
        <nav className="flex items-center slds-text-3 mb-3" style={{ color: 'var(--slds-g-color-text-weak)' }} aria-label="Breadcrumb">
          <span 
            className="hover:underline cursor-pointer" 
            onClick={() => navigate(-1)}
          >
            Back
          </span>
          <span className="mx-1">/</span>
          <span style={{ color: 'var(--slds-g-color-text-default)' }}>{constituent.fullName}</span>
        </nav>

        {/* Main Header Content */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white flex-shrink-0"
              style={{ backgroundColor: 'var(--color-brand-primary)' }}
            >
              <User className="w-8 h-8" />
            </div>

            {/* Title and Status */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1
                  className="font-semibold"
                  style={{
                    fontSize: '1.5rem',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                >
                  {constituent.fullName}
                </h1>
                <Badge
                  className="bg-green-100 text-green-800 border-green-300"
                  style={{ borderRadius: '12px', padding: '4px 12px' }}
                >
                  Active
                </Badge>
                <YouthAlertIcons />
              </div>
              <div className="flex items-center gap-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                <span>Age: <span className="font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{constituent.age} ({constituent.dob})</span></span>
                <span>•</span>
                <span>Medical Conditions: <span className="font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{constituent.diagnoses.join(', ')}</span></span>
                <span>•</span>
                <span>Allergies: <span className="font-medium text-red-700">{constituent.allergies.length > 0 ? constituent.allergies.join(', ') : 'None'}</span></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => navigate('/dispense/1/Morning')}
              style={{ backgroundColor: '#145F33', color: 'white' }}
            >
              <Pill className="h-4 w-4 mr-2" />
              Dispense Medications
            </Button>
            {constituent.hasPackedMeds && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full relative"
                onClick={handleHandoff}
                style={{ borderColor: 'var(--color-brand-primary)', color: 'var(--color-brand-primary)' }}
              >
                <Clock className="h-4 w-4 mr-2" />
                Handoff
              </Button>
            )}
            {viewMode === 'tablet' && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => navigate('/pack-meds')}
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)'
                }}
              >
                <Package className="h-4 w-4 mr-2" />
                Pack Meds
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area with Side Navigation */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation - Always Visible */}
        <div 
          className="w-64 border-r overflow-y-auto"
          style={{
            backgroundColor: 'var(--slds-g-color-background-base)',
            borderColor: 'var(--slds-g-color-border-base-1)'
          }}
        >
          <nav className="p-3">
            {/* ── Health Overview — parent nav item with subtabs ── */}
            {(() => {
              const healthTabs = ['admh-medication', 'admh-physical', 'admh-mental', 'admh-substance'];
              const isHealthActive = healthTabs.includes(activeMedicationTab);
              return (
                <div className="mt-0.5">
                  <button
                    onClick={() => setActiveMedicationTab('admh-medication')}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded text-sm font-medium transition-all mb-0.5",
                      isHealthActive ? "text-white shadow-sm" : "hover:bg-gray-50"
                    )}
                    style={isHealthActive ? { backgroundColor: '#145F33' } : { color: 'var(--slds-g-color-text-default)' }}
                  >
                    Health Overview
                  </button>
                  {isHealthActive && (
                    <div className="ml-3 mt-0.5 space-y-0.5">
                      {[
                        { id: 'admh-medication', label: 'Medication' },
                        { id: 'admh-physical',   label: 'Physical Health' },
                        { id: 'admh-mental',     label: 'Mental Health' },
                        { id: 'admh-substance',  label: 'Substance Use' },
                      ].map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => setActiveMedicationTab(sub.id)}
                          className={cn(
                            "w-full text-left px-3 py-1.5 rounded text-xs font-medium transition-all",
                            activeMedicationTab === sub.id ? "bg-white font-semibold" : "hover:bg-gray-50"
                          )}
                          style={
                            activeMedicationTab === sub.id
                              ? { color: '#145F33' }
                              : { color: 'var(--slds-g-color-text-default)' }
                          }
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--slds-g-color-background-base)' }}>
          {/* The Health Overview › Medication tabs sit flush (their panels pad
              themselves); pb-16 clears the fixed UtilityBar so the last
              section can scroll fully into view. */}
          <div className={cn("max-w-[1600px]", activeMedicationTab !== 'admh-medication' ? "p-8" : "pb-16")}>
          {/* Health Overview Tab - Shows daily medication dispensation tracking */}
          {activeMedicationTab === 'health-overview' && (
            <div className="space-y-6">
              {/* Page Header */}
              <div className="mb-6">
                <h1 className="text-[20px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  Medication Overview
                </h1>
                <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  Daily medication schedule and dispensation tracking
                </p>
              </div>
              {/* MORNING Period */}
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
              >
                {/* Period Header */}
                <div 
                  className="px-6 py-3.5 flex items-center gap-3"
                  style={{
                    backgroundColor: '#FFA500'
                  }}
                >
                  <Sunrise className="w-5 h-5 text-white" />
                  <span className="font-semibold text-[15px] text-white">Morning</span>
                  <span className="text-[13px] ml-2 text-white opacity-90">6:00 AM - 11:00 AM</span>
                </div>

                {/* Medications Table */}
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                        <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Medication</th>
                        <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Dose</th>
                        <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Instructions</th>
                        <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Start</th>
                        <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Stop</th>
                        <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>QTY</th>
                        <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Last Count</th>
                        <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Staff</th>
                        <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Constituent</th>
                        <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Code</th>
                        <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {constituent.medications
                        .filter((med: any) => 
                          med.frequency.toLowerCase().includes('morning') || 
                          med.frequency.toLowerCase().includes('am') || 
                          med.frequency.toLowerCase().includes('daily')
                        )
                        .map((med: any, idx: number) => (
                          <MedicationRow
                            key={`morning-${idx}`}
                            medication={med}
                            startTime="6:00 AM"
                            stopTime="11:00 AM"
                            quantity={medicationQuantities[med.name] || 0}
                            staffConsent={true}
                            constituentConsent={true}
                            code={medicationCodes[med.name] || "Add"}
                            codeOptions={codeOptions}
                            onCodeClick={() => handleCodeClick(med)}
                            onQuantityClick={() => handleQuantityClick(med)}
                            onQuantityChange={(value) => {
                              setMedicationQuantities(prev => ({
                                ...prev,
                                [med.name]: value
                              }));
                            }}
                            comment={getCombinedComment(med.name)}
                            lastCount={30}
                          />
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Attestation */}
                <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                  <p className="text-[12px] italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    I attest that I have followed the policies and procedure of Medicine Dispensation & Documentation
                  </p>
                  <button className="px-6 py-2 text-[13px] font-semibold rounded-full text-white" style={{ backgroundColor: '#145F33' }}>
                    Submit
                  </button>
                </div>
              </div>



              {/* BEDTIME Period */}
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
              >
                <div 
                  className="px-6 py-3.5 flex items-center gap-3"
                  style={{
                    backgroundColor: '#3333FF'
                  }}
                >
                  <Moon className="w-5 h-5 text-white" />
                  <span className="font-semibold text-[15px] text-white">Bedtime</span>
                  <span className="text-[13px] ml-2 text-white opacity-90">8:00 PM - 11:59 PM</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                        <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Medication</th>
                        <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Dose</th>
                        <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Instructions</th>
                        <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Start</th>
                        <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Stop</th>
                        <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>QTY</th>
                        <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Last Count</th>
                        <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Staff</th>
                        <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Constituent</th>
                        <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Code</th>
                        <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {constituent.medications
                        .filter((med: any) => 
                          med.frequency.toLowerCase().includes('bedtime') || 
                          med.frequency.toLowerCase().includes('night')
                        )
                        .map((med: any, idx: number) => (
                          <MedicationRow
                            key={`bedtime-${idx}`}
                            medication={med}
                            startTime="8:00 PM"
                            stopTime="11:59 PM"
                            quantity={medicationQuantities[med.name] || 0}
                            staffConsent={false}
                            constituentConsent={false}
                            code={medicationCodes[med.name] || "YR"}
                            codeOptions={codeOptions}
                            onCodeClick={() => handleCodeClick(med)}
                            onQuantityClick={() => handleQuantityClick(med)}
                            onQuantityChange={(value) => {
                              setMedicationQuantities(prev => ({
                                ...prev,
                                [med.name]: value
                              }));
                            }}
                            comment={getCombinedComment(med.name)}
                            lastCount={45}
                          />
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                  <p className="text-[12px] italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    I attest that I have followed the policies and procedure of Medicine Dispensation & Documentation
                  </p>
                  <button className="px-6 py-2 text-[13px] font-semibold rounded-full text-white" style={{ backgroundColor: '#145F33' }}>
                    Submit
                  </button>
                </div>
              </div>

              {/* PRN Period */}
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
              >
                <div 
                  className="px-6 py-3.5 flex items-center gap-3"
                  style={{
                    backgroundColor: '#000000'
                  }}
                >
                  <AlertCircle className="w-5 h-5 text-white" />
                  <span className="font-semibold text-[15px] text-white">PRN (As Needed)</span>
                  <span className="text-[13px] ml-2 text-white opacity-90">Emergency & As-Needed Medications</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                        <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Dispensed Date</th>
                        <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Dispensed Time</th>
                        <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Medication</th>
                        <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Quantity</th>
                        <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Reason Given / Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prnEntries.map((entry) => (
                        <tr key={entry.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                          <td className="px-4 py-3.5">
                            <DateInput
className="h-9 text-[13px]"
                              value={isoToMdy(entry.date)}
                              onChange={(v) => ((e) => handleUpdatePrnEntry(entry.id, 'date', e.target.value))({ target: { value: mdyToIso(v) } })}
                            />
                          </td>
                          <td className="px-4 py-3.5">
                            <Input 
                              type="time" 
                              className="h-9 text-[13px]"
                              value={entry.time}
                              onChange={(e) => handleUpdatePrnEntry(entry.id, 'time', e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-3.5">
                            <select 
                              className="w-full h-9 px-3 text-[13px] rounded border" 
                              style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                              value={entry.medication}
                              onChange={(e) => handleUpdatePrnEntry(entry.id, 'medication', e.target.value)}
                            >
                              <option value="Epi-Pen">Epi-Pen (Auto-injector)</option>
                              {constituent.medications
                                .filter((med: any) => 
                                  med.frequency.toLowerCase().includes('prn') || 
                                  med.frequency.toLowerCase().includes('as needed')
                                )
                                .map((med: any) => (
                                  <option key={med.name} value={med.name}>{med.name} - {med.dose}</option>
                                ))}
                            </select>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <Input 
                              type="number" 
                              className="h-9 text-[13px] text-center w-20 mx-auto"
                              value={entry.quantity}
                              onChange={(e) => handleUpdatePrnEntry(entry.id, 'quantity', parseInt(e.target.value) || 0)}
                              min="0"
                            />
                          </td>
                          <td className="px-4 py-3.5">
                            <Input 
                              type="text" 
                              placeholder="Emergency allergy response" 
                              className="h-9 text-[13px]"
                              value={entry.comments}
                              onChange={(e) => handleUpdatePrnEntry(entry.id, 'comments', e.target.value)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <button 
                      onClick={handleAddPrnEntry}
                      className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded hover:bg-gray-50 transition-colors" 
                      style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Entry
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                      I attest that I have followed the policies and procedure of Medicine Dispensation & Documentation
                    </p>
                    <button className="px-6 py-2 text-[13px] font-semibold rounded-full text-white" style={{ backgroundColor: '#145F33' }}>
                      Submit
                    </button>
                  </div>
                </div>
              </div>


            </div>
          )}

          {/* Medications Tab */}
          {activeMedicationTab === 'medications' && (
            <div className="space-y-6">
              {/* Page Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-[20px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Active Medications
                    </h1>
                    <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                      Manage and track all active medications
                    </p>
                  </div>
                  <Button 
                    className="rounded-full px-6 h-10"
                    style={{ backgroundColor: '#145F33' }}
                    onClick={() => setShowMedicationDialog(true)}
                  >
                    + Add Medication
                  </Button>
                </div>
              </div>

              {/* Medications Table */}
              <div 
                className="rounded-lg overflow-hidden"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                        <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '160px' }}>
                          Medication Name
                        </th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '100px' }}>
                          Dose
                        </th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '120px' }}>
                          Frequency
                        </th>
                        <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '100px' }}>
                          Start Date
                        </th>
                        <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '100px' }}>
                          End Date
                        </th>
                        <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '80px' }}>
                          Status
                        </th>
                        <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '100px' }}>
                          Comment
                        </th>
                        <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '100px' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {constituent.medications.map((med: any, idx: number) => (
                        <tr 
                          key={idx}
                          className="hover:bg-gray-50/80 transition-colors"
                          style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                        >
                          <td className="px-4 py-4 text-[13px]">
                            <div className="font-medium">{med.name}</div>

                          </td>
                          <td className="px-4 py-4 text-[13px]">{med.dose}</td>
                          <td className="px-4 py-4 text-[13px]">{med.frequency}</td>
                          <td className="px-4 py-4 text-center text-[13px]">12/01/2024</td>
                          <td className="px-4 py-4 text-center text-[13px]">-</td>
                          <td className="px-4 py-4 text-center">
                            <Badge
                              className="slds-text-3"
                              style={{
                                borderRadius: '12px',
                                padding: '4px 12px',
                                backgroundColor: '#e8f5e9',
                                color: '#145F33',
                                border: '1px solid #c8e6c9'
                              }}
                            >
                              Active
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleQuantityClick(med)}
                              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
                              style={{ color: 'var(--color-brand-primary)' }}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
                                style={{ color: '#145F33' }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-red-50 rounded-md"
                                style={{ color: '#c23934' }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Medication Details Card */}
              <div
                className="rounded-lg p-6"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
              >
                <h3 className="font-semibold text-[15px] mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  Medication Notes
                </h3>
                <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  All medications are reviewed and approved by the medical team. Medication changes require physician authorization.
                  For emergency medication needs, contact the on-call nurse at extension 5555.
                </p>
              </div>
            </div>
          )}

          {/* Medication History Tab */}
          {activeMedicationTab === 'medication-history' && (
            <div className="space-y-6">
              {/* Page Header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="slds-page-header-title mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Medication History
                  </h1>
                  <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Complete record of all medications including start dates, end dates, and details
                  </p>
                </div>
                <Button
                  onClick={handleOpenAddMedicationHistory}
                  className="rounded-full px-6 h-10 slds-text-4 font-semibold"
                  style={{ backgroundColor: '#145F33', color: 'white' }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add / Modify
                </Button>
              </div>

              {/* Medication History Table */}
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                        <th
                          className="px-5 py-3.5 text-left slds-form-label cursor-pointer hover:bg-gray-100 transition-colors group"
                          onClick={() => handleSortHistory('medicationName')}
                          style={{ color: 'var(--slds-g-color-text-weak)' }}
                        >
                          <div className="flex items-center gap-2">
                            <span>MEDICATION</span>
                            {historySort.column === 'medicationName' && (
                              <span className="text-[10px]">{historySort.direction === 'asc' ? '▲' : '▼'}</span>
                            )}
                          </div>
                        </th>
                        <th
                          className="px-5 py-3.5 text-center slds-form-label cursor-pointer hover:bg-gray-100 transition-colors group"
                          onClick={() => handleSortHistory('startDate')}
                          style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '140px' }}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <span>START DATE</span>
                            {historySort.column === 'startDate' && (
                              <span className="text-[10px]">{historySort.direction === 'asc' ? '▲' : '▼'}</span>
                            )}
                          </div>
                        </th>
                        <th
                          className="px-5 py-3.5 text-center slds-form-label cursor-pointer hover:bg-gray-100 transition-colors group"
                          onClick={() => handleSortHistory('endDate')}
                          style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '140px' }}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <span>END DATE</span>
                            {historySort.column === 'endDate' && (
                              <span className="text-[10px]">{historySort.direction === 'asc' ? '▲' : '▼'}</span>
                            )}
                          </div>
                        </th>
                        <th
                          className="px-5 py-3.5 text-left slds-form-label cursor-pointer hover:bg-gray-100 transition-colors group"
                          onClick={() => handleSortHistory('dose')}
                          style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '120px' }}
                        >
                          <div className="flex items-center gap-2">
                            <span>DOSE</span>
                            {historySort.column === 'dose' && (
                              <span className="text-[10px]">{historySort.direction === 'asc' ? '▲' : '▼'}</span>
                            )}
                          </div>
                        </th>
                        <th
                          className="px-5 py-3.5 text-center slds-form-label cursor-pointer hover:bg-gray-100 transition-colors group"
                          onClick={() => handleSortHistory('psychotropic')}
                          style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '140px' }}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <span>PSYCHOTROPIC</span>
                            {historySort.column === 'psychotropic' && (
                              <span className="text-[10px]">{historySort.direction === 'asc' ? '▲' : '▼'}</span>
                            )}
                          </div>
                        </th>
                        <th
                          className="px-5 py-3.5 text-left slds-form-label"
                          style={{ color: 'var(--slds-g-color-text-weak)' }}
                        >
                          DETAILS
                        </th>
                        <th
                          className="px-5 py-3.5 text-center slds-form-label"
                          style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '100px' }}
                        >
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedMedicationHistory().length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-12 text-center">
                            <Pill className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                            <p className="slds-text-4 mb-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                              No medication history records found
                            </p>
                            <p className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                              Click "Add / Modify" to create a new record
                            </p>
                          </td>
                        </tr>
                      ) : (
                        getSortedMedicationHistory().map((record, idx) => (
                          <tr
                            key={record.id}
                            className="hover:bg-gray-50/80 transition-colors"
                            style={{
                              borderBottom: idx < getSortedMedicationHistory().length - 1
                                ? '1px solid var(--slds-g-color-border-base-1)'
                                : 'none'
                            }}
                          >
                            <td className="px-5 py-4">
                              <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                {record.medicationName}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                {record.startDate || '—'}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                {record.endDate || '—'}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                {record.dose}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              {record.psychotropic ? (
                                <Badge
                                  className="slds-text-3"
                                  style={{
                                    borderRadius: '12px',
                                    padding: '4px 12px',
                                    backgroundColor: '#e8f5e9',
                                    color: '#145F33',
                                    border: '1px solid #c8e6c9'
                                  }}
                                >
                                  Yes
                                </Badge>
                              ) : (
                                <span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                  No
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                {record.details || '—'}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenEditMedicationHistory(record)}
                                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
                                style={{ color: '#145F33' }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Information Card */}
              <div
                className="rounded-lg p-5"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="p-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: '#e0f2fe' }}
                  >
                    <Activity className="w-5 h-5" style={{ color: '#0176d3' }} />
                  </div>
                  <div>
                    <h3 className="slds-text-4 font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      About Medication History
                    </h3>
                    <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                      All medication history changes create immutable audit and attestation records.
                      Records cannot be deleted or modified after creation to maintain complete historical accuracy
                      and regulatory compliance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OTC's Tab */}
          {activeMedicationTab === 'otcs' && (
            <OTCConsentManagement 
              youthId={constituent.id.toString()}
              youthName={constituent.name}
            />
          )}

          {/* Pack Meds Tab */}
          {activeMedicationTab === 'pack-meds' && (
            <div className="space-y-5">
              {/* Packing Summary & Actions */}
              <div 
                className="rounded-lg overflow-hidden"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                {/* Header */}
                <div 
                  className="px-5 py-3"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    borderBottom: '1px solid var(--slds-g-color-border-base-1)'
                  }}
                >
                  <h3 className="font-semibold text-[15px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Packing Summary
                  </h3>
                </div>

                {/* Action Buttons */}
                <div className="px-5 pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <Button 
                      className="flex-1 rounded-full"
                      style={{ backgroundColor: 'var(--color-brand-primary)' }}
                      onClick={handleCompletePacking}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Complete Packing
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 rounded-full relative"
                      onClick={handleHandoff}
                      style={{ borderColor: 'var(--color-brand-primary)', color: 'var(--color-brand-primary)' }}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Handoff
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 rounded-full"
                      onClick={handlePrintPackingList}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Print List
                    </Button>
                  </div>
                </div>

                {/* Medication Pack List */}
                <div className="px-5 pb-5">
                  <div 
                    className="rounded-lg overflow-hidden"
                    style={{
                      border: '1px solid var(--slds-g-color-border-base-1)',
                      backgroundColor: 'var(--slds-g-color-background-base)'
                    }}
                  >
                    {/* Header */}
                    <div 
                      className="px-4 py-3"
                      style={{
                        backgroundColor: 'var(--slds-g-color-background-base)',
                        borderBottom: '1px solid var(--slds-g-color-border-base-1)'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-[15px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          Medication Pack List
                        </h3>
                        
                        {/* Active/Archive Toggle */}
                        <div 
                          className="inline-flex rounded-full p-1"
                          style={{ backgroundColor: '#e5e7eb' }}
                        >
                          <button
                            className={cn(
                              "px-4 py-1.5 text-[12px] rounded-full transition-all",
                              packFilter === 'active' 
                                ? "text-white font-semibold" 
                                : "text-gray-600 hover:text-gray-900"
                            )}
                            style={packFilter === 'active' ? { backgroundColor: 'var(--color-brand-primary)' } : {}}
                            onClick={() => {
                              setPackFilter('active');
                              setSelectedPackIds([]);
                            }}
                          >
                            Active
                          </button>
                          <button
                            className={cn(
                              "px-4 py-1.5 text-[12px] rounded-full transition-all",
                              packFilter === 'archived' 
                                ? "text-white font-semibold" 
                                : "text-gray-600 hover:text-gray-900"
                            )}
                            style={packFilter === 'archived' ? { backgroundColor: 'var(--color-brand-primary)' } : {}}
                            onClick={() => {
                              setPackFilter('archived');
                              setSelectedPackIds([]);
                            }}
                          >
                            Archive
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Toolbar */}
                    <div 
                      className="px-4 py-2 flex items-center gap-2"
                      style={{
                        backgroundColor: 'var(--slds-g-color-background-base)',
                        borderBottom: '1px solid var(--slds-g-color-border-base-1)'
                      }}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-[12px] rounded-full"
                        onClick={handleCreateNewPack}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Create New
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-[12px] rounded-full"
                        onClick={handleEditPack}
                        disabled={selectedPackIds.length !== 1}
                      >
                        <Edit className="h-3.5 w-3.5 mr-1.5" />
                        Edit
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-[12px] rounded-full"
                        onClick={handleViewPack}
                        disabled={selectedPackIds.length !== 1}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        View
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-[12px] rounded-full"
                        onClick={handleRefreshPacks}
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                        Refresh
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-[12px] rounded-full"
                        onClick={handlePrintPack}
                        disabled={selectedPackIds.length === 0}
                      >
                        <Printer className="h-3.5 w-3.5 mr-1.5" />
                        Print
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-[12px] rounded-full"
                        onClick={handleArchivePack}
                        disabled={selectedPackIds.length === 0}
                      >
                        <Archive className="h-3.5 w-3.5 mr-1.5" />
                        {packFilter === 'active' ? 'Archive' : 'Unarchive'}
                      </Button>

                      <div className="ml-auto text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        {selectedPackIds.length > 0 && `${selectedPackIds.length} selected`}
                      </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr 
                            className="text-[11px] uppercase tracking-wide"
                            style={{
                              backgroundColor: 'var(--slds-g-color-background-alt)',
                              borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                              color: 'var(--slds-g-color-text-weak)'
                            }}
                          >
                            <th className="px-4 py-2 text-left w-12">
                              <input 
                                type="checkbox" 
                                className="h-4 w-4 rounded"
                                style={{ accentColor: 'var(--color-brand-primary)' }}
                                checked={selectedPackIds.length === getFilteredPacks().length && getFilteredPacks().length > 0}
                                onChange={handleSelectAllPacks}
                              />
                            </th>
                            <th className="px-4 py-2 text-left">Start Date</th>
                            <th className="px-4 py-2 text-left">Start Time</th>
                            <th className="px-4 py-2 text-left">End Date</th>
                            <th className="px-4 py-2 text-left">End Time</th>
                            <th className="px-4 py-2 text-left">Created By</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredPacks().length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center">
                                <div style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                  <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
                                  <p className="text-[13px]">
                                    No {packFilter} medication packs found
                                  </p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            getFilteredPacks().map((pack) => (
                              <tr 
                                key={pack.id}
                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                                onClick={() => handleTogglePackSelection(pack.id)}
                              >
                                <td className="px-4 py-3">
                                  <input 
                                    type="checkbox" 
                                    className="h-4 w-4 rounded"
                                    style={{ accentColor: 'var(--color-brand-primary)' }}
                                    checked={selectedPackIds.includes(pack.id)}
                                    onChange={() => handleTogglePackSelection(pack.id)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </td>
                                <td className="px-4 py-3 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                  {formatMdy(new Date(pack.startDate))}
                                </td>
                                <td className="px-4 py-3 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                  {pack.startTime}
                                </td>
                                <td className="px-4 py-3 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                  {formatMdy(new Date(pack.endDate))}
                                </td>
                                <td className="px-4 py-3 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                  {pack.endTime}
                                </td>
                                <td className="px-4 py-3 text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                  {pack.createdBy}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Date Selection */}
              <div 
                className="rounded-lg p-5"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <h3 className="font-semibold text-[15px] mb-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  Select Packing Period
                </h3>
                
                {/* Custom Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="packStartDate" className="text-[13px] mb-1.5 block">Start Date</Label>
                    <DateInput
                      id="packStartDate"
value={isoToMdy(startDate)}
                      onChange={(v) => ((e) => setStartDate(e.target.value))({ target: { value: mdyToIso(v) } })}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="packStartTime" className="text-[13px] mb-1.5 block">Start Time</Label>
                    <Input
                      id="packStartTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="packEndDate" className="text-[13px] mb-1.5 block">End Date</Label>
                    <DateInput
                      id="packEndDate"
value={isoToMdy(endDate)}
                      onChange={(v) => ((e) => setEndDate(e.target.value))({ target: { value: mdyToIso(v) } })}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="packEndTime" className="text-[13px] mb-1.5 block">End Time</Label>
                    <Input
                      id="packEndTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              {/* Scheduled Medications by Date and Time Period */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[16px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Medications to Pack
                  </h3>
                  <Badge className="bg-gray-100 text-gray-800 border-gray-300" style={{ borderRadius: '12px', padding: '4px 12px' }}>
                    {constituent.medications.filter((m: any) => !['PRN', 'As needed'].includes(m.frequency)).length} scheduled doses
                  </Badge>
                </div>

                {/* Date-based Hierarchical Structure */}
                {generatePackingDates().map((dateInfo) => {
                  const isDateCollapsed = collapsedDates.has(dateInfo.dateKey);
                  const periods = [
                    { name: 'Morning', icon: Sunrise, color: '#FFA500', textColor: 'text-white', timeRange: '6:00 AM - 11:00 AM' },
                    { name: 'Afternoon', icon: Sun, color: '#2CAB2C', textColor: 'text-white', timeRange: '12:00 PM - 5:00 PM' },
                    { name: 'Evening', icon: Sunset, color: '#FFFF49', textColor: 'text-gray-800', timeRange: '5:00 PM - 8:00 PM' },
                    { name: 'Bedtime', icon: Moon, color: '#3333FF', textColor: 'text-white', timeRange: '8:00 PM - 11:59 PM' }
                  ];

                  return (
                    <div 
                      key={dateInfo.dateKey}
                      className="rounded-lg overflow-hidden"
                      style={{
                        border: '1px solid var(--slds-g-color-border-base-1)',
                        backgroundColor: 'var(--slds-g-color-background-base)'
                      }}
                    >
                      {/* Date Header */}
                      <div 
                        className="px-5 py-3 space-y-3"
                        style={{ borderBottom: isDateCollapsed ? 'none' : '1px solid var(--slds-g-color-border-base-1)' }}
                      >
                        {/* Top Row - Date Info & Actions */}
                        <div 
                          className="flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors -mx-5 px-5 py-1"
                          onClick={() => toggleDateCollapse(dateInfo.dateKey)}
                        >
                          <div className="flex items-center gap-3">
                            {isDateCollapsed ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronUp className="h-4 w-4 text-gray-500" />
                            )}
                            
                            {/* Selection Checkbox */}
                            <input 
                              type="checkbox" 
                              className="h-4 w-4 rounded cursor-pointer"
                              style={{ accentColor: 'var(--color-brand-primary)' }}
                              checked={selectedPackingDay === dateInfo.dateKey}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSelectPackingDay(dateInfo.dateKey);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            
                            <Calendar className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[14px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                  Day: {dateInfo.displayDate}
                                </span>
                                {primaryPackingDay === dateInfo.dateKey && (
                                  <Badge 
                                    className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1" 
                                    style={{ borderRadius: '12px', padding: '2px 8px', fontSize: '10px' }}
                                  >
                                    <Star className="h-3 w-3 fill-amber-500" />
                                    Primary
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                {dateInfo.dayOfWeek}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Checklist Progress */}
                            {getChecklistProgress(dateInfo.dateKey) > 0 && (
                              <Badge
                                className="flex items-center gap-1"
                                style={{
                                  borderRadius: '12px',
                                  padding: '2px 8px',
                                  fontSize: '10px',
                                  backgroundColor: '#e8f5e9',
                                  color: '#145F33',
                                  border: '1px solid #c8e6c9'
                                }}
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                {Math.round(getChecklistProgress(dateInfo.dateKey))}% Complete
                              </Badge>
                            )}
                            
                            <Badge 
                              className="bg-gray-100 text-gray-700 border-gray-300" 
                              style={{ borderRadius: '12px', padding: '2px 10px', fontSize: '11px' }}
                            >
                              {getTotalScheduledCount()} medications
                            </Badge>
                          </div>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-3 text-[11px] rounded-full"
                            style={{ borderColor: 'var(--color-brand-primary)', color: 'var(--color-brand-primary)' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStaffDispense(dateInfo.dateKey, dateInfo.displayDate);
                            }}
                          >
                            <ClipboardCheck className="h-3 w-3 mr-1.5" />
                            Staff Dispense
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-3 text-[11px] rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrintLabels(dateInfo.dateKey, dateInfo.displayDate);
                            }}
                          >
                            <Printer className="h-3 w-3 mr-1.5" />
                            Print Labels
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-3 text-[11px] rounded-full"
                            style={{ borderColor: 'var(--color-brand-primary)', color: 'var(--color-brand-primary)' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDateHandoff(dateInfo.dateKey, dateInfo.displayDate);
                            }}
                          >
                            <Package className="h-3 w-3 mr-1.5" />
                            Handoff
                          </Button>
                          
                          <Button
                            size="sm"
                            variant={primaryPackingDay === dateInfo.dateKey ? "default" : "outline"}
                            className="h-7 px-3 text-[11px] rounded-full"
                            style={primaryPackingDay === dateInfo.dateKey ? { 
                              backgroundColor: '#f59e0b',
                              borderColor: '#f59e0b',
                              color: 'white'
                            } : {}}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetPrimaryDay(dateInfo.dateKey);
                            }}
                          >
                            <Star className={`h-3 w-3 mr-1.5 ${primaryPackingDay === dateInfo.dateKey ? 'fill-white' : ''}`} />
                            {primaryPackingDay === dateInfo.dateKey ? 'Primary' : 'Set Primary'}
                          </Button>
                        </div>

                        {/* Checklist Items */}
                        {!isDateCollapsed && (
                          <div 
                            className="grid grid-cols-4 gap-2 pt-2"
                            style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}
                          >
                            <label className="flex items-center gap-2 text-[11px] cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                              <input 
                                type="checkbox" 
                                className="h-3.5 w-3.5 rounded"
                                style={{ accentColor: 'var(--color-brand-primary)' }}
                                checked={dayChecklists[dateInfo.dateKey]?.packed || false}
                                onChange={() => handleToggleChecklistItem(dateInfo.dateKey, 'packed')}
                              />
                              <span style={{ color: 'var(--slds-g-color-text-default)' }}>Packed</span>
                            </label>
                            
                            <label className="flex items-center gap-2 text-[11px] cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                              <input 
                                type="checkbox" 
                                className="h-3.5 w-3.5 rounded"
                                style={{ accentColor: 'var(--color-brand-primary)' }}
                                checked={dayChecklists[dateInfo.dateKey]?.labeled || false}
                                onChange={() => handleToggleChecklistItem(dateInfo.dateKey, 'labeled')}
                              />
                              <span style={{ color: 'var(--slds-g-color-text-default)' }}>Labeled</span>
                            </label>
                            
                            <label className="flex items-center gap-2 text-[11px] cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                              <input 
                                type="checkbox" 
                                className="h-3.5 w-3.5 rounded"
                                style={{ accentColor: 'var(--color-brand-primary)' }}
                                checked={dayChecklists[dateInfo.dateKey]?.verified || false}
                                onChange={() => handleToggleChecklistItem(dateInfo.dateKey, 'verified')}
                              />
                              <span style={{ color: 'var(--slds-g-color-text-default)' }}>Verified</span>
                            </label>
                            
                            <label className="flex items-center gap-2 text-[11px] cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                              <input 
                                type="checkbox" 
                                className="h-3.5 w-3.5 rounded"
                                style={{ accentColor: 'var(--color-brand-primary)' }}
                                checked={dayChecklists[dateInfo.dateKey]?.dispensed || false}
                                onChange={() => handleToggleChecklistItem(dateInfo.dateKey, 'dispensed')}
                              />
                              <span style={{ color: 'var(--slds-g-color-text-default)' }}>Dispensed</span>
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Periods for this Date */}
                      {!isDateCollapsed && (
                        <div className="divide-y" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                          {periods.map((period) => {
                            const medsInPeriod = constituent.medications.filter((m: any) => m.frequency === period.name);
                            if (medsInPeriod.length === 0) return null;

                            const periodKey = `${dateInfo.dateKey}-${period.name}`;
                            const isPeriodCollapsed = collapsedPeriods.has(periodKey);
                            const PeriodIcon = period.icon;
                            const allSelected = areAllSelectedInDatePeriod(dateInfo.dateKey, period.name);

                            return (
                              <div key={periodKey}>
                                {/* Period Header */}
                                <div 
                                  className="flex items-center justify-between px-5 py-2.5"
                                  style={{ backgroundColor: period.color }}
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <button
                                      onClick={() => togglePeriodCollapse(periodKey)}
                                      className="hover:opacity-80 transition-opacity"
                                    >
                                      {isPeriodCollapsed ? (
                                        <ChevronDown className={`h-4 w-4 ${period.textColor}`} />
                                      ) : (
                                        <ChevronUp className={`h-4 w-4 ${period.textColor}`} />
                                      )}
                                    </button>
                                    <PeriodIcon className={`h-4 w-4 ${period.textColor}`} />
                                    <span className={`font-semibold text-[13px] ${period.textColor}`}>
                                      {period.name}
                                    </span>
                                    <span className={`text-[11px] ${period.textColor} opacity-90`}>
                                      {period.timeRange}
                                    </span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className={`h-7 px-3 text-[11px] rounded-full ${period.textColor} hover:bg-white/20`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (allSelected) {
                                        handleDeselectAllInDatePeriod(dateInfo.dateKey, period.name);
                                      } else {
                                        handleSelectAllInDatePeriod(dateInfo.dateKey, period.name);
                                      }
                                    }}
                                  >
                                    {allSelected ? 'Deselect All' : 'Select All'}
                                  </Button>
                                </div>

                                {/* Medications Table */}
                                {!isPeriodCollapsed && (
                                  <div className="overflow-x-auto">
                                    <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#fafafa' }}>
                                          <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', width: '60px' }}>
                                            Selected
                                          </th>
                                          <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Drug Name
                                          </th>
                                          <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', width: '100px' }}>
                                            Start
                                          </th>
                                          <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', width: '100px' }}>
                                            Stop
                                          </th>
                                          <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', width: '120px' }}>
                                            Status
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {medsInPeriod.map((med: any, idx: number) => {
                                          const medKey = `${dateInfo.dateKey}-${period.name}-${med.name}`;
                                          const isSelected = packedMedications.has(medKey);
                                          const status = getMedicationStatus(dateInfo.dateKey, period.name, med.name);

                                          return (
                                            <tr 
                                              key={idx}
                                              className="hover:bg-gray-50 transition-colors"
                                              style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                                            >
                                              <td className="px-4 py-3 text-center">
                                                <input 
                                                  type="checkbox" 
                                                  className="h-4 w-4 rounded cursor-pointer"
                                                  style={{ accentColor: 'var(--color-brand-primary)' }}
                                                  checked={isSelected}
                                                  onChange={() => handleToggleMedication(medKey)}
                                                />
                                              </td>
                                              <td className="px-4 py-3">
                                                <div className="font-semibold text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                  {med.name}
                                                </div>
                                                <div className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                  {med.dose} - {med.frequency}
                                                </div>
                                              </td>
                                              <td className="px-4 py-3 text-center text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                {period.timeRange.split(' - ')[0]}
                                              </td>
                                              <td className="px-4 py-3 text-center text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                {period.timeRange.split(' - ')[1]}
                                              </td>
                                              <td className="px-4 py-3 text-center">
                                                <Badge 
                                                  className="text-[11px] font-medium"
                                                  style={{ 
                                                    backgroundColor: status.bgColor,
                                                    color: status.color,
                                                    border: `1px solid ${status.color}`,
                                                    borderRadius: '12px',
                                                    padding: '3px 10px'
                                                  }}
                                                >
                                                  {status.label}
                                                </Badge>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* PRN/As Needed Medications */}
              <div
                className="rounded-lg p-5"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold text-[15px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    PRN / As Needed Medications
                  </h3>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300" style={{ borderRadius: '12px', padding: '2px 10px', fontSize: '11px' }}>
                    Optional
                  </Badge>
                </div>
                <p className="text-[13px] text-gray-600 mb-4">
                  These medications should be packed for emergency or as-needed use during the selected period.
                </p>
                <div className="space-y-2">
                  <div
                    className="flex items-center gap-4 p-3 rounded-md"
                    style={{
                      border: '1px solid var(--slds-g-color-border-base-1)',
                      backgroundColor: 'var(--slds-g-color-background-base)'
                    }}
                  >
                    <input 
                      type="checkbox" 
                      className="h-5 w-5 rounded cursor-pointer"
                      style={{ accentColor: 'var(--color-brand-primary)' }}
                      checked={packedMedications.has('Ibuprofen')}
                      onChange={() => handleToggleMedication('Ibuprofen')}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-[13px]">Ibuprofen</div>
                      <div className="text-[12px] text-gray-600">400mg - As needed for pain/fever</div>
                    </div>
                    <div className="text-[13px] font-semibold" style={{ color: 'var(--color-brand-primary)' }}>
                      Qty: 10
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-4 p-3 rounded-md"
                    style={{
                      border: '1px solid var(--slds-g-color-border-base-1)',
                      backgroundColor: 'var(--slds-g-color-background-base)'
                    }}
                  >
                    <input 
                      type="checkbox" 
                      className="h-5 w-5 rounded cursor-pointer"
                      style={{ accentColor: 'var(--color-brand-primary)' }}
                      checked={packedMedications.has('Benadryl')}
                      onChange={() => handleToggleMedication('Benadryl')}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-[13px]">Benadryl</div>
                      <div className="text-[12px] text-gray-600">25mg - As needed for allergic reactions</div>
                    </div>
                    <div className="text-[13px] font-semibold" style={{ color: 'var(--color-brand-primary)' }}>
                      Qty: 5
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Count Tab */}
          {activeMedicationTab === 'count' && (
            <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
              <div className="text-center">
                <Calendar className="h-14 w-14 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
                <h3 className="text-[16px] font-semibold mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication Count</h3>
                <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Track medication inventory and counts.</p>
              </div>
            </div>
          )}

          {/* Log Tab */}
          {activeMedicationTab === 'log' && (
            <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
              <div className="text-center">
                <FileText className="h-14 w-14 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
                <h3 className="text-[16px] font-semibold mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication Log</h3>
                <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>View detailed medication administration logs.</p>
              </div>
            </div>
          )}

          {/* Overview Tab - Shows medication schedule by time periods */}
          {activeMedicationTab === 'overview' && (
            <div className="space-y-6">
              {/* Page Header with Refresh (AC1, AC12) */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-[20px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Medication Overview
                  </h1>
                  <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Read-only summary of active medications for {constituent.fullName}
                  </p>
                </div>
                <button
                  onClick={handleRefreshMedications}
                  disabled={isRefreshingMedications}
                  className="flex items-center gap-2 px-3 py-2 rounded-full transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  title="Refresh medication data"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", isRefreshingMedications && "animate-spin")} />
                  <span className="slds-text-3 font-medium">{isRefreshingMedications ? "Refreshing…" : "Refresh"}</span>
                </button>
              </div>

              {/* Medication Overview Sections - Reusable component (AC2-AC13) */}
              <MedicationOverviewSections
                activeMedications={transformToActiveMedications(constituent.medications)}
                otcConsents={mockOTCConsents}
              />
            </div>
          )}

          {/* ═══════ HEALTH OVERVIEW — Medication (tabbed interface per spec) ═══════ */}
          {activeMedicationTab === 'admh-medication' && (
            <div>
              {/* Horizontal Tab Bar — fixed order per spec */}
              <div
                className="sticky top-0 z-10 flex overflow-x-auto overflow-y-hidden border-b mb-0"
                style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
              >
                {[
                  { id: 'medications',         label: 'Medications' },
                  { id: 'otcs',                label: "OTC's" },
                  { id: 'pack-meds',           label: 'Pack Meds' },
                  { id: 'count',               label: 'Count' },
                  { id: 'log',                 label: 'Log' },
                  { id: 'overview',            label: 'Overview' },
                  { id: 'medication-history',  label: 'Medication History' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setHealthMedTab(tab.id)}
                    className="px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap flex-shrink-0"
                    style={
                      healthMedTab === tab.id
                        ? { color: '#145F33', borderBottom: '3px solid #145F33', marginBottom: '-1px' }
                        : { color: 'var(--slds-g-color-text-weak)' }
                    }
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ── Medications tab ── */}
              {healthMedTab === 'medications' && (
                <div className="space-y-6 p-6">
                  <div className="mb-2">
                    <h1 className="text-[20px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>Medications</h1>
                    <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Active prescriptions for {constituent.fullName}</p>
                  </div>
                  <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div className="px-6 py-3.5 flex items-center justify-between" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                      <span className="font-semibold text-[15px]" style={{ color: 'var(--slds-g-color-text-default)' }}>Prescriptions</span>
                      <span className="text-[12px] font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: '#e6f2eb', color: '#145F33' }}>{constituent.medications.length} active</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                            {['Medication', 'Dose', 'Frequency', 'Prescriber', 'Status'].map(h => (
                              <th key={h} className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {constituent.medications.map((med: any, idx: number) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                              <td className="px-4 py-3.5 text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{med.name}</td>
                              <td className="px-4 py-3.5 text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>{med.dose}</td>
                              <td className="px-4 py-3.5 text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>{med.frequency}</td>
                              <td className="px-4 py-3.5 text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>{med.prescriber}</td>
                              <td className="px-4 py-3.5">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: '#e6f2eb', color: '#145F33' }}>Active</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {constituent.allergies.length > 0 && (
                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      <div className="px-6 py-3.5" style={{ backgroundColor: '#fef2f2', borderBottom: '1px solid #fecaca' }}>
                        <span className="font-semibold text-[15px]" style={{ color: '#991b1b' }}>Known Allergies</span>
                      </div>
                      <div className="px-6 py-4 flex flex-wrap gap-2">
                        {constituent.allergies.map((allergy: string, i: number) => (
                          <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-medium" style={{ backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>{allergy}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── OTC's tab ── */}
              {healthMedTab === 'otcs' && (
                <div className="space-y-6 p-6">
                  <div className="mb-2">
                    <h1 className="text-[20px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>OTC Medications</h1>
                    <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Over-the-counter medications for {constituent.fullName}</p>
                  </div>
                  <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div className="px-6 py-3.5" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                      <span className="font-semibold text-[15px]" style={{ color: 'var(--slds-g-color-text-default)' }}>Standard OTC</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                            {['Medication', 'Dose', 'Frequency', 'Status'].map(h => (
                              <th key={h} className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {constituent.medications
                            .filter((m: any) => m.frequency?.toLowerCase().includes('as needed') || m.frequency?.toLowerCase().includes('prn'))
                            .map((med: any, idx: number) => (
                              <tr key={idx} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                <td className="px-4 py-3.5 text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{med.name}</td>
                                <td className="px-4 py-3.5 text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>{med.dose}</td>
                                <td className="px-4 py-3.5 text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>{med.frequency}</td>
                                <td className="px-4 py-3.5">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: '#e6f2eb', color: '#145F33' }}>Active</span>
                                </td>
                              </tr>
                            ))}
                          {constituent.medications.filter((m: any) => m.frequency?.toLowerCase().includes('as needed') || m.frequency?.toLowerCase().includes('prn')).length === 0 && (
                            <tr><td colSpan={4} className="px-4 py-10 text-center text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>No OTC medications recorded.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Pack Meds tab ── */}
              {healthMedTab === 'pack-meds' && (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <Package className="h-14 w-14 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
                    <h3 className="text-[16px] font-semibold mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>Pack Medications</h3>
                    <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Manage medication packs for travel and off-site activities.</p>
                  </div>
                </div>
              )}

              {/* ── Count tab ── */}
              {healthMedTab === 'count' && (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <Calendar className="h-14 w-14 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
                    <h3 className="text-[16px] font-semibold mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication Count</h3>
                    <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Track medication inventory and pill counts.</p>
                  </div>
                </div>
              )}

              {/* ── Log tab ── */}
              {healthMedTab === 'log' && (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <FileText className="h-14 w-14 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
                    <h3 className="text-[16px] font-semibold mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication Log</h3>
                    <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>View detailed medication administration logs.</p>
                  </div>
                </div>
              )}

              {/* ── Overview tab ── */}
              {healthMedTab === 'overview' && (
                <div className="p-6">
                  <div className="mb-4">
                    <h1 className="text-[20px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication Overview</h1>
                    <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Read-only summary of active medications for {constituent.fullName}</p>
                  </div>
                  <MedicationOverviewSections
                    activeMedications={transformToActiveMedications(constituent.medications)}
                    otcConsents={mockOTCConsents}
                  />
                </div>
              )}

              {/* ── Medication History tab ── */}
              {healthMedTab === 'medication-history' && (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <FileText className="h-14 w-14 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
                    <h3 className="text-[16px] font-semibold mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication History</h3>
                    <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Historical record of all past medications and discontinued prescriptions.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════ HEALTH OVERVIEW — Physical Health ═══════ */}
          {activeMedicationTab === 'admh-physical' && (
            <div className="space-y-6">
              <div className="mb-4">
                <h1 className="text-[20px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>Physical Health</h1>
                <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Physical health conditions, needs, and dietary requirements for {constituent.fullName}</p>
              </div>

              {/* Medical Conditions */}
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div className="px-6 py-3.5 flex items-center justify-between" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                  <span className="font-semibold text-[15px]" style={{ color: 'var(--slds-g-color-text-default)' }}>Medical & Physical Needs</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                        {['Condition', 'Type', 'Status', 'Details'].map(h => (
                          <th key={h} className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {constituent.diagnoses.map((diag: string, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                          <td className="px-4 py-3.5 text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{diag}</td>
                          <td className="px-4 py-3.5 text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Medical Need</td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: '#e6f2eb', color: '#145F33' }}>Active</span>
                          </td>
                          <td className="px-4 py-3.5 text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>—</td>
                        </tr>
                      ))}
                      {constituent.diagnoses.length === 0 && (
                        <tr><td colSpan={4} className="px-4 py-10 text-center text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>No medical needs recorded.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dietary Needs */}
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div className="px-6 py-3.5" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                  <span className="font-semibold text-[15px]" style={{ color: 'var(--slds-g-color-text-default)' }}>Dietary Needs</span>
                </div>
                {constituent.allergies.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                          {['Dietary Restriction', 'Allergy Indicator', 'Details'].map(h => (
                            <th key={h} className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {constituent.allergies.map((allergy: string, idx: number) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                            <td className="px-4 py-3.5 text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{allergy}</td>
                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>Food Allergy</span>
                            </td>
                            <td className="px-4 py-3.5 text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Active dietary restriction</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="px-4 py-10 text-center text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>No dietary needs recorded.</div>
                )}
              </div>
            </div>
          )}

          {/* ═══════ HEALTH OVERVIEW — Mental Health ═══════ */}
          {activeMedicationTab === 'admh-mental' && (
            <div className="space-y-6">
              <div className="mb-4">
                <h1 className="text-[20px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>Mental Health</h1>
                <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Psychiatric diagnoses and mental health records for {constituent.fullName}</p>
              </div>

              {/* Diagnoses */}
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div className="px-6 py-3.5 flex items-center justify-between" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                  <span className="font-semibold text-[15px]" style={{ color: 'var(--slds-g-color-text-default)' }}>Diagnoses</span>
                  <span className="text-[12px] font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: '#e6f2eb', color: '#145F33' }}>{constituent.diagnoses.length} records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                        {['Diagnosis', 'DSM Code', 'Start Date', 'Status', 'Details'].map(h => (
                          <th key={h} className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {constituent.diagnoses.map((diag: string, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                          <td className="px-4 py-3.5 text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{diag}</td>
                          <td className="px-4 py-3.5 text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>—</td>
                          <td className="px-4 py-3.5 text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>{constituent.dob}</td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: '#e6f2eb', color: '#145F33' }}>Active</span>
                          </td>
                          <td className="px-4 py-3.5 text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Current mental health diagnosis</td>
                        </tr>
                      ))}
                      {constituent.diagnoses.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-10 text-center text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>No diagnoses recorded.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ HEALTH OVERVIEW — Substance Use ═══════ */}
          {activeMedicationTab === 'admh-substance' && (
            <div className="space-y-6">
              <div className="mb-4">
                <h1 className="text-[20px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>Substance Use</h1>
                <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Substance use screening, testing, and disclosure records for {constituent.fullName}</p>
              </div>

              {/* Screening & Testing */}
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div className="px-6 py-3.5 flex items-center justify-between" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                  <span className="font-semibold text-[15px]" style={{ color: 'var(--slds-g-color-text-default)' }}>Substance Use Screening & Testing</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                        {['Date / Time', 'Reason', 'Result', 'Notes'].map(h => (
                          <th key={h} className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>No substance use screening records found.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Disclosures */}
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div className="px-6 py-3.5" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                  <span className="font-semibold text-[15px]" style={{ color: 'var(--slds-g-color-text-default)' }}>Disclosures</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                        {['Date', 'Substance', 'Frequency', 'Last Use', 'Notes'].map(h => (
                          <th key={h} className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>No substance use disclosures recorded.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          </div>
        </div>
      </div>

      {/* Code Dialog */}
      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Medication Code</DialogTitle>
            <DialogDescription>
              Select a code for {selectedMedication?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Code Options */}
            <div className="grid grid-cols-2 gap-4">
              {codeOptions.map(code => (
                <Button
                  key={code.code}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedCode(code.code);
                    setShowCodeCommentError(false); // Clear error when selecting a code
                  }}
                  className={cn(
                    "h-8 px-4 text-[13px] font-semibold rounded-md text-gray-700 hover:bg-gray-50",
                    selectedCode === code.code ? "border-2 border-blue-500 bg-blue-50" : "border-2 border-gray-300"
                  )}
                >
                  {code.label}
                </Button>
              ))}
            </div>
            
            {/* Comment Section */}
            <div className="space-y-2">
              <Label htmlFor="codeComment" className="text-[13px]">
                Comment <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="codeComment"
                value={codeComment}
                onChange={(e) => {
                  setCodeComment(e.target.value);
                  if (e.target.value.trim()) {
                    setShowCodeCommentError(false); // Clear error when user types
                  }
                }}
                placeholder="Enter a comment explaining the code selection..."
                className={cn(
                  "min-h-[80px] text-[13px]",
                  showCodeCommentError ? "border-red-500 focus-visible:ring-red-500" : ""
                )}
              />
              {showCodeCommentError && (
                <div className="flex items-center gap-2 text-red-600 text-[12px]">
                  <AlertCircle className="h-4 w-4" />
                  <span>Please enter a comment before saving the code.</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowCodeDialog(false);
                setSelectedCode("");
                setCodeComment("");
                setShowCodeCommentError(false);
                setSelectedMedication(null);
              }}
              className="h-8 px-4 text-[13px] font-semibold rounded-md"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveCode}
              className="h-8 px-4 text-[13px] font-semibold rounded-md"
              style={{ backgroundColor: 'var(--color-brand-primary)' }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Medication Comments</DialogTitle>
            <DialogDescription>
              View code comments and {medicationComments[selectedMedication?.name] ? 'edit' : 'add'} additional comments for {selectedMedication?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Code Comment Display (Read-only) */}
            {codeComment && (
              <div className="space-y-2">
                <Label className="text-[13px] flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Code Comment (From Code Selection)
                </Label>
                <div 
                  className="p-3 rounded-md text-[13px] bg-blue-50 border border-blue-200"
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {codeComment}
                </div>
              </div>
            )}
            
            {/* Additional Comment Section (Editable) */}
            <div className="space-y-1.5">
              <Label htmlFor="additionalComment" className="text-[13px]">
                {codeComment ? 'Additional Comment (Optional)' : 'Comment'}
              </Label>
              <Textarea
                id="additionalComment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={codeComment ? "Add any additional notes here..." : "Enter comment here..."}
                className="min-h-[80px] text-[13px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowCommentDialog(false);
                setComment("");
                setCodeComment("");
                setSelectedMedication(null);
              }}
              className="h-8 px-4 text-[13px] font-semibold rounded-md"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveComment}
              className="h-8 px-4 text-[13px] font-semibold rounded-md"
              style={{ backgroundColor: 'var(--color-brand-primary)' }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Consent Form Dialog */}
      <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
              Medication Consent Form
            </DialogTitle>
            <DialogDescription>
              Review the medication details and consent information for {selectedConsentMedication?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedConsentMedication && (
            <div className="space-y-5 py-4">
              {/* Medication Information */}
              <div 
                className="rounded-lg p-4"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: '#f9fafb'
                }}
              >
                <h4 className="font-semibold text-[14px] mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  Medication Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] text-gray-600 mb-1">Medication Name</div>
                    <div className="text-[13px] font-semibold">{selectedConsentMedication.name}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-600 mb-1">Dose</div>
                    <div className="text-[13px] font-semibold">{selectedConsentMedication.dose}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-600 mb-1">Frequency</div>
                    <div className="text-[13px] font-semibold">{selectedConsentMedication.frequency}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-600 mb-1">Prescriber</div>
                    <div className="text-[13px] font-semibold">{selectedConsentMedication.prescriber}</div>
                  </div>
                </div>
              </div>

              {/* Medication Details */}
              <div 
                className="rounded-lg p-4"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                <h4 className="font-semibold text-[14px] mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  Medication Authorization
                </h4>
                <div className="space-y-3 text-[13px]">
                  <div>
                    <span className="font-semibold">Medication Number:</span> RX-{Math.floor(Math.random() * 1000000)}
                  </div>
                  <div>
                    <span className="font-semibold">Date Prescribed:</span> 12/01/2024
                  </div>
                  <div>
                    <span className="font-semibold">Refills Remaining:</span> 3
                  </div>
                  <div>
                    <span className="font-semibold">Pharmacy:</span> Mercy Home Pharmacy
                  </div>
                </div>
              </div>

              {/* Administration Instructions */}
              <div 
                className="rounded-lg p-4"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: '#eff6ff'
                }}
              >
                <h4 className="font-semibold text-[14px] mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  Administration Instructions
                </h4>
                <div className="text-[13px] space-y-2">
                  <p>
                    {selectedConsentMedication.frequency.toLowerCase().includes('bedtime') 
                      ? 'Administer at bedtime with a full glass of water. May cause drowsiness. Ensure constituent is in a safe environment before administration.' 
                      : 'Administer in the morning with food to reduce stomach upset. Monitor for side effects during the first 30 minutes after administration.'}
                  </p>
                  <p className="font-semibold mt-3">Special Precautions:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Monitor for adverse reactions including nausea, dizziness, or behavioral changes</li>
                    <li>Do not administer with grapefruit juice or dairy products</li>
                    <li>Ensure proper documentation of administration in the medication log</li>
                    <li>Report any missed doses or refusals to the supervising nurse immediately</li>
                  </ul>
                </div>
              </div>

              {/* Side Effects & Warnings */}
              <div 
                className="rounded-lg p-4"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: '#fef9e7'
                }}
              >
                <h4 className="font-semibold text-[14px] mb-3 flex items-center gap-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  Common Side Effects & Warnings
                </h4>
                <div className="text-[13px] space-y-2 text-gray-700">
                  <p><span className="font-semibold">Common Side Effects:</span> Drowsiness, dry mouth, mild headache, changes in appetite, mild nausea</p>
                  <p><span className="font-semibold">Serious Side Effects (Report Immediately):</span> Severe allergic reactions, difficulty breathing, chest pain, severe behavioral changes, suicidal thoughts</p>
                  <p className="text-red-700 font-semibold mt-3">⚠️ IMPORTANT: This medication requires close monitoring. Contact medical staff immediately if constituent exhibits unusual symptoms.</p>
                </div>
              </div>

              {/* Consent Statement */}
              <div 
                className="rounded-lg p-4"
                style={{
                  border: '2px solid var(--color-brand-primary)',
                  backgroundColor: '#f0fdf4'
                }}
              >
                <h4 className="font-semibold text-[14px] mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  Consent & Acknowledgment
                </h4>
                <div className="text-[13px] space-y-3 text-gray-700">
                  <p>
                    I acknowledge that I have reviewed the complete medication information, administration instructions, 
                    potential side effects, and warnings for <span className="font-semibold">{selectedConsentMedication.name}</span>.
                  </p>
                  <p>
                    I understand my responsibilities in administering this medication safely and monitoring the constituent 
                    for any adverse reactions. I will document all administrations and report any concerns to the 
                    supervising medical staff.
                  </p>
                  <div className="flex items-start gap-3 mt-4 p-3 bg-white rounded-md border border-gray-300">
                    <input 
                      type="checkbox" 
                      id="consentAck"
                      checked={consentAcknowledged}
                      onChange={(e) => setConsentAcknowledged(e.target.checked)}
                      className="h-5 w-5 rounded mt-0.5"
                      style={{ accentColor: 'var(--color-brand-primary)' }}
                    />
                    <label htmlFor="consentAck" className="text-[13px] font-semibold cursor-pointer">
                      I have read and understand all information provided in this consent form and agree to follow 
                      all administration protocols for this medication.
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConsentDialog(false)}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAcknowledgeConsent}
              disabled={!consentAcknowledged}
              className="rounded-full px-6"
              style={{ 
                backgroundColor: consentAcknowledged ? 'var(--color-brand-primary)' : undefined,
                opacity: consentAcknowledged ? 1 : 0.5
              }}
            >
              Acknowledge & Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Medication Dialog */}
      <NewMedicationDialog
        open={showMedicationDialog}
        onOpenChange={setShowMedicationDialog}
        youthName={constituent.fullName}
      />

      {/* Packing Confirmation Dialog */}
      <Dialog open={showPackingConfirmDialog} onOpenChange={setShowPackingConfirmDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
              Confirm Medication Packing
            </DialogTitle>
            <DialogDescription>
              Review the packing details before finalizing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Constituent Info */}
            <div 
              className="rounded-lg p-4"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: '#f0fdf4'
              }}
            >
              <h4 className="font-semibold text-[14px] mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
                Constituent Information
              </h4>
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold ml-2">{constituent?.fullName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Program:</span>
                  <span className="font-semibold ml-2">{constituent?.program}</span>
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div 
              className="rounded-lg p-4"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: '#eff6ff'
              }}
            >
              <h4 className="font-semibold text-[14px] mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
                Packing Period
              </h4>
              <div className="text-[13px]">
                <span className="text-gray-600">From:</span>
                <span className="font-semibold ml-2">{startDate}</span>
                {endDate && (
                  <>
                    <span className="text-gray-600 ml-4">To:</span>
                    <span className="font-semibold ml-2">{endDate}</span>
                  </>
                )}
              </div>
            </div>

            {/* Medications List */}
            <div 
              className="rounded-lg overflow-hidden"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
              <div 
                className="px-4 py-3"
                style={{ 
                  backgroundColor: '#fafafa',
                  borderBottom: '1px solid var(--slds-g-color-border-base-1)'
                }}
              >
                <h4 className="font-semibold text-[14px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  Medications to Pack ({packedMedications.size})
                </h4>
              </div>
              <div className="p-4 max-h-[300px] overflow-y-auto">
                <div className="space-y-2">
                  {Array.from(packedMedications).map((medName, idx) => {
                    const medDetails = constituent?.medications.find((m: any) => m.name === medName);
                    return (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-md"
                        style={{ 
                          border: '1px solid var(--slds-g-color-border-base-1)',
                          backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <div>
                            <div className="font-semibold text-[13px]">{medName}</div>
                            {medDetails && (
                              <div className="text-[12px] text-gray-600">
                                {medDetails.dose} - {medDetails.frequency}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge 
                          className="bg-blue-100 text-blue-800 border-blue-300"
                          style={{ borderRadius: '12px', padding: '2px 10px', fontSize: '11px' }}
                        >
                          Qty: 7
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div 
              className="rounded-lg p-4 flex items-start gap-3"
              style={{
                border: '1px solid #fbbf24',
                backgroundColor: '#fefce8'
              }}
            >
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-[13px] text-gray-700">
                <p className="font-semibold mb-1">Important:</p>
                <p>Please verify all medication quantities and labels before distribution. Ensure proper storage conditions are maintained during transport.</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowPackingConfirmDialog(false)}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmPacking}
              className="rounded-full px-6"
              style={{ backgroundColor: 'var(--color-brand-primary)' }}
            >
              Confirm & Complete Packing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Handoff Dialog */}
      <Dialog open={showHandoffDialog} onOpenChange={setShowHandoffDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
              Medication Handoff
            </DialogTitle>
            <DialogDescription>
              Complete the handoff form for medication transfer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Constituent Info */}
            <div 
              className="rounded-lg p-4"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: '#f0fdf4'
              }}
            >
              <h4 className="font-semibold text-[14px] mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
                Constituent Information
              </h4>
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold ml-2">{constituent?.fullName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Age:</span>
                  <span className="font-semibold ml-2">{constituent?.age}</span>
                </div>
                <div>
                  <span className="text-gray-600">Program:</span>
                  <span className="font-semibold ml-2">{constituent?.program}</span>
                </div>
                <div>
                  <span className="text-gray-600">Medications:</span>
                  <span className="font-semibold ml-2">{selectedMedicationsForHandoff.size}</span>
                </div>
              </div>
            </div>

            {/* Handoff Period */}
            <div 
              className="rounded-lg p-4"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: '#eff6ff'
              }}
            >
              <h4 className="font-semibold text-[14px] mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                Handoff Period
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="handoffStartDate" className="text-[12px] font-semibold mb-1.5 block">
                    Start Date <span className="text-red-600">*</span>
                  </Label>
                  <DateInput
                    id="handoffStartDate"
value={isoToMdy(handoffStartDate)}
                    onChange={(v) => ((e) => setHandoffStartDate(e.target.value))({ target: { value: mdyToIso(v) } })}
                    className="h-9 text-[13px]"
                  />
                </div>
                <div>
                  <Label htmlFor="handoffStartTime" className="text-[12px] font-semibold mb-1.5 block">
                    Start Time <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="handoffStartTime"
                    type="time"
                    value={handoffStartTime}
                    onChange={(e) => setHandoffStartTime(e.target.value)}
                    className="h-9 text-[13px]"
                  />
                </div>
                <div>
                  <Label htmlFor="handoffEndDate" className="text-[12px] font-semibold mb-1.5 block">
                    End Date <span className="text-red-600">*</span>
                  </Label>
                  <DateInput
                    id="handoffEndDate"
value={isoToMdy(handoffEndDate)}
                    onChange={(v) => ((e) => setHandoffEndDate(e.target.value))({ target: { value: mdyToIso(v) } })}
                    className="h-9 text-[13px]"
                  />
                </div>
                <div>
                  <Label htmlFor="handoffEndTime" className="text-[12px] font-semibold mb-1.5 block">
                    End Time <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="handoffEndTime"
                    type="time"
                    value={handoffEndTime}
                    onChange={(e) => setHandoffEndTime(e.target.value)}
                    className="h-9 text-[13px]"
                  />
                </div>
              </div>
            </div>

            {/* Constituent Received Confirmation */}
            <div 
              className="rounded-lg p-4"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: '#f0fdf4'
              }}
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="constituentReceived"
                  checked={constituentReceived}
                  onCheckedChange={(checked) => setConstituentReceived(checked as boolean)}
                  className="h-5 w-5"
                />
                <Label 
                  htmlFor="constituentReceived" 
                  className="text-[14px] font-semibold cursor-pointer"
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                >
                  Constituent Received <span className="text-red-600">*</span>
                </Label>
              </div>
              <p className="text-[12px] text-gray-600 mt-2 ml-8">
                Confirm that the constituent has received all medications listed below
              </p>
            </div>

            {/* Recipient Information */}
            <div 
              className="rounded-lg p-4"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
              <h4 className="font-semibold text-[14px] mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                Recipient Information
              </h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="recipientType" className="text-[12px] font-semibold mb-1.5 block">
                    Recipient Type <span className="text-red-600">*</span>
                  </Label>
                  <Select value={recipientType} onValueChange={setRecipientType}>
                    <SelectTrigger id="recipientType" className="h-9 text-[13px]">
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
              </div>
            </div>

            {/* Medications Being Handed Off */}
            <div 
              className="rounded-lg overflow-hidden"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
              <div 
                className="px-4 py-3"
                style={{ 
                  backgroundColor: '#fafafa',
                  borderBottom: '1px solid var(--slds-g-color-border-base-1)'
                }}
              >
                <h4 className="font-semibold text-[14px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  Medications Being Handed Off ({selectedMedicationsForHandoff.size})
                </h4>
              </div>
              <div className="p-4 max-h-[200px] overflow-y-auto">
                <div className="space-y-2">
                  {Array.from(selectedMedicationsForHandoff).map((medKey, idx) => {
                    // Parse the medication key (format: "MedicationName-Period")
                    const [medName, period] = medKey.split('-');
                    const medDetails = constituent?.medications.find((m: any) => m.name === medName) || (medName === 'Epi' ? { dose: '-', frequency: 'PRN' } : null);
                    
                    // Determine period color
                    let periodColor = '#3b82f6';
                    if (period === 'Morning') periodColor = '#FFA500';
                    else if (period === 'Afternoon') periodColor = '#2CAB2C';
                    else if (period === 'Evening') periodColor = '#FFFF49';
                    else if (period === 'Bedtime') periodColor = '#3333FF';
                    else if (period === 'PRN') periodColor = '#000000';
                    
                    return (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-md"
                        style={{ 
                          border: '1px solid var(--slds-g-color-border-base-1)',
                          backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-semibold text-[13px]">{medName}</div>
                            {medDetails && (
                              <div className="text-[12px] text-gray-600">
                                {medDetails.dose} - {medDetails.frequency}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge 
                            className="text-white border-0"
                            style={{ 
                              borderRadius: '12px', 
                              padding: '2px 10px', 
                              fontSize: '11px',
                              backgroundColor: periodColor,
                              color: period === 'Evening' ? '#000' : '#fff'
                            }}
                          >
                            {period}
                          </Badge>
                          <Badge 
                            className="bg-blue-100 text-blue-800 border-blue-300"
                            style={{ borderRadius: '12px', padding: '2px 10px', fontSize: '11px' }}
                          >
                            Qty: 7
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Handoff Notes / Comments */}
            <div 
              className="rounded-lg p-4"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
              <Label htmlFor="handoffNotes" className="text-[12px] font-semibold mb-1.5 block">
                {recipientType === 'Other' ? (
                  <>Comments / Recipient Name <span className="text-red-600">*</span></>
                ) : (
                  'Special Instructions / Notes'
                )}
              </Label>
              <Textarea
                id="handoffNotes"
                placeholder={
                  recipientType === 'Other' 
                    ? "Enter the name of the person receiving the medications and any additional notes..."
                    : "Enter any special instructions, concerns, or notes regarding this handoff..."
                }
                value={handoffNotes}
                onChange={(e) => setHandoffNotes(e.target.value)}
                className="min-h-[100px] text-[13px]"
              />
              {recipientType === 'Other' && (
                <p className="text-[11px] text-amber-700 mt-1.5">
                  Please specify the recipient's name and relationship in the comments above
                </p>
              )}
            </div>

            {/* Warning Message */}
            <div 
              className="rounded-lg p-4 flex items-start gap-3"
              style={{
                border: '1px solid #fbbf24',
                backgroundColor: '#fefce8'
              }}
            >
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-[13px] text-gray-700">
                <p className="font-semibold mb-1">Handoff Verification Required:</p>
                <ul className="list-disc list-inside space-y-1 text-[12px]">
                  <li>Verify recipient identity before transferring medications</li>
                  <li>Ensure all medication quantities are counted and verified</li>
                  <li>Review special storage requirements with recipient</li>
                  <li>Provide emergency contact information</li>
                  <li>Document any allergies or special precautions</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowHandoffDialog(false)}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmHandoff}
              className="rounded-full px-6"
              style={{ backgroundColor: 'var(--color-brand-primary)' }}
              disabled={
                !recipientType || 
                !constituentReceived || 
                !handoffEndDate ||
                (recipientType === 'Other' && !handoffNotes.trim())
              }
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete Handoff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Date-Specific Handoff Dialog */}
      <Dialog open={showDateHandoffDialog} onOpenChange={setShowDateHandoffDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
              Handoff Medications - {selectedHandoffDate}
            </DialogTitle>
            <DialogDescription>
              Complete the handoff form for medications scheduled for this date. All selected medications for this day will be transferred to the recipient.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Recipient Information */}
            <div>
              <Label htmlFor="dateHandoffRecipient" className="text-[13px] mb-1.5 block">
                Recipient Name/Location <span className="text-red-600">*</span>
              </Label>
              <Input
                id="dateHandoffRecipient"
                placeholder="Enter recipient name or destination location"
                value={dateHandoffRecipient}
                onChange={(e) => setDateHandoffRecipient(e.target.value)}
                className="h-10"
              />
            </div>

            {/* Handoff Notes */}
            <div>
              <Label htmlFor="dateHandoffNotes" className="text-[13px] mb-1.5 block">
                Handoff Notes
              </Label>
              <Textarea
                id="dateHandoffNotes"
                placeholder="Add any special instructions or notes for this handoff..."
                value={dateHandoffNotes}
                onChange={(e) => setDateHandoffNotes(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Medication Summary */}
            <div 
              className="rounded-lg p-4"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: '#f9fafb'
              }}
            >
              <h4 className="font-semibold text-[13px] mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                Medications for {selectedHandoffDate}
              </h4>
              <div className="space-y-2">
                {['Morning', 'Afternoon', 'Evening', 'Bedtime'].map((period) => {
                  const medsInPeriod = constituent?.medications.filter((m: any) => m.frequency === period) || [];
                  if (medsInPeriod.length === 0) return null;
                  
                  return (
                    <div key={period} className="text-[12px]">
                      <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        {period}:
                      </span>
                      <span className="ml-2" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        {medsInPeriod.map(m => m.name).join(', ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDateHandoffDialog(false)}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDateHandoff}
              className="rounded-full px-6"
              style={{ backgroundColor: 'var(--color-brand-primary)' }}
              disabled={!dateHandoffRecipient.trim()}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete Handoff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Staff Dispense Dialog */}
      <Dialog open={showStaffDispenseDialog} onOpenChange={setShowStaffDispenseDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
              Staff Dispense - {staffDispenseDate}
            </DialogTitle>
            <DialogDescription>
              Record staff dispensing of medications for this date. This will mark the day as dispensed in the checklist.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Staff Name */}
            <div>
              <Label htmlFor="staffDispenseStaffName" className="text-[13px] mb-1.5 block">
                Staff Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="staffDispenseStaffName"
                placeholder="Enter staff member name"
                value={staffDispenseStaffName}
                onChange={(e) => setStaffDispenseStaffName(e.target.value)}
                className="h-10"
              />
            </div>

            {/* Time */}
            <div>
              <Label htmlFor="staffDispenseTime" className="text-[13px] mb-1.5 block">
                Dispense Time <span className="text-red-600">*</span>
              </Label>
              <Input
                id="staffDispenseTime"
                type="time"
                value={staffDispenseTime}
                onChange={(e) => setStaffDispenseTime(e.target.value)}
                className="h-10"
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="staffDispenseNotes" className="text-[13px] mb-1.5 block">
                Dispense Notes
              </Label>
              <Textarea
                id="staffDispenseNotes"
                placeholder="Add any observations or special instructions..."
                value={staffDispenseNotes}
                onChange={(e) => setStaffDispenseNotes(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Medication Summary */}
            <div 
              className="rounded-lg p-4"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: '#f0fdf4'
              }}
            >
              <h4 className="font-semibold text-[13px] mb-3 flex items-center gap-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
                <Package className="h-4 w-4" />
                Medications for {staffDispenseDate}
              </h4>
              <div className="space-y-2">
                {['Morning', 'Afternoon', 'Evening', 'Bedtime'].map((period) => {
                  const medsInPeriod = constituent?.medications.filter((m: any) => m.frequency === period) || [];
                  if (medsInPeriod.length === 0) return null;
                  
                  return (
                    <div key={period} className="text-[12px]">
                      <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        {period}:
                      </span>
                      <span className="ml-2" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        {medsInPeriod.map(m => `${m.name} (${m.dose})`).join(', ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStaffDispenseDialog(false)}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmStaffDispense}
              className="rounded-full px-6"
              style={{ backgroundColor: 'var(--color-brand-primary)' }}
              disabled={!staffDispenseStaffName.trim() || !staffDispenseTime}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Record Dispense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Labels Preview Dialog */}
      <Dialog open={showPrintPreviewDialog} onOpenChange={setShowPrintPreviewDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
              Print Labels Preview - {printPreviewDate}
            </DialogTitle>
            <DialogDescription>
              Review medication labels before printing. Each label will include medication name, dosage, time period, and date.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Print Preview Area */}
            <div 
              className="rounded-lg overflow-hidden"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: '#fafafa'
              }}
            >
              {/* Labels Grid */}
              <div className="p-6 grid grid-cols-2 gap-4">
                {printPreviewMedications.map((med, idx) => {
                  const periodColors: Record<string, string> = {
                    'Morning': '#FFA500',
                    'Afternoon': '#2CAB2C',
                    'Evening': '#FFFF49',
                    'Bedtime': '#3333FF'
                  };
                  const periodIcons: Record<string, any> = {
                    'Morning': Sunrise,
                    'Afternoon': Sun,
                    'Evening': Sunset,
                    'Bedtime': Moon
                  };
                  const PeriodIcon = periodIcons[med.period];
                  
                  return (
                    <div 
                      key={idx}
                      className="rounded-lg p-4"
                      style={{
                        border: '2px dashed var(--slds-g-color-border-base-1)',
                        backgroundColor: 'white'
                      }}
                    >
                      {/* Period Header */}
                      <div 
                        className="flex items-center gap-2 mb-3 px-3 py-2 rounded"
                        style={{ backgroundColor: periodColors[med.period] }}
                      >
                        <PeriodIcon className={`h-4 w-4 ${med.period === 'Evening' ? 'text-gray-800' : 'text-white'}`} />
                        <span className={`font-semibold text-[12px] ${med.period === 'Evening' ? 'text-gray-800' : 'text-white'}`}>
                          {med.period}
                        </span>
                      </div>
                      
                      {/* Label Content */}
                      <div className="space-y-2">
                        <div>
                          <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            Medication
                          </div>
                          <div className="font-semibold text-[14px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            {med.name}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                              Dosage
                            </div>
                            <div className="text-[12px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                              {med.dose}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                              Date
                            </div>
                            <div className="text-[12px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                              {printPreviewDate}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            Constituent
                          </div>
                          <div className="text-[12px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            {constituent?.name || 'Constituent Name'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Print Info */}
            <div 
              className="mt-4 rounded-lg p-4 flex items-start gap-3"
              style={{
                border: '1px solid #bfdbfe',
                backgroundColor: '#eff6ff'
              }}
            >
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-[13px] text-blue-900 mb-1">
                  Print Instructions
                </div>
                <p className="text-[12px] text-blue-800">
                  Labels will be printed 2 per page. Ensure your printer is loaded with label sheets before printing.
                  Total labels to print: <span className="font-semibold">{printPreviewMedications.length}</span>
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPrintPreviewDialog(false)}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPrint}
              className="rounded-full px-6"
              style={{ backgroundColor: 'var(--color-brand-primary)' }}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Labels
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Medication Pack Dialog */}
      <Dialog open={showCreatePackDialog} onOpenChange={setShowCreatePackDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
              {editingPack ? 'Edit Medication Pack' : 'Create New Medication Pack'}
            </DialogTitle>
            <DialogDescription>
              {editingPack 
                ? 'Update the start and end date/time for this medication pack period.'
                : 'Define the start and end date/time for a new medication pack period.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Start Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="packStartDate" className="text-[13px] mb-1.5 block">
                  Start Date <span className="text-red-600">*</span>
                </Label>
                <DateInput
                  id="packStartDate"
value={isoToMdy(packStartDate)}
                  onChange={(v) => ((e) => setPackStartDate(e.target.value))({ target: { value: mdyToIso(v) } })}
                  className="h-10"
                />
              </div>
              
              <div>
                <Label htmlFor="packStartTime" className="text-[13px] mb-1.5 block">
                  Start Time <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="packStartTime"
                  type="time"
                  value={packStartTime}
                  onChange={(e) => setPackStartTime(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>

            {/* End Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="packEndDate" className="text-[13px] mb-1.5 block">
                  End Date <span className="text-red-600">*</span>
                </Label>
                <DateInput
                  id="packEndDate"
value={isoToMdy(packEndDate)}
                  onChange={(v) => ((e) => setPackEndDate(e.target.value))({ target: { value: mdyToIso(v) } })}
                  className="h-10"
                />
              </div>
              
              <div>
                <Label htmlFor="packEndTime" className="text-[13px] mb-1.5 block">
                  End Time <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="packEndTime"
                  type="time"
                  value={packEndTime}
                  onChange={(e) => setPackEndTime(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>

            {/* Info Box */}
            <div 
              className="rounded-lg p-4 flex items-start gap-3"
              style={{
                border: '1px solid #bfdbfe',
                backgroundColor: '#eff6ff'
              }}
            >
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-[13px] text-blue-900 mb-1">
                  Pack Period Information
                </div>
                <p className="text-[12px] text-blue-800">
                  The medication pack period defines the date range for which medications will be prepared and organized. 
                  This helps track and manage medication schedules efficiently.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreatePackDialog(false);
                setEditingPack(null);
              }}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePack}
              className="rounded-full px-6"
              style={{ backgroundColor: 'var(--color-brand-primary)' }}
              disabled={!packStartDate || !packEndDate}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {editingPack ? 'Update Pack' : 'Create Pack'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Medication History Add/Edit Dialog */}
      <Dialog open={showMedicationHistoryDialog} onOpenChange={setShowMedicationHistoryDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="slds-text-6" style={{ color: 'var(--slds-g-color-text-default)' }}>
              {editingHistoryRecord ? 'Modify Medication History' : 'Add Medication History'}
            </DialogTitle>
            <DialogDescription className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              {editingHistoryRecord
                ? 'Update medication history record. All changes create audit and attestation records.'
                : 'Add a new medication to the history. This will create audit and attestation records.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Medication Name */}
            <div className="space-y-1.5">
              <Label htmlFor="medicationName" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                MEDICATION NAME <span className="text-red-600">*</span>
              </Label>
              <Select
                value={historyFormData.medicationName}
                onValueChange={(value) => handleMedicationHistoryFieldChange('medicationName', value)}
              >
                <SelectTrigger
                  id="medicationName"
                  className="h-9 slds-text-4"
                  style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                >
                  <SelectValue placeholder="Select medication..." />
                </SelectTrigger>
                <SelectContent>
                  {BLUEPRINT_MEDICATIONS.map(med => (
                    <SelectItem key={med.id} value={med.name} className="slds-text-4">
                      {med.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Other Medication Name (conditional) */}
            {historyFormData.medicationName === 'Other' && (
              <div className="space-y-1.5">
                <Label htmlFor="otherMedicationName" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  OTHER MEDICATION NAME <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="otherMedicationName"
                  type="text"
                  value={historyFormData.otherMedicationName}
                  onChange={(e) => handleMedicationHistoryFieldChange('otherMedicationName', e.target.value)}
                  placeholder="Enter medication name..."
                  className="h-9 slds-text-4"
                  style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                />
              </div>
            )}

            {/* Start Date */}
            <div className="space-y-1.5">
              <Label htmlFor="historyStartDate" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                START DATE
              </Label>
              <Input
                id="historyStartDate"
                type="text"
                value={historyFormData.startDate}
                onChange={(e) => handleMedicationHistoryFieldChange('startDate', e.target.value)}
                placeholder="MM/DD/YYYY"
                className="h-9 slds-text-4"
                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
              />
              <p className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Must be ≤ today's date
              </p>
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <Label htmlFor="historyEndDate" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                END DATE
              </Label>
              <Input
                id="historyEndDate"
                type="text"
                value={historyFormData.endDate}
                onChange={(e) => handleMedicationHistoryFieldChange('endDate', e.target.value)}
                placeholder="MM/DD/YYYY"
                className="h-9 slds-text-4"
                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
              />
              <p className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Must be ≥ start date and ≤ today's date
              </p>
            </div>

            {/* Dose */}
            <div className="space-y-1.5">
              <Label htmlFor="historyDose" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                DOSE
              </Label>
              <Input
                id="historyDose"
                type="text"
                value={historyFormData.dose}
                onChange={(e) => handleMedicationHistoryFieldChange('dose', e.target.value)}
                placeholder="e.g., 20mg, 1 tablet"
                className="h-9 slds-text-4"
                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
              />
            </div>

            {/* Psychotropic (hidden during creation, visible in list view) */}
            {editingHistoryRecord && (
              <div className="flex items-center space-x-2 py-2">
                <Checkbox
                  id="historyPsychotropic"
                  checked={historyFormData.psychotropic}
                  onCheckedChange={(checked) => handleMedicationHistoryFieldChange('psychotropic', checked)}
                  style={{ accentColor: '#145F33' }}
                />
                <Label
                  htmlFor="historyPsychotropic"
                  className="slds-text-4 font-medium cursor-pointer"
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                >
                  Psychotropic Medication
                </Label>
              </div>
            )}

            {/* Details */}
            <div className="space-y-1.5">
              <Label htmlFor="historyDetails" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                DETAILS
              </Label>
              <Textarea
                id="historyDetails"
                value={historyFormData.details}
                onChange={(e) => handleMedicationHistoryFieldChange('details', e.target.value)}
                placeholder="Additional notes or details..."
                className="min-h-[80px] slds-text-4"
                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
              />
            </div>

            {/* Info Box */}
            <div
              className="flex items-start gap-3 p-4 rounded-lg"
              style={{
                border: '1px solid #bfdbfe',
                backgroundColor: '#eff6ff'
              }}
            >
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold slds-text-4 text-blue-900 mb-1">
                  Audit & Compliance
                </div>
                <p className="slds-text-3 text-blue-800">
                  This action will create immutable audit log and attestation records.
                  {historyFormData.medicationName && historyFormData.medicationName !== 'Other' && (
                    <span>
                      {' '}The psychotropic status will be automatically set based on the medication selected
                      {BLUEPRINT_MEDICATIONS.find(m => m.name === historyFormData.medicationName)?.psychotropic
                        ? ' (this medication is classified as psychotropic).'
                        : '.'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowMedicationHistoryDialog(false);
                setEditingHistoryRecord(null);
              }}
              className="rounded-full px-6 h-9 slds-text-4"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveMedicationHistory}
              className="rounded-full px-6 h-9 slds-text-4 font-semibold"
              style={{ backgroundColor: '#145F33', color: 'white' }}
              disabled={!historyFormData.medicationName || (historyFormData.medicationName === 'Other' && !historyFormData.otherMedicationName.trim())}
            >
              {editingHistoryRecord ? 'Update Record' : 'Add Record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}