import { useState } from "react";
import { Check, Calendar, User, Plus, Pencil, Trash2, Users, Search, HelpCircle } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { toast } from "sonner@2.0.3";
import { CONTACT_LOGS } from "../../data/mockContactLogs";
import { PromoteSuccessDialog } from "../PromoteSuccessDialog";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, formatMdy, localTodayIso } from "../../lib/dateFormat";

interface PromoteToAdmissionsPageProps {
  onBack: () => void;
  initialData?: {
    // Candidate Information
    firstName?: string;
    lastName?: string;
    birthdate?: string;
    sex?: string;
    phone?: string;
    phoneExtension?: string;
    phoneType?: string;
    email?: string;
    emailType?: string;
    street?: string;
    street2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    zipPlus4?: string;
    addressType?: string;
    // Emergency Contact Information
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
  };
  onSubmit?: (admissionData: {
    firstName: string;
    lastName: string;
    phone: string;
    candidateType: string;
    caseManager: string;
  }) => void;
  onSuccess?: () => void; // New callback for successful submission
}

// Mock existing candidates from Mercy Home database
const EXISTING_CANDIDATES = [
  { 
    id: "ec1", 
    firstName: "Marcus", 
    lastName: "Thompson", 
    birthdate: "2008-03-12", 
    sex: "Male",
    phone: "(312) 555-2001",
    phoneExtension: "",
    phoneType: "Mobile",
    email: "marcus.thompson@example.com",
    emailType: "Personal",
    street: "2850 S Michigan Ave",
    street2: "Apt 4B",
    city: "Chicago",
    state: "IL",
    zipCode: "60616",
    zipPlus4: "3456",
    addressType: "Home"
  },
  { 
    id: "ec2", 
    firstName: "Jessica", 
    lastName: "Rodriguez", 
    birthdate: "2009-07-22", 
    sex: "Female",
    phone: "(312) 555-2002",
    phoneExtension: "",
    phoneType: "Mobile",
    email: "jessica.rodriguez@example.com",
    emailType: "Personal",
    street: "1525 W 18th St",
    street2: "",
    city: "Chicago",
    state: "IL",
    zipCode: "60608",
    zipPlus4: "7890",
    addressType: "Home"
  },
  { 
    id: "ec3", 
    firstName: "Tyler", 
    lastName: "Washington", 
    birthdate: "2010-11-05", 
    sex: "Male",
    phone: "(312) 555-2003",
    phoneExtension: "101",
    phoneType: "Home",
    email: "tyler.w@example.com",
    emailType: "Personal",
    street: "4800 S Lake Park Ave",
    street2: "",
    city: "Chicago",
    state: "IL",
    zipCode: "60615",
    zipPlus4: "2345",
    addressType: "Home"
  },
  { 
    id: "ec4", 
    firstName: "Sophia", 
    lastName: "Martinez", 
    birthdate: "2009-04-18", 
    sex: "Female",
    phone: "(312) 555-2004",
    phoneExtension: "",
    phoneType: "Mobile",
    email: "sophia.martinez@example.com",
    emailType: "Personal",
    street: "2401 W Fullerton Ave",
    street2: "Unit 2",
    city: "Chicago",
    state: "IL",
    zipCode: "60647",
    zipPlus4: "6789",
    addressType: "Home"
  },
  { 
    id: "ec5", 
    firstName: "Jordan", 
    lastName: "Chen", 
    birthdate: "2011-09-30", 
    sex: "Non-binary",
    phone: "(312) 555-2005",
    phoneExtension: "",
    phoneType: "Mobile",
    email: "jordan.chen@example.com",
    emailType: "Personal",
    street: "3456 N Sheffield Ave",
    street2: "",
    city: "Chicago",
    state: "IL",
    zipCode: "60657",
    zipPlus4: "0123",
    addressType: "Home"
  },
  { 
    id: "ec6", 
    firstName: "Emma", 
    lastName: "Johnson", 
    birthdate: "2008-12-14", 
    sex: "Female",
    phone: "(312) 555-2006",
    phoneExtension: "205",
    phoneType: "Home",
    email: "emma.johnson@example.com",
    emailType: "Personal",
    street: "6745 S Cottage Grove Ave",
    street2: "Apt 3C",
    city: "Chicago",
    state: "IL",
    zipCode: "60637",
    zipPlus4: "4567",
    addressType: "Home"
  },
  { 
    id: "ec7", 
    firstName: "Isaiah", 
    lastName: "Brown", 
    birthdate: "2012-02-28", 
    sex: "Male",
    phone: "(312) 555-2007",
    phoneExtension: "",
    phoneType: "Mobile",
    email: "isaiah.brown@example.com",
    emailType: "Personal",
    street: "1234 W Diversey Pkwy",
    street2: "",
    city: "Chicago",
    state: "IL",
    zipCode: "60614",
    zipPlus4: "8901",
    addressType: "Home"
  },
  { 
    id: "ec8", 
    firstName: "Alyssa", 
    lastName: "Davis", 
    birthdate: "2010-06-09", 
    sex: "Female",
    phone: "(312) 555-2008",
    phoneExtension: "",
    phoneType: "Mobile",
    email: "alyssa.davis@example.com",
    emailType: "Personal",
    street: "5523 S Harper Ave",
    street2: "Unit 1A",
    city: "Chicago",
    state: "IL",
    zipCode: "60615",
    zipPlus4: "2345",
    addressType: "Home"
  },
];

// Mock case managers list
const CASE_MANAGERS = [
  { id: "cm1", name: "Sarah Johnson", title: "LCSW", caseload: 12, maxCaseload: 15 },
  { id: "cm2", name: "Michael Chen", title: "MSW", caseload: 14, maxCaseload: 15 },
  { id: "cm3", name: "Emily Rodriguez", title: "LCSW", caseload: 10, maxCaseload: 15 },
  { id: "cm4", name: "David Thompson", title: "MSW", caseload: 8, maxCaseload: 15 },
  { id: "cm5", name: "Jennifer Williams", title: "LCSW", caseload: 11, maxCaseload: 15 },
  { id: "cm6", name: "Robert Martinez", title: "MSW", caseload: 13, maxCaseload: 15 },
];

// Mock info sessions
const INFO_SESSIONS = [
  { id: "is1", date: "2026-01-15", time: "10:00 AM", topic: "Residential Program Overview", capacity: 20, enrolled: 12 },
  { id: "is2", date: "2026-01-18", time: "2:00 PM", topic: "Transitional Living Services", capacity: 15, enrolled: 8 },
  { id: "is3", date: "2026-01-22", time: "11:00 AM", topic: "Family Support Programs", capacity: 25, enrolled: 18 },
  { id: "is4", date: "2026-01-25", time: "3:00 PM", topic: "Mental Health Services", capacity: 20, enrolled: 14 },
  { id: "is5", date: "2026-01-29", time: "1:00 PM", topic: "Educational Support & IEP", capacity: 15, enrolled: 9 },
];

