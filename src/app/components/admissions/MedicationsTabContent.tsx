import { useState, Fragment } from "react";
import { Sunrise, Sun, Sunset, Moon, AlertCircle, Pill, FileText, Package, Hash, ScrollText, Eye, Globe, Pencil, Trash2, Plus, RefreshCw, Printer, ChevronDown, ChevronRight, User, Camera, Archive, PackagePlus, ArrowRightLeft, Check, Filter } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { MedicationOverviewSections } from "../medications/MedicationOverviewSections";
import { PackMedsView } from "./PackMedsView";
import { OTCConsentsView } from "./OTCConsentsView";
import { OTCDispensationModal, OTCDispensation } from "./OTCDispensationModal";
import { OTCDispensationView } from "./OTCDispensationView";
import { OTCConsentDashboard } from "./OTCConsentDashboard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner@2.0.3";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// Medication Row Component
function MedicationRow({ 
  medication, 
  startTime, 
  stopTime, 
  quantity, 
  staffConsent = true, 
  youthConsent = true, 
  code = "Add",
  onCodeClick,
  onCommentClick
}: { 
  medication: any; 
  startTime: string; 
  stopTime: string; 
  quantity: number; 
  staffConsent?: boolean; 
  youthConsent?: boolean; 
  code?: string;
  onCodeClick: () => void;
  onCommentClick: () => void;
}) {
  const [staffYes, setStaffYes] = useState(staffConsent);
  const [youthYes, setYouthYes] = useState(youthConsent);
  const [currentCode, setCurrentCode] = useState(code);

  return (
    <tr 
      className="hover:bg-gray-50/80 transition-colors"
      style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
    >
      <td className="px-4 py-4 text-[13px] font-medium">{medication.name}</td>
      <td className="px-4 py-4 text-[13px]">{medication.dose}</td>
      <td className="px-4 py-4 text-[13px]">
        {medication.instructions || 'Take as directed'}
      </td>
      <td className="px-4 py-4 text-center text-[13px]">{startTime}</td>
      <td className="px-4 py-4 text-center text-[13px]">{stopTime}</td>
      <td className="px-4 py-4 text-center text-[13px] font-semibold">{quantity}</td>
      <td className="px-4 py-4 text-center">
        <Button
          size="sm"
          onClick={() => setStaffYes(!staffYes)}
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
          onClick={() => setYouthYes(!youthYes)}
          className={cn(
            "h-9 px-5 text-[13px] font-bold rounded-md min-w-[70px]",
            youthYes 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-red-600 hover:bg-red-700 text-white"
          )}
        >
          {youthYes ? "YES" : "NO"}
        </Button>
      </td>
      <td className="px-4 py-4 text-center">
        <Button
          size="sm"
          variant="outline"
          onClick={onCodeClick}
          className={cn(
            "h-8 px-4 text-[13px] font-semibold rounded-md text-blue-600 hover:bg-blue-50",
            currentCode !== "Add" 
              ? "border-2 border-blue-500" 
              : "border-2 border-gray-300"
          )}
        >
          {currentCode}
        </Button>
      </td>
      <td className="px-4 py-4 text-center">
        <Button
          size="sm"
          variant="outline"
          onClick={onCommentClick}
          className="h-8 px-4 text-[13px] font-semibold text-blue-600 border-2 border-gray-300 hover:bg-blue-50 rounded-md"
        >
          Add
        </Button>
      </td>
    </tr>
  );
}

