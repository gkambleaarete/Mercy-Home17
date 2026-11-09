import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, ArrowUpDown } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { toast } from "sonner@2.0.3";
import { getDemoUserName } from "../../lib/demoIdentity";

interface DisposalRecord {
  id: string;
  status: 'Med Cart' | 'Lockbox' | 'Pharmacy Transfer (Pending)' | 'Pharmacy Transfer (Verified)';
  medication: string;
  dose: string;
  youth: string;
  date: string;
  amount: string;
  disposalStaff: string;
  originalComment: string;
  addComment: string;
  hasChanges: boolean;
  /** Status as of the last Submit/Cancel, used for log transitions and Cancel. */
  savedStatus?: DisposalRecord['status'];
}

interface DisposalLogEntry {
  id: string;
  logType: string;
  date: string;
  medication: string;
  dose: string;
  youth: string;
  count: string;
  comments: string;
  attestationStaff: string;
  attestationDate: string;
  attestationText: string;
}

interface AttestationEntry {
  id: string;
  type: string;
  timestamp: string;
  staff: string;
  text: string;
}

const ATTESTATION_TEXT = 'I attest that I have followed the policies and procedure of Medicine Dispensation & Documentation';

type SortField = 'status' | 'medication' | 'dose' | 'youth' | 'date' | 'amount' | 'disposalStaff';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'All statuses' | 'Med Cart' | 'Lockbox' | 'Pharmacy Transfer (Pending)' | 'Pharmacy Transfer (Verified)';

const STATUS_STYLES = {
  'Med Cart': {
    bg: '#FFF4E6',
    text: '#C05621',
    border: '#FED7AA'
  },
  'Lockbox': {
    bg: '#E3F2FD',
    text: '#0176d3',
    border: '#90CAF9'
  },
  'Pharmacy Transfer (Pending)': {
    bg: '#FFF9E6',
    text: '#92400E',
    border: '#FDE68A'
  },
  'Pharmacy Transfer (Verified)': {
    bg: '#E8F5E9',
    text: '#145F33',
    border: '#A5D6A7'
  }
};