// Mock non-constituent participants (external professionals, family members not in system)
const NON_CONSTITUENT_PARTICIPANTS = [
  "Dr. Sarah Thompson - Therapist",
  "Rev. Michael Johnson - Community Leader",
  "Officer David Martinez - Police Liaison",
  "Ms. Jennifer Adams - School Counselor",
  "Mr. Robert Wilson - Probation Officer",
  "Dr. Emily Chen - Psychiatrist",
  "Ms. Lisa Garcia - Social Worker",
  "Mr. James Brown - Youth Mentor",
  "Ms. Patricia Davis - Attorney",
  "Mr. Carlos Hernandez - Community Outreach"
];

// Mock role mapping for constituents (based on CONTACT_LOGS caller field)
// Map from constituent name to their available roles
const CONSTITUENT_ROLES: Record<string, string[]> = {
  "John Doe": ["Mother - Jane Doe", "Father - John Doe Sr.", "Guardian - Jane Doe", "Emergency Contact - Jane Doe"],
  "Sarah Smith": ["Father - Robert Smith", "Mother - Linda Smith", "Guardian - Robert Smith", "Grandparent - Margaret Smith"],
  "Mike Jones": ["Mother - Emily Jones", "Father - David Jones", "Guardian - Emily Jones", "Aunt - Rebecca Jones"],
  "Amanda Rodriguez": ["Father - Carlos Rodriguez", "Mother - Maria Rodriguez", "Guardian - Carlos Rodriguez", "Uncle - Jose Rodriguez"],
  "Jessica Taylor": ["Father - Robert Taylor", "Mother - Susan Taylor", "Guardian - Robert Taylor", "Stepmother - Linda Taylor"],
  "Brandon Lee": ["Mother - Michelle Lee", "Father - Kevin Lee", "Guardian - Michelle Lee", "Grandmother - Nancy Lee"],
  "Christopher Brown": ["Mother - Lisa Brown", "Father - Mark Brown", "Guardian - Lisa Brown", "Sister - Amanda Brown"],
  "Kayla Martinez": ["Father - Jose Martinez", "Mother - Carmen Martinez", "Guardian - Jose Martinez", "Grandmother - Rosa Martinez"],
  "David Kim": ["Mother - Susan Kim", "Father - James Kim", "Guardian - Susan Kim", "Aunt - Grace Kim"],
  "Emma Wilson": ["Father - James Wilson", "Mother - Patricia Wilson", "Guardian - James Wilson", "Uncle - Michael Wilson"],
  "Isabella Garcia": ["Mother - Carmen Garcia", "Father - Luis Garcia", "Guardian - Carmen Garcia", "Aunt - Sofia Garcia"],
  "Noah Thompson": ["Mother - Jennifer Thompson", "Father - Richard Thompson", "Guardian - Jennifer Thompson", "Grandfather - Robert Thompson Sr."],
  "Tyler Jackson": ["Mother - Maria Jackson", "Father - Andre Jackson", "Guardian - Maria Jackson", "Brother - Marcus Jackson"],
  "Mia Robinson": ["Mother - Karen Robinson", "Father - Thomas Robinson", "Guardian - Karen Robinson", "Stepfather - James Robinson"],
  "Liam Patel": ["Father - Raj Patel", "Mother - Priya Patel", "Guardian - Raj Patel", "Uncle - Amit Patel"],
  "Olivia Harris": ["Father - Thomas Harris", "Mother - Rachel Harris", "Guardian - Thomas Harris", "Aunt - Jessica Harris"],
  "Ethan Martinez": ["Mother - Ana Martinez", "Father - Diego Martinez", "Guardian - Ana Martinez", "Grandmother - Isabel Martinez"],
  "Sophia Anderson": ["Father - Michael Anderson", "Mother - Jennifer Anderson", "Guardian - Michael Anderson", "Sister - Emma Anderson"],
  "Kevin Wong": ["Mother - Patricia Wong", "Father - David Wong", "Guardian - Patricia Wong", "Grandfather - Henry Wong"],
  "Marcus Johnson": ["Professional Referral - Dr. Rachel Green", "Caseworker - Dr. Rachel Green", "Medical Provider - Dr. Rachel Green"],
  "Sofia Rivera": ["DCFS Worker - Angela Rivera", "Caseworker - Angela Rivera", "Guardian - Angela Rivera"],
  "Daniel Stevens": ["Father - Mark Stevens", "Mother - Sarah Stevens", "Guardian - Mark Stevens", "Uncle - Ryan Stevens"],
  "Jason Chen": ["Mother - Linda Chen", "Father - William Chen", "Guardian - Linda Chen", "Aunt - Michelle Chen"]
};

// Mock role mapping for non-constituents
const NON_CONSTITUENT_ROLES: Record<string, string[]> = {
  "Dr. Sarah Thompson - Therapist": ["Therapist", "Clinical Consultant", "Mental Health Provider"],
  "Rev. Michael Johnson - Community Leader": ["Community Leader", "Spiritual Advisor", "Mentor"],
  "Officer David Martinez - Police Liaison": ["Police Liaison", "Community Relations Officer", "Safety Coordinator"],
  "Ms. Jennifer Adams - School Counselor": ["School Counselor", "Educational Advocate", "Academic Advisor"],
  "Mr. Robert Wilson - Probation Officer": ["Probation Officer", "Court Liaison", "Legal Monitor"],
  "Dr. Emily Chen - Psychiatrist": ["Psychiatrist", "Medical Provider", "Medication Manager"],
  "Ms. Lisa Garcia - Social Worker": ["Social Worker", "Case Manager", "Family Support Specialist"],
  "Mr. James Brown - Youth Mentor": ["Youth Mentor", "Life Coach", "Peer Advocate"],
  "Ms. Patricia Davis - Attorney": ["Attorney", "Legal Advocate", "Guardian Ad Litem"],
  "Mr. Carlos Hernandez - Community Outreach": ["Community Outreach Worker", "Resource Coordinator", "Family Navigator"]
};

