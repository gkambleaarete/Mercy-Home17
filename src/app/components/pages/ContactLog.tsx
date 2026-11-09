import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { MessageSquare, Search, Filter, Plus, MoreHorizontal, Calendar, Check, X as XIcon, Phone as PhoneIcon, X, Mail, User, Users, ArrowLeft, Pencil, Trash2, HelpCircle, Eye, AlertCircle, RefreshCw } from "@/app/lib/lucide-icons";
import { CONTACT_LOGS, ContactLog as ContactLogType, addContactLogFromDialog } from "../../data/mockContactLogs";
import { INFO_SESSIONS, InfoSession, Participant } from "../../data/mockInfoSessions";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { cn } from "../../lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "../ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { ContactLogDialogSLDS } from "../ContactLogDialogSLDS";
import { ActivityTimeline, TimelineActivity } from "../ActivityTimeline";
import { getTimelineForContactLog } from "../../data/mockTimelineData";
import { PromoteToAdmissionsPage } from "./PromoteToAdmissionsPage";
import { Checkbox } from "../ui/checkbox";
import { DateInput } from "../ui/date-input";
import { Popover, PopoverAnchor, PopoverContent } from "../ui/popover";
import { isoToMdy, mdyToIso, formatMdy, localTodayIso } from "../../lib/dateFormat";
import { getDemoUserName } from "../../lib/demoIdentity";

// Mock participant roles mapping for constituents
const PARTICIPANT_ROLES_MAP: Record<string, string[]> = {
  "Marcus Thompson": ["Constituent", "Self"],
  "Jessica Williams": ["Constituent", "Self"],
  "David Chen": ["Constituent", "Self"],
  "Sarah Johnson": ["Constituent", "Self"],
  "Michael Rodriguez": ["Constituent", "Self"],
  "Emily Davis": ["Constituent", "Self"],
  "Christopher Lee": ["Constituent", "Self"],
  "Amanda Martinez": ["Constituent", "Self"],
  "Joshua Brown": ["Constituent", "Self"],
  "Ashley Garcia": ["Constituent", "Self"]
};

// Generic role options for non-constituents
const GENERIC_ROLE_OPTIONS = [
  "Mother",
  "Father",
  "Guardian",
  "Grandmother",
  "Grandfather",
  "Aunt",
  "Uncle",
  "Sibling",
  "Foster Parent",
  "Caseworker",
  "Teacher",
  "Counselor",
  "Therapist",
  "Social Worker",
  "Legal Guardian",
  "Advocate",
  "Mentor",
  "Other Family Member",
  "Community Member",
  "Other"
];

// Reason missed options for Info Session participants
const REASON_MISSED_OPTIONS = [
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
  "Other",
  "Family Event - Youth Don't Attend",
  "Staff Not Intended to Attend",
  "Did not reply",
  "Rescheduled",
  "Supervisor reviewed note",
  "Cancelled but not Rescheduled (Admissions)",
  "Dropped Class/Final Class",
  "Youth Needs to Complete Homework - Excused",
];

// Mock existing candidates from Mercy Home database
const EXISTING_CANDIDATES = [
  { 
    id: "ec1", 
    firstName: "Marcus", 
    lastName: "Thompson", 
    birthdate: "2008-03-15", 
    sex: "Male", 
    phone: "(312) 555-0101",
    extension: "",
    email: "marcus.thompson@example.com",
    state: "IL",
    zip: "60616",
    zipPlus4: "3456",
    referralSource: "DCFS",
    communityOrg: "Chicago Department of Children and Family Services"
  },
  { 
    id: "ec2", 
    firstName: "Jessica", 
    lastName: "Rodriguez", 
    birthdate: "2009-07-22", 
    sex: "Female", 
    phone: "(312) 555-0102",
    extension: "123",
    email: "jessica.rodriguez@example.com",
    state: "IL",
    zip: "60607",
    zipPlus4: "2341",
    referralSource: "School",
    communityOrg: "Lincoln Park High School"
  },
  { 
    id: "ec3", 
    firstName: "Tyler", 
    lastName: "Washington", 
    birthdate: "2010-11-08", 
    sex: "Male", 
    phone: "(312) 555-0103",
    extension: "",
    email: "tyler.washington@example.com",
    state: "IL",
    zip: "60605",
    zipPlus4: "1234",
    referralSource: "Community Organization",
    communityOrg: "South Side Youth Services"
  },
  { 
    id: "ec4", 
    firstName: "Sophia", 
    lastName: "Martinez", 
    birthdate: "2009-05-14", 
    sex: "Female", 
    phone: "(312) 555-0104",
    extension: "456",
    email: "sophia.martinez@example.com",
    state: "IL",
    zip: "60614",
    zipPlus4: "5678",
    referralSource: "Family Member",
    communityOrg: ""
  },
  { 
    id: "ec5", 
    firstName: "Jordan", 
    lastName: "Chen", 
    birthdate: "2011-09-30", 
    sex: "Non-binary", 
    phone: "(312) 555-0105",
    extension: "",
    email: "jordan.chen@example.com",
    state: "IL",
    zip: "60611",
    zipPlus4: "9012",
    referralSource: "Healthcare Provider",
    communityOrg: "Northwestern Medicine"
  },
  { 
    id: "ec6", 
    firstName: "Emma", 
    lastName: "Johnson", 
    birthdate: "2008-12-05", 
    sex: "Female", 
    phone: "(312) 555-0106",
    extension: "",
    email: "emma.johnson@example.com",
    state: "IL",
    zip: "60610",
    zipPlus4: "3456",
    referralSource: "Self",
    communityOrg: ""
  },
  { 
    id: "ec7", 
    firstName: "Isaiah", 
    lastName: "Brown", 
    birthdate: "2012-02-18", 
    sex: "Male", 
    phone: "(312) 555-0107",
    extension: "789",
    email: "isaiah.brown@example.com",
    state: "IL",
    zip: "60612",
    zipPlus4: "7890",
    referralSource: "Court/Legal",
    communityOrg: "Cook County Juvenile Court"
  },
  { 
    id: "ec8", 
    firstName: "Alyssa", 
    lastName: "Davis", 
    birthdate: "2010-08-27", 
    sex: "Female", 
    phone: "(312) 555-0108",
    extension: "",
    email: "alyssa.davis@example.com",
    state: "IL",
    zip: "60615",
    zipPlus4: "2345",
    referralSource: "School",
    communityOrg: "Hyde Park Academy"
  },
];