export function DisposalQueue() {
  const navigate = useNavigate();

  // Program context carried from Medication Overview
  const programName = 'West Campus Program';

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Filter state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All statuses');

  // Selection state
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Mass action state
  const [massActionStatus, setMassActionStatus] = useState('');

  // Cancel confirmation dialog
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Add Disposal modal state
  const [showAddDisposalModal, setShowAddDisposalModal] = useState(false);
  const [showAddDisposalCancelDialog, setShowAddDisposalCancelDialog] = useState(false);

  // Add Disposal form state
  const [disposalDate, setDisposalDate] = useState('');
  const [selectedYouth, setSelectedYouth] = useState('');
  const [selectedMedication, setSelectedMedication] = useState('');
  const [amountDisposed, setAmountDisposed] = useState('');
  const [disposalComments, setDisposalComments] = useState('');
  const [addAttempted, setAddAttempted] = useState(false);

  // Session log + attestation records (mock, in-memory)
  const [logEntries, setLogEntries] = useState<DisposalLogEntry[]>([]);
  const [attestationEntries, setAttestationEntries] = useState<AttestationEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLock = useRef(false);
  const addSubmitLock = useRef(false);
  const [submitError, setSubmitError] = useState('');

  // Mock youth data for current program
  const PROGRAM_YOUTHS = [
    { id: 'y1', name: 'Alex Martinez' },
    { id: 'y2', name: 'Jordan Chen' },
    { id: 'y3', name: 'Taylor Rodriguez' },
    { id: 'y4', name: 'Sam Williams' },
    { id: 'y5', name: 'Casey Brown' }
  ];

  // Mock medication data by youth (with count type)
  const YOUTH_MEDICATIONS = {
    'y1': [
      { id: 'm1', name: 'Adderall XR', dosePeriod: 'Morning', dose: '20mg', countType: 'Units' },
      { id: 'm2', name: 'Melatonin', dosePeriod: 'Bedtime', dose: '5mg', countType: 'Units' }
    ],
    'y2': [
      { id: 'm3', name: 'Zoloft', dosePeriod: 'Morning', dose: '50mg', countType: 'Units' },
      { id: 'm4', name: 'Albuterol Inhaler', dosePeriod: 'PRN', dose: '90mcg', countType: 'Volume' }
    ],
    'y3': [
      { id: 'm5', name: 'Vitamin D', dosePeriod: 'Morning', dose: '1000 IU', countType: 'Units' }
    ],
    'y4': [
      { id: 'm6', name: 'Clonidine', dosePeriod: 'Evening', dose: '0.1mg', countType: 'Units' }
    ],
    'y5': [
      { id: 'm7', name: 'Ibuprofen Liquid', dosePeriod: 'PRN', dose: '200mg/5mL', countType: 'Volume' }
    ]
  };

  const VOLUME_OPTIONS = ['Full', '3/4', '1/2', '1/4'];

  // Mock disposal records (excluding Pharmacy Transfer Verified status)
  const [disposalRecords, setDisposalRecords] = useState<DisposalRecord[]>([
    {
      id: 'dr1',
      status: 'Med Cart',
      medication: 'Adderall XR',
      dose: '20mg',
      youth: 'Alex Martinez',
      date: '05/19/2026',
      amount: '15 tablets',
      disposalStaff: 'Sarah Johnson',
      originalComment: 'Youth discharged, remaining medication to be disposed',
      addComment: '',
      hasChanges: false
    },
    {
      id: 'dr2',
      status: 'Lockbox',
      medication: 'Zoloft',
      dose: '50mg',
      youth: 'Jordan Chen',
      date: '05/18/2026',
      amount: '8 tablets',
      disposalStaff: 'Michael Chen',
      originalComment: 'Medication discontinued per doctor orders',
      addComment: '',
      hasChanges: false
    },
    {
      id: 'dr3',
      status: 'Pharmacy Transfer (Pending)',
      medication: 'Melatonin',
      dose: '5mg',
      youth: 'Taylor Rodriguez',
      date: '05/17/2026',
      amount: '12 tablets',
      disposalStaff: 'Emily Rodriguez',
      originalComment: 'Expired medication',
      addComment: '',
      hasChanges: false
    },
    {
      id: 'dr4',
      status: 'Med Cart',
      medication: 'Albuterol Inhaler',
      dose: '90mcg',
      youth: 'Sam Williams',
      date: '05/19/2026',
      amount: '1/4 full',
      disposalStaff: 'Sarah Johnson',
      originalComment: 'Youth no longer requires PRN medication',
      addComment: '',
      hasChanges: false
    },
    {
      id: 'dr5',
      status: 'Lockbox',
      medication: 'Vitamin D',
      dose: '1000 IU',
      youth: 'Casey Brown',
      date: '05/16/2026',
      amount: '20 tablets',
      disposalStaff: 'David Thompson',
      originalComment: '',
      addComment: '',
      hasChanges: false
    }
  ]);

  // Get current date
  const getCurrentDate = () => {
    const today = new Date();
    return `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
  };

  // Handle Add Disposal button click
  const handleAddDisposalClick = () => {
    setDisposalDate(getCurrentDate());
    setSelectedYouth('');
    setSelectedMedication('');
    setAmountDisposed('');
    setDisposalComments('');
    setAddAttempted(false);
    setShowAddDisposalModal(true);
  };

  // Get medications for selected youth
  const getYouthMedications = () => {
    if (!selectedYouth) return [];
    return YOUTH_MEDICATIONS[selectedYouth as keyof typeof YOUTH_MEDICATIONS] || [];
  };

  // Get selected medication details
  const getSelectedMedicationDetails = () => {
    const medications = getYouthMedications();
    return medications.find(m => m.id === selectedMedication);
  };

  // Format amount for Units type
  const formatUnitsAmount = (value: string): string => {
    const cleaned = value.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    const integerPart = parts[0].slice(0, 3);
    const decimalPart = parts[1] ? parts[1].slice(0, 2) : '';
    return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
  };

  // Handle amount change
  const handleAmountChange = (value: string) => {
    const medicationDetails = getSelectedMedicationDetails();
    if (medicationDetails?.countType === 'Units') {
      setAmountDisposed(formatUnitsAmount(value));
    } else {
      setAmountDisposed(value);
    }
  };

  // Check if Add Disposal form is valid
  const isAddDisposalFormValid = !!(disposalDate && selectedYouth && selectedMedication && amountDisposed && disposalComments.trim());

  const isDisposalDateValid = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/.test(disposalDate.trim());

  // Handle Add Disposal submit
  const handleAddDisposalSubmit = () => {
    if (addSubmitLock.current) return;
    setAddAttempted(true);
    if (!isAddDisposalFormValid || !isDisposalDateValid) return;

    const youthData = PROGRAM_YOUTHS.find(y => y.id === selectedYouth);
    const medicationDetails = getSelectedMedicationDetails();

    if (!youthData || !medicationDetails) return;
    addSubmitLock.current = true;

    try {
      const actingUser = getDemoUserName();
      const stamp = `${getCurrentDate()} ${new Date().toLocaleTimeString('en-US')}`;

      const newDisposalRecord: DisposalRecord = {
        id: `dr${Date.now()}`,
        status: 'Med Cart',
        medication: medicationDetails.name,
        dose: medicationDetails.dose,
        youth: youthData.name,
        date: disposalDate,
        amount: medicationDetails.countType === 'Units' ? `${amountDisposed} tablets` : amountDisposed,
        disposalStaff: actingUser,
        originalComment: disposalComments,
        addComment: '',
        hasChanges: false
      };

      const logEntry: DisposalLogEntry = {
        id: `log${Date.now()}`,
        logType: 'Disposal',
        date: disposalDate,
        medication: medicationDetails.name,
        dose: medicationDetails.dose,
        youth: youthData.name,
        count: newDisposalRecord.amount,
        comments: disposalComments,
        attestationStaff: actingUser,
        attestationDate: stamp,
        attestationText: ATTESTATION_TEXT
      };

      setDisposalRecords(prev => [newDisposalRecord, ...prev]);
      setLogEntries(prev => [logEntry, ...prev]);
      setAttestationEntries(prev => [
        { id: `att${Date.now()}`, type: 'Disposal', timestamp: stamp, staff: actingUser, text: ATTESTATION_TEXT },
        ...prev
      ]);
      setShowAddDisposalModal(false);
      setAddAttempted(false);
      toast.success('Disposal record created successfully');
    } catch {
      toast.error('Disposal record could not be created. Your entries were kept.');
    } finally {
      setTimeout(() => { addSubmitLock.current = false; }, 400);
    }
  };

  // Handle Add Disposal cancel
  const handleAddDisposalCancel = () => {
    if (disposalDate || selectedYouth || selectedMedication || amountDisposed || disposalComments) {
      setShowAddDisposalCancelDialog(true);
    } else {
      setShowAddDisposalModal(false);
    }
  };

  const handleAddDisposalCancelConfirm = () => {
    setDisposalDate('');
    setSelectedYouth('');
    setSelectedMedication('');
    setAmountDisposed('');
    setDisposalComments('');
    setShowAddDisposalCancelDialog(false);
    setShowAddDisposalModal(false);
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort records
  const filteredRecords = disposalRecords.filter(record => {
    // Apply status filter
    if (statusFilter === 'All statuses') return true;
    return record.status === statusFilter;
  });

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = sortedRecords.map(r => r.id);
      setSelectedRows(new Set(allIds));
    } else {
      setSelectedRows(new Set());
    }
  };

  // Handle individual row selection
  const handleRowSelect = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  // Check if all visible rows are selected
  const allSelected = sortedRecords.length > 0 && sortedRecords.every(r => selectedRows.has(r.id));
  const someSelected = sortedRecords.some(r => selectedRows.has(r.id)) && !allSelected;

  // Update comment
  const updateComment = (id: string, comment: string) => {
    setDisposalRecords(prev =>
      prev.map(record =>
        record.id === id ? { ...record, addComment: comment, hasChanges: true } : record
      )
    );
    setHasUnsavedChanges(true);
  };

  // Apply mass action
  const handleApplyMassAction = () => {
    if (!massActionStatus) {
      setSubmitError('Select a status to apply.');
      return;
    }
    setSubmitError('');

    setDisposalRecords(prev =>
      prev.map(record =>
        selectedRows.has(record.id)
          ? { ...record, savedStatus: record.savedStatus ?? record.status, status: massActionStatus as any, hasChanges: true }
          : record
      )
    );

    setHasUnsavedChanges(true);
    setSelectedRows(new Set());
    setMassActionStatus('');
    toast.success(`Status updated for ${selectedRows.size} record(s)`);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedRows(new Set());
    setMassActionStatus('');
  };

  // Handle submit
  const handleSubmit = () => {
    if (submitLock.current) return;
    const updatedRecords = disposalRecords.filter(r => r.hasChanges);

    if (updatedRecords.length === 0) {
      setSubmitError('There are no changes to submit.');
      return;
    }
    submitLock.current = true;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const actingUser = getDemoUserName();
      const now = new Date();
      const stamp = `${getCurrentDate()} ${now.toLocaleTimeString('en-US')}`;

      // One log entry per status transition (or comment change)
      const newLogs: DisposalLogEntry[] = updatedRecords.map((r, i) => {
        const from = r.savedStatus ?? r.status;
        const changed = from !== r.status;
        return {
          id: `log${now.getTime()}-${i}`,
          logType: changed ? `Status: ${from} \u2192 ${r.status}` : 'Comment added',
          date: getCurrentDate(),
          medication: r.medication,
          dose: r.dose,
          youth: r.youth,
          count: r.amount,
          comments: r.addComment,
          attestationStaff: actingUser,
          attestationDate: stamp,
          attestationText: ATTESTATION_TEXT
        };
      });

      setLogEntries(prev => [...newLogs, ...prev]);
      setAttestationEntries(prev => [
        { id: `att${now.getTime()}`, type: 'Disposal update', timestamp: stamp, staff: actingUser, text: ATTESTATION_TEXT },
        ...prev
      ]);
      // Verified records stay visible with their status (filterable)
      setDisposalRecords(prev =>
        prev.map(record => ({ ...record, hasChanges: false, savedStatus: record.status }))
      );
      setHasUnsavedChanges(false);
      setSelectedRows(new Set());
      toast.success(`${updatedRecords.length} disposal record${updatedRecords.length !== 1 ? 's' : ''} updated`);
    } catch {
      setSubmitError('Changes could not be saved. Your changes were kept; please try again.');
      toast.error('Changes could not be saved.');
    } finally {
      setTimeout(() => { submitLock.current = false; }, 400);
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancelClick = () => {
    if (hasUnsavedChanges) {
      setShowCancelDialog(true);
    }
  };

  const handleCancelConfirm = () => {
    // Reset all changes
    setDisposalRecords(prev =>
      prev.map(record => ({ ...record, status: record.savedStatus ?? record.status, savedStatus: undefined, addComment: '', hasChanges: false }))
    );
    setHasUnsavedChanges(false);
    setSelectedRows(new Set());
    setShowCancelDialog(false);
    toast.info('All changes have been cancelled');
  };

  // Check if submit should be enabled
  const isSubmitEnabled = disposalRecords.some(r => r.hasChanges);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3"
        style={{
          backgroundColor: 'var(--slds-g-color-background-base)',
          borderBottom: '1px solid var(--slds-g-color-border-base-1)'
        }}
      >
        <div className="flex items-center justify-between">
          {/* Left: Back button and Program Name */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/medications')}
              className="h-8 w-8 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                color: 'var(--slds-g-color-text-default)',
                border: '1px solid var(--slds-g-color-border-base-1)'
              }}
              aria-label="Return to Medication Overview"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="h-8 w-px" style={{ backgroundColor: 'var(--slds-g-color-border-base-1)' }} />

            <div>
              <h1 className="slds-page-header-title mb-0" style={{ color: 'var(--slds-g-color-text-default)' }}>
                Disposal Queue
              </h1>
              <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                {programName}
              </p>
            </div>
          </div>

          {/* Right: Add Disposal button */}
          <Button
            onClick={handleAddDisposalClick}
            className="h-8 px-5 rounded-full slds-text-4 font-semibold text-white flex items-center gap-2"
            style={{ backgroundColor: '#145F33' }}
          >
            <Plus className="h-4 w-4" />
            Add Disposal
          </Button>
        </div>
      </div>

      {/* Status Filter and Mass Action Bar */}
      <div
        className="px-4 py-3 space-y-3"
        style={{
          backgroundColor: 'var(--slds-g-color-background-alt)',
          borderBottom: '1px solid var(--slds-g-color-border-base-1)'
        }}
      >
        {/* Status Filter */}
        <div className="flex items-center gap-3">
          <label className="slds-form-label whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>
            FILTER BY STATUS
          </label>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger
              className="h-9 w-64 slds-text-4"
              style={{
                borderColor: 'var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All statuses">All statuses</SelectItem>
              <SelectItem value="Med Cart">Med Cart</SelectItem>
              <SelectItem value="Lockbox">Lockbox</SelectItem>
              <SelectItem value="Pharmacy Transfer (Pending)">Pharmacy Transfer (Pending)</SelectItem>
              <SelectItem value="Pharmacy Transfer (Verified)">Pharmacy Transfer (Verified)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mass Action Bar */}
        {selectedRows.size > 0 && (
          <div
            className="flex items-center justify-between px-4 py-2.5 rounded-lg"
            style={{
              backgroundColor: '#E3F2FD',
              border: '1px solid #0176d3'
            }}
          >
            <div className="flex items-center gap-4">
              <p className="slds-text-4 font-semibold mb-0" style={{ color: 'var(--slds-g-color-text-default)' }}>
                {selectedRows.size} row{selectedRows.size > 1 ? 's' : ''} selected
              </p>
              <div className="flex items-center gap-2">
                <Select value={massActionStatus} onValueChange={setMassActionStatus}>
                  <SelectTrigger
                    className="h-8 w-56 slds-text-4"
                    style={{
                      borderColor: 'var(--slds-g-color-border-base-1)',
                      backgroundColor: 'var(--slds-g-color-background-base)'
                    }}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lockbox">Lockbox</SelectItem>
                    <SelectItem value="Pharmacy Transfer (Pending)">Pharmacy Transfer (Pending)</SelectItem>
                    <SelectItem value="Pharmacy Transfer (Verified)">Pharmacy Transfer (Verified)</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleApplyMassAction}
                  className="h-8 px-4 rounded-full slds-text-4 font-semibold text-white"
                  style={{ backgroundColor: '#145F33' }}
                >
                  Apply
                </Button>
              </div>
            </div>
            <Button
              onClick={handleClearSelection}
              className="h-8 px-4 rounded-full slds-text-4 font-medium"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                color: 'var(--slds-g-color-text-default)',
                border: '1px solid var(--slds-g-color-border-base-1)'
              }}
            >
              Clear selection
            </Button>
          </div>
        )}
      </div>

      {/* Main Content - Scrollable Table */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28" style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
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
                  <th className="px-3 py-2.5 w-12" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all rows"
                      className={someSelected ? 'data-[state=checked]:bg-gray-400' : ''}
                    />
                  </th>
                  <th
                    className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                    onClick={() => handleSort('medication')}
                  >
                    <div className="flex items-center gap-2">
                      Medication
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                    onClick={() => handleSort('dose')}
                  >
                    <div className="flex items-center gap-2">
                      Dose
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                    onClick={() => handleSort('youth')}
                  >
                    <div className="flex items-center gap-2">
                      Youth
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-2">
                      Date
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center gap-2">
                      Amount
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                    onClick={() => handleSort('disposalStaff')}
                  >
                    <div className="flex items-center gap-2">
                      Disposal Staff
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Original Comment
                  </th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Add Comment
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRecords.map((record) => (
                  <tr key={record.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                    <td className="px-3 py-2.5">
                      <Checkbox
                        checked={selectedRows.has(record.id)}
                        onCheckedChange={(checked) => handleRowSelect(record.id, checked as boolean)}
                        aria-label={`Select ${record.medication}`}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="px-2 py-1 rounded slds-text-3 font-semibold whitespace-nowrap"
                        style={{
                          backgroundColor: STATUS_STYLES[record.status].bg,
                          color: STATUS_STYLES[record.status].text,
                          border: `1px solid ${STATUS_STYLES[record.status].border}`
                        }}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 slds-text-4 font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {record.medication}
                    </td>
                    <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {record.dose}
                    </td>
                    <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {record.youth}
                    </td>
                    <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {record.date}
                    </td>
                    <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {record.amount}
                    </td>
                    <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {record.disposalStaff}
                    </td>
                    <td className="px-3 py-2.5 slds-text-4 max-w-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                      {record.originalComment || '-'}
                    </td>
                    <td className="px-3 py-2.5">
                      <Input
                        type="text"
                        value={record.addComment}
                        onChange={(e) => updateComment(record.id, e.target.value)}
                        className="h-8 slds-text-4"
                        placeholder="Add comment"
                        style={{
                          borderColor: 'var(--slds-g-color-border-base-1)',
                          backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {logEntries.length > 0 && (
          <div
            className="mt-4 mb-24 rounded-lg overflow-hidden"
            role="region"
            aria-label="Disposal log"
            style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
          >
            <div className="px-3 py-2 flex items-center gap-2" style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
              <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                Disposal log ({logEntries.length})
              </span>
              <span className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Read-only entries from this session · {attestationEntries.length} attestation{attestationEntries.length !== 1 ? 's' : ''} recorded
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Log type', 'Medication', 'Youth', 'Count', 'Comments', 'Attested by', 'Attested at'].map(h => (
                      <th key={h} className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logEntries.map(l => (
                    <tr key={l.id} style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                      <td className="px-3 py-1.5 slds-text-3">{l.logType}</td>
                      <td className="px-3 py-1.5 slds-text-3">{l.medication} {l.dose}</td>
                      <td className="px-3 py-1.5 slds-text-3">{l.youth}</td>
                      <td className="px-3 py-1.5 slds-text-3">{l.count}</td>
                      <td className="px-3 py-1.5 slds-text-3">{l.comments || '-'}</td>
                      <td className="px-3 py-1.5 slds-text-3">{l.attestationStaff}</td>
                      <td className="px-3 py-1.5 slds-text-3">{l.attestationDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Attestation Bar */}
      <div
        className="fixed bottom-10 left-0 right-0 px-6 py-4 flex items-center justify-end gap-3 z-10"
        style={{
          backgroundColor: 'var(--slds-g-color-background-alt)',
          borderTop: '2px solid var(--slds-g-color-border-base-1)',
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        {submitError && (
          <p role="alert" className="slds-text-3 font-medium m-0" style={{ color: '#c23934' }}>{submitError}</p>
        )}
        <p className="slds-text-3 italic mr-auto" style={{ color: 'var(--slds-g-color-text-weak)' }}>
          I attest that I have followed the policies and procedure of Medicine Dispensation & Documentation
        </p>
        <Button
          onClick={handleCancelClick}
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

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="slds-text-6 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
              Cancel Changes
            </DialogTitle>
            <DialogDescription className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Are you sure you want to cancel?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => setShowCancelDialog(false)}
              className="h-8 px-6 rounded-full slds-text-4 font-medium"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                color: 'var(--slds-g-color-text-default)',
                border: '1px solid var(--slds-g-color-border-base-1)'
              }}
            >
              No
            </Button>
            <Button
              onClick={handleCancelConfirm}
              className="h-8 px-6 rounded-full slds-text-4 font-semibold text-white"
              style={{ backgroundColor: '#c23934' }}
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Disposal Modal */}
      <Dialog open={showAddDisposalModal} onOpenChange={(open) => !open && handleAddDisposalCancel()}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
            <DialogTitle className="slds-text-6 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
              Add Disposal
            </DialogTitle>
            <DialogDescription className="slds-text-4 mt-3 p-3 rounded" style={{ color: '#0176d3', backgroundColor: '#E3F2FD', border: '1px solid #0176d3' }}>
              <strong>Instructions:</strong> Write the following info on coin envelope for disposal: DISCARD, staff initials, date, medication name, doses, and youth. Please remember to notify a Med Admin that medications are in the disposal drawer.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Date */}
            <div className="space-y-1.5">
              <label htmlFor="dq-date" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                DATE <span className="text-red-600">*</span>
              </label>
              <Input
                id="dq-date"
                type="text"
                aria-invalid={addAttempted && !isDisposalDateValid}
                value={disposalDate}
                onChange={(e) => setDisposalDate(e.target.value)}
                className="h-9 slds-text-4"
                placeholder="MM/DD/YYYY"
                style={{
                  borderColor: 'var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              />
              {addAttempted && !isDisposalDateValid && (
                <p role="alert" className="slds-text-3" style={{ color: '#c23934' }}>Enter a date as MM/DD/YYYY.</p>
              )}
            </div>

            {/* Youth */}
            <div className="space-y-1.5">
              <label htmlFor="dq-youth" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                YOUTH <span className="text-red-600">*</span>
              </label>
              <Select value={selectedYouth} onValueChange={(value) => {
                setSelectedYouth(value);
                setSelectedMedication('');
                setAmountDisposed('');
              }}>
                <SelectTrigger
                  id="dq-youth"
                  className="h-9 slds-text-4"
                  style={{
                    borderColor: 'var(--slds-g-color-border-base-1)',
                    backgroundColor: 'var(--slds-g-color-background-base)'
                  }}
                >
                  <SelectValue placeholder="Select youth" />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAM_YOUTHS.map(youth => (
                    <SelectItem key={youth.id} value={youth.id}>
                      {youth.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {addAttempted && !selectedYouth && (
                <p role="alert" className="slds-text-3" style={{ color: '#c23934' }}>Select a youth.</p>
              )}
            </div>

            {/* Medication */}
            <div className="space-y-1.5">
              <label htmlFor="dq-med" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                MEDICATION <span className="text-red-600">*</span>
              </label>
              <Select
                value={selectedMedication}
                onValueChange={(value) => {
                  setSelectedMedication(value);
                  setAmountDisposed('');
                }}
                disabled={!selectedYouth}
              >
                <SelectTrigger
                  id="dq-med"
                  className="h-9 slds-text-4"
                  style={{
                    borderColor: 'var(--slds-g-color-border-base-1)',
                    backgroundColor: 'var(--slds-g-color-background-base)'
                  }}
                >
                  <SelectValue placeholder="Select medication" />
                </SelectTrigger>
                <SelectContent>
                  {getYouthMedications().map(med => (
                    <SelectItem key={med.id} value={med.id}>
                      {med.name} - {med.dosePeriod}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {addAttempted && !selectedMedication && (
                <p role="alert" className="slds-text-3" style={{ color: '#c23934' }}>Select a medication.</p>
              )}
            </div>

            {/* Amount Disposed */}
            <div className="space-y-1.5">
              <label htmlFor="dq-amount" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                AMOUNT DISPOSED <span className="text-red-600">*</span>
              </label>
              {getSelectedMedicationDetails()?.countType === 'Units' ? (
                <Input
                  type="text"
                  value={amountDisposed}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="h-9 slds-text-4"
                  placeholder="999.99"
                  id="dq-amount"
                  disabled={!selectedMedication}
                  style={{
                    borderColor: 'var(--slds-g-color-border-base-1)',
                    backgroundColor: 'var(--slds-g-color-background-base)'
                  }}
                />
              ) : (
                <Select
                  value={amountDisposed}
                  onValueChange={setAmountDisposed}
                  disabled={!selectedMedication}
                >
                  <SelectTrigger
                    id="dq-amount"
                    className="h-9 slds-text-4"
                    style={{
                      borderColor: 'var(--slds-g-color-border-base-1)',
                      backgroundColor: 'var(--slds-g-color-background-base)'
                    }}
                  >
                    <SelectValue placeholder="Select amount" />
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
              {addAttempted && !amountDisposed && (
                <p role="alert" className="slds-text-3" style={{ color: '#c23934' }}>Enter the amount disposed.</p>
              )}
            </div>

            {/* Comments */}
            <div className="space-y-1.5">
              <label htmlFor="dq-comments" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                COMMENTS <span className="text-red-600">*</span>
              </label>
              <Input
                type="text"
                value={disposalComments}
                onChange={(e) => setDisposalComments(e.target.value)}
                className="h-9 slds-text-4"
                placeholder="Enter comments"
                id="dq-comments"
                style={{
                  borderColor: 'var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              />
              {addAttempted && !disposalComments.trim() && (
                <p role="alert" className="slds-text-3" style={{ color: '#c23934' }}>Enter comments.</p>
              )}
              <p className="text-[11px] italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                This comment will appear as the Original Comment on the Manage Disposal screen and cannot be edited later.
              </p>
            </div>
          </div>

          <div
            className="px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0"
            style={{
              backgroundColor: 'var(--slds-g-color-background-alt)',
              borderTop: '1px solid var(--slds-g-color-border-base-1)'
            }}
          >
            <p className="slds-text-3 italic mr-auto" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              I attest that I have followed the policies and procedure of Medicine Dispensation & Documentation
            </p>
            <Button
              onClick={handleAddDisposalSubmit}
              className="h-8 px-6 rounded-full slds-text-4 font-semibold text-white"
              style={{ backgroundColor: '#145F33' }}
            >
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Disposal Cancel Confirmation Dialog */}
      <Dialog open={showAddDisposalCancelDialog} onOpenChange={setShowAddDisposalCancelDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="slds-text-6 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
              Cancel Disposal
            </DialogTitle>
            <DialogDescription className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Are you sure you want to cancel?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => setShowAddDisposalCancelDialog(false)}
              className="h-8 px-6 rounded-full slds-text-4 font-medium"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                color: 'var(--slds-g-color-text-default)',
                border: '1px solid var(--slds-g-color-border-base-1)'
              }}
            >
              No
            </Button>
            <Button
              onClick={handleAddDisposalCancelConfirm}
              className="h-8 px-6 rounded-full slds-text-4 font-semibold text-white"
              style={{ backgroundColor: '#c23934' }}
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