export function PromoteToAdmissionsPage({ 
  onBack, 
  initialData = {},
  onSubmit,
  onSuccess
}: PromoteToAdmissionsPageProps) {
  // Step state
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  
  // Youth Type Toggle State
  const [youthType, setYouthType] = useState<'present' | 'new'>('present');
  
  // Search for existing youth
  const [youthSearchTerm, setYouthSearchTerm] = useState("");
  const [showYouthDropdown, setShowYouthDropdown] = useState(false);
  
  // Form data for simple youth information
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || "Marcus",
    lastName: initialData?.lastName || "Thompson",
    birthdate: initialData?.birthdate || "2008-03-12",
    sex: initialData?.sex || "Male",
    candidateType: "new", // "new" or "existing"
    youthRoleStartDate: "", // Leave empty to show pending status
    // Phone fields
    phone: initialData?.phone || "(312) 555-2001",
    phoneExtension: initialData?.phoneExtension || "",
    phoneType: initialData?.phoneType || "Mobile",
    // Email fields
    email: initialData?.email || "marcus.thompson@example.com",
    emailType: initialData?.emailType || "Personal",
    // Address fields - partially populated
    street: initialData?.street || "2850 S Michigan Ave",
    street2: initialData?.street2 || "", // Leave empty
    city: initialData?.city || "Chicago",
    state: initialData?.state || "IL",
    zipCode: initialData?.zipCode || "60616",
    zipPlus4: initialData?.zipPlus4 || "", // Leave empty
    addressType: initialData?.addressType || "", // Leave empty
  });

  // Selected existing candidate
  const [selectedExistingCandidate, setSelectedExistingCandidate] = useState("");

  // Step 2: Case Manager Selection
  const [selectedCaseManager, setSelectedCaseManager] = useState("");

  // Step 3: Info Session (Optional)
  const [skipInfoSession, setSkipInfoSession] = useState(false);
  const [infoSessionData, setInfoSessionData] = useState({
    date: "",
    time: "",
    location: "",
    notes: "",
    caller: "",
    candidate: "",
    phone: "",
    language: "",
    referralDate: "",
    topic: "",
    facilitator: "",
    expectedAttendees: "",
    capacity: "",
    mostRecentHistory: "",
    needsFollowUp: false,
  });

  // Step 4: Manage Participants (Optional)
  const [participants, setParticipants] = useState<Array<{
    id: number;
    type: string;
    participant: string;
    role: string;
    attended: boolean;
    reasonMissed: string;
  }>>([
    { id: 1, type: "Youth", participant: "Aaron Ace", role: "Candidate", attended: true, reasonMissed: "" },
    { id: 2, type: "Guardian/Family", participant: "Mary Ace", role: "Mother", attended: false, reasonMissed: "Work Conflict" },
  ]);
  const [participantDialogOpen, setParticipantDialogOpen] = useState(false);
  const [editingParticipantId, setEditingParticipantId] = useState<number | null>(null);
  const [participantFormData, setParticipantFormData] = useState({
    type: "",
    participant: "",
    role: "",
    attended: false,
    reasonMissed: ""
  });
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<number[]>([]);

  // Success dialog state
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Check if youth information is pre-populated
  const isYouthInfoPrePopulated = formData.firstName && formData.lastName && formData.birthdate && formData.sex && formData.phone;

  // Check completion status for each step
  const isStep2Complete = selectedCaseManager !== "";
  const isStep3Complete = skipInfoSession || 
    (infoSessionData.date !== "" && infoSessionData.time !== "" && infoSessionData.location !== "");

  // Filter candidates based on search
  const filteredYouth = EXISTING_CANDIDATES.filter((candidate) =>
    `${candidate.firstName} ${candidate.lastName}`
      .toLowerCase()
      .includes(youthSearchTerm.toLowerCase())
  );

  // Handle youth type toggle
  const handleYouthTypeChange = (type: 'present' | 'new') => {
    setYouthType(type);
    if (type === 'new') {
      // Clear the form when switching to "New Youth"
      setFormData({
        firstName: "",
        lastName: "",
        birthdate: "",
        sex: "",
        candidateType: "new",
        youthRoleStartDate: localTodayIso(),
        phone: "",
        phoneExtension: "",
        phoneType: "",
        email: "",
        emailType: "",
        street: "",
        street2: "",
        city: "",
        state: "",
        zipCode: "",
        zipPlus4: "",
        addressType: "",
      });
      setSelectedExistingCandidate("");
      setYouthSearchTerm("");
    } else if (type === 'present') {
      // Restore partial data when switching back to "Youth Present" - showing pending status
      setFormData({
        firstName: initialData?.firstName || "Marcus",
        lastName: initialData?.lastName || "Thompson",
        birthdate: initialData?.birthdate || "2008-03-12",
        sex: initialData?.sex || "Male",
        candidateType: "new",
        youthRoleStartDate: "", // Leave empty to show pending
        phone: initialData?.phone || "(312) 555-2001",
        phoneExtension: initialData?.phoneExtension || "",
        phoneType: initialData?.phoneType || "Mobile",
        email: initialData?.email || "marcus.thompson@example.com",
        emailType: initialData?.emailType || "Personal",
        street: initialData?.street || "2850 S Michigan Ave",
        street2: initialData?.street2 || "", // Leave empty
        city: initialData?.city || "Chicago",
        state: initialData?.state || "IL",
        zipCode: initialData?.zipCode || "60616",
        zipPlus4: initialData?.zipPlus4 || "", // Leave empty
        addressType: initialData?.addressType || "", // Leave empty
      });
    }
  };

  // Handle existing youth selection
  const handleYouthSelection = (candidateId: string) => {
    const candidate = EXISTING_CANDIDATES.find(c => c.id === candidateId);
    if (candidate) {
      setFormData({
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        birthdate: candidate.birthdate,
        sex: candidate.sex,
        candidateType: "new",
        youthRoleStartDate: localTodayIso(),
        phone: candidate.phone || "",
        phoneExtension: candidate.phoneExtension || "",
        phoneType: candidate.phoneType || "",
        email: candidate.email || "",
        emailType: candidate.emailType || "",
        street: candidate.street || "",
        street2: candidate.street2 || "",
        city: candidate.city || "",
        state: candidate.state || "",
        zipCode: candidate.zipCode || "",
        zipPlus4: candidate.zipPlus4 || "",
        addressType: candidate.addressType || "",
      });
      setSelectedExistingCandidate(candidateId);
      setYouthSearchTerm(`${candidate.firstName} ${candidate.lastName}`);
      setShowYouthDropdown(false);
    }
  };

  // Handle existing candidate selection
  const handleExistingCandidateChange = (candidateId: string) => {
    setSelectedExistingCandidate(candidateId);
    const candidate = EXISTING_CANDIDATES.find(c => c.id === candidateId);
    if (candidate) {
      setFormData(prev => ({
        ...prev,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        birthdate: candidate.birthdate,
        sex: candidate.sex,
        phone: candidate.phone || "",
        phoneExtension: candidate.phoneExtension || "",
        phoneType: candidate.phoneType || "",
        email: candidate.email || "",
        emailType: candidate.emailType || "",
        street: candidate.street || "",
        street2: candidate.street2 || "",
        city: candidate.city || "",
        state: candidate.state || "",
        zipCode: candidate.zipCode || "",
        zipPlus4: candidate.zipPlus4 || "",
        addressType: candidate.addressType || "",
      }));
    }
  };

  // Participant Management Handlers
  const handleOpenParticipantDialog = (participantId: number | null = null) => {
    if (participantId !== null) {
      // Edit mode
      const participant = participants.find(p => p.id === participantId);
      if (participant) {
        setParticipantFormData({
          type: participant.type,
          participant: participant.participant,
          role: participant.role,
          attended: participant.attended,
          reasonMissed: participant.reasonMissed
        });
        setEditingParticipantId(participantId);
      }
    } else {
      // Add mode
      setParticipantFormData({
        type: "",
        participant: "",
        role: "",
        attended: false,
        reasonMissed: ""
      });
      setEditingParticipantId(null);
    }
    setParticipantDialogOpen(true);
  };

  const handleSaveParticipant = () => {
    if (!participantFormData.type || !participantFormData.participant) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingParticipantId !== null) {
      // Update existing
      setParticipants(participants.map(p => 
        p.id === editingParticipantId 
          ? { ...p, ...participantFormData }
          : p
      ));
      toast.success("Participant updated successfully");
    } else {
      // Add new
      const newId = Math.max(...participants.map(p => p.id), 0) + 1;
      setParticipants([...participants, { id: newId, ...participantFormData }]);
      toast.success("Participant added successfully");
    }

    setParticipantDialogOpen(false);
    setEditingParticipantId(null);
    setParticipantFormData({
      type: "",
      participant: "",
      role: "",
      attended: false,
      reasonMissed: ""
    });
  };

  const handleDeleteParticipant = (id: number) => {
    setParticipants(participants.filter(p => p.id !== id));
    setSelectedParticipantIds(selectedParticipantIds.filter(sid => sid !== id));
    toast.success("Participant removed successfully");
  };

  const handleToggleParticipantSelection = (id: number) => {
    if (selectedParticipantIds.includes(id)) {
      setSelectedParticipantIds(selectedParticipantIds.filter(sid => sid !== id));
    } else {
      setSelectedParticipantIds([...selectedParticipantIds, id]);
    }
  };

  const handleToggleAllParticipants = () => {
    if (selectedParticipantIds.length === participants.length) {
      setSelectedParticipantIds([]);
    } else {
      setSelectedParticipantIds(participants.map(p => p.id));
    }
  };

  const handleBulkSetAttended = () => {
    if (selectedParticipantIds.length === 0) {
      toast.error("Please select at least one participant");
      return;
    }
    setParticipants(participants.map(p => 
      selectedParticipantIds.includes(p.id) ? { ...p, attended: true, reasonMissed: "" } : p
    ));
    toast.success(`${selectedParticipantIds.length} participant(s) marked as attended`);
    setSelectedParticipantIds([]);
  };

  const handleBulkSetNotAttended = () => {
    if (selectedParticipantIds.length === 0) {
      toast.error("Please select at least one participant");
      return;
    }
    setParticipants(participants.map(p => 
      selectedParticipantIds.includes(p.id) ? { ...p, attended: false } : p
    ));
    toast.success(`${selectedParticipantIds.length} participant(s) marked as not attended`);
    setSelectedParticipantIds([]);
  };

  const handleBulkSetUnknown = () => {
    if (selectedParticipantIds.length === 0) {
      toast.error("Please select at least one participant");
      return;
    }
    setParticipants(participants.map(p => 
      selectedParticipantIds.includes(p.id) ? { ...p, attended: null, reasonMissed: "" } : p
    ));
    toast.success(`${selectedParticipantIds.length} participant(s) marked as unknown`);
    setSelectedParticipantIds([]);
  };

  const handleBulkRemove = () => {
    if (selectedParticipantIds.length === 0) {
      toast.error("Please select at least one participant");
      return;
    }
    setParticipants(participants.filter(p => !selectedParticipantIds.includes(p.id)));
    toast.success(`${selectedParticipantIds.length} participant(s) removed`);
    setSelectedParticipantIds([]);
  };

  const handleFinalizeAdmissions = () => {
    // Final validation
    if (!formData.firstName || !formData.lastName) {
      alert("Please complete First Name and Last Name.");
      return;
    }

    if (!selectedCaseManager) {
      alert("Please assign a Case Manager.");
      return;
    }

    console.log({
      formData,
      selectedCaseManager,
      skipInfoSession,
      infoSessionData
    });

    const caseManager = CASE_MANAGERS.find(cm => cm.id === selectedCaseManager);

    // Prepare success message
    const successMsg = 
      `Youth: ${formData.firstName} ${formData.lastName}\n` +
      `Candidate Type: ${formData.candidateType === 'new' ? 'New Candidate' : 'Existing Candidate'}\n` +
      `Case Manager: ${caseManager?.name}, ${caseManager?.title}\n` +
      `${skipInfoSession ? 'Info Session: Skipped' : `Info Session: ${infoSessionData.date} at ${infoSessionData.time}`}\n\n` +
      `The admissions process is complete.`;

    setSuccessMessage(successMsg);
    setShowSuccessDialog(true);

    // Call onSubmit callback
    if (onSubmit) {
      onSubmit({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        candidateType: formData.candidateType,
        caseManager: selectedCaseManager,
      });
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    
    // Call onSuccess callback if provided (this will navigate to Admissions)
    if (onSuccess) {
      onSuccess();
    } else {
      // Fallback to onBack if onSuccess is not provided
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--slds-g-color-neutral-base-95)] overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-[var(--slds-g-color-border-base-1)] sticky top-0 z-20 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[20px] font-semibold text-gray-900">Promote to Admissions</h1>
              <p className="text-[13px] text-gray-600 mt-1">
                Complete the information below to promote this candidate to admissions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content - Two Step Process */}
      <div className="px-6 py-4 max-w-7xl mx-auto pb-20">
        <form onSubmit={(e) => { e.preventDefault(); handleFinalizeAdmissions(); }}>
          <div className="space-y-4">
          
          {/* STEP 1: Youth Information + Case Manager */}
          {currentStep === 1 && (
            <>
          {/* SECTION 1: Youth Information - Conditional Rendering */}
          <div className="bg-white rounded-lg shadow-sm">
            <div 
              className="px-6 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-semibold text-gray-900">Youth Information</h2>
                <Badge 
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ 
                    backgroundColor: '#FFF4E6', 
                    color: '#B54708',
                    border: '1px solid #FED7AA'
                  }}
                >
                  Pending
                </Badge>
              </div>
              {youthType === 'present' && isYouthInfoPrePopulated && (
                <Button
                  type="button"
                  size="sm"
                  onClick={onBack}
                  className="h-8 rounded-full text-white hover:opacity-90"
                  style={{ 
                    backgroundColor: '#145F33',
                    color: 'white'
                  }}
                >
                  <Pencil className="h-4 w-4 mr-1.5" />
                  Edit
                </Button>
              )}
            </div>
            
            {/* Youth Present - Read-Only View */}
            {youthType === 'present' && (
              <>
                <div className="px-6 py-3.5 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                  <div className="grid grid-cols-4 gap-5">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Name</p>
                      <p className="text-[14px] font-medium text-gray-900">{formData.firstName} {formData.lastName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Date of Birth</p>
                      <p className="text-[14px] font-medium text-gray-900">
                        {formData.birthdate ? formatMdy(new Date(formData.birthdate)) : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Gender</p>
                      <p className="text-[14px] font-medium text-gray-900">{formData.sex}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Youth Role Start Date</p>
                      <p className="text-[14px] font-medium text-gray-900">
                        {formData.youthRoleStartDate ? formatMdy(new Date(formData.youthRoleStartDate)) : '--'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-5 mt-4">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                      <p className="text-[14px] font-medium text-gray-900">{formData.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                      <p className="text-[14px] font-medium text-gray-900">{formData.email || 'Not provided'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</p>
                      <p className="text-[14px] font-medium text-gray-900">
                        {formData.street ? `${formData.street}${formData.street2 ? ', ' + formData.street2 : ''}, ${formData.city}, ${formData.state} ${formData.zipCode}` : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* New Youth - Editable Form */}
            {youthType === 'new' && (
              <div className="px-6 py-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                <div className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        First Name <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Enter first name"
                        className="h-9 text-sm"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Last Name <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Enter last name"
                        className="h-9 text-sm"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Date of Birth, Sex, Youth Role Start Date */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="birthdate" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Date of Birth <span className="text-red-600">*</span>
                      </Label>
                      <DateInput
                        id="birthdate"
className="h-9 text-sm"
                        value={isoToMdy(formData.birthdate)}
                        onChange={(v) => ((e) => setFormData(prev => ({ ...prev, birthdate: e.target.value })))({ target: { value: mdyToIso(v) } })}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sex" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Gender <span className="text-red-600">*</span>
                      </Label>
                      <Select
                        value={formData.sex}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, sex: value }))}
                      >
                        <SelectTrigger id="sex" className="h-9 text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Non-binary">Non-binary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="youthRoleStartDate" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Youth Role Start Date
                      </Label>
                      <DateInput
                        id="youthRoleStartDate"
className="h-9 text-sm"
                        value={isoToMdy(formData.youthRoleStartDate)}
                        onChange={(v) => ((e) => setFormData(prev => ({ ...prev, youthRoleStartDate: e.target.value })))({ target: { value: mdyToIso(v) } })}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 555-5555"
                        className="h-9 text-sm"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneExtension" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Extension
                      </Label>
                      <Input
                        id="phoneExtension"
                        type="text"
                        placeholder="Extension"
                        className="h-9 text-sm"
                        value={formData.phoneExtension}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneExtension: e.target.value }))}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneType" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Phone Type
                      </Label>
                      <Select
                        value={formData.phoneType}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, phoneType: value }))}
                      >
                        <SelectTrigger id="phoneType" className="h-9 text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mobile">Mobile</SelectItem>
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="Work">Work</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        className="h-9 text-sm"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailType" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Email Type
                      </Label>
                      <Select
                        value={formData.emailType}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, emailType: value }))}
                      >
                        <SelectTrigger id="emailType" className="h-9 text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Personal">Personal</SelectItem>
                          <SelectItem value="Work">Work</SelectItem>
                          <SelectItem value="School">School</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="street" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          Street Address
                        </Label>
                        <Input
                          id="street"
                          type="text"
                          placeholder="Street address"
                          className="h-9 text-sm"
                          value={formData.street}
                          onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                          style={{
                            border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                            borderRadius: 'var(--slds-c-input-radius-border)',
                            backgroundColor: 'var(--slds-g-color-background-base)'
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="street2" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          Address Line 2
                        </Label>
                        <Input
                          id="street2"
                          type="text"
                          placeholder="Apt, Suite, etc."
                          className="h-9 text-sm"
                          value={formData.street2}
                          onChange={(e) => setFormData(prev => ({ ...prev, street2: e.target.value }))}
                          style={{
                            border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                            borderRadius: 'var(--slds-c-input-radius-border)',
                            backgroundColor: 'var(--slds-g-color-background-base)'
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="city" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          City
                        </Label>
                        <Input
                          id="city"
                          type="text"
                          placeholder="City"
                          className="h-9 text-sm"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          style={{
                            border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                            borderRadius: 'var(--slds-c-input-radius-border)',
                            backgroundColor: 'var(--slds-g-color-background-base)'
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          State
                        </Label>
                        <Input
                          id="state"
                          type="text"
                          placeholder="IL"
                          className="h-9 text-sm"
                          value={formData.state}
                          onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                          style={{
                            border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                            borderRadius: 'var(--slds-c-input-radius-border)',
                            backgroundColor: 'var(--slds-g-color-background-base)'
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          Zip Code
                        </Label>
                        <Input
                          id="zipCode"
                          type="text"
                          placeholder="60607"
                          className="h-9 text-sm"
                          value={formData.zipCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                          style={{
                            border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                            borderRadius: 'var(--slds-c-input-radius-border)',
                            backgroundColor: 'var(--slds-g-color-background-base)'
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipPlus4" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          +4
                        </Label>
                        <Input
                          id="zipPlus4"
                          type="text"
                          placeholder="1234"
                          className="h-9 text-sm"
                          value={formData.zipPlus4}
                          onChange={(e) => setFormData(prev => ({ ...prev, zipPlus4: e.target.value }))}
                          style={{
                            border: '1px solid var(--slds-g-color-border-base-4, #c9c9c9)',
                            borderRadius: 'var(--slds-c-input-radius-border)',
                            backgroundColor: 'var(--slds-g-color-background-base)'
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="addressType" className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Address Type
                      </Label>
                      <Select
                        value={formData.addressType}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, addressType: value }))}
                      >
                        <SelectTrigger id="addressType" className="h-9 text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="Work">Work</SelectItem>
                          <SelectItem value="School">School</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
            
          {/* SECTION 2: Assign Case Manager (Required) */}
          <div className="bg-white rounded-lg border border-[var(--slds-g-color-border-base-1)] shadow-sm">
            <div className="px-6 py-3.5 border-b border-[var(--slds-g-color-border-base-1)] bg-gray-50">
              <div>
                <h2 className="text-[15px] font-semibold text-gray-900">Assign Case Manager <span className="text-red-600">*</span></h2>
                <p className="text-[12px] text-gray-600 mt-0.5">Required for promotion</p>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 gap-4 items-start">
                <div className="space-y-1.5">
                  <Label htmlFor="caseManager" className="text-[12px] font-medium text-gray-700">
                    Case Manager <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={selectedCaseManager}
                    onValueChange={setSelectedCaseManager}
                  >
                    <SelectTrigger className="h-[34px] text-[13px]">
                      <SelectValue placeholder="Select case manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {CASE_MANAGERS.map((manager) => {
                        const caseloadPercentage = (manager.caseload / manager.maxCaseload) * 100;
                        const isNearCapacity = caseloadPercentage >= 80;
                        return (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.name}, {manager.title} ({manager.caseload}/{manager.maxCaseload})
                            {isNearCapacity && " - Near Capacity"}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCaseManager && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[12px] font-semibold text-green-900">Assigned</h4>
                        <p className="text-[11px] text-green-700 mt-0.5">
                          {CASE_MANAGERS.find(cm => cm.id === selectedCaseManager)?.name} will be notified.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
            </>
          )}

          {/* STEP 2: Info Session (Optional) */}
          {currentStep === 2 && (
            <>
          {/* SECTION 3: Schedule Info Session (Optional) */}
          <div className="bg-white rounded-lg border border-[var(--slds-g-color-border-base-1)] shadow-sm">
            <div className="px-6 py-3.5 border-b border-[var(--slds-g-color-border-base-1)] bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold text-gray-900">Info Session <span className="text-gray-500">(Optional)</span></h2>
                  <p className="text-[12px] text-gray-600 mt-0.5">Schedule session and manage participants</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="skipInfoSession"
                    checked={skipInfoSession}
                    onChange={(e) => {
                      setSkipInfoSession(e.target.checked);
                      if (e.target.checked) {
                        setInfoSessionData({
                          date: "",
                          time: "",
                          location: "",
                          notes: "",
                          caller: "",
                          candidate: "",
                          phone: "",
                          language: "",
                          referralDate: "",
                          topic: "",
                          facilitator: "",
                          expectedAttendees: "",
                          capacity: "",
                          mostRecentHistory: "",
                          needsFollowUp: false,
                        });
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                  />
                  <Label htmlFor="skipInfoSession" className="text-[12px] font-medium text-gray-700 cursor-pointer">
                    Skip for now
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4">
              {!skipInfoSession ? (
                <div className="space-y-6">
                  {/* Type Field */}
                  <div className="grid grid-cols-1 gap-x-4 gap-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="sessionType" className="text-[12px] font-medium text-gray-700">
                        Type:
                      </Label>
                      <Select
                        value={infoSessionData.topic || ""}
                        onValueChange={(value) => setInfoSessionData(prev => ({ ...prev, topic: value }))}
                      >
                        <SelectTrigger id="sessionType" className="h-[32px] text-[13px]">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Individual Info Session">Individual Info Session</SelectItem>
                          <SelectItem value="Group Info Session">Group Info Session</SelectItem>
                          <SelectItem value="Virtual Info Session">Virtual Info Session</SelectItem>
                          <SelectItem value="On-site Tour">On-site Tour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Start Date and Time */}
                  <div className="grid grid-cols-4 gap-x-4 gap-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="startDate" className="text-[12px] font-medium text-gray-700">
                        Start Date:
                      </Label>
                      <DateInput
                        id="startDate"
value={isoToMdy(infoSessionData.date || "")}
                        onChange={(v) => ((e) => setInfoSessionData(prev => ({ ...prev, date: e.target.value })))({ target: { value: mdyToIso(v) } })}
                        className="h-[32px] text-[13px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="startTime" className="text-[12px] font-medium text-gray-700">
                        Time:
                      </Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={infoSessionData.time || ""}
                        onChange={(e) => setInfoSessionData(prev => ({ ...prev, time: e.target.value }))}
                        className="h-[32px] text-[13px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="endDate" className="text-[12px] font-medium text-gray-700">
                        End Date:
                      </Label>
                      <DateInput
                        id="endDate"
value={isoToMdy(infoSessionData.referralDate || "")}
                        onChange={(v) => ((e) => setInfoSessionData(prev => ({ ...prev, referralDate: e.target.value })))({ target: { value: mdyToIso(v) } })}
                        className="h-[32px] text-[13px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="endTime" className="text-[12px] font-medium text-gray-700">
                        Time:
                      </Label>
                      <Input
                        id="endTime"
                        type="time"
                        value=""
                        onChange={(e) => {}}
                        className="h-[32px] text-[13px]"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-1 gap-x-4 gap-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="location" className="text-[12px] font-medium text-gray-700">
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={infoSessionData.location || ""}
                        onChange={(e) => setInfoSessionData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Enter location"
                        className="h-[32px] text-[13px]"
                      />
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="homeVisit"
                        checked={false}
                        onChange={(e) => {}}
                        className="h-4 w-4 rounded border-gray-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                      />
                      <Label htmlFor="homeVisit" className="text-[12px] font-medium text-gray-700 cursor-pointer">
                        Home Visit:
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="serviceCoordination"
                        checked={false}
                        onChange={(e) => {}}
                        className="h-4 w-4 rounded border-gray-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                      />
                      <Label htmlFor="serviceCoordination" className="text-[12px] font-medium text-gray-700 cursor-pointer">
                        Service Coordination:
                      </Label>
                    </div>
                  </div>

                  {/* Manage Participants */}
                  <div className="pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Manage Participants
                        </h3>
                        <p className="text-[11px] text-gray-600 mt-0.5">Track who attended the information session</p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleOpenParticipantDialog(null)}
                        className="h-8 px-3 text-[12px] rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Add Participant
                      </Button>
                    </div>

                    {/* Bulk Actions */}
                    {selectedParticipantIds.length > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                        <p className="text-[13px] text-blue-900 font-medium">
                          {selectedParticipantIds.length} participant{selectedParticipantIds.length > 1 ? 's' : ''} selected
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            onClick={handleBulkSetAttended}
                            variant="outline"
                            className="h-7 px-3 text-[11px] rounded-full"
                          >
                            Mark Attended
                          </Button>
                          <Button
                            type="button"
                            onClick={handleBulkSetNotAttended}
                            variant="outline"
                            className="h-7 px-3 text-[11px] rounded-full"
                          >
                            Mark Not Attended
                          </Button>
                          <Button
                            type="button"
                            onClick={handleBulkSetUnknown}
                            variant="outline"
                            className="h-7 px-3 text-[11px] rounded-full"
                            style={{ color: "#92400e", borderColor: "#f59e0b", backgroundColor: "#fffbeb" }}
                          >
                            <HelpCircle className="h-3 w-3 mr-1" />
                            Mark Unknown
                          </Button>
                          <Button
                            type="button"
                            onClick={handleBulkRemove}
                            variant="outline"
                            className="h-7 px-3 text-[11px] rounded-full text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Participants Table */}
                    {participants.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="w-10 px-4 py-2.5 text-left">
                                <Checkbox
                                  checked={selectedParticipantIds.length === participants.length}
                                  onCheckedChange={handleToggleAllParticipants}
                                />
                              </th>
                              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                                Type
                              </th>
                              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                                Participant
                              </th>
                              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                                Role
                              </th>
                              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                                Attended
                              </th>
                              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                                Reason Missed
                              </th>
                              <th className="w-24 px-4 py-2.5 text-right text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                            {participants.map((participant) => (
                              <tr key={participant.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <Checkbox
                                    checked={selectedParticipantIds.includes(participant.id)}
                                    onCheckedChange={() => handleToggleParticipantSelection(participant.id)}
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-[13px] text-gray-900">{participant.type}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-[13px] font-medium text-gray-900">{participant.participant}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-[13px] text-gray-700">{participant.role || '—'}</span>
                                </td>
                                <td className="px-4 py-3">
                                  {participant.attended ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-800">
                                      <Check className="h-3 w-3 mr-1" />
                                      Yes
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-800">
                                      No
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-[13px] text-gray-700">{participant.reasonMissed || '—'}</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      onClick={() => handleOpenParticipantDialog(participant.id)}
                                      className="h-7 w-7 p-0 rounded-full"
                                    >
                                      <Pencil className="h-3.5 w-3.5 text-gray-600" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      onClick={() => handleDeleteParticipant(participant.id)}
                                      className="h-7 w-7 p-0 rounded-full text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-8 text-center border rounded-lg" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                        <Users className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-[13px] text-gray-600 mb-3">No participants added yet</p>
                        <Button
                          type="button"
                          onClick={() => handleOpenParticipantDialog(null)}
                          variant="outline"
                          className="h-8 px-4 text-[12px] rounded-full"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1.5" />
                          Add First Participant
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-[13px] text-gray-600">Information session will be scheduled later</p>
                </div>
              )}
            </div>
          </div>

          {/* Participant Dialog */}
          <Dialog open={participantDialogOpen} onOpenChange={setParticipantDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-[16px]">
                {editingParticipantId ? 'Edit Participant' : 'Add Participant'}
              </DialogTitle>
              <DialogDescription className="text-[13px]">
                {editingParticipantId ? 'Update participant information' : 'Add a new participant to the information session'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Participant Type */}
              <div>
                <Label 
                  htmlFor="participantType" 
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Type *
                </Label>
                <Select
                  value={participantFormData.type}
                  onValueChange={(value) => setParticipantFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger 
                    className="h-9 text-[13px] rounded"
                    style={{
                      backgroundColor: 'var(--slds-g-color-background-base)',
                      border: '1px solid var(--slds-g-color-border-base-1)',
                      color: 'var(--slds-g-color-text-default)'
                    }}
                  >
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Constituent">Constituent</SelectItem>
                    <SelectItem value="Non-Constituent">Non-Constituent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Participant Name */}
              <div>
                <Label 
                  htmlFor="participantName" 
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Participant *
                </Label>
                <Select
                  value={participantFormData.participant}
                  onValueChange={(value) => {
                    // Auto-populate role when participant is selected
                    const roles = participantFormData.type === 'Constituent' 
                      ? CONSTITUENT_ROLES[value] 
                      : NON_CONSTITUENT_ROLES[value];
                    
                    setParticipantFormData(prev => ({ 
                      ...prev, 
                      participant: value,
                      // Auto-select first role if available
                      role: roles && roles.length > 0 ? roles[0] : prev.role
                    }));
                  }}
                >
                  <SelectTrigger 
                    className="h-9 text-[13px] rounded"
                    style={{
                      backgroundColor: 'var(--slds-g-color-background-base)',
                      border: '1px solid var(--slds-g-color-border-base-1)',
                      color: 'var(--slds-g-color-text-default)'
                    }}
                  >
                    <SelectValue placeholder={
                      participantFormData.type === 'Constituent' 
                        ? "Select constituent..." 
                        : "Select participant..."
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {participantFormData.type === 'Constituent' ? (
                      // Get unique candidate names from CONTACT_LOGS
                      Array.from(new Set(CONTACT_LOGS.map(log => log.candidate))).map((candidate) => (
                        <SelectItem key={candidate} value={candidate}>
                          {candidate}
                        </SelectItem>
                      ))
                    ) : (
                      // Show non-constituent participants
                      NON_CONSTITUENT_PARTICIPANTS.map((participant) => (
                        <SelectItem key={participant} value={participant}>
                          {participant}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Role */}
              <div>
                <Label 
                  htmlFor="participantRole" 
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Role
                </Label>
                <Select
                  value={participantFormData.role}
                  onValueChange={(value) => setParticipantFormData(prev => ({ ...prev, role: value }))}
                  disabled={!participantFormData.participant}
                >
                  <SelectTrigger 
                    className="h-9 text-[13px] rounded"
                    style={{
                      backgroundColor: 'var(--slds-g-color-background-base)',
                      border: '1px solid var(--slds-g-color-border-base-1)',
                      color: 'var(--slds-g-color-text-default)'
                    }}
                  >
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {participantFormData.participant && (
                      participantFormData.type === 'Constituent' 
                        ? (CONSTITUENT_ROLES[participantFormData.participant] || []).map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))
                        : (NON_CONSTITUENT_ROLES[participantFormData.participant] || []).map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Attended */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="participantAttended"
                  checked={participantFormData.attended}
                  onCheckedChange={(checked) => setParticipantFormData(prev => ({ ...prev, attended: checked as boolean, reasonMissed: checked ? "" : prev.reasonMissed }))}
                />
                <Label htmlFor="participantAttended" className="text-[13px] font-medium text-gray-700 cursor-pointer">
                  Attended session
                </Label>
              </div>

              {/* Reason Missed (only if not attended) */}
              {!participantFormData.attended && (
                <div>
                  <Label 
                    htmlFor="reasonMissed" 
                    className="block text-[12px] font-semibold mb-1.5 uppercase"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                  >
                    Reason Missed
                  </Label>
                  <Select
                    value={(() => {
                      const predefinedOptions = [
                        "Youth Not Intended to Attend",
                        "Program Conflict - Excused",
                        "Sick - Excused",
                        "On Pass - Excused",
                        "Hospitalized - Excused",
                        "Youth Schedule Conflict - Excused",
                        "Suspended From Program - Excused",
                        "Youth Refusal - Unexcused",
                        "No Show - Unexcused",
                        "AWOL - Unexcused",
                        "Youth Asked To Leave - Unexcused",
                        "Family Event - Youth Don't Attend",
                        "Staff Not Available to Attend",
                        "Did not reply",
                        "Rescheduled",
                        "Supervisor reviewed note",
                        "Cancelled but not Rescheduled (Admissions)",
                        "Dropped Off/Lost/Final Class",
                        "Youth Needs to Complete Homework-Excused",
                        "Youth Not Home From School-Excused",
                        "Excused - In School",
                        "Excused - Work"
                      ];
                      return predefinedOptions.includes(participantFormData.reasonMissed) 
                        ? participantFormData.reasonMissed 
                        : participantFormData.reasonMissed ? "Other" : "";
                    })()}
                    onValueChange={(value) => {
                      if (value === "Other") {
                        setParticipantFormData(prev => ({ ...prev, reasonMissed: "Other" }));
                      } else {
                        setParticipantFormData(prev => ({ ...prev, reasonMissed: value }));
                      }
                    }}
                  >
                    <SelectTrigger id="reasonMissed" className="h-9 text-[13px]">
                      <SelectValue placeholder="Select reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Youth Not Intended to Attend">Youth Not Intended to Attend</SelectItem>
                      <SelectItem value="Program Conflict - Excused">Program Conflict - Excused</SelectItem>
                      <SelectItem value="Sick - Excused">Sick - Excused</SelectItem>
                      <SelectItem value="On Pass - Excused">On Pass - Excused</SelectItem>
                      <SelectItem value="Hospitalized - Excused">Hospitalized - Excused</SelectItem>
                      <SelectItem value="Youth Schedule Conflict - Excused">Youth Schedule Conflict - Excused</SelectItem>
                      <SelectItem value="Suspended From Program - Excused">Suspended From Program - Excused</SelectItem>
                      <SelectItem value="Youth Refusal - Unexcused">Youth Refusal - Unexcused</SelectItem>
                      <SelectItem value="No Show - Unexcused">No Show - Unexcused</SelectItem>
                      <SelectItem value="AWOL - Unexcused">AWOL - Unexcused</SelectItem>
                      <SelectItem value="Youth Asked To Leave - Unexcused">Youth Asked To Leave - Unexcused</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Family Event - Youth Don't Attend">Family Event - Youth Don't Attend</SelectItem>
                      <SelectItem value="Staff Not Available to Attend">Staff Not Available to Attend</SelectItem>
                      <SelectItem value="Did not reply">Did not reply</SelectItem>
                      <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                      <SelectItem value="Supervisor reviewed note">Supervisor reviewed note</SelectItem>
                      <SelectItem value="Cancelled but not Rescheduled (Admissions)">Cancelled but not Rescheduled (Admissions)</SelectItem>
                      <SelectItem value="Dropped Off/Lost/Final Class">Dropped Off/Lost/Final Class</SelectItem>
                      <SelectItem value="Youth Needs to Complete Homework-Excused">Youth Needs to Complete Homework-Excused</SelectItem>
                      <SelectItem value="Youth Not Home From School-Excused">Youth Not Home From School-Excused</SelectItem>
                      <SelectItem value="Excused - In School">Excused - In School</SelectItem>
                      <SelectItem value="Excused - Work">Excused - Work</SelectItem>
                    </SelectContent>
                  </Select>
                  {(() => {
                    const predefinedOptions = [
                      "Youth Not Intended to Attend",
                      "Program Conflict - Excused",
                      "Sick - Excused",
                      "On Pass - Excused",
                      "Hospitalized - Excused",
                      "Youth Schedule Conflict - Excused",
                      "Suspended From Program - Excused",
                      "Youth Refusal - Unexcused",
                      "No Show - Unexcused",
                      "AWOL - Unexcused",
                      "Youth Asked To Leave - Unexcused",
                      "Family Event - Youth Don't Attend",
                      "Staff Not Available to Attend",
                      "Did not reply",
                      "Rescheduled",
                      "Supervisor reviewed note",
                      "Cancelled but not Rescheduled (Admissions)",
                      "Dropped Off/Lost/Final Class",
                      "Youth Needs to Complete Homework-Excused",
                      "Youth Not Home From School-Excused",
                      "Excused - In School",
                      "Excused - Work"
                    ];
                    const isOtherSelected = participantFormData.reasonMissed === "Other" || 
                                           (!predefinedOptions.includes(participantFormData.reasonMissed) && participantFormData.reasonMissed !== "");
                    
                    return isOtherSelected ? (
                      <Input
                        value={participantFormData.reasonMissed === "Other" ? "" : participantFormData.reasonMissed}
                        onChange={(e) => setParticipantFormData(prev => ({ ...prev, reasonMissed: e.target.value }))}
                        placeholder="Enter other reason..."
                        className="h-9 text-[13px] rounded mt-2"
                        style={{
                          backgroundColor: 'var(--slds-g-color-background-base)',
                          border: '1px solid var(--slds-g-color-border-base-1)',
                          color: 'var(--slds-g-color-text-default)'
                        }}
                      />
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                onClick={() => setParticipantDialogOpen(false)}
                className="h-9 px-6 text-[13px] font-medium rounded-full"
                style={{
                  backgroundColor: 'var(--slds-g-color-neutral-95)',
                  color: 'var(--slds-g-color-text-default)',
                  border: '1px solid var(--slds-g-color-border-base-1)'
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveParticipant}
                className="h-9 px-6 text-[13px] font-medium rounded-full"
                style={{
                  backgroundColor: '#145F33',
                  color: 'white'
                }}
              >
                {editingParticipantId ? 'Update' : 'Add'} Participant
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
            </>
          )}

          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6">
          {currentStep === 1 ? (
            <>
              <Button
                variant="outline"
                onClick={onBack}
                className="h-9 px-5 text-[13px] rounded-full"
              >
                Cancel
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    // Validate Step 1 before proceeding
                    if (!formData.firstName || !formData.lastName) {
                      alert("Please complete First Name and Last Name.");
                      return;
                    }
                    if (!selectedCaseManager) {
                      alert("Please select a Case Manager.");
                      return;
                    }
                    // Skip Step 2 and submit directly
                    setSkipInfoSession(true);
                    handleFinalizeAdmissions();
                  }}
                  variant="outline"
                  className="h-9 px-5 text-[13px] rounded-full"
                >
                  Skip & Submit
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    // Validate Step 1 before moving to Step 2
                    if (!formData.firstName || !formData.lastName) {
                      alert("Please complete First Name and Last Name.");
                      return;
                    }
                    if (!selectedCaseManager) {
                      alert("Please select a Case Manager.");
                      return;
                    }
                    setCurrentStep(2);
                  }}
                  className="h-9 px-5 text-[13px] rounded-full text-white"
                  style={{ backgroundColor: '#145F33' }}
                >
                  Continue to Info Session
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="h-9 px-5 text-[13px] rounded-full"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setSkipInfoSession(false);
                  handleFinalizeAdmissions();
                }}
                className="h-9 px-5 text-[13px] rounded-full text-white"
                style={{ backgroundColor: '#145F33' }}
              >
                Submit
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Success Dialog */}
      <PromoteSuccessDialog
        isOpen={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        message={successMessage}
      />
    </div>
  );
}
