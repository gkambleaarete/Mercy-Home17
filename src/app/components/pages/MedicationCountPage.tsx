import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { ArrowLeft, ArrowUpDown, Trash2 } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner@2.0.3";
import { countStore } from "../../shared/countStore";
import { getDemoUserName } from "../../lib/demoIdentity";
import { useUnsavedChangesGuard } from "../../lib/useUnsavedChangesGuard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface MedicationCountRow {
  id: string;
  dosePeriod: string;
  medicationName: string;
  dose: string;
  countType: 'Units' | 'Volume';
  lastCount: string;
  currentCount: string;
  comments: string;
  medicationId: string;
  hasChanges: boolean;
}

interface CountLogEntry {
  id: number;
  medication: string;
  dose: string;
  dosePeriod: string;
  count: string;
  comments: string;
  attestationStaff: string;
  attestationDate: string;
}

type SortField = 'dosePeriod' | 'medicationName' | 'countType' | 'lastCount';
type SortDirection = 'asc' | 'desc';

const VOLUME_OPTIONS = ['Full', '3/4', '1/2', '1/4', 'Empty'];

export function MedicationCountPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  // Get current date
  const getCurrentDate = () => {
    const today = new Date();
    return `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
  };

  const currentDate = getCurrentDate();

  // Mock youth data
  const youth = {
    id: id || '1',
    name: 'Alex Martinez',
    age: 16,
    program: 'West Campus Program'
  };

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('dosePeriod');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [countLogs, setCountLogs] = useState<CountLogEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLock = useRef(false);
  const [submitError, setSubmitError] = useState('');
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

  // Mock medication data - includes Prescription and Supplemental OTC (excludes Standard OTC)
  const [medications, setMedications] = useState<MedicationCountRow[]>([
    {
      id: 'm1',
      dosePeriod: 'Morning',
      medicationName: 'Adderall XR',
      dose: '20mg',
      countType: 'Units',
      lastCount: '30',
      currentCount: '',
      comments: '',
      medicationId: 'med-001',
      hasChanges: false
    },
    {
      id: 'm2',
      dosePeriod: 'Morning',
      medicationName: 'Vitamin D',
      dose: '1000 IU',
      countType: 'Units',
      lastCount: '60',
      currentCount: '',
      comments: '',
      medicationId: 'med-002',
      hasChanges: false
    },
    {
      id: 'm3',
      dosePeriod: 'Afternoon',
      medicationName: 'Zoloft',
      dose: '50mg',
      countType: 'Units',
      lastCount: '25',
      currentCount: '',
      comments: '',
      medicationId: 'med-003',
      hasChanges: false
    },
    {
      id: 'm4',
      dosePeriod: 'Bedtime',
      medicationName: 'Melatonin',
      dose: '5mg',
      countType: 'Units',
      lastCount: '45',
      currentCount: '',
      comments: '',
      medicationId: 'med-004',
      hasChanges: false
    },
    {
      id: 'm5',
      dosePeriod: 'Morning',
      medicationName: 'Albuterol Inhaler',
      dose: '90mcg',
      countType: 'Volume',
      lastCount: 'Full',
      currentCount: '',
      comments: '',
      medicationId: 'med-005',
      hasChanges: false
    }
  ]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort medications
  const sortedMedications = [...medications].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Convert to numbers for lastCount comparison
    if (sortField === 'lastCount') {
      const aNum = parseFloat(aValue) || 0;
      const bNum = parseFloat(bValue) || 0;
      return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
    }

    // String comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  // Update medication field
  const updateMedication = (id: string, field: keyof MedicationCountRow, value: string) => {
    setMedications(prev =>
      prev.map(med =>
        med.id === id ? { ...med, [field]: value, hasChanges: true } : med
      )
    );
    setHasUnsavedChanges(true);
  };

  // Format current count for Units type
  const formatUnitsCount = (value: string): string => {
    // Remove non-numeric characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, '');

    // Split on decimal point
    const parts = cleaned.split('.');

    // Limit integer part to 3 digits
    const integerPart = parts[0].slice(0, 3);

    // Limit decimal part to 2 digits
    const decimalPart = parts[1] ? parts[1].slice(0, 2) : '';

    return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
  };

  // Handle current count change
  const handleCurrentCountChange = (id: string, value: string, countType: 'Units' | 'Volume') => {
    if (countType === 'Units') {
      const formatted = formatUnitsCount(value);
      updateMedication(id, 'currentCount', formatted);
    } else {
      updateMedication(id, 'currentCount', value);
    }
  };

  // Handle submit
  const handleSubmit = () => {
    if (submitLock.current) return;
    // Filter medications with changes
    const updatedMedications = medications.filter(med => med.hasChanges);

    if (updatedMedications.length === 0) {
      return;
    }

    // Inline validation: a Units count must be a valid number
    const errors: Record<string, string> = {};
    updatedMedications.forEach(med => {
      if (med.countType === 'Units' && med.currentCount !== '' && !/^\d+(\.\d{1,2})?$/.test(med.currentCount)) {
        errors[med.id] = 'Enter a valid number, e.g. 12 or 12.5.';
      }
    });
    setRowErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSubmitError('Fix the highlighted counts before submitting.');
      return;
    }

    submitLock.current = true;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const now = new Date();
      const stamp = `${currentDate} ${now.toLocaleTimeString('en-US')}`;
      const actingUser = getDemoUserName();

      // Mock update of the shared count store (frontend-only)
      updatedMedications.forEach(med => {
        if (med.currentCount.trim()) {
          countStore.upsert({
            scope: `youth-${youth.id}-count-page`,
            date: currentDate,
            dosePeriod: med.dosePeriod,
            medicationId: parseInt(med.medicationId.replace(/\D/g, ''), 10) || 0,
            medication: med.medicationName,
            dose: med.dose,
            countType: med.countType,
            quantity: med.currentCount,
            attestationDate: now.toISOString(),
            source: 'CountPage'
          });
        }
      });

      const newLogs: CountLogEntry[] = updatedMedications.map((med, i) => ({
        id: now.getTime() + i,
        medication: med.medicationName,
        dose: med.dose,
        dosePeriod: med.dosePeriod,
        count: med.currentCount,
        comments: med.comments,
        attestationStaff: actingUser,
        attestationDate: stamp
      }));

      // Update Last Count, clear entry fields
      setMedications(prev =>
        prev.map(med =>
          med.hasChanges
            ? {
                ...med,
                lastCount: med.currentCount.trim() ? med.currentCount : med.lastCount,
                currentCount: '',
                comments: '',
                hasChanges: false
              }
            : med
        )
      );
      setCountLogs(prev => [...newLogs, ...prev]);
      setHasUnsavedChanges(false);
      toast.success(`${updatedMedications.length} count record${updatedMedications.length !== 1 ? 's' : ''} successfully updated.`);
    } catch {
      // Entered values stay in the table so the user can retry
      setSubmitError('Counts could not be saved. Your entries were kept; please try again.');
      toast.error('Counts could not be saved.');
    } finally {
      setTimeout(() => { submitLock.current = false; }, 400);
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    // Reset all changes
    setMedications(prev =>
      prev.map(med => ({ ...med, currentCount: '', comments: '', hasChanges: false }))
    );
    setHasUnsavedChanges(false);
    setRowErrors({});
    setSubmitError('');
  };

  const leaveGuard = useUnsavedChangesGuard(hasUnsavedChanges, handleCancel);

  // Handle disposal action
  const handleDisposal = (medicationId: string) => {
    // Disposal workflow is a separate ticket; not wired in this prototype.
    void medicationId;
    toast.info('The disposal workflow is not available in this prototype.');
  };

  // Warn on navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Check if submit should be enabled
  const isSubmitEnabled = medications.some(med => med.hasChanges);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {leaveGuard}
      {/* Youth Profile Header */}
      <div
        className="px-4 py-3"
        style={{
          backgroundColor: 'var(--slds-g-color-background-base)',
          borderBottom: '1px solid var(--slds-g-color-border-base-1)'
        }}
      >
        <div className="flex items-center justify-between">
          {/* Left: Back button and Youth Info */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate(-1)}
              className="h-8 px-4 rounded-full slds-text-4 font-medium flex items-center gap-2"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                color: 'var(--slds-g-color-text-default)',
                border: '1px solid var(--slds-g-color-border-base-1)'
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="h-8 w-px" style={{ backgroundColor: 'var(--slds-g-color-border-base-1)' }} />

            <div>
              <h1 className="slds-text-4 font-semibold mb-0" style={{ color: 'var(--slds-g-color-text-default)' }}>
                {youth.name} - Medication Count
              </h1>
              <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Age {youth.age} • {youth.program}
              </p>
            </div>
          </div>

          {/* Right: Current Date Display */}
          <div className="flex items-center gap-2">
            <div
              className="px-3 py-1.5 rounded-lg"
              style={{
                backgroundColor: 'var(--slds-g-color-background-alt)',
                border: '1px solid var(--slds-g-color-border-base-1)'
              }}
            >
              <p className="text-[13px] font-semibold mb-0" style={{ color: 'var(--slds-g-color-text-default)' }}>
                {currentDate}
              </p>
              <p className="text-[10px] mb-0" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Current Date Only
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable Table */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
        <div
          className="rounded-lg overflow-hidden"
          style={{
            border: '1px solid var(--slds-g-color-border-base-1)',
            backgroundColor: 'var(--slds-g-color-background-base)',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                  <th
                    className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                    onClick={() => handleSort('dosePeriod')}
                  >
                    <div className="flex items-center gap-2">
                      Dose Period
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                    onClick={() => handleSort('medicationName')}
                  >
                    <div className="flex items-center gap-2">
                      Medication / Dose
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                    onClick={() => handleSort('countType')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Count Type
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                    onClick={() => handleSort('lastCount')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Last Count
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Current Count
                  </th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Comments
                  </th>
                  <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedMedications.map((med) => (
                  <tr key={med.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                    <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {med.dosePeriod}
                    </td>
                    <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      <div className="font-medium">{med.medicationName}</div>
                      <div className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>{med.dose}</div>
                    </td>
                    <td className="px-3 py-2.5 text-center slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {med.countType}
                    </td>
                    <td className="px-3 py-2.5 text-center slds-text-4 font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {med.lastCount || '0'}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {med.countType === 'Units' ? (
                        <Input
                          type="text"
                          id={`count-${med.id}`}
                          aria-label={`Current count for ${med.medicationName} ${med.dose}`}
                          aria-invalid={!!rowErrors[med.id]}
                          aria-describedby={rowErrors[med.id] ? `count-${med.id}-err` : undefined}
                          value={med.currentCount}
                          onChange={(e) => handleCurrentCountChange(med.id, e.target.value, med.countType)}
                          className="h-8 w-24 text-center slds-text-4"
                          placeholder="-"
                          style={{
                            borderColor: 'var(--slds-g-color-border-base-1)',
                            backgroundColor: 'var(--slds-g-color-background-base)'
                          }}
                        />
                      ) : (
                        <Select
                          value={med.currentCount}
                          onValueChange={(value) => updateMedication(med.id, 'currentCount', value)}
                        >
                          <SelectTrigger
                            aria-label={`Current count for ${med.medicationName} ${med.dose}`}
                            className="h-8 w-28 slds-text-4"
                            style={{
                              borderColor: 'var(--slds-g-color-border-base-1)',
                              backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                          >
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            {VOLUME_OPTIONS.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {rowErrors[med.id] && (
                        <p id={`count-${med.id}-err`} role="alert" className="slds-text-3 mt-1 mb-0" style={{ color: '#c23934' }}>
                          {rowErrors[med.id]}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <Input
                        type="text"
                        aria-label={`Comments for ${med.medicationName} ${med.dose}`}
                        value={med.comments}
                        onChange={(e) => updateMedication(med.id, 'comments', e.target.value)}
                        className="h-8 slds-text-4"
                        placeholder="Enter comments"
                        style={{
                          borderColor: 'var(--slds-g-color-border-base-1)',
                          backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <Button
                        onClick={() => handleDisposal(med.medicationId)}
                        className="h-8 px-3 rounded slds-text-4 font-medium flex items-center gap-2"
                        style={{
                          backgroundColor: 'var(--slds-g-color-background-base)',
                          color: 'var(--slds-g-color-text-default)',
                          border: '1px solid var(--slds-g-color-border-base-1)'
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Disposal
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer with Attestation and Actions */}
          <div
            className="px-4 py-3 flex items-center justify-end gap-3"
            style={{
              backgroundColor: 'var(--slds-g-color-background-alt)',
              borderTop: '1px solid var(--slds-g-color-border-base-1)'
            }}
          >
            {submitError && (
              <p role="alert" className="slds-text-3 font-medium mb-0" style={{ color: '#c23934' }}>{submitError}</p>
            )}
            <p className="slds-text-3 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              I attest that I have followed the policies and procedure of Medicine Dispensation & Documentation
            </p>
            <Button
              onClick={handleCancel}
              disabled={!isSubmitEnabled}
              className="h-8 px-6 rounded-full slds-text-4 font-medium"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                color: isSubmitEnabled ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                opacity: isSubmitEnabled ? 1 : 0.5,
                cursor: isSubmitEnabled ? 'pointer' : 'not-allowed'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isSubmitEnabled || isSubmitting}
              aria-busy={isSubmitting}
              className="h-8 px-6 rounded-full slds-text-4 font-semibold text-white"
              style={{
                backgroundColor: '#145F33',
                opacity: isSubmitEnabled ? 1 : 0.5,
                cursor: isSubmitEnabled ? 'pointer' : 'not-allowed'
              }}
            >
              {isSubmitting ? 'Submitting\u2026' : 'Submit'}
            </Button>
          </div>
        </div>

        {countLogs.length > 0 && (
          <div
            className="mt-4 rounded-lg overflow-hidden"
            role="region"
            aria-label="Count log"
            style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
          >
            <div className="px-3 py-2" style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
              <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                Count log ({countLogs.length})
              </span>
              <span className="slds-text-3 ml-2" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Read-only entries from this session
              </span>
            </div>
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Medication', 'Dose period', 'Count', 'Comments', 'Attested by', 'Attested at'].map(h => (
                    <th key={h} className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {countLogs.map(l => (
                  <tr key={l.id} style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                    <td className="px-3 py-1.5 slds-text-3">{l.medication} {l.dose}</td>
                    <td className="px-3 py-1.5 slds-text-3">{l.dosePeriod}</td>
                    <td className="px-3 py-1.5 slds-text-3">{l.count || '-'}</td>
                    <td className="px-3 py-1.5 slds-text-3">{l.comments || '-'}</td>
                    <td className="px-3 py-1.5 slds-text-3">{l.attestationStaff}</td>
                    <td className="px-3 py-1.5 slds-text-3">{l.attestationDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
