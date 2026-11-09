import { useState, useRef } from "react";
import { YouthAlertIcons } from "../youth/YouthAlertIcons";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import { ArrowLeft, AlertCircle, Plus, Calendar, Clock, CheckCircle2 } from "@/app/lib/lucide-icons";
import { toast } from "sonner@2.0.3";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { getDemoUserName } from "../../lib/demoIdentity";
import { MedicationCodeSelector, GROUPED_CODES, MED_CODE_MAP, type MedCode } from "../admissions/MedicationCodeSelector";

// Mock youth data structure
interface Youth {
  id: string;
  name: string;
  initials: string;
  age: number;
  program: string;
}

interface MedicationRow {
  id: string;
  medicationName: string;
  dose: string;
  instructions: string;
  startTime: string;
  stopTime: string;
  staffDispensed: boolean | null;
  constituentReceived: boolean | null;
  code: string;
  lastCount: number;
  currentCount: string;
  comments: string;
  submitted?: boolean;
}

interface OTCEntry {
  id: string;
  dispensedDate: string;
  dispensedTime: string;
  medication: string;
  quantity: number;
  comments: string;
}

interface PRNEntry {
  id: string;
  dispensedDate: string;
  dispensedTime: string;
  medication: string;
  quantity: number;
  lastCount: number;
  currentCount: string;
  comments: string;
}

interface UnapprovedEntry {
  id: string;
  dispensedDate: string;
  dispensedTime: string;
  medication: string;
  quantity: number;
  doseDetail: string;
  comments: string;
}


// Standard OTC medications
const STANDARD_OTC_MEDICATIONS = [
  "Tylenol",
  "Ibuprofen",
  "Benadryl",
  "Tums",
  "Robitussin",
  "Neosporin",
  "Hydrocortisone Cream",
  "Triple Antibiotic Ointment",
  "Cough Drops",
  "Saline Nasal Spray",
  "Eye Drops"
];

interface SingleYouthDispensationProps {
  inline?: boolean;
  filterDate?: string;
}

