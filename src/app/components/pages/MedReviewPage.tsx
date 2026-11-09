import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Printer, ClipboardList, Plus, Sunrise, Sun, Sunset, Moon, FileText, Info, ChevronRight, User } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// Mock data for medication logs
const MOCK_MED_LOGS = [
  {
    id: 1,
    youth: "Fozzie Bear",
    youthInitials: "FB",
    medication: "Adderall XR",
    dose: "20mg",
    dosingPeriod: "Morning",
    logType: "Dispensation",
    lastCount: 120,
    qty: 1,
    count: 119,
    countType: "Bottle",
    comments: "",
    attestationStaff: "John Smith",
    attestationStaffInitials: "JS",
    attestationDate: "12/16/2024",
    package: "Bottle #A123"
  },
  {
    id: 2,
    youth: "Kermit the Frog",
    youthInitials: "KF",
    medication: "Zoloft",
    dose: "50mg",
    dosingPeriod: "Morning",
    logType: "Dispensation",
    lastCount: 90,
    qty: 1,
    count: 89,
    countType: "Bottle",
    comments: "",
    attestationStaff: "John Smith",
    attestationStaffInitials: "JS",
    attestationDate: "12/16/2024",
    package: "Bottle #B456"
  },
  {
    id: 3,
    youth: "Red Fraggle",
    youthInitials: "RF",
    medication: "Risperidone",
    dose: "2mg",
    dosingPeriod: "Morning",
    logType: "Dispensation",
    lastCount: 60,
    qty: 1,
    count: 59,
    countType: "Bottle",
    comments: "",
    attestationStaff: "John Smith",
    attestationStaffInitials: "JS",
    attestationDate: "12/16/2024",
    package: "Bottle #C789"
  },
  {
    id: 4,
    youth: "Red Fraggle",
    youthInitials: "RF",
    medication: "Prozac",
    dose: "20mg",
    dosingPeriod: "Morning",
    logType: "Dispensation",
    lastCount: 75,
    qty: 1,
    count: 74,
    countType: "Bottle",
    comments: "",
    attestationStaff: "John Smith",
    attestationStaffInitials: "JS",
    attestationDate: "12/16/2024",
    package: "Bottle #D012"
  },
  {
    id: 5,
    youth: "Animal",
    youthInitials: "AN",
    medication: "Concerta",
    dose: "36mg",
    dosingPeriod: "Morning",
    logType: "Dispensation",
    lastCount: 45,
    qty: 1,
    count: 44,
    countType: "Bottle",
    comments: "",
    attestationStaff: "Jane Doe",
    attestationStaffInitials: "JD",
    attestationDate: "12/16/2024",
    package: "Bottle #E345"
  },
  {
    id: 6,
    youth: "Kermit the Frog",
    youthInitials: "KF",
    medication: "Clonidine",
    dose: "0.1mg",
    dosingPeriod: "Evening",
    logType: "Count",
    lastCount: 100,
    qty: 0,
    count: 100,
    countType: "Bottle",
    comments: "Weekly count",
    attestationStaff: "Sarah Johnson",
    attestationStaffInitials: "SJ",
    attestationDate: "12/15/2024",
    package: "Bottle #F678"
  },
  {
    id: 7,
    youth: "Red Fraggle",
    youthInitials: "RF",
    medication: "Trazodone",
    dose: "50mg",
    dosingPeriod: "Bedtime",
    logType: "Dispensation",
    lastCount: 30,
    qty: 1,
    count: 29,
    countType: "Bottle",
    comments: "",
    attestationStaff: "Mike Wilson",
    attestationStaffInitials: "MW",
    attestationDate: "12/15/2024",
    package: "Bottle #G901"
  },
  {
    id: 8,
    youth: "Fozzie Bear",
    youthInitials: "FB",
    medication: "Melatonin",
    dose: "5mg",
    dosingPeriod: "Bedtime",
    logType: "Dispensation",
    lastCount: 200,
    qty: 1,
    count: 199,
    countType: "Bottle",
    comments: "",
    attestationStaff: "Sarah Chen",
    attestationStaffInitials: "SC",
    attestationDate: "12/15/2024",
    package: "Bottle #H234"
  }
];

// Mock historical data
const MOCK_MED_HISTORY = [
  {
    id: 101,
    youth: "Fozzie Bear",
    youthInitials: "FB",
    medication: "Adderall XR",
    dose: "20mg",
    dosingPeriod: "Morning",
    logType: "Administered",
    count: 1,
    countType: "Full Dose",
    comments: "",
    attestationStaff: "John Smith",
    attestationDate: "12/15/2024 8:00 AM",
    package: "Bottle A-12"
  },
  {
    id: 102,
    youth: "Kermit the Frog",
    youthInitials: "KF",
    medication: "Zoloft",
    dose: "50mg",
    dosingPeriod: "Morning",
    logType: "Administered",
    count: 1,
    countType: "Full Dose",
    comments: "",
    attestationStaff: "John Smith",
    attestationDate: "12/15/2024 7:30 AM",
    package: "Bottle B-05"
  },
  {
    id: 103,
    youth: "Animal",
    youthInitials: "AN",
    medication: "Melatonin",
    dose: "3mg",
    dosingPeriod: "Bedtime",
    logType: "Partial",
    count: 0.5,
    countType: "Half Dose",
    comments: "Youth requested lower dose due to grogginess",
    attestationStaff: "Sarah Johnson",
    attestationDate: "12/14/2024 9:00 PM",
    package: "Bottle D-09"
  }
];

