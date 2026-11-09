import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, User, Phone, Mail, Calendar, FileText, Search, CheckSquare } from "@/app/lib/lucide-icons";
import * as DialogPrimitive from "@radix-ui/react-dialog@1.1.6";
import { Dialog, DialogPortal, DialogOverlay, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "./ui/select";
import { ALL_LEADS } from "../data/mockLeadsData";
import { toast } from "sonner@2.0.3";
import { DateInput } from "./ui/date-input";
import { isoToMdy, mdyToIso, localTodayIso } from "../lib/dateFormat";

/**
 * Contact Log Dialog with Automated Follow-up Task Creation
 * 
 * Acceptance Criteria Implementation:
 * AC1 ✓ Category field is mandatory - validation prevents saving without selection
 * AC2 ✓ Category picklist contains: DCFS, Guardianship, Legal, School, Medical
 * AC3 ✓ When "Follow-up Needed" is checked, a Task is automatically created
 * AC4 ✓ Task subject includes Category name and Youth's name: "[Category] Follow-up: [Youth Name]"
 * AC5 ✓ Task description contains follow-up notes (or contact details as fallback)
 * AC6 ✓ Task is linked to Youth record (via youthId) and appears in Activity Timeline
 * AC7 ✓ If "Follow-up Needed" is NOT checked, log saves normally without creating a Task
 * AC8 ✓ Follow-up notes are hidden unless "Follow-up Needed" checkbox is selected
 * AC9 ✓ When follow-up Task is marked "Completed," Contact Log is updated (via followUpStatus)
 * AC10 ✓ Visual indicator shows "Pending" vs "Completed" follow-up status with color-coded badges
 */

/**
 * Helper function to update Contact Log status when a follow-up task is completed (AC9)
 * Call this from the Task management component when marking a task as complete
 */
export function updateContactLogFollowUpStatus(taskId: string, newStatus: 'Completed' | 'Pending') {
  // In a real implementation, this would update the database
  // For now, we'll update localStorage to demonstrate the flow
  const contactLogs = JSON.parse(localStorage.getItem('contactLogs') || '[]');
  const updatedLogs = contactLogs.map((log: any) => {
    if (log.followUpTaskId === taskId) {
      return { ...log, followUpStatus: newStatus };
    }
    return log;
  });
  localStorage.setItem('contactLogs', JSON.stringify(updatedLogs));
  
  if (newStatus === 'Completed') {
    toast.success('Contact log follow-up status updated to Completed');
  }
}

// Mock existing callers database
const EXISTING_CALLERS = [
  { 
    id: "caller1", 
    firstName: "Maria", 
    lastName: "Rodriguez", 
    phone: "(312) 555-0101", 
    email: "maria.r@email.com", 
    language: "Spanish",
    extension: "101",
    state: "IL",
    zip: "60607",
    zipPlus4: "1234",
    referralSource: "Community Organization",
    communityOrg: "West Side Community Center - Referred by case manager"
  },
  { 
    id: "caller2", 
    firstName: "John", 
    lastName: "Smith", 
    phone: "(312) 555-0102", 
    email: "jsmith@email.com", 
    language: "English",
    extension: "",
    state: "IL",
    zip: "60614",
    zipPlus4: "5678",
    referralSource: "School",
    communityOrg: ""
  },
  { 
    id: "caller3", 
    firstName: "Anna", 
    lastName: "Kowalski", 
    phone: "(312) 555-0103", 
    email: "anna.k@email.com", 
    language: "Polish",
    extension: "305",
    state: "IL",
    zip: "60632",
    zipPlus4: "9012",
    referralSource: "Family Member",
    communityOrg: ""
  },
  { 
    id: "caller4", 
    firstName: "Michael", 
    lastName: "Johnson", 
    phone: "(312) 555-0104", 
    email: "mjohnson@email.com", 
    language: "English",
    extension: "202",
    state: "IL",
    zip: "60621",
    zipPlus4: "3456",
    referralSource: "DCFS",
    communityOrg: "Illinois Department of Children and Family Services"
  },
  { 
    id: "caller5", 
    firstName: "Sarah", 
    lastName: "Chen", 
    phone: "(312) 555-0105", 
    email: "schen@email.com", 
    language: "English",
    extension: "",
    state: "IL",
    zip: "60610",
    zipPlus4: "7890",
    referralSource: "Healthcare Provider",
    communityOrg: "Rush University Medical Center - Social Services"
  },
  { 
    id: "caller6", 
    firstName: "David", 
    lastName: "Williams", 
    phone: "(312) 555-0106", 
    email: "dwilliams@email.com", 
    language: "English",
    extension: "450",
    state: "IL",
    zip: "60637",
    zipPlus4: "2345",
    referralSource: "Court/Legal",
    communityOrg: "Cook County Juvenile Court"
  },
  { 
    id: "caller7", 
    firstName: "Carmen", 
    lastName: "Garcia", 
    phone: "(312) 555-0107", 
    email: "cgarcia@email.com", 
    language: "Spanish",
    extension: "112",
    state: "IL",
    zip: "60608",
    zipPlus4: "6789",
    referralSource: "Self",
    communityOrg: ""
  },
  { 
    id: "caller8", 
    firstName: "Ahmed", 
    lastName: "Hassan", 
    phone: "(312) 555-0108", 
    email: "ahassanl@email.com", 
    language: "Arabic",
    extension: "",
    state: "IL",
    zip: "60640",
    zipPlus4: "0123",
    referralSource: "Other",
    communityOrg: "Refugee and Immigrant Services"
  },
];

interface ContactLogDialogSLDSProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function ContactLogDialogSLDS({
  isOpen,
  onClose,
  onSubmit
}: ContactLogDialogSLDSProps) {
  const candidateSearchRef = useRef<HTMLDivElement>(null);
  const callerSearchRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    // Caller Information
    callerType: 'new' as 'new' | 'existing',
    referralDate: localTodayIso(),
    callerFirstName: '',
    callerLastName: '',
    callerPhone: '',
    callerExtension: '',
    callerEmail: '',
    callerState: '',
    callerZip: '',
    callerZipPlus4: '',
    language: 'English',
    callerReferralSource: '',
    callerCommunityOrg: '',
    
    // Candidate Information
    candidateType: 'new' as 'new' | 'present',
    candidateFirstName: '',
    candidateLastName: '',
    candidateDOB: '',
    candidateAge: '',
    candidateGender: '',
    candidateRelationship: '',
    candidatePhone: '',
    candidatePhoneExt: '',
    candidatePhoneType: '',
    candidateEmail: '',
    candidateEmailType: '',
    candidateStreetAddress: '',
    candidateAddressLine2: '',
    candidateCity: '',
    candidateState: '',
    candidateZip: '',
    candidateZipPlus4: '',
    candidateAddressType: '',
    
    // Contact Details
    contactDate: localTodayIso(),
    contactType: '',
    contactTopic: '',
    contactResult: '',
    referralSource: '',
    category: '', // Mandatory category
    notes: '',
    needsFollowUp: false,
    followUpDueDate: '', // Conditional follow-up field
    followUpNotes: '', // Conditional follow-up field
    followUpStatus: '', // Status of follow-up: 'Pending', 'Completed', or empty
    followUpTaskId: '', // ID of the generated task
  });

  const [callerSearchTerm, setCallerSearchTerm] = useState('');
  const [showCallerDropdown, setShowCallerDropdown] = useState(false);
  const [selectedCallerId, setSelectedCallerId] = useState<string | null>(null);

  const [candidateSearchTerm, setCandidateSearchTerm] = useState('');
  const [showCandidateDropdown, setShowCandidateDropdown] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  // Checkbox states for Candidate sections
  const [showCandidatePhoneInfo, setShowCandidatePhoneInfo] = useState(false);
  const [showCandidateEmailInfo, setShowCandidateEmailInfo] = useState(false);
  const [showCandidateAddressInfo, setShowCandidateAddressInfo] = useState(false);

  // Filter callers based on search term
  const filteredCallers = callerSearchTerm.trim()
    ? EXISTING_CALLERS.filter(caller => {
        const searchLower = callerSearchTerm.toLowerCase();
        const fullName = `${caller.firstName} ${caller.lastName}`.toLowerCase();
        return fullName.includes(searchLower) || 
               caller.phone.includes(searchLower) ||
               (caller.email && caller.email.toLowerCase().includes(searchLower));
      })
    : [];

  // Filter candidates based on search term
  const filteredCandidates = candidateSearchTerm.trim()
    ? ALL_LEADS.filter(lead => {
        const searchLower = candidateSearchTerm.toLowerCase();
        return lead.name.toLowerCase().includes(searchLower);
      })
    : [];

  // Handle caller selection
  const handleCallerSelect = (callerId: string) => {
    const caller = EXISTING_CALLERS.find(c => c.id === callerId);
    if (caller) {
      setSelectedCallerId(callerId);
      setCallerSearchTerm(`${caller.firstName} ${caller.lastName}`);
      setShowCallerDropdown(false);
      
      // Pre-populate form fields with all available data
      setFormData(prev => ({
        ...prev,
        callerFirstName: caller.firstName,
        callerLastName: caller.lastName,
        callerPhone: caller.phone,
        callerExtension: caller.extension || '',
        callerEmail: caller.email || '',
        callerState: caller.state || '',
        callerZip: caller.zip || '',
        callerZipPlus4: caller.zipPlus4 || '',
        language: caller.language || 'English',
        callerReferralSource: caller.referralSource || '',
        callerCommunityOrg: caller.communityOrg || '',
      }));
    }
  };

  // Handle candidate selection
  const handleCandidateSelect = (leadId: string) => {
    const candidate = ALL_LEADS.find(l => l.id === leadId);
    if (candidate) {
      setSelectedCandidateId(leadId);
      setCandidateSearchTerm(candidate.name);
      setShowCandidateDropdown(false);

      // Calculate age from DOB if available
      let age = '';
      if (candidate.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(candidate.dateOfBirth);
        age = (today.getFullYear() - birthDate.getFullYear()).toString();
        // Adjust age if birthday hasn't occurred this year
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age = (parseInt(age) - 1).toString();
        }
      } else {
        // Fallback to age group estimation if DOB not available
        age = candidate.ageGroup === 'High School' ? '16' : 
              candidate.ageGroup === 'Middle School' ? '13' : '19';
      }
      
      // Pre-populate form fields
      const nameParts = candidate.name.split(' ');
      setFormData(prev => ({
        ...prev,
        candidateFirstName: nameParts[0] || '',
        candidateLastName: nameParts.slice(1).join(' ') || '',
        candidateDOB: candidate.dateOfBirth || '',
        candidateAge: age,
        candidateGender: candidate.gender || '',
      }));
    }
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (candidateSearchRef.current && !candidateSearchRef.current.contains(event.target as Node)) {
        setShowCandidateDropdown(false);
      }
      if (callerSearchRef.current && !callerSearchRef.current.contains(event.target as Node)) {
        setShowCallerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = () => {
    // Validate required fields (AC1)
    if (!formData.category) {
      toast.error("Please select a category for this contact log");
      return;
    }
    
    // If follow-up is needed, validate follow-up fields
    if (formData.needsFollowUp && !formData.followUpDueDate) {
      toast.error("Please specify a due date for the follow-up task");
      return;
    }
    
    // Prepare the contact log data
    const contactLogData = { ...formData };
    
    // AC3, AC4, AC5, AC6, AC7: Create task if follow-up is needed
    if (formData.needsFollowUp) {
      // Generate a unique task ID
      const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Get youth name
      const youthName = formData.candidateFirstName && formData.candidateLastName
        ? `${formData.candidateFirstName} ${formData.candidateLastName}`
        : 'Youth';
      
      // AC4: Create task subject with Category and Youth name
      const taskSubject = `${formData.category} Follow-up: ${youthName}`;
      
      // AC5: Task description contains follow-up notes (and original contact details for context)
      const taskDescription = formData.followUpNotes 
        ? formData.followUpNotes 
        : `Follow-up needed for contact log.\n\nOriginal Contact Details:\n${formData.notes || 'No additional details provided.'}`;
      
      // Create the task (AC3, AC6)
      const followUpTask = {
        id: taskId,
        subject: taskSubject,
        description: taskDescription,
        dueDate: formData.followUpDueDate,
        status: 'Pending',
        category: formData.category,
        youthId: selectedCandidateId || null,
        youthName: youthName,
        contactLogId: null, // Will be set after contact log is created
        createdDate: new Date().toISOString(),
        assignedTo: 'Current User', // In real implementation, would be actual user ID
      };
      
      // Store task in localStorage (simulating backend)
      const existingTasks = JSON.parse(localStorage.getItem('followUpTasks') || '[]');
      existingTasks.push(followUpTask);
      localStorage.setItem('followUpTasks', JSON.stringify(existingTasks));
      
      // Update contact log data with follow-up status and task ID
      contactLogData.followUpStatus = 'Pending';
      contactLogData.followUpTaskId = taskId;
      
      toast.success(`Contact log saved and follow-up task created for ${youthName}`);
    } else {
      // AC7: No task created if follow-up not needed
      contactLogData.followUpStatus = '';
      contactLogData.followUpTaskId = '';
      toast.success("Contact log saved successfully");
    }
    
    onSubmit(contactLogData);
    // Reset form
    setFormData({
      callerType: 'new',
      referralDate: localTodayIso(),
      callerFirstName: '',
      callerLastName: '',
      callerPhone: '',
      callerExtension: '',
      callerEmail: '',
      callerState: '',
      callerZip: '',
      callerZipPlus4: '',
      language: 'English',
      callerReferralSource: '',
      callerCommunityOrg: '',
      candidateType: 'new',
      candidateFirstName: '',
      candidateLastName: '',
      candidateDOB: '',
      candidateAge: '',
      candidateGender: '',
      candidateRelationship: '',
      candidatePhone: '',
      candidatePhoneExt: '',
      candidatePhoneType: '',
      candidateEmail: '',
      candidateEmailType: '',
      candidateStreetAddress: '',
      candidateAddressLine2: '',
      candidateCity: '',
      candidateState: '',
      candidateZip: '',
      candidateZipPlus4: '',
      candidateAddressType: '',
      contactDate: localTodayIso(),
      contactType: '',
      contactTopic: '',
      contactResult: '',
      referralSource: '',
      category: '',
      notes: '',
      needsFollowUp: false,
      followUpDueDate: '',
      followUpNotes: '',
      followUpStatus: '',
      followUpTaskId: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/20 z-50" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed z-[100] top-[50%] left-[50%] w-[95vw] max-w-[900px] max-h-[90vh] translate-x-[-50%] translate-y-[-50%] overflow-hidden flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200"
          style={{
            backgroundColor: 'var(--slds-g-color-background-base)',
            border: '1px solid var(--slds-g-color-border-base-1)',
            borderRadius: 'var(--slds-c-card-radius-border)',
            boxShadow: '0 0 0 1px rgba(0,0,0,.05), 0 2px 4px 0 rgba(0,0,0,.1), 0 4px 8px 0 rgba(0,0,0,.1)'
          }}
        >
          {/* Accessible Title and Description for Screen Readers */}
          <DialogTitle className="sr-only">New Contact Log</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new contact log entry with caller information, candidate details, and contact notes
          </DialogDescription>

          {/* Modal Header */}
          <div 
            className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0"
            style={{
              backgroundColor: 'var(--slds-g-color-background-base)',
              borderColor: 'var(--slds-g-color-border-base-1)'
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="h-9 w-9 flex items-center justify-center text-white"
                style={{
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  backgroundColor: '#145F33'
                }}
              >
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h2 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                  aria-hidden="true"
                >
                  New Contact Log
                </h2>
                <p 
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                  aria-hidden="true"
                >
                  Record a new contact interaction
                </p>
              </div>
            </div>
            <DialogPrimitive.Close 
              className="rounded-full p-1.5 transition-colors"
              style={{
                color: 'var(--slds-g-color-text-weak)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-alt)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          {/* Modal Body - Scrollable */}
          <div 
            className="flex-1 overflow-y-auto px-6 py-6"
            style={{
              backgroundColor: 'var(--slds-g-color-background-alt-2)',
              scrollbarWidth: 'thin',
              scrollbarColor: '#c9c9c9 transparent'
            }}
          >
            <div className="space-y-6">
              {/* Caller Information Section */}
              <div 
                className="p-4 space-y-4"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  borderRadius: 'var(--slds-c-card-radius-border)'
                }}
              >
                <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                  <User className="h-4 w-4" style={{ color: '#145F33' }} />
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Caller Information
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {/* Caller Type Selection */}
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Caller Type
                    </Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="callerType"
                          value="new"
                          checked={formData.callerType === 'new'}
                          onChange={(e) => {
                            handleSelectChange('callerType', e.target.value);
                            // Reset caller fields when switching type
                            setCallerSearchTerm('');
                            setSelectedCallerId(null);
                            setFormData(prev => ({
                              ...prev,
                              referralDate: localTodayIso(),
                              callerFirstName: '',
                              callerLastName: '',
                              callerPhone: '',
                              callerExtension: '',
                              callerEmail: '',
                              callerState: '',
                              callerZip: '',
                              callerZipPlus4: '',
                              language: 'English',
                              callerReferralSource: '',
                              callerCommunityOrg: '',
                            }));
                          }}
                          className="w-4 h-4"
                          style={{ 
                            accentColor: '#145F33',
                            cursor: 'pointer'
                          }}
                        />
                        <span className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          New Caller
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="callerType"
                          value="existing"
                          checked={formData.callerType === 'existing'}
                          onChange={(e) => {
                            handleSelectChange('callerType', e.target.value);
                          }}
                          className="w-4 h-4"
                          style={{ 
                            accentColor: '#145F33',
                            cursor: 'pointer'
                          }}
                        />
                        <span className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          Existing Caller
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Search Box for Existing Callers */}
                  {formData.callerType === 'existing' && (
                    <div className="relative" ref={callerSearchRef}>
                      <Label htmlFor="callerSearch" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Search Caller
                      </Label>
                      <div className="relative">
                        <Input
                          id="callerSearch"
                          type="text"
                          placeholder="Type to search by name, phone, or email..."
                          className="h-9 text-sm pr-8"
                          value={callerSearchTerm}
                          onChange={(e) => {
                            setCallerSearchTerm(e.target.value);
                            setShowCallerDropdown(true);
                          }}
                          onFocus={() => setShowCallerDropdown(true)}
                          style={{
                            border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                            borderRadius: 'var(--slds-c-input-radius-border)',
                            backgroundColor: 'var(--slds-g-color-background-base)'
                          }}
                          onFocusCapture={(e) => {
                            e.currentTarget.style.outline = 'none';
                            e.currentTarget.style.borderColor = '#145F33';
                            e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>

                      {/* Search Results Dropdown */}
                      {showCallerDropdown && filteredCallers.length > 0 && (
                        <div 
                          className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
                          style={{
                            border: '1px solid var(--slds-g-color-border-base-4)',
                            borderRadius: 'var(--slds-c-input-radius-border)'
                          }}
                        >
                          {filteredCallers.map((caller) => (
                            <button
                              key={caller.id}
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors border-b last:border-b-0"
                              style={{ borderColor: 'var(--slds-g-color-border-base-4)' }}
                              onClick={() => handleCallerSelect(caller.id)}
                            >
                              <div style={{ color: 'var(--slds-g-color-text-default)' }}>
                                {`${caller.firstName} ${caller.lastName}`}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Referral Date - Full Width */}
                  <div>
                    <Label htmlFor="referralDate" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Referral Date
                    </Label>
                    <DateInput
                      id="referralDate"
                      name="referralDate"
className="h-9 text-sm"
                      value={isoToMdy(formData.referralDate)}
                      onChange={(v) => (handleInputChange)({ target: { value: mdyToIso(v) } })}
                      disabled={formData.callerType === 'existing' && !!selectedCallerId}
                      style={{
                        border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                        borderRadius: 'var(--slds-c-input-radius-border)',
                        backgroundColor: formData.callerType === 'existing' && !!selectedCallerId 
                          ? 'var(--slds-g-color-background-alt)' 
                          : 'var(--slds-g-color-background-base)',
                        cursor: formData.callerType === 'existing' && !!selectedCallerId ? 'not-allowed' : 'text'
                      }}
                      onFocus={(e) => {
                        if (!(formData.callerType === 'existing' && !!selectedCallerId)) {
                          e.currentTarget.style.outline = 'none';
                          e.currentTarget.style.borderColor = '#145F33';
                          e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                        }
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Caller Details Fields */}
                  {/* First Name, Last Name, Phone - 3 Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="callerFirstName" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        First Name <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="callerFirstName"
                        name="callerFirstName"
                        type="text"
                        placeholder="Enter first name"
                        className="h-9 text-sm"
                        value={formData.callerFirstName}
                        onChange={handleInputChange}
                        disabled={formData.callerType === 'existing' && !!selectedCallerId}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: formData.callerType === 'existing' && !!selectedCallerId 
                            ? 'var(--slds-g-color-background-alt)' 
                            : 'var(--slds-g-color-background-base)',
                          cursor: formData.callerType === 'existing' && !!selectedCallerId ? 'not-allowed' : 'text'
                        }}
                        onFocus={(e) => {
                          if (!(formData.callerType === 'existing' && !!selectedCallerId)) {
                            e.currentTarget.style.outline = 'none';
                            e.currentTarget.style.borderColor = '#145F33';
                            e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                          }
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="callerLastName" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Last Name <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="callerLastName"
                        name="callerLastName"
                        type="text"
                        placeholder="Enter last name"
                        className="h-9 text-sm"
                        value={formData.callerLastName}
                        onChange={handleInputChange}
                        disabled={formData.callerType === 'existing' && !!selectedCallerId}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: formData.callerType === 'existing' && !!selectedCallerId 
                            ? 'var(--slds-g-color-background-alt)' 
                            : 'var(--slds-g-color-background-base)',
                          cursor: formData.callerType === 'existing' && !!selectedCallerId ? 'not-allowed' : 'text'
                        }}
                        onFocus={(e) => {
                          if (!(formData.callerType === 'existing' && !!selectedCallerId)) {
                            e.currentTarget.style.outline = 'none';
                            e.currentTarget.style.borderColor = '#145F33';
                            e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                          }
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="callerPhone" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Phone <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="callerPhone"
                        name="callerPhone"
                        type="tel"
                        placeholder="(555) 555-5555"
                        className="h-9 text-sm"
                        value={formData.callerPhone}
                        onChange={handleInputChange}
                        disabled={formData.callerType === 'existing' && !!selectedCallerId}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: formData.callerType === 'existing' && !!selectedCallerId 
                            ? 'var(--slds-g-color-background-alt)' 
                            : 'var(--slds-g-color-background-base)',
                          cursor: formData.callerType === 'existing' && !!selectedCallerId ? 'not-allowed' : 'text'
                        }}
                        onFocus={(e) => {
                          if (!(formData.callerType === 'existing' && !!selectedCallerId)) {
                            e.currentTarget.style.outline = 'none';
                            e.currentTarget.style.borderColor = '#145F33';
                            e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                          }
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Extension, Email, Language - 3 Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="callerExtension" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Extension
                      </Label>
                      <Input
                        id="callerExtension"
                        name="callerExtension"
                        type="text"
                        placeholder="Enter extension"
                        className="h-9 text-sm"
                        value={formData.callerExtension}
                        onChange={handleInputChange}
                        disabled={formData.callerType === 'existing' && !!selectedCallerId}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: formData.callerType === 'existing' && !!selectedCallerId 
                            ? 'var(--slds-g-color-background-alt)' 
                            : 'var(--slds-g-color-background-base)',
                          cursor: formData.callerType === 'existing' && !!selectedCallerId ? 'not-allowed' : 'text'
                        }}
                        onFocus={(e) => {
                          if (!(formData.callerType === 'existing' && !!selectedCallerId)) {
                            e.currentTarget.style.outline = 'none';
                            e.currentTarget.style.borderColor = '#145F33';
                            e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                          }
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="callerEmail" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Email
                      </Label>
                      <Input
                        id="callerEmail"
                        name="callerEmail"
                        type="email"
                        placeholder="email@example.com"
                        className="h-9 text-sm"
                        value={formData.callerEmail}
                        onChange={handleInputChange}
                        disabled={formData.callerType === 'existing' && !!selectedCallerId}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: formData.callerType === 'existing' && !!selectedCallerId 
                            ? 'var(--slds-g-color-background-alt)' 
                            : 'var(--slds-g-color-background-base)',
                          cursor: formData.callerType === 'existing' && !!selectedCallerId ? 'not-allowed' : 'text'
                        }}
                        onFocus={(e) => {
                          if (!(formData.callerType === 'existing' && !!selectedCallerId)) {
                            e.currentTarget.style.outline = 'none';
                            e.currentTarget.style.borderColor = '#145F33';
                            e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                          }
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="language" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Language
                      </Label>
                      <Select
                        value={formData.language}
                        onValueChange={(value) => handleSelectChange('language', value)}
                        disabled={formData.callerType === 'existing' && !!selectedCallerId}
                      >
                        <SelectTrigger 
                          className="h-9 text-sm" 
                          style={{
                            borderColor: 'var(--slds-g-color-border-base-1)',
                            borderRadius: 'var(--slds-c-input-radius-border)',
                            backgroundColor: formData.callerType === 'existing' && !!selectedCallerId 
                              ? 'var(--slds-g-color-background-alt)' 
                              : 'var(--slds-g-color-background-base)',
                            cursor: formData.callerType === 'existing' && !!selectedCallerId ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent className="z-[150]">
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="Polish">Polish</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* State / Zip / Zip+4 Fields - 3 Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="callerState" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        State
                      </Label>
                      <Input
                        id="callerState"
                        name="callerState"
                        type="text"
                        placeholder="IL"
                        className="h-9 text-sm"
                        value={formData.callerState}
                        onChange={handleInputChange}
                        disabled={formData.callerType === 'existing' && !!selectedCallerId}
                        maxLength={2}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: formData.callerType === 'existing' && !!selectedCallerId 
                            ? 'var(--slds-g-color-background-alt)' 
                            : 'var(--slds-g-color-background-base)',
                          cursor: formData.callerType === 'existing' && !!selectedCallerId ? 'not-allowed' : 'text'
                        }}
                        onFocus={(e) => {
                          if (!(formData.callerType === 'existing' && !!selectedCallerId)) {
                            e.currentTarget.style.outline = 'none';
                            e.currentTarget.style.borderColor = '#145F33';
                            e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                          }
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="callerZip" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Zip
                      </Label>
                      <Input
                        id="callerZip"
                        name="callerZip"
                        type="text"
                        placeholder="60601"
                        className="h-9 text-sm"
                        value={formData.callerZip}
                        onChange={handleInputChange}
                        disabled={formData.callerType === 'existing' && !!selectedCallerId}
                        maxLength={5}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: formData.callerType === 'existing' && !!selectedCallerId 
                            ? 'var(--slds-g-color-background-alt)' 
                            : 'var(--slds-g-color-background-base)',
                          cursor: formData.callerType === 'existing' && !!selectedCallerId ? 'not-allowed' : 'text'
                        }}
                        onFocus={(e) => {
                          if (!(formData.callerType === 'existing' && !!selectedCallerId)) {
                            e.currentTarget.style.outline = 'none';
                            e.currentTarget.style.borderColor = '#145F33';
                            e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                          }
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="callerZipPlus4" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Zip+4
                      </Label>
                      <Input
                        id="callerZipPlus4"
                        name="callerZipPlus4"
                        type="text"
                        placeholder="1234"
                        className="h-9 text-sm"
                        value={formData.callerZipPlus4}
                        onChange={handleInputChange}
                        disabled={formData.callerType === 'existing' && !!selectedCallerId}
                        maxLength={4}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: formData.callerType === 'existing' && !!selectedCallerId 
                            ? 'var(--slds-g-color-background-alt)' 
                            : 'var(--slds-g-color-background-base)',
                          cursor: formData.callerType === 'existing' && !!selectedCallerId ? 'not-allowed' : 'text'
                        }}
                        onFocus={(e) => {
                          if (!(formData.callerType === 'existing' && !!selectedCallerId)) {
                            e.currentTarget.style.outline = 'none';
                            e.currentTarget.style.borderColor = '#145F33';
                            e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                          }
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  {/* Referral Source Field */}
                  <div>
                    <Label htmlFor="callerReferralSource" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Referral Source
                    </Label>
                    <Select
                      value={formData.callerReferralSource}
                      onValueChange={(value) => handleSelectChange('callerReferralSource', value)}
                      disabled={formData.callerType === 'existing' && !!selectedCallerId}
                    >
                      <SelectTrigger 
                        id="callerReferralSource"
                        className="h-9 text-sm" 
                        style={{
                          borderColor: 'var(--slds-g-color-border-base-1)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: formData.callerType === 'existing' && !!selectedCallerId 
                            ? 'var(--slds-g-color-background-alt)' 
                            : 'var(--slds-g-color-background-base)',
                          cursor: formData.callerType === 'existing' && !!selectedCallerId ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <SelectValue placeholder="Select referral source" />
                      </SelectTrigger>
                      <SelectContent className="z-[150]">
                        <SelectItem value="DCFS">DCFS</SelectItem>
                        <SelectItem value="School">School</SelectItem>
                        <SelectItem value="Community Organization">Community Organization</SelectItem>
                        <SelectItem value="Self">Self</SelectItem>
                        <SelectItem value="Family Member">Family Member</SelectItem>
                        <SelectItem value="Healthcare Provider">Healthcare Provider</SelectItem>
                        <SelectItem value="Court/Legal">Court/Legal</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Community Referral Organization Field */}
                  <div>
                    <Label htmlFor="callerCommunityOrg" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Community Referral Organization
                    </Label>
                    <Textarea
                      id="callerCommunityOrg"
                      name="callerCommunityOrg"
                      placeholder="Enter organization details..."
                      className="text-sm min-h-[80px] resize-y"
                      value={formData.callerCommunityOrg}
                      onChange={handleInputChange}
                      disabled={formData.callerType === 'existing' && !!selectedCallerId}
                      style={{
                        border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                        borderRadius: 'var(--slds-c-input-radius-border)',
                        backgroundColor: formData.callerType === 'existing' && !!selectedCallerId 
                          ? 'var(--slds-g-color-background-alt)' 
                          : 'var(--slds-g-color-background-base)',
                        cursor: formData.callerType === 'existing' && !!selectedCallerId ? 'not-allowed' : 'text'
                      }}
                      onFocus={(e) => {
                        if (!(formData.callerType === 'existing' && !!selectedCallerId)) {
                          e.currentTarget.style.outline = 'none';
                          e.currentTarget.style.borderColor = '#145F33';
                          e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                        }
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Candidate Information Section */}
              <div 
                className="p-4 space-y-4"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  borderRadius: 'var(--slds-c-card-radius-border)'
                }}
              >
                <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                  <User className="h-4 w-4" style={{ color: '#145F33' }} />
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Candidate Information
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {/* Youth Type Toggle */}


                  {/* Search Box for Youth Present */}
                  {formData.candidateType === 'present' && (
                    <div className="relative" ref={candidateSearchRef}>
                      <Label htmlFor="candidateSearch" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Search Candidate
                      </Label>
                      <div className="relative">
                        <Input
                          id="candidateSearch"
                          type="text"
                          placeholder="Type to search by name..."
                          className="h-9 text-sm pr-8"
                          value={candidateSearchTerm}
                          onChange={(e) => {
                            setCandidateSearchTerm(e.target.value);
                            setShowCandidateDropdown(true);
                          }}
                          onFocus={() => setShowCandidateDropdown(true)}
                          style={{
                            border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                            borderRadius: 'var(--slds-c-input-radius-border)',
                            backgroundColor: 'var(--slds-g-color-background-base)'
                          }}
                          onFocusCapture={(e) => {
                            e.currentTarget.style.outline = 'none';
                            e.currentTarget.style.borderColor = '#145F33';
                            e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>

                      {/* Search Results Dropdown */}
                      {showCandidateDropdown && filteredCandidates.length > 0 && (
                        <div 
                          className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
                          style={{
                            border: '1px solid var(--slds-g-color-border-base-4)',
                            borderRadius: 'var(--slds-c-input-radius-border)'
                          }}
                        >
                          {filteredCandidates.map((candidate) => (
                            <button
                              key={candidate.id}
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors border-b last:border-b-0"
                              style={{ borderColor: 'var(--slds-g-color-border-base-4)' }}
                              onClick={() => handleCandidateSelect(candidate.id)}
                            >
                              <div style={{ color: 'var(--slds-g-color-text-default)' }}>
                                {candidate.name}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Candidate Details Fields */}
                  {/* First Name and Last Name - 2 Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="candidateFirstName" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        First Name
                      </Label>
                      <Input
                        id="candidateFirstName"
                        name="candidateFirstName"
                        type="text"
                        placeholder="Enter first name"
                        className="h-9 text-sm"
                        value={formData.candidateFirstName}
                        onChange={handleInputChange}
                        disabled={formData.candidateType === 'present' && !!selectedCandidateId}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: formData.candidateType === 'present' && !!selectedCandidateId 
                            ? 'var(--slds-g-color-background-alt)' 
                            : 'var(--slds-g-color-background-base)',
                          cursor: formData.candidateType === 'present' && !!selectedCandidateId ? 'not-allowed' : 'text'
                        }}
                        onFocus={(e) => {
                          if (!(formData.candidateType === 'present' && !!selectedCandidateId)) {
                            e.currentTarget.style.outline = 'none';
                            e.currentTarget.style.borderColor = '#145F33';
                            e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                          }
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="candidateLastName" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Last Name
                      </Label>
                      <Input
                        id="candidateLastName"
                        name="candidateLastName"
                        type="text"
                        placeholder="Enter last name"
                        className="h-9 text-sm"
                        value={formData.candidateLastName}
                        onChange={handleInputChange}
                        disabled={formData.candidateType === 'present' && !!selectedCandidateId}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: formData.candidateType === 'present' && !!selectedCandidateId 
                            ? 'var(--slds-g-color-background-alt)' 
                            : 'var(--slds-g-color-background-base)',
                          cursor: formData.candidateType === 'present' && !!selectedCandidateId ? 'not-allowed' : 'text'
                        }}
                        onFocus={(e) => {
                          if (!(formData.candidateType === 'present' && !!selectedCandidateId)) {
                            e.currentTarget.style.outline = 'none';
                            e.currentTarget.style.borderColor = '#145F33';
                            e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                          }
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  {/* Date of Birth, Age, Gender - 3 Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="candidateDOB" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Date of Birth
                      </Label>
                      <DateInput
                        id="candidateDOB"
                        name="candidateDOB"
className="h-9 text-sm"
                        value={isoToMdy(formData.candidateDOB)}
                        onChange={(v) => (handleInputChange)({ target: { value: mdyToIso(v) } })}
                        disabled={formData.candidateType === 'present' && !!selectedCandidateId}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: formData.candidateType === 'present' && !!selectedCandidateId 
                            ? 'var(--slds-g-color-background-alt)' 
                            : 'var(--slds-g-color-background-base)',
                          cursor: formData.candidateType === 'present' && !!selectedCandidateId ? 'not-allowed' : 'text'
                        }}
                        onFocus={(e) => {
                          if (!(formData.candidateType === 'present' && !!selectedCandidateId)) {
                            e.currentTarget.style.outline = 'none';
                            e.currentTarget.style.borderColor = '#145F33';
                            e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                          }
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="candidateAge" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Age
                      </Label>
                      <Input
                        id="candidateAge"
                        name="candidateAge"
                        type="number"
                        placeholder="Enter age"
                        className="h-9 text-sm"
                        value={formData.candidateAge}
                        onChange={handleInputChange}
                        disabled={formData.candidateType === 'present' && !!selectedCandidateId}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: formData.candidateType === 'present' && !!selectedCandidateId 
                            ? 'var(--slds-g-color-background-alt)' 
                            : 'var(--slds-g-color-background-base)',
                          cursor: formData.candidateType === 'present' && !!selectedCandidateId ? 'not-allowed' : 'text'
                        }}
                        onFocus={(e) => {
                          if (!(formData.candidateType === 'present' && !!selectedCandidateId)) {
                            e.currentTarget.style.outline = 'none';
                            e.currentTarget.style.borderColor = '#145F33';
                            e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                          }
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="candidateGender" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Gender
                      </Label>
                      <Select
                        value={formData.candidateGender}
                        onValueChange={(value) => handleSelectChange('candidateGender', value)}
                        disabled={formData.candidateType === 'present' && !!selectedCandidateId}
                      >
                        <SelectTrigger 
                          className="h-9 text-sm" 
                          style={{
                            borderColor: 'var(--slds-g-color-border-base-1)',
                            borderRadius: 'var(--slds-c-input-radius-border)',
                            backgroundColor: formData.candidateType === 'present' && !!selectedCandidateId 
                              ? 'var(--slds-g-color-background-alt)' 
                              : 'var(--slds-g-color-background-base)',
                            cursor: formData.candidateType === 'present' && !!selectedCandidateId ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Relationship to Candidate - Full Width */}
                  <div>
                    <Label htmlFor="candidateRelationship" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Relationship to Candidate
                    </Label>
                    <Select
                      value={formData.candidateRelationship}
                      onValueChange={(value) => handleSelectChange('candidateRelationship', value)}
                      disabled={formData.candidateType === 'present' && !!selectedCandidateId}
                    >
                      <SelectTrigger 
                        className="h-9 text-sm" 
                        style={{
                          borderColor: 'var(--slds-g-color-border-base-1)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: formData.candidateType === 'present' && !!selectedCandidateId 
                            ? 'var(--slds-g-color-background-alt)' 
                            : 'var(--slds-g-color-background-base)',
                          cursor: formData.candidateType === 'present' && !!selectedCandidateId ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent className="z-[150]">
                        <SelectItem value="Career Resources Coordinator">Career Resources Coordinator</SelectItem>
                        <SelectItem value="Admissions Case Manager">Admissions Case Manager</SelectItem>
                        <SelectItem value="Case Worker">Case Worker</SelectItem>
                        <SelectItem value="Client">Client</SelectItem>
                        <SelectItem value="Co-Worker">Co-Worker</SelectItem>
                        <SelectItem value="Coach">Coach</SelectItem>
                        <SelectItem value="Counselee">Counselee</SelectItem>
                        <SelectItem value="Counselor">Counselor</SelectItem>
                        <SelectItem value="Cousin">Cousin</SelectItem>
                        <SelectItem value="Daughter">Daughter</SelectItem>
                        <SelectItem value="Dean">Dean</SelectItem>
                        <SelectItem value="Dentist">Dentist</SelectItem>
                        <SelectItem value="Dependent">Dependent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Phone Information Section - Only for New Youth */}
                  {formData.candidateType === 'new' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="candidatePhone" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            Phone
                          </Label>
                          <Input
                            id="candidatePhone"
                            name="candidatePhone"
                            type="tel"
                            placeholder="(555) 555-5555"
                            className="h-9 text-sm"
                            value={formData.candidatePhone}
                            onChange={handleInputChange}
                            style={{
                              border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                              borderRadius: 'var(--slds-c-input-radius-border)',
                              backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.outline = 'none';
                              e.currentTarget.style.borderColor = '#145F33';
                              e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          />
                        </div>

                        <div>
                          <Label htmlFor="candidatePhoneExt" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            Extension
                          </Label>
                          <Input
                            id="candidatePhoneExt"
                            name="candidatePhoneExt"
                            type="text"
                            placeholder="Enter extension"
                            className="h-9 text-sm"
                            value={formData.candidatePhoneExt}
                            onChange={handleInputChange}
                            style={{
                              border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                              borderRadius: 'var(--slds-c-input-radius-border)',
                              backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.outline = 'none';
                              e.currentTarget.style.borderColor = '#145F33';
                              e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          />
                        </div>

                        <div>
                          <Label htmlFor="candidatePhoneType" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            Phone Type
                          </Label>
                          <Select
                            value={formData.candidatePhoneType}
                            onValueChange={(value) => handleSelectChange('candidatePhoneType', value)}
                          >
                            <SelectTrigger 
                              className="h-9 text-sm" 
                              style={{
                                borderColor: 'var(--slds-g-color-border-base-1)',
                                borderRadius: 'var(--slds-c-input-radius-border)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                              }}
                            >
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="z-[150]">
                              <SelectItem value="Home">Home</SelectItem>
                              <SelectItem value="Business">Business</SelectItem>
                              <SelectItem value="Mobile">Mobile</SelectItem>
                              <SelectItem value="Fax">Fax</SelectItem>
                              <SelectItem value="Unknown">Unknown</SelectItem>
                              <SelectItem value="General">General</SelectItem>
                              <SelectItem value="Hotline">Hotline</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        </div>
                  )}

                  {/* Email Information Section - Only for New Youth */}
                  {formData.candidateType === 'new' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="candidateEmail" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            Email
                          </Label>
                          <Input
                            id="candidateEmail"
                            name="candidateEmail"
                            type="email"
                            placeholder="email@example.com"
                            className="h-9 text-sm"
                            value={formData.candidateEmail}
                            onChange={handleInputChange}
                            style={{
                              border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                              borderRadius: 'var(--slds-c-input-radius-border)',
                              backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.outline = 'none';
                              e.currentTarget.style.borderColor = '#145F33';
                              e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          />
                        </div>

                        <div>
                          <Label htmlFor="candidateEmailType" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            Email Type
                          </Label>
                          <Select
                            value={formData.candidateEmailType}
                            onValueChange={(value) => handleSelectChange('candidateEmailType', value)}
                          >
                            <SelectTrigger 
                              className="h-9 text-sm" 
                              style={{
                                borderColor: 'var(--slds-g-color-border-base-1)',
                                borderRadius: 'var(--slds-c-input-radius-border)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                              }}
                            >
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="z-[150]">
                              <SelectItem value="Home">Home</SelectItem>
                              <SelectItem value="Business">Business</SelectItem>
                              <SelectItem value="School">School</SelectItem>
                              <SelectItem value="Unknown">Unknown</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        </div>
                  )}

                  {/* Address Information Section - Only for New Youth */}
                  {formData.candidateType === 'new' && (
                    <>
                      {/* Street Address - Full Width */}
                      <div>
                    <Label htmlFor="candidateStreetAddress" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Street Address
                    </Label>
                    <Input
                      id="candidateStreetAddress"
                      name="candidateStreetAddress"
                      type="text"
                      placeholder="Enter street address"
                      className="h-9 text-sm"
                      value={formData.candidateStreetAddress}
                      onChange={handleInputChange}
                      style={{
                        border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                        borderRadius: 'var(--slds-c-input-radius-border)',
                        backgroundColor: 'var(--slds-g-color-background-base)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.outline = 'none';
                        e.currentTarget.style.borderColor = '#145F33';
                        e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Address Line 2 - Full Width */}
                  <div>
                    <Label htmlFor="candidateAddressLine2" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Address Line 2
                    </Label>
                    <Input
                      id="candidateAddressLine2"
                      name="candidateAddressLine2"
                      type="text"
                      placeholder="Apt, Suite, Unit, etc."
                      className="h-9 text-sm"
                      value={formData.candidateAddressLine2}
                      onChange={handleInputChange}
                      style={{
                        border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                        borderRadius: 'var(--slds-c-input-radius-border)',
                        backgroundColor: 'var(--slds-g-color-background-base)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.outline = 'none';
                        e.currentTarget.style.borderColor = '#145F33';
                        e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* City, State, Zip, Zip+4 - 4 Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                            <Label htmlFor="candidateCity" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                              City
                            </Label>
                            <Input
                              id="candidateCity"
                              name="candidateCity"
                              type="text"
                              placeholder="Enter city"
                              className="h-9 text-sm"
                              value={formData.candidateCity}
                              onChange={handleInputChange}
                              style={{
                                border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                                borderRadius: 'var(--slds-c-input-radius-border)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.outline = 'none';
                                e.currentTarget.style.borderColor = '#145F33';
                                e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            />
                          </div>

                          <div>
                            <Label htmlFor="candidateState" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                              State
                            </Label>
                            <Input
                              id="candidateState"
                              name="candidateState"
                              type="text"
                              placeholder="IL"
                              className="h-9 text-sm"
                              value={formData.candidateState}
                              onChange={handleInputChange}
                              maxLength={2}
                              style={{
                                border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                                borderRadius: 'var(--slds-c-input-radius-border)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.outline = 'none';
                                e.currentTarget.style.borderColor = '#145F33';
                                e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            />
                          </div>

                          <div>
                            <Label htmlFor="candidateZip" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                              Zip
                            </Label>
                            <Input
                              id="candidateZip"
                              name="candidateZip"
                              type="text"
                              placeholder="60601"
                              className="h-9 text-sm"
                              value={formData.candidateZip}
                              onChange={handleInputChange}
                              maxLength={5}
                              style={{
                                border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                                borderRadius: 'var(--slds-c-input-radius-border)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.outline = 'none';
                                e.currentTarget.style.borderColor = '#145F33';
                                e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            />
                          </div>

                          <div>
                            <Label htmlFor="candidateZipPlus4" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                              Zip+4
                            </Label>
                            <Input
                              id="candidateZipPlus4"
                              name="candidateZipPlus4"
                              type="text"
                              placeholder="1234"
                              className="h-9 text-sm"
                              value={formData.candidateZipPlus4}
                              onChange={handleInputChange}
                              maxLength={4}
                              style={{
                                border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                                borderRadius: 'var(--slds-c-input-radius-border)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.outline = 'none';
                                e.currentTarget.style.borderColor = '#145F33';
                                e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            />
                          </div>
                        </div>

                        {/* Address Type - Full Width */}
                        <div>
                          <Label htmlFor="candidateAddressType" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            Address Type
                          </Label>
                          <Select
                            value={formData.candidateAddressType}
                            onValueChange={(value) => handleSelectChange('candidateAddressType', value)}
                          >
                            <SelectTrigger 
                              className="h-9 text-sm" 
                              style={{
                                borderColor: 'var(--slds-g-color-border-base-1)',
                                borderRadius: 'var(--slds-c-input-radius-border)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                              }}
                            >
                              <SelectValue placeholder="Select address type" />
                            </SelectTrigger>
                            <SelectContent className="z-[150]">
                              <SelectItem value="Home">Home</SelectItem>
                              <SelectItem value="Business">Business</SelectItem>
                              <SelectItem value="School">School</SelectItem>
                              <SelectItem value="Seasonal">Seasonal</SelectItem>
                              <SelectItem value="Unknown">Unknown</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                    </>
                  )}
                </div>
              </div>

              {/* Contact Details Section */}
              <div 
                className="p-4 space-y-4"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  borderRadius: 'var(--slds-c-card-radius-border)'
                }}
              >
                <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" style={{ color: '#145F33' }} />
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Contact Details
                    </h3>
                  </div>
                  {/* AC10: Follow-up Status Badge */}
                  {formData.followUpStatus && (
                    <div 
                      className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"
                      style={{
                        backgroundColor: formData.followUpStatus === 'Completed' ? '#e6f2eb' : '#fff4e5',
                        color: formData.followUpStatus === 'Completed' ? '#145F33' : '#b86700',
                        border: `1px solid ${formData.followUpStatus === 'Completed' ? '#145F33' : '#b86700'}`
                      }}
                    >
                      <CheckSquare className="h-3 w-3" />
                      Follow-up: {formData.followUpStatus}
                    </div>
                  )}
                </div>
                
                {/* Contact Date, Contact Type, Contact Topic - 3 Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="contactDate" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Contact Date <span className="text-red-600">*</span>
                    </Label>
                    <DateInput
                      id="contactDate"
                      name="contactDate"
className="h-9 text-sm"
                      value={isoToMdy(formData.contactDate)}
                      onChange={(v) => (handleInputChange)({ target: { value: mdyToIso(v) } })}
                      style={{
                        border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                        borderRadius: 'var(--slds-c-input-radius-border)',
                        backgroundColor: 'var(--slds-g-color-background-base)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.outline = 'none';
                        e.currentTarget.style.borderColor = '#145F33';
                        e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contactType" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Contact Type <span className="text-red-600">*</span>
                    </Label>
                    <Select
                      value={formData.contactType}
                      onValueChange={(value) => handleSelectChange('contactType', value)}
                    >
                      <SelectTrigger 
                        className="h-9 text-sm" 
                        style={{
                          borderColor: 'var(--slds-g-color-border-base-1)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                      >
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="z-[150]">
                        <SelectItem value="Phone Call">Phone Call</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="In-Person">In-Person</SelectItem>
                        <SelectItem value="Text Message">Text Message</SelectItem>
                        <SelectItem value="Voicemail">Voicemail</SelectItem>
                        <SelectItem value="Video Call">Video Call</SelectItem>
                        <SelectItem value="Letter/Mail">Letter/Mail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="contactTopic" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Contact Topic
                    </Label>
                    <Select
                      value={formData.contactTopic}
                      onValueChange={(value) => handleSelectChange('contactTopic', value)}
                    >
                      <SelectTrigger 
                        className="h-9 text-sm" 
                        style={{
                          borderColor: 'var(--slds-g-color-border-base-1)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                      >
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                      <SelectContent className="z-[150]">
                        <SelectItem value="Clinical">Clinical</SelectItem>
                        <SelectItem value="School">School</SelectItem>
                        <SelectItem value="Legal">Legal</SelectItem>
                        <SelectItem value="Medication">Medication</SelectItem>
                        <SelectItem value="Safety">Safety</SelectItem>
                        <SelectItem value="Scheduling">Scheduling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Category (REQUIRED) - Full Width */}
                <div>
                  <Label htmlFor="category" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Category <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange('category', value)}
                  >
                    <SelectTrigger 
                      className="h-9 text-sm" 
                      style={{
                        borderColor: !formData.category ? '#c23934' : 'var(--slds-g-color-border-base-1)',
                        borderRadius: 'var(--slds-c-input-radius-border)',
                        backgroundColor: 'var(--slds-g-color-background-base)'
                      }}
                    >
                      <SelectValue placeholder="Select category (required)" />
                    </SelectTrigger>
                    <SelectContent className="z-[150]">
                      <SelectItem value="DCFS">DCFS</SelectItem>
                      <SelectItem value="Guardianship">Guardianship</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                      <SelectItem value="School">School</SelectItem>
                      <SelectItem value="Medical">Medical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Contact Result and Referral Source - 2 Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactResult" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Contact Result
                    </Label>
                    <Select
                      value={formData.contactResult}
                      onValueChange={(value) => handleSelectChange('contactResult', value)}
                    >
                      <SelectTrigger 
                        className="h-9 text-sm" 
                        style={{
                          borderColor: 'var(--slds-g-color-border-base-1)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                      >
                        <SelectValue placeholder="Select result" />
                      </SelectTrigger>
                      <SelectContent className="z-[150]">
                        <SelectItem value="Connected">Connected</SelectItem>
                        <SelectItem value="Left Message">Left Message</SelectItem>
                        <SelectItem value="No Answer">No Answer</SelectItem>
                        <SelectItem value="Scheduled Follow-up">Scheduled Follow-up</SelectItem>
                        <SelectItem value="Call Back Requested">Call Back Requested</SelectItem>
                        <SelectItem value="Wrong Number">Wrong Number</SelectItem>
                        <SelectItem value="Busy">Busy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="referralSource" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Referral Source
                    </Label>
                    <Select
                      value={formData.referralSource}
                      onValueChange={(value) => handleSelectChange('referralSource', value)}
                    >
                      <SelectTrigger 
                        className="h-9 text-sm" 
                        style={{
                          borderColor: 'var(--slds-g-color-border-base-1)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                      >
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent className="z-[150]">
                        <SelectItem value="DCFS">DCFS</SelectItem>
                        <SelectItem value="School">School</SelectItem>
                        <SelectItem value="Community Organization">Community Organization</SelectItem>
                        <SelectItem value="Self">Self</SelectItem>
                        <SelectItem value="Family Member">Family Member</SelectItem>
                        <SelectItem value="Healthcare Provider">Healthcare Provider</SelectItem>
                        <SelectItem value="Court/Legal">Court/Legal</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Contact Details (Comments) - Full Width */}
                <div>
                  <Label htmlFor="notes" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Contact Details (Comments)
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Enter interaction details and any relevant notes..."
                    className="text-sm min-h-[100px] resize-y"
                    value={formData.notes}
                    onChange={handleInputChange}
                    style={{
                      border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                      borderRadius: 'var(--slds-c-input-radius-border)',
                      backgroundColor: 'var(--slds-g-color-background-base)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.outline = 'none';
                      e.currentTarget.style.borderColor = '#145F33';
                      e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                
                {/* Follow-up Checkbox */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="needsFollowUp"
                      checked={formData.needsFollowUp}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-2"
                      style={{ 
                        accentColor: '#145F33',
                        borderColor: '#c9c9c9',
                        backgroundColor: '#ffffff',
                        colorScheme: 'light'
                      }}
                    />
                    <span className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Follow-up Needed?
                    </span>
                  </label>
                </div>

                {/* Conditional Follow-up Fields - Only visible when checkbox is checked */}
                {formData.needsFollowUp && (
                  <div 
                    className="p-4 space-y-4 rounded-lg"
                    style={{
                      backgroundColor: 'var(--slds-g-color-background-alt-2)',
                      border: '1px solid var(--slds-g-color-border-base-1)',
                    }}
                  >
                    <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                      <CheckSquare className="h-4 w-4" style={{ color: '#145F33' }} />
                      <h4 className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Follow-up Task Details
                      </h4>
                    </div>

                    <div>
                      <Label htmlFor="followUpDueDate" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Due Date <span className="text-red-600">*</span>
                      </Label>
                      <DateInput
                        id="followUpDueDate"
                        name="followUpDueDate"
className="h-9 text-sm"
                        value={isoToMdy(formData.followUpDueDate)}
                        onChange={(v) => (handleInputChange)({ target: { value: mdyToIso(v) } })}
                        min={localTodayIso()}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.outline = 'none';
                          e.currentTarget.style.borderColor = '#145F33';
                          e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="followUpNotes" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Follow-up Notes (Optional)
                      </Label>
                      <Textarea
                        id="followUpNotes"
                        name="followUpNotes"
                        placeholder="Add any specific follow-up instructions or context..."
                        className="text-sm min-h-[80px] resize-y"
                        value={formData.followUpNotes}
                        onChange={handleInputChange}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.outline = 'none';
                          e.currentTarget.style.borderColor = '#145F33';
                          e.currentTarget.style.boxShadow = '0 0 3px rgba(20, 95, 51, 0.5)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-4, #c9c9c9)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    <div 
                      className="p-3 rounded text-xs space-y-1"
                      style={{
                        backgroundColor: '#e6f2eb',
                        border: '1px solid #145F33',
                        color: '#145F33'
                      }}
                    >
                      <div><strong>Automatic Task Creation (AC3, AC4, AC5, AC6):</strong></div>
                      <div>• Task subject: "{formData.category || '[Category]'} Follow-up: {formData.candidateFirstName && formData.candidateLastName ? `${formData.candidateFirstName} ${formData.candidateLastName}` : '[Youth Name]'}"</div>
                      <div>• Task description: Follow-up notes (or contact details if notes are empty)</div>
                      <div>• Linked to youth record and visible in Activity Timeline</div>
                      <div>• When you mark the task "Completed," this contact log will automatically update to show the follow-up is resolved (AC9)</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div 
            className="px-6 py-4 border-t flex items-center justify-end gap-3 flex-shrink-0"
            style={{
              backgroundColor: 'var(--slds-g-color-background-alt)',
              borderColor: 'var(--slds-g-color-border-base-1)'
            }}
          >
            <Button
              type="button"
              className="h-[32px] rounded-full text-[13px] px-4 shadow-none"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-alt)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-base)';
              }}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-[32px] rounded-full text-[13px] px-4 text-white shadow-none"
              style={{
                backgroundColor: '#145F33',
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
              onClick={handleSubmitForm}
            >
              Save Contact Log
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}