export function MedicationsTabContent({ activeSubTab = "prescriptions" }: { activeSubTab?: string }) {
  // OTC Authorization type
  interface OTCAuthorization {
    id: number;
    status: "Approved" | "Not Approved";
    name: string;
    medicationBrand: string;
    medicationGeneric: string;
    otcCode: string;
  }

  // OTC Authorizations State
  const [otcAuthorizations, setOtcAuthorizations] = useState<OTCAuthorization[]>([
    { id: 1, status: "Approved", name: "Dr. Sarah Johnson", medicationBrand: "TYLENOL 500MG TABLET", medicationGeneric: "Acetaminophen", otcCode: "OTC-001" },
    { id: 2, status: "Approved", name: "Dr. Michael Chen", medicationBrand: "ADVIL 200MG TABLET", medicationGeneric: "Ibuprofen", otcCode: "OTC-002" },
    { id: 3, status: "Not Approved", name: "Dr. Emily Rodriguez", medicationBrand: "BENADRYL 25MG CAPSULE", medicationGeneric: "Diphenhydramine HCl", otcCode: "OTC-003" },
    { id: 4, status: "Approved", name: "Dr. Sarah Johnson", medicationBrand: "CLARITIN 10MG TABLET", medicationGeneric: "Loratadine", otcCode: "OTC-004" },
    { id: 5, status: "Approved", name: "Dr. David Park", medicationBrand: "TUMS REGULAR STRENGTH", medicationGeneric: "Calcium Carbonate 500mg", otcCode: "OTC-005" },
    { id: 6, status: "Not Approved", name: "Dr. Michael Chen", medicationBrand: "MUCINEX 600MG TABLET", medicationGeneric: "Guaifenesin", otcCode: "OTC-006" },
    { id: 7, status: "Approved", name: "Dr. Emily Rodriguez", medicationBrand: "ZYRTEC 10MG TABLET", medicationGeneric: "Cetirizine HCl", otcCode: "OTC-007" },
    { id: 8, status: "Approved", name: "Dr. Sarah Johnson", medicationBrand: "ASPIRIN 325MG TABLET", medicationGeneric: "Acetylsalicylic Acid", otcCode: "OTC-008" },
    { id: 9, status: "Not Approved", name: "Dr. David Park", medicationBrand: "ROBITUSSIN DM", medicationGeneric: "Dextromethorphan/Guaifenesin", otcCode: "OTC-009" },
    { id: 10, status: "Approved", name: "Dr. Michael Chen", medicationBrand: "PEPTO-BISMOL REGULAR", medicationGeneric: "Bismuth Subsalicylate", otcCode: "OTC-010" }
  ]);

  // OTC Sorting State
  const [otcSortColumn, setOtcSortColumn] = useState<string | null>(null);
  const [otcSortDirection, setOtcSortDirection] = useState<"asc" | "desc">("asc");

  // OTC Search State
  const [otcSearchTerm, setOtcSearchTerm] = useState("");

  // OTC Multi-select Dialog State
  const [addOTCDialogOpen, setAddOTCDialogOpen] = useState(false);
  const [selectedOTCIds, setSelectedOTCIds] = useState<number[]>([]);
  const [otcPicklistSearchTerm, setOtcPicklistSearchTerm] = useState("");

  // Blueprint SQL OTC Medications (Mock Data)
  const [blueprintOTCMedications] = useState([
    { id: 101, medicationBrand: "ALEVE 220MG TABLET", medicationGeneric: "Naproxen Sodium", otcCode: "OTC-101" },
    { id: 102, medicationBrand: "ALLEGRA 180MG TABLET", medicationGeneric: "Fexofenadine HCl", otcCode: "OTC-102" },
    { id: 103, medicationBrand: "FLONASE NASAL SPRAY", medicationGeneric: "Fluticasone Propionate", otcCode: "OTC-103" },
    { id: 104, medicationBrand: "PRILOSEC OTC 20MG", medicationGeneric: "Omeprazole", otcCode: "OTC-104" },
    { id: 105, medicationBrand: "NICORETTE GUM 2MG", medicationGeneric: "Nicotine Polacrilex", otcCode: "OTC-105" },
    { id: 106, medicationBrand: "SUDAFED 30MG TABLET", medicationGeneric: "Pseudoephedrine HCl", otcCode: "OTC-106" },
    { id: 107, medicationBrand: "IMODIUM A-D 2MG", medicationGeneric: "Loperamide HCl", otcCode: "OTC-107" },
    { id: 108, medicationBrand: "MIRALAX POWDER", medicationGeneric: "Polyethylene Glycol 3350", otcCode: "OTC-108" },
    { id: 109, medicationBrand: "NEXIUM 24HR 20MG", medicationGeneric: "Esomeprazole Magnesium", otcCode: "OTC-109" },
    { id: 110, medicationBrand: "CORTISONE-10 CREAM", medicationGeneric: "Hydrocortisone 1%", otcCode: "OTC-110" },
    { id: 111, medicationBrand: "BENADRYL CREAM", medicationGeneric: "Diphenhydramine Topical", otcCode: "OTC-111" },
    { id: 112, medicationBrand: "NEOSPORIN OINTMENT", medicationGeneric: "Bacitracin/Neomycin/Polymyxin B", otcCode: "OTC-112" },
    { id: 113, medicationBrand: "PREPARATION H OINTMENT", medicationGeneric: "Phenylephrine/Pramoxine", otcCode: "OTC-113" },
    { id: 114, medicationBrand: "VISINE EYE DROPS", medicationGeneric: "Tetrahydrozoline HCl", otcCode: "OTC-114" },
    { id: 115, medicationBrand: "AFRIN NASAL SPRAY", medicationGeneric: "Oxymetazoline HCl", otcCode: "OTC-115" }
  ]);

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOTC, setSelectedOTC] = useState<OTCAuthorization | null>(null);
  
  // Form state for editing
  const [editForm, setEditForm] = useState({
    status: "Approved" as "Approved" | "Not Approved",
    name: "",
    medicationBrand: "",
    medicationGeneric: "",
    otcCode: ""
  });

  // OTC Consent State (imported from OTCConsentsView)
  const [otcConsents, setOtcConsents] = useState([
    {
      id: "OTC-001",
      youthName: "Fozzie Bear",
      startDate: "2026-01-15",
      endDate: "2027-01-14",
      executedDate: "2026-01-15",
      status: "Active" as const,
      executionMethod: "DocuSign" as const,
      selectedOTCs: ["Acetaminophen 325mg", "Ibuprofen 200mg", "Diphenhydramine 25mg", "Cetirizine 10mg"],
      createdBy: "Sarah Johnson",
      createdDate: "2026-01-10",
      lastModifiedBy: "Sarah Johnson",
      lastModifiedDate: "2026-01-15"
    },
    {
      id: "OTC-002",
      youthName: "Fozzie Bear",
      startDate: "2025-01-15",
      endDate: "2026-01-14",
      executedDate: "2025-01-15",
      status: "Expired" as const,
      executionMethod: "Manual Upload" as const,
      documentUrl: "/documents/otc-consent-2025.pdf",
      selectedOTCs: ["Acetaminophen 325mg", "Ibuprofen 200mg"],
      createdBy: "Michael Chen",
      createdDate: "2025-01-10",
      lastModifiedBy: "Michael Chen",
      lastModifiedDate: "2025-01-15"
    }
  ]);

  // OTC Dispensation State
  const [otcDispensations, setOtcDispensations] = useState<OTCDispensation[]>([]);
  const [dispensationModalOpen, setDispensationModalOpen] = useState(false);
  const [futureDateLimit, setFutureDateLimit] = useState(30); // Configurable limit for future-dated entries

  // OTC Dashboard State
  const [viewingConsentFromDashboard, setViewingConsentFromDashboard] = useState<any>(null);
  const [renewingConsentFromDashboard, setRenewingConsentFromDashboard] = useState<any>(null);

  // Overview Tab Refresh State
  const [isRefreshingOverview, setIsRefreshingOverview] = useState(false);

  // Count Tab State
  const [disposalDialogOpen, setDisposalDialogOpen] = useState(false);
  const [restockDialogOpen, setRestockDialogOpen] = useState(false);
  const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  // Count Tab Form States
  const [disposalForm, setDisposalForm] = useState({
    medication: "",
    quantity: "",
    reason: "",
    notes: ""
  });

  // State for tracking which count type is being edited
  const [editingCountTypeId, setEditingCountTypeId] = useState<number | null>(null);

  const [restockForm, setRestockForm] = useState({
    medication: "",
    quantity: "",
    supplier: "",
    notes: ""
  });

  const [transitionForm, setTransitionForm] = useState({
    medication: "",
    fromLocation: "",
    toLocation: "",
    quantity: "",
    notes: ""
  });

  // Log Tab State
  const [expandedLogRows, setExpandedLogRows] = useState<Set<number>>(new Set());
  const [selectedLogs, setSelectedLogs] = useState<number[]>([]);
  const [attestationDialogOpen, setAttestationDialogOpen] = useState(false);

  // Medication Count type
  interface MedicationCount {
    id: number;
    dosePeriod: string;
    medication: string;
    dose: string;
    countType: string;
    lastCount: number;
    currentCount: number;
    comments: string;
  }

  // Active Medication type for Overview tab
  interface ActiveMedication {
    id: number;
    dosePeriod: string;
    medication: string;
    genericName?: string;
    dose: string;
    startTime: string;
    endTime: string;
    prescriptionStart?: string; // MM/DD/YYYY
    prescriptionEnd?: string;   // MM/DD/YYYY
  }

  // Mock active medications data — only entries with prescriptionStart/End within today's date are shown
  const [activeMedications] = useState<ActiveMedication[]>([
    {
      id: 1,
      dosePeriod: "Morning",
      medication: "Lexapro",
      genericName: "Escitalopram",
      dose: "20mg Tablet",
      startTime: "08:00 AM",
      endTime: "08:30 AM",
      prescriptionStart: "01/15/2026",
      prescriptionEnd: "07/15/2026"
    },
    {
      id: 2,
      dosePeriod: "Morning",
      medication: "Adderall XR",
      genericName: "Amphetamine Salts",
      dose: "20mg Capsule",
      startTime: "08:00 AM",
      endTime: "08:30 AM",
      prescriptionStart: "02/01/2026",
      prescriptionEnd: "08/01/2026"
    },
    {
      id: 3,
      dosePeriod: "Morning",
      medication: "Amoxicillin",
      genericName: "Amoxicillin",
      dose: "500mg Capsule",
      startTime: "08:30 AM",
      endTime: "09:00 AM",
      prescriptionStart: "04/28/2026",
      prescriptionEnd: "05/12/2026"
    },
    {
      id: 4,
      dosePeriod: "Afternoon",
      medication: "Vitamin D",
      genericName: "Cholecalciferol",
      dose: "1000 IU Softgel",
      startTime: "12:00 PM",
      endTime: "12:30 PM",
      prescriptionStart: "01/01/2026",
      prescriptionEnd: "12/31/2026"
    },
    {
      id: 5,
      dosePeriod: "Evening",
      medication: "Fish Oil",
      genericName: "Omega-3 Fatty Acids",
      dose: "1000mg Capsule",
      startTime: "06:00 PM",
      endTime: "06:30 PM",
      prescriptionStart: "01/01/2026",
      prescriptionEnd: "12/31/2026"
    },
    {
      id: 6,
      dosePeriod: "Bedtime",
      medication: "Zoloft",
      genericName: "Sertraline HCl",
      dose: "50mg Tablet",
      startTime: "09:00 PM",
      endTime: "09:30 PM",
      prescriptionStart: "03/01/2026",
      prescriptionEnd: "09/01/2026"
    },
    {
      id: 7,
      dosePeriod: "Bedtime",
      medication: "Benzonatate",
      genericName: "Benzonatate",
      dose: "100mg Capsule",
      startTime: "09:30 PM",
      endTime: "10:00 PM",
      prescriptionStart: "04/20/2026",
      prescriptionEnd: "05/20/2026"
    },
    {
      id: 8,
      dosePeriod: "PRN",
      medication: "GenTeal Tears Eye Gel",
      genericName: "Hydroxypropyl Methylcellulose",
      dose: "0.3% Ophthalmic",
      startTime: "",
      endTime: "",
      prescriptionStart: "02/15/2026",
      prescriptionEnd: "08/15/2026"
    },
    {
      id: 9,
      dosePeriod: "PRN",
      medication: "Melatonin",
      genericName: "Melatonin",
      dose: "3mg Tablet",
      startTime: "",
      endTime: "",
      prescriptionStart: "01/01/2026",
      prescriptionEnd: "12/31/2026"
    }
  ]);

  // Mock medication count data
  const [medicationCounts, setMedicationCounts] = useState<MedicationCount[]>([
    {
      id: 1,
      dosePeriod: "Morning",
      medication: "Amoxicillin",
      dose: "500mg Capsule",
      countType: "Units",
      lastCount: 30,
      currentCount: 28,
      comments: "2 doses administered"
    },
    {
      id: 2,
      dosePeriod: "Bedtime",
      medication: "Benzonatate",
      dose: "100mg Capsule",
      countType: "Units",
      lastCount: 20,
      currentCount: 18,
      comments: "Used as needed for cough"
    },
    {
      id: 3,
      dosePeriod: "PRN",
      medication: "GenTeal Tears Eye Gel",
      dose: "0.3% Ophthalmic",
      countType: "Volume",
      lastCount: 5,
      currentCount: 4,
      comments: "1 application for dry eyes"
    },
    {
      id: 4,
      dosePeriod: "Morning",
      medication: "Lexapro",
      dose: "20mg Tablet",
      countType: "Units",
      lastCount: 60,
      currentCount: 59,
      comments: "Daily dose administered"
    },
    {
      id: 5,
      dosePeriod: "Bedtime",
      medication: "Zoloft",
      dose: "50mg Tablet",
      countType: "Units",
      lastCount: 45,
      currentCount: 43,
      comments: "2 doses administered"
    },
    {
      id: 6,
      dosePeriod: "Morning",
      medication: "Adderall XR",
      dose: "20mg Capsule",
      countType: "Units",
      lastCount: 30,
      currentCount: 28,
      comments: "Controlled substance - verified count"
    }
  ]);

  // Medication Log type
  interface MedicationLog {
    id: number;
    doseDate: string;
    dosePeriod: string;
    inst: string;
    seq: string;
    logType: string;
    number: string;
    primaryCode: string;
    secondaryCode: string;
    attestationDate: string;
    attestationStaff: string;
    medication: string;
    dose: string;
    details?: string;
  }

  // Mock medication log data
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([
    {
      id: 1,
      doseDate: "01/15/2026",
      dosePeriod: "Morning",
      inst: "A",
      seq: "1",
      logType: "OTC Dispensation",
      number: "3",
      primaryCode: "DISP",
      secondaryCode: "OTC",
      attestationDate: "01/15/2026 08:30 AM",
      attestationStaff: "Sarah Johnson",
      medication: "Ibuprofen",
      dose: "200mg Tablet",
      details: "Dispensed for headache relief. Patient reported mild discomfort."
    },
    {
      id: 2,
      doseDate: "01/15/2026",
      dosePeriod: "Morning",
      inst: "A",
      seq: "2",
      logType: "Prescription Dispensation",
      number: "1",
      primaryCode: "DISP",
      secondaryCode: "RX",
      attestationDate: "01/15/2026 09:00 AM",
      attestationStaff: "Michael Chen",
      medication: "Lexapro",
      dose: "20mg Tablet",
      details: "Daily scheduled medication administered with breakfast. Patient tolerated well."
    },
    {
      id: 3,
      doseDate: "01/15/2026",
      dosePeriod: "Afternoon",
      inst: "A",
      seq: "1",
      logType: "Count",
      number: "-",
      primaryCode: "CNT",
      secondaryCode: "VRF",
      attestationDate: "01/15/2026 02:00 PM",
      attestationStaff: "Emily Rodriguez",
      medication: "Adderall XR",
      dose: "20mg Capsule",
      details: "Routine count verification for controlled substance. Count matches expected inventory."
    },
    {
      id: 4,
      doseDate: "01/15/2026",
      dosePeriod: "Bedtime",
      inst: "A",
      seq: "1",
      logType: "Prescription Dispensation",
      number: "1",
      primaryCode: "DISP",
      secondaryCode: "RX",
      attestationDate: "01/15/2026 09:30 PM",
      attestationStaff: "David Martinez",
      medication: "Zoloft",
      dose: "50mg Tablet",
      details: "Evening medication administered. Patient preparing for bedtime routine."
    },
    {
      id: 5,
      doseDate: "01/14/2026",
      dosePeriod: "Morning",
      inst: "A",
      seq: "1",
      logType: "Prescription Dispensation",
      number: "2",
      primaryCode: "DISP",
      secondaryCode: "RX",
      attestationDate: "01/14/2026 08:45 AM",
      attestationStaff: "Sarah Johnson",
      medication: "Amoxicillin",
      dose: "500mg Capsule",
      details: "Antibiotic course day 3. Patient showing improvement in symptoms."
    },
    {
      id: 6,
      doseDate: "01/14/2026",
      dosePeriod: "PRN",
      inst: "A",
      seq: "1",
      logType: "OTC Dispensation",
      number: "1",
      primaryCode: "DISP",
      secondaryCode: "PRN",
      attestationDate: "01/14/2026 03:15 PM",
      attestationStaff: "Emily Rodriguez",
      medication: "GenTeal Tears Eye Gel",
      dose: "0.3% Ophthalmic",
      details: "PRN application for dry eyes. Patient reported relief after application."
    },
    {
      id: 7,
      doseDate: "01/14/2026",
      dosePeriod: "Bedtime",
      inst: "B",
      seq: "1",
      logType: "Prescription Dispensation",
      number: "1",
      primaryCode: "DISP",
      secondaryCode: "RX",
      attestationDate: "01/14/2026 10:00 PM",
      attestationStaff: "Michael Chen",
      medication: "Benzonatate",
      dose: "100mg Capsule",
      details: "Cough suppressant for nighttime relief. Patient experiencing persistent cough."
    },
    {
      id: 8,
      doseDate: "01/13/2026",
      dosePeriod: "Morning",
      inst: "A",
      seq: "1",
      logType: "Restock",
      number: "-",
      primaryCode: "RSTK",
      secondaryCode: "INV",
      attestationDate: "01/13/2026 10:00 AM",
      attestationStaff: "David Martinez",
      medication: "Lexapro",
      dose: "20mg Tablet",
      details: "Monthly restock from pharmacy. 30-day supply received and logged."
    },
    {
      id: 9,
      doseDate: "01/13/2026",
      dosePeriod: "Afternoon",
      inst: "A",
      seq: "1",
      logType: "Disposal",
      number: "-",
      primaryCode: "DISP",
      secondaryCode: "EXP",
      attestationDate: "01/13/2026 02:30 PM",
      attestationStaff: "Sarah Johnson",
      medication: "Ibuprofen",
      dose: "200mg Tablet",
      details: "Disposed of 10 expired tablets per protocol. Witnessed disposal completed."
    },
    {
      id: 10,
      doseDate: "01/13/2026",
      dosePeriod: "Bedtime",
      inst: "A",
      seq: "1",
      logType: "Prescription Dispensation",
      number: "1",
      primaryCode: "DISP",
      secondaryCode: "RX",
      attestationDate: "01/13/2026 09:45 PM",
      attestationStaff: "Emily Rodriguez",
      medication: "Zoloft",
      dose: "50mg Tablet",
      details: "Routine bedtime medication. Patient compliant with treatment plan."
    }
  ]);

  // Handle edit button click
  const handleEditClick = (otc: OTCAuthorization) => {
    setSelectedOTC(otc);
    setEditForm({
      status: otc.status,
      name: otc.name,
      medicationBrand: otc.medicationBrand,
      medicationGeneric: otc.medicationGeneric,
      otcCode: otc.otcCode
    });
    setEditDialogOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (selectedOTC) {
      setOtcAuthorizations(prev =>
        prev.map(otc =>
          otc.id === selectedOTC.id
            ? { ...otc, ...editForm }
            : otc
        )
      );
      setEditDialogOpen(false);
      setSelectedOTC(null);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (otc: OTCAuthorization) => {
    setSelectedOTC(otc);
    setDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (selectedOTC) {
      setOtcAuthorizations(prev => prev.filter(otc => otc.id !== selectedOTC.id));
      setDeleteDialogOpen(false);
      setSelectedOTC(null);
    }
  };

  // Handle dispensation recorded
  const handleDispensationRecorded = (dispensation: OTCDispensation) => {
    setOtcDispensations(prev => [dispensation, ...prev]);
    toast.success("Dispensation recorded successfully");
  };

  // Handle navigate to consent from dashboard
  const handleNavigateToConsent = (consent: any) => {
    setViewingConsentFromDashboard(consent);
  };

  // Handle initiate renewal from dashboard
  const handleInitiateRenewal = (consent: any) => {
    setRenewingConsentFromDashboard(consent);
  };

  // Handle Overview Refresh (AC12)
  const handleRefreshOverview = () => {
    if (isRefreshingOverview) return;
    setIsRefreshingOverview(true);
    setTimeout(() => setIsRefreshingOverview(false), 1000);
  };

  // Handle OTC Column Sort
  const handleOTCSort = (column: string) => {
    if (otcSortColumn === column) {
      // Toggle direction
      setOtcSortDirection(otcSortDirection === "asc" ? "desc" : "asc");
    } else {
      setOtcSortColumn(column);
      setOtcSortDirection("asc");
    }
  };

  // Filter and sort OTC authorizations
  const getFilteredAndSortedOTCs = () => {
    let filtered = otcAuthorizations;

    // Apply search filter
    if (otcSearchTerm) {
      filtered = filtered.filter(otc =>
        otc.status.toLowerCase().includes(otcSearchTerm.toLowerCase()) ||
        otc.name.toLowerCase().includes(otcSearchTerm.toLowerCase()) ||
        otc.medicationBrand.toLowerCase().includes(otcSearchTerm.toLowerCase()) ||
        otc.medicationGeneric.toLowerCase().includes(otcSearchTerm.toLowerCase()) ||
        otc.otcCode.toLowerCase().includes(otcSearchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (otcSortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: any = a[otcSortColumn as keyof OTCAuthorization];
        let bVal: any = b[otcSortColumn as keyof OTCAuthorization];

        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();

        if (aVal < bVal) return otcSortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return otcSortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  };

  // Handle Add OTCs from Blueprint
  const handleAddOTCsFromBlueprint = () => {
    if (selectedOTCIds.length === 0) {
      toast.error("Please select at least one medication");
      return;
    }

    const selectedMeds = blueprintOTCMedications.filter(med => selectedOTCIds.includes(med.id));
    const nextId = Math.max(...otcAuthorizations.map(o => o.id), 0) + 1;

    const newOTCs: OTCAuthorization[] = selectedMeds.map((med, index) => ({
      id: nextId + index,
      status: "Not Approved" as "Approved" | "Not Approved",
      name: "Pending Authorization",
      medicationBrand: med.medicationBrand,
      medicationGeneric: med.medicationGeneric,
      otcCode: med.otcCode
    }));

    setOtcAuthorizations([...otcAuthorizations, ...newOTCs]);
    setAddOTCDialogOpen(false);
    setSelectedOTCIds([]);
    setOtcPicklistSearchTerm("");
    toast.success(`Added ${newOTCs.length} OTC medication${newOTCs.length > 1 ? 's' : ''}`);
  };

  // Toggle OTC selection in picklist
  const toggleOTCSelection = (id: number) => {
    setSelectedOTCIds(prev =>
      prev.includes(id) ? prev.filter(medId => medId !== id) : [...prev, id]
    );
  };

  // Filter Blueprint OTC Medications
  const getFilteredBlueprintOTCs = () => {
    if (!otcPicklistSearchTerm) return blueprintOTCMedications;
    
    return blueprintOTCMedications.filter(med =>
      med.medicationBrand.toLowerCase().includes(otcPicklistSearchTerm.toLowerCase()) ||
      med.medicationGeneric.toLowerCase().includes(otcPicklistSearchTerm.toLowerCase()) ||
      med.otcCode.toLowerCase().includes(otcPicklistSearchTerm.toLowerCase())
    );
  };

  // Handle Count Type Update
  const handleCountTypeUpdate = (id: number, newCountType: string) => {
    setMedicationCounts(prev =>
      prev.map(med =>
        med.id === id ? { ...med, countType: newCountType } : med
      )
    );
    setEditingCountTypeId(null);
    toast.success("Count type updated successfully");
  };

  // Handle Profile Image Upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImageUrl(reader.result as string);
        toast.success("Profile image uploaded successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Disposal
  const handleDisposal = () => {
    if (!disposalForm.medication || !disposalForm.quantity || !disposalForm.reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.success(`Disposed ${disposalForm.quantity} units of ${disposalForm.medication}`);
    setDisposalDialogOpen(false);
    setDisposalForm({ medication: "", quantity: "", reason: "", notes: "" });
  };

  // Handle Restock
  const handleRestock = () => {
    if (!restockForm.medication || !restockForm.quantity || !restockForm.supplier) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.success(`Restocked ${restockForm.quantity} units of ${restockForm.medication}`);
    setRestockDialogOpen(false);
    setRestockForm({ medication: "", quantity: "", supplier: "", notes: "" });
  };

  // Handle Transition
  const handleTransition = () => {
    if (!transitionForm.medication || !transitionForm.fromLocation || !transitionForm.toLocation || !transitionForm.quantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.success(`Transitioned ${transitionForm.quantity} units of ${transitionForm.medication} from ${transitionForm.fromLocation} to ${transitionForm.toLocation}`);
    setTransitionDialogOpen(false);
    setTransitionForm({ medication: "", fromLocation: "", toLocation: "", quantity: "", notes: "" });
  };

  // Handle Log Row Toggle
  const toggleLogRow = (id: number) => {
    const newExpanded = new Set(expandedLogRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedLogRows(newExpanded);
  };

  // Handle Log Selection
  const toggleLogSelection = (id: number) => {
    setSelectedLogs(prev =>
      prev.includes(id)
        ? prev.filter(logId => logId !== id)
        : [...prev, id]
    );
  };

  // Handle Select All Logs
  const toggleSelectAllLogs = () => {
    if (selectedLogs.length === medicationLogs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(medicationLogs.map(log => log.id));
    }
  };

  // Handle View Selected
  const handleViewSelected = () => {
    if (selectedLogs.length === 0) {
      toast.error("Please select at least one log entry");
      return;
    }
    toast.success(`Viewing ${selectedLogs.length} selected log ${selectedLogs.length === 1 ? 'entry' : 'entries'}`);
  };

  // Handle Refresh
  const handleRefreshLogs = () => {
    toast.success("Medication logs refreshed");
  };

  // Handle Print Logs
  const handlePrintLogs = () => {
    toast.success("Preparing medication logs for printing");
  };

  // Handle Attestation
  const handleAttestation = () => {
    if (selectedLogs.length === 0) {
      toast.error("Please select at least one log entry to attest");
      return;
    }
    setAttestationDialogOpen(true);
  };

  // Handle Confirm Attestation
  const handleConfirmAttestation = () => {
    toast.success(`Attested ${selectedLogs.length} log ${selectedLogs.length === 1 ? 'entry' : 'entries'}`);
    setAttestationDialogOpen(false);
    setSelectedLogs([]);
  };

  return (
    <div>
      {/* Prescriptions View */}
      {activeSubTab === "prescriptions" && (
        <div className="space-y-5">
          {/* MORNING Period */}
          <div 
            className="rounded-lg overflow-hidden"
            style={{
              border: '1px solid var(--slds-g-color-border-base-1)',
              backgroundColor: 'var(--slds-g-color-background-base)'
            }}
          >
            <div 
              className="px-5 py-3 flex items-center gap-3"
              style={{
                backgroundColor: '#FFA500',
                borderBottom: '2px solid #cc8400',
                borderLeft: '4px solid #cc8400'
              }}
            >
              <Sunrise className="w-5 h-5 text-white" />
              <span className="font-bold text-[15px]" style={{ color: '#ffffff' }}>Morning Medications</span>
              <span className="text-[12px] ml-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>6:00 AM - 11:00 AM</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '140px' }}>Medication</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '80px' }}>Dose</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '200px' }}>Instructions</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '80px' }}>Start</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '80px' }}>Stop</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '50px' }}>Qty</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '80px' }}>Staff</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '80px' }}>Youth</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '80px' }}>Code</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '100px' }}>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  <MedicationRow 
                    medication={{ name: "Adderall XR", dose: "20mg", instructions: "Take in the morning with food" }}
                    startTime="6:00 AM"
                    stopTime="11:00 AM"
                    quantity={24}
                    onCodeClick={() => {}}
                    onCommentClick={() => {}}
                  />
                </tbody>
              </table>
            </div>
          </div>

          {/* BEDTIME Period */}
          <div 
            className="rounded-lg overflow-hidden"
            style={{
              border: '1px solid var(--slds-g-color-border-base-1)',
              backgroundColor: 'var(--slds-g-color-background-base)'
            }}
          >
            <div 
              className="px-5 py-3 flex items-center gap-3"
              style={{
                backgroundColor: '#3333FF',
                borderBottom: '2px solid #2929cc',
                borderLeft: '4px solid #2929cc'
              }}
            >
              <Moon className="w-5 h-5 text-white" />
              <span className="font-bold text-[15px]" style={{ color: '#ffffff' }}>Bedtime Medications</span>
              <span className="text-[12px] ml-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>8:00 PM - 11:59 PM</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '140px' }}>Medication</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '80px' }}>Dose</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '200px' }}>Instructions</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '80px' }}>Start</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '80px' }}>Stop</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '50px' }}>Qty</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '80px' }}>Staff</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '80px' }}>Youth</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '80px' }}>Code</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '100px' }}>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  <MedicationRow 
                    medication={{ name: "Zoloft", dose: "50mg", instructions: "Take at bedtime with a glass of water" }}
                    startTime="8:00 PM"
                    stopTime="11:59 PM"
                    quantity={22}
                    staffConsent={false}
                    youthConsent={false}
                    code="YR"
                    onCodeClick={() => {}}
                    onCommentClick={() => {}}
                  />
                </tbody>
              </table>
            </div>
          </div>

          {/* PRN Period */}
          <div 
            className="rounded-lg overflow-hidden"
            style={{
              border: '1px solid var(--slds-g-color-border-base-1)',
              backgroundColor: 'var(--slds-g-color-background-base)'
            }}
          >
            <div 
              className="px-5 py-3 flex items-center gap-3"
              style={{
                backgroundColor: '#000000',
                borderBottom: '2px solid #0a0a0a',
                borderLeft: '4px solid #0a0a0a'
              }}
            >
              <AlertCircle className="w-5 h-5 text-white" />
              <span className="font-bold text-[15px]" style={{ color: '#ffffff' }}>PRN (As Needed)</span>
              <span className="text-[12px] ml-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Emergency & As-Needed Medications</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '140px' }}>Medication</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '80px' }}>Dose</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '200px' }}>Instructions</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '80px' }}>Start</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '80px' }}>Stop</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '50px' }}>Qty</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '80px' }}>Staff</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '80px' }}>Youth</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '80px' }}>Code</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase" style={{ color: 'var(--slds-g-color-text-weak)', minWidth: '100px' }}>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    className="hover:bg-gray-50/80 transition-colors"
                    style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                  >
                    <td className="px-4 py-4 text-[13px] font-medium">Epi-Pen</td>
                    <td className="px-4 py-4 text-[13px]">-</td>
                    <td className="px-4 py-4 text-[13px]">Emergency Medication - See Allergy Action Plan</td>
                    <td className="px-4 py-4 text-center text-[13px]">-</td>
                    <td className="px-4 py-4 text-center text-[13px]">-</td>
                    <td className="px-4 py-4 text-center text-[13px] font-semibold">-</td>
                    <td className="px-4 py-4 text-center"><span className="text-gray-400 text-[13px]">-</span></td>
                    <td className="px-4 py-4 text-center"><span className="text-gray-400 text-[13px]">-</span></td>
                    <td className="px-4 py-4 text-center">
                      <Button size="sm" variant="outline" className="h-8 px-4 text-[13px] font-semibold rounded-md border-2 border-gray-300 text-blue-600 hover:bg-blue-50">Add</Button>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Button size="sm" variant="outline" className="h-8 px-4 text-[13px] font-semibold text-blue-600 border-2 border-gray-300 hover:bg-blue-50 rounded-md">Add</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Medication History View */}
      {activeSubTab === "history" && (
        <div 
          className="rounded-lg overflow-hidden"
          style={{
            border: '1px solid var(--slds-g-color-border-base-1)',
            backgroundColor: 'var(--slds-g-color-background-base)'
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr 
                  style={{ 
                    backgroundColor: 'var(--slds-g-color-background-alt)',
                    borderBottom: '2px solid var(--slds-g-color-border-base-1)'
                  }}
                >
                  <th 
                    className="px-4 py-3 text-left text-[12px] font-semibold"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Medication
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-[12px] font-semibold"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Start Date
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-[12px] font-semibold"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    End Date
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-[12px] font-semibold"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Dose
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-[12px] font-semibold"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Psychotropic
                  </th>
                  <th 
                    className="px-4 py-3 text-center text-[12px] font-semibold"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  className="hover:bg-gray-50/50 transition-colors"
                  style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                >
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-[#080707]">
                        LEXAPRO 20MG TABLET
                      </span>
                      <span 
                        className="text-[12px] mt-0.5"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Escitalopram Oxalate
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    02/03/2017
                  </td>
                  <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    -
                  </td>
                  <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    20mg
                  </td>
                  <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Yes
                  </td>
                  <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Prescribed for generalized anxiety disorder and depression. Currently active with regular monitoring by Dr. Sarah Johnson.
                  </td>
                </tr>
                <tr 
                  className="hover:bg-gray-50/50 transition-colors"
                  style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                >
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-[#080707]">
                        ZOLOFT 50MG TABLET
                      </span>
                      <span 
                        className="text-[12px] mt-0.5"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Sertraline HCl
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    06/15/2018
                  </td>
                  <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    02/03/2019
                  </td>
                  <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    50mg
                  </td>
                  <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Yes
                  </td>
                  <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Discontinued due to side effects. Transitioned to Lexapro with successful outcomes. Treatment completed February 2019.
                  </td>
                </tr>
                <tr 
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-[#080707]">
                        ADDERALL XR 20MG CAPSULE
                      </span>
                      <span 
                        className="text-[12px] mt-0.5"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Amphetamine/Dextroamphetamine
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    11/22/2019
                  </td>
                  <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    -
                  </td>
                  <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    20mg
                  </td>
                  <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Yes
                  </td>
                  <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Prescribed for ADHD management. Take once daily in morning with food. Regular follow-ups scheduled monthly with prescribing physician.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OTCs View */}
      {activeSubTab === "otcs" && (
        <div className="space-y-6">
          {/* AC1: Top Section - OTC Authorizations */}
          <div>
            <div className="mb-4">
              <h3 className="text-[15px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                OTC Authorizations
              </h3>
              <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Standardized over-the-counter medications approved based on active consent
              </p>
            </div>

            {/* AC2-5: Standardized OTC Medication List */}
            <div 
              className="rounded-lg overflow-hidden"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr 
                      style={{ 
                        backgroundColor: 'var(--slds-g-color-background-alt)',
                        borderBottom: '2px solid var(--slds-g-color-border-base-1)'
                      }}
                    >
                      <th 
                        className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        OTC Medication
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Brand Name
                      </th>
                      <th 
                        className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Approval Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                    >
                      <td className="px-4 py-4 text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Acetaminophen
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Tylenol
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-green-100 text-green-800">
                          Approved
                        </span>
                      </td>
                    </tr>
                    <tr 
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                    >
                      <td className="px-4 py-4 text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Diphenhydramine
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Benadryl
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-green-100 text-green-800">
                          Approved
                        </span>
                      </td>
                    </tr>
                    <tr 
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                    >
                      <td className="px-4 py-4 text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Ibuprofen
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Advil
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-green-100 text-green-800">
                          Approved
                        </span>
                      </td>
                    </tr>
                    <tr 
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                    >
                      <td className="px-4 py-4 text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Guaifenesin Oral Solution
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Cough Medicine (Non-DM only)
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">
                          Not Approved
                        </span>
                      </td>
                    </tr>
                    <tr 
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                    >
                      <td className="px-4 py-4 text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Oral Anesthetic
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Cough Drops
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-green-100 text-green-800">
                          Approved
                        </span>
                      </td>
                    </tr>
                    <tr 
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                    >
                      <td className="px-4 py-4 text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Bismuth Subsalicylate
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Pepto Bismol
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">
                          Not Approved
                        </span>
                      </td>
                    </tr>
                    <tr 
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                    >
                      <td className="px-4 py-4 text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Calcium Carbonate Antacid
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Tums
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-green-100 text-green-800">
                          Approved
                        </span>
                      </td>
                    </tr>
                    <tr 
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                    >
                      <td className="px-4 py-4 text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Naproxen/Naproxen Sodium
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Aleve
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">
                          Not Approved
                        </span>
                      </td>
                    </tr>
                    <tr 
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                    >
                      <td className="px-4 py-4 text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Antibiotic Ointment
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Bacitracin/Neomycin/Polymyxin (Neosporin)
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-green-100 text-green-800">
                          Approved
                        </span>
                      </td>
                    </tr>
                    <tr 
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                    >
                      <td className="px-4 py-4 text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Hydrocortisone 1%
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Hydrocortisone 1%
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-green-100 text-green-800">
                          Approved
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Informational Message */}
            <div className="mt-3 flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: '#f3f2f2' }}>
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#706e6b' }} />
              <p className="text-[12px]" style={{ color: '#3e3e3c' }}>
                Approval status is determined by the active Standard OTC consent. To modify approvals, renew or create a new consent below.
              </p>
            </div>
          </div>

          {/* Section Divider */}
          <div className="border-t-2" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}></div>

          {/* AC1: Bottom Section - Standard OTC Consent History List */}
          <div>
            <div className="mb-4">
              <h3 className="text-[15px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                Standard OTC Consent History
              </h3>
              <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                All Standard OTC consent records for this youth
              </p>
            </div>

            {/* AC6-17: Standard OTC Consent History List */}
            <div 
              className="rounded-lg overflow-hidden"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr 
                      style={{ 
                        backgroundColor: 'var(--slds-g-color-background-alt)',
                        borderBottom: '2px solid var(--slds-g-color-border-base-1)'
                      }}
                    >
                      <th 
                        className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Status
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Start Date
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        End Date
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Executed Date
                      </th>
                      <th 
                        className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                    >
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => console.log('Navigate to consent detail: consent-001')}
                          className="text-[13px] font-medium hover:underline"
                          style={{ color: '#0176d3' }}
                        >
                          Jan 15, 2024
                        </button>
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Jan 14, 2025
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Jan 12, 2024
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            className="hover:opacity-70 transition-opacity"
                            style={{ color: '#0176d3' }}
                            onClick={() => window.open('#', '_blank')}
                            title="View Consent Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="hover:opacity-70 transition-opacity"
                            style={{ color: '#145F33' }}
                            onClick={() => console.log('Initiating renewal for consent: consent-001')}
                            title="Copy (Renew Consent)"
                          >
                            <svg 
                              className="w-4 h-4" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr 
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                    >
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">
                          Expired
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => console.log('Navigate to consent detail: consent-002')}
                          className="text-[13px] font-medium hover:underline"
                          style={{ color: '#0176d3' }}
                        >
                          Jan 20, 2023
                        </button>
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Jan 14, 2024
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Jan 18, 2023
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            className="hover:opacity-70 transition-opacity"
                            style={{ color: '#0176d3' }}
                            onClick={() => window.open('#', '_blank')}
                            title="View Consent Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="hover:opacity-70 transition-opacity"
                            style={{ color: '#145F33' }}
                            onClick={() => console.log('Initiating renewal for consent: consent-002')}
                            title="Copy (Renew Consent)"
                          >
                            <svg 
                              className="w-4 h-4" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr 
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                    >
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">
                          Expired
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => console.log('Navigate to consent detail: consent-003')}
                          className="text-[13px] font-medium hover:underline"
                          style={{ color: '#0176d3' }}
                        >
                          Feb 10, 2022
                        </button>
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Jan 19, 2023
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Feb 8, 2022
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            className="hover:opacity-70 transition-opacity"
                            style={{ color: '#0176d3' }}
                            onClick={() => window.open('#', '_blank')}
                            title="View Consent Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="hover:opacity-70 transition-opacity"
                            style={{ color: '#145F33' }}
                            onClick={() => console.log('Initiating renewal for consent: consent-003')}
                            title="Copy (Renew Consent)"
                          >
                            <svg 
                              className="w-4 h-4" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* AC16-17: Informational Message */}
            <div className="mt-3 flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: '#f3f2f2' }}>
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#706e6b' }} />
              <p className="text-[12px]" style={{ color: '#3e3e3c' }}>
                All consent records are retained for historical reference and cannot be deleted. Use the Copy action to renew or replace an existing consent.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pack Meds View */}
      {activeSubTab === "packmeds" && (
        <PackMedsView />
      )}

      {/* Count View */}
      {activeSubTab === "count" && (
        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full text-[13px] px-4"
              style={{
                borderColor: 'var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              onClick={() => setDisposalDialogOpen(true)}
            >
              <Archive className="w-4 h-4 mr-2" />
              Disposal
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full text-[13px] px-4"
              style={{
                borderColor: 'var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              onClick={() => setRestockDialogOpen(true)}
            >
              <PackagePlus className="w-4 h-4 mr-2" />
              Restock
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full text-[13px] px-4"
              style={{
                borderColor: 'var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              onClick={() => setTransitionDialogOpen(true)}
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Transition
            </Button>
          </div>

          {/* Medication Count Table */}
          <div 
            className="rounded-lg overflow-hidden"
            style={{
              border: '1px solid var(--slds-g-color-border-base-1)',
              backgroundColor: 'var(--slds-g-color-background-base)'
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr 
                    style={{ 
                      backgroundColor: 'var(--slds-g-color-background-alt)',
                      borderBottom: '2px solid var(--slds-g-color-border-base-1)'
                    }}
                  >
                    <th 
                      className="px-4 py-3 text-left text-[12px] font-semibold"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      Dose Period
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-[12px] font-semibold"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      Medication / Dose
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-[12px] font-semibold"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      Count Type
                    </th>
                    <th 
                      className="px-4 py-3 text-center text-[12px] font-semibold"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      Last Count
                    </th>
                    <th 
                      className="px-4 py-3 text-center text-[12px] font-semibold"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      Current Count
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-[12px] font-semibold"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      Comments
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {medicationCounts.map((med) => (
                    <tr 
                      key={med.id}
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                    >
                      <td className="px-4 py-3">
                        <div 
                          className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-medium"
                          style={{
                            backgroundColor: med.dosePeriod === "Morning" ? '#FFF4E6' : 
                                           med.dosePeriod === "Bedtime" ? '#E6F0FF' : 
                                           '#F3F4F6',
                            color: med.dosePeriod === "Morning" ? '#C05621' : 
                                   med.dosePeriod === "Bedtime" ? '#1E40AF' : 
                                   '#374151'
                          }}
                        >
                          {med.dosePeriod}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            {med.medication}
                          </span>
                          <span className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            {med.dose}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={med.countType}
                          onValueChange={(value) => handleCountTypeUpdate(med.id, value)}
                        >
                          <SelectTrigger 
                            className="h-8 w-32 text-[12px]"
                            style={{ borderColor: 'var(--slds-g-color-border-base-4)' }}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Volume">Volume</SelectItem>
                            <SelectItem value="Units">Units</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          {med.lastCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span 
                          className="inline-flex items-center justify-center w-10 h-10 rounded-full text-[13px] font-bold"
                          style={{
                            backgroundColor: med.currentCount < med.lastCount * 0.3 ? '#FEE2E2' : '#DCFCE7',
                            color: med.currentCount < med.lastCount * 0.3 ? '#991B1B' : '#15803D'
                          }}
                        >
                          {med.currentCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        {med.comments}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Log View */}
      {activeSubTab === "log" && (
        <div 
          className="rounded-lg overflow-hidden"
          style={{
            border: '1px solid var(--slds-g-color-border-base-1)',
            backgroundColor: 'var(--slds-g-color-background-base)'
          }}
        >
          {/* Header with Action Buttons */}
          <div 
            className="px-4 py-3 flex items-center justify-between"
            style={{
              borderBottom: '1px solid var(--slds-g-color-border-base-1)',
              backgroundColor: 'var(--slds-g-color-background-alt)'
            }}
          >
            <h3 className="text-[13px] font-semibold text-[#080707]">Medication Log</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-full text-[13px] px-3"
                style={{
                  borderColor: 'var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
                onClick={handleViewSelected}
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-full text-[13px] px-3"
                style={{
                  borderColor: 'var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
                onClick={handleRefreshLogs}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-full text-[13px] px-3"
                style={{
                  borderColor: 'var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
                onClick={handlePrintLogs}
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-full text-[13px] px-3"
                style={{
                  borderColor: 'var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
                onClick={handleAttestation}
              >
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Attestation
              </Button>
              <Select>
                <SelectTrigger className="h-8 rounded-full text-[13px] px-3 w-[100px]">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Logs</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="h-8 rounded-full text-[13px] px-3 w-[110px]">
                  <SelectValue placeholder="General" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="export">Export Data</SelectItem>
                  <SelectItem value="filter">Advanced Filter</SelectItem>
                  <SelectItem value="archive">Archive Logs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr 
                  style={{ 
                    backgroundColor: 'var(--slds-g-color-background-alt)',
                    borderBottom: '2px solid var(--slds-g-color-border-base-1)'
                  }}
                >
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedLogs.length === medicationLogs.length}
                      onChange={toggleSelectAllLogs}
                      className="rounded border-gray-300"
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th className="px-2 py-3 w-8"></th>
                  <th 
                    className="px-3 py-3 text-left text-[11px] font-semibold whitespace-nowrap"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Dose Date
                  </th>
                  <th 
                    className="px-3 py-3 text-left text-[11px] font-semibold whitespace-nowrap"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Dose Period
                  </th>
                  <th 
                    className="px-3 py-3 text-center text-[11px] font-semibold whitespace-nowrap"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Inst
                  </th>
                  <th 
                    className="px-3 py-3 text-center text-[11px] font-semibold whitespace-nowrap"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Seq
                  </th>
                  <th 
                    className="px-3 py-3 text-left text-[11px] font-semibold whitespace-nowrap"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Log Type
                  </th>
                  <th 
                    className="px-3 py-3 text-center text-[11px] font-semibold whitespace-nowrap"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    #
                  </th>
                  <th 
                    className="px-3 py-3 text-center text-[11px] font-semibold whitespace-nowrap"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Primary Code
                  </th>
                  <th 
                    className="px-3 py-3 text-center text-[11px] font-semibold whitespace-nowrap"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Secondary Code
                  </th>
                  <th 
                    className="px-3 py-3 text-left text-[11px] font-semibold whitespace-nowrap"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Attestation Date
                  </th>
                  <th 
                    className="px-3 py-3 text-left text-[11px] font-semibold whitespace-nowrap"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Attestation Staff
                  </th>
                  <th 
                    className="px-3 py-3 text-left text-[11px] font-semibold whitespace-nowrap"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Medication / Dose
                  </th>
                </tr>
              </thead>
              <tbody>
                {medicationLogs.map((log) => (
                  <Fragment key={log.id}>
                    <tr 
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{ 
                        borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                        backgroundColor: selectedLogs.includes(log.id) ? '#F0F7FF' : 'transparent'
                      }}
                    >
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selectedLogs.includes(log.id)}
                          onChange={() => toggleLogSelection(log.id)}
                          className="rounded border-gray-300"
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <button
                          onClick={() => toggleLogRow(log.id)}
                          className="hover:bg-gray-100 rounded p-1 transition-colors"
                        >
                          {expandedLogRows.has(log.id) ? (
                            <ChevronDown className="w-4 h-4" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                          ) : (
                            <ChevronRight className="w-4 h-4" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-3 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        {log.doseDate}
                      </td>
                      <td className="px-3 py-3">
                        <div 
                          className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-medium"
                          style={{
                            backgroundColor: log.dosePeriod === "Morning" ? '#FFF4E6' : 
                                           log.dosePeriod === "Afternoon" ? '#FEF3C7' :
                                           log.dosePeriod === "Bedtime" ? '#E6F0FF' : 
                                           '#F3F4F6',
                            color: log.dosePeriod === "Morning" ? '#C05621' :
                                   log.dosePeriod === "Afternoon" ? '#A16207' : 
                                   log.dosePeriod === "Bedtime" ? '#1E40AF' : 
                                   '#374151'
                          }}
                        >
                          {log.dosePeriod}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        {log.inst}
                      </td>
                      <td className="px-3 py-3 text-center text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        {log.seq}
                      </td>
                      <td className="px-3 py-3">
                        <div 
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium"
                          style={{
                            backgroundColor: log.logType.includes("OTC") ? '#FEF3C7' :
                                           log.logType.includes("Prescription") ? '#DCFCE7' :
                                           log.logType === "Count" ? '#E0E7FF' :
                                           log.logType === "Restock" ? '#FCE7F3' :
                                           log.logType === "Disposal" ? '#FEE2E2' :
                                           '#F3F4F6',
                            color: log.logType.includes("OTC") ? '#A16207' :
                                   log.logType.includes("Prescription") ? '#15803D' :
                                   log.logType === "Count" ? '#3730A3' :
                                   log.logType === "Restock" ? '#9F1239' :
                                   log.logType === "Disposal" ? '#991B1B' :
                                   '#374151'
                          }}
                        >
                          {log.logType}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        {log.number}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div 
                          className="inline-flex items-center px-2 py-1 rounded text-[11px] font-mono font-semibold"
                          style={{
                            backgroundColor: '#F3F4F6',
                            color: '#374151'
                          }}
                        >
                          {log.primaryCode}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div 
                          className="inline-flex items-center px-2 py-1 rounded text-[11px] font-mono font-semibold"
                          style={{
                            backgroundColor: '#F3F4F6',
                            color: '#374151'
                          }}
                        >
                          {log.secondaryCode}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[12px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        {log.attestationDate}
                      </td>
                      <td className="px-3 py-3 text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        {log.attestationStaff}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            {log.medication}
                          </span>
                          <span className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            {log.dose}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {expandedLogRows.has(log.id) && log.details && (
                      <tr style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                        <td colSpan={13} className="px-3 py-3" style={{ backgroundColor: '#FAFAF9' }}>
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 mt-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                            <div>
                              <p className="text-[11px] font-semibold uppercase mb-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                Details
                              </p>
                              <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                {log.details}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Overview View */}
      {activeSubTab === "overview" && (
        <>
          {/* Toolbar — read-only summary header with refresh (AC1, AC12) */}
          <div className="flex items-center justify-between mb-3">
            <p className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Read-only summary of active medications for today's date
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshOverview}
              disabled={isRefreshingOverview}
              className="h-8 px-3 gap-1.5 rounded-full slds-text-3"
              style={{ borderColor: 'var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isRefreshingOverview && "animate-spin")} />
              {isRefreshingOverview ? "Refreshing…" : "Refresh"}
            </Button>
          </div>

        <MedicationOverviewSections
          activeMedications={activeMedications}
          otcConsents={otcConsents}
        />
        </>
      )}

      {/* Web Portal View */}
      {activeSubTab === "webportal" && (
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
              borderBottom: '1px solid var(--slds-g-color-border-base-1)',
              backgroundColor: 'var(--slds-g-color-background-alt)'
            }}
          >
            <h3 className="text-[13px] font-semibold text-[#080707]">Web Portal Access</h3>
          </div>
          <div className="p-4">
            <div className="text-center py-8" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              <Globe className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-[13px]">External portal integration and access management</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit OTC Authorization Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit OTC Authorization</DialogTitle>
            <DialogDescription>
              Update the details of the OTC authorization.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) => setEditForm({ ...editForm, status: value as "Approved" | "Not Approved" })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Not Approved">Not Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="medicationBrand">Brand</Label>
              <Input
                id="medicationBrand"
                value={editForm.medicationBrand}
                onChange={(e) => setEditForm({ ...editForm, medicationBrand: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="medicationGeneric">Generic</Label>
              <Input
                id="medicationGeneric"
                value={editForm.medicationGeneric}
                onChange={(e) => setEditForm({ ...editForm, medicationGeneric: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="otcCode">OTC Code</Label>
              <Input
                id="otcCode"
                value={editForm.otcCode}
                onChange={(e) => setEditForm({ ...editForm, otcCode: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveEdit}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete OTC Authorization Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Remove OTC Authorization</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this OTC authorization?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add OTCs from Blueprint Dialog */}
      <Dialog open={addOTCDialogOpen} onOpenChange={setAddOTCDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add OTC Medications</DialogTitle>
            <DialogDescription>
              Select medications from Blueprint SQL to authorize or restrict. Use checkboxes to select multiple medications.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {/* Search Box */}
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Search medications by brand, generic name, or code..."
                value={otcPicklistSearchTerm}
                onChange={(e) => setOtcPicklistSearchTerm(e.target.value)}
                className="h-9 text-[13px]"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              />
            </div>

            {/* Multi-select List */}
            <div 
              className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
              {getFilteredBlueprintOTCs().map(med => (
                <div 
                  key={med.id}
                  className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                  onClick={() => toggleOTCSelection(med.id)}
                >
                  <Checkbox
                    checked={selectedOTCIds.includes(med.id)}
                    onCheckedChange={() => toggleOTCSelection(med.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-[#080707]">
                        {med.medicationBrand}
                      </span>
                      <span 
                        className="text-[12px] mt-0.5"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        {med.medicationGeneric}
                      </span>
                    </div>
                  </div>
                  <span 
                    className="text-[12px] font-medium"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                  >
                    {med.otcCode}
                  </span>
                </div>
              ))}
              {getFilteredBlueprintOTCs().length === 0 && (
                <div className="p-8 text-center text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  No medications found matching your search.
                </div>
              )}
            </div>

            {/* Selected Count */}
            {selectedOTCIds.length > 0 && (
              <div className="mt-3 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                <span className="font-semibold">{selectedOTCIds.length}</span> medication{selectedOTCIds.length > 1 ? 's' : ''} selected
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAddOTCDialogOpen(false);
                setSelectedOTCIds([]);
                setOtcPicklistSearchTerm("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddOTCsFromBlueprint}
              className="gap-2"
              style={{
                backgroundColor: '#145F33',
                color: 'white'
              }}
            >
              <Plus className="w-4 h-4" />
              Add Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disposal Dialog */}
      <Dialog open={disposalDialogOpen} onOpenChange={setDisposalDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Medication Disposal</DialogTitle>
            <DialogDescription>
              Record medication disposal information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="disposal-medication">Medication</Label>
              <Select
                value={disposalForm.medication}
                onValueChange={(value) => setDisposalForm({ ...disposalForm, medication: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select medication" />
                </SelectTrigger>
                <SelectContent>
                  {medicationCounts.map((med) => (
                    <SelectItem key={med.id} value={med.medication}>
                      {med.medication} - {med.dose}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="disposal-quantity">Quantity</Label>
              <Input
                id="disposal-quantity"
                type="number"
                value={disposalForm.quantity}
                onChange={(e) => setDisposalForm({ ...disposalForm, quantity: e.target.value })}
                className="col-span-3"
                placeholder="Enter quantity"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="disposal-reason">Reason</Label>
              <Select
                value={disposalForm.reason}
                onValueChange={(value) => setDisposalForm({ ...disposalForm, reason: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                  <SelectItem value="patient-request">Patient Request</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="disposal-notes">Notes</Label>
              <Textarea
                id="disposal-notes"
                value={disposalForm.notes}
                onChange={(e) => setDisposalForm({ ...disposalForm, notes: e.target.value })}
                className="col-span-3"
                placeholder="Additional notes (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDisposalDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDisposal}
            >
              Record Disposal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={restockDialogOpen} onOpenChange={setRestockDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Medication Restock</DialogTitle>
            <DialogDescription>
              Record medication restock information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="restock-medication">Medication</Label>
              <Select
                value={restockForm.medication}
                onValueChange={(value) => setRestockForm({ ...restockForm, medication: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select medication" />
                </SelectTrigger>
                <SelectContent>
                  {medicationCounts.map((med) => (
                    <SelectItem key={med.id} value={med.medication}>
                      {med.medication} - {med.dose}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="restock-quantity">Quantity</Label>
              <Input
                id="restock-quantity"
                type="number"
                value={restockForm.quantity}
                onChange={(e) => setRestockForm({ ...restockForm, quantity: e.target.value })}
                className="col-span-3"
                placeholder="Enter quantity"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="restock-supplier">Supplier</Label>
              <Input
                id="restock-supplier"
                value={restockForm.supplier}
                onChange={(e) => setRestockForm({ ...restockForm, supplier: e.target.value })}
                className="col-span-3"
                placeholder="Enter supplier name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="restock-notes">Notes</Label>
              <Textarea
                id="restock-notes"
                value={restockForm.notes}
                onChange={(e) => setRestockForm({ ...restockForm, notes: e.target.value })}
                className="col-span-3"
                placeholder="Additional notes (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRestockDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRestock}
            >
              Record Restock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transition Dialog */}
      <Dialog open={transitionDialogOpen} onOpenChange={setTransitionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Medication Transition</DialogTitle>
            <DialogDescription>
              Transfer medication between locations.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transition-medication">Medication</Label>
              <Select
                value={transitionForm.medication}
                onValueChange={(value) => setTransitionForm({ ...transitionForm, medication: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select medication" />
                </SelectTrigger>
                <SelectContent>
                  {medicationCounts.map((med) => (
                    <SelectItem key={med.id} value={med.medication}>
                      {med.medication} - {med.dose}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transition-from">From Location</Label>
              <Select
                value={transitionForm.fromLocation}
                onValueChange={(value) => setTransitionForm({ ...transitionForm, fromLocation: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main-pharmacy">Main Pharmacy</SelectItem>
                  <SelectItem value="building-a">Building A</SelectItem>
                  <SelectItem value="building-b">Building B</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transition-to">To Location</Label>
              <Select
                value={transitionForm.toLocation}
                onValueChange={(value) => setTransitionForm({ ...transitionForm, toLocation: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main-pharmacy">Main Pharmacy</SelectItem>
                  <SelectItem value="building-a">Building A</SelectItem>
                  <SelectItem value="building-b">Building B</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transition-quantity">Quantity</Label>
              <Input
                id="transition-quantity"
                type="number"
                value={transitionForm.quantity}
                onChange={(e) => setTransitionForm({ ...transitionForm, quantity: e.target.value })}
                className="col-span-3"
                placeholder="Enter quantity"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transition-notes">Notes</Label>
              <Textarea
                id="transition-notes"
                value={transitionForm.notes}
                onChange={(e) => setTransitionForm({ ...transitionForm, notes: e.target.value })}
                className="col-span-3"
                placeholder="Additional notes (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTransitionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleTransition}
            >
              Complete Transition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attestation Dialog */}
      <Dialog open={attestationDialogOpen} onOpenChange={setAttestationDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Attest Medication Logs</DialogTitle>
            <DialogDescription>
              Confirm attestation for {selectedLogs.length} selected log {selectedLogs.length === 1 ? 'entry' : 'entries'}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg p-4" style={{ backgroundColor: '#F0F7FF', border: '1px solid #BFDBFE' }}>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 mt-0.5" style={{ color: '#145F33' }} />
                <div>
                  <p className="text-[13px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Attestation Confirmation
                  </p>
                  <p className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    By attesting, you confirm that you have reviewed and verified the accuracy of the selected medication log {selectedLogs.length === 1 ? 'entry' : 'entries'}. This action will be recorded with your name and timestamp.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAttestationDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmAttestation}
              style={{ backgroundColor: '#145F33' }}
              className="hover:opacity-90"
            >
              Confirm Attestation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OTC Dispensation Modal */}
      <OTCDispensationModal
        open={dispensationModalOpen}
        onOpenChange={setDispensationModalOpen}
        youthName="Fozzie Bear"
        consents={otcConsents}
        onDispensationRecorded={handleDispensationRecorded}
        futureDateLimit={futureDateLimit}
      />
    </div>
  );
}