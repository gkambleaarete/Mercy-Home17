import { useState, useRef } from "react";
import { toast } from "sonner@2.0.3";
import { getDemoUserName } from "../../lib/demoIdentity";
import { CheckCircle2 } from "@/app/lib/lucide-icons";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, User, Plus, Trash2, Sunrise, Sun, Sunset, Moon, AlertCircle, Package } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { DateInput } from "../ui/date-input";
import { TimeInput } from "../ui/time-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

// Mock constituent data (in production, this would come from API)
const MOCK_CONSTITUENTS: Record<string, any> = {
  "1": {
    id: "1",
    firstName: "Fozzie",
    lastName: "Bear",
    fullName: "Fozzie Bear",
    dob: "03/15/2007",
    age: 17,
    program: "Mahoney House",
    allergies: ["Peanuts"],
    diagnoses: ["ADHD", "Sleep Disorder"],
  }
};

// Mock scheduled medications by timeframe
const MOCK_SCHEDULED_MEDS = {
  Morning: [
    {
      id: 1,
      medication: "Lexapro",
      genericName: "Escitalopram",
      dose: "20mg Tablet",
      instructions: "Take with food",
      startTime: "8:00 AM",
      stopTime: "8:30 AM",
      lastCount: 45,
      countCompleted: true,
    },
    {
      id: 2,
      medication: "Adderall XR",
      genericName: "Amphetamine Salts",
      dose: "20mg Capsule",
      instructions: "Take in morning",
      startTime: "8:00 AM",
      stopTime: "8:30 AM",
      lastCount: 28,
      countCompleted: false,
    },
  ],
  Afternoon: [
    {
      id: 3,
      medication: "Vitamin D",
      genericName: "Cholecalciferol",
      dose: "1000 IU Softgel",
      instructions: "Take with meal",
      startTime: "12:00 PM",
      stopTime: "12:30 PM",
      lastCount: 60,
      countCompleted: true,
    },
  ],
  Evening: [
    {
      id: 4,
      medication: "Fish Oil",
      genericName: "Omega-3 Fatty Acids",
      dose: "1000mg Capsule",
      instructions: "Take with dinner",
      startTime: "6:00 PM",
      stopTime: "6:30 PM",
      lastCount: 30,
      countCompleted: true,
    },
  ],
  Bedtime: [
    {
      id: 5,
      medication: "Zoloft",
      genericName: "Sertraline HCl",
      dose: "50mg Tablet",
      instructions: "Take at bedtime",
      startTime: "9:00 PM",
      stopTime: "9:30 PM",
      lastCount: 38,
      countCompleted: true,
    },
  ],
};

// Standard OTC list (from MedicationOverviewSections)
const STANDARD_OTC_LIST = [
  { id: 1, name: "Acetaminophen 325mg", genericName: "Acetaminophen" },
  { id: 2, name: "Ibuprofen 200mg", genericName: "Ibuprofen" },
  { id: 3, name: "Diphenhydramine 25mg", genericName: "Diphenhydramine HCl" },
  { id: 4, name: "Cetirizine 10mg", genericName: "Cetirizine HCl" },
  { id: 5, name: "Loratadine 10mg", genericName: "Loratadine" },
  { id: 6, name: "Calcium Carbonate 500mg", genericName: "Calcium Carbonate" },
  { id: 7, name: "Guaifenesin 600mg", genericName: "Guaifenesin" },
  { id: 8, name: "Bismuth Subsalicylate", genericName: "Bismuth Subsalicylate" },
  { id: 9, name: "Naproxen Sodium 220mg", genericName: "Naproxen Sodium" },
  { id: 10, name: "Hydrocortisone 1% Cream", genericName: "Hydrocortisone" },
  { id: 11, name: "Polyethylene Glycol 3350", genericName: "Polyethylene Glycol 3350" },
];

// Mock active PRN medications
const ACTIVE_PRN_MEDS = [
  { id: 1, name: "GenTeal Tears Eye Gel", genericName: "Hydroxypropyl Methylcellulose", dose: "0.3% Ophthalmic", lastCount: 4, countCompleted: true },
  { id: 2, name: "Melatonin", genericName: "Melatonin", dose: "3mg Tablet", lastCount: 22, countCompleted: true },
  { id: 3, name: "Ibuprofen", genericName: "Ibuprofen", dose: "200mg Tablet", lastCount: 45, countCompleted: false },
];