// Medication information data for tooltips
const MED_INFO = {
  otc: {
    ibuprofen: {
      youth: "General Stock",
      dose: "200mg tablets",
      dosingPeriod: "As Needed",
      logType: "OTC",
      count: "100 tablets",
      dispensedBy: "Pharmacy Staff",
      lastChecked: "12/10/2024",
      package: "Bottle OTC-01",
      notes: "For pain and fever relief"
    },
    acetaminophen: {
      youth: "General Stock",
      dose: "325mg tablets",
      dosingPeriod: "As Needed",
      logType: "OTC",
      count: "120 tablets",
      dispensedBy: "Pharmacy Staff",
      lastChecked: "12/08/2024",
      package: "Bottle OTC-02",
      notes: "For pain and fever relief"
    },
    diphenhydramine: {
      youth: "General Stock",
      dose: "25mg capsules",
      dosingPeriod: "Bedtime / As Needed",
      logType: "OTC",
      count: "50 capsules",
      dispensedBy: "Pharmacy Staff",
      lastChecked: "12/12/2024",
      package: "Bottle OTC-03",
      notes: "For allergies and sleep aid"
    },
    loratadine: {
      youth: "General Stock",
      dose: "10mg tablets",
      dosingPeriod: "Morning",
      logType: "OTC",
      count: "30 tablets",
      dispensedBy: "Pharmacy Staff",
      lastChecked: "12/05/2024",
      package: "Bottle OTC-04",
      notes: "For seasonal allergies"
    },
    omeprazole: {
      youth: "General Stock",
      dose: "20mg capsules",
      dosingPeriod: "Morning",
      logType: "OTC",
      count: "42 capsules",
      dispensedBy: "Pharmacy Staff",
      lastChecked: "12/11/2024",
      package: "Bottle OTC-05",
      notes: "For acid reflux"
    },
    multivitamin: {
      youth: "General Stock",
      dose: "1 tablet daily",
      dosingPeriod: "Morning",
      logType: "OTC",
      count: "90 tablets",
      dispensedBy: "Pharmacy Staff",
      lastChecked: "12/14/2024",
      package: "Bottle OTC-06",
      notes: "Daily nutritional supplement"
    }
  },
  firstAid: {
    bandages: {
      youth: "General Stock",
      dose: "Assorted sizes",
      dosingPeriod: "As Needed",
      logType: "First Aid",
      count: "100 pieces",
      dispensedBy: "Medical Staff",
      lastChecked: "12/09/2024",
      package: "Box FA-01",
      notes: "Various adhesive bandages"
    },
    gauze: {
      youth: "General Stock",
      dose: "4x4 pads",
      dosingPeriod: "As Needed",
      logType: "First Aid",
      count: "50 pads",
      dispensedBy: "Medical Staff",
      lastChecked: "12/07/2024",
      package: "Box FA-02",
      notes: "Sterile gauze pads"
    },
    antisepticWipes: {
      youth: "General Stock",
      dose: "Individual packets",
      dosingPeriod: "As Needed",
      logType: "First Aid",
      count: "200 packets",
      dispensedBy: "Medical Staff",
      lastChecked: "12/13/2024",
      package: "Box FA-03",
      notes: "Alcohol-based antiseptic"
    },
    hydrogenPeroxide: {
      youth: "General Stock",
      dose: "3% solution",
      dosingPeriod: "As Needed",
      logType: "First Aid",
      count: "16 oz bottle",
      dispensedBy: "Medical Staff",
      lastChecked: "12/06/2024",
      package: "Bottle FA-04",
      notes: "For wound cleaning"
    },
    adhesiveTape: {
      youth: "General Stock",
      dose: "1 inch width",
      dosingPeriod: "As Needed",
      logType: "First Aid",
      count: "3 rolls",
      dispensedBy: "Medical Staff",
      lastChecked: "12/15/2024",
      package: "Box FA-05",
      notes: "Medical tape for bandaging"
    },
    gloves: {
      youth: "General Stock",
      dose: "Size M/L",
      dosingPeriod: "As Needed",
      logType: "First Aid",
      count: "100 pairs",
      dispensedBy: "Medical Staff",
      lastChecked: "12/10/2024",
      package: "Box FA-06",
      notes: "Disposable latex-free gloves"
    }
  }
};