export function SingleYouthDispensation({ inline, filterDate: propDate }: SingleYouthDispensationProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get date from prop (inline mode) or URL params (standalone route)
  const selectedDate = propDate || searchParams.get('date') || (() => {
    const today = new Date();
    return `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
  })();

  const youthId = searchParams.get('youthId') || '1';

  // Mock youth data
  const youth: Youth = {
    id: youthId,
    name: 'Alex Martinez',
    initials: 'AM',
    age: 16,
    program: 'West Campus Program'
  };

  // Check if date is today
  const isToday = () => {
    const today = new Date();
    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
    return selectedDate === todayStr;
  };

  // Code selection dialog state
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [selectedMedicationForCode, setSelectedMedicationForCode] = useState<{ sectionId: string; medicationId: string } | null>(null);
  const [tempSelectedCode, setTempSelectedCode] = useState("");
  const [tempSelectedMedCode, setTempSelectedMedCode] = useState<MedCode | null>(null);
  const [tempCodeComment, setTempCodeComment] = useState("");

  // Track submitted sections for count validation
  const [submittedSections, setSubmittedSections] = useState<Set<string>>(new Set());
  // Sections where Submit was attempted with missing counts (drives red highlight + inline message)
  const submittedRef = useRef<Set<string>>(new Set());
  const [sectionErrors, setSectionErrors] = useState<Record<string, string>>({});
  // Demo-only submission history (in-memory; resets on reload)
  const [submissionLog, setSubmissionLog] = useState<{ id: string; section: string; by: string; at: string; detail: string }[]>([]);
  const recordSubmission = (section: string, detail: string) => {
    setSubmissionLog(prev => [
      { id: `sub-${Date.now()}-${prev.length}`, section, by: getDemoUserName(), at: new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' }), detail },
      ...prev,
    ]);
  };

  // Mock morning medications
  const [morningMedications, setMorningMedications] = useState<MedicationRow[]>([
    {
      id: 'm1',
      medicationName: 'Adderall XR',
      dose: '20mg',
      instructions: 'Take with food',
      startTime: '6:00 AM',
      stopTime: '11:00 AM',
      staffDispensed: null,
      constituentReceived: null,
      code: '',
      lastCount: 30,
      currentCount: '',
      comments: ''
    },
    {
      id: 'm2',
      medicationName: 'Vitamin D',
      dose: '1000 IU',
      instructions: 'Take with breakfast',
      startTime: '6:00 AM',
      stopTime: '11:00 AM',
      staffDispensed: null,
      constituentReceived: null,
      code: '',
      lastCount: 60,
      currentCount: '',
      comments: ''
    }
  ]);

  // Mock afternoon medications
  const [afternoonMedications, setAfternoonMedications] = useState<MedicationRow[]>([
    {
      id: 'a1',
      medicationName: 'Zoloft',
      dose: '50mg',
      instructions: 'Take after lunch',
      startTime: '12:00 PM',
      stopTime: '4:59 PM',
      staffDispensed: null,
      constituentReceived: null,
      code: '',
      lastCount: 25,
      currentCount: '',
      comments: ''
    }
  ]);

  // Evening medications - empty for testing hidden section
  const [eveningMedications, setEveningMedications] = useState<MedicationRow[]>([]);

  // Mock bedtime medications
  const [bedtimeMedications, setBedtimeMedications] = useState<MedicationRow[]>([
    {
      id: 'b1',
      medicationName: 'Melatonin',
      dose: '5mg',
      instructions: 'Take 30 minutes before bed',
      startTime: '8:00 PM',
      stopTime: '11:59 PM',
      staffDispensed: null,
      constituentReceived: null,
      code: '',
      lastCount: 45,
      currentCount: '',
      comments: ''
    }
  ]);

  // OTC entries
  const [otcEntries, setOtcEntries] = useState<OTCEntry[]>([]);

  // PRN entries
  const [prnEntries, setPrnEntries] = useState<PRNEntry[]>([]);

  // Unapproved entries
  const [unapprovedEntries, setUnapprovedEntries] = useState<UnapprovedEntry[]>([]);

  // Helper to get current time in 12-hour format
  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  // Handle medication field updates
  const updateMedicationField = (
    section: 'morning' | 'afternoon' | 'evening' | 'bedtime',
    medId: string,
    field: keyof MedicationRow,
    value: any
  ) => {
    const setters = {
      morning: setMorningMedications,
      afternoon: setAfternoonMedications,
      evening: setEveningMedications,
      bedtime: setBedtimeMedications
    };

    const setter = setters[section];
    setter((prev: MedicationRow[]) =>
      prev.map(med => med.id === medId ? { ...med, [field]: value } : med)
    );
  };

  // Handle code selection
  const handleCodeClick = (section: string, medId: string, currentCode: string, currentComment: string) => {
    setSelectedMedicationForCode({ sectionId: section, medicationId: medId });
    setTempSelectedCode(currentCode);
    setTempSelectedMedCode(currentCode ? (MED_CODE_MAP[currentCode] ?? null) : null);
    setTempCodeComment(currentComment);
    setShowCodeDialog(true);
  };

  const handleSaveCode = () => {
    if (!selectedMedicationForCode || !tempSelectedCode || !tempCodeComment.trim()) return;

    const { sectionId, medicationId } = selectedMedicationForCode;
    const codeObj = MED_CODE_MAP[tempSelectedCode];

    updateMedicationField(sectionId as any, medicationId, 'code', tempSelectedCode);
    updateMedicationField(sectionId as any, medicationId, 'comments', tempCodeComment);
    // codeType and auditFlag stored on log record at submission time:
    // codeObj.codeType, codeObj.auditFlag (auto-set, not shown in UI)

    setShowCodeDialog(false);
    setSelectedMedicationForCode(null);
    setTempSelectedCode('');
    setTempSelectedMedCode(null);
    setTempCodeComment('');
  };

  // Add new entries
  const handleAddOTCEntry = () => {
    const newEntry: OTCEntry = {
      id: `otc-${Date.now()}`,
      dispensedDate: selectedDate,
      dispensedTime: getCurrentTime(),
      medication: '',
      quantity: 0,
      comments: ''
    };
    setOtcEntries([...otcEntries, newEntry]);
  };

  const handleAddPRNEntry = () => {
    const newEntry: PRNEntry = {
      id: `prn-${Date.now()}`,
      dispensedDate: selectedDate,
      dispensedTime: getCurrentTime(),
      medication: '',
      quantity: 0,
      lastCount: 0,
      currentCount: '',
      comments: ''
    };
    setPrnEntries([...prnEntries, newEntry]);
  };

  const handleAddUnapprovedEntry = () => {
    const newEntry: UnapprovedEntry = {
      id: `unapp-${Date.now()}`,
      dispensedDate: selectedDate,
      dispensedTime: getCurrentTime(),
      medication: '',
      quantity: 1,
      doseDetail: '',
      comments: ''
    };
    setUnapprovedEntries([...unapprovedEntries, newEntry]);
  };

  // Render medication section
  const renderMedicationSection = (
    title: string,
    color: string,
    timeRange: string,
    medications: MedicationRow[],
    sectionId: string
  ) => {
    // Hide section if no medications
    if (medications.length === 0) return null;

    return (
      <div
        className="rounded-lg overflow-hidden mb-3"
        style={{
          border: '1px solid var(--slds-g-color-border-base-1)',
          backgroundColor: 'var(--slds-g-color-background-base)',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Section Header */}
        <div
          className="px-4 py-2.5 flex items-center gap-3"
          style={{ backgroundColor: color }}
        >
          <span className="font-semibold slds-text-4 text-white">{title}</span>
          <span className="text-[11px] ml-2 text-white opacity-90">{timeRange}</span>
        </div>

        {/* Medication Table */}
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Medication</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Dose</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Instructions</th>
                <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Start</th>
                <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Stop</th>
                <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Last Count</th>
                <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Current Count</th>
                <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Staff</th>
                <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Youth</th>
                <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Code</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Comments</th>
                {submittedSections.has(sectionId) && (
                  <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Status</th>
                )}
              </tr>
            </thead>
            <tbody>
              {medications.map((med) => {
                const isSubmitted = med.submitted === true;
                const rowBg = isSubmitted ? '#F0FDF4' : undefined;
                return (
                <tr key={med.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: rowBg }}>
                  <td className="px-3 py-2.5 slds-text-4 font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{med.medicationName}</td>
                  <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{med.dose}</td>
                  <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>{med.instructions}</td>
                  <td className="px-3 py-2.5 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{med.startTime}</td>
                  <td className="px-3 py-2.5 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{med.stopTime}</td>
                  <td className="px-3 py-2.5 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{med.lastCount}</td>
                  <td className="px-3 py-2.5 text-center">
                    <Input
                      type="number"
                      value={med.currentCount}
                      onChange={(e) => updateMedicationField(sectionId as any, med.id, 'currentCount', e.target.value)}
                      className="h-8 w-20 text-center slds-text-4 mx-auto"
                      placeholder="-"
                      disabled={isSubmitted}
                      style={{
                        backgroundColor: sectionErrors[sectionId] !== undefined && !med.currentCount ? '#FEE2E2' : 'var(--slds-g-color-background-base)',
                        borderColor: sectionErrors[sectionId] !== undefined && !med.currentCount ? '#DC2626' : 'var(--slds-g-color-border-base-1)',
                        color: sectionErrors[sectionId] !== undefined && !med.currentCount ? '#DC2626' : 'var(--slds-g-color-text-default)'
                      }}
                    />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => updateMedicationField(sectionId as any, med.id, 'staffDispensed', med.staffDispensed === true ? false : true)}
                      disabled={isSubmitted}
                      className="px-4 py-1 text-[11px] font-semibold rounded-full min-w-[56px]"
                      aria-pressed={med.staffDispensed === true}
                      aria-label={`Staff dispensed: ${med.staffDispensed === true ? 'Yes' : 'No'}`}
                      style={{
                        backgroundColor: med.staffDispensed === true ? '#16A34A' : '#DC2626',
                        color: '#FFFFFF',
                        border: 'none',
                        opacity: isSubmitted ? 0.6 : 1,
                        cursor: isSubmitted ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {med.staffDispensed === true ? 'Yes' : 'No'}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => updateMedicationField(sectionId as any, med.id, 'constituentReceived', med.constituentReceived === true ? false : true)}
                      disabled={isSubmitted}
                      className="px-4 py-1 text-[11px] font-semibold rounded-full min-w-[56px]"
                      aria-pressed={med.constituentReceived === true}
                      aria-label={`Youth received: ${med.constituentReceived === true ? 'Yes' : 'No'}`}
                      style={{
                        backgroundColor: med.constituentReceived === true ? '#16A34A' : '#DC2626',
                        color: '#FFFFFF',
                        border: 'none',
                        opacity: isSubmitted ? 0.6 : 1,
                        cursor: isSubmitted ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {med.constituentReceived === true ? 'Yes' : 'No'}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => handleCodeClick(sectionId, med.id, med.code, med.comments)}
                      disabled={isSubmitted}
                      title={med.code ? MED_CODE_MAP[med.code]?.fullLabel : 'Add code'}
                      className="px-2.5 py-1 slds-text-3 font-semibold rounded"
                      style={{
                        backgroundColor: med.code ? '#e8f4fd' : 'var(--slds-g-color-background-alt)',
                        color: med.code ? 'var(--color-link-blue)' : 'var(--slds-g-color-text-weak)',
                        border: `1px solid ${med.code ? '#0176d3' : 'var(--slds-g-color-border-base-1)'}`,
                        opacity: isSubmitted ? 0.6 : 1,
                        cursor: isSubmitted ? 'not-allowed' : 'pointer',
                        fontFamily: 'monospace',
                        minWidth: '44px',
                      }}
                    >
                      {med.code || 'Add'}
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <Input
                      type="text"
                      value={med.comments}
                      onChange={(e) => updateMedicationField(sectionId as any, med.id, 'comments', e.target.value)}
                      className="h-8 slds-text-4"
                      placeholder="Enter comments"
                      disabled={isSubmitted}
                    />
                  </td>
                  {submittedSections.has(sectionId) && (
                    <td className="px-3 py-2.5 text-center">
                      <div
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
                        style={{ backgroundColor: '#DCFCE7', color: '#145F33', border: '1px solid #16A34A' }}
                        aria-label="Submitted"
                      >
                        <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                        Submitted
                      </div>
                    </td>
                  )}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sectionErrors[sectionId] && (
          <div role="alert" className="px-4 py-2 slds-text-3 flex items-center gap-2" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', borderTop: '1px solid #DC2626' }}>
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {sectionErrors[sectionId]}
          </div>
        )}
        {/* Section-level Submit footer */}
        <div className="px-4 py-3 flex items-center justify-end gap-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
          <p className="slds-text-3 italic mb-0">
            I attest that I have followed Mercy Home's policies and procedures for medication dispensation & documentation.
          </p>
          {submittedSections.has(sectionId) ? (
            <div
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full slds-text-3 font-semibold flex-shrink-0"
              style={{ backgroundColor: '#DCFCE7', color: '#145F33', border: '1px solid #145F33' }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Submitted
            </div>
          ) : (
            <Button
              onClick={() => {
                if (submittedRef.current.has(sectionId)) return;
                const missing = medications.filter(med => !String(med.currentCount).trim());
                if (missing.length > 0) {
                  setSectionErrors(prev => ({
                    ...prev,
                    [sectionId]: `Enter a current count before submitting: ${missing.map(m => m.medicationName).join(', ')}.`,
                  }));
                  return;
                }
                setSectionErrors(prev => {
                  const { [sectionId]: _removed, ...rest } = prev;
                  return rest;
                });
                medications.forEach((med) => {
                  updateMedicationField(sectionId as any, med.id, 'submitted', true);
                });
                submittedRef.current.add(sectionId);
                setSubmittedSections(prev => new Set(prev).add(sectionId));
                recordSubmission(title, `${medications.length} medication${medications.length === 1 ? '' : 's'} recorded`);
                toast.success(`${title} dispensation submitted`, {
                  description: `All ${title.toLowerCase()} medications recorded for ${youth.name}.`
                });
              }}
              className="h-8 px-6 rounded-full slds-text-4 font-semibold text-white flex-shrink-0"
              style={{ backgroundColor: '#145F33' }}
            >
              Submit
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header — only shown in standalone route mode */}
      {!inline && <div
        className="px-4 py-3"
        style={{
          backgroundColor: 'var(--slds-g-color-background-base)',
          borderBottom: '1px solid var(--slds-g-color-border-base-1)'
        }}
      >
        <div className="flex items-center gap-3">
          {/* Back button */}
          <Button
            onClick={() => {
              const state = location.state as { fromProgramLog?: boolean; programId?: string; programName?: string } | null;
              navigate('/medications', { state: { fromProgramLog: state?.fromProgramLog, programId: state?.programId, programName: state?.programName } });
            }}
            className="h-8 px-4 rounded-full slds-text-4 font-medium flex items-center gap-2"
            style={{
              backgroundColor: 'var(--slds-g-color-background-base)',
              color: 'var(--slds-g-color-text-default)',
              border: '1px solid var(--slds-g-color-border-base-1)'
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Overview
          </Button>

          <div className="h-8 w-px" style={{ backgroundColor: 'var(--slds-g-color-border-base-1)' }} />

          {/* Youth Avatar */}
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: '#145F33',
              color: '#FFFFFF',
            }}
            aria-label={`${youth.name} avatar`}
          >
            <span className="slds-text-4 font-semibold">{youth.initials}</span>
          </div>

          {/* Youth Info */}
          <div>
            <h1 className="slds-text-4 font-semibold mb-0" style={{ color: 'var(--slds-g-color-text-default)' }}>
              {youth.name}
            </h1>
            <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Age {youth.age} • {youth.program}
            </p>
          </div>
          <YouthAlertIcons />

          {/* Date Display - repositioned inline next to youth info */}
          <div className="flex items-center gap-2 ml-4">
            <Calendar className="h-4 w-4" style={{ color: isToday() ? 'var(--slds-g-color-text-weak)' : '#DC2626' }} />
            <div
              className="px-3 py-1.5 rounded-lg"
              style={{
                backgroundColor: isToday() ? 'var(--slds-g-color-background-alt)' : '#FEE2E2',
                border: isToday() ? '1px solid var(--slds-g-color-border-base-1)' : '2px solid #DC2626'
              }}
            >
              <p
                className="text-[13px] font-semibold mb-0"
                style={{ color: isToday() ? 'var(--slds-g-color-text-default)' : '#DC2626' }}
              >
                {selectedDate}
              </p>
              {!isToday() && (
                <p className="text-[9px] font-semibold uppercase tracking-wide mb-0" style={{ color: '#991B1B' }}>
                  ⚠ Not Today
                </p>
              )}
            </div>
          </div>
        </div>
      </div>}

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-16" style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
        {/* Scheduled Dose Periods */}
        {renderMedicationSection('Morning', '#FFA500', '6:00 AM - 11:00 AM', morningMedications, 'morning')}
        {renderMedicationSection('Afternoon', '#16A34A', '12:00 PM - 4:59 PM', afternoonMedications, 'afternoon')}
        {renderMedicationSection('Evening', '#EAB308', '5:00 PM - 7:59 PM', eveningMedications, 'evening')}
        {renderMedicationSection('Bedtime', '#0000e0', '8:00 PM - 11:59 PM', bedtimeMedications, 'bedtime')}

        {/* Standard OTC Section - Always visible */}
        <div
          className="rounded-lg overflow-hidden mb-3"
          style={{
            border: '1px solid var(--slds-g-color-border-base-1)',
            backgroundColor: 'var(--slds-g-color-background-base)',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="px-4 py-2.5 flex items-center gap-3" style={{ backgroundColor: '#808080' }}>
            <span className="font-semibold slds-text-4 text-white">Standard OTC</span>
            <span className="text-[11px] ml-2 text-white opacity-90">Over-the-Counter Medications</span>
          </div>

          {otcEntries.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Dispensed Date</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Dispensed Time</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Medication</th>
                    <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Quantity</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Reason / Comments</th>
                    {submittedSections.has('otc') && (
                      <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Status</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {otcEntries.map((entry, index) => {
                    const otcSubmitted = submittedSections.has('otc');
                    const hasData = !!(entry.medication && entry.quantity > 0);
                    return (
                    <tr key={entry.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: otcSubmitted && hasData ? '#F0FDF4' : undefined }}>
                      <td className="px-3 py-2.5">
                        <Input type="text" value={entry.dispensedDate} className="h-8 slds-text-4" readOnly />
                      </td>
                      <td className="px-3 py-2.5">
                        <Input
                          type="text"
                          value={entry.dispensedTime}
                          onChange={(e) => {
                            const updated = [...otcEntries];
                            updated[index].dispensedTime = e.target.value;
                            setOtcEntries(updated);
                          }}
                          className="h-8 w-32 slds-text-4"
                          disabled={otcSubmitted}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <select
                          value={entry.medication}
                          onChange={(e) => {
                            const updated = [...otcEntries];
                            updated[index].medication = e.target.value;
                            setOtcEntries(updated);
                          }}
                          className="h-8 px-3 rounded slds-text-4 w-full"
                          disabled={otcSubmitted}
                          style={{
                            border: '1px solid var(--slds-g-color-border-base-1)',
                            backgroundColor: 'var(--slds-g-color-background-base)',
                            opacity: otcSubmitted ? 0.7 : 1
                          }}
                        >
                          <option value="">Select medication</option>
                          <optgroup label="Approved" style={{ color: '#16A34A', fontWeight: 'bold' }}>
                            {STANDARD_OTC_MEDICATIONS.slice(0, 6).map(med => (
                              <option key={med} value={med}>{med}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Not Approved" style={{ color: '#DC2626', fontWeight: 'bold' }}>
                            {STANDARD_OTC_MEDICATIONS.slice(6).map(med => (
                              <option key={med} value={med}>{med}</option>
                            ))}
                          </optgroup>
                        </select>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Input
                          type="number"
                          value={entry.quantity}
                          onChange={(e) => {
                            const updated = [...otcEntries];
                            updated[index].quantity = parseInt(e.target.value) || 0;
                            setOtcEntries(updated);
                          }}
                          className="h-8 w-20 text-center slds-text-4"
                          disabled={otcSubmitted}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <Input
                          type="text"
                          value={entry.comments}
                          onChange={(e) => {
                            const updated = [...otcEntries];
                            updated[index].comments = e.target.value;
                            setOtcEntries(updated);
                          }}
                          className="h-8 slds-text-4"
                          placeholder="Enter reason or comments"
                          disabled={otcSubmitted}
                        />
                      </td>
                      {otcSubmitted && (
                        <td className="px-3 py-2.5 text-center">
                          {hasData && (
                            <div
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
                              style={{ backgroundColor: '#DCFCE7', color: '#145F33', border: '1px solid #16A34A' }}
                            >
                              <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                              Submitted
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderTop: otcEntries.length > 0 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
            {otcEntries.length === 0 ? (
              <Button
                onClick={handleAddOTCEntry}
                className="h-8 px-4 rounded slds-text-4 font-medium flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  color: 'var(--slds-g-color-text-default)',
                  border: '1px solid var(--slds-g-color-border-base-1)'
                }}
              >
                <Plus className="h-4 w-4" />
                Add Entry
              </Button>
            ) : (
              <div className="flex items-center justify-end gap-3">
                <p className="slds-text-3 italic mb-0">
                  I attest that I have followed Mercy Home's policies and procedures for medication dispensation & documentation.
                </p>
                {submittedSections.has('otc') ? (
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full slds-text-3 font-semibold flex-shrink-0" style={{ backgroundColor: '#DCFCE7', color: '#145F33', border: '1px solid #145F33' }}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Submitted
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      if (submittedRef.current.has('otc')) return;
                      submittedRef.current.add('otc');
                      setSubmittedSections(prev => new Set(prev).add('otc'));
                      recordSubmission('Standard OTC', 'Standard OTC entries recorded');
                      toast.success('Standard OTC dispensation submitted', { description: `OTC medications recorded for ${youth.name}.` });
                    }}
                    className="h-8 px-6 rounded-full slds-text-4 font-semibold text-white flex-shrink-0"
                    style={{ backgroundColor: '#145F33' }}
                  >
                    Submit
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* PRN Section - Always visible */}
        <div
          className="rounded-lg overflow-hidden mb-3"
          style={{
            border: '1px solid var(--slds-g-color-border-base-1)',
            backgroundColor: 'var(--slds-g-color-background-base)',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="px-4 py-2.5 flex items-center gap-3" style={{ backgroundColor: '#000000' }}>
            <span className="font-semibold slds-text-4 text-white">PRN (As Needed)</span>
            <span className="text-[11px] ml-2 text-white opacity-90">Emergency & As-Needed Medications</span>
          </div>

          {prnEntries.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Dispensed Date</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Dispensed Time</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Medication</th>
                    <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Quantity</th>
                    <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Last Count</th>
                    <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Current Count</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Reason / Comments</th>
                    {submittedSections.has('prn') && (
                      <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Status</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {prnEntries.map((entry, index) => {
                    const prnSubmitted = submittedSections.has('prn');
                    const hasData = !!(entry.medication && entry.quantity > 0);
                    return (
                    <tr key={entry.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: prnSubmitted && hasData ? '#F0FDF4' : undefined }}>
                      <td className="px-3 py-2.5">
                        <Input type="text" value={entry.dispensedDate} className="h-8 slds-text-4" readOnly />
                      </td>
                      <td className="px-3 py-2.5">
                        <Input
                          type="text"
                          value={entry.dispensedTime}
                          onChange={(e) => {
                            const updated = [...prnEntries];
                            updated[index].dispensedTime = e.target.value;
                            setPrnEntries(updated);
                          }}
                          className="h-8 w-32 slds-text-4"
                          disabled={prnSubmitted}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <select
                          value={entry.medication}
                          onChange={(e) => {
                            const updated = [...prnEntries];
                            updated[index].medication = e.target.value;
                            setPrnEntries(updated);
                          }}
                          className="h-8 px-3 rounded slds-text-4 w-full"
                          disabled={prnSubmitted}
                          style={{
                            border: '1px solid var(--slds-g-color-border-base-1)',
                            backgroundColor: 'var(--slds-g-color-background-base)',
                            opacity: prnSubmitted ? 0.7 : 1
                          }}
                        >
                          <option value="">Select PRN medication</option>
                          <option value="Epi-Pen">Epi-Pen (Auto-injector)</option>
                          <option value="Albuterol">Albuterol (Inhaler)</option>
                          <option value="Ibuprofen">Ibuprofen PRN</option>
                        </select>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Input
                          type="number"
                          value={entry.quantity}
                          onChange={(e) => {
                            const updated = [...prnEntries];
                            updated[index].quantity = parseInt(e.target.value) || 0;
                            setPrnEntries(updated);
                          }}
                          className="h-8 w-20 text-center slds-text-4"
                          disabled={prnSubmitted}
                        />
                      </td>
                      <td className="px-3 py-2.5 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        {entry.lastCount}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Input
                          type="number"
                          value={entry.currentCount}
                          onChange={(e) => {
                            const updated = [...prnEntries];
                            updated[index].currentCount = e.target.value;
                            setPrnEntries(updated);
                          }}
                          className="h-8 w-20 text-center slds-text-4"
                          placeholder="-"
                          disabled={prnSubmitted}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <Input
                          type="text"
                          value={entry.comments}
                          onChange={(e) => {
                            const updated = [...prnEntries];
                            updated[index].comments = e.target.value;
                            setPrnEntries(updated);
                          }}
                          className="h-8 slds-text-4"
                          placeholder="Enter reason or comments"
                          disabled={prnSubmitted}
                        />
                      </td>
                      {prnSubmitted && (
                        <td className="px-3 py-2.5 text-center">
                          {hasData && (
                            <div
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
                              style={{ backgroundColor: '#DCFCE7', color: '#145F33', border: '1px solid #16A34A' }}
                            >
                              <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                              Submitted
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderTop: prnEntries.length > 0 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
            {prnEntries.length === 0 ? (
              <Button
                onClick={handleAddPRNEntry}
                className="h-8 px-4 rounded slds-text-4 font-medium flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  color: 'var(--slds-g-color-text-default)',
                  border: '1px solid var(--slds-g-color-border-base-1)'
                }}
              >
                <Plus className="h-4 w-4" />
                Add Entry
              </Button>
            ) : (
              <div className="flex items-center justify-end gap-3">
                <p className="slds-text-3 italic mb-0">
                  I attest that I have followed Mercy Home's policies and procedures for medication dispensation & documentation.
                </p>
                {submittedSections.has('prn') ? (
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full slds-text-3 font-semibold flex-shrink-0" style={{ backgroundColor: '#DCFCE7', color: '#145F33', border: '1px solid #145F33' }}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Submitted
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      if (submittedRef.current.has('prn')) return;
                      submittedRef.current.add('prn');
                      setSubmittedSections(prev => new Set(prev).add('prn'));
                      recordSubmission('PRN', 'PRN entries recorded');
                      toast.success('PRN dispensation submitted', { description: `PRN medications recorded for ${youth.name}.` });
                    }}
                    className="h-8 px-6 rounded-full slds-text-4 font-semibold text-white flex-shrink-0"
                    style={{ backgroundColor: '#145F33' }}
                  >
                    Submit
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Unapproved Medications Section - Always visible */}
        <div
          className="rounded-lg overflow-hidden mb-3"
          style={{
            border: '1px solid var(--slds-g-color-border-base-1)',
            backgroundColor: 'var(--slds-g-color-background-base)',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="px-4 py-2.5" style={{ backgroundColor: '#DC2626' }}>
            <div className="flex items-center gap-3">
              <span className="font-semibold slds-text-4 text-white">Unapproved Medications</span>
              <span className="text-[11px] ml-2 text-white opacity-90">Medications Not Pre-Approved</span>
            </div>
          </div>

          {unapprovedEntries.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Dispensed Date</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Dispensed Time</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Medication</th>
                    <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Quantity</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Dose Detail</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Comments</th>
                    {submittedSections.has('unapproved') && (
                      <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>Status</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {unapprovedEntries.map((entry, index) => {
                    const unapprovedSubmitted = submittedSections.has('unapproved');
                    const hasData = !!(entry.medication);
                    return (
                    <tr key={entry.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: unapprovedSubmitted && hasData ? '#F0FDF4' : undefined }}>
                      <td className="px-3 py-2.5">
                        <Input type="text" value={entry.dispensedDate} className="h-8 slds-text-4" readOnly />
                      </td>
                      <td className="px-3 py-2.5">
                        <Input
                          type="text"
                          value={entry.dispensedTime}
                          onChange={(e) => {
                            const updated = [...unapprovedEntries];
                            updated[index].dispensedTime = e.target.value;
                            setUnapprovedEntries(updated);
                          }}
                          className="h-8 w-32 slds-text-4"
                          disabled={unapprovedSubmitted}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <Input
                          type="text"
                          value={entry.medication}
                          onChange={(e) => {
                            const updated = [...unapprovedEntries];
                            updated[index].medication = e.target.value;
                            setUnapprovedEntries(updated);
                          }}
                          className="h-8 slds-text-4"
                          placeholder="Enter medication name"
                          disabled={unapprovedSubmitted}
                        />
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Input
                          type="number"
                          value={entry.quantity}
                          onChange={(e) => {
                            const updated = [...unapprovedEntries];
                            updated[index].quantity = parseInt(e.target.value) || 1;
                            setUnapprovedEntries(updated);
                          }}
                          className="h-8 w-20 text-center slds-text-4"
                          disabled={unapprovedSubmitted}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <Input
                          type="text"
                          value={entry.doseDetail}
                          onChange={(e) => {
                            const updated = [...unapprovedEntries];
                            updated[index].doseDetail = e.target.value;
                            setUnapprovedEntries(updated);
                          }}
                          className="h-8 slds-text-4"
                          placeholder="e.g., 10mg"
                          disabled={unapprovedSubmitted}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <Textarea
                          value={entry.comments}
                          onChange={(e) => {
                            const updated = [...unapprovedEntries];
                            updated[index].comments = e.target.value;
                            setUnapprovedEntries(updated);
                          }}
                          className="min-h-[60px] slds-text-4"
                          placeholder="Describe what contributed to the unapproved dispensation, action steps taken, and individuals consulted/contacted."
                          disabled={unapprovedSubmitted}
                        />
                      </td>
                      {unapprovedSubmitted && (
                        <td className="px-3 py-2.5 text-center align-top pt-3">
                          {hasData && (
                            <div
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
                              style={{ backgroundColor: '#DCFCE7', color: '#145F33', border: '1px solid #16A34A' }}
                            >
                              <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                              Submitted
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-4 py-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderTop: unapprovedEntries.length > 0 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
            {unapprovedEntries.length === 0 ? (
              <Button
                onClick={handleAddUnapprovedEntry}
                className="h-8 px-4 rounded slds-text-4 font-medium flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  color: 'var(--slds-g-color-text-default)',
                  border: '1px solid var(--slds-g-color-border-base-1)'
                }}
              >
                <Plus className="h-4 w-4" />
                Add Entry
              </Button>
            ) : (
              <div className="flex items-center justify-end gap-3">
                <p className="slds-text-3 italic mb-0">
                  I attest that I have followed Mercy Home's policies and procedures for medication dispensation & documentation.
                </p>
                {submittedSections.has('unapproved') ? (
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full slds-text-3 font-semibold flex-shrink-0" style={{ backgroundColor: '#DCFCE7', color: '#145F33', border: '1px solid #145F33' }}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Submitted
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      if (submittedRef.current.has('unapproved')) return;
                      submittedRef.current.add('unapproved');
                      setSubmittedSections(prev => new Set(prev).add('unapproved'));
                      recordSubmission('Unapproved', 'Unapproved medication entries recorded');
                      toast.success('Unapproved medication dispensation submitted', { description: `Unapproved medications recorded for ${youth.name}.` });
                    }}
                    className="h-8 px-6 rounded-full slds-text-4 font-semibold text-white flex-shrink-0"
                    style={{ backgroundColor: '#145F33' }}
                  >
                    Submit
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {submissionLog.length > 0 && (
          <div className="rounded-lg overflow-hidden mb-3" style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}>
            <div className="px-4 py-2.5 font-semibold slds-text-4" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}>
              Submission History <span className="slds-text-3 font-normal" style={{ color: 'var(--slds-g-color-text-weak)' }}>(this session)</span>
            </div>
            <ul className="mb-0 list-none p-0" aria-label="Submission history">
              {submissionLog.map(row => (
                <li key={row.id} className="px-4 py-2 slds-text-4 flex flex-wrap items-center gap-x-4" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}>
                  <span className="font-semibold">{row.section}</span>
                  <span>{row.detail}</span>
                  <span style={{ color: 'var(--slds-g-color-text-weak)' }}>by {row.by} on {row.at}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Code Selection Dialog */}
      <Dialog open={showCodeDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCodeDialog(false);
          setSelectedMedicationForCode(null);
          setTempSelectedCode('');
          setTempSelectedMedCode(null);
          setTempCodeComment('');
        }
      }}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
            <DialogTitle>Select Code</DialogTitle>
            <DialogDescription>
              Choose a code and provide a comment for this medication.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 px-6 py-4 overflow-y-auto flex-1">
            {/* Code selector — grouped per spec */}
            <div>
              <Label className="slds-form-label mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                CODE <span className="text-red-600">*</span>
              </Label>
              <MedicationCodeSelector
                codes={[]}
                value={tempSelectedCode}
                onChange={(c: MedCode | null) => {
                  setTempSelectedCode(c?.code ?? '');
                  setTempSelectedMedCode(c);
                }}
                showGroups
                groupedCodes={GROUPED_CODES}
                maxHeight={300}
              />
            </div>

            {/* Audit flag warning */}
            {tempSelectedMedCode?.auditFlag && (
              <p className="slds-text-3 flex items-center gap-1.5" style={{ color: '#ca8a04' }}>
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                This code will trigger an audit flag on the log record.
              </p>
            )}

            {/* Comment — required for all codes */}
            <div className="space-y-1.5">
              <Label htmlFor="code-comment" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                COMMENT <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="code-comment"
                value={tempCodeComment}
                onChange={(e) => setTempCodeComment(e.target.value)}
                disabled={!tempSelectedCode}
                className="min-h-[80px] slds-text-4"
                placeholder={tempSelectedCode ? 'Enter comment (required)' : 'Select a code first'}
                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t flex-shrink-0" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
            <Button
              onClick={() => setShowCodeDialog(false)}
              className="h-9 px-6 rounded-full slds-text-4 font-medium"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                color: 'var(--slds-g-color-text-default)',
                border: '1px solid var(--slds-g-color-border-base-1)'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCode}
              disabled={!tempSelectedCode || !tempCodeComment.trim()}
              className="h-9 px-6 rounded-full slds-text-4 font-semibold text-white"
              style={{ backgroundColor: '#145F33' }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