export function ContactLog() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLanguage, setFilterLanguage] = useState<string>("all");
  const [filterFollowUp, setFilterFollowUp] = useState<string>("all");
  const [filterPromoted, setFilterPromoted] = useState<string>("all");
  const [filterGender, setFilterGender] = useState<string>("all");
  const [filterAge, setFilterAge] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // KPI filter state
  const [activeKpiFilter, setActiveKpiFilter] = useState<"total" | "thisWeek" | "followUp" | "promoted" | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInfoSessionDialogOpen, setIsInfoSessionDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ContactLogType | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [selectedInfoSession, setSelectedInfoSession] = useState<InfoSession | null>(null);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [statusValidationError, setStatusValidationError] = useState<string | null>(null);

  // Create New Info Session Dialog state
  const [isCreateSessionDialogOpen, setIsCreateSessionDialogOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [createSessionFormData, setCreateSessionFormData] = useState({
    date: "",
    time: "",
    topic: "",
    location: "",
    endDate: "",
    endTime: "",
    homeVisit: false,
    serviceCoordination: false,
    status: "" as "Scheduled" | "Completed" | "Cancelled" | "",
  });
  
  // Promote to Admissions Page state
  const [showPromotePage, setShowPromotePage] = useState(false);
  const [promoteInitialData, setPromoteInitialData] = useState<{
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
  }>({});

  // Add Caller modal state
  const [showAddCallerConfirm, setShowAddCallerConfirm] = useState(false);
  const [showConstituentForm, setShowConstituentForm] = useState(false);
  const [constituentFormData, setConstituentFormData] = useState(() => {
    const t = new Date();
    const todayStr = `${String(t.getMonth()+1).padStart(2,'0')}/${String(t.getDate()).padStart(2,'0')}/${t.getFullYear()}`;
    return {
      constituentType: 'Individual',
      firstName: '',
      lastName: '',
      relationshipType: '',
      relatedConstituent: '',
      legalGuardian: false,
      eligibleForPass: false,
      startDate: todayStr,
      endDate: '',
      isActive: 'Yes',
      role: '',
      roleStartDate: todayStr,
      showPhoneInfo: true,
      phone: '',
      extension: '',
      phoneType: '',
      showEmailInfo: true,
      email: '',
      emailType: '',
      showAddressInfo: true,
      streetAddress: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      zipPlus4: '',
      addressType: '',
    };
  });
  
  // Activity timeline state - stores activities for each contact log
  const [timelineActivities, setTimelineActivities] = useState<Record<string, TimelineActivity[]>>({});
  // Task Detail modal (for clicking task subjects in the timeline)
  const [selectedTimelineTask, setSelectedTimelineTask] = useState<TimelineActivity | null>(null);
  
  // Info Session filters
  const [infoSessionView, setInfoSessionView] = useState<"daily" | "weekly" | "monthly" | "yearly">("weekly");
  const [infoSessionStartDate, setInfoSessionStartDate] = useState("");
  const [infoSessionEndDate, setInfoSessionEndDate] = useState("");
  
  // Info sessions state - stores all sessions including newly created ones
  const [infoSessions, setInfoSessions] = useState<InfoSession[]>(INFO_SESSIONS);
  
  // Manage Participants state
  const [isManageParticipantsDialogOpen, setIsManageParticipantsDialogOpen] = useState(false);
  const [participants, setParticipants] = useState<Array<{
    id: number;
    type: string;
    participant: string;
    role: string;
    attended: boolean;
    reasonMissed: string;
    otherReasonDetails?: string;
  }>>([
    { id: 1, type: "Constituent", participant: "Aaron Ace", role: "Candidate", attended: true, reasonMissed: "", otherReasonDetails: "" },
    { id: 2, type: "Guardian/Family", participant: "Mary Ace", role: "Mother", attended: false, reasonMissed: "Work Conflict", otherReasonDetails: "" },
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
  const [inlineEditingId, setInlineEditingId] = useState<number | null>(null);
  const [inlineEditData, setInlineEditData] = useState<{
    type: string;
    participant: string;
    role: string;
    attended: boolean;
    reasonMissed: string;
    otherReasonDetails?: string;
  }>({ type: "", participant: "", role: "", attended: false, reasonMissed: "", otherReasonDetails: "" });
  const [isAddingInlineParticipant, setIsAddingInlineParticipant] = useState(false);
  const [inlineAddData, setInlineAddData] = useState<{
    type: string;
    participant: string;
    role: string;
    attended: boolean;
    reasonMissed: string;
    otherReasonDetails?: string;
  }>({ type: "", participant: "", role: "", attended: false, reasonMissed: "", otherReasonDetails: "" });
  
  // Other Reason Dialog state
  const [viewingOtherReason, setViewingOtherReason] = useState<string | null>(null);
  const [editingOtherReasonParticipantId, setEditingOtherReasonParticipantId] = useState<number | null>(null);
  const [editingOtherReasonContext, setEditingOtherReasonContext] = useState<"add" | "edit" | "participant" | null>(null);
  const [editedOtherReasonText, setEditedOtherReasonText] = useState("");
  const [isOtherReasonDialogOpen, setIsOtherReasonDialogOpen] = useState(false);
  const [otherReasonMode, setOtherReasonMode] = useState<"add" | "edit" | null>(null);
  const [tempOtherReason, setTempOtherReason] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({
    // Referral Information
    referralDate: localTodayIso(),
    
    // Caller Information
    callerType: 'new' as 'new' | 'existing',
    callerFirstName: '',
    callerLastName: '',
    language: 'English',
    phone: '',
    extension: '',
    email: '',
    state: '',
    zip: '',
    zipPlusFour: '',
    referralSource: '',
    communityReferralOrg: '',
    callerIsCandidate: false,
    
    // Candidate Information
    candidateType: 'new' as 'new' | 'existing',
    candidateReferralDate: localTodayIso(),
    candidateFirstName: '',
    candidateLastName: '',
    candidateBirthdate: '',
    candidateAge: '',
    candidateSex: '',
    candidatePhone: '',
    candidateExtension: '',
    candidateEmail: '',
    candidateState: '',
    candidateZip: '',
    candidateZipPlus4: '',
    candidateReferralSource: '',
    candidateCommunityOrg: '',
    relationshipToCandidate: '',
    
    // Contact Details
    contactDate: localTodayIso(),
    contactTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    contactType: '',
    contactResult: '',
    details: '',
    
    // Follow-up
    followUp: '',
    detailsHistory: '',
    
    // Legacy fields for compatibility
    caller: '',
    candidate: '',
    needsFollowUp: 'No' as 'Yes' | 'No',
  });

  // Selected existing candidate state
  const [selectedExistingCandidate, setSelectedExistingCandidate] = useState("");
  
  // Candidate search state
  const [candidateSearchTerm, setCandidateSearchTerm] = useState("");
  const [showCandidateDropdown, setShowCandidateDropdown] = useState(false);
  const candidateSearchRef = useRef<HTMLDivElement>(null);
  const candidateListRef = useRef<HTMLDivElement>(null);

  // New comprehensive form state
  const [newLogFormData, setNewLogFormData] = useState({
    // Caller Information
    callerType: "new" as "new" | "existing",
    callerName: "",
    callerEmail: "",
    callerMobile: "",
    callerHomePhone: "",
    callerWorkPhone: "",
    
    // Candidate Information  
    candidateType: "new" as "new" | "existing",
    candidateName: "",
    candidateDOB: "",
    candidateGender: "",
    candidateRace: "",
    candidatePrimaryLanguage: "English",
    
    // Contact Details
    contactDate: localTodayIso(),
    contactTime: new Date().toTimeString().slice(0, 5),
    contactType: "",
    contactResult: "",
    contactNotes: "",
  });

  // Get unique languages
  const languages = useMemo(() => {
    const unique = Array.from(new Set(CONTACT_LOGS.map(log => log.language))).sort();
    return unique;
  }, []);

  // Filter and search logic
  const filteredLogs = useMemo(() => {
    return CONTACT_LOGS.filter(log => {
      const matchesSearch = 
        log.caller.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.candidate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLanguage = filterLanguage === "all" || log.language === filterLanguage;
      const matchesFollowUp = filterFollowUp === "all" || log.needsFollowUp === filterFollowUp;
      const matchesPromoted = filterPromoted === "all" || 
        (filterPromoted === "yes" && log.promoted) ||
        (filterPromoted === "no" && !log.promoted);
      const matchesGender = filterGender === "all" || log.gender === filterGender;
      const matchesAge = filterAge === "all" || log.ageGroup === filterAge;

      // Date range filtering
      let matchesDateRange = true;
      if (startDate) {
        const logDate = new Date(log.referralDate);
        const filterStartDate = new Date(startDate);
        // Set to start of day for consistent comparison
        logDate.setHours(0, 0, 0, 0);
        filterStartDate.setHours(0, 0, 0, 0);
        matchesDateRange = matchesDateRange && logDate >= filterStartDate;
      }
      if (endDate) {
        const logDate = new Date(log.referralDate);
        const filterEndDate = new Date(endDate);
        // Set to end of day for consistent comparison
        logDate.setHours(0, 0, 0, 0);
        filterEndDate.setHours(23, 59, 59, 999);
        matchesDateRange = matchesDateRange && logDate <= filterEndDate;
      }

      // KPI filter based on referral date
      let matchesKpiFilter = true;
      if (activeKpiFilter === "thisWeek") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        const logDate = new Date(log.referralDate);
        logDate.setHours(0, 0, 0, 0);
        matchesKpiFilter = logDate >= weekAgo;
      } else if (activeKpiFilter === "followUp") {
        matchesKpiFilter = log.needsFollowUp === "Yes";
      } else if (activeKpiFilter === "promoted") {
        matchesKpiFilter = log.promoted === true;
      }
      // "total" or null shows all records

      return matchesSearch && matchesLanguage && matchesFollowUp && matchesPromoted && matchesGender && matchesAge && matchesDateRange && matchesKpiFilter;
    }).sort((a, b) => new Date(b.referralDate).getTime() - new Date(a.referralDate).getTime());
  }, [searchTerm, filterLanguage, filterFollowUp, filterPromoted, filterGender, filterAge, startDate, endDate, activeKpiFilter]);

  // Stats
  const stats = useMemo(() => {
    const needFollowUp = CONTACT_LOGS.filter(log => log.needsFollowUp === "Yes");
    const promoted = CONTACT_LOGS.filter(log => log.promoted);
    const thisWeek = CONTACT_LOGS.filter(log => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(log.referralDate) >= weekAgo;
    });

    return {
      total: CONTACT_LOGS.length,
      thisWeek: thisWeek.length,
      followUp: needFollowUp.length,
      promoted: promoted.length
    };
  }, []);

  const handleRefresh = () => {
    setSearchTerm("");
    setFilterLanguage("all");
    setFilterFollowUp("all");
    setFilterPromoted("all");
    setFilterGender("all");
    setFilterAge("all");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterLanguage("all");
    setFilterFollowUp("all");
    setFilterPromoted("all");
    setFilterGender("all");
    setFilterAge("all");
    setStartDate("");
    setEndDate("");
    setActiveKpiFilter(null);
    setCurrentPage(1);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle existing candidate selection
  const handleExistingCandidateChange = (candidateId: string) => {
    setSelectedExistingCandidate(candidateId);
    const candidate = EXISTING_CANDIDATES.find(c => c.id === candidateId);
    if (candidate) {
      // Calculate age from birthdate
      const birthDate = new Date(candidate.birthdate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      // Set search term to selected candidate's name
      setCandidateSearchTerm(`${candidate.firstName} ${candidate.lastName}`);
      setShowCandidateDropdown(false);

      // Populate all form fields with candidate information
      setFormData(prev => ({
        ...prev,
        candidateFirstName: candidate.firstName,
        candidateLastName: candidate.lastName,
        candidateBirthdate: candidate.birthdate,
        candidateSex: candidate.sex,
        candidateAge: age.toString(),
        candidatePhone: candidate.phone,
        candidateExtension: candidate.extension || '',
        candidateEmail: candidate.email || '',
        candidateState: candidate.state || '',
        candidateZip: candidate.zip || '',
        candidateZipPlus4: candidate.zipPlus4 || '',
        candidateReferralSource: candidate.referralSource || '',
        candidateCommunityOrg: candidate.communityOrg || '',
      }));
    }
  };

  // Filter candidates based on search term
  const filteredCandidates = useMemo(() => {
    if (!candidateSearchTerm.trim()) return EXISTING_CANDIDATES;
    
    const searchLower = candidateSearchTerm.toLowerCase();
    return EXISTING_CANDIDATES.filter(candidate => {
      const fullName = `${candidate.firstName} ${candidate.lastName}`.toLowerCase();
      const birthdate = formatMdy(new Date(candidate.birthdate));
      
      return fullName.includes(searchLower) || 
             candidate.firstName.toLowerCase().includes(searchLower) ||
             candidate.lastName.toLowerCase().includes(searchLower) ||
             birthdate.toLowerCase().includes(searchLower);
    });
  }, [candidateSearchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // The results list is portaled (PopoverContent), so it is outside
      // candidateSearchRef in the DOM -- treat clicks inside it as inside.
      const target = event.target as Node;
      if (
        candidateSearchRef.current &&
        !candidateSearchRef.current.contains(target) &&
        !candidateListRef.current?.contains(target)
      ) {
        setShowCandidateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (action: 'close' | 'new' | 'save' | 'promote') => {
    // Build caller and candidate full names
    const callerFullName = `${formData.callerFirstName} ${formData.callerLastName}`.trim();
    const candidateFullName = `${formData.candidateFirstName} ${formData.candidateLastName}`.trim();
    
    // Add the new contact log to the CONTACT_LOGS array
    const newLog: ContactLogType = {
      id: `CL-${String(CONTACT_LOGS.length + 1).padStart(3, '0')}`,
      referralDate: formData.referralDate,
      caller: callerFullName || 'N/A',
      candidate: candidateFullName || 'N/A',
      phone: formData.phone || 'N/A',
      language: formData.language,
      details: formData.details,
      needsFollowUp: formData.followUp ? 'Yes' : 'No',
      promoted: action === 'promote',
      mostRecentHistory: localTodayIso(),
    };
    CONTACT_LOGS.unshift(newLog);
    
    // Handle different actions
    if (action === 'close') {
      setIsDialogOpen(false);
      resetFormData();
    } else if (action === 'new') {
      resetFormData();
    } else if (action === 'save') {
      // Changes saved
    } else if (action === 'promote') {
      setIsDialogOpen(false);
      resetFormData();
    }
  };

  const resetFormData = () => {
    setFormData({
      referralDate: localTodayIso(),
      callerType: 'new',
      callerFirstName: '',
      callerLastName: '',
      language: 'English',
      phone: '',
      extension: '',
      email: '',
      state: '',
      zip: '',
      zipPlusFour: '',
      referralSource: '',
      communityReferralOrg: '',
      callerIsCandidate: false,
      candidateType: 'new',
      candidateFirstName: '',
      candidateLastName: '',
      candidateBirthdate: '',
      candidateAge: '',
      candidateSex: '',
      relationshipToCandidate: '',
      contactDate: localTodayIso(),
      contactTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      contactType: '',
      contactResult: '',
      details: '',
      followUp: '',
      detailsHistory: '',
      caller: '',
      candidate: '',
      needsFollowUp: 'No',
    });
  };

  const handleNewLogSubmit = (action: "close" | "new" | "save" | "promote") => {
    // Create the new contact log
    const newLog: ContactLogType = {
      id: `CL-${String(CONTACT_LOGS.length + 1).padStart(3, '0')}`,
      referralDate: newLogFormData.contactDate,
      caller: newLogFormData.callerName,
      candidate: newLogFormData.candidateName,
      phone: newLogFormData.callerMobile || newLogFormData.callerHomePhone || newLogFormData.callerWorkPhone,
      language: newLogFormData.candidatePrimaryLanguage,
      details: `${newLogFormData.contactDate} ${newLogFormData.contactTime} - ${newLogFormData.contactType} - ${newLogFormData.contactResult}\n${newLogFormData.contactNotes}`,
      needsFollowUp: "No",
      promoted: action === "promote",
      mostRecentHistory: localTodayIso(),
    };
    
    CONTACT_LOGS.unshift(newLog);
    
    // Handle different actions
    if (action === "close") {
      setIsDialogOpen(false);
      resetNewLogForm();
    } else if (action === "new") {
      resetNewLogForm();
    } else if (action === "save") {
      // Changes saved
    } else if (action === "promote") {
      setIsDialogOpen(false);
      resetNewLogForm();
    }
  };

  const resetNewLogForm = () => {
    setNewLogFormData({
      callerType: "new",
      callerName: "",
      callerEmail: "",
      callerMobile: "",
      callerHomePhone: "",
      callerWorkPhone: "",
      candidateType: "new",
      candidateName: "",
      candidateDOB: "",
      candidateGender: "",
      candidateRace: "",
      candidatePrimaryLanguage: "English",
      contactDate: localTodayIso(),
      contactTime: new Date().toTimeString().slice(0, 5),
      contactType: "",
      contactResult: "",
      contactNotes: "",
    });
  };

  // Handle SLDS dialog submission
  const handleSLDSDialogSubmit = (data: any) => {
    // Create the new contact log
    const callerFullName = `${data.callerFirstName} ${data.callerLastName}`.trim();
    const candidateFullName = data.candidateFirstName && data.candidateLastName 
      ? `${data.candidateFirstName} ${data.candidateLastName}`.trim() 
      : 'N/A';
    
    // Shared record-building path (also used by Global Actions, 20004).
    const newLogId = addContactLogFromDialog(data).id;
    
    // If follow-up is needed, automatically create a Task in the contact log's timeline
    if (data.needsFollowUp && data.followUpDueDate) {
      const taskDescription = `Follow-up from Contact Log (${data.category || 'General'})

Original Contact Details:
${data.notes || 'No details provided'}

${data.followUpNotes ? `Follow-up Notes:\n${data.followUpNotes}` : ''}

Contact Information:
- Date: ${formatMdy(new Date(data.contactDate))}
- Type: ${data.contactType || 'N/A'}
- Result: ${data.contactResult || 'N/A'}
- Caller: ${callerFullName}
- Candidate: ${candidateFullName}`;

      const newTask: TimelineActivity = {
        id: `task-${Date.now()}`,
        type: "task",
        title: `Follow-up: ${data.category || 'Contact Log'} - ${candidateFullName}`,
        description: taskDescription,
        user: getDemoUserName(),
        timestamp: `${data.followUpDueDate}T09:00:00.000Z`,
        status: "pending",
        category: data.category?.toLowerCase().replace(/\s+/g, '_'),
      };

      // Add task to the timeline for this contact log
      setTimelineActivities(prev => ({
        ...prev,
        [newLogId]: [newTask, ...(prev[newLogId] || [])]
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
      return;
    }

    if (editingParticipantId !== null) {
      // Update existing
      setParticipants(participants.map(p => 
        p.id === editingParticipantId 
          ? { ...p, ...participantFormData }
          : p
      ));
    } else {
      // Add new
      const newId = Math.max(...participants.map(p => p.id), 0) + 1;
      setParticipants([...participants, { id: newId, ...participantFormData }]);
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
  };

  const handleSaveOtherReason = () => {
    if (editingOtherReasonContext === "add") {
      // Update inline add data
      setInlineAddData({ ...inlineAddData, otherReasonDetails: editedOtherReasonText });
    } else if (editingOtherReasonContext === "edit" && editingOtherReasonParticipantId !== null) {
      // Update inline edit data
      setInlineEditData({ ...inlineEditData, otherReasonDetails: editedOtherReasonText });
    } else if (editingOtherReasonContext === "participant" && editingOtherReasonParticipantId !== null) {
      // Update participant in the array
      setParticipants(participants.map(p => 
        p.id === editingOtherReasonParticipantId 
          ? { ...p, otherReasonDetails: editedOtherReasonText }
          : p
      ));
    }
    
    // Close the dialog and reset state
    setViewingOtherReason(null);
    setEditingOtherReasonParticipantId(null);
    setEditingOtherReasonContext(null);
    setEditedOtherReasonText("");
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
      return;
    }
    setParticipants(participants.map(p => 
      selectedParticipantIds.includes(p.id) ? { ...p, attended: true, reasonMissed: "" } : p
    ));
    setSelectedParticipantIds([]);
  };

  const handleBulkSetNotAttended = () => {
    if (selectedParticipantIds.length === 0) {
      return;
    }
    setParticipants(participants.map(p => 
      selectedParticipantIds.includes(p.id) ? { ...p, attended: false } : p
    ));
    setSelectedParticipantIds([]);
  };

  const handleBulkSetUnknown = () => {
    if (selectedParticipantIds.length === 0) {
      return;
    }
    setParticipants(participants.map(p => 
      selectedParticipantIds.includes(p.id) ? { ...p, attended: null, reasonMissed: "" } : p
    ));
    setSelectedParticipantIds([]);
  };

  const handleBulkRemove = () => {
    if (selectedParticipantIds.length === 0) {
      return;
    }
    setParticipants(participants.filter(p => !selectedParticipantIds.includes(p.id)));
    setSelectedParticipantIds([]);
  };

  const handleStartInlineEdit = (id: number) => {
    const participant = participants.find(p => p.id === id);
    if (participant) {
      setInlineEditData({
        type: participant.type,
        participant: participant.participant,
        role: participant.role,
        attended: participant.attended,
        reasonMissed: participant.reasonMissed,
        otherReasonDetails: participant.otherReasonDetails || "",
      });
      setInlineEditingId(id);
    }
  };

  const handleSaveInlineEdit = () => {
    if (inlineEditingId === null) return;
    if (!inlineEditData.type || !inlineEditData.participant) {
      return;
    }
    setParticipants(participants.map(p =>
      p.id === inlineEditingId ? { ...p, ...inlineEditData } : p
    ));
    setInlineEditingId(null);
  };

  const handleCancelInlineEdit = () => {
    setInlineEditingId(null);
  };

  const handleStartInlineAdd = () => {
    setInlineAddData({ type: "", participant: "", role: "", attended: false, reasonMissed: "", otherReasonDetails: "" });
    setIsAddingInlineParticipant(true);
    setInlineEditingId(null); // cancel any active row edit
  };

  const handleSaveInlineAdd = () => {
    if (!inlineAddData.type || !inlineAddData.participant) {
      return;
    }
    const newId = Math.max(...participants.map(p => p.id), 0) + 1;
    setParticipants([{ id: newId, ...inlineAddData }, ...participants]);
    setInlineAddData({ type: "", participant: "", role: "", attended: false, reasonMissed: "" });
    setIsAddingInlineParticipant(false);
  };

  const handleCancelInlineAdd = () => {
    setIsAddingInlineParticipant(false);
    setInlineAddData({ type: "", participant: "", role: "", attended: false, reasonMissed: "", otherReasonDetails: "" });
  };

  // Info Session Status Change Handler with Validation
  const handleStatusChange = (newStatus: "Scheduled" | "Completed" | "Cancelled" | "") => {
    if (!selectedInfoSession) return;

    // Clear any existing validation errors
    setStatusValidationError(null);

    // Only validate when changing to "Completed"
    if (newStatus === "Completed") {
      const participants = selectedInfoSession.participants || [];

      // Check if there are any participants
      if (participants.length > 0) {
        // Check if any participant has null attendance
        const hasUnmarkedAttendance = participants.some(p => p.attendance === null);

        if (hasUnmarkedAttendance) {
          // Prevent save and show error
          setStatusValidationError("Attendance information must be updated for all participants before the status can be updated to 'Completed'.");
          return;
        }
      }
    }

    // If validation passes or status is not "Completed", update the status
    const updatedSession = { ...selectedInfoSession, status: newStatus };

    // Update in the sessions array
    setInfoSessions(prev => prev.map(session =>
      session.id === selectedInfoSession.id ? updatedSession : session
    ));

    // Update the selected session
    setSelectedInfoSession(updatedSession);

    // Exit edit mode
    setIsEditingStatus(false);
  };

  // Participant Attendance Update Handler
  const handleParticipantAttendanceChange = (participantId: number, attendance: "Present" | "Absent" | null) => {
    if (!selectedInfoSession) return;

    // Clear any validation errors when attendance is updated
    setStatusValidationError(null);

    const updatedParticipants = selectedInfoSession.participants?.map(p =>
      p.id === participantId ? { ...p, attendance } : p
    );

    const updatedSession = { ...selectedInfoSession, participants: updatedParticipants };

    // Update in the sessions array
    setInfoSessions(prev => prev.map(session =>
      session.id === selectedInfoSession.id ? updatedSession : session
    ));

    // Update the selected session
    setSelectedInfoSession(updatedSession);
  };

  // Other Reason Dialog Handlers
  const handleOpenOtherReasonDialog = (mode: "add" | "edit") => {
    setOtherReasonMode(mode);
    if (mode === "add") {
      setTempOtherReason(inlineAddData.otherReasonDetails || "");
    } else {
      setTempOtherReason(inlineEditData.otherReasonDetails || "");
    }
    setIsOtherReasonDialogOpen(true);
  };

  const handleSubmitOtherReason = () => {
    if (otherReasonMode === "add") {
      setInlineAddData({ ...inlineAddData, reasonMissed: "Other", otherReasonDetails: tempOtherReason });
    } else if (otherReasonMode === "edit") {
      setInlineEditData({ ...inlineEditData, reasonMissed: "Other", otherReasonDetails: tempOtherReason });
    }
    setIsOtherReasonDialogOpen(false);
    setTempOtherReason("");
    setOtherReasonMode(null);
  };

  const handleCancelOtherReason = () => {
    setIsOtherReasonDialogOpen(false);
    setTempOtherReason("");
    setOtherReasonMode(null);
  };

  // Helper function to remove timestamps and dates from details text
  const stripTimestamps = (text: string): string => {
    return text
      // Remove ISO dates (YYYY-MM-DD)
      .replace(/\d{4}-\d{2}-\d{2}/g, '')
      // Remove dates (MM/DD/YYYY or M/D/YYYY)
      .replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, '')
      // Remove time (HH:MM:SS AM/PM or HH:MM AM/PM)
      .replace(/\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM|am|pm)?/g, '')
      // Remove standalone AM/PM
      .replace(/\s+(AM|PM|am|pm)\b/g, '')
      // Remove extra whitespace and dashes left behind
      .replace(/\s*-\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Filter info sessions based on date range
  const filteredInfoSessions = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return infoSessions.filter(session => {
      const sessionDate = new Date(session.date);
      let matchesView = true;
      
      // Apply View filter (Daily/Weekly/Monthly)
      if (infoSessionView === "daily") {
        // Show only sessions for today
        const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
        matchesView = sessionDay.getTime() === today.getTime();
      } else if (infoSessionView === "weekly") {
        // Show sessions for current week (Sunday to Saturday)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        matchesView = sessionDate >= startOfWeek && sessionDate <= endOfWeek;
      } else if (infoSessionView === "monthly") {
        // Show sessions for current month
        matchesView = sessionDate.getMonth() === now.getMonth() && 
                     sessionDate.getFullYear() === now.getFullYear();
      } else if (infoSessionView === "yearly") {
        // Show sessions for current year
        matchesView = sessionDate.getFullYear() === now.getFullYear();
      }
      
      // Apply date range filters (these override the view filter if set)
      let matchesDateRange = true;
      if (infoSessionStartDate) {
        matchesDateRange = matchesDateRange && new Date(session.date) >= new Date(infoSessionStartDate);
      }
      if (infoSessionEndDate) {
        matchesDateRange = matchesDateRange && new Date(session.date) <= new Date(infoSessionEndDate);
      }
      
      // If custom date filters are set, use those; otherwise use view filter
      const hasCustomDateFilter = infoSessionStartDate || infoSessionEndDate;
      return hasCustomDateFilter ? matchesDateRange : (matchesView && matchesDateRange);
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [infoSessions, infoSessionView, infoSessionStartDate, infoSessionEndDate]);

  // Show promote page if active
  if (showPromotePage) {
    return (
      <PromoteToAdmissionsPage
        onBack={() => setShowPromotePage(false)}
        initialData={promoteInitialData}
        onSubmit={() => {
          // Mark the contact log as promoted
          if (selectedLog) {
            console.log(`Marking contact log ${selectedLog.id} as promoted`);
          }
        }}
        onSuccess={() => {
          // Navigate to Admissions Landing page after successful submission
          navigate("/");
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f3f4f6]">
      {/* Header */}
      <div
        className="app-page-x py-4"
        style={{
          backgroundColor: 'var(--slds-g-color-background-alt-2)',
          borderBottom: '1px solid var(--slds-g-color-border-base-1)',
          boxShadow: 'var(--slds-g-shadow-1)'
        }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="h-10 w-10 flex items-center justify-center text-white"
                style={{
                  borderRadius: 'var(--slds-c-card-radius-border)',
                  backgroundColor: 'var(--color-brand-primary)',
                  boxShadow: 'var(--slds-g-shadow-1)'
                }}
              >
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <div 
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Communication Tracking
                </div>
                <h1 
                  className="text-2xl font-medium tracking-tight"
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                >
                  Contact Log
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Refresh"
                onClick={handleRefresh}
                style={{
                  backgroundColor: "white",
                  borderRadius: "50%",
                }}
              >
                <RefreshCw
                  className="h-4 w-4"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
              </Button>

              {/* Divider */}
              <div
                className="h-6 w-px mx-1"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-border-base-1)",
                }}
              />
              <Button 
                className="h-9 rounded-full text-[13px] shadow-none"
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
                onClick={() => setIsInfoSessionDialogOpen(true)}
              >Info Sessions<Calendar className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-default)' }} /></Button>

              <Button 
                className="h-9 rounded-full text-[13px] text-white shadow-none"
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
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                New
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Summary */}
      <div 
        className="px-6 pt-6 pb-4"
        style={{ backgroundColor: 'var(--slds-g-color-background-alt-2)' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card 
            className="shadow-sm cursor-pointer transition-all"
            style={{
              border: activeKpiFilter === "total" ? '2px solid #145F33' : '1px solid var(--slds-g-color-border-base-1)',
              borderRadius: 'var(--slds-c-card-radius-border)',
              backgroundColor: activeKpiFilter === "total" ? '#f0f7f3' : 'var(--slds-g-color-background-base)'
            }}
            onClick={() => setActiveKpiFilter(activeKpiFilter === "total" ? null : "total")}
            onMouseEnter={(e) => {
              if (activeKpiFilter !== "total") {
                e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-alt)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeKpiFilter !== "total") {
                e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-base)';
              }
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p 
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                  >
                    Total Contacts
                  </p>
                  <p 
                    className="text-2xl font-bold mt-1"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    {stats.total}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="shadow-sm cursor-pointer transition-all"
            style={{
              border: activeKpiFilter === "thisWeek" ? '2px solid #145F33' : '1px solid var(--slds-g-color-border-base-1)',
              borderRadius: 'var(--slds-c-card-radius-border)',
              backgroundColor: activeKpiFilter === "thisWeek" ? '#f0f7f3' : 'var(--slds-g-color-background-base)'
            }}
            onClick={() => setActiveKpiFilter(activeKpiFilter === "thisWeek" ? null : "thisWeek")}
            onMouseEnter={(e) => {
              if (activeKpiFilter !== "thisWeek") {
                e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-alt)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeKpiFilter !== "thisWeek") {
                e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-base)';
              }
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p 
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                  >
                    This Week
                  </p>
                  <p 
                    className="text-2xl font-bold mt-1"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    {stats.thisWeek}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="shadow-sm cursor-pointer transition-all"
            style={{
              border: activeKpiFilter === "followUp" ? '2px solid #145F33' : '1px solid var(--slds-g-color-border-base-1)',
              borderRadius: 'var(--slds-c-card-radius-border)',
              backgroundColor: activeKpiFilter === "followUp" ? '#f0f7f3' : 'var(--slds-g-color-background-base)'
            }}
            onClick={() => setActiveKpiFilter(activeKpiFilter === "followUp" ? null : "followUp")}
            onMouseEnter={(e) => {
              if (activeKpiFilter !== "followUp") {
                e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-alt)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeKpiFilter !== "followUp") {
                e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-base)';
              }
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p 
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                  >
                    Need Follow-up
                  </p>
                  <p 
                    className="text-2xl font-bold mt-1"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    {stats.followUp}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <PhoneIcon className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="shadow-sm cursor-pointer transition-all"
            style={{
              border: activeKpiFilter === "promoted" ? '2px solid #145F33' : '1px solid var(--slds-g-color-border-base-1)',
              borderRadius: 'var(--slds-c-card-radius-border)',
              backgroundColor: activeKpiFilter === "promoted" ? '#f0f7f3' : 'var(--slds-g-color-background-base)'
            }}
            onClick={() => setActiveKpiFilter(activeKpiFilter === "promoted" ? null : "promoted")}
            onMouseEnter={(e) => {
              if (activeKpiFilter !== "promoted") {
                e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-alt)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeKpiFilter !== "promoted") {
                e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-base)';
              }
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p 
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                  >
                    Promoted
                  </p>
                  <p 
                    className="text-2xl font-bold mt-1"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    {stats.promoted}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Check className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Logs Table */}
      <div className="flex-1 min-h-0 overflow-auto app-page-x pb-16">
        <div
          className="rounded-lg border shadow-sm overflow-hidden flex flex-col"
          style={{
            borderColor: 'var(--slds-g-color-border-base-1)',
            backgroundColor: 'var(--slds-g-color-background-base)'
          }}
        >
          {/* Filters Section - Integrated into Table View */}
          <div
            className="min-h-[50px] px-6 py-2 flex items-center gap-2 flex-wrap flex-shrink-0"
            style={{
              backgroundColor: 'var(--slds-g-color-background-base)',
              borderBottom: '1px solid var(--slds-g-color-border-base-1)'
            }}
          >
            <div className="flex items-center gap-2">
              <label
                className="text-[13px] font-medium whitespace-nowrap"
                style={{ color: 'var(--slds-g-color-text-default)' }}
              >
                Start:
              </label>
              <DateInput
                className="h-9 w-[140px] text-[13px]"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  borderRadius:
                        "var(--slds-c-input-radius-border)",
                }}
                value={isoToMdy(startDate)}
                onChange={(v) => { setStartDate(mdyToIso(v)); setCurrentPage(1); }}
              />
            </div>

            <div className="flex items-center gap-2">
              <label
                className="text-[13px] font-medium whitespace-nowrap"
                style={{ color: 'var(--slds-g-color-text-default)' }}
              >
                End:
              </label>
              <DateInput
                className="h-9 w-[140px] text-[13px] rounded-full"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
                value={isoToMdy(endDate)}
                onChange={(v) => { setEndDate(mdyToIso(v)); setCurrentPage(1); }}
              />
            </div>

            <Select value={filterFollowUp} onValueChange={(v) => { setFilterFollowUp(v); setCurrentPage(1); }}>
              <SelectTrigger
                className="h-9 w-[150px] text-[13px]"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  borderRadius:
                        "var(--slds-c-input-radius-border)",
                }}
              >
                <SelectValue placeholder="Follow-ups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Follow-ups</SelectItem>
                <SelectItem value="Yes">Needs Follow-up</SelectItem>
                <SelectItem value="No">No Follow-up</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPromoted} onValueChange={(v) => { setFilterPromoted(v); setCurrentPage(1); }}>
              <SelectTrigger
                className="h-9 w-[130px] text-[13px]"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  borderRadius:
                        "var(--slds-c-input-radius-border)",
                }}
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="yes">Promoted</SelectItem>
                <SelectItem value="no">Not Promoted</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterGender} onValueChange={(v) => { setFilterGender(v); setCurrentPage(1); }}>
              <SelectTrigger
                className="h-9 w-[120px] text-[13px]"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  borderRadius:
                        "var(--slds-c-input-radius-border)",
                }}
              >
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gender</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterAge} onValueChange={(v) => { setFilterAge(v); setCurrentPage(1); }}>
              <SelectTrigger
                className="h-9 w-[150px] text-[13px]"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  borderRadius:
                        "var(--slds-c-input-radius-border)",
                }}
              >
                <SelectValue placeholder="Age Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                <SelectItem value="Middle School">Middle School</SelectItem>
                <SelectItem value="High School">High School</SelectItem>
                <SelectItem value="Young Adult">Young Adult</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1" />

            <div className="relative w-[280px]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 z-10"
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              />
              <Input
                placeholder="Search..."
                className="pl-9 pr-9 h-9 text-[13px]"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  borderRadius:
                        "var(--slds-c-input-radius-border)",
                }}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full flex items-center justify-center z-10 transition-colors"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--slds-g-color-neutral-base-90)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                </button>
              )}
            </div>

            <Button
              className="h-9 px-4 text-[13px] rounded-full"
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
              onClick={clearFilters}
            >
              Clear
            </Button>
          </div>

          {/* Scrollable Table Body */}
          <div style={{ overflowX: 'auto', overflowY: 'visible' }}>
            {filteredLogs.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block" style={{ minWidth: '1850px' }}>
                  <Table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
                    <colgroup>
                      <col style={{ width: '130px', minWidth: '130px', maxWidth: '130px' }} />
                      <col style={{ width: '160px', minWidth: '160px', maxWidth: '160px' }} />
                      <col style={{ width: '160px', minWidth: '160px', maxWidth: '160px' }} />
                      <col style={{ width: '100px', minWidth: '100px', maxWidth: '100px' }} />
                      <col style={{ width: '100px', minWidth: '100px', maxWidth: '100px' }} />
                      <col style={{ width: '145px', minWidth: '145px', maxWidth: '145px' }} />
                      <col style={{ width: '115px', minWidth: '115px', maxWidth: '115px' }} />
                      <col style={{ width: '155px', minWidth: '155px', maxWidth: '155px' }} />
                      <col style={{ width: '480px', minWidth: '480px', maxWidth: '480px' }} />
                      <col style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }} />
                      <col style={{ width: '105px', minWidth: '105px', maxWidth: '105px' }} />
                    </colgroup>
                    <TableHeader
                      style={{ backgroundColor: 'var(--slds-g-color-background-alt)', position: 'sticky', top: 0, zIndex: 2 }}
                    >
                      <TableRow
                        className="hover:bg-transparent"
                        style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                      >
                        <TableHead
                          className="font-semibold px-3 py-3"
                          style={{
                            color: 'var(--slds-g-color-text-weak)',
                            fontSize: 12,
                            fontWeight: 500,
                            letterSpacing: "0.04em",
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            backgroundColor: 'var(--slds-g-color-background-alt)'
                          }}
                        >
                          REFERRAL DATE
                        </TableHead>
                        <TableHead
                          className="font-semibold px-3 py-3"
                          style={{
                            color: 'var(--slds-g-color-text-weak)',
                            fontSize: 12,
                            fontWeight: 500,
                            letterSpacing: "0.04em",
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            backgroundColor: 'var(--slds-g-color-background-alt)'
                          }}
                        >
                          CANDIDATE
                        </TableHead>
                        <TableHead
                          className="font-semibold px-3 py-3"
                          style={{
                            color: 'var(--slds-g-color-text-weak)',
                            fontSize: 12,
                            fontWeight: 500,
                            letterSpacing: "0.04em",
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            backgroundColor: 'var(--slds-g-color-background-alt)'
                          }}
                        >
                          CALLER
                        </TableHead>
                        <TableHead
                          className="font-semibold px-3 py-3"
                          style={{
                            color: 'var(--slds-g-color-text-weak)',
                            fontSize: 12,
                            fontWeight: 500,
                            letterSpacing: "0.04em",
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            backgroundColor: 'var(--slds-g-color-background-alt)'
                          }}
                        >
                          GENDER
                        </TableHead>
                        <TableHead
                          className="font-semibold px-3 py-3"
                          style={{
                            color: 'var(--slds-g-color-text-weak)',
                            fontSize: 12,
                            fontWeight: 500,
                            letterSpacing: "0.04em",
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            backgroundColor: 'var(--slds-g-color-background-alt)'
                          }}
                        >
                          AGE
                        </TableHead>
                        <TableHead
                          className="font-semibold px-3 py-3"
                          style={{
                            color: 'var(--slds-g-color-text-weak)',
                            fontSize: 12,
                            fontWeight: 500,
                            letterSpacing: "0.04em",
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            backgroundColor: 'var(--slds-g-color-background-alt)'
                          }}
                        >
                          PHONE
                        </TableHead>
                        <TableHead
                          className="font-semibold px-3 py-3"
                          style={{
                            color: 'var(--slds-g-color-text-weak)',
                            fontSize: 12,
                            fontWeight: 500,
                            letterSpacing: "0.04em",
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            backgroundColor: 'var(--slds-g-color-background-alt)'
                          }}
                        >
                          LANGUAGE
                        </TableHead>
                        <TableHead
                          className="font-semibold px-3 py-3"
                          style={{
                            color: 'var(--slds-g-color-text-weak)',
                            fontSize: 12,
                            fontWeight: 500,
                            letterSpacing: "0.04em",
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            backgroundColor: 'var(--slds-g-color-background-alt)'
                          }}
                        >
                          MOST RECENT HISTORY
                        </TableHead>
                        <TableHead
                          className="font-semibold px-3 py-3"
                          style={{
                            color: 'var(--slds-g-color-text-weak)',
                            fontSize: 12,
                            fontWeight: 500,
                            letterSpacing: "0.04em",
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            backgroundColor: 'var(--slds-g-color-background-alt)'
                          }}
                        >
                          DETAILS
                        </TableHead>
                        <TableHead
                          className="font-semibold text-center px-3 py-3"
                          style={{
                            color: 'var(--slds-g-color-text-default)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            backgroundColor: 'var(--slds-g-color-background-alt)'
                          }}
                        >
                          NEEDS FOLLOW-UP
                        </TableHead>
                        <TableHead
                          className="font-semibold text-center px-3 py-3"
                          style={{
                            color: 'var(--slds-g-color-text-weak)',
                            fontSize: 12,
                            fontWeight: 500,
                            letterSpacing: "0.04em",
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            backgroundColor: 'var(--slds-g-color-background-alt)'
                          }}
                        >
                          PROMOTED
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((log) => (
                        <TableRow
                          key={log.id}
                          style={{
                            borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            if (!log.promoted) {
                              e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-row-hover)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!log.promoted) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <TableCell
                            className="px-3 py-3"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                              fontSize: 13,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {formatMdy(new Date(log.referralDate))}
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => {
                                setSelectedLog(log);
                                setIsDetailViewOpen(true);
                              }}
                              className="text-left font-medium hover:underline focus:outline-none focus:underline"
                              style={{
                                color: "var(--color-link-blue)",
                                background: "none",
                                border: "none",
                                padding: 0,
                                cursor: "pointer",
                                fontSize: "inherit",
                              }}
                            >
                              {log.caller}
                            </button>
                          </TableCell>
                          <TableCell
                            className="px-3 py-3"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                              fontSize: 13,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            title={log.candidate}
                          >
                            {log.candidate}
                          </TableCell>
                          <TableCell
                            className="px-3 py-3"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                              fontSize: 13,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {log.gender || '—'}
                          </TableCell>
                          <TableCell
                            className="px-3 py-3"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                              fontSize: 13,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {log.ageGroup || '—'}
                          </TableCell>
                          <TableCell
                            className="px-3 py-3"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                              fontSize: 13,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {log.phone}
                          </TableCell>
                          <TableCell
                            className="px-3 py-3"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                              fontSize: 13,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {log.language}
                          </TableCell>
                          <TableCell
                            className="px-3 py-3"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                              fontSize: 13,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {formatMdy(new Date(log.mostRecentHistory))}
                          </TableCell>
                          <TableCell
                            className="px-3 py-3"
                            style={{
                              maxWidth: '480px',
                              overflow: 'hidden'
                            }}
                          >
                            <div
                              className="text-sm"
                              style={{
                                color: "var(--slds-g-color-text-weak)",
                                fontSize: 13,
                                lineHeight: '1.5',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical'
                              }}
                              title={stripTimestamps(log.details)}
                            >
                              {(() => {
                                const cleanedDetails = stripTimestamps(log.details);
                                return cleanedDetails.length > 100
                                  ? `${cleanedDetails.substring(0, 100)}...`
                                  : cleanedDetails;
                              })()}
                            </div>
                          </TableCell>
                          <TableCell
                            className="text-center px-3 py-3"
                            style={{ overflow: 'hidden' }}
                          >
                            <div className="flex items-center justify-center">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "rounded-sm text-xs",
                                  log.needsFollowUp === "Yes"
                                    ? "bg-orange-50 text-orange-700 border-orange-200"
                                    : "bg-gray-50 text-gray-700 border-gray-200"
                                )}
                                style={{ whiteSpace: 'nowrap' }}
                              >
                                {log.needsFollowUp}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell
                            className="text-center px-3 py-3"
                            style={{ overflow: 'hidden' }}
                          >
                            {log.promoted ? (
                              <div className="flex items-center justify-center">
                                <div
                                  className="h-5 w-5 rounded-sm flex items-center justify-center"
                                  style={{
                                    backgroundColor: 'var(--color-brand-primary)',
                                    color: 'white'
                                  }}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--slds-g-color-text-weak)' }}>—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden">
                  {filteredLogs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((log) => (
                    <div
                      key={log.id}
                      className="cursor-pointer"
                      style={{
                        borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                        backgroundColor: 'transparent'
                      }}
                      onClick={() => {
                        setSelectedLog(log);
                        setIsDetailViewOpen(true);
                      }}
                    >
                      <div className="p-4 space-y-3">
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="text-xs font-medium uppercase tracking-wide"
                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                              >
                                Candidate
                              </span>
                            </div>
                            <div
                              className="font-semibold truncate"
                              style={{ color: 'var(--slds-g-color-text-default)' }}
                              title={log.candidate}
                            >
                              {log.candidate}
                            </div>
                          </div>
                          {log.promoted && (
                            <div
                              className="h-6 w-6 rounded-sm flex items-center justify-center flex-shrink-0"
                              style={{
                                backgroundColor: 'var(--color-brand-primary)',
                                color: 'white'
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="min-w-0">
                            <div
                              className="text-xs font-medium uppercase tracking-wide mb-1"
                              style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                              Caller
                            </div>
                            <div
                              className="text-sm truncate"
                              style={{ color: 'var(--slds-g-color-text-default)' }}
                              title={log.caller}
                            >
                              {log.caller}
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div
                              className="text-xs font-medium uppercase tracking-wide mb-1"
                              style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                              Phone
                            </div>
                            <div
                              className="text-sm truncate"
                              style={{ color: 'var(--slds-g-color-text-default)' }}
                            >
                              {log.phone}
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div
                              className="text-xs font-medium uppercase tracking-wide mb-1"
                              style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                              Gender
                            </div>
                            <div
                              className="text-sm truncate"
                              style={{ color: 'var(--slds-g-color-text-default)' }}
                            >
                              {log.gender || '—'}
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div
                              className="text-xs font-medium uppercase tracking-wide mb-1"
                              style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                              Age
                            </div>
                            <div
                              className="text-sm truncate"
                              style={{ color: 'var(--slds-g-color-text-default)' }}
                            >
                              {log.ageGroup || '—'}
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div
                              className="text-xs font-medium uppercase tracking-wide mb-1"
                              style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                              Referral Date
                            </div>
                            <div
                              className="text-sm"
                              style={{ color: 'var(--slds-g-color-text-default)' }}
                            >
                              {formatMdy(new Date(log.referralDate))}
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div
                              className="text-xs font-medium uppercase tracking-wide mb-1"
                              style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                              Language
                            </div>
                            <div
                              className="text-sm truncate"
                              style={{ color: 'var(--slds-g-color-text-default)' }}
                            >
                              {log.language}
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div
                              className="text-xs font-medium uppercase tracking-wide mb-1"
                              style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                              Most Recent
                            </div>
                            <div
                              className="text-sm"
                              style={{ color: 'var(--slds-g-color-text-default)' }}
                            >
                              {formatMdy(new Date(log.mostRecentHistory))}
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div
                              className="text-xs font-medium uppercase tracking-wide mb-1"
                              style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                              Follow-up
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "rounded-sm text-xs",
                                log.needsFollowUp === "Yes"
                                  ? "bg-orange-50 text-orange-700 border-orange-200"
                                  : "bg-gray-50 text-gray-700 border-gray-200"
                              )}
                            >
                              {log.needsFollowUp}
                            </Badge>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="min-w-0">
                          <div
                            className="text-xs font-medium uppercase tracking-wide mb-1"
                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                          >
                            Details
                          </div>
                          <div
                            className="text-sm leading-relaxed"
                            style={{
                              color: 'var(--slds-g-color-text-default)',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word'
                            }}
                          >
                            {(() => {
                              const cleanedDetails = stripTimestamps(log.details);
                              return cleanedDetails.length > 100
                                ? `${cleanedDetails.substring(0, 100)}...`
                                : cleanedDetails;
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div
                className="text-center py-12"
                style={{
                  color: 'var(--slds-g-color-text-weak)',
                  fontSize: 'var(--slds-g-font-size-5)'
                }}
              >
                No contact logs found matching your filters.
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {filteredLogs.length > 0 && (
            <div
              className="flex-shrink-0 flex items-center justify-between px-4 py-3 gap-4"
              style={{
                borderTop: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-alt)'
              }}
            >
              {/* Showing X–Y of Z records */}
              <p className="text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                {'Showing '}
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, filteredLogs.length)}
                </span>
                {' of '}
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  {filteredLogs.length}
                </span>
                {' records'}
              </p>

              {/* Prev icon — Page X of Y — Next icon */}
              <div className="flex items-center gap-[12px]">
                {/* Previous chevron */}
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                  className="flex items-center justify-center rounded-full size-[28px] transition-colors"
                  style={{
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    backgroundColor: 'transparent',
                    opacity: currentPage === 1 ? 0.4 : 1,
                    cursor: currentPage === 1 ? 'default' : 'pointer'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M8.75 10.5L5.25 7L8.75 3.5" stroke="var(--slds-g-color-text-weak)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                  </svg>
                </button>

                {/* Page X of Y */}
                <p className="text-[12px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  {'Page '}
                  <span className="font-semibold">{currentPage}</span>
                  {' of '}
                  <span className="font-semibold">{Math.ceil(filteredLogs.length / rowsPerPage)}</span>
                </p>

                {/* Next chevron */}
                <button
                  disabled={currentPage >= Math.ceil(filteredLogs.length / rowsPerPage)}
                  onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredLogs.length / rowsPerPage), p + 1))}
                  aria-label="Next page"
                  className="flex items-center justify-center rounded-full size-[28px] transition-colors"
                  style={{
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    backgroundColor: 'transparent',
                    opacity: currentPage >= Math.ceil(filteredLogs.length / rowsPerPage) ? 0.4 : 1,
                    cursor: currentPage >= Math.ceil(filteredLogs.length / rowsPerPage) ? 'default' : 'pointer'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5.25 10.5L8.75 7L5.25 3.5" stroke="var(--slds-g-color-text-weak)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog for creating a new contact log */}
      <ContactLogDialogSLDS
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSLDSDialogSubmit}
      />

      {/* Contact Log Detail View Dialog (VALID) */}
      {selectedLog && (
        <Dialog open={isDetailViewOpen} onOpenChange={setIsDetailViewOpen}>
          <DialogPortal>
            <DialogOverlay className="bg-black/10" />
            <DialogPrimitive.Content
              aria-describedby={undefined}
              className="max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-4rem)] w-full lg:max-w-[1400px] h-[90vh] max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                borderRadius: 'var(--slds-c-card-radius-border)',
                boxShadow: 'var(--slds-g-shadow-4)'
              }}
            >
              {/* Close button */}
              <DialogPrimitive.Close 
                className="absolute top-4 right-4 z-50 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none"
                style={{
                  color: 'var(--slds-g-color-text-weak)'
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>

              {/* Accessible Title and Description */}
              <DialogPrimitive.Title className="sr-only">
                Contact Log Details for {selectedLog.candidate}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="sr-only">
                View and edit contact log information including caller details, candidate information, and contact history.
              </DialogPrimitive.Description>

              {/* Header with Action Buttons */}
              <div 
                className="px-4 sm:px-6 py-4 border-b flex-shrink-0"
                style={{
                  borderColor: 'var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-alt)'
                }}
              >
                <div className="flex items-center justify-between mb-3 pr-8">
                  <div className="flex items-center gap-3">
                    <h2 
                      className="text-xl font-semibold"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                      aria-hidden="true"
                    >
                      Contact Log
                    </h2>
                    {selectedLog.promoted && (
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        Promoted to Admissions
                      </Badge>
                    )}
                  </div>
                  
                  {/* Promote to Admissions Button - Top Right */}
                  {!selectedLog.promoted && (
                    <Button
                      className="h-9 text-[13px] rounded-full gap-1.5 px-4 flex-shrink-0"
                      variant="outline"
                      style={{
                        border: '1px solid var(--color-brand-primary)',
                        backgroundColor: 'white',
                        color: 'var(--color-brand-primary)'
                      }}
                      onClick={() => {
                        const candidateNameParts = selectedLog.candidate.split(' ');
                        const firstName = candidateNameParts[0] || '';
                        const lastName = candidateNameParts.slice(1).join(' ') || '';

                        setPromoteInitialData({
                          firstName: firstName,
                          lastName: lastName,
                          phone: selectedLog.phone,
                          emergencyContactName: selectedLog.caller,
                          emergencyContactPhone: selectedLog.phone,
                          emergencyContactRelation: "",
                        });

                        const callerParts = selectedLog.caller.split(' ');
                        const t2 = new Date();
                        const todayStr2 = `${String(t2.getMonth()+1).padStart(2,'0')}/${String(t2.getDate()).padStart(2,'0')}/${t2.getFullYear()}`;
                        setConstituentFormData({
                          constituentType: 'Individual',
                          firstName: callerParts[0] || '',
                          lastName: callerParts.slice(1).join(' ') || '',
                          relationshipType: '',
                          relatedConstituent: selectedLog.candidate || '',
                          legalGuardian: false,
                          eligibleForPass: false,
                          startDate: todayStr2,
                          endDate: '',
                          isActive: 'Yes',
                          role: '',
                          roleStartDate: todayStr2,
                          showPhoneInfo: true,
                          phone: selectedLog.phone || '',
                          extension: '',
                          phoneType: '',
                          showEmailInfo: true,
                          email: '',
                          emailType: '',
                          showAddressInfo: true,
                          streetAddress: '',
                          addressLine2: '',
                          city: '',
                          state: '',
                          zipCode: '',
                          zipPlus4: '',
                          addressType: '',
                        });

                        setShowAddCallerConfirm(true);
                      }}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Promote to Admissions
                    </Button>
                  )}
                </div>

                {/* Action Buttons - Removed from header, moved to bottom of form */}
              </div>

              {/* ── Add Caller Confirmation Modal ── */}
              <Dialog
                open={showAddCallerConfirm}
                onOpenChange={open => { if (!open) setShowAddCallerConfirm(false); }}
              >
                <DialogContent
                  className="p-0 overflow-hidden"
                  style={{
                    maxWidth: '440px',
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    borderRadius: '8px',
                  }}
                >
                  {/* Header */}
                  <DialogHeader
                    className="flex-row items-center gap-2.5 px-5 py-3.5 border-b"
                    style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                  >
                    <div
                      className="h-7 w-7 rounded flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#e6f2eb' }}
                    >
                      <User className="h-4 w-4" style={{ color: '#145F33' }} />
                    </div>
                    <DialogTitle
                      className="slds-text-6 font-semibold flex-1 leading-none"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      Add Caller
                    </DialogTitle>
                  </DialogHeader>

                  {/* Body */}
                  <DialogDescription asChild>
                    <div className="px-6 py-8 flex items-center justify-center" style={{ minHeight: '100px' }}>
                      <p
                        className="slds-text-4 text-center"
                        style={{ color: 'var(--slds-g-color-text-default)', lineHeight: 1.6 }}
                      >
                        Would you like to add{' '}
                        <span className="font-semibold">{selectedLog?.caller}</span>{' '}
                        as a constituent?
                      </p>
                    </div>
                  </DialogDescription>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-end gap-3 px-5 py-3.5 border-t"
                    style={{
                      borderColor: 'var(--slds-g-color-border-base-1)',
                      backgroundColor: 'var(--slds-g-color-background-alt)',
                    }}
                  >
                    <Button
                      variant="outline"
                      className="h-9 px-5 rounded-full slds-text-4 font-medium"
                      style={{
                        borderColor: 'var(--slds-g-color-border-base-1)',
                        color: 'var(--slds-g-color-text-default)',
                        backgroundColor: 'var(--slds-g-color-background-base)',
                      }}
                      onClick={() => {
                        setShowAddCallerConfirm(false);
                        setShowPromotePage(true);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="h-9 px-5 rounded-full slds-text-4 font-medium text-white"
                      style={{ backgroundColor: '#145F33' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0e4524')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#145F33')}
                      onClick={() => {
                        setShowAddCallerConfirm(false);
                        setShowConstituentForm(true);
                      }}
                    >
                      Add Caller
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* ── Constituent Creation Form Modal ── */}
              <Dialog
                open={showConstituentForm}
                onOpenChange={open => {
                  if (!open) {
                    setShowConstituentForm(false);
                    setShowPromotePage(true);
                  }
                }}
              >
                <DialogContent
                  className="p-0 flex flex-col gap-0"
                  style={{
                    maxWidth: '660px',
                    maxHeight: '90vh',
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  }}
                >
                  {/* ── Header ── */}
                  <div className="px-6 pt-6 pb-5 flex-shrink-0 border-b" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                    <DialogTitle
                      className="font-bold leading-tight mb-1"
                      style={{ color: 'var(--slds-g-color-text-default)', fontSize: '20px' }}
                    >
                      Add Caller
                    </DialogTitle>
                    <DialogDescription className="slds-text-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                      Create a new constituent record from the caller information below.
                    </DialogDescription>
                  </div>

                  {/* ── Scrollable form body ── */}
                  <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6 space-y-6">

                    {/* Constituent Type */}
                    <div className="space-y-1.5">
                      <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        CONSTITUENT TYPE <span className="text-red-600">*</span>
                      </label>
                      <Select
                        value={constituentFormData.constituentType}
                        onValueChange={val => setConstituentFormData(d => ({ ...d, constituentType: val }))}
                      >
                        <SelectTrigger className="h-10 w-full slds-text-4" style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: '6px' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Individual">Individual</SelectItem>
                          <SelectItem value="Organization">Organization</SelectItem>
                          <SelectItem value="Family">Family</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* First / Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                          FIRST NAME <span className="text-red-600">*</span>
                        </label>
                        <Input
                          value={constituentFormData.firstName}
                          onChange={e => setConstituentFormData(d => ({ ...d, firstName: e.target.value }))}
                          className="h-10 slds-text-4"
                          style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: '6px' }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                          LAST NAME <span className="text-red-600">*</span>
                        </label>
                        <Input
                          value={constituentFormData.lastName}
                          onChange={e => setConstituentFormData(d => ({ ...d, lastName: e.target.value }))}
                          className="h-10 slds-text-4"
                          style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: '6px' }}
                        />
                      </div>
                    </div>

                    {/* Relationship — inline sentence */}
                    <div className="space-y-1.5">
                      <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>RELATIONSHIP TYPE</label>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="slds-text-4 font-medium whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          {[constituentFormData.firstName, constituentFormData.lastName].filter(Boolean).join(' ') || 'Caller'} is the
                        </span>
                        <Select
                          value={constituentFormData.relationshipType}
                          onValueChange={val => setConstituentFormData(d => ({ ...d, relationshipType: val }))}
                        >
                          <SelectTrigger className="h-10 slds-text-4" style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: '6px', width: '160px' }}>
                            <SelectValue placeholder="Select…" />
                          </SelectTrigger>
                          <SelectContent>
                            {['Advisor of','Parent of','Guardian of','Sibling of','Grandparent of','Aunt/Uncle of','Foster Parent of','Caseworker of','Other'].map(r => (
                              <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="slds-text-4 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>of</span>
                        <Input
                          value={constituentFormData.relatedConstituent}
                          onChange={e => setConstituentFormData(d => ({ ...d, relatedConstituent: e.target.value }))}
                          className="h-10 slds-text-4 flex-1"
                          style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: '6px', minWidth: '140px' }}
                          placeholder="Related constituent name"
                        />
                      </div>
                    </div>

                    {/* Legal Guardian / Eligible for Pass */}
                    <div className="flex items-center gap-8">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={constituentFormData.legalGuardian}
                          onChange={e => setConstituentFormData(d => ({ ...d, legalGuardian: e.target.checked }))}
                          style={{ accentColor: '#145F33', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>Legal Guardian</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={constituentFormData.eligibleForPass}
                          onChange={e => setConstituentFormData(d => ({ ...d, eligibleForPass: e.target.checked }))}
                          style={{ accentColor: '#145F33', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>Eligible for Pass</span>
                      </label>
                    </div>

                    {/* Start / End Date */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                          START DATE <span className="text-red-600">*</span>
                        </label>
                        <Input
                          value={constituentFormData.startDate}
                          onChange={e => setConstituentFormData(d => ({ ...d, startDate: e.target.value }))}
                          placeholder="MM/DD/YYYY"
                          maxLength={10}
                          className="h-10 slds-text-4"
                          style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: '6px' }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>END DATE</label>
                        <Input
                          value={constituentFormData.endDate}
                          onChange={e => setConstituentFormData(d => ({ ...d, endDate: e.target.value }))}
                          placeholder="MM/DD/YYYY"
                          maxLength={10}
                          className="h-10 slds-text-4"
                          style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: '6px' }}
                        />
                      </div>
                    </div>

                    {/* Active constituent? */}
                    <div className="space-y-1.5">
                      <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        IS THIS AN ACTIVE CONSTITUENT? <span className="text-red-600">*</span>
                      </label>
                      <Select
                        value={constituentFormData.isActive}
                        onValueChange={val => setConstituentFormData(d => ({ ...d, isActive: val }))}
                      >
                        <SelectTrigger className="h-10 slds-text-4" style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: '6px', maxWidth: '220px' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Role / Role Start Date */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>ROLE</label>
                        <Select
                          value={constituentFormData.role}
                          onValueChange={val => setConstituentFormData(d => ({ ...d, role: val }))}
                        >
                          <SelectTrigger className="h-10 slds-text-4" style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: '6px' }}>
                            <SelectValue placeholder="Please Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {GENERIC_ROLE_OPTIONS.map(r => (
                              <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>ROLE START DATE</label>
                        <Input
                          value={constituentFormData.roleStartDate}
                          onChange={e => setConstituentFormData(d => ({ ...d, roleStartDate: e.target.value }))}
                          placeholder="MM/DD/YYYY"
                          maxLength={10}
                          className="h-10 slds-text-4"
                          style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: '6px' }}
                        />
                      </div>
                    </div>

                    {/* ── Phone Information section ── */}
                    <div>
                      <button
                        type="button"
                        className="w-full flex items-center gap-3 py-2 mb-4"
                        style={{ borderBottom: '2px solid var(--slds-g-color-border-base-1)', background: 'none', cursor: 'pointer' }}
                        onClick={() => setConstituentFormData(d => ({ ...d, showPhoneInfo: !d.showPhoneInfo }))}
                      >
                        <input
                          type="checkbox"
                          checked={constituentFormData.showPhoneInfo}
                          readOnly
                          onClick={e => e.stopPropagation()}
                          onChange={e => setConstituentFormData(d => ({ ...d, showPhoneInfo: e.target.checked }))}
                          style={{ accentColor: '#145F33', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                        />
                        <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Phone Information</span>
                      </button>
                      {constituentFormData.showPhoneInfo && (
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                              PHONE <span className="text-red-600">*</span>
                            </label>
                            <Input
                              value={constituentFormData.phone}
                              onChange={e => setConstituentFormData(d => ({ ...d, phone: e.target.value }))}
                              placeholder="(xxx)xxx-xxxx"
                              className="h-10 slds-text-4"
                              style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: '6px' }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>EXTENSION</label>
                            <Input
                              value={constituentFormData.extension}
                              onChange={e => setConstituentFormData(d => ({ ...d, extension: e.target.value }))}
                              className="h-10 slds-text-4"
                              style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: '6px' }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>PHONE TYPE</label>
                            <Select
                              value={constituentFormData.phoneType}
                              onValueChange={val => setConstituentFormData(d => ({ ...d, phoneType: val }))}
                            >
                              <SelectTrigger className="h-10 slds-text-4" style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: '6px' }}>
                                <SelectValue placeholder="Please Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {['Home','Cell','Work','Other'].map(t => (
                                  <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── Email Information section ── */}
                    <div>
                      <button
                        type="button"
                        className="w-full flex items-center gap-3 py-2 mb-4"
                        style={{ borderBottom: '2px solid var(--slds-g-color-border-base-1)', background: 'none', cursor: 'pointer' }}
                        onClick={() => setConstituentFormData(d => ({ ...d, showEmailInfo: !d.showEmailInfo }))}
                      >
                        <input
                          type="checkbox"
                          checked={constituentFormData.showEmailInfo}
                          readOnly
                          onClick={e => e.stopPropagation()}
                          onChange={e => setConstituentFormData(d => ({ ...d, showEmailInfo: e.target.checked }))}
                          style={{ accentColor: '#145F33', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                        />
                        <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Email Information</span>
                      </button>
                      {constituentFormData.showEmailInfo && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                              EMAIL ADDRESS <span className="text-red-600">*</span>
                            </label>
                            <Input
                              type="email"
                              value={constituentFormData.email}
                              onChange={e => setConstituentFormData(d => ({ ...d, email: e.target.value }))}
                              placeholder="email@example.com"
                              className="h-10 slds-text-4"
                              style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: '6px' }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>EMAIL TYPE</label>
                            <Select
                              value={constituentFormData.emailType}
                              onValueChange={val => setConstituentFormData(d => ({ ...d, emailType: val }))}
                            >
                              <SelectTrigger className="h-10 slds-text-4" style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: '6px' }}>
                                <SelectValue placeholder="Please Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {['Personal','Work','Other'].map(t => (
                                  <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── Address Information section ── */}
                    <div>
                      <button
                        type="button"
                        className="w-full flex items-center gap-3 py-2 mb-4"
                        style={{ borderBottom: '2px solid var(--slds-g-color-border-base-1)', background: 'none', cursor: 'pointer' }}
                        onClick={() => setConstituentFormData(d => ({ ...d, showAddressInfo: !d.showAddressInfo }))}
                      >
                        <input
                          type="checkbox"
                          checked={constituentFormData.showAddressInfo}
                          readOnly
                          onClick={e => e.stopPropagation()}
                          onChange={e => setConstituentFormData(d => ({ ...d, showAddressInfo: e.target.checked }))}
                          style={{ accentColor: '#145F33', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                        />
                        <span className="slds-text-4 font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Address Information</span>
                      </button>
                      {constituentFormData.showAddressInfo && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                STREET ADDRESS <span className="text-red-600">*</span>
                              </label>
                              <Input
                                value={constituentFormData.streetAddress}
                                onChange={e => setConstituentFormData(d => ({ ...d, streetAddress: e.target.value }))}
                                className="h-10 slds-text-4"
                                style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: '6px' }}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>ADDRESS TYPE</label>
                              <Select
                                value={constituentFormData.addressType}
                                onValueChange={val => setConstituentFormData(d => ({ ...d, addressType: val }))}
                              >
                                <SelectTrigger className="h-10 slds-text-4" style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: '6px' }}>
                                  <SelectValue placeholder="Please Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  {['Home','Work','Mailing','Other'].map(t => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>ADDRESS LINE 2</label>
                            <Input
                              value={constituentFormData.addressLine2}
                              onChange={e => setConstituentFormData(d => ({ ...d, addressLine2: e.target.value }))}
                              className="h-10 slds-text-4"
                              style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: '6px' }}
                            />
                          </div>
                          <div className="flex items-end gap-3 flex-wrap">
                            <div className="space-y-1.5 flex-1 min-w-[130px]">
                              <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>CITY</label>
                              <Input
                                value={constituentFormData.city}
                                onChange={e => setConstituentFormData(d => ({ ...d, city: e.target.value }))}
                                placeholder="Enter City"
                                className="h-10 slds-text-4"
                                style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: '6px' }}
                              />
                            </div>
                            <div className="space-y-1.5 w-28">
                              <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>STATE</label>
                              <Select
                                value={constituentFormData.state}
                                onValueChange={val => setConstituentFormData(d => ({ ...d, state: val }))}
                              >
                                <SelectTrigger className="h-10 slds-text-4" style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: '6px' }}>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'].map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5 w-28">
                              <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>ZIP CODE</label>
                              <Input
                                value={constituentFormData.zipCode}
                                onChange={e => setConstituentFormData(d => ({ ...d, zipCode: e.target.value.replace(/\D/g,'').slice(0,5) }))}
                                placeholder="Enter Zip"
                                className="h-10 slds-text-4"
                                style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: '6px' }}
                              />
                            </div>
                            <div className="space-y-1.5 w-28">
                              <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>ZIP +4</label>
                              <Input
                                value={constituentFormData.zipPlus4}
                                onChange={e => setConstituentFormData(d => ({ ...d, zipPlus4: e.target.value.replace(/\D/g,'').slice(0,4) }))}
                                placeholder="Enter Zip +4"
                                className="h-10 slds-text-4"
                                style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: '6px' }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* ── Footer ── */}
                  <div
                    className="flex items-center justify-end gap-3 px-6 py-4 border-t flex-shrink-0"
                    style={{
                      borderColor: 'var(--slds-g-color-border-base-1)',
                      backgroundColor: 'var(--slds-g-color-background-alt)',
                    }}
                  >
                    <Button
                      variant="outline"
                      className="h-10 px-6 rounded-full slds-text-4 font-medium"
                      style={{
                        borderColor: 'var(--slds-g-color-border-base-1)',
                        color: 'var(--slds-g-color-text-default)',
                        backgroundColor: 'var(--slds-g-color-background-base)',
                      }}
                      onClick={() => {
                        setShowConstituentForm(false);
                        setShowPromotePage(true);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="h-10 px-6 rounded-full slds-text-4 font-semibold text-white"
                      style={{ backgroundColor: '#145F33' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0e4524')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#145F33')}
                      onClick={() => {
                        setPromoteInitialData(prev => ({
                          ...prev,
                          callerFirstName: constituentFormData.firstName,
                          callerLastName: constituentFormData.lastName,
                          callerPhone: constituentFormData.phone,
                          callerEmail: constituentFormData.email,
                          callerRelationship: constituentFormData.relationshipType,
                          callerRole: constituentFormData.role,
                          callerAddress: [constituentFormData.streetAddress, constituentFormData.city, constituentFormData.state, constituentFormData.zipCode].filter(Boolean).join(', '),
                        }));
                        setShowConstituentForm(false);
                        setShowPromotePage(true);
                      }}
                    >
                      Save and Continue
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Scrollable Content - Two Column Layout */}
              <div 
                className="flex-1 overflow-hidden flex"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)'
                }}
              >
                {/* Left Column - Contact Log Details */}
                <div className="flex-1 overflow-auto px-4 sm:px-6 py-6">
                  <div className="space-y-6">
                  {/* Caller Information Section */}
                  <div>
                    <h3 
                      className="text-sm font-semibold uppercase tracking-wide mb-4 pb-2"
                      style={{ 
                        color: 'var(--slds-g-color-text-default)',
                        borderBottom: '1px solid var(--slds-g-color-border-base-1)'
                      }}
                    >
                      Caller Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label 
                          className="text-xs font-semibold uppercase tracking-wide mb-1.5 block"
                          style={{ color: 'var(--slds-g-color-text-weak)' }}
                        >
                          Caller Name
                        </Label>
                        <Input
                          defaultValue={selectedLog.caller}
                          className="text-sm"
                          style={{
                            border: '1px solid var(--slds-g-color-border-base-4)',
                            borderRadius: 'var(--slds-c-input-radius-border)',
                            backgroundColor: 'var(--slds-g-color-background-alt)'
                          }}
                          readOnly
                        />
                      </div>
                      <div>
                        <Label 
                          className="text-xs font-semibold uppercase tracking-wide mb-1.5 block"
                          style={{ color: 'var(--slds-g-color-text-weak)' }}
                        >
                          Phone
                        </Label>
                        <Input
                          defaultValue={selectedLog.phone}
                          className="text-sm"
                          style={{
                            border: '1px solid var(--slds-g-color-border-base-4)',
                            borderRadius: 'var(--slds-c-input-radius-border)',
                            backgroundColor: 'var(--slds-g-color-background-alt)'
                          }}
                          readOnly
                        />
                      </div>
                      <div>
                        <Label 
                          className="text-xs font-semibold uppercase tracking-wide mb-1.5 block"
                          style={{ color: 'var(--slds-g-color-text-weak)' }}
                        >
                          Language
                        </Label>
                        <Select defaultValue="English">
                          <SelectTrigger 
                            className="text-sm h-9"
                            style={{
                              border: '1px solid var(--slds-g-color-border-base-4)',
                              borderRadius: 'var(--slds-c-input-radius-border)',
                              backgroundColor: 'var(--slds-g-color-background-alt)'
                            }}
                          >
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent className="z-[200]">
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Spanish">Spanish</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Contact Details Section */}
                  <div>
                    <h3 
                      className="text-sm font-semibold uppercase tracking-wide mb-4 pb-2"
                      style={{ 
                        color: 'var(--slds-g-color-text-default)',
                        borderBottom: '1px solid var(--slds-g-color-border-base-1)'
                      }}
                    >
                      Candidate Information
                    </h3>
                    <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="candidateType"
                          value="new"
                          checked={formData.candidateType === 'new'}
                          onChange={(e) => {
                            setFormData({ ...formData, candidateType: e.target.value as 'new' | 'existing' });
                            setSelectedExistingCandidate('');
                            setCandidateSearchTerm("");
                            setShowCandidateDropdown(false);
                          }}
                          className="w-4 h-4"
                          style={{ accentColor: '#145F33' }}
                        />
                        <span className="text-sm">New Candidate</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="candidateType"
                          value="existing"
                          checked={formData.candidateType === 'existing'}
                          onChange={(e) => {
                            setFormData({ ...formData, candidateType: e.target.value as 'new' | 'existing' });
                            // Clear search when switching to existing
                            if (e.target.value === 'existing') {
                              setCandidateSearchTerm("");
                              setSelectedExistingCandidate("");
                              setShowCandidateDropdown(false);
                            }
                          }}
                          className="w-4 h-4"
                          style={{ accentColor: '#145F33' }}
                        />
                        <span className="text-sm">Existing Candidate</span>
                      </label>
                    </div>
                  </div>

                  {/* Existing Candidate Search - shown only when "Existing Candidate" is selected */}
                  {formData.candidateType === 'existing' && (
                    <div className="relative" ref={candidateSearchRef}>
                      <Label htmlFor="existingCandidate" className="text-sm">Search Candidate:</Label>
                      {/* Results render in a portaled PopoverContent anchored to the
                          input, so the dialog's scrolling body can't clip them. Open
                          state, filtering and click-outside stay owned by this form. */}
                      <Popover
                        open={
                          showCandidateDropdown &&
                          (filteredCandidates.length > 0 || !!candidateSearchTerm)
                        }
                      >
                        <PopoverAnchor asChild>
                          <div className="relative">
                            <Input
                              id="existingCandidate"
                              type="text"
                              placeholder="Type to search by name or birthdate..."
                              className="mt-1 pr-8"
                              value={candidateSearchTerm}
                              onChange={(e) => {
                                setCandidateSearchTerm(e.target.value);
                                setShowCandidateDropdown(true);
                              }}
                              onFocus={() => setShowCandidateDropdown(true)}
                              style={{
                                border: '1px solid var(--slds-g-color-border-base-4)',
                                borderRadius: 'var(--slds-c-input-radius-border)'
                              }}
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                          </div>
                        </PopoverAnchor>
                        <PopoverContent
                          align="start"
                          sideOffset={4}
                          // keep focus in the input while typing
                          onOpenAutoFocus={(e) => e.preventDefault()}
                          onCloseAutoFocus={(e) => e.preventDefault()}
                          className="w-[var(--radix-popover-trigger-width)] p-0 bg-white rounded-md shadow-lg"
                          style={{
                            border: '1px solid var(--slds-g-color-border-base-4)',
                            borderRadius: 'var(--slds-c-input-radius-border)'
                          }}
                        >
                          {/* ref lives here: ui/popover's PopoverContent doesn't forward refs */}
                          <div
                            ref={candidateListRef}
                            className={filteredCandidates.length > 0 ? "max-h-60 overflow-auto" : "p-3"}
                          >
                          {filteredCandidates.length > 0 ? (
                            filteredCandidates.map((candidate) => (
                              <div
                                key={candidate.id}
                                className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm"
                                onClick={() => handleExistingCandidateChange(candidate.id)}
                                style={{
                                  borderBottom: '1px solid var(--slds-g-color-border-base-1)'
                                }}
                              >
                                <div className="font-medium">{candidate.firstName} {candidate.lastName}</div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No candidates found matching "{candidateSearchTerm}"</p>
                          )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  {/* Referral Date - Full Width */}
                  <div>
                    <Label htmlFor="candidateReferralDate" className="text-sm">Referral Date:</Label>
                    <DateInput
                      id="candidateReferralDate"
                      name="candidateReferralDate"
className="mt-1"
                      value={isoToMdy(formData.candidateReferralDate)}
                      onChange={(v) => (handleFormChange)({ target: { value: mdyToIso(v) } })}
                      disabled={formData.candidateType === 'existing' && !!selectedExistingCandidate}
                      style={{
                        border: '1px solid var(--slds-g-color-border-base-4)',
                        borderRadius: 'var(--slds-c-input-radius-border)',
                        backgroundColor: formData.candidateType === 'existing' && !!selectedExistingCandidate 
                          ? 'var(--slds-g-color-background-alt)' 
                          : 'var(--slds-g-color-background-base)',
                        cursor: formData.candidateType === 'existing' && !!selectedExistingCandidate ? 'not-allowed' : 'text'
                      }}
                      onFocus={(e) => {
                        if (!(formData.candidateType === 'existing' && !!selectedExistingCandidate)) {
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

                  {/* Candidate Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="candidateFirstName" className="text-sm">Candidate:</Label>
                      <Input
                        id="candidateFirstName"
                        name="candidateFirstName"
                        type="text"
                        placeholder="First Name"
                        className="mt-1"
                        value={formData.candidateFirstName}
                        onChange={handleFormChange}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4)',
                          borderRadius: 'var(--slds-c-input-radius-border)'
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="candidateLastName" className="text-sm opacity-0">Last Name</Label>
                      <Input
                        id="candidateLastName"
                        name="candidateLastName"
                        type="text"
                        placeholder="Last Name"
                        className="mt-1"
                        value={formData.candidateLastName}
                        onChange={handleFormChange}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4)',
                          borderRadius: 'var(--slds-c-input-radius-border)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Date of Birth, Age, and Sex - 3 Column Layout */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="candidateBirthdate" className="text-sm">Date of Birth:</Label>
                      <DateInput
                        id="candidateBirthdate"
                        name="candidateBirthdate"
className="mt-1"
                        value={isoToMdy(formData.candidateBirthdate)}
                        onChange={(v) => (handleFormChange)({ target: { value: mdyToIso(v) } })}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4)',
                          borderRadius: 'var(--slds-c-input-radius-border)'
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="candidateAge" className="text-sm">Age:</Label>
                      <Input
                        id="candidateAge"
                        name="candidateAge"
                        type="text"
                        className="mt-1"
                        value={formData.candidateAge}
                        onChange={handleFormChange}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4)',
                          borderRadius: 'var(--slds-c-input-radius-border)'
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="candidateSex" className="text-sm">Sex:</Label>
                      <Select
                        value={formData.candidateSex}
                        onValueChange={(value) => setFormData({ ...formData, candidateSex: value })}
                      >
                        <SelectTrigger className="mt-1" style={{
                          border: '1px solid var(--slds-g-color-border-base-4)',
                          borderRadius: 'var(--slds-c-input-radius-border)'
                        }}>
                          <SelectValue placeholder="Please Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Phone, Extension, and Email - 3 Column Layout */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="candidatePhone" className="text-sm">Phone:</Label>
                      <Input
                        id="candidatePhone"
                        name="candidatePhone"
                        type="tel"
                        placeholder="(555) 555-5555"
                        className="mt-1"
                        value={formData.candidatePhone}
                        onChange={handleFormChange}
                        disabled={formData.candidateType === 'existing' && !!selectedExistingCandidate}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: formData.candidateType === 'existing' && !!selectedExistingCandidate 
                            ? 'var(--slds-g-color-background-alt)' 
                            : 'var(--slds-g-color-background-base)',
                          cursor: formData.candidateType === 'existing' && !!selectedExistingCandidate ? 'not-allowed' : 'text'
                        }}
                        onFocus={(e) => {
                          if (!(formData.candidateType === 'existing' && !!selectedExistingCandidate)) {
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
                      <Label htmlFor="candidateExtension" className="text-sm">Extension:</Label>
                      <Input
                        id="candidateExtension"
                        name="candidateExtension"
                        type="text"
                        placeholder="Enter extension"
                        className="mt-1"
                        value={formData.candidateExtension}
                        onChange={handleFormChange}
                        disabled={formData.candidateType === 'existing' && !!selectedExistingCandidate}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: formData.candidateType === 'existing' && !!selectedExistingCandidate 
                            ? 'var(--slds-g-color-background-alt)' 
                            : 'var(--slds-g-color-background-base)',
                          cursor: formData.candidateType === 'existing' && !!selectedExistingCandidate ? 'not-allowed' : 'text'
                        }}
                        onFocus={(e) => {
                          if (!(formData.candidateType === 'existing' && !!selectedExistingCandidate)) {
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
                      <Label htmlFor="candidateEmail" className="text-sm">Email:</Label>
                      <Input
                        id="candidateEmail"
                        name="candidateEmail"
                        type="email"
                        placeholder="email@example.com"
                        className="mt-1"
                        value={formData.candidateEmail}
                        onChange={handleFormChange}
                        disabled={formData.candidateType === 'existing' && !!selectedExistingCandidate}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: formData.candidateType === 'existing' && !!selectedExistingCandidate 
                            ? 'var(--slds-g-color-background-alt)' 
                            : 'var(--slds-g-color-background-base)',
                          cursor: formData.candidateType === 'existing' && !!selectedExistingCandidate ? 'not-allowed' : 'text'
                        }}
                        onFocus={(e) => {
                          if (!(formData.candidateType === 'existing' && !!selectedExistingCandidate)) {
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

                  {/* State / Zip / Zip+4 Fields - 3 Column Layout */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="candidateState" className="text-sm">State:</Label>
                      <Input
                        id="candidateState"
                        name="candidateState"
                        type="text"
                        placeholder="IL"
                        className="mt-1"
                        value={formData.candidateState}
                        onChange={handleFormChange}
                        disabled={formData.candidateType === 'existing' && !!selectedExistingCandidate}
                        maxLength={2}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: formData.candidateType === 'existing' && !!selectedExistingCandidate 
                            ? 'var(--slds-g-color-background-alt)' 
                            : 'var(--slds-g-color-background-base)',
                          cursor: formData.candidateType === 'existing' && !!selectedExistingCandidate ? 'not-allowed' : 'text'
                        }}
                        onFocus={(e) => {
                          if (!(formData.candidateType === 'existing' && !!selectedExistingCandidate)) {
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
                      <Label htmlFor="candidateZip" className="text-sm">Zip:</Label>
                      <Input
                        id="candidateZip"
                        name="candidateZip"
                        type="text"
                        placeholder="60601"
                        className="mt-1"
                        value={formData.candidateZip}
                        onChange={handleFormChange}
                        disabled={formData.candidateType === 'existing' && !!selectedExistingCandidate}
                        maxLength={5}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: formData.candidateType === 'existing' && !!selectedExistingCandidate 
                            ? 'var(--slds-g-color-background-alt)' 
                            : 'var(--slds-g-color-background-base)',
                          cursor: formData.candidateType === 'existing' && !!selectedExistingCandidate ? 'not-allowed' : 'text'
                        }}
                        onFocus={(e) => {
                          if (!(formData.candidateType === 'existing' && !!selectedExistingCandidate)) {
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
                      <Label htmlFor="candidateZipPlus4" className="text-sm">Zip+4:</Label>
                      <Input
                        id="candidateZipPlus4"
                        name="candidateZipPlus4"
                        type="text"
                        placeholder="1234"
                        className="mt-1"
                        value={formData.candidateZipPlus4}
                        onChange={handleFormChange}
                        disabled={formData.candidateType === 'existing' && !!selectedExistingCandidate}
                        maxLength={4}
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: formData.candidateType === 'existing' && !!selectedExistingCandidate 
                            ? 'var(--slds-g-color-background-alt)' 
                            : 'var(--slds-g-color-background-base)',
                          cursor: formData.candidateType === 'existing' && !!selectedExistingCandidate ? 'not-allowed' : 'text'
                        }}
                        onFocus={(e) => {
                          if (!(formData.candidateType === 'existing' && !!selectedExistingCandidate)) {
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
                    <Label htmlFor="candidateReferralSource" className="text-sm">Referral Source:</Label>
                    <Select
                      value={formData.candidateReferralSource}
                      onValueChange={(value) => setFormData({ ...formData, candidateReferralSource: value })}
                      disabled={formData.candidateType === 'existing' && !!selectedExistingCandidate}
                    >
                      <SelectTrigger 
                        id="candidateReferralSource"
                        className="mt-1" 
                        style={{
                          border: '1px solid var(--slds-g-color-border-base-4)',
                          borderRadius: 'var(--slds-c-input-radius-border)',
                          backgroundColor: formData.candidateType === 'existing' && !!selectedExistingCandidate 
                            ? 'var(--slds-g-color-background-alt)' 
                            : 'var(--slds-g-color-background-base)',
                          cursor: formData.candidateType === 'existing' && !!selectedExistingCandidate ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <SelectValue placeholder="Please Select" />
                      </SelectTrigger>
                      <SelectContent>
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
                    <Label htmlFor="candidateCommunityOrg" className="text-sm">Community Referral Organization:</Label>
                    <Textarea
                      id="candidateCommunityOrg"
                      name="candidateCommunityOrg"
                      placeholder="Enter organization details..."
                      rows={3}
                      className="mt-1"
                      value={formData.candidateCommunityOrg}
                      onChange={handleFormChange}
                      disabled={formData.candidateType === 'existing' && !!selectedExistingCandidate}
                      style={{
                        border: '1px solid var(--slds-g-color-border-base-4)',
                        borderRadius: 'var(--slds-c-input-radius-border)',
                        backgroundColor: formData.candidateType === 'existing' && !!selectedExistingCandidate 
                          ? 'var(--slds-g-color-background-alt)' 
                          : 'var(--slds-g-color-background-base)',
                        cursor: formData.candidateType === 'existing' && !!selectedExistingCandidate ? 'not-allowed' : 'text'
                      }}
                      onFocus={(e) => {
                        if (!(formData.candidateType === 'existing' && !!selectedExistingCandidate)) {
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

                  {/* Relationship to Candidate */}
                  <div>
                    <Label htmlFor="relationshipToCandidate" className="text-sm">Relationship to Candidate:</Label>
                    <Select
                      value={formData.relationshipToCandidate}
                      onValueChange={(value) => setFormData({ ...formData, relationshipToCandidate: value })}
                    >
                      <SelectTrigger className="mt-1" style={{
                        border: '1px solid var(--slds-g-color-border-base-4)',
                        borderRadius: 'var(--slds-c-input-radius-border)'
                      }}>
                        <SelectValue placeholder="Please Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Parent">Parent</SelectItem>
                        <SelectItem value="Guardian">Guardian</SelectItem>
                        <SelectItem value="Sibling">Sibling</SelectItem>
                        <SelectItem value="Social Worker">Social Worker</SelectItem>
                        <SelectItem value="Self">Self</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Candidate Information Section */}
                </div>
              </div>

                {/* Right Column - Follow-up and History */}
                <div className="col-span-4 space-y-4">
                  {/* Follow up */}
                  <div>
                    <Label htmlFor="followUp" className="text-sm">Follow up:</Label>
                    <Select
                      value={formData.followUp}
                      onValueChange={(value) => setFormData({ ...formData, followUp: value })}
                    >
                      <SelectTrigger className="mt-1" style={{
                        border: '1px solid var(--slds-g-color-border-base-4)',
                        borderRadius: 'var(--slds-c-input-radius-border)'
                      }}>
                        <SelectValue placeholder="Please Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>


                </div>
              </div>

              {/* Action Buttons at bottom of form */}
              <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                <Button
                  className="h-9 text-[13px] rounded-full gap-2"
                  style={{
                    backgroundColor: 'var(--color-brand-primary)',
                    color: 'white',
                    border: 'none'
                  }}
                  onClick={() => {
                    // Contact log saved
                  }}
                >
                  <Check className="h-3.5 w-3.5" />
                  Save
                </Button>
                <Button
                  className="h-9 text-[13px] rounded-full"
                  variant="outline"
                  style={{
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  onClick={() => setIsDetailViewOpen(false)}
                >
                  Cancel
                </Button>
              </div>
                </div>

                {/* Right Column - Activity Timeline */}
                <div className="w-[380px] flex-shrink-0 overflow-hidden flex flex-col">
                  <ActivityTimeline
                    activities={timelineActivities[selectedLog.id] || getTimelineForContactLog(selectedLog.id)}
                    onAddActivity={(newActivity) => {
                      setTimelineActivities(prev => ({
                        ...prev,
                        [selectedLog.id]: [newActivity, ...(prev[selectedLog.id] || getTimelineForContactLog(selectedLog.id))]
                      }));
                    }}
                    onTaskClick={(activity) => setSelectedTimelineTask(activity)}
                  />
                </div>
              </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
      )}

      {/* Info Sessions Dialog */}
      <Dialog open={isInfoSessionDialogOpen} onOpenChange={setIsInfoSessionDialogOpen}>
        <DialogPortal>
          <DialogOverlay className="bg-black/10" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="max-w-[calc(100vw-2rem)] sm:max-w-[95vw] w-full lg:max-w-[1200px] max-h-[calc(100vh-2rem)] p-0 gap-0 flex flex-col overflow-hidden fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200"
            style={{
              backgroundColor: 'var(--slds-g-color-background-base)',
              border: '1px solid var(--slds-g-color-border-base-1)',
              borderRadius: 'var(--slds-c-card-radius-border)',
              boxShadow: 'var(--slds-g-shadow-4)'
            }}
          >
          {/* Close button */}
          <DialogPrimitive.Close 
            className="absolute top-4 right-4 z-50 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none"
            style={{
              color: 'var(--slds-g-color-text-weak)'
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          {/* Header - Fixed */}
          <div 
            className="px-4 sm:px-6 py-4 pr-12 border-b flex-shrink-0"
            style={{
              borderColor: 'var(--slds-g-color-border-base-1)',
              backgroundColor: 'var(--slds-g-color-background-base)'
            }}
          >
            <DialogHeader>
              <div className="flex items-start justify-between gap-4 pr-8">
                <div className="flex-1">
                  <DialogTitle className="text-lg sm:text-xl">Info Sessions</DialogTitle>
                  <DialogDescription className="text-sm">
                    View and manage upcoming information sessions
                  </DialogDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingSessionId(null);
                    setCreateSessionFormData({
                      date: "",
                      time: "",
                      topic: "",
                      location: "",
                      endDate: "",
                      endTime: "",
                      homeVisit: false,
                      serviceCoordination: false,
                      status: "",
                    });
                    setIsCreateSessionDialogOpen(true);
                  }}
                  className="rounded-full h-9 px-6 text-[13px] font-medium whitespace-nowrap flex-shrink-0"
                  style={{
                    backgroundColor: 'var(--color-brand-primary)',
                    color: 'white'
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New
                </Button>
              </div>
            </DialogHeader>
          </div>
          
          {/* Filters - Fixed */}
          <div 
            className="px-4 sm:px-6 py-4 border-b flex-shrink-0"
            style={{
              borderColor: 'var(--slds-g-color-border-base-1)',
              backgroundColor: 'var(--slds-g-color-background-alt)'
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              {/* View Selector - Hidden on mobile */}
              <div className="hidden sm:flex items-center gap-2">
                <Label className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  View:
                </Label>
                <Select value={infoSessionView} onValueChange={(value: "daily" | "weekly" | "monthly" | "yearly") => setInfoSessionView(value)}>
                  <SelectTrigger 
                    className="h-9 w-[110px] text-[13px]"
                    style={{
                      border: '1px solid var(--slds-g-color-border-base-1)',
                      backgroundColor: 'var(--slds-g-color-background-base)'
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filters */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
                <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                  <Label className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Start:
                  </Label>
                  <DateInput
className="h-[32px] flex-1 sm:w-[140px] text-[13px]"
                    style={{
                      border: '1px solid var(--slds-g-color-border-base-1)',
                      backgroundColor: 'var(--slds-g-color-background-base)'
                    }}
                    value={isoToMdy(infoSessionStartDate)}
                    onChange={(v) => ((e) => setInfoSessionStartDate(e.target.value))({ target: { value: mdyToIso(v) } })}
                  />
                </div>

                <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                  <Label className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    End:
                  </Label>
                  <DateInput
className="h-[32px] flex-1 sm:w-[140px] text-[13px]"
                    style={{
                      border: '1px solid var(--slds-g-color-border-base-1)',
                      backgroundColor: 'var(--slds-g-color-background-base)'
                    }}
                    value={isoToMdy(infoSessionEndDate)}
                    onChange={(v) => ((e) => setInfoSessionEndDate(e.target.value))({ target: { value: mdyToIso(v) } })}
                  />
                </div>

                <Button
                  className="h-[32px] text-[13px] w-full sm:w-auto"
                  variant="outline"
                  style={{
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  onClick={() => {
                    setInfoSessionStartDate("");
                    setInfoSessionEndDate("");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Table Container - Scrollable */}
          <div 
            className="flex-1 overflow-auto px-4 sm:px-6 py-4"
            style={{
              backgroundColor: 'var(--slds-g-color-background-base)'
            }}
          >
            <div className="min-w-[800px]">
              <Table>
                <TableHeader 
                  className="sticky top-0 z-10"
                  style={{ 
                    backgroundColor: 'var(--slds-g-color-background-alt)',
                  }}
                >
                  <TableRow style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                    <TableHead className="font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Type
                    </TableHead>
                    <TableHead className="font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Start Date
                    </TableHead>
                    <TableHead className="font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Start Time
                    </TableHead>
                    <TableHead className="font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      End Date
                    </TableHead>
                    <TableHead className="font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      End Time
                    </TableHead>
                    <TableHead className="font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Location
                    </TableHead>
                    <TableHead className="font-semibold text-center" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Home Visit
                    </TableHead>
                    <TableHead className="font-semibold text-center" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Service Coord.
                    </TableHead>
                    <TableHead className="font-semibold text-center" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-center" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInfoSessions.length > 0 ? (
                    filteredInfoSessions.map((session) => (
                      <TableRow
                        key={session.id}
                        className="hover:bg-opacity-50 transition-colors cursor-pointer"
                        style={{ 
                          borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                        }}
                        onClick={() => {
                          setSelectedInfoSession(session);
                          setIsInfoSessionDialogOpen(false);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-row-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <TableCell 
                          className="font-medium max-w-[200px] truncate"
                          style={{ color: 'var(--slds-g-color-text-default)' }}
                          title={session.topic || 'Individual Info Session'}
                        >
                          {session.topic || 'Individual Info Session'}
                        </TableCell>
                        <TableCell 
                          className="whitespace-nowrap"
                          style={{ color: 'var(--slds-g-color-text-default)' }}
                        >
                          {formatMdy(new Date(session.date))}
                        </TableCell>
                        <TableCell 
                          className="whitespace-nowrap"
                          style={{ color: 'var(--slds-g-color-text-default)' }}
                        >
                          {session.time}
                        </TableCell>
                        <TableCell 
                          className="whitespace-nowrap"
                          style={{ color: 'var(--slds-g-color-text-default)' }}
                        >
                          {session.endDate ? formatMdy(new Date(session.endDate)) : '—'}
                        </TableCell>
                        <TableCell 
                          className="whitespace-nowrap"
                          style={{ color: 'var(--slds-g-color-text-default)' }}
                        >
                          {session.endTime || '—'}
                        </TableCell>
                        <TableCell 
                          className="max-w-[180px] truncate"
                          style={{ color: 'var(--slds-g-color-text-default)' }}
                          title={session.location}
                        >
                          {session.location}
                        </TableCell>
                        <TableCell className="text-center">
                          {session.homeVisit ? (
                            <Check className="h-4 w-4 mx-auto" style={{ color: 'var(--color-brand-primary)' }} />
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {session.serviceCoordination ? (
                            <Check className="h-4 w-4 mx-auto" style={{ color: 'var(--color-brand-primary)' }} />
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {session.status ? (
                            <Badge
                              variant="outline"
                              className={cn(
                                "rounded-sm text-xs font-medium",
                                session.status === "Scheduled"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : session.status === "Completed"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : session.status === "Cancelled"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-gray-50 text-gray-700 border-gray-200"
                              )}
                            >
                              {session.status}
                            </Badge>
                          ) : (
                            <span style={{ color: 'var(--slds-g-color-text-weak)' }}>—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInfoSession(session);
                                setIsInfoSessionDialogOpen(false);
                              }}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" style={{ color: 'var(--color-brand-primary)' }} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSessionId(session.id);
                                setCreateSessionFormData({
                                  date: session.date,
                                  time: session.time,
                                  topic: session.topic,
                                  location: session.location,
                                  endDate: session.endDate || "",
                                  endTime: session.endTime || "",
                                  homeVisit: session.homeVisit || false,
                                  serviceCoordination: session.serviceCoordination || false,
                                  status: session.status || "",
                                });
                                setIsCreateSessionDialogOpen(true);
                              }}
                              title="Edit Session"
                            >
                              <Pencil className="h-4 w-4" style={{ color: 'var(--slds-g-color-text-default)' }} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Calendar className="h-12 w-12" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                          <div>
                            <p
                              className="font-medium text-sm"
                              style={{ color: 'var(--slds-g-color-text-default)' }}
                            >
                              No info sessions found
                            </p>
                            <p
                              className="text-xs mt-1"
                              style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                              {infoSessionStartDate || infoSessionEndDate
                                ? 'Try adjusting your date range'
                                : 'No sessions scheduled at this time'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div 
            className="px-4 sm:px-6 py-3 border-t flex items-center justify-between flex-shrink-0"
            style={{
              borderColor: 'var(--slds-g-color-border-base-1)',
              backgroundColor: 'var(--slds-g-color-background-alt)'
            }}
          >
            <div 
              className="text-xs font-medium"
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Showing {filteredInfoSessions.length} session{filteredInfoSessions.length !== 1 ? 's' : ''}
            </div>
            <Button
              className="h-[32px] text-[13px] rounded-full"
              variant="outline"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)',
                color: 'var(--slds-g-color-text-default)'
              }}
              onClick={() => setIsInfoSessionDialogOpen(false)}
            >
              Close
            </Button>
          </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      {/* Info Session Detail View - Dedicated Page */}
      {selectedInfoSession && !isInfoSessionDialogOpen && (
        <div className="fixed inset-0 z-50 bg-[#F3F3F3] flex flex-col">
          {/* Page Header with Action Buttons */}
          <div 
            className="px-4 sm:px-6 py-4 border-b flex-shrink-0"
            style={{
              borderColor: 'var(--slds-g-color-border-base-1)',
              backgroundColor: 'var(--slds-g-color-background-base)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  className="h-[32px] rounded-full"
                  variant="ghost"
                  onClick={() => {
                    setSelectedInfoSession(null);
                    setIsInfoSessionDialogOpen(true);
                  }}
                >
                  <ArrowLeft className="h-4 w-4" style={{ color: 'var(--slds-g-color-text-default)' }} />
                </Button>
                <div>
                  <h1
                    className="text-xl font-semibold"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Info Session Details
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    {selectedInfoSession?.date} at {selectedInfoSession?.time}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  className="h-[32px] w-[32px] rounded-full p-0"
                  variant="outline"
                  onClick={() => setSelectedInfoSession(null)}
                >
                  <X className="h-4 w-4" style={{ color: 'var(--slds-g-color-text-default)' }} />
                </Button>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-auto" style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
            <div className="max-w-4xl mx-auto px-6 py-8">
              {/* Validation Error Banner */}
              {statusValidationError && (
                <div
                  className="mb-6 px-4 py-3 rounded-sm flex items-start gap-3"
                  style={{
                    backgroundColor: '#FED7D7',
                    border: '1px solid #C53030',
                  }}
                  role="alert"
                >
                  <AlertCircle
                    className="h-5 w-5 flex-shrink-0 mt-0.5"
                    style={{ color: '#C53030' }}
                  />
                  <div className="flex-1">
                    <p
                      className="text-[13px] font-medium"
                      style={{ color: '#742A2A' }}
                    >
                      {statusValidationError}
                    </p>
                  </div>
                  <button
                    onClick={() => setStatusValidationError(null)}
                    className="flex-shrink-0 hover:opacity-70 transition-opacity"
                    aria-label="Dismiss error"
                  >
                    <X className="h-4 w-4" style={{ color: '#C53030' }} />
                  </button>
                </div>
              )}
              <Card style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                borderRadius: '0.25rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.07)'
              }}>
                <CardHeader style={{ 
                  borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  padding: '1rem 1.5rem'
                }}>
                  <CardTitle style={{ 
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--slds-g-color-text-default)'
                  }}>
                    Session Information
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: '1.5rem' }}>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <Label 
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Type
                      </Label>
                      <p 
                        className="text-[13px]"
                        style={{ color: 'var(--slds-g-color-text-default)' }}
                      >
                        {selectedInfoSession?.topic || 'Individual Info Session'}
                      </p>
                    </div>
                    <div>
                      <Label 
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Location
                      </Label>
                      <p 
                        className="text-[13px]"
                        style={{ color: 'var(--slds-g-color-text-default)' }}
                      >
                        {selectedInfoSession?.location}
                      </p>
                    </div>
                    <div>
                      <Label 
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Start Date
                      </Label>
                      <p 
                        className="text-[13px]"
                        style={{ color: 'var(--slds-g-color-text-default)' }}
                      >
                        {selectedInfoSession?.date && formatMdy(new Date(selectedInfoSession.date))}
                      </p>
                    </div>
                    <div>
                      <Label 
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Start Time
                      </Label>
                      <p 
                        className="text-[13px]"
                        style={{ color: 'var(--slds-g-color-text-default)' }}
                      >
                        {selectedInfoSession?.time}
                      </p>
                    </div>
                    {(selectedInfoSession?.endDate || selectedInfoSession?.endTime) && (
                      <>
                        <div>
                          <Label 
                            className="block text-[12px] font-semibold mb-1.5 uppercase"
                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                          >
                            End Date
                          </Label>
                          <p 
                            className="text-[13px]"
                            style={{ color: 'var(--slds-g-color-text-default)' }}
                          >
                            {selectedInfoSession?.endDate ? formatMdy(new Date(selectedInfoSession.endDate)) : '—'}
                          </p>
                        </div>
                        <div>
                          <Label 
                            className="block text-[12px] font-semibold mb-1.5 uppercase"
                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                          >
                            End Time
                          </Label>
                          <p 
                            className="text-[13px]"
                            style={{ color: 'var(--slds-g-color-text-default)' }}
                          >
                            {selectedInfoSession?.endTime || '—'}
                          </p>
                        </div>
                      </>
                    )}
                    <div>
                      <Label 
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Home Visit
                      </Label>
                      <div className="text-[13px]">
                        {selectedInfoSession?.homeVisit === true ? (
                          <Badge 
                            className="text-[11px] font-medium px-2 py-0.5 hover:bg-inherit"
                            style={{
                              backgroundColor: '#D0E9DA',
                              color: '#1B5E20',
                              border: 'none'
                            }}
                          >
                            Yes
                          </Badge>
                        ) : selectedInfoSession?.homeVisit === false ? (
                          <Badge 
                            className="text-[11px] font-medium px-2 py-0.5 hover:bg-inherit"
                            style={{
                              backgroundColor: '#E8E8E8',
                              color: '#3E3E3C',
                              border: 'none'
                            }}
                          >
                            No
                          </Badge>
                        ) : (
                          <span style={{ color: 'var(--slds-g-color-text-default)' }}>—</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label 
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Service Coordination
                      </Label>
                      <div className="text-[13px]">
                        {selectedInfoSession?.serviceCoordination === true ? (
                          <Badge 
                            className="text-[11px] font-medium px-2 py-0.5 hover:bg-inherit"
                            style={{
                              backgroundColor: '#D0E9DA',
                              color: '#1B5E20',
                              border: 'none'
                            }}
                          >
                            Yes
                          </Badge>
                        ) : selectedInfoSession?.serviceCoordination === false ? (
                          <Badge 
                            className="text-[11px] font-medium px-2 py-0.5 hover:bg-inherit"
                            style={{
                              backgroundColor: '#E8E8E8',
                              color: '#3E3E3C',
                              border: 'none'
                            }}
                          >
                            No
                          </Badge>
                        ) : (
                          <span style={{ color: 'var(--slds-g-color-text-default)' }}>—</span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Label
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                      >
                        Status
                      </Label>
                      <div className="text-[13px]">
                        <Select
                          value={selectedInfoSession?.status || "none"}
                          onValueChange={(value) => {
                            const newStatus = value === "none" ? "" : value as "Scheduled" | "Completed" | "Cancelled";
                            handleStatusChange(newStatus as "Scheduled" | "Completed" | "Cancelled" | "");
                          }}
                        >
                          <SelectTrigger
                            className="w-[200px] h-[32px] text-[13px]"
                            style={{
                              borderColor: 'var(--slds-g-color-border-base-4)',
                              backgroundColor: 'var(--slds-g-color-background-base)',
                              color: 'var(--slds-g-color-text-default)'
                            }}
                          >
                            <SelectValue placeholder="--None--">
                              {selectedInfoSession?.status || "--None--"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">--None--</SelectItem>
                            <SelectItem value="Scheduled">Scheduled</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Participants Card */}
              {selectedInfoSession?.participants && selectedInfoSession.participants.length > 0 && (
                <Card className="mt-6" style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  borderRadius: '0.25rem',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.07)'
                }}>
                  <CardHeader style={{
                    borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    padding: '1rem 1.5rem'
                  }}>
                    <CardTitle style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--slds-g-color-text-default)'
                    }}>
                      Participants ({selectedInfoSession.participants.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent style={{ padding: '0' }}>
                    <Table>
                      <TableHeader
                        style={{
                          backgroundColor: 'var(--slds-g-color-background-alt)',
                        }}
                      >
                        <TableRow style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                          <TableHead className="font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            Name
                          </TableHead>
                          <TableHead className="font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            Email
                          </TableHead>
                          <TableHead className="font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            Phone
                          </TableHead>
                          <TableHead className="font-semibold text-center" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            Attendance
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInfoSession.participants.map((participant) => (
                          <TableRow
                            key={participant.id}
                            style={{
                              borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                            }}
                          >
                            <TableCell
                              className="font-medium"
                              style={{ color: 'var(--slds-g-color-text-default)' }}
                            >
                              {participant.name}
                            </TableCell>
                            <TableCell
                              style={{ color: 'var(--slds-g-color-text-default)' }}
                            >
                              {participant.email}
                            </TableCell>
                            <TableCell
                              style={{ color: 'var(--slds-g-color-text-default)' }}
                            >
                              {participant.phone}
                            </TableCell>
                            <TableCell className="text-center">
                              <Select
                                value={participant.attendance === null ? "not_marked" : participant.attendance}
                                onValueChange={(value) => {
                                  const attendance = value === "not_marked" ? null : value as "Present" | "Absent";
                                  handleParticipantAttendanceChange(participant.id, attendance);
                                }}
                              >
                                <SelectTrigger
                                  className="w-[140px] h-[28px] text-xs mx-auto"
                                  style={{
                                    borderColor: 'var(--slds-g-color-border-base-4)',
                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                  }}
                                >
                                  <SelectValue>
                                    {participant.attendance === "Present" ? (
                                      <Badge
                                        variant="outline"
                                        className="rounded-sm text-xs font-medium bg-green-50 text-green-700 border-green-200"
                                      >
                                        Present
                                      </Badge>
                                    ) : participant.attendance === "Absent" ? (
                                      <Badge
                                        variant="outline"
                                        className="rounded-sm text-xs font-medium bg-red-50 text-red-700 border-red-200"
                                      >
                                        Absent
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="rounded-sm text-xs font-medium bg-gray-50 text-gray-600 border-gray-200"
                                      >
                                        Not Marked
                                      </Badge>
                                    )}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="not_marked">Not Marked</SelectItem>
                                  <SelectItem value="Present">Present</SelectItem>
                                  <SelectItem value="Absent">Absent</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create New Info Session Dialog */}
      <Dialog open={isCreateSessionDialogOpen} onOpenChange={(open) => {
        setIsCreateSessionDialogOpen(open);
        if (!open) {
          setEditingSessionId(null);
          setCreateSessionFormData({
            date: "",
            time: "",
            topic: "",
            location: "",
            endDate: "",
            endTime: "",
            homeVisit: false,
            serviceCoordination: false,
            status: "",
          });
        }
      }}>
        <DialogContent className="sm:max-w-[1100px] rounded-[8px] bg-white border border-[#dddbda] max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="border-b border-[#dddbda] pb-4 px-6 pt-6 mb-0">
            <DialogTitle className="text-[16px] font-bold text-[#080707]">
              {editingSessionId ? "Edit Info Session" : "Create New Info Session"}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#706e6b] mt-2">
              {editingSessionId
                ? "Update the information session details and status."
                : "Create a new information session for families and prospective candidates. Complete session details and manage participants all in one place."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {/* Session Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-[15px] font-semibold text-[#080707] mb-4">Session Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Type Field */}
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="sessionType" className="text-[13px] text-[#3e3e3c] font-medium">
                    Type <span className="text-red-600">*</span>
                  </Label>
                  <div
                    className="h-9 px-3 text-[13px] flex items-center"
                    style={{ 
                      color: '#080707'
                    }}
                  >
                    {createSessionFormData.topic || "Individual Info Session"}
                  </div>
                </div>

                {/* Start Date and Time */}
                <div className="space-y-1.5">
                  <Label htmlFor="startDate" className="text-[13px] text-[#3e3e3c] font-medium">
                    Start Date <span className="text-red-600">*</span>
                  </Label>
                  <DateInput
                    id="startDate"
value={isoToMdy(createSessionFormData.date)}
                    onChange={(v) => ((e) => setCreateSessionFormData({ ...createSessionFormData, date: e.target.value }))({ target: { value: mdyToIso(v) } })}
                    className="h-9 text-[13px] border-[#dddbda]"
                    style={{ colorScheme: 'light' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="startTime" className="text-[13px] text-[#3e3e3c] font-medium">
                    Start Time <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="startTime"
                    type="text"
                    placeholder="Enter time (e.g., 3:00 PM)"
                    value={createSessionFormData.time}
                    onChange={(e) => setCreateSessionFormData({ ...createSessionFormData, time: e.target.value })}
                    onBlur={(e) => {
                      const value = e.target.value.trim();
                      if (!value) return;

                      // Check if already has AM/PM
                      const hasAMPM = /AM|PM/i.test(value);

                      // Extract numbers
                      const match = value.match(/(\d+):?(\d*)/);
                      if (!match) return;

                      let hour = parseInt(match[1]);
                      let minute = match[2] ? match[2].padStart(2, '0') : '00';

                      // Determine AM/PM
                      let period = 'AM';
                      if (hasAMPM) {
                        period = value.toUpperCase().includes('PM') ? 'PM' : 'AM';
                      } else {
                        // Auto-determine based on hour
                        if (hour === 12) period = 'PM';
                        else if (hour > 12) {
                          hour = hour - 12;
                          period = 'PM';
                        } else if (hour === 0) {
                          hour = 12;
                          period = 'AM';
                        }
                      }

                      const formatted = `${hour}:${minute} ${period}`;
                      setCreateSessionFormData({ ...createSessionFormData, time: formatted });
                    }}
                    className="h-9 text-[13px] border-[#dddbda]"
                    style={{ colorScheme: 'light' }}
                  />
                </div>

                {/* End Date and Time */}
                <div className="space-y-1.5">
                  <Label htmlFor="endDate" className="text-[13px] text-[#3e3e3c] font-medium">
                    End Date
                  </Label>
                  <DateInput
                    id="endDate"
value={isoToMdy(createSessionFormData.endDate)}
                    onChange={(v) => ((e) => setCreateSessionFormData({ ...createSessionFormData, endDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
                    className="h-9 text-[13px] border-[#dddbda]"
                    style={{ colorScheme: 'light' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="endTime" className="text-[13px] text-[#3e3e3c] font-medium">
                    End Time
                  </Label>
                  <Input
                    id="endTime"
                    type="text"
                    placeholder="Enter time (e.g., 5:00 PM)"
                    value={createSessionFormData.endTime}
                    onChange={(e) => setCreateSessionFormData({ ...createSessionFormData, endTime: e.target.value })}
                    onBlur={(e) => {
                      const value = e.target.value.trim();
                      if (!value) return;

                      // Check if already has AM/PM
                      const hasAMPM = /AM|PM/i.test(value);

                      // Extract numbers
                      const match = value.match(/(\d+):?(\d*)/);
                      if (!match) return;

                      let hour = parseInt(match[1]);
                      let minute = match[2] ? match[2].padStart(2, '0') : '00';

                      // Determine AM/PM
                      let period = 'AM';
                      if (hasAMPM) {
                        period = value.toUpperCase().includes('PM') ? 'PM' : 'AM';
                      } else {
                        // Auto-determine based on hour
                        if (hour === 12) period = 'PM';
                        else if (hour > 12) {
                          hour = hour - 12;
                          period = 'PM';
                        } else if (hour === 0) {
                          hour = 12;
                          period = 'AM';
                        }
                      }

                      const formatted = `${hour}:${minute} ${period}`;
                      setCreateSessionFormData({ ...createSessionFormData, endTime: formatted });
                    }}
                    className="h-9 text-[13px] border-[#dddbda]"
                    style={{ colorScheme: 'light' }}
                  />
                </div>

                {/* Location */}
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="sessionLocation" className="text-[13px] text-[#3e3e3c] font-medium">
                    Location <span className="text-red-600">*</span>
                  </Label>
                  <select
                    id="sessionLocation"
                    value={createSessionFormData.location}
                    onChange={(e) => setCreateSessionFormData({ ...createSessionFormData, location: e.target.value })}
                    className="w-full h-9 px-3 text-[13px] border border-[#dddbda] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent bg-white"
                    style={{ 
                      color: createSessionFormData.location ? '#080707' : '#706e6b', 
                      colorScheme: 'light',
                      backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem',
                      appearance: 'none'
                    }}
                  >
                    <option value="">Select a location</option>
                    <option value="Main Conference Room">Main Conference Room</option>
                    <option value="Clinical Services Wing">Clinical Services Wing</option>
                    <option value="Residential Hall A">Residential Hall A</option>
                    <option value="Education Center">Education Center</option>
                    <option value="Family Services Building">Family Services Building</option>
                    <option value="Medical Clinic">Medical Clinic</option>
                    <option value="Community Room">Community Room</option>
                    <option value="Recreation Center">Recreation Center</option>
                    <option value="Training Room B">Training Room B</option>
                    <option value="Community Outreach Center">Community Outreach Center</option>
                    <option value="Administration Building">Administration Building</option>
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="homeVisit"
                    checked={createSessionFormData.homeVisit}
                    onChange={(e) => setCreateSessionFormData({ ...createSessionFormData, homeVisit: e.target.checked })}
                    className="h-4 w-4 rounded border-[#dddbda] text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                    style={{ colorScheme: 'light' }}
                  />
                  <Label htmlFor="homeVisit" className="text-[13px] text-[#3e3e3c] font-medium cursor-pointer">
                    Home Visit
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="serviceCoordination"
                    checked={createSessionFormData.serviceCoordination}
                    onChange={(e) => setCreateSessionFormData({ ...createSessionFormData, serviceCoordination: e.target.checked })}
                    className="h-4 w-4 rounded border-[#dddbda] text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                    style={{ colorScheme: 'light' }}
                  />
                  <Label htmlFor="serviceCoordination" className="text-[13px] text-[#3e3e3c] font-medium cursor-pointer">
                    Service Coordination
                  </Label>
                </div>

                {/* Status (only shown when editing) */}
                {editingSessionId && (
                  <div>
                    <Label htmlFor="status" className="text-[13px] text-[#3e3e3c] font-semibold">
                      Status
                    </Label>
                    <select
                      id="status"
                      value={createSessionFormData.status}
                      onChange={(e) => setCreateSessionFormData({ ...createSessionFormData, status: e.target.value as "Scheduled" | "Completed" | "Cancelled" | "" })}
                      className="w-full h-9 px-3 text-[13px] border border-[#dddbda] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent bg-white"
                      style={{
                        color: createSessionFormData.status ? '#080707' : '#706e6b',
                        colorScheme: 'light',
                        backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                      }}
                    >
                      <option value="">Select status</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

              {/* Preview */}
              {createSessionFormData.date && createSessionFormData.time && createSessionFormData.topic && (
                <div className="space-y-4 pt-5 border-t border-[#dddbda]">
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#080707] mb-4">Session Preview</h3>
                  </div>

                  <div className="p-5 bg-[#fafaf9] rounded-lg border border-[#dddbda]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[12px] text-[#706e6b]">Date</Label>
                      <p className="text-[13px] font-medium text-[#080707]">
                        {formatMdy(new Date(createSessionFormData.date))}
                      </p>
                    </div>
                    <div>
                      <Label className="text-[12px] text-[#706e6b]">Time</Label>
                      <p className="text-[13px] font-medium text-[#080707]">
                        {createSessionFormData.time && new Date(`2000-01-01T${createSessionFormData.time}`).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit', 
                          hour12: true 
                        })}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-[12px] text-[#706e6b]">Topic</Label>
                      <p className="text-[13px] font-medium text-[#080707]">{createSessionFormData.topic}</p>
                    </div>
                    {createSessionFormData.location && (
                      <div>
                        <Label className="text-[12px] text-[#706e6b]">Location</Label>
                        <p className="text-[13px] font-medium text-[#080707]">{createSessionFormData.location}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

              {/* Participants Section */}
              <div className="space-y-4 pt-5 border-t border-[#dddbda]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-[15px] font-semibold text-[#080707]">Participants</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedParticipantIds.length > 0 && (
                      <>
                        <span className="text-[12px] text-[#706e6b] mr-1">{selectedParticipantIds.length} selected</span>
                        <Button
                          variant="outline"
                          onClick={handleBulkSetAttended}
                          className="rounded-full h-9 px-4 text-[13px] font-medium border-[#dddbda] bg-white hover:bg-[#f3f2f2] text-[#3e3e3c] shadow-none"
                        >
                          <Check className="h-4 w-4 mr-1.5" />
                          Attended
                        </Button>
                        <Button
                          onClick={handleBulkSetNotAttended}
                          variant="outline"
                          className="rounded-full h-9 px-4 text-[13px] font-medium border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
                          style={{ color: '#080707' }}
                        >
                          <XIcon className="h-4 w-4 mr-1.5" />
                          Not Attended
                        </Button>
                        <Button
                          onClick={handleBulkSetUnknown}
                          variant="outline"
                          className="rounded-full h-9 px-4 text-[13px] font-medium shadow-none"
                          style={{ color: '#92400e', borderColor: '#f59e0b', backgroundColor: '#fffbeb' }}
                        >
                          <HelpCircle className="h-4 w-4 mr-1.5" />
                          Unknown
                        </Button>
                      </>
                    )}
                    <Button
                      onClick={handleStartInlineAdd}
                      disabled={isAddingInlineParticipant}
                      className="rounded-full h-9 px-4 text-[13px] font-medium w-full sm:w-auto bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
                    >
                      <Plus className="h-4 w-4 mr-2" style={{ strokeWidth: 2, stroke: 'currentColor' }} />
                      Add Participant
                    </Button>
                  </div>
                </div>

              {participants.length > 0 ? (
                <div className="border rounded-lg overflow-hidden border-[#dddbda]">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                        <tr>
                          <th className="px-3 py-2.5 text-center" style={{ width: '44px' }}>
                            <Checkbox
                              checked={participants.length > 0 && selectedParticipantIds.length === participants.length}
                              onCheckedChange={handleToggleAllParticipants}
                              aria-label="Select all participants"
                            />
                          </th>
                          <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)', width: '80px' }}>
                            Type
                          </th>
                          <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)', width: '180px' }}>
                            Participant
                          </th>
                          <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)', width: '120px' }}>
                            Role
                          </th>
                          <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)', width: '90px' }}>
                            Attended
                          </th>
                          <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            Reason Missed
                          </th>
                          <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)', width: '100px' }}>
                            Other Reason
                          </th>
                          <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)', width: '80px' }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                        {isAddingInlineParticipant && (
                          <tr className="bg-[#f0faf4]">
                            <td className="px-3 py-3 text-center">
                            </td>
                            <td className="px-3 py-2">
                              <Select value={inlineAddData.type} onValueChange={(val) => setInlineAddData({ ...inlineAddData, type: val })}>
                                <SelectTrigger className="h-8 text-[13px] border-[#dddbda] bg-white">
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Constituent">Constituent</SelectItem>
                                  <SelectItem value="Guardian/Family">Guardian/Family</SelectItem>
                                  <SelectItem value="Staff">Staff</SelectItem>
                                  <SelectItem value="External">External</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                value={inlineAddData.participant}
                                onChange={(e) => setInlineAddData({ ...inlineAddData, participant: e.target.value })}
                                className="h-8 text-[13px] border-[#dddbda]"
                                placeholder="Name"
                                autoFocus
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                value={inlineAddData.role}
                                onChange={(e) => setInlineAddData({ ...inlineAddData, role: e.target.value })}
                                className="h-8 text-[13px] border-[#dddbda]"
                                placeholder="Role"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <div className="flex justify-center">
                                <Checkbox
                                  checked={inlineAddData.attended}
                                  onCheckedChange={(checked) => {
                                    setInlineAddData({
                                      ...inlineAddData,
                                      attended: checked as boolean,
                                      reasonMissed: checked ? "" : inlineAddData.reasonMissed
                                    });
                                  }}
                                />
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              {!inlineAddData.attended && (
                                <Select 
                                  value={inlineAddData.reasonMissed} 
                                  onValueChange={(val) => {
                                    if (val === "Other") {
                                      handleOpenOtherReasonDialog("add");
                                    } else {
                                      setInlineAddData({ ...inlineAddData, reasonMissed: val, otherReasonDetails: "" });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-8 text-[13px] border-[#dddbda] bg-white">
                                    <SelectValue placeholder="Select reason" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-[200px]">
                                    {REASON_MISSED_OPTIONS.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {!inlineAddData.attended && inlineAddData.reasonMissed === "Other" && inlineAddData.otherReasonDetails && (
                                <button
                                  onClick={() => {
                                    setViewingOtherReason(inlineAddData.otherReasonDetails || null);
                                    setEditingOtherReasonContext("add");
                                    setEditedOtherReasonText(inlineAddData.otherReasonDetails || "");
                                  }}
                                  className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                                  title="View Other Reason"
                                >
                                  <Eye className="h-4 w-4" style={{ color: '#0066CC' }} />
                                </button>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={handleSaveInlineAdd}
                                  className="p-1.5 rounded hover:bg-green-100 transition-colors"
                                  title="Save"
                                >
                                  <Check className="h-4 w-4" style={{ color: '#145F33' }} />
                                </button>
                                <button
                                  onClick={handleCancelInlineAdd}
                                  className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                                  title="Cancel"
                                >
                                  <XIcon className="h-4 w-4" style={{ color: '#6B7280' }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                        {participants.map((participant) => (
                          <tr key={participant.id} className={cn("hover:bg-gray-50", inlineEditingId === participant.id && "bg-[#f0faf4]", selectedParticipantIds.includes(participant.id) && "bg-[#f9fafb]")}>
                            <td className="px-3 py-3 text-center">
                              <Checkbox
                                checked={selectedParticipantIds.includes(participant.id)}
                                onCheckedChange={() => handleToggleParticipantSelection(participant.id)}
                                aria-label={`Select ${participant.participant}`}
                              />
                            </td>
                            {inlineEditingId === participant.id ? (
                              <>
                                <td className="px-3 py-2">
                                  <Select value={inlineEditData.type} onValueChange={(val) => setInlineEditData({ ...inlineEditData, type: val })}>
                                    <SelectTrigger className="h-8 text-[13px] border-[#dddbda] bg-white">
                                      <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Constituent">Constituent</SelectItem>
                                      <SelectItem value="Guardian/Family">Guardian/Family</SelectItem>
                                      <SelectItem value="Staff">Staff</SelectItem>
                                      <SelectItem value="External">External</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="px-3 py-2">
                                  <Input
                                    value={inlineEditData.participant}
                                    onChange={(e) => setInlineEditData({ ...inlineEditData, participant: e.target.value })}
                                    className="h-8 text-[13px] border-[#dddbda]"
                                    placeholder="Name"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <Select value={inlineEditData.role} onValueChange={(val) => setInlineEditData({ ...inlineEditData, role: val })}>
                                    <SelectTrigger className="h-8 text-[13px] border-[#dddbda] bg-white">
                                      <SelectValue placeholder="Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {GENERIC_ROLE_OPTIONS.map((role) => (
                                        <SelectItem key={role} value={role}>
                                          {role}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <div className="flex justify-center">
                                    <Checkbox
                                      checked={inlineEditData.attended}
                                      onCheckedChange={(checked) => {
                                        setInlineEditData({
                                          ...inlineEditData,
                                          attended: checked as boolean,
                                          reasonMissed: checked ? "" : inlineEditData.reasonMissed
                                        });
                                      }}
                                    />
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  {!inlineEditData.attended && (
                                    <Select 
                                      value={inlineEditData.reasonMissed} 
                                      onValueChange={(val) => {
                                        if (val === "Other") {
                                          handleOpenOtherReasonDialog("edit");
                                        } else {
                                          setInlineEditData({ ...inlineEditData, reasonMissed: val, otherReasonDetails: "" });
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="h-8 text-[13px] border-[#dddbda] bg-white">
                                        <SelectValue placeholder="Select reason" />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-[200px]">
                                        {REASON_MISSED_OPTIONS.map((option) => (
                                          <SelectItem key={option} value={option}>
                                            {option}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {!inlineEditData.attended && inlineEditData.reasonMissed === "Other" && inlineEditData.otherReasonDetails && (
                                    <button
                                      onClick={() => {
                                        setViewingOtherReason(inlineEditData.otherReasonDetails || null);
                                        setEditingOtherReasonContext("edit");
                                        setEditingOtherReasonParticipantId(inlineEditingId);
                                        setEditedOtherReasonText(inlineEditData.otherReasonDetails || "");
                                      }}
                                      className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                                      title="View Other Reason"
                                    >
                                      <Eye className="h-4 w-4" style={{ color: '#0066CC' }} />
                                    </button>
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={handleSaveInlineEdit}
                                      className="p-1.5 rounded hover:bg-green-100 transition-colors"
                                      title="Save"
                                    >
                                      <Check className="h-4 w-4" style={{ color: '#145F33' }} />
                                    </button>
                                    <button
                                      onClick={handleCancelInlineEdit}
                                      className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                                      title="Cancel"
                                    >
                                      <XIcon className="h-4 w-4" style={{ color: '#6B7280' }} />
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-3 py-3">
                                  <span className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                    {participant.type}
                                  </span>
                                </td>
                                <td className="px-3 py-3">
                                  <span className="text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                    {participant.participant}
                                  </span>
                                </td>
                                <td className="px-3 py-3">
                                  <span className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                    {participant.role}
                                  </span>
                                </td>
                                <td className="px-3 py-3 text-center">
                                  <div className="flex justify-center">
                                    <Checkbox
                                      checked={participant.attended}
                                      onCheckedChange={(checked) => {
                                        setParticipants(participants.map(p => 
                                          p.id === participant.id 
                                            ? { ...p, attended: checked as boolean, reasonMissed: checked ? "" : p.reasonMissed }
                                            : p
                                        ));
                                      }}
                                    />
                                  </div>
                                </td>
                                <td className="px-3 py-3">
                                  {!participant.attended && (
                                    <div
                                      className="h-8 text-[13px] min-w-[150px] flex items-center px-3"
                                      style={{ color: '#080707' }}
                                    >
                                      {participant.reasonMissed === "Other" ? "Other" : (participant.reasonMissed || '—')}
                                    </div>
                                  )}
                                </td>
                                <td className="px-3 py-3 text-center">
                                  {!participant.attended && participant.reasonMissed === "Other" && participant.otherReasonDetails && (
                                    <button
                                      onClick={() => {
                                        setViewingOtherReason(participant.otherReasonDetails || null);
                                        setEditingOtherReasonContext("participant");
                                        setEditingOtherReasonParticipantId(participant.id);
                                        setEditedOtherReasonText(participant.otherReasonDetails || "");
                                      }}
                                      className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                                      title="View Other Reason"
                                    >
                                      <Eye className="h-4 w-4" style={{ color: '#0066CC' }} />
                                    </button>
                                  )}
                                </td>
                                <td className="px-3 py-3">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => handleStartInlineEdit(participant.id)}
                                      className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                                      title="Edit"
                                    >
                                      <Pencil className="h-4 w-4" style={{ color: '#4B5563' }} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteParticipant(participant.id)}
                                      className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-4 w-4" style={{ color: '#DC2626' }} />
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : !isAddingInlineParticipant ? (
                <div 
                  className="p-8 text-center border rounded-lg"
                  style={{ 
                    borderColor: '#dddbda',
                    backgroundColor: '#fafaf9'
                  }}
                >
                  <Users className="h-12 w-12 mx-auto mb-3" style={{ color: '#9CA3AF' }} />
                  <p className="text-[13px] font-medium text-[#080707] mb-1">No participants added yet</p>
                  <p className="text-[13px] text-[#706e6b]">Click "Add Participant" to start building your attendee list</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden border-[#dddbda]">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                        <tr>
                          <th className="px-3 py-2.5 text-center" style={{ width: '44px' }}></th>
                          <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)', width: '80px' }}>
                            Type
                          </th>
                          <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)', width: '180px' }}>
                            Participant
                          </th>
                          <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)', width: '120px' }}>
                            Role
                          </th>
                          <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)', width: '90px' }}>
                            Attended
                          </th>
                          <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            Reason Missed
                          </th>
                          <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)', width: '80px' }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                        <tr className="bg-[#f0faf4]">
                          <td className="px-3 py-3 text-center">
                          </td>
                          <td className="px-3 py-2">
                            <Select value={inlineAddData.type} onValueChange={(val) => setInlineAddData({ ...inlineAddData, type: val })}>
                              <SelectTrigger className="h-8 text-[13px] border-[#dddbda] bg-white">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Constituent">Constituent</SelectItem>
                                <SelectItem value="Guardian/Family">Guardian/Family</SelectItem>
                                <SelectItem value="Staff">Staff</SelectItem>
                                <SelectItem value="External">External</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              value={inlineAddData.participant}
                              onChange={(e) => setInlineAddData({ ...inlineAddData, participant: e.target.value })}
                              className="h-8 text-[13px] border-[#dddbda]"
                              placeholder="Name"
                              autoFocus
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              value={inlineAddData.role}
                              onChange={(e) => setInlineAddData({ ...inlineAddData, role: e.target.value })}
                              className="h-8 text-[13px] border-[#dddbda]"
                              placeholder="Role"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={inlineAddData.attended}
                                onCheckedChange={(checked) => {
                                  setInlineAddData({
                                    ...inlineAddData,
                                    attended: checked as boolean,
                                    reasonMissed: checked ? "" : inlineAddData.reasonMissed
                                  });
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            {!inlineAddData.attended && (
                              <Input
                                value={inlineAddData.reasonMissed}
                                onChange={(e) => setInlineAddData({ ...inlineAddData, reasonMissed: e.target.value })}
                                className="h-8 text-[13px] border-[#dddbda]"
                                placeholder="Reason missed"
                              />
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={handleSaveInlineAdd}
                                className="p-1.5 rounded hover:bg-green-100 transition-colors"
                                title="Save"
                              >
                                <Check className="h-4 w-4" style={{ color: '#145F33' }} />
                              </button>
                              <button
                                onClick={handleCancelInlineAdd}
                                className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                                title="Cancel"
                              >
                                <XIcon className="h-4 w-4" style={{ color: '#6B7280' }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>

          <DialogFooter className="border-t border-[#dddbda] pt-4 pb-5 px-6 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateSessionDialogOpen(false);
                setEditingSessionId(null);
                // Reset form
                setCreateSessionFormData({
                  date: "",
                  time: "",
                  topic: "",
                  location: "",
                  endDate: "",
                  endTime: "",
                  homeVisit: false,
                  serviceCoordination: false,
                  status: "",
                });
              }}
                className="rounded-full h-9 px-6 text-[13px] font-medium border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
              >
                Cancel
              </Button>
              <Button
              type="button"
              onClick={() => {
                // Validate form
                if (!createSessionFormData.date || !createSessionFormData.time || !createSessionFormData.topic || !createSessionFormData.location) {
                  return;
                }

                if (editingSessionId) {
                  // Edit existing session
                  setInfoSessions(prev => prev.map(session =>
                    session.id === editingSessionId
                      ? {
                          ...session,
                          date: createSessionFormData.date,
                          time: createSessionFormData.time,
                          topic: createSessionFormData.topic,
                          location: createSessionFormData.location,
                          endDate: createSessionFormData.endDate || undefined,
                          endTime: createSessionFormData.endTime || undefined,
                          homeVisit: createSessionFormData.homeVisit,
                          serviceCoordination: createSessionFormData.serviceCoordination,
                          status: createSessionFormData.status || session.status,
                        }
                      : session
                  ));
                } else {
                  // Create new session object
                  const newSession: InfoSession = {
                    id: Math.max(...infoSessions.map(s => s.id), 0) + 1, // Generate new ID
                    date: createSessionFormData.date,
                    time: createSessionFormData.time,
                    topic: createSessionFormData.topic,
                    location: createSessionFormData.location,
                    facilitator: "",
                    attendees: 0, // New session starts with 0 attendees
                    capacity: 0,
                    status: "Scheduled",
                    endDate: createSessionFormData.endDate || undefined,
                    endTime: createSessionFormData.endTime || undefined,
                    homeVisit: createSessionFormData.homeVisit,
                    serviceCoordination: createSessionFormData.serviceCoordination
                  };

                  // Add new session to the list
                  setInfoSessions(prev => [...prev, newSession]);
                }

                // Close dialog and reset form
                setIsCreateSessionDialogOpen(false);
                setEditingSessionId(null);
                setCreateSessionFormData({
                  date: "",
                  time: "",
                  topic: "",
                  location: "",
                  endDate: "",
                  endTime: "",
                  homeVisit: false,
                  serviceCoordination: false,
                  status: "",
                });
              }}
              className="rounded-full h-9 px-6 text-[13px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
            >
              {editingSessionId ? (
                <>
                  <Pencil className="h-4 w-4 mr-2" style={{ stroke: 'currentColor' }} />
                  Update Session
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" style={{ stroke: 'currentColor' }} />
                  Create Session
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Participants Dialog */}
      <Dialog open={isManageParticipantsDialogOpen} onOpenChange={setIsManageParticipantsDialogOpen}>
        <DialogPortal>
          <DialogOverlay className="bg-black/10" />
          <DialogPrimitive.Content
            className="sm:max-w-[95vw] max-w-[100vw] w-full lg:max-w-[1000px] h-[85vh] max-h-[85vh] p-0 gap-0 flex flex-col overflow-hidden fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200"
            aria-describedby={undefined}
            style={{
              backgroundColor: 'var(--slds-g-color-background-base)',
              border: '1px solid var(--slds-g-color-border-base-1)',
              borderRadius: 'var(--slds-c-card-radius-border)',
              boxShadow: 'var(--slds-g-shadow-4)'
            }}
          >
            {/* Close button */}
            <DialogPrimitive.Close 
              className="absolute top-4 right-4 z-50 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none"
              style={{
                color: 'var(--slds-g-color-text-weak)'
              }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>

            {/* Header - Fixed */}
            <div 
              className="px-4 sm:px-6 py-4 pr-12 border-b flex-shrink-0"
              style={{
                borderColor: 'var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <Users className="h-5 w-5" style={{ color: 'var(--slds-g-color-text-default)' }} />
                  Manage Participants
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Track and manage participants for information sessions
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Action Bar - Fixed */}
            <div 
              className="px-4 sm:px-6 py-3 border-b flex-shrink-0"
              style={{
                borderColor: 'var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-alt)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  {participants.length} participant{participants.length !== 1 ? 's' : ''}
                </div>
                <Button
                  onClick={() => handleOpenParticipantDialog(null)}
                  className="rounded-full h-[32px] px-6 text-[13px] font-medium"
                  style={{
                    backgroundColor: 'var(--color-brand-primary)',
                    color: 'white'
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Participant
                </Button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div 
              className="flex-1 overflow-auto px-4 sm:px-6 py-4"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
              {/* Bulk Actions */}
              {selectedParticipantIds.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-[13px] text-blue-900 font-medium">
                    {selectedParticipantIds.length} participant{selectedParticipantIds.length > 1 ? 's' : ''} selected
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      onClick={handleBulkSetAttended}
                      variant="outline"
                      className="h-8 px-3 text-[12px] rounded-full"
                    >
                      <Check className="h-3.5 w-3.5 mr-1.5" style={{ color: 'var(--slds-g-color-text-default)' }} />
                      Mark Attended
                    </Button>
                    <Button
                      onClick={handleBulkSetNotAttended}
                      variant="outline"
                      className="h-8 px-3 text-[12px] rounded-full"
                    >
                      <XIcon className="h-3.5 w-3.5 mr-1.5" style={{ color: 'var(--slds-g-color-text-default)' }} />
                      Mark Not Attended
                    </Button>
                    <Button
                      onClick={handleBulkSetUnknown}
                      variant="outline"
                      className="h-8 px-3 text-[12px] rounded-full"
                      style={{ color: '#92400e', borderColor: '#f59e0b', backgroundColor: '#fffbeb' }}
                    >
                      <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
                      Mark Unknown
                    </Button>
                    <Button
                      onClick={handleBulkRemove}
                      variant="outline"
                      className="h-8 px-3 text-[12px] rounded-full text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Remove
                    </Button>
                  </div>
                </div>
              )}

              {/* Participants Table */}
              {participants.length > 0 ? (
                <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
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
                                  variant="ghost"
                                  onClick={() => handleOpenParticipantDialog(participant.id)}
                                  className="h-8 w-8 p-0 rounded-full"
                                >
                                  <Pencil className="h-3.5 w-3.5 text-gray-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  onClick={() => handleDeleteParticipant(participant.id)}
                                  className="h-8 w-8 p-0 rounded-full text-red-600 hover:text-red-700"
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
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-[13px] text-gray-600 mb-3">No participants added yet</p>
                  <Button
                    onClick={() => handleOpenParticipantDialog(null)}
                    variant="outline"
                    className="h-8 px-4 text-[12px] rounded-full"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" style={{ color: 'var(--slds-g-color-text-default)' }} />
                    Add First Participant
                  </Button>
                </div>
              )}
            </div>

            {/* Footer - Fixed */}
            <div 
              className="px-4 sm:px-6 py-3 border-t flex items-center justify-end flex-shrink-0"
              style={{
                borderColor: 'var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-alt)'
              }}
            >
              <Button
                className="h-[32px] text-[13px] rounded-full"
                variant="outline"
                style={{
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  color: 'var(--slds-g-color-text-default)'
                }}
                onClick={() => setIsManageParticipantsDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      {/* Add/Edit Participant Dialog */}
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
              {participantFormData.type === 'Constituent' ? (
                <Select
                  value={participantFormData.participant}
                  onValueChange={(value) => {
                    const roles = PARTICIPANT_ROLES_MAP[value] || [];
                    const defaultRole = roles.length > 0 ? roles[0] : "";
                    setParticipantFormData(prev => ({ 
                      ...prev, 
                      participant: value,
                      role: defaultRole
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
                    <SelectValue placeholder="Select constituent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_LOGS.map((log) => (
                      <SelectItem key={log.id} value={log.candidate}>
                        {log.candidate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="participantName"
                  value={participantFormData.participant}
                  onChange={(e) => setParticipantFormData(prev => ({ ...prev, participant: e.target.value }))}
                  placeholder="Enter name..."
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                />
              )}
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
                  {(() => {
                    // Determine which roles to show
                    const rolesToShow = 
                      participantFormData.type === 'Constituent' && 
                      participantFormData.participant &&
                      PARTICIPANT_ROLES_MAP[participantFormData.participant]?.length > 0
                        ? PARTICIPANT_ROLES_MAP[participantFormData.participant]
                        : GENERIC_ROLE_OPTIONS;
                    
                    return rolesToShow.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ));
                  })()}
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

      {/* Other Reason Entry Dialog */}
      <Dialog open={isOtherReasonDialogOpen} onOpenChange={(open) => !open && handleCancelOtherReason()}>
        <DialogContent className="sm:max-w-md rounded-[8px] bg-white border border-[#dddbda]">
          <DialogHeader className="border-b border-[#dddbda] pb-4">
            <DialogTitle className="text-[16px] font-bold text-[#080707]">
              Other Reason
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#706e6b] mt-2">
              Please enter the reason details below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={tempOtherReason}
              onChange={(e) => setTempOtherReason(e.target.value)}
              className="min-h-[120px] text-[13px] border-[#dddbda]"
              placeholder="Enter reason details..."
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelOtherReason}
              className="rounded-full text-[13px] h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitOtherReason}
              disabled={!tempOtherReason.trim()}
              className="rounded-full text-[13px] text-white h-9 px-4"
              style={{ backgroundColor: '#145F33' }}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Other Reason Dialog */}
      <Dialog open={viewingOtherReason !== null} onOpenChange={(open) => !open && setViewingOtherReason(null)}>
        <DialogContent className="sm:max-w-lg rounded-[8px] bg-white border border-[#dddbda] p-0" aria-describedby={undefined}>
          <DialogHeader className="border-b border-[#dddbda] pb-4 px-6 pt-6 mb-0">
            <DialogTitle className="text-[16px] font-bold text-[#080707]">Edit Other Reason Details</DialogTitle>
            <DialogDescription className="text-[13px] text-[#706e6b] mt-2">
              Edit the custom reason details below and click Save to update.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4">
            <Textarea
              value={editedOtherReasonText}
              onChange={(e) => setEditedOtherReasonText(e.target.value)}
              className="min-h-[120px] text-[13px] text-[#3e3e3c] border-[#dddbda] focus:border-[#145F33] focus:ring-[#145F33]"
              placeholder="Enter other reason details..."
            />
          </div>
          <DialogFooter className="px-6 pb-6 pt-2 flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setViewingOtherReason(null);
                setEditingOtherReasonParticipantId(null);
                setEditingOtherReasonContext(null);
                setEditedOtherReasonText("");
              }}
              className="rounded-full text-[13px] h-9 px-4 border-[#dddbda] hover:bg-[#f3f2f2]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveOtherReason}
              className="rounded-full text-[13px] text-white h-9 px-4"
              style={{ backgroundColor: '#145F33' }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ── Contact Log Task Detail Modal ─────────────────────────── */}
      {selectedTimelineTask && (
        <Dialog open={!!selectedTimelineTask} onOpenChange={(open) => !open && setSelectedTimelineTask(null)}>
        <DialogPortal>
          <DialogOverlay className="z-[70]" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }} />
          <DialogPrimitive.Content
            className="fixed top-[50%] left-[50%] z-[70] translate-x-[-50%] translate-y-[-50%] rounded-lg w-full max-w-xl mx-4 flex flex-col overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200"
            style={{ maxHeight: '85vh', backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', boxShadow: '0 8px 32px rgba(0,0,0,0.22)' }}
          >
            <DialogPrimitive.Title className="sr-only">
              {selectedTimelineTask.title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Task details for {selectedTimelineTask.title}
            </DialogPrimitive.Description>
            {/* Header */}
            <div className="px-6 py-4 flex items-start justify-between gap-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="slds-text-3 px-1.5 py-0.5 rounded font-medium flex-shrink-0" style={{ backgroundColor: 'rgba(146,64,14,0.08)', color: '#92400E', border: '1px solid rgba(146,64,14,0.2)' }}>Task</span>
                  <h3 className="text-[15px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>{selectedTimelineTask.title}</h3>
                </div>
                <a href="/contact-log" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1 slds-text-3 font-medium hover:underline"
                  style={{ color: '#0176d3' }}>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  Open Contact Log
                </a>
              </div>
              <button onClick={() => setSelectedTimelineTask(null)} className="p-1.5 rounded hover:bg-gray-200 flex-shrink-0" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>DUE DATE</p>
                  <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    {formatMdy(new Date(selectedTimelineTask.timestamp))}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>ASSIGNED TO</p>
                  <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{selectedTimelineTask.user}</p>
                </div>
                <div className="space-y-1">
                  <p className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>STATUS</p>
                  <span className="slds-text-3 px-2 py-0.5 rounded-full font-medium" style={{
                    backgroundColor: selectedTimelineTask.status === 'completed' ? 'rgba(20,95,51,0.1)' : selectedTimelineTask.status === 'cancelled' ? 'rgba(194,57,52,0.1)' : 'rgba(1,118,211,0.1)',
                    color: selectedTimelineTask.status === 'completed' ? '#145F33' : selectedTimelineTask.status === 'cancelled' ? '#c23934' : '#0176d3',
                  }}>
                    {selectedTimelineTask.status ? selectedTimelineTask.status.charAt(0).toUpperCase() + selectedTimelineTask.status.slice(1) : 'Open'}
                  </span>
                </div>
                {selectedTimelineTask.category && (
                  <div className="space-y-1">
                    <p className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>CATEGORY</p>
                    <p className="slds-text-4" style={{ color: 'var(--slds-g-color-text-default)' }}>{selectedTimelineTask.category}</p>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <p className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>DETAILS</p>
                <div className="rounded-lg p-3 whitespace-pre-wrap slds-text-4" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', lineHeight: '1.6' }}>
                  {selectedTimelineTask.description}
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="px-6 py-4 flex justify-end flex-shrink-0" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
              <button onClick={() => setSelectedTimelineTask(null)} className="h-9 px-4 rounded-full text-[13px] font-medium" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}>Close</button>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
        </Dialog>
      )}
    </div>
  );
}