export function MedReviewPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("view-logs");
  const [youthFilter, setYouthFilter] = useState("all");
  const [medicationFilter, setMedicationFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("all");

  // Med Cart Review State
  const [medCartData, setMedCartData] = useState({
    otc: {
      ibuprofen: { checked: true, expiryDate: "12/2025" },
      acetaminophen: { checked: true, expiryDate: "03/2026" },
      diphenhydramine: { checked: true, expiryDate: "06/2025" },
      loratadine: { checked: false, expiryDate: "" },
      omeprazole: { checked: true, expiryDate: "09/2025" },
      multivitamin: { checked: true, expiryDate: "01/2026" }
    },
    firstAid: {
      bandages: { checked: true, expiryDate: "N/A" },
      gauze: { checked: true, expiryDate: "N/A" },
      antisepticWipes: { checked: true, expiryDate: "08/2025" },
      hydrogenPeroxide: { checked: true, expiryDate: "11/2025" },
      adhesiveTape: { checked: true, expiryDate: "N/A" },
      gloves: { checked: true, expiryDate: "N/A" }
    }
  });

  const handleMedCartToggle = (category: 'otc' | 'firstAid', item: string) => {
    setMedCartData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: {
          ...prev[category][item],
          checked: !prev[category][item].checked
        }
      }
    }));
  };

  const handleExpiryDateChange = (category: 'otc' | 'firstAid', item: string, value: string) => {
    setMedCartData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: {
          ...prev[category][item],
          expiryDate: value
        }
      }
    }));
  };

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case "Morning":
        return Sunrise;
      case "Afternoon":
        return Sun;
      case "Evening":
        return Sunset;
      case "Bedtime":
        return Moon;
      default:
        return Sunrise;
    }
  };

  const getPeriodColor = (period: string) => {
    switch (period) {
      case "Morning":
        return "#FFA500";
      case "Afternoon":
        return "#2CAB2C";
      case "Evening":
        return "#FFFF49";
      case "Bedtime":
        return "#3333FF";
      default:
        return "#FFA500";
    }
  };

  // Filter logs
  const filteredLogs = MOCK_MED_LOGS.filter(log => {
    if (youthFilter !== "all" && log.youth !== youthFilter) return false;
    if (medicationFilter !== "all" && log.medication !== medicationFilter) return false;
    if (periodFilter !== "all" && log.dosingPeriod !== periodFilter) return false;
    if (statusFilter !== "all" && log.logType !== statusFilter) return false;
    
    // Apply Sort By filter for "Coded & Incomplete"
    if (sortBy === "complete" && log.medStatus !== "received") return false;
    if (sortBy === "incomplete" && log.medStatus !== "incomplete" && log.medStatus !== "coded") return false;
    
    return true;
  });

  // Filter history
  const filteredHistory = MOCK_MED_HISTORY.filter(log => {
    if (youthFilter !== "all" && log.youth !== youthFilter) return false;
    if (medicationFilter !== "all" && log.medication !== medicationFilter) return false;
    if (periodFilter !== "all" && log.dosingPeriod !== periodFilter) return false;
    if (statusFilter !== "all" && log.logType !== statusFilter) return false;
    return true;
  });

  const tabs = [
    { id: "view-logs", label: "Dispension" },
    { id: "counts", label: "Counts" },
    { id: "review-logs", label: "Review Logs" },
    { id: "med-cart", label: "Med Cart" }
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Page Header */}
      <div 
        className="px-6 py-4 border-b"
        style={{
          backgroundColor: 'var(--slds-g-color-background-base)',
          borderColor: 'var(--slds-g-color-border-base-1)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/medications')}
              className="h-8 w-8 p-0 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--color-brand-primary)]" />
                <h1 className="text-lg font-bold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  Medication Review
                </h1>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Review and manage medication logs and counts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full"
            >
              <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
              Count
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Create New Review Log
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {/* Tab Navigation */}
      <div 
        className="px-6 border-b"
        style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
      >
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]'
                  : 'border-transparent hover:border-gray-300'
              }`}
              style={{
                color: activeTab === tab.id ? 'var(--color-brand-primary)' : 'var(--slds-g-color-text-weak)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {activeTab === "view-logs" && (
          <div className="space-y-6">
            {/* Current Logs Table */}
            <div>
              <h3 className="text-[15px] font-semibold mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                Current Logs ({filteredLogs.length})
              </h3>
              <div 
                className="rounded-lg app-scroll-x border"
                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
              >
                <table className="w-full text-[12px]">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Constituent</th>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Dose</th>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Dosing Period</th>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Log Type</th>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Last Count</th>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Count</th>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Count Type</th>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Comments</th>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Attestation Staff</th>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Attestation Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => {
                      const PeriodIcon = getPeriodIcon(log.dosingPeriod);
                      const periodColor = getPeriodColor(log.dosingPeriod);
                      return (
                        <tr 
                          key={log.id}
                          className="border-t hover:bg-gray-50"
                          style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0"
                                style={{ backgroundColor: 'var(--color-brand-primary)' }}
                              >
                                {log.youthInitials}
                              </div>
                              <span>{log.youth}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2">{log.medication}</td>
                          <td className="px-3 py-2">{log.dose}</td>
                          <td className="px-3 py-2">
                            <Badge 
                              className="rounded-sm text-[11px]"
                              style={{ 
                                backgroundColor: `${periodColor}20`,
                                color: log.dosingPeriod === "Evening" ? "#000" : periodColor,
                                border: `1px solid ${periodColor}`
                              }}
                            >
                              <PeriodIcon className="h-3 w-3 mr-1" />
                              {log.dosingPeriod}
                            </Badge>
                          </td>
                          <td className="px-3 py-2">
                            <Badge 
                              className="rounded-sm text-[11px]"
                              style={{
                                backgroundColor: log.logType === "Administered" 
                                  ? "#d1fae5" 
                                  : log.logType === "Refused"
                                  ? "#fee2e2"
                                  : "#fef3c7",
                                color: log.logType === "Administered" 
                                  ? "#065f46" 
                                  : log.logType === "Refused"
                                  ? "#991b1b"
                                  : "#92400e",
                                border: `1px solid ${
                                  log.logType === "Administered" 
                                    ? "#065f46" 
                                    : log.logType === "Refused"
                                    ? "#991b1b"
                                    : "#92400e"
                                }`
                              }}
                            >
                              {log.logType}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 font-semibold">{log.count}</td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              defaultValue={log.count}
                              className="h-8 w-[70px] rounded-md text-[12px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              style={{ borderColor: 'var(--slds-g-color-border-base-1)', MozAppearance: 'textfield' }}
                            />
                          </td>
                          <td className="px-3 py-2">{log.countType}</td>
                          <td className="px-3 py-2 max-w-[200px] truncate" title={log.comments}>
                            {log.comments || <span style={{ color: 'var(--slds-g-color-text-weak)' }}>—</span>}
                          </td>
                          <td className="px-3 py-2">{log.attestationStaff}</td>
                          <td className="px-3 py-2">{log.attestationDate}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredLogs.length === 0 && (
                  <div className="text-center py-8" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    No logs found matching the current filters
                  </div>
                )}
              </div>
            </div>

            {/* History Section */}
            <div>
              <h3 className="text-[15px] font-semibold mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                History ({filteredHistory.length})
              </h3>
              <div 
                className="rounded-lg app-scroll-x border"
                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
              >
                <table className="w-full text-[12px]">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Constituent</th>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Medication</th>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Dose</th>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Dosing Period</th>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Log Type</th>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Count</th>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Count Type</th>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Comments</th>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Attestation Staff</th>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Attestation Date</th>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Package</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((log) => {
                      const PeriodIcon = getPeriodIcon(log.dosingPeriod);
                      const periodColor = getPeriodColor(log.dosingPeriod);
                      return (
                        <tr 
                          key={log.id}
                          className="border-t hover:bg-gray-50"
                          style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        >
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0"
                                style={{ backgroundColor: 'var(--color-brand-primary)' }}
                              >
                                {log.youthInitials}
                              </div>
                              <span>{log.youth}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2">{log.medication}</td>
                          <td className="px-3 py-2">{log.dose}</td>
                          <td className="px-3 py-2">
                            <Badge 
                              className="rounded-sm text-[11px]"
                              style={{ 
                                backgroundColor: `${periodColor}20`,
                                color: log.dosingPeriod === "Evening" ? "#000" : periodColor,
                                border: `1px solid ${periodColor}`
                              }}
                            >
                              <PeriodIcon className="h-3 w-3 mr-1" />
                              {log.dosingPeriod}
                            </Badge>
                          </td>
                          <td className="px-3 py-2">
                            <Badge 
                              className="rounded-sm text-[11px]"
                              style={{
                                backgroundColor: log.logType === "Administered" 
                                  ? "#d1fae5" 
                                  : log.logType === "Refused"
                                  ? "#fee2e2"
                                  : "#fef3c7",
                                color: log.logType === "Administered" 
                                  ? "#065f46" 
                                  : log.logType === "Refused"
                                  ? "#991b1b"
                                  : "#92400e",
                                border: `1px solid ${
                                  log.logType === "Administered" 
                                    ? "#065f46" 
                                    : log.logType === "Refused"
                                    ? "#991b1b"
                                    : "#92400e"
                                }`
                              }}
                            >
                              {log.logType}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 font-semibold">{log.count}</td>
                          <td className="px-3 py-2">{log.countType}</td>
                          <td className="px-3 py-2 max-w-[200px] truncate" title={log.comments}>
                            {log.comments || <span style={{ color: 'var(--slds-g-color-text-weak)' }}>—</span>}
                          </td>
                          <td className="px-3 py-2">{log.attestationStaff}</td>
                          <td className="px-3 py-2">{log.attestationDate}</td>
                          <td className="px-3 py-2">{log.package}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredHistory.length === 0 && (
                  <div className="text-center py-8" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    No history found matching the current filters
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "med-cart" && (
          <div className="max-w-5xl">
            {/* Over The Counter Medication Section */}
            <div 
              className="rounded-lg border mb-6"
              style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
            >
              <div 
                className="px-5 py-3 border-b"
                style={{ 
                  borderColor: 'var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-alt)'
                }}
              >
                <h3 className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  Over The Counter Medication (Check Supply & Expiration Dates)
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  {/* Ibuprofen */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="ibuprofen" className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          Ibuprofen
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="cursor-pointer">
                                <Info className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent 
                              className="w-[320px] bg-white border shadow-lg p-0"
                              style={{ 
                                backgroundColor: '#ffffff',
                                borderColor: '#d8dde6',
                                color: '#000000'
                              }}
                              sideOffset={5}
                            >
                              <div className="p-4">
                                <p className="text-[14px] font-semibold mb-3 pb-2 border-b" style={{ color: '#000000', borderColor: '#e5e7eb' }}>
                                  Ibuprofen
                                </p>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Constituent:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.ibuprofen.youth}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dose:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.ibuprofen.dose}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dosing Period:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.ibuprofen.dosingPeriod}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Log Type:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.ibuprofen.logType}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Count:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.ibuprofen.count}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dispensed By:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.ibuprofen.dispensedBy}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Last Checked:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.ibuprofen.lastChecked}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Package:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.ibuprofen.package}</span>
                                  </div>
                                  <div className="pt-2 mt-2 border-t" style={{ borderColor: '#e5e7eb' }}>
                                    <span className="text-[12px] text-gray-600">Notes:</span>
                                    <p className="text-[12px] font-medium mt-1" style={{ color: '#000000' }}>{MED_INFO.otc.ibuprofen.notes}</p>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch
                        id="ibuprofen"
                        checked={medCartData.otc.ibuprofen.checked}
                        onCheckedChange={() => handleMedCartToggle('otc', 'ibuprofen')}
                      />
                    </div>
                    <Input
                      type="text"
                      placeholder="MM/YYYY"
                      value={medCartData.otc.ibuprofen.expiryDate}
                      onChange={(e) => handleExpiryDateChange('otc', 'ibuprofen', e.target.value)}
                      className="h-9 rounded-md text-[13px]"
                      style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                    />
                  </div>

                  {/* Acetaminophen */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="acetaminophen" className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          Acetaminophen
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="cursor-pointer">
                                <Info className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent 
                              className="w-[320px] bg-white border shadow-lg p-0"
                              style={{ 
                                backgroundColor: '#ffffff',
                                borderColor: '#d8dde6',
                                color: '#000000'
                              }}
                              sideOffset={5}
                            >
                              <div className="p-4">
                                <p className="text-[14px] font-semibold mb-3 pb-2 border-b" style={{ color: '#000000', borderColor: '#e5e7eb' }}>
                                  Acetaminophen
                                </p>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Constituent:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.acetaminophen.youth}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dose:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.acetaminophen.dose}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dosing Period:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.acetaminophen.dosingPeriod}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Log Type:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.acetaminophen.logType}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Count:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.acetaminophen.count}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dispensed By:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.acetaminophen.dispensedBy}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Last Checked:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.acetaminophen.lastChecked}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Package:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.acetaminophen.package}</span>
                                  </div>
                                  <div className="pt-2 mt-2 border-t" style={{ borderColor: '#e5e7eb' }}>
                                    <span className="text-[12px] text-gray-600">Notes:</span>
                                    <p className="text-[12px] font-medium mt-1" style={{ color: '#000000' }}>{MED_INFO.otc.acetaminophen.notes}</p>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch
                        id="acetaminophen"
                        checked={medCartData.otc.acetaminophen.checked}
                        onCheckedChange={() => handleMedCartToggle('otc', 'acetaminophen')}
                      />
                    </div>
                    <Input
                      type="text"
                      placeholder="MM/YYYY"
                      value={medCartData.otc.acetaminophen.expiryDate}
                      onChange={(e) => handleExpiryDateChange('otc', 'acetaminophen', e.target.value)}
                      className="h-9 rounded-md text-[13px]"
                      style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                    />
                  </div>

                  {/* Diphenhydramine */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="diphenhydramine" className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          Diphenhydramine
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="cursor-pointer">
                                <Info className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent 
                              className="w-[320px] bg-white border shadow-lg p-0"
                              style={{ 
                                backgroundColor: '#ffffff',
                                borderColor: '#d8dde6',
                                color: '#000000'
                              }}
                              sideOffset={5}
                            >
                              <div className="p-4">
                                <p className="text-[14px] font-semibold mb-3 pb-2 border-b" style={{ color: '#000000', borderColor: '#e5e7eb' }}>
                                  Diphenhydramine
                                </p>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Constituent:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.diphenhydramine.youth}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dose:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.diphenhydramine.dose}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dosing Period:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.diphenhydramine.dosingPeriod}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Log Type:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.diphenhydramine.logType}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Count:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.diphenhydramine.count}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dispensed By:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.diphenhydramine.dispensedBy}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Last Checked:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.diphenhydramine.lastChecked}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Package:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.diphenhydramine.package}</span>
                                  </div>
                                  <div className="pt-2 mt-2 border-t" style={{ borderColor: '#e5e7eb' }}>
                                    <span className="text-[12px] text-gray-600">Notes:</span>
                                    <p className="text-[12px] font-medium mt-1" style={{ color: '#000000' }}>{MED_INFO.otc.diphenhydramine.notes}</p>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch
                        id="diphenhydramine"
                        checked={medCartData.otc.diphenhydramine.checked}
                        onCheckedChange={() => handleMedCartToggle('otc', 'diphenhydramine')}
                      />
                    </div>
                    <Input
                      type="text"
                      placeholder="MM/YYYY"
                      value={medCartData.otc.diphenhydramine.expiryDate}
                      onChange={(e) => handleExpiryDateChange('otc', 'diphenhydramine', e.target.value)}
                      className="h-9 rounded-md text-[13px]"
                      style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                    />
                  </div>

                  {/* Loratadine */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="loratadine" className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          Loratadine
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="cursor-pointer">
                                <Info className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent 
                              className="w-[320px] bg-white border shadow-lg p-0"
                              style={{ 
                                backgroundColor: '#ffffff',
                                borderColor: '#d8dde6',
                                color: '#000000'
                              }}
                              sideOffset={5}
                            >
                              <div className="p-4">
                                <p className="text-[14px] font-semibold mb-3 pb-2 border-b" style={{ color: '#000000', borderColor: '#e5e7eb' }}>
                                  Loratadine
                                </p>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Constituent:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.loratadine.youth}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dose:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.loratadine.dose}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dosing Period:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.loratadine.dosingPeriod}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Log Type:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.loratadine.logType}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Count:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.loratadine.count}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dispensed By:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.loratadine.dispensedBy}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Last Checked:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.loratadine.lastChecked}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Package:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.loratadine.package}</span>
                                  </div>
                                  <div className="pt-2 mt-2 border-t" style={{ borderColor: '#e5e7eb' }}>
                                    <span className="text-[12px] text-gray-600">Notes:</span>
                                    <p className="text-[12px] font-medium mt-1" style={{ color: '#000000' }}>{MED_INFO.otc.loratadine.notes}</p>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch
                        id="loratadine"
                        checked={medCartData.otc.loratadine.checked}
                        onCheckedChange={() => handleMedCartToggle('otc', 'loratadine')}
                      />
                    </div>
                    <Input
                      type="text"
                      placeholder="MM/YYYY"
                      value={medCartData.otc.loratadine.expiryDate}
                      onChange={(e) => handleExpiryDateChange('otc', 'loratadine', e.target.value)}
                      className="h-9 rounded-md text-[13px]"
                      style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                    />
                  </div>

                  {/* Omeprazole */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="omeprazole" className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          Omeprazole
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="cursor-pointer">
                                <Info className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent 
                              className="w-[320px] bg-white border shadow-lg p-0"
                              style={{ 
                                backgroundColor: '#ffffff',
                                borderColor: '#d8dde6',
                                color: '#000000'
                              }}
                              sideOffset={5}
                            >
                              <div className="p-4">
                                <p className="text-[14px] font-semibold mb-3 pb-2 border-b" style={{ color: '#000000', borderColor: '#e5e7eb' }}>
                                  Omeprazole
                                </p>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Constituent:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.omeprazole.youth}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dose:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.omeprazole.dose}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dosing Period:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.omeprazole.dosingPeriod}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Log Type:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.omeprazole.logType}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Count:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.omeprazole.count}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dispensed By:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.omeprazole.dispensedBy}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Last Checked:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.omeprazole.lastChecked}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Package:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.omeprazole.package}</span>
                                  </div>
                                  <div className="pt-2 mt-2 border-t" style={{ borderColor: '#e5e7eb' }}>
                                    <span className="text-[12px] text-gray-600">Notes:</span>
                                    <p className="text-[12px] font-medium mt-1" style={{ color: '#000000' }}>{MED_INFO.otc.omeprazole.notes}</p>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch
                        id="omeprazole"
                        checked={medCartData.otc.omeprazole.checked}
                        onCheckedChange={() => handleMedCartToggle('otc', 'omeprazole')}
                      />
                    </div>
                    <Input
                      type="text"
                      placeholder="MM/YYYY"
                      value={medCartData.otc.omeprazole.expiryDate}
                      onChange={(e) => handleExpiryDateChange('otc', 'omeprazole', e.target.value)}
                      className="h-9 rounded-md text-[13px]"
                      style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                    />
                  </div>

                  {/* Multivitamin */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="multivitamin" className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          Multivitamin
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="cursor-pointer">
                                <Info className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent 
                              className="w-[320px] bg-white border shadow-lg p-0"
                              style={{ 
                                backgroundColor: '#ffffff',
                                borderColor: '#d8dde6',
                                color: '#000000'
                              }}
                              sideOffset={5}
                            >
                              <div className="p-4">
                                <p className="text-[14px] font-semibold mb-3 pb-2 border-b" style={{ color: '#000000', borderColor: '#e5e7eb' }}>
                                  Multivitamin
                                </p>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Constituent:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.multivitamin.youth}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dose:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.multivitamin.dose}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dosing Period:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.multivitamin.dosingPeriod}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Log Type:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.multivitamin.logType}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Count:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.multivitamin.count}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dispensed By:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.multivitamin.dispensedBy}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Last Checked:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.multivitamin.lastChecked}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Package:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.otc.multivitamin.package}</span>
                                  </div>
                                  <div className="pt-2 mt-2 border-t" style={{ borderColor: '#e5e7eb' }}>
                                    <span className="text-[12px] text-gray-600">Notes:</span>
                                    <p className="text-[12px] font-medium mt-1" style={{ color: '#000000' }}>{MED_INFO.otc.multivitamin.notes}</p>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch
                        id="multivitamin"
                        checked={medCartData.otc.multivitamin.checked}
                        onCheckedChange={() => handleMedCartToggle('otc', 'multivitamin')}
                      />
                    </div>
                    <Input
                      type="text"
                      placeholder="MM/YYYY"
                      value={medCartData.otc.multivitamin.expiryDate}
                      onChange={(e) => handleExpiryDateChange('otc', 'multivitamin', e.target.value)}
                      className="h-9 rounded-md text-[13px]"
                      style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* First Aid Section */}
            <div 
              className="rounded-lg border mb-6"
              style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
            >
              <div 
                className="px-5 py-3 border-b"
                style={{ 
                  borderColor: 'var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-alt)'
                }}
              >
                <h3 className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  First Aid (Check Supply & Expiration Dates)
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  {/* Bandages */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="bandages" className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          Bandages
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="cursor-pointer">
                                <Info className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent 
                              className="w-[320px] bg-white border shadow-lg p-0"
                              style={{ 
                                backgroundColor: '#ffffff',
                                borderColor: '#d8dde6',
                                color: '#000000'
                              }}
                              sideOffset={5}
                            >
                              <div className="p-4">
                                <p className="text-[14px] font-semibold mb-3 pb-2 border-b" style={{ color: '#000000', borderColor: '#e5e7eb' }}>
                                  Bandages
                                </p>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Constituent:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.bandages.youth}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dose:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.bandages.dose}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dosing Period:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.bandages.dosingPeriod}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Log Type:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.bandages.logType}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Count:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.bandages.count}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dispensed By:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.bandages.dispensedBy}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Last Checked:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.bandages.lastChecked}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Package:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.bandages.package}</span>
                                  </div>
                                  <div className="pt-2 mt-2 border-t" style={{ borderColor: '#e5e7eb' }}>
                                    <span className="text-[12px] text-gray-600">Notes:</span>
                                    <p className="text-[12px] font-medium mt-1" style={{ color: '#000000' }}>{MED_INFO.firstAid.bandages.notes}</p>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch
                        id="bandages"
                        checked={medCartData.firstAid.bandages.checked}
                        onCheckedChange={() => handleMedCartToggle('firstAid', 'bandages')}
                      />
                    </div>
                    <Input
                      type="text"
                      placeholder="MM/YYYY or N/A"
                      value={medCartData.firstAid.bandages.expiryDate}
                      onChange={(e) => handleExpiryDateChange('firstAid', 'bandages', e.target.value)}
                      className="h-9 rounded-md text-[13px]"
                      style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                    />
                  </div>

                  {/* Gauze */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="gauze" className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          Gauze
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="cursor-pointer">
                                <Info className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent 
                              className="w-[320px] bg-white border shadow-lg p-0"
                              style={{ 
                                backgroundColor: '#ffffff',
                                borderColor: '#d8dde6',
                                color: '#000000'
                              }}
                              sideOffset={5}
                            >
                              <div className="p-4">
                                <p className="text-[14px] font-semibold mb-3 pb-2 border-b" style={{ color: '#000000', borderColor: '#e5e7eb' }}>
                                  Gauze
                                </p>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Constituent:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.gauze.youth}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dose:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.gauze.dose}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dosing Period:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.gauze.dosingPeriod}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Log Type:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.gauze.logType}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Count:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.gauze.count}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dispensed By:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.gauze.dispensedBy}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Last Checked:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.gauze.lastChecked}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Package:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.gauze.package}</span>
                                  </div>
                                  <div className="pt-2 mt-2 border-t" style={{ borderColor: '#e5e7eb' }}>
                                    <span className="text-[12px] text-gray-600">Notes:</span>
                                    <p className="text-[12px] font-medium mt-1" style={{ color: '#000000' }}>{MED_INFO.firstAid.gauze.notes}</p>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch
                        id="gauze"
                        checked={medCartData.firstAid.gauze.checked}
                        onCheckedChange={() => handleMedCartToggle('firstAid', 'gauze')}
                      />
                    </div>
                    <Input
                      type="text"
                      placeholder="MM/YYYY or N/A"
                      value={medCartData.firstAid.gauze.expiryDate}
                      onChange={(e) => handleExpiryDateChange('firstAid', 'gauze', e.target.value)}
                      className="h-9 rounded-md text-[13px]"
                      style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                    />
                  </div>

                  {/* Antiseptic Wipes */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="antisepticWipes" className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          Antiseptic Wipes
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="cursor-pointer">
                                <Info className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent 
                              className="w-[320px] bg-white border shadow-lg p-0"
                              style={{ 
                                backgroundColor: '#ffffff',
                                borderColor: '#d8dde6',
                                color: '#000000'
                              }}
                              sideOffset={5}
                            >
                              <div className="p-4">
                                <p className="text-[14px] font-semibold mb-3 pb-2 border-b" style={{ color: '#000000', borderColor: '#e5e7eb' }}>
                                  Antiseptic Wipes
                                </p>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Constituent:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.antisepticWipes.youth}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dose:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.antisepticWipes.dose}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dosing Period:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.antisepticWipes.dosingPeriod}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Log Type:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.antisepticWipes.logType}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Count:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.antisepticWipes.count}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dispensed By:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.antisepticWipes.dispensedBy}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Last Checked:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.antisepticWipes.lastChecked}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Package:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.antisepticWipes.package}</span>
                                  </div>
                                  <div className="pt-2 mt-2 border-t" style={{ borderColor: '#e5e7eb' }}>
                                    <span className="text-[12px] text-gray-600">Notes:</span>
                                    <p className="text-[12px] font-medium mt-1" style={{ color: '#000000' }}>{MED_INFO.firstAid.antisepticWipes.notes}</p>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch
                        id="antisepticWipes"
                        checked={medCartData.firstAid.antisepticWipes.checked}
                        onCheckedChange={() => handleMedCartToggle('firstAid', 'antisepticWipes')}
                      />
                    </div>
                    <Input
                      type="text"
                      placeholder="MM/YYYY or N/A"
                      value={medCartData.firstAid.antisepticWipes.expiryDate}
                      onChange={(e) => handleExpiryDateChange('firstAid', 'antisepticWipes', e.target.value)}
                      className="h-9 rounded-md text-[13px]"
                      style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                    />
                  </div>

                  {/* Hydrogen Peroxide */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="hydrogenPeroxide" className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          Hydrogen Peroxide
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="cursor-pointer">
                                <Info className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent 
                              className="w-[320px] bg-white border shadow-lg p-0"
                              style={{ 
                                backgroundColor: '#ffffff',
                                borderColor: '#d8dde6',
                                color: '#000000'
                              }}
                              sideOffset={5}
                            >
                              <div className="p-4">
                                <p className="text-[14px] font-semibold mb-3 pb-2 border-b" style={{ color: '#000000', borderColor: '#e5e7eb' }}>
                                  Hydrogen Peroxide
                                </p>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Constituent:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.hydrogenPeroxide.youth}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dose:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.hydrogenPeroxide.dose}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dosing Period:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.hydrogenPeroxide.dosingPeriod}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Log Type:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.hydrogenPeroxide.logType}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Count:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.hydrogenPeroxide.count}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dispensed By:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.hydrogenPeroxide.dispensedBy}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Last Checked:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.hydrogenPeroxide.lastChecked}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Package:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.hydrogenPeroxide.package}</span>
                                  </div>
                                  <div className="pt-2 mt-2 border-t" style={{ borderColor: '#e5e7eb' }}>
                                    <span className="text-[12px] text-gray-600">Notes:</span>
                                    <p className="text-[12px] font-medium mt-1" style={{ color: '#000000' }}>{MED_INFO.firstAid.hydrogenPeroxide.notes}</p>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch
                        id="hydrogenPeroxide"
                        checked={medCartData.firstAid.hydrogenPeroxide.checked}
                        onCheckedChange={() => handleMedCartToggle('firstAid', 'hydrogenPeroxide')}
                      />
                    </div>
                    <Input
                      type="text"
                      placeholder="MM/YYYY or N/A"
                      value={medCartData.firstAid.hydrogenPeroxide.expiryDate}
                      onChange={(e) => handleExpiryDateChange('firstAid', 'hydrogenPeroxide', e.target.value)}
                      className="h-9 rounded-md text-[13px]"
                      style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                    />
                  </div>

                  {/* Adhesive Tape */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="adhesiveTape" className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          Adhesive Tape
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="cursor-pointer">
                                <Info className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent 
                              className="w-[320px] bg-white border shadow-lg p-0"
                              style={{ 
                                backgroundColor: '#ffffff',
                                borderColor: '#d8dde6',
                                color: '#000000'
                              }}
                              sideOffset={5}
                            >
                              <div className="p-4">
                                <p className="text-[14px] font-semibold mb-3 pb-2 border-b" style={{ color: '#000000', borderColor: '#e5e7eb' }}>
                                  Adhesive Tape
                                </p>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Constituent:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.adhesiveTape.youth}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dose:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.adhesiveTape.dose}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dosing Period:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.adhesiveTape.dosingPeriod}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Log Type:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.adhesiveTape.logType}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Count:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.adhesiveTape.count}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dispensed By:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.adhesiveTape.dispensedBy}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Last Checked:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.adhesiveTape.lastChecked}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Package:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.adhesiveTape.package}</span>
                                  </div>
                                  <div className="pt-2 mt-2 border-t" style={{ borderColor: '#e5e7eb' }}>
                                    <span className="text-[12px] text-gray-600">Notes:</span>
                                    <p className="text-[12px] font-medium mt-1" style={{ color: '#000000' }}>{MED_INFO.firstAid.adhesiveTape.notes}</p>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch
                        id="adhesiveTape"
                        checked={medCartData.firstAid.adhesiveTape.checked}
                        onCheckedChange={() => handleMedCartToggle('firstAid', 'adhesiveTape')}
                      />
                    </div>
                    <Input
                      type="text"
                      placeholder="MM/YYYY or N/A"
                      value={medCartData.firstAid.adhesiveTape.expiryDate}
                      onChange={(e) => handleExpiryDateChange('firstAid', 'adhesiveTape', e.target.value)}
                      className="h-9 rounded-md text-[13px]"
                      style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                    />
                  </div>

                  {/* Gloves */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="gloves" className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          Gloves
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="cursor-pointer">
                                <Info className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent 
                              className="w-[320px] bg-white border shadow-lg p-0"
                              style={{ 
                                backgroundColor: '#ffffff',
                                borderColor: '#d8dde6',
                                color: '#000000'
                              }}
                              sideOffset={5}
                            >
                              <div className="p-4">
                                <p className="text-[14px] font-semibold mb-3 pb-2 border-b" style={{ color: '#000000', borderColor: '#e5e7eb' }}>
                                  Gloves
                                </p>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Constituent:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.gloves.youth}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dose:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.gloves.dose}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dosing Period:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.gloves.dosingPeriod}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Log Type:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.gloves.logType}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Count:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.gloves.count}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Dispensed By:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.gloves.dispensedBy}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Last Checked:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.gloves.lastChecked}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[12px] text-gray-600">Package:</span>
                                    <span className="text-[12px] font-medium" style={{ color: '#000000' }}>{MED_INFO.firstAid.gloves.package}</span>
                                  </div>
                                  <div className="pt-2 mt-2 border-t" style={{ borderColor: '#e5e7eb' }}>
                                    <span className="text-[12px] text-gray-600">Notes:</span>
                                    <p className="text-[12px] font-medium mt-1" style={{ color: '#000000' }}>{MED_INFO.firstAid.gloves.notes}</p>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch
                        id="gloves"
                        checked={medCartData.firstAid.gloves.checked}
                        onCheckedChange={() => handleMedCartToggle('firstAid', 'gloves')}
                      />
                    </div>
                    <Input
                      type="text"
                      placeholder="MM/YYYY or N/A"
                      value={medCartData.firstAid.gloves.expiryDate}
                      onChange={(e) => handleExpiryDateChange('firstAid', 'gloves', e.target.value)}
                      className="h-9 rounded-md text-[13px]"
                      style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                size="sm"
                className="rounded-full px-8 h-10"
                style={{ backgroundColor: 'var(--color-brand-primary)' }}
                onClick={() => {
                  // Handle submit
                  alert('Med Cart Review submitted successfully!');
                }}
              >
                Submit Review
              </Button>
            </div>
          </div>
        )}

        {activeTab === "counts" && (
          <div className="space-y-4">
            {/* Header */}
            <div>
              <h3 className="text-[15px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                Select Youth for Medication Count
              </h3>
              <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Choose a youth to access their medication count page
              </p>
            </div>

            {/* Youth Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: 1, name: "Fozzie Bear", initials: "FB", program: "Mahoney House", activeMeds: 3 },
                { id: 2, name: "Kermit the Frog", initials: "KF", program: "Mahoney House", activeMeds: 2 },
                { id: 3, name: "Red Fraggle", initials: "RF", program: "Mahoney House", activeMeds: 4 },
                { id: 4, name: "Miss Piggy", initials: "MP", program: "Mahoney House", activeMeds: 1 },
                { id: 5, name: "Gonzo the Great", initials: "GG", program: "Mahoney House", activeMeds: 2 },
                { id: 6, name: "Animal", initials: "AN", program: "Mahoney House", activeMeds: 3 },
                { id: 7, name: "Scooter", initials: "SC", program: "Mahoney House", activeMeds: 2 },
                { id: 8, name: "Rowlf the Dog", initials: "RD", program: "Mahoney House", activeMeds: 1 },
                { id: 9, name: "Rizzo the Rat", initials: "RR", program: "Mahoney House", activeMeds: 2 },
                { id: 10, name: "Pepe the Prawn", initials: "PP", program: "Mahoney House", activeMeds: 1 }
              ].map((youth) => (
                <div
                  key={youth.id}
                  onClick={() => navigate(`/youth/${youth.id}/medication-count`)}
                  className="group cursor-pointer rounded-lg overflow-hidden transition-all hover:shadow-md"
                  style={{
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    backgroundColor: 'var(--slds-g-color-background-base)'
                  }}
                >
                  <div className="p-4 flex items-center justify-between group-hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[15px] font-semibold flex-shrink-0"
                        style={{ backgroundColor: '#145F33' }}
                      >
                        {youth.initials}
                      </div>
                      <div>
                        <h4 className="font-semibold slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          {youth.name}
                        </h4>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                          {youth.program} • {youth.activeMeds} Active Med{youth.activeMeds !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


      </div>
    </div>
  );
}