import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowUpDown, Plus } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner@2.0.3";

interface MedLeaderAssignment {
  id: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  medLeader: string;
  medKey: string;
  comments: string;
  createdBy: string;
  createdOn: string;
  isCurrent: boolean;
}

type SortField = 'startDate' | 'startTime' | 'endDate' | 'endTime' | 'medLeader' | 'medKey' | 'createdBy' | 'createdOn';
type SortDirection = 'asc' | 'desc';

const STAFF_LIST = [
  'Sarah Johnson',
  'Michael Chen',
  'Emily Rodriguez',
  'David Thompson',
  'Jessica Martinez',
  'Reception'
];

export function MedLeaderListView() {
  const navigate = useNavigate();

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('startDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [selectedMedLeader, setSelectedMedLeader] = useState('');
  const [receptionName, setReceptionName] = useState('');
  const [medKeyType, setMedKeyType] = useState('Med Leader Key');
  const [otherKeyName, setOtherKeyName] = useState('');
  const [comments, setComments] = useState('');
  const [acknowledgeChecked, setAcknowledgeChecked] = useState(false);

  // Initialize current Med Leader in localStorage if not set
  useEffect(() => {
    if (!localStorage.getItem('currentMedLeader')) {
      localStorage.setItem('currentMedLeader', 'Sarah Johnson');
    }
  }, []);

  // Mock data for Med Leader assignments
  const [assignments, setAssignments] = useState<MedLeaderAssignment[]>([
    {
      id: 'ml1',
      startDate: '05/19/2026',
      startTime: '07:00 AM',
      endDate: '',
      endTime: '',
      medLeader: 'Sarah Johnson',
      medKey: 'Med Leader Key',
      comments: 'Start of morning shift',
      createdBy: 'Admin User',
      createdOn: '05/19/2026 07:00 AM',
      isCurrent: true
    },
    {
      id: 'ml2',
      startDate: '05/18/2026',
      startTime: '11:00 PM',
      endDate: '05/19/2026',
      endTime: '07:00 AM',
      medLeader: 'Michael Chen',
      medKey: 'Med Leader Key',
      comments: 'Overnight shift coverage',
      createdBy: 'Sarah Johnson',
      createdOn: '05/18/2026 11:00 PM',
      isCurrent: false
    },
    {
      id: 'ml3',
      startDate: '05/18/2026',
      startTime: '03:00 PM',
      endDate: '05/18/2026',
      endTime: '11:00 PM',
      medLeader: 'Emily Rodriguez',
      medKey: 'Med Leader Key',
      comments: '',
      createdBy: 'David Thompson',
      createdOn: '05/18/2026 03:00 PM',
      isCurrent: false
    }
  ]);

  // Mock acknowledgment data (real-time calculation)
  const [incompleteDocsCount] = useState(12);
  const [incompleteCountsCount] = useState(3);

  // Get current date and time
  const getCurrentDate = () => {
    const today = new Date();
    return `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
  };

  // Handle modal open
  const handleAddClick = () => {
    setStartDate(getCurrentDate());
    setStartTime(getCurrentTime());
    setSelectedMedLeader('');
    setReceptionName('');
    setMedKeyType('Med Leader Key');
    setOtherKeyName('');
    setComments('');
    setAcknowledgeChecked(false);
    setShowAddModal(true);
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

  // Sort assignments
  const sortedAssignments = [...assignments].sort((a, b) => {
    // Always keep current Med Leader at top if sorting by startDate desc
    if (sortField === 'startDate' && sortDirection === 'desc') {
      if (a.isCurrent) return -1;
      if (b.isCurrent) return 1;
    }

    let aValue = a[sortField];
    let bValue = b[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  // Handle submit
  const handleSubmit = () => {
    // Validation
    if (!startDate || !startTime || !selectedMedLeader) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedMedLeader === 'Reception' && !receptionName) {
      toast.error('Please enter the reception staff name');
      return;
    }

    if (medKeyType === 'Other' && !otherKeyName) {
      toast.error('Please specify the other med key name');
      return;
    }

    if (!acknowledgeChecked) {
      toast.error('Please acknowledge the summary before submitting');
      return;
    }

    // Auto end-date previous Med Leader
    const updatedAssignments = assignments.map(assignment => {
      if (assignment.isCurrent) {
        return {
          ...assignment,
          endDate: startDate,
          endTime: startTime,
          isCurrent: false
        };
      }
      return assignment;
    });

    // Create new assignment
    const newAssignment: MedLeaderAssignment = {
      id: `ml${Date.now()}`,
      startDate,
      startTime,
      endDate: '',
      endTime: '',
      medLeader: selectedMedLeader === 'Reception' ? `Reception - ${receptionName}` : selectedMedLeader,
      medKey: medKeyType === 'Other' ? otherKeyName : medKeyType,
      comments,
      createdBy: 'Current User', // TODO: Replace with actual logged-in user
      createdOn: `${getCurrentDate()} ${getCurrentTime()}`,
      isCurrent: true
    };

    // Create custody transfer log entry for audit trail
    const custodyTransferLog = {
      id: `log${Date.now()}`,
      programName: 'West Campus Program', // TODO: Get from context
      outgoingMedLeader: updatedAssignments.find(a => a.id === assignments.find(a => a.isCurrent)?.id)?.medLeader,
      incomingMedLeader: newAssignment.medLeader,
      timestamp: newAssignment.createdOn,
      medKeyPassed: newAssignment.medKey,
      incompleteDocumentation: incompleteDocsCount,
      incompleteCounts: incompleteCountsCount,
      comments: comments || null
    };

    // Store in localStorage for audit access (TODO: Replace with backend API)
    const existingLogs = JSON.parse(localStorage.getItem('medLeaderCustodyLogs') || '[]');
    localStorage.setItem('medLeaderCustodyLogs', JSON.stringify([custodyTransferLog, ...existingLogs]));

    console.log('Med Leader Handoff Log Created:', custodyTransferLog);

    // Update current Med Leader in localStorage so Overview page can display it
    localStorage.setItem('currentMedLeader', newAssignment.medLeader);

    setAssignments([newAssignment, ...updatedAssignments]);
    setShowAddModal(false);
    toast.success('Med Leader assignment updated successfully');
  };

  // Handle cancel
  const handleCancel = () => {
    setShowAddModal(false);
  };

  // Check if submit should be enabled
  const isSubmitEnabled = startDate && startTime && selectedMedLeader &&
    (selectedMedLeader !== 'Reception' || receptionName) &&
    (medKeyType !== 'Other' || otherKeyName) &&
    acknowledgeChecked;

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
          {/* Left: Back button and Title */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/medications', { state: { fromProgramLog: true } })}
              className="h-8 px-4 rounded-full flex items-center gap-2 slds-text-4 font-medium"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                color: 'var(--slds-g-color-text-default)',
                border: '1px solid var(--slds-g-color-border-base-1)'
              }}
              aria-label="Return to Overview"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Overview
            </Button>

            <div className="h-8 w-px" style={{ backgroundColor: 'var(--slds-g-color-border-base-1)' }} />

            <h1 className="slds-page-header-title mb-0" style={{ color: 'var(--slds-g-color-text-default)' }}>
              Med Leader Assignments
            </h1>
          </div>

          {/* Right: Add button */}
          <Button
            onClick={handleAddClick}
            className="h-8 px-5 rounded-full slds-text-4 font-semibold text-white flex items-center gap-2"
            style={{ backgroundColor: '#145F33' }}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
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
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                  <th
                    className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                    onClick={() => handleSort('startDate')}
                  >
                    <div className="flex items-center gap-2">
                      Start Date
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                    onClick={() => handleSort('startTime')}
                  >
                    <div className="flex items-center gap-2">
                      Start Time
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                    onClick={() => handleSort('endDate')}
                  >
                    <div className="flex items-center gap-2">
                      End Date
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                    onClick={() => handleSort('endTime')}
                  >
                    <div className="flex items-center gap-2">
                      End Time
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                    onClick={() => handleSort('medLeader')}
                  >
                    <div className="flex items-center gap-2">
                      Med Leader
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                    onClick={() => handleSort('medKey')}
                  >
                    <div className="flex items-center gap-2">
                      Med Key
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Comments
                  </th>
                  <th
                    className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                    onClick={() => handleSort('createdBy')}
                  >
                    <div className="flex items-center gap-2">
                      Created By
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                    onClick={() => handleSort('createdOn')}
                  >
                    <div className="flex items-center gap-2">
                      Created On
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedAssignments.map((assignment) => (
                  <tr
                    key={assignment.id}
                    style={{
                      borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                      backgroundColor: assignment.isCurrent ? '#E8F5E9' : 'transparent'
                    }}
                  >
                    <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {assignment.startDate}
                    </td>
                    <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {assignment.startTime}
                    </td>
                    <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {assignment.endDate || '-'}
                    </td>
                    <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {assignment.endTime || '-'}
                    </td>
                    <td className="px-3 py-2.5 slds-text-4 font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {assignment.medLeader}
                      {assignment.isCurrent && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white" style={{ backgroundColor: '#145F33' }}>
                          CURRENT
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {assignment.medKey}
                    </td>
                    <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {assignment.comments || '-'}
                    </td>
                    <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {assignment.createdBy}
                    </td>
                    <td className="px-3 py-2.5 slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {assignment.createdOn}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Med Leader Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
            <DialogTitle className="slds-text-6 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
              Add Med Leader Assignment
            </DialogTitle>
            <DialogDescription className="slds-text-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Enter the details for the new Med Leader assignment and review the handoff summary
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Start Date */}
            <div className="space-y-1.5">
              <Label htmlFor="startDate" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                START DATE <span className="text-red-600">*</span>
              </Label>
              <Input
                id="startDate"
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 slds-text-4"
                placeholder="MM/DD/YYYY"
                style={{
                  borderColor: 'var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              />
            </div>

            {/* Start Time */}
            <div className="space-y-1.5">
              <Label htmlFor="startTime" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                START TIME <span className="text-red-600">*</span>
              </Label>
              <Input
                id="startTime"
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-9 slds-text-4"
                placeholder="hh:mm AM/PM"
                style={{
                  borderColor: 'var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              />
            </div>

            {/* Med Leader */}
            <div className="space-y-1.5">
              <Label htmlFor="medLeader" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                MED LEADER <span className="text-red-600">*</span>
              </Label>
              <select
                id="medLeader"
                value={selectedMedLeader}
                onChange={(e) => {
                  setSelectedMedLeader(e.target.value);
                  if (e.target.value !== 'Reception') {
                    setReceptionName('');
                  }
                }}
                className="h-9 px-3 rounded slds-text-4 w-full"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  color: 'var(--slds-g-color-text-default)'
                }}
              >
                <option value="">Select Med Leader</option>
                {STAFF_LIST.map(staff => (
                  <option key={staff} value={staff}>{staff}</option>
                ))}
              </select>
            </div>

            {/* Conditional Reception Name field */}
            {selectedMedLeader === 'Reception' && (
              <div className="space-y-1.5">
                <Label htmlFor="receptionName" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  NAME <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="receptionName"
                  type="text"
                  value={receptionName}
                  onChange={(e) => setReceptionName(e.target.value)}
                  className="h-9 slds-text-4"
                  placeholder="Enter name"
                  style={{
                    borderColor: 'var(--slds-g-color-border-base-1)',
                    backgroundColor: 'var(--slds-g-color-background-base)'
                  }}
                />
              </div>
            )}

            {/* Which Med Key */}
            <div className="space-y-2">
              <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                WHICH MED KEY IS BEING PASSED? <span className="text-red-600">*</span>
              </Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="medLeaderKey"
                    name="medKey"
                    value="Med Leader Key"
                    checked={medKeyType === 'Med Leader Key'}
                    onChange={(e) => {
                      setMedKeyType(e.target.value);
                      setOtherKeyName('');
                    }}
                    className="w-4 h-4"
                    style={{ accentColor: '#145F33' }}
                  />
                  <Label htmlFor="medLeaderKey" className="slds-text-4 cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Med Leader Key
                  </Label>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="otherKey"
                      name="medKey"
                      value="Other"
                      checked={medKeyType === 'Other'}
                      onChange={(e) => setMedKeyType(e.target.value)}
                      className="w-4 h-4"
                      style={{ accentColor: '#145F33' }}
                    />
                    <Label htmlFor="otherKey" className="slds-text-4 cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Other
                    </Label>
                  </div>
                  {medKeyType === 'Other' && (
                    <Input
                      type="text"
                      value={otherKeyName}
                      onChange={(e) => setOtherKeyName(e.target.value)}
                      className="h-9 slds-text-4 ml-6"
                      placeholder="Specify key name"
                      style={{
                        borderColor: 'var(--slds-g-color-border-base-1)',
                        backgroundColor: 'var(--slds-g-color-background-base)'
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-1.5">
              <Label htmlFor="comments" className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                COMMENTS
              </Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="min-h-[80px] slds-text-4"
                placeholder="Enter any comments"
                style={{
                  borderColor: 'var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              />
            </div>

            {/* Acknowledgment Summary */}
            <div
              className="p-4 rounded-lg space-y-3"
              style={{
                backgroundColor: '#FFF3CD',
                border: '1px solid #FFC107'
              }}
            >
              <h4 className="slds-text-4 font-semibold mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
                Handoff Summary (Since Midnight)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Incomplete Medications Documented
                  </p>
                  <p className="slds-text-6 font-bold" style={{ color: '#c23934' }}>
                    {incompleteDocsCount}
                  </p>
                </div>
                <div>
                  <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Incomplete Counts
                  </p>
                  <p className="slds-text-6 font-bold" style={{ color: '#c23934' }}>
                    {incompleteCountsCount}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-2">
                <Checkbox
                  id="acknowledge"
                  checked={acknowledgeChecked}
                  onCheckedChange={(checked) => setAcknowledgeChecked(checked as boolean)}
                  style={{ accentColor: '#145F33' }}
                />
                <Label htmlFor="acknowledge" className="slds-text-3 cursor-pointer leading-tight" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  I acknowledge that I have reviewed this summary and understand the current status of medication documentation and counts
                </Label>
              </div>
            </div>
          </div>

          <div
            className="px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0"
            style={{
              backgroundColor: 'var(--slds-g-color-background-alt)',
              borderTop: '1px solid var(--slds-g-color-border-base-1)'
            }}
          >
            <Button
              onClick={handleCancel}
              className="h-8 px-6 rounded-full slds-text-4 font-medium"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                color: 'var(--slds-g-color-text-default)',
                border: '1px solid var(--slds-g-color-border-base-1)'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isSubmitEnabled}
              className="h-8 px-6 rounded-full slds-text-4 font-semibold text-white"
              style={{
                backgroundColor: '#145F33',
                opacity: isSubmitEnabled ? 1 : 0.5,
                cursor: isSubmitEnabled ? 'pointer' : 'not-allowed'
              }}
            >
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