// Mock active OTC consent
const MOCK_ACTIVE_CONSENT = {
  selectedOTCs: ["Acetaminophen 325mg", "Ibuprofen 200mg", "Diphenhydramine 25mg", "Cetirizine 10mg"]
};

interface ScheduledMedState {
  staffGiven: boolean | null;
  code: string;
  youthReceived: boolean | null;
  comments: string;
}

interface OTCEntry {
  id: string;
  dispensedDate: string;
  dispensedTime: string;
  medication: string;
  quantity: string;
  comments: string;
}

interface PRNEntry {
  id: string;
  dispensedDate: string;
  dispensedTime: string;
  medication: string;
  quantity: string;
  lastCount: number;
  countCompleted: boolean;
  comments: string;
}

interface DispensationSubmission {
  by: string;
  at: string;
  scheduledStates: Record<number, ScheduledMedState>;
  otcEntries: OTCEntry[];
  prnEntries: PRNEntry[];
}

// Demo-only in-memory record of submitted dispensations (resets on reload).
const SUBMITTED_DISPENSATIONS = new Map<string, DispensationSubmission>();

export function MedicationDispensationPage() {
  const navigate = useNavigate();
  const { youthId, timeframe } = useParams<{ youthId: string; timeframe: string }>();

  const constituent = MOCK_CONSTITUENTS[youthId || "1"];
  const scheduledMeds = MOCK_SCHEDULED_MEDS[timeframe as keyof typeof MOCK_SCHEDULED_MEDS] || [];

  // Get today's date in MM/DD/YYYY format
  const today = new Date();
  const systemDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
  const currentTime = today.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  // Scheduled medication states
  const submissionKey = `${youthId || "1"}|${timeframe}|${systemDate}`;
  const [submission, setSubmission] = useState<DispensationSubmission | null>(
    () => SUBMITTED_DISPENSATIONS.get(submissionKey) ?? null
  );
  const submitInFlight = useRef(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isLocked = submission !== null;

  const [scheduledStates, setScheduledStates] = useState<Record<number, ScheduledMedState>>(
    () => submission?.scheduledStates ?? scheduledMeds.reduce((acc, med) => ({
      ...acc,
      [med.id]: {
        staffGiven: true,
        code: "",
        youthReceived: false,
        comments: "",
      }
    }), {})
  );

  // OTC entries
  const [otcEntries, setOtcEntries] = useState<OTCEntry[]>(() => submission?.otcEntries ?? []);

  // PRN entries
  const [prnEntries, setPrnEntries] = useState<PRNEntry[]>(() => submission?.prnEntries ?? []);

  // Code dialog
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState<number | null>(null);
  const [tempCode, setTempCode] = useState("");

  // Count prompt dialog
  const [showCountPrompt, setShowCountPrompt] = useState(false);

  const handleStaffToggle = (medId: number, value: boolean) => {
    setScheduledStates(prev => ({
      ...prev,
      [medId]: {
        ...prev[medId],
        staffGiven: value,
        code: value ? "" : prev[medId].code, // Clear code if switching to Yes
      }
    }));
  };

  const handleYouthToggle = (medId: number, value: boolean) => {
    setScheduledStates(prev => ({
      ...prev,
      [medId]: {
        ...prev[medId],
        youthReceived: value,
      }
    }));
  };

  const handleCodeClick = (medId: number) => {
    setSelectedMedId(medId);
    setTempCode(scheduledStates[medId]?.code || "");
    setShowCodeDialog(true);
  };

  const handleCodeSave = () => {
    if (selectedMedId !== null && tempCode) {
      setScheduledStates(prev => ({
        ...prev,
        [selectedMedId]: {
          ...prev[selectedMedId],
          code: tempCode,
        }
      }));
    }
    setShowCodeDialog(false);
  };

  const handleAddOTCEntry = () => {
    const newEntry: OTCEntry = {
      id: `otc-${Date.now()}`,
      dispensedDate: systemDate,
      dispensedTime: currentTime,
      medication: "",
      quantity: "",
      comments: "",
    };
    setOtcEntries(prev => [...prev, newEntry]);
  };

  const handleRemoveOTCEntry = (id: string) => {
    setOtcEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const handleUpdateOTCEntry = (id: string, field: keyof OTCEntry, value: string) => {
    setOtcEntries(prev => prev.map(entry =>
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const handleAddPRNEntry = () => {
    const newEntry: PRNEntry = {
      id: `prn-${Date.now()}`,
      dispensedDate: systemDate,
      dispensedTime: currentTime,
      medication: "",
      quantity: "",
      lastCount: 0,
      countCompleted: false,
      comments: "",
    };
    setPrnEntries(prev => [...prev, newEntry]);
  };

  const handleRemovePRNEntry = (id: string) => {
    setPrnEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const handleUpdatePRNEntry = (id: string, field: keyof PRNEntry, value: any) => {
    setPrnEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        // If medication changes, update lastCount and countCompleted
        if (field === "medication") {
          const selectedMed = ACTIVE_PRN_MEDS.find(m => m.name === value);
          return {
            ...entry,
            [field]: value,
            lastCount: selectedMed?.lastCount || 0,
            countCompleted: selectedMed?.countCompleted || false,
          };
        }
        return { ...entry, [field]: value };
      }
      return entry;
    }));
  };

  const handleSubmit = () => {
    if (isLocked || submitInFlight.current) return;
    // Validate scheduled medications
    const missingCode = scheduledMeds.filter(med => {
      const state = scheduledStates[med.id];
      return state && state.staffGiven === false && !state.code;
    });

    if (missingCode.length > 0) {
      setSubmitError(
        `Add a code for every medication marked as Not Given: ${missingCode.map(m => m.medication).join(", ")}.`
      );
      return;
    }
    setSubmitError(null);

    // Show count prompt
    setShowCountPrompt(true);
  };

  const handleCountDecision = (enterNow: boolean) => {
    if (submitInFlight.current || isLocked) return;
    submitInFlight.current = true;
    setShowCountPrompt(false);
    try {
      const record: DispensationSubmission = {
        by: getDemoUserName(),
        at: new Date().toLocaleString("en-US", { month: "2-digit", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit" }),
        scheduledStates,
        otcEntries,
        prnEntries,
      };
      SUBMITTED_DISPENSATIONS.set(submissionKey, record);
      setSubmission(record);
      toast.success(`${timeframe} dispensation submitted`, {
        description: `Recorded for ${constituent.fullName} by ${record.by}.`,
      });
      if (enterNow) {
        navigate(`/youth/${youthId || "1"}/medication-count`);
      }
    } catch {
      setSubmitError("The dispensation could not be recorded. Your entries have been kept; please try again.");
    } finally {
      submitInFlight.current = false;
    }
  };

  // Group OTC medications by approval status
  const approvedOTCs = STANDARD_OTC_LIST.filter(otc => MOCK_ACTIVE_CONSENT.selectedOTCs.includes(otc.name));
  const notApprovedOTCs = STANDARD_OTC_LIST.filter(otc => !MOCK_ACTIVE_CONSENT.selectedOTCs.includes(otc.name));

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pb-16" style={{ backgroundColor: 'var(--slds-g-color-background-base)' }}>
      {/* Header Section */}
      <div
        className="px-6 py-4"
        style={{
          backgroundColor: 'var(--slds-g-color-background-base)',
          borderBottom: '1px solid var(--slds-g-color-border-base-1)'
        }}
      >
        {/* Return to Dashboard */}
        <button
          onClick={() => navigate("/medications")}
          className="flex items-center gap-2 mb-4 slds-text-4 hover:underline transition-colors"
          style={{ color: 'var(--slds-g-color-text-default)', backgroundColor: 'transparent', border: 'none' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Medication Dashboard
        </button>

        {/* Main Header Content */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white flex-shrink-0"
              style={{ backgroundColor: '#145F33' }}
            >
              <User className="w-8 h-8" />
            </div>

            {/* Youth Info */}
            <div>
              <h1
                className="font-semibold mb-1"
                style={{
                  fontSize: '1.5rem',
                  color: 'var(--slds-g-color-text-default)'
                }}
              >
                {constituent.fullName}
              </h1>
              <div className="flex items-center gap-4 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                <span>Age: <span className="font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{constituent.age} ({constituent.dob})</span></span>
                <span>•</span>
                <span>Medical Conditions: <span className="font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{constituent.diagnoses.join(', ')}</span></span>
                <span>•</span>
                <span>Allergies: <span className="font-medium" style={{ color: '#c23934' }}>{constituent.allergies.length > 0 ? constituent.allergies.join(', ') : 'None'}</span></span>
              </div>
            </div>
          </div>

          {/* System Date & Timeframe - Highly Visible */}
          <div className="flex items-center gap-4">
            <div
              className="px-4 py-3 rounded"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)'
              }}
            >
              <div className="slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>DATE</div>
              <div className="slds-text-6 font-bold" style={{ color: 'var(--slds-g-color-text-default)' }}>{systemDate}</div>
            </div>
            <div
              className="px-4 py-3 rounded"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)'
              }}
            >
              <div className="slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>TIMEFRAME</div>
              <div className="slds-text-6 font-bold" style={{ color: 'var(--slds-g-color-text-default)' }}>{timeframe}</div>
            </div>
            {isLocked && (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full slds-text-3 font-semibold"
                style={{ backgroundColor: '#DCFCE7', color: '#145F33', border: '1px solid #145F33' }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Submitted
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 space-y-6">
        {submitError && (
          <div role="alert" className="px-4 py-3 rounded slds-text-4 flex items-center gap-2" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #DC2626' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {submitError}
          </div>
        )}
        {submission && (
          <div role="status" className="px-4 py-3 rounded slds-text-4" style={{ backgroundColor: '#F0FDF4', color: '#145F33', border: '1px solid #16A34A' }}>
            <span className="font-semibold">Submitted</span> by {submission.by} on {submission.at}. This dispensation is now read-only.
          </div>
        )}
        <fieldset disabled={isLocked} className="space-y-6 border-0 p-0 m-0 min-w-0">
        {/* Scheduled Medications Section */}
        {scheduledMeds.length > 0 && (
          <div
            className="rounded-lg overflow-hidden"
            style={{
              border: '1px solid var(--slds-g-color-border-base-1)',
              backgroundColor: 'var(--slds-g-color-background-base)'
            }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{
                borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor:
                  timeframe === "Morning" ? "#FFA500" :
                  timeframe === "Afternoon" ? "#00CC99" :
                  timeframe === "Evening" ? "#FFFF49" :
                  "#3333FF"
              }}
            >
              <div className="flex items-center gap-2">
                {timeframe === "Morning" && <Sunrise className="w-4 h-4 text-white" />}
                {timeframe === "Afternoon" && <Sun className="w-4 h-4 text-white" />}
                {timeframe === "Evening" && <Sunset className="w-4 h-4" style={{ color: '#1E1E1E' }} />}
                {timeframe === "Bedtime" && <Moon className="w-4 h-4 text-white" />}
                <h2 className="slds-text-4 font-semibold" style={{ color: timeframe === "Evening" ? '#1E1E1E' : 'white' }}>
                  {timeframe}
                </h2>
              </div>
              <span
                className="px-2 py-0.5 rounded slds-text-3 font-medium"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: timeframe === "Evening" ? '#1E1E1E' : 'white',
                  border: timeframe === "Evening" ? '1px solid rgba(30,30,30,0.2)' : '1px solid rgba(255,255,255,0.3)'
                }}
              >
                {scheduledMeds.length} {scheduledMeds.length === 1 ? 'medication' : 'medications'}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>MEDICATION</th>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>DOSE</th>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>INSTRUCTIONS</th>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>TIME</th>
                    <th className="px-4 py-2 text-center slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>STAFF</th>
                    <th className="px-4 py-2 text-center slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>YOUTH</th>
                    <th className="px-4 py-2 text-center slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>CODE</th>
                    <th className="px-4 py-2 text-center slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>LAST COUNT</th>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>COMMENTS</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduledMeds.map((med, index) => {
                    const state = scheduledStates[med.id] || {};
                    return (
                      <tr
                        key={med.id}
                        className="hover:bg-gray-50/50 transition-colors"
                        style={{ borderBottom: index < scheduledMeds.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                      >
                        <td className="px-4 py-3">
                          <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            {med.medication}
                            {med.genericName && (
                              <span className="font-normal" style={{ color: 'var(--slds-g-color-text-weak)' }}> [({med.genericName})]</span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{med.dose}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{med.instructions}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            {med.startTime} - {med.stopTime}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <button
                              onClick={() => {
                                if (state.staffGiven === null || state.staffGiven === undefined) {
                                  handleStaffToggle(med.id, true);
                                } else if (state.staffGiven === true) {
                                  handleStaffToggle(med.id, false);
                                } else {
                                  handleStaffToggle(med.id, true);
                                }
                              }}
                              className={cn(
                                "px-5 py-2 rounded-md slds-text-3 font-bold transition-colors min-w-[70px]",
                                state.staffGiven === true
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : state.staffGiven === false
                                  ? "bg-red-600 hover:bg-red-700 text-white"
                                  : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
                              )}
                            >
                              {state.staffGiven === true ? "YES" : state.staffGiven === false ? "NO" : "—"}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <button
                              onClick={() => {
                                if (state.youthReceived === null || state.youthReceived === undefined) {
                                  handleYouthToggle(med.id, true);
                                } else if (state.youthReceived === true) {
                                  handleYouthToggle(med.id, false);
                                } else {
                                  handleYouthToggle(med.id, true);
                                }
                              }}
                              className={cn(
                                "px-5 py-2 rounded-md slds-text-3 font-bold transition-colors min-w-[70px]",
                                state.youthReceived === true
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : state.youthReceived === false
                                  ? "bg-red-600 hover:bg-red-700 text-white"
                                  : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
                              )}
                            >
                              {state.youthReceived === true ? "YES" : state.youthReceived === false ? "NO" : "—"}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            {state.staffGiven === false && (
                              <button
                                onClick={() => handleCodeClick(med.id)}
                                className="px-3 py-1.5 rounded slds-text-3 font-semibold transition-colors hover:bg-gray-50"
                                style={{
                                  backgroundColor: state.code ? 'var(--slds-g-color-background-alt)' : 'var(--slds-g-color-background-base)',
                                  color: state.code ? '#145F33' : 'var(--slds-g-color-text-default)',
                                  border: `1px solid var(--slds-g-color-border-base-1)`
                                }}
                              >
                                {state.code || "Add Code"}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-center">
                            <div className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                              {med.lastCount}
                            </div>
                            <div className={cn("slds-text-3 font-medium", med.countCompleted ? "text-green-700" : "text-orange-700")}>
                              {med.countCompleted ? "Completed" : "Not Completed"}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            value={state.comments || ""}
                            onChange={(e) => setScheduledStates(prev => ({
                              ...prev,
                              [med.id]: { ...prev[med.id], comments: e.target.value }
                            }))}
                            placeholder="Add comments..."
                            className="h-9 slds-text-4"
                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Attestation & Submit */}
            <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
              <p className="slds-text-4 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                I attest that I have followed the policies and procedure of Medicine Dispensation & Documentation.
              </p>
              <Button
                onClick={handleSubmit}
                size="lg"
                className="h-10 px-6 rounded-full"
                style={{ backgroundColor: '#145F33', color: 'white' }}
              >
                {isLocked ? "Submitted" : "Submit"}
              </Button>
            </div>
          </div>
        )}

        {/* Standard OTC Section */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            border: '1px solid var(--slds-g-color-border-base-1)',
            backgroundColor: 'var(--slds-g-color-background-base)'
          }}
        >
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{
              borderBottom: '1px solid var(--slds-g-color-border-base-1)',
              backgroundColor: '#808080'
            }}
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-white" />
              <h2 className="slds-text-4 font-semibold text-white">
                Standard OTC
              </h2>
            </div>
            <button
              onClick={handleAddOTCEntry}
              className="h-8 px-3 gap-1.5 rounded-full flex items-center slds-text-3 font-semibold transition-colors hover:bg-gray-100"
              style={{ backgroundColor: 'white', color: '#000000', border: '1px solid rgba(255,255,255,0.5)' }}
            >
              <Plus className="w-4 h-4" />
              Add Entry
            </button>
          </div>
          {otcEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>DATE</th>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>TIME</th>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>MEDICATION</th>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>QUANTITY</th>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>REASONS / COMMENTS</th>
                    <th className="px-4 py-2 text-center slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {otcEntries.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{ borderBottom: index < otcEntries.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                    >
                      <td className="px-4 py-3">
                        <DateInput
                          value={entry.dispensedDate}
                          onChange={(value) => handleUpdateOTCEntry(entry.id, "dispensedDate", value)}
                          className="h-9 slds-text-4"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <TimeInput
                          value={entry.dispensedTime}
                          onChange={(value) => handleUpdateOTCEntry(entry.id, "dispensedTime", value)}
                          className="h-9 slds-text-4"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={entry.medication}
                          onValueChange={(value) => handleUpdateOTCEntry(entry.id, "medication", value)}
                        >
                          <SelectTrigger className="h-9 slds-text-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                            <SelectValue placeholder="Select medication..." />
                          </SelectTrigger>
                          <SelectContent>
                            {approvedOTCs.length > 0 && (
                              <>
                                {approvedOTCs.map(otc => (
                                  <SelectItem key={otc.id} value={otc.name}>
                                    <span className="text-green-700 font-semibold">✓ {otc.name}</span>
                                  </SelectItem>
                                ))}
                              </>
                            )}
                            {notApprovedOTCs.length > 0 && (
                              <>
                                {notApprovedOTCs.map(otc => (
                                  <SelectItem key={otc.id} value={otc.name}>
                                    <span className="text-red-700">✗ {otc.name}</span>
                                  </SelectItem>
                                ))}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={entry.quantity}
                          onChange={(e) => handleUpdateOTCEntry(entry.id, "quantity", e.target.value)}
                          placeholder="Qty"
                          className="h-9 slds-text-4 w-24"
                          style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          value={entry.comments}
                          onChange={(e) => handleUpdateOTCEntry(entry.id, "comments", e.target.value)}
                          placeholder="Reasons or comments..."
                          className="h-9 slds-text-4"
                          style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleRemoveOTCEntry(entry.id)}
                          className="p-2 rounded hover:bg-red-50 transition-colors"
                          style={{ color: '#c23934' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              <p className="slds-text-4">No OTC entries yet. Click "Add Entry" to document OTC dispensation.</p>
            </div>
          )}

          {/* Attestation & Submit */}
          <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
            <p className="slds-text-4 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              I attest that I have followed the policies and procedure of Medicine Dispensation & Documentation.
            </p>
            <Button
              onClick={handleSubmit}
              size="lg"
              className="h-10 px-6 rounded-full"
              style={{ backgroundColor: '#145F33', color: 'white' }}
            >
              {isLocked ? "Submitted" : "Submit"}
            </Button>
          </div>
        </div>

        {/* PRN Medications Section */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            border: '1px solid var(--slds-g-color-border-base-1)',
            backgroundColor: 'var(--slds-g-color-background-base)'
          }}
        >
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{
              borderBottom: '1px solid var(--slds-g-color-border-base-1)',
              backgroundColor: '#000000'
            }}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-white" />
              <h2 className="slds-text-4 font-semibold text-white">
                PRN (As Needed)
              </h2>
            </div>
            <button
              onClick={handleAddPRNEntry}
              className="h-8 px-3 gap-1.5 rounded-full flex items-center slds-text-3 font-semibold transition-colors hover:bg-gray-900"
              style={{ backgroundColor: 'white', color: '#000000', border: '1px solid rgba(255,255,255,0.5)' }}
            >
              <Plus className="w-4 h-4" />
              Add Entry
            </button>
          </div>
          {prnEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>DATE</th>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>TIME</th>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>MEDICATION</th>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>QUANTITY</th>
                    <th className="px-4 py-2 text-center slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>LAST COUNT</th>
                    <th className="px-4 py-2 text-left slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>REASON / COMMENTS</th>
                    <th className="px-4 py-2 text-center slds-text-3 font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {prnEntries.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{ borderBottom: index < prnEntries.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                    >
                      <td className="px-4 py-3">
                        <DateInput
                          value={entry.dispensedDate}
                          onChange={(value) => handleUpdatePRNEntry(entry.id, "dispensedDate", value)}
                          className="h-9 slds-text-4"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <TimeInput
                          value={entry.dispensedTime}
                          onChange={(value) => handleUpdatePRNEntry(entry.id, "dispensedTime", value)}
                          className="h-9 slds-text-4"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={entry.medication}
                          onValueChange={(value) => handleUpdatePRNEntry(entry.id, "medication", value)}
                        >
                          <SelectTrigger className="h-9 slds-text-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                            <SelectValue placeholder="Select PRN medication..." />
                          </SelectTrigger>
                          <SelectContent>
                            {ACTIVE_PRN_MEDS.map(med => (
                              <SelectItem key={med.id} value={med.name}>
                                {med.name} ({med.dose})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={entry.quantity}
                          onChange={(e) => handleUpdatePRNEntry(entry.id, "quantity", e.target.value)}
                          placeholder="Qty"
                          className="h-9 slds-text-4 w-24"
                          style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-center">
                          <div className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            {entry.lastCount || "—"}
                          </div>
                          <div className={cn("slds-text-3 font-medium", entry.countCompleted ? "text-green-700" : "text-orange-700")}>
                            {entry.medication ? (entry.countCompleted ? "Completed" : "Not Completed") : "—"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          value={entry.comments}
                          onChange={(e) => handleUpdatePRNEntry(entry.id, "comments", e.target.value)}
                          placeholder="Reason or comments..."
                          className="h-9 slds-text-4"
                          style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleRemovePRNEntry(entry.id)}
                          className="p-2 rounded hover:bg-red-50 transition-colors"
                          style={{ color: '#c23934' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              <p className="slds-text-4">No PRN entries yet. Click "Add Entry" to document PRN dispensation.</p>
            </div>
          )}

          {/* Attestation & Submit */}
          <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
            <p className="slds-text-4 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              I attest that I have followed the policies and procedure of Medicine Dispensation & Documentation.
            </p>
            <Button
              onClick={handleSubmit}
              size="lg"
              className="h-10 px-6 rounded-full"
              style={{ backgroundColor: '#145F33', color: 'white' }}
            >
              {isLocked ? "Submitted" : "Submit"}
            </Button>
          </div>
        </div>
        </fieldset>
      </div>

      {/* Code Dialog */}
      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Code (Reason)</DialogTitle>
            <DialogDescription>
              Provide a reason for not administering the medication.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTempCode("REFUSED")}
              className={cn(
                "px-4 py-3 rounded slds-text-4 font-semibold transition-colors text-left",
                tempCode === "REFUSED"
                  ? ""
                  : "hover:bg-gray-100"
              )}
              style={tempCode === "REFUSED"
                ? { backgroundColor: 'var(--slds-g-color-background-alt)', border: '1px solid var(--slds-g-color-border-base-1)', color: '#145F33' }
                : { backgroundColor: 'var(--slds-g-color-background-alt)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }
              }
            >
              Refused
            </button>
            <button
              onClick={() => setTempCode("UNAVAILABLE")}
              className={cn(
                "px-4 py-3 rounded slds-text-4 font-semibold transition-colors text-left",
                tempCode === "UNAVAILABLE"
                  ? ""
                  : "hover:bg-gray-100"
              )}
              style={tempCode === "UNAVAILABLE"
                ? { backgroundColor: 'var(--slds-g-color-background-alt)', border: '1px solid var(--slds-g-color-border-base-1)', color: '#145F33' }
                : { backgroundColor: 'var(--slds-g-color-background-alt)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }
              }
            >
              Youth Unavailable
            </button>
            <button
              onClick={() => setTempCode("MEDICAL")}
              className={cn(
                "px-4 py-3 rounded slds-text-4 font-semibold transition-colors text-left",
                tempCode === "MEDICAL"
                  ? ""
                  : "hover:bg-gray-100"
              )}
              style={tempCode === "MEDICAL"
                ? { backgroundColor: 'var(--slds-g-color-background-alt)', border: '1px solid var(--slds-g-color-border-base-1)', color: '#145F33' }
                : { backgroundColor: 'var(--slds-g-color-background-alt)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }
              }
            >
              Medical Reason
            </button>
            <button
              onClick={() => setTempCode("OTHER")}
              className={cn(
                "px-4 py-3 rounded slds-text-4 font-semibold transition-colors text-left",
                tempCode === "OTHER"
                  ? ""
                  : "hover:bg-gray-100"
              )}
              style={tempCode === "OTHER"
                ? { backgroundColor: 'var(--slds-g-color-background-alt)', border: '1px solid var(--slds-g-color-border-base-1)', color: '#145F33' }
                : { backgroundColor: 'var(--slds-g-color-background-alt)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }
              }
            >
              Other
            </button>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCodeDialog(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCodeSave}
              disabled={!tempCode}
              className="rounded-full"
              style={{ backgroundColor: '#145F33', color: 'white' }}
            >
              Save Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Count Prompt Dialog */}
      <Dialog open={showCountPrompt} onOpenChange={setShowCountPrompt}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Medication Count</DialogTitle>
            <DialogDescription>
              Would you like to enter medication counts now or defer for later?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleCountDecision(false)}
              className="rounded-full flex-1"
            >
              Defer Count
            </Button>
            <Button
              onClick={() => handleCountDecision(true)}
              className="rounded-full flex-1"
              style={{ backgroundColor: '#145F33', color: 'white' }}
            >
              Enter Count Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
