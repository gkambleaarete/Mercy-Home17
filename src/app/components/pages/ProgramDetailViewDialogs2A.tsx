// @ts-nocheck
import { useState, useEffect, useMemo } from "react";
import { DateInput } from "../ui/date-input";
import { TimeInput } from "../ui/time-input";
import { RichTextEditor } from "../ui/rich-text-editor";
import { YouthAlertIcons } from "../youth/YouthAlertIcons";
import { useNavigate, useLocation } from "react-router";
import { IncidentDetailsDialog } from "../dialogs/IncidentDetailsDialog";
import {
  Search,
  Calendar,
  FileText,
  AlertTriangle,
  User,
  Filter,
  ChevronRight,
  Settings,
  RefreshCw,
  LayoutGrid,
  Clock,
  Check,
  ArrowRight,
  MoreHorizontal,
  Mail,
  ClipboardList,
  Stethoscope,
  MessageCircle,
  Eye,
  Pill,
  File,
  AlertCircle,
  X,
  Plus,
  ChevronDown,
  Download,
  ExternalLink,
  Users,
  Target,
  Briefcase,
  TrendingUp,
  Edit2,
  Save,
  Phone,
  Trash2,
  MessageSquare,
  Sparkles,
  FileEdit,
  Upload,
  Paperclip,
  Image,
  Pencil,
  ChevronUp,
  EyeOff,
  SlidersHorizontal,
  Send,
  Tag,
  CheckCircle,
  XCircle,
} from "@/app/lib/lucide-icons";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { VisuallyHidden } from "../ui/visually-hidden";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Checkbox } from "../ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { cn } from "../../lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar";
import { toast } from "sonner";
import { GeneralTabContent } from "../youth/GeneralTabContent";
import { ProfileContentRenderer } from "../youth/ProfileContentRenderer";
import { OtherTabsContentRenderer } from "../youth/OtherTabsContentRenderer";
import { MedicationsSection } from "../admissions/MedicationsSection";
import {
  MOCK_PROGRAMS,
  YOUTH_STATUS,
  PROGRAM_TEAM,
  OTHER_INDIVIDUALS,
  MY_TASKS,
  PREVIOUS_SESSIONS,
  EVENTS,
  getTimelineItems,
  MEDICATIONS,
  LOG_FEED,
} from "./programLogData";
import {
  SHIFT_HANDOVERS,
  BEHAVIORAL_INCIDENTS,
  BEHAVIORAL_SUMMARY,
} from "./programLogBehavioralData";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface ProgramDetailViewDialogsProps {
  [key: string]: any;
}

export function ProgramDetailViewDialogs2A(
  props: ProgramDetailViewDialogsProps,
) {
  const {
    program,
    // Email dialog
    emailDialogOpen,
    setEmailDialogOpen,
    emailSubject,
    setEmailSubject,
    emailBody,
    setEmailBody,
    // Handover dialog
    handoverDialogOpen,
    setHandoverDialogOpen,
    handoverNote,
    setHandoverNote,
    isAiGenerated,
    setIsAiGenerated,
    handoverNoteMode,
    setHandoverNoteMode,
    isGeneratingAiNote,
    setIsGeneratingAiNote,
    handovers,
    setHandovers,
    editingHandoverId,
    setEditingHandoverId,
    viewingHandover,
    setViewingHandover,
    viewHandoverDialogOpen,
    setViewHandoverDialogOpen,
    deleteHandoverDialogOpen,
    setDeleteHandoverDialogOpen,
    handoverToDelete,
    setHandoverToDelete,
    handoverShift,
    setHandoverShift,
    handoverAuthor,
    setHandoverAuthor,
    handoverDate,
    setHandoverDate,
    handoverTime,
    setHandoverTime,
    handoverCriticalCount,
    setHandoverCriticalCount,
    expandedShiftId,
    setExpandedShiftId,
    // Goals dialog
    viewingYouthGoals,
    setViewingYouthGoals,
    viewGoalsDialogOpen,
    setViewGoalsDialogOpen,
    goals,
    setGoals,
    showAddGoal,
    setShowAddGoal,
    expandedGoals,
    setExpandedGoals,
    newGoal,
    setNewGoal,
    editingGoalId,
    setEditingGoalId,
    editGoalData,
    setEditGoalData,
    showCommentForm,
    setShowCommentForm,
    newComment,
    setNewComment,
    youthGoalsData,
    setYouthGoalsData,
    calculateOverallProgress,
    handleDeleteGoal,
    handleEditGoal,
    handleSaveGoal,
    handleCancelEditGoal,
    handleAddGoal,
    handleAddComment,
    // Incident dialog
    incidentDialogOpen,
    setIncidentDialogOpen,
    incidentYouth,
    setIncidentYouth,
    incidentTab,
    setIncidentTab,
    incidentType,
    setIncidentType,
    incidentStartDate,
    setIncidentStartDate,
    incidentStartTime,
    setIncidentStartTime,
    incidentEndDate,
    setIncidentEndDate,
    incidentEndTime,
    setIncidentEndTime,
    incidentLocation,
    setIncidentLocation,
    incidentOverview,
    setIncidentOverview,
    incidentNarrative,
    setIncidentNarrative,
    incidentResponse,
    setIncidentResponse,
    incidentPersonsContacted,
    setIncidentPersonsContacted,
    incidentParticipants,
    setIncidentParticipants,
    incidentYouthInjuries,
    setIncidentYouthInjuries,
    incidentRestraints,
    setIncidentRestraints,
    incidentDebriefParticipants,
    setIncidentDebriefParticipants,
    incidentDebriefNotes,
    setIncidentDebriefNotes,
    incidentFinalized,
    setIncidentFinalized,
    incidentYouthList,
    setIncidentYouthList,
    handleSaveIncident,
    handleCancelIncident,
    handleFinalizeIncident,
    handleAddPersonContacted,
    handleRemovePersonContacted,
    handleAddYouthInjury,
    handleRemoveYouthInjury,
    handleAddRestraint,
    handleRemoveRestraint,
    handleAddDebriefParticipant,
    handleRemoveDebriefParticipant,
    handleAddIncidentYouth,
    handleRemoveIncidentYouth,
    handleSetPrimaryYouth,
    // Filter dialog
    filterOpen,
    setFilterOpen,
    selectedTypes,
    setSelectedTypes,
    selectedAuthors,
    setSelectedAuthors,
    selectedYouthFilter,
    setSelectedYouthFilter,
    selectedPriorities,
    setSelectedPriorities,
    dateRangeFilter,
    setDateRangeFilter,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    toggleType,
    toggleAuthor,
    toggleYouthFilter,
    togglePriority,
    clearAllFilters,
    activeFilterCount,
    // Task list dialog (pl)
    plDetailTask,
    setPlDetailTask,
    plDS,
    setPlDS,
    plDD,
    setPlDD,
    plDA,
    setPlDA,
    plDR,
    setPlDR,
    plDSt,
    setPlDSt,
    plComment,
    setPlComment,
    addPlComment,
    cancelPlTask,
    // Tasks
    tasks,
    setTasks,
    taskDetailOpen,
    setTaskDetailOpen,
    selectedTask,
    setSelectedTask,
    meetingDate,
    setMeetingDate,
    meetingTime,
    setMeetingTime,
    meetingLocation,
    setMeetingLocation,
    meetingNotes,
    setMeetingNotes,
    newTaskOpen,
    setNewTaskOpen,
    newTaskTitle,
    setNewTaskTitle,
    newTaskDescription,
    setNewTaskDescription,
    newTaskPriority,
    setNewTaskPriority,
    newTaskDueDate,
    setNewTaskDueDate,
    newTaskAssignee,
    setNewTaskAssignee,
    handleSaveNewTask,
    handleCancelNewTask,
    handleCloseTaskDetail,
    handleToggleTaskSection,
    handleToggleChecklistItem,
    handleScheduleMeeting,
    handleCompleteTaskFromDetail,
    handleViewFullDetails,
    isTaskOverdue,
    toggleTaskCompletion,
    // Youth detail
    youthDetailOpen,
    setYouthDetailOpen,
    selectedYouth,
    setSelectedYouth,
    // Observation dialog
    observationDialogOpen,
    setObservationDialogOpen,
    observationYouth,
    setObservationYouth,
    observationLocation,
    setObservationLocation,
    locationComments,
    setLocationComments,
    selectedObservations,
    setSelectedObservations,
    observationComments,
    setObservationComments,
    handleSaveObservation,
    toggleObservation,
    // Event detail
    eventDetailOpen,
    setEventDetailOpen,
    selectedEvent,
    setSelectedEvent,
    showExpandedDetails,
    setShowExpandedDetails,
    handleAddToCalendar,
    // Shift/log
    expandedYouth,
    setExpandedYouth,
    selectedShift,
    setSelectedShift,
    // New entry dialog
    newEntryOpen,
    setNewEntryOpen,
    newEntryType,
    setNewEntryType,
    newEntryLogType,
    setNewEntryLogType,
    newEntryContent,
    setNewEntryContent,
    newEntryPriority,
    setNewEntryPriority,
    newEntryTags,
    setNewEntryTags,
    newEntryYouth,
    setNewEntryYouth,
    newEntryProgramTeam,
    setNewEntryProgramTeam,
    newEntryOther,
    setNewEntryOther,
    newEntryFiles,
    setNewEntryFiles,
    newEntryDate,
    setNewEntryDate,
    newEntryTime,
    setNewEntryTime,
    isDragging,
    setIsDragging,
    youthSearchQuery,
    setYouthSearchQuery,
    programTeamSearchQuery,
    setProgramTeamSearchQuery,
    otherSearchQuery,
    setOtherSearchQuery,
    externalIndividuals,
    setExternalIndividuals,
    externalIndividualInput,
    setExternalIndividualInput,
    handleSaveNewEntry,
    handleCancelNewEntry,
    toggleTag,
    toggleYouthAssociation,
    handleFileSelect,
    handleRemoveFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    formatFileSize,
    addExternalIndividual,
    removeExternalIndividual,
    // Mention
    mentionInput,
    setMentionInput,
    showMentionDropdown,
    setShowMentionDropdown,
    mentionQuery,
    setMentionQuery,
    selectedMentionIndex,
    setSelectedMentionIndex,
    handleMentionInputChange,
    handleMentionSelect,
    handleMentionKeyDown,
    removeYouthMention,
    // Log feed
    logFeedData,
    setLogFeedData,
    expandedComments,
    setExpandedComments,
    showAllComments,
    setShowAllComments,
    newCommentText,
    setNewCommentText,
    editingLogId,
    setEditingLogId,
    editedContent,
    setEditedContent,
    editedLogs,
    setEditedLogs,
    expandedOriginals,
    setExpandedOriginals,
    toggleComments,
    toggleShowAllComments,
    startEditingLog,
    cancelEditingLog,
    saveEditedLog,
    toggleOriginalContent,
    // Edit entry modal
    editModalOpen,
    setEditModalOpen,
    editingEntry,
    setEditingEntry,
    editEntryLogType,
    setEditEntryLogType,
    editEntryDate,
    setEditEntryDate,
    editEntryTime,
    setEditEntryTime,
    editEntryPriority,
    setEditEntryPriority,
    editEntryContent,
    setEditEntryContent,
    editEntryYouth,
    setEditEntryYouth,
    editEntryProgramTeam,
    setEditEntryProgramTeam,
    editEntryOther,
    setEditEntryOther,
    editEntryTags,
    setEditEntryTags,
    editEntryAttachments,
    setEditEntryAttachments,
    handleSaveEditedEntry,
    handleCancelEditEntry,
    // View log entry
    viewingLogEntry,
    setViewingLogEntry,
    viewLogEntryDialogOpen,
    setViewLogEntryDialogOpen,
    getYouthRecentLogs,
    // Therapy detail
    therapyDetailOpen,
    setTherapyDetailOpen,
    selectedTherapyEntry,
    setSelectedTherapyEntry,
    // Connections dialog
    connectionsOpen,
    setConnectionsOpen,
    connectionType,
    setConnectionType,
    connectionStartDate,
    setConnectionStartDate,
    connectionEndDate,
    setConnectionEndDate,
    connectionRecurring,
    setConnectionRecurring,
    connectionCadence,
    setConnectionCadence,
    connectionRepeatType,
    setConnectionRepeatType,
    connectionRepeatInterval,
    setConnectionRepeatInterval,
    connectionDaysOfWeek,
    setConnectionDaysOfWeek,
    connectionEndType,
    setConnectionEndType,
    connectionOccurrences,
    setConnectionOccurrences,
    connectionStartTime,
    setConnectionStartTime,
    connectionEndTime,
    setConnectionEndTime,
    connectionYouth,
    setConnectionYouth,
    connectionLocation,
    setConnectionLocation,
    connectionTransitionRelated,
    setConnectionTransitionRelated,
    connectionHomeVisit,
    setConnectionHomeVisit,
    connectionSession,
    setConnectionSession,
    connectionGoals,
    setConnectionGoals,
    connectionNewGoal,
    setConnectionNewGoal,
    connectionCopingSkills,
    setConnectionCopingSkills,
    connectionNewCopingSkill,
    setConnectionNewCopingSkill,
    connectionTriggers,
    setConnectionTriggers,
    connectionNewTrigger,
    setConnectionNewTrigger,
    connectionStrengths,
    setConnectionStrengths,
    connectionNewStrength,
    setConnectionNewStrength,
    connectionMeetingSummary,
    setConnectionMeetingSummary,
    connectionOtherAttendees,
    setConnectionOtherAttendees,
    advocateQuestion1,
    setAdvocateQuestion1,
    advocateQuestion2,
    setAdvocateQuestion2,
    advocateQuestion3,
    setAdvocateQuestion3,
    milieuYouthAttendance,
    setMilieuYouthAttendance,
    milieuYouthNotes,
    setMilieuYouthNotes,
    milieuYouthObservations,
    setMilieuYouthObservations,
    milieuThemesAddressed,
    setMilieuThemesAddressed,
    handleSaveConnection,
    handleFinalizeAndSubmitConnection,
    handleCancelConnection,
    connDays,
    setConnDays,
    // IR dialog
    irOpen,
    setIrOpen,
    irType,
    setIrType,
    irSeverity,
    setIrSeverity,
    irDate,
    setIrDate,
    irTime,
    setIrTime,
    irLocation,
    setIrLocation,
    irYouthInvolved,
    setIrYouthInvolved,
    irStaffInvolved,
    setIrStaffInvolved,
    irDescription,
    setIrDescription,
    irImmediateAction,
    setIrImmediateAction,
    irFollowUp,
    setIrFollowUp,
    irNotificationRequired,
    setIrNotificationRequired,
    irNotifiedParties,
    setIrNotifiedParties,
    handleSaveIR,
    handleCancelIR,
    // Handover handlers
    handleGenerateAiNote,
    handleSaveHandover,
    handleViewGoals,
    filteredHandovers,
    regenerateHandoverNote,
    canFinalizeIncident,
  } = props;

  // ── New Connection modal: Connection/Details tabs (matches ConnectionFormDialog) ──
  const [pdvConnActiveTab, setPdvConnActiveTab] = useState<
    "connection" | "details"
  >("connection");
  const [pdvSessionType, setPdvSessionType] = useState("");
  const [pdvSessionVariant, setPdvSessionVariant] =
    useState("");

  // ── Advocate Meeting form rebuild (matches ConnectionFormDialog pattern) ──
  const [advocateStartDate, setAdvocateStartDate] =
    useState("");
  const [advocateStartTime, setAdvocateStartTime] =
    useState("");
  const [advocateEndDate, setAdvocateEndDate] = useState("");
  const [advocateEndTime, setAdvocateEndTime] = useState("");
  const [advocateStatus, setAdvocateStatus] =
    useState("Scheduled");
  const [advocateLocation, setAdvocateLocation] = useState("");
  const [
    advocateTransitionRelated,
    setAdvocateTransitionRelated,
  ] = useState(false);
  const [advocateHomeVisit, setAdvocateHomeVisit] =
    useState(false);
  const [
    advocateServiceCoordination,
    setAdvocateServiceCoordination,
  ] = useState(false);
  const [advocateParticipants, setAdvocateParticipants] =
    useState([
      {
        id: 1,
        constituentType: "Constituent",
        participant: "Sohan Jadhavrao",
        role: "Organizer",
        isOrganizer: true,
        attended: null,
        reasonMissed: "",
        otherReason: "",
      },
      {
        id: 2,
        constituentType: "Constituent",
        participant: "Aarete Test",
        role: "Youth",
        isOrganizer: false,
        attended: null,
        reasonMissed: "",
        otherReason: "",
      },
    ]);
  const [advocateSelectedIds, setAdvocateSelectedIds] =
    useState([]);
  const [advocateIsAdding, setAdvocateIsAdding] =
    useState(false);
  const [advocateAddDraft, setAdvocateAddDraft] = useState({
    constituentType: "Constituent",
    participant: "",
    role: "",
  });
  const [advocateEditingId, setAdvocateEditingId] =
    useState(null);
  const [advocateEditDraft, setAdvocateEditDraft] = useState({
    constituentType: "Constituent",
    participant: "",
    role: "",
  });

  const ADVOCATE_PARTICIPANT_OPTIONS = [
    "J. Smith",
    "M. Johnson",
    "A. Williams",
    "R. Davis",
    "T. Brown",
    "K. Lee",
    "P. Garcia",
    "S. Martinez",
    "Sohan Jadhavrao",
    "Aarete Test",
  ];
  const ADVOCATE_CONSTITUENT_ROLES = [
    "Youth",
    "Parent/Guardian",
    "Sibling",
    "Family Member",
    "MHBG Staff",
    "Organizer",
  ];
  const ADVOCATE_NON_CONSTITUENT_ROLES = [
    "Coordinator",
    "Director",
    "Manager",
    "Tutor",
    "Advisor",
    "Other Role",
    "Instructor",
    "MHBG Staff",
    "Volunteer",
    "School Staff",
    "Contractor",
    "Case Manager",
    "Clinician",
    "Nurse",
    "Med Leader",
    "Medical Professional",
  ];
  const ADVOCATE_REASON_MISSED_OPTIONS = [
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
  ];
  const ADVOCATE_LOCATION_OPTIONS = [
    "Other",
    "DePalmaGarden",
    "Conference Room - Community Care Satellite Office",
    "Conference Room - Daley Home Therapy Room",
    "Conference Room - Daley Home Staff Office",
    "Conference Room - Daley Home Living Room",
    "Girls Campus Back Office",
    "Our Lady of Mercy Chapel",
    "Learning Center Computer Lab (West Loop)",
    "Conference Room - 227 Basement",
    "Conference Room - MW Living Room",
    "Conference Room - BOA Conference Room",
    "Conference Room - Advancement",
  ];

  const nextAdvocateParticipantId = () =>
    advocateParticipants.length
      ? Math.max(...advocateParticipants.map((p) => p.id)) + 1
      : 1;

  const handleStartAdvocateAdd = () => {
    setAdvocateAddDraft({
      constituentType: "Constituent",
      participant: "",
      role: "",
    });
    setAdvocateIsAdding(true);
  };
  const handleConfirmAdvocateAdd = () => {
    if (!advocateAddDraft.participant || !advocateAddDraft.role)
      return;
    setAdvocateParticipants((prev) => [
      ...prev,
      {
        id: nextAdvocateParticipantId(),
        ...advocateAddDraft,
        isOrganizer: false,
        attended: null,
        reasonMissed: "",
        otherReason: "",
      },
    ]);
    setAdvocateIsAdding(false);
  };
  const handleCancelAdvocateAdd = () =>
    setAdvocateIsAdding(false);

  const handleStartAdvocateEdit = (p) => {
    setAdvocateEditingId(p.id);
    setAdvocateEditDraft({
      constituentType: p.constituentType,
      participant: p.participant,
      role: p.role,
    });
  };
  const handleConfirmAdvocateEdit = () => {
    setAdvocateParticipants((prev) =>
      prev.map((p) =>
        p.id === advocateEditingId
          ? { ...p, ...advocateEditDraft }
          : p,
      ),
    );
    setAdvocateEditingId(null);
  };
  const handleCancelAdvocateEdit = () =>
    setAdvocateEditingId(null);

  const handleDeleteAdvocateParticipant = (id) => {
    setAdvocateParticipants((prev) =>
      prev.filter((p) => p.id !== id),
    );
    setAdvocateSelectedIds((prev) =>
      prev.filter((pid) => pid !== id),
    );
  };
  const handleSetAdvocateAttended = (id, value) => {
    setAdvocateParticipants((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              attended: value,
              reasonMissed:
                value === false ? p.reasonMissed : "",
              otherReason: value === false ? p.otherReason : "",
            }
          : p,
      ),
    );
  };
  const handleSetAdvocateReasonMissed = (id, value) => {
    setAdvocateParticipants((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              reasonMissed: value,
              otherReason:
                value === "Other" ? p.otherReason : "",
            }
          : p,
      ),
    );
  };
  const handleSetAdvocateOtherReason = (id, value) => {
    setAdvocateParticipants((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, otherReason: value } : p,
      ),
    );
  };
  const handleToggleAllAdvocateParticipants = (checked) => {
    setAdvocateSelectedIds(
      checked
        ? advocateParticipants
            .filter((p) => !p.isOrganizer)
            .map((p) => p.id)
        : [],
    );
  };
  const handleToggleAdvocateParticipant = (id, checked) => {
    setAdvocateSelectedIds((prev) =>
      checked
        ? [...prev, id]
        : prev.filter((pid) => pid !== id),
    );
  };

  // ── Advocate Meeting — Details tab (ported from ConnectionFormDialog/DetailsTabContent) ──
  const ADV_TODAY = "07/16/2026";
  const ADVOCATE_TREATMENT_TARGETS = [
    "Caregiver System Engagement",
    "Assessment & Psychoeducation",
    "Routines, Rituals, & Care Vision",
    "Calm (Caregiver Affect Management)",
    "Connect (Caregiver Attunement)",
    "Effective Caregiving Response",
    "Reflection (Affect Identification)",
    "Modulation",
    "Self-Discipline & Problem Solving (Executive Functions)",
    "Identity & Purpose",
    "Relational Engagement & Self Expression",
    "Resilience (Trauma Experience Integration)",
    "Resilience (Skill Coaching)",
  ];
  // Active-only goals (Complete goals excluded from the Add Goal picklist, matching ConnectionFormDialog AC25)
  const ADVOCATE_GOALS_OPTIONS = [
    "Improve emotional regulation",
    "Develop healthy coping strategies",
    "Build positive relationships with peers",
    "Enhance communication skills",
    "Increase self-awareness",
    "Manage anger appropriately",
  ];
  const ADVOCATE_COPING_SKILLS_OPTIONS = [
    "Deep breathing exercises",
    "Journaling",
    "Physical activity/exercise",
    "Talking to a trusted adult",
    "Listening to music",
    "Taking a break/timeout",
    "Progressive muscle relaxation",
  ];
  const ADVOCATE_TRIGGERS_OPTIONS = [
    "Loud noises",
    "Crowded spaces",
    "Academic pressure",
    "Peer conflict",
    "Authority figures",
    "Unstructured time",
    "Transitions between activities",
  ];
  const ADVOCATE_STRENGTHS_OPTIONS = [
    "Creative and artistic",
    "Good problem solver",
    "Empathetic toward others",
    "Strong athletic ability",
    "Leadership qualities",
    "Sense of humor",
    "Resilient and determined",
  ];

  const [advocateGoals, setAdvocateGoals] = useState<
    { id: number; goal: string; comments: string }[]
  >([]);
  const [advocateGoalModalOpen, setAdvocateGoalModalOpen] =
    useState(false);
  const [advocateGoalDraft, setAdvocateGoalDraft] = useState<{
    id: number | null;
    goal: string;
    comments: string;
  }>({ id: null, goal: "", comments: "" });
  const handleOpenAdvocateGoalModal = (goal?: {
    id: number;
    goal: string;
    comments: string;
  }) => {
    setAdvocateGoalDraft(
      goal
        ? {
            id: goal.id,
            goal: goal.goal,
            comments: goal.comments,
          }
        : { id: null, goal: "", comments: "" },
    );
    setAdvocateGoalModalOpen(true);
  };
  const handleSaveAdvocateGoal = () => {
    if (!advocateGoalDraft.goal) return;
    if (advocateGoalDraft.id) {
      setAdvocateGoals((prev) =>
        prev.map((g) =>
          g.id === advocateGoalDraft.id
            ? {
                id: g.id,
                goal: advocateGoalDraft.goal,
                comments: advocateGoalDraft.comments,
              }
            : g,
        ),
      );
    } else {
      setAdvocateGoals((prev) => [
        ...prev,
        {
          id: Date.now(),
          goal: advocateGoalDraft.goal,
          comments: advocateGoalDraft.comments,
        },
      ]);
    }
    setAdvocateGoalModalOpen(false);
  };
  const handleDeleteAdvocateGoal = (id: number) =>
    setAdvocateGoals((prev) => prev.filter((g) => g.id !== id));

  const [advocateMeetingSummary, setAdvocateMeetingSummary] =
    useState("");
  const [themesAddressedAdvocate, setThemesAddressedAdvocate] =
    useState("");
  const [
    selectedAdvocateTreatmentTargets,
    setSelectedAdvocateTreatmentTargets,
  ] = useState<string[]>([]);

  interface AdvNoteItem {
    id: number;
    label: string;
    dateReported: string;
    reportedBy: string;
    relationshipToYouth: string;
    description: string;
    effectiveWhen?: string;
  }
  const [advocateCopingSkills, setAdvocateCopingSkills] =
    useState<AdvNoteItem[]>([]);
  const [advocateTriggers, setAdvocateTriggers] = useState<
    AdvNoteItem[]
  >([]);
  const [advocateStrengths, setAdvocateStrengths] = useState<
    AdvNoteItem[]
  >([]);

  // Shared "edit details" modal for Coping Skills / Triggers / Strengths — same field shape across all three
  const [advDetailModalOpen, setAdvDetailModalOpen] =
    useState(false);
  const [advDetailModalKind, setAdvDetailModalKind] = useState<
    "coping" | "trigger" | "strength" | null
  >(null);
  const [advDetailModalItem, setAdvDetailModalItem] =
    useState<AdvNoteItem | null>(null);
  const [advDetailModalDraft, setAdvDetailModalDraft] =
    useState<{ description: string; effectiveWhen: string }>({
      description: "",
      effectiveWhen: "",
    });

  const advDetailListFor = (
    kind: "coping" | "trigger" | "strength",
  ) =>
    kind === "coping"
      ? ([
          advocateCopingSkills,
          setAdvocateCopingSkills,
        ] as const)
      : kind === "trigger"
        ? ([advocateTriggers, setAdvocateTriggers] as const)
        : ([advocateStrengths, setAdvocateStrengths] as const);

  const handleToggleAdvNote = (
    kind: "coping" | "trigger" | "strength",
    label: string,
    checked: boolean,
  ) => {
    const [list, setList] = advDetailListFor(kind);
    if (checked) {
      setList((prev: AdvNoteItem[]) => [
        ...prev,
        {
          id: Date.now(),
          label,
          dateReported: ADV_TODAY,
          reportedBy: "Sohan Jadhavrao",
          relationshipToYouth: "Advocate",
          description: "",
          ...(kind === "coping" ? { effectiveWhen: "" } : {}),
        },
      ]);
    } else {
      setList((prev: AdvNoteItem[]) =>
        prev.filter((i) => i.label !== label),
      );
    }
  };
  const handleOpenAdvDetailModal = (
    kind: "coping" | "trigger" | "strength",
    item: AdvNoteItem,
  ) => {
    setAdvDetailModalKind(kind);
    setAdvDetailModalItem(item);
    setAdvDetailModalDraft({
      description: item.description,
      effectiveWhen: item.effectiveWhen || "",
    });
    setAdvDetailModalOpen(true);
  };
  const handleSaveAdvDetailModal = () => {
    if (!advDetailModalKind || !advDetailModalItem) return;
    const [, setList] = advDetailListFor(advDetailModalKind);
    setList((prev: AdvNoteItem[]) =>
      prev.map((i) =>
        i.id === advDetailModalItem.id
          ? {
              ...i,
              description: advDetailModalDraft.description,
              ...(advDetailModalKind === "coping"
                ? {
                    effectiveWhen:
                      advDetailModalDraft.effectiveWhen,
                  }
                : {}),
            }
          : i,
      ),
    );
    setAdvDetailModalOpen(false);
  };
  const handleDeleteAdvNote = (
    kind: "coping" | "trigger" | "strength",
    id: number,
  ) => {
    const [, setList] = advDetailListFor(kind);
    setList((prev: AdvNoteItem[]) =>
      prev.filter((i) => i.id !== id),
    );
  };

  // ── Therapy Session — Details tab ──
  const [therapyGoals, setTherapyGoals] = useState<
    { id: number; goal: string; comments: string }[]
  >(
    ADVOCATE_GOALS_OPTIONS.slice(0, 3).map((g, i) => ({
      id: i + 1,
      goal: g,
      comments: "",
    })),
  );
  const [pdvMood, setPdvMood] = useState("");
  const [pdvAffect, setPdvAffect] = useState("");
  const [pdvBehavior, setPdvBehavior] = useState("");
  const [pdvThemesAddressed, setPdvThemesAddressed] =
    useState(""); // shared: Therapy Session / Parent Contact / Milieu Meeting (one type active at a time)
  const [pdvDescription, setPdvDescription] = useState("");
  const [pdvPlan, setPdvPlan] = useState("");
  const handleAddTherapyGoal = () =>
    setTherapyGoals((prev) => [
      ...prev,
      {
        id: Date.now(),
        goal: ADVOCATE_GOALS_OPTIONS[
          prev.length % ADVOCATE_GOALS_OPTIONS.length
        ],
        comments: "",
      },
    ]);
  const handleDeleteTherapyGoal = (id: number) =>
    setTherapyGoals((prev) => prev.filter((g) => g.id !== id));

  // ── Parent Contact — Details tab ──
  const [pdvContactSummary, setPdvContactSummary] =
    useState("");
  // Reuses selectedAdvocateTreatmentTargets / ADVOCATE_TREATMENT_TARGETS (only one connection type is being drafted at a time)

  // ── Milieu Meeting — Details tab ──
  // Reuses advocateMeetingSummary for "Meeting Summary"
  const [pdvParticipantNotes, setPdvParticipantNotes] =
    useState<
      Record<
        number,
        {
          notes: string;
          duration: string;
          interactionTypes: string[];
        }
      >
    >({});
  const [pdvNotesModalOpen, setPdvNotesModalOpen] =
    useState(false);
  const [
    pdvNotesModalParticipantId,
    setPdvNotesModalParticipantId,
  ] = useState<number | null>(null);
  const [pdvNotesModalDraft, setPdvNotesModalDraft] = useState<{
    notes: string;
    duration: string;
    interactionTypes: string[];
  }>({ notes: "", duration: "", interactionTypes: [] });
  const PDV_INTERACTION_TYPES = [
    "Lunch",
    "Food Donation",
    "Computer Access",
    "Rush Medical Visit",
  ];
  const handleOpenPdvNotesModal = (participantId: number) => {
    setPdvNotesModalParticipantId(participantId);
    setPdvNotesModalDraft(
      pdvParticipantNotes[participantId] || {
        notes: "",
        duration: "",
        interactionTypes: [],
      },
    );
    setPdvNotesModalOpen(true);
  };
  const handleSavePdvNotesModal = () => {
    if (pdvNotesModalParticipantId == null) return;
    setPdvParticipantNotes((prev) => ({
      ...prev,
      [pdvNotesModalParticipantId]: pdvNotesModalDraft,
    }));
    setPdvNotesModalOpen(false);
  };

  return (
    <>
      {/* Edit Program Log Entry Dialog */}
      <Dialog
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      >
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto rounded-[18px]">
          <DialogHeader>
            <DialogTitle
              className="text-lg font-semibold flex items-center gap-2"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              <Edit2 className="h-5 w-5 text-[var(--color-brand-primary)]" />
              Edit Program Log Entry
            </DialogTitle>
            <DialogDescription
              className="text-sm"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Update the details of this log entry. All fields
              marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Entry Type Selector */}
            <div className="space-y-1.5">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Log Type <span className="text-red-600">*</span>
              </Label>
              <Select
                value={editEntryLogType}
                onValueChange={setEditEntryLogType}
              >
                <SelectTrigger
                  className="w-full h-10"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  <SelectValue placeholder="Select log type" />
                </SelectTrigger>
                <SelectContent
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    boxShadow: "var(--slds-g-shadow-4)",
                  }}
                >
                  <SelectItem value="Therapy">
                    Therapy
                  </SelectItem>
                  <SelectItem value="Observation">
                    Observation
                  </SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Contact">
                    Contact
                  </SelectItem>
                  <SelectItem value="Medical">
                    Medical
                  </SelectItem>
                  <SelectItem value="Alert">Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date & Time Fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* Date Field */}
              <div className="space-y-2">
                <Label
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Date <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  />
                  <DateInput
                    value={isoToMdy(editEntryDate)}
                    onChange={(v) =>
                      ((e) => setEditEntryDate(e.target.value))(
                        { target: { value: mdyToIso(v) } },
                      )
                    }
                    className="pl-10 h-10"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  />
                </div>
              </div>

              {/* Time Field */}
              <div className="space-y-2">
                <Label
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Time <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <Clock
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  />
                  <Input
                    type="time"
                    value={editEntryTime}
                    onChange={(e) =>
                      setEditEntryTime(e.target.value)
                    }
                    className="pl-10 h-10"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Priority Level */}
            <div className="space-y-2">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Priority Level
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={
                    editEntryPriority === "Low"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className={cn(
                    "flex-1",
                    editEntryPriority === "Low" &&
                      "bg-green-600 hover:bg-green-700 text-white",
                  )}
                  onClick={() => setEditEntryPriority("Low")}
                >
                  Low
                </Button>
                <Button
                  type="button"
                  variant={
                    editEntryPriority === "Medium"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className={cn(
                    "flex-1",
                    editEntryPriority === "Medium" &&
                      "bg-orange-500 hover:bg-orange-600 text-white",
                  )}
                  onClick={() => setEditEntryPriority("Medium")}
                >
                  Medium
                </Button>
                <Button
                  type="button"
                  variant={
                    editEntryPriority === "High"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className={cn(
                    "flex-1",
                    editEntryPriority === "High" &&
                      "bg-red-600 hover:bg-red-700 text-white",
                  )}
                  onClick={() => setEditEntryPriority("High")}
                >
                  High Priority
                </Button>
              </div>
            </div>

            {/* Entry Content */}
            <div className="space-y-2">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Entry Content{" "}
                <span className="text-red-600">*</span>
              </Label>
              <textarea
                value={editEntryContent}
                onChange={(e) =>
                  setEditEntryContent(e.target.value)
                }
                placeholder="Enter detailed information about this log entry..."
                className="w-full min-h-[120px] px-3 py-2 rounded-md text-sm focus:outline-none resize-y"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                }}
                rows={6}
              />
              <div
                className="text-xs text-right"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {editEntryContent.length} characters
              </div>
            </div>

            {/* Associates - Three Dropdowns: Youth, Program Team, Other */}
            <div className="space-y-4">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Associate Individuals (Optional)
              </Label>

              {/* Youth Dropdown */}
              <div className="space-y-2">
                <Label
                  className="text-xs font-medium"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Youth
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between h-10 rounded-md"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      <span
                        style={{
                          color:
                            editEntryYouth.length === 0
                              ? "var(--slds-g-color-text-placeholder)"
                              : "var(--slds-g-color-text-default)",
                        }}
                      >
                        {editEntryYouth.length === 0
                          ? "Select youth..."
                          : `${editEntryYouth.length} youth selected`}
                      </span>
                      <ChevronDown
                        className="h-4 w-4"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[400px] p-0"
                    align="start"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      boxShadow: "var(--slds-g-shadow-4)",
                    }}
                  >
                    {/* Search Input */}
                    <div
                      className="p-3 border-b"
                      style={{
                        borderColor:
                          "var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <div className="relative">
                        <Search
                          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        />
                        <Input
                          type="text"
                          placeholder="Search youth..."
                          value={youthSearchQuery}
                          onChange={(e) =>
                            setYouthSearchQuery(e.target.value)
                          }
                          className="pl-9 h-9 text-sm"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        />
                      </div>
                    </div>

                    <div className="max-h-[280px] overflow-y-auto">
                      <div className="p-2 space-y-1">
                        {YOUTH_STATUS.filter(
                          (youth) =>
                            youth.name
                              .toLowerCase()
                              .includes(
                                youthSearchQuery.toLowerCase(),
                              ) ||
                            youth.program
                              .toLowerCase()
                              .includes(
                                youthSearchQuery.toLowerCase(),
                              ),
                        ).map((youth) => (
                          <div
                            key={youth.id}
                            className="flex items-center space-x-3 p-2 rounded-md cursor-pointer"
                            style={{
                              backgroundColor:
                                editEntryYouth.includes(
                                  youth.name,
                                )
                                  ? "var(--slds-g-color-background-selection)"
                                  : "transparent",
                            }}
                            onMouseEnter={(e) => {
                              if (
                                !editEntryYouth.includes(
                                  youth.name,
                                )
                              ) {
                                e.currentTarget.style.backgroundColor =
                                  "var(--slds-g-color-background-row-hover)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (
                                !editEntryYouth.includes(
                                  youth.name,
                                )
                              ) {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }
                            }}
                            onClick={() => {
                              setEditEntryYouth((prev) =>
                                prev.includes(youth.name)
                                  ? prev.filter(
                                      (y) => y !== youth.name,
                                    )
                                  : [...prev, youth.name],
                              );
                            }}
                          >
                            <Checkbox
                              surface="base"
                              checked={editEntryYouth.includes(
                                youth.name,
                              )}
                              onCheckedChange={() => {}}
                              className="h-4 w-4"
                            />
                            <Avatar className="h-7 w-7">
                              <AvatarFallback
                                className={cn(
                                  "text-xs text-white font-semibold",
                                  youth.name ===
                                    "Kermit the Frog" &&
                                    "bg-green-500",
                                  youth.name === "Miss Piggy" &&
                                    "bg-pink-500",
                                  youth.name ===
                                    "Fozzie Bear" &&
                                    "bg-orange-500",
                                  youth.name ===
                                    "Red Fraggle" &&
                                    "bg-red-500",
                                  youth.name ===
                                    "Gonzo the Great" &&
                                    "bg-blue-500",
                                  youth.name === "Animal" &&
                                    "bg-purple-500",
                                  youth.name === "Scooter" &&
                                    "bg-teal-500",
                                  youth.name ===
                                    "Rowlf the Dog" &&
                                    "bg-amber-600",
                                  youth.name ===
                                    "Rizzo the Rat" &&
                                    "bg-indigo-500",
                                  youth.name ===
                                    "Pepe the Prawn" &&
                                    "bg-rose-500",
                                )}
                              >
                                {youth.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div
                                className="text-sm"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                {youth.name}
                              </div>
                              <div
                                className="text-xs"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                {youth.program}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                {editEntryYouth.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editEntryYouth.map((youthName) => (
                      <Badge
                        key={youthName}
                        variant="secondary"
                        className="pl-2 pr-1 py-1 rounded-full"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-alt)",
                          color:
                            "var(--slds-g-color-text-default)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        {youthName}
                        <button
                          type="button"
                          onClick={() =>
                            setEditEntryYouth((prev) =>
                              prev.filter(
                                (y) => y !== youthName,
                              ),
                            )
                          }
                          className="ml-1 rounded-full p-0.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "var(--slds-g-color-background-row-hover)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Program Team Dropdown */}
              <div className="space-y-2">
                <Label
                  className="text-xs font-medium"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Program Team
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between h-10 rounded-md"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      <span
                        style={{
                          color:
                            editEntryProgramTeam.length === 0
                              ? "var(--slds-g-color-text-placeholder)"
                              : "var(--slds-g-color-text-default)",
                        }}
                      >
                        {editEntryProgramTeam.length === 0
                          ? "Select team members..."
                          : `${editEntryProgramTeam.length} team members selected`}
                      </span>
                      <ChevronDown
                        className="h-4 w-4"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[400px] p-0"
                    align="start"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      boxShadow: "var(--slds-g-shadow-4)",
                    }}
                  >
                    {/* Search Input */}
                    <div
                      className="p-3 border-b"
                      style={{
                        borderColor:
                          "var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <div className="relative">
                        <Search
                          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        />
                        <Input
                          type="text"
                          placeholder="Search team members..."
                          value={programTeamSearchQuery}
                          onChange={(e) =>
                            setProgramTeamSearchQuery(
                              e.target.value,
                            )
                          }
                          className="pl-9 h-9 text-sm"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        />
                      </div>
                    </div>

                    <div className="max-h-[280px] overflow-y-auto">
                      <div className="p-2 space-y-1">
                        {PROGRAM_TEAM.filter(
                          (member) =>
                            member.name
                              .toLowerCase()
                              .includes(
                                programTeamSearchQuery.toLowerCase(),
                              ) ||
                            member.role
                              .toLowerCase()
                              .includes(
                                programTeamSearchQuery.toLowerCase(),
                              ) ||
                            member.department
                              .toLowerCase()
                              .includes(
                                programTeamSearchQuery.toLowerCase(),
                              ),
                        ).map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center space-x-3 p-2 rounded-md cursor-pointer"
                            style={{
                              backgroundColor:
                                editEntryProgramTeam.includes(
                                  member.name,
                                )
                                  ? "var(--slds-g-color-background-selection)"
                                  : "transparent",
                            }}
                            onMouseEnter={(e) => {
                              if (
                                !editEntryProgramTeam.includes(
                                  member.name,
                                )
                              ) {
                                e.currentTarget.style.backgroundColor =
                                  "var(--slds-g-color-background-row-hover)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (
                                !editEntryProgramTeam.includes(
                                  member.name,
                                )
                              ) {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }
                            }}
                            onClick={() => {
                              setEditEntryProgramTeam((prev) =>
                                prev.includes(member.name)
                                  ? prev.filter(
                                      (m) => m !== member.name,
                                    )
                                  : [...prev, member.name],
                              );
                            }}
                          >
                            <Checkbox
                              surface="base"
                              checked={editEntryProgramTeam.includes(
                                member.name,
                              )}
                              onCheckedChange={() => {}}
                              className="h-4 w-4"
                            />
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="text-xs bg-[var(--color-brand-primary)] text-white font-semibold">
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div
                                className="text-sm"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                {member.name}
                              </div>
                              <div
                                className="text-xs"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                {member.role}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                {editEntryProgramTeam.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editEntryProgramTeam.map((teamName) => (
                      <Badge
                        key={teamName}
                        variant="secondary"
                        className="pl-2 pr-1 py-1 rounded-full"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-brand-primary-lighter)",
                          color: "var(--color-brand-primary)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        {teamName}
                        <button
                          type="button"
                          onClick={() =>
                            setEditEntryProgramTeam((prev) =>
                              prev.filter(
                                (m) => m !== teamName,
                              ),
                            )
                          }
                          className="ml-1 rounded-full p-0.5"
                          style={{
                            color: "var(--color-brand-primary)",
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "var(--slds-g-color-background-row-hover)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Other Individuals Dropdown */}
              <div className="space-y-2">
                <Label
                  className="text-xs font-medium"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Other
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between h-10 rounded-md"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      <span
                        style={{
                          color:
                            editEntryOther.length === 0
                              ? "var(--slds-g-color-text-placeholder)"
                              : "var(--slds-g-color-text-default)",
                        }}
                      >
                        {editEntryOther.length === 0
                          ? "Select individuals..."
                          : `${editEntryOther.length} individuals selected`}
                      </span>
                      <ChevronDown
                        className="h-4 w-4"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[400px] p-0"
                    align="start"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      boxShadow: "var(--slds-g-shadow-4)",
                    }}
                  >
                    {/* Search Input */}
                    <div
                      className="p-3 border-b"
                      style={{
                        borderColor:
                          "var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <div className="relative">
                        <Search
                          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        />
                        <Input
                          type="text"
                          placeholder="Search individuals..."
                          value={otherSearchQuery}
                          onChange={(e) =>
                            setOtherSearchQuery(e.target.value)
                          }
                          className="pl-9 h-9 text-sm"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        />
                      </div>
                    </div>

                    <div className="max-h-[280px] overflow-y-auto">
                      <div className="p-2 space-y-1">
                        {OTHER_INDIVIDUALS.filter(
                          (individual) =>
                            individual.name
                              .toLowerCase()
                              .includes(
                                otherSearchQuery.toLowerCase(),
                              ) ||
                            individual.category
                              .toLowerCase()
                              .includes(
                                otherSearchQuery.toLowerCase(),
                              ),
                        ).map((individual) => (
                          <div
                            key={individual.id}
                            className="flex items-center space-x-3 p-2 rounded-md cursor-pointer"
                            style={{
                              backgroundColor:
                                editEntryOther.includes(
                                  individual.name,
                                )
                                  ? "var(--slds-g-color-background-selection)"
                                  : "transparent",
                            }}
                            onMouseEnter={(e) => {
                              if (
                                !editEntryOther.includes(
                                  individual.name,
                                )
                              ) {
                                e.currentTarget.style.backgroundColor =
                                  "var(--slds-g-color-background-row-hover)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (
                                !editEntryOther.includes(
                                  individual.name,
                                )
                              ) {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }
                            }}
                            onClick={() => {
                              setEditEntryOther((prev) =>
                                prev.includes(individual.name)
                                  ? prev.filter(
                                      (i) =>
                                        i !== individual.name,
                                    )
                                  : [...prev, individual.name],
                              );
                            }}
                          >
                            <Checkbox
                              surface="base"
                              checked={editEntryOther.includes(
                                individual.name,
                              )}
                              onCheckedChange={() => {}}
                              className="h-4 w-4"
                            />
                            <div
                              className="h-7 w-7 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-warning-lighter)",
                                color:
                                  "var(--slds-g-color-text-warning)",
                              }}
                            >
                              <User className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div
                                className="text-sm"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                {individual.name}
                              </div>
                              <div
                                className="text-xs"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                {individual.category}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                {editEntryOther.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editEntryOther.map((individualName) => (
                      <Badge
                        key={individualName}
                        variant="secondary"
                        className="pl-2 pr-1 py-1 rounded-full"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-warning-lighter)",
                          color:
                            "var(--slds-g-color-text-warning)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        {individualName}
                        <button
                          type="button"
                          onClick={() =>
                            setEditEntryOther((prev) =>
                              prev.filter(
                                (i) => i !== individualName,
                              ),
                            )
                          }
                          className="ml-1 rounded-full p-0.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-warning)",
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "var(--slds-g-color-background-row-hover)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Tags (Optional)
              </Label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Progress",
                  "Follow-up Required",
                  "Milestone",
                  "Concern",
                  "Family Contact",
                  "Educational",
                  "Therapeutic",
                  "Social",
                ].map((tag) => (
                  <Badge
                    key={tag}
                    variant={
                      editEntryTags.includes(tag)
                        ? "default"
                        : "outline"
                    }
                    className={cn(
                      "cursor-pointer transition-colors",
                      editEntryTags.includes(tag)
                        ? "bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90"
                        : "",
                    )}
                    style={
                      !editEntryTags.includes(tag)
                        ? {
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                            color:
                              "var(--slds-g-color-text-default)",
                          }
                        : {}
                    }
                    onClick={() => {
                      setEditEntryTags((prev) =>
                        prev.includes(tag)
                          ? prev.filter((t) => t !== tag)
                          : [...prev, tag],
                      );
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              {editEntryTags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {editEntryTags.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-[var(--color-brand-primary)] text-white text-xs"
                    >
                      {tag}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => {
                          setEditEntryTags((prev) =>
                            prev.filter((t) => t !== tag),
                          );
                        }}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Auto-save indicator */}
            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>
                Changes will be saved with current timestamp
              </span>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={handleCancelEditEntry}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90"
              onClick={handleSaveEditedEntry}
              disabled={
                !editEntryContent.trim() || !editEntryLogType
              }
            >
              <Check className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Connections Dialog */}
      <Dialog
        open={connectionsOpen}
        onOpenChange={setConnectionsOpen}
      >
        <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle
              className="text-lg font-semibold flex items-center gap-2"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              <Users className="h-5 w-5 text-[var(--color-brand-primary)]" />
              {connectionType
                ? `New Connection - ${connectionType}`
                : "New Connection"}
            </DialogTitle>
            <DialogDescription
              className="text-sm"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Log a new connection entry. Select the type of
              connection and provide relevant details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* AC12-19: Connection Type Routing - Display Corresponding Connection Page */}
            {connectionType && (
              <div>
                {/* Connection / Details Tabs (matches ConnectionFormDialog) */}
                <div
                  className="flex overflow-x-auto overflow-y-hidden border-b mb-4"
                  style={{
                    borderBottomColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setPdvConnActiveTab("connection")
                    }
                    className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                      pdvConnActiveTab === "connection"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:text-[#080707]"
                    }`}
                    style={
                      pdvConnActiveTab === "connection"
                        ? {
                            borderBottom: "3px solid #145F33",
                            marginBottom: "-1px",
                          }
                        : {}
                    }
                  >
                    Connection
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPdvConnActiveTab("details")
                    }
                    className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                      pdvConnActiveTab === "details"
                        ? "text-[#145F33]"
                        : "text-[#706e6b] hover:text-[#080707]"
                    }`}
                    style={
                      pdvConnActiveTab === "details"
                        ? {
                            borderBottom: "3px solid #145F33",
                            marginBottom: "-1px",
                          }
                        : {}
                    }
                  >
                    Details
                  </button>
                </div>

                {pdvConnActiveTab === "connection" && (
                  <div className="">
                    {/* AC7-11: Connection Type Selection (Required) */}
                    <div className="space-y-2 pb-4">
                      <Label
                        className="text-xs font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        CONNECTION TYPE{" "}
                        <span className="text-red-600">*</span>
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          {
                            value: "Advocate Meeting",
                            icon: Briefcase,
                            color: "text-blue-600",
                            bgColor: "bg-blue-50",
                            borderColor: "border-blue-200",
                          },
                          {
                            value: "Therapy Session",
                            icon: Stethoscope,
                            color: "text-green-600",
                            bgColor: "bg-green-50",
                            borderColor: "border-green-200",
                          },
                          {
                            value: "Parent Contact",
                            icon: User,
                            color: "text-purple-600",
                            bgColor: "bg-purple-50",
                            borderColor: "border-purple-200",
                          },
                          {
                            value: "Milieu Meeting",
                            icon: Users,
                            color: "text-indigo-600",
                            bgColor: "bg-indigo-50",
                            borderColor: "border-indigo-200",
                          },
                        ].map((type) => {
                          const Icon = type.icon;
                          const isSelected =
                            connectionType === type.value;
                          return (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() =>
                                setConnectionType(type.value)
                              }
                              className={cn(
                                "flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left",
                                isSelected
                                  ? `${type.borderColor} ${type.bgColor} shadow-sm`
                                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
                              )}
                            >
                              <Icon
                                className={cn(
                                  "h-5 w-5",
                                  isSelected
                                    ? type.color
                                    : "text-gray-400",
                                )}
                              />
                              <span
                                className={cn(
                                  "text-sm",
                                  isSelected
                                    ? "font-semibold"
                                    : "",
                                )}
                                style={{
                                  color: isSelected
                                    ? "var(--slds-g-color-text-default)"
                                    : "var(--slds-g-color-text-weak)",
                                }}
                              >
                                {type.value}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {/* END AC7-11: Connection Type Selection (Required) */}

                    {[
                      "Advocate Meeting",
                      "Therapy Session",
                      "Parent Contact",
                      "Milieu Meeting",
                    ].includes(connectionType) ? (
                      <div className="space-y-4">
                        {/* Session Type & Variant — Therapy Session only */}
                        {connectionType ===
                          "Therapy Session" && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label
                                className="text-xs font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                SESSION TYPE{" "}
                                <span className="text-red-600">
                                  *
                                </span>
                              </Label>
                              <Select
                                value={pdvSessionType}
                                onValueChange={
                                  setPdvSessionType
                                }
                              >
                                <SelectTrigger
                                  surface="base"
                                  className="h-9"
                                  style={{
                                    borderColor:
                                      "var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  <SelectValue placeholder="Please Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    "Contract",
                                    "External",
                                    "Program",
                                  ].map((opt) => (
                                    <SelectItem
                                      key={opt}
                                      value={opt}
                                    >
                                      {opt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label
                                className="text-xs font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                THERAPY SESSION VARIANT{" "}
                                <span className="text-red-600">
                                  *
                                </span>
                              </Label>
                              <Select
                                value={pdvSessionVariant}
                                onValueChange={
                                  setPdvSessionVariant
                                }
                              >
                                <SelectTrigger
                                  surface="base"
                                  className="h-9"
                                  style={{
                                    borderColor:
                                      "var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  <SelectValue placeholder="Please Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    "Individual",
                                    "Group",
                                    "Family",
                                  ].map((opt) => (
                                    <SelectItem
                                      key={opt}
                                      value={opt}
                                    >
                                      {opt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}

                        {/* Start Date & Time / End Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label
                              className="text-xs font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              START DATE{" "}
                              <span className="text-red-600">
                                *
                              </span>
                            </Label>
                            <DateInput
                              value={advocateStartDate}
                              onChange={setAdvocateStartDate}
                              style={{
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                              }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              className="text-xs font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              START TIME{" "}
                              <span className="text-red-600">
                                *
                              </span>
                            </Label>
                            <TimeInput
                              surface="base"
                              value={advocateStartTime}
                              onChange={setAdvocateStartTime}
                              style={{
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                              }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              className="text-xs font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              END DATE{" "}
                              <span className="text-red-600">
                                *
                              </span>
                            </Label>
                            <DateInput
                              value={advocateEndDate}
                              onChange={setAdvocateEndDate}
                              style={{
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                              }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              className="text-xs font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              END TIME{" "}
                              <span className="text-red-600">
                                *
                              </span>
                            </Label>
                            <TimeInput
                              surface="base"
                              value={advocateEndTime}
                              onChange={setAdvocateEndTime}
                              placeholder="hh:mm AM/PM"
                              style={{
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                              }}
                            />
                          </div>
                        </div>

                        {/* Status & Location */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label
                              className="text-xs font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              LOCATION
                            </Label>
                            <Select
                              value={advocateLocation}
                              onValueChange={
                                setAdvocateLocation
                              }
                            >
                              <SelectTrigger
                                surface="base"
                                className="h-9"
                                style={{
                                  borderColor:
                                    "var(--slds-g-color-border-base-1)",
                                }}
                              >
                                <SelectValue placeholder="Please Select" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[280px] overflow-y-auto">
                                {ADVOCATE_LOCATION_OPTIONS.map(
                                  (opt) => (
                                    <SelectItem
                                      key={opt}
                                      value={opt}
                                    >
                                      {opt}
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              className="text-xs font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              STATUS{" "}
                              <span className="text-red-600">
                                *
                              </span>
                            </Label>
                            <Select
                              value={advocateStatus}
                              onValueChange={setAdvocateStatus}
                            >
                              <SelectTrigger
                                surface="base"
                                className="h-9"
                                style={{
                                  borderColor:
                                    "var(--slds-g-color-border-base-1)",
                                }}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[
                                  "Scheduled",
                                  "Incomplete",
                                  "Submitted/Finalized",
                                  "Cancelled",
                                ].map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Checkboxes */}
                        <div className="flex items-center gap-6 flex-wrap">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              surface="base"
                              id="advServiceCoordination"
                              checked={
                                advocateServiceCoordination
                              }
                              onCheckedChange={(checked) =>
                                setAdvocateServiceCoordination(
                                  checked === true,
                                )
                              }
                            />
                            <label
                              htmlFor="advServiceCoordination"
                              className="text-sm cursor-pointer"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              Transition Related
                            </label>
                          </div>
                        </div>

                        {/* Participants */}
                        <div
                          className="space-y-3 pt-4 border-t"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <h3
                              className="text-sm font-semibold flex items-center gap-2"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              <Users className="h-4 w-4" />
                              Participants
                            </h3>
                            <Button
                              type="button"
                              onClick={handleStartAdvocateAdd}
                              disabled={advocateIsAdding}
                              className="rounded-full h-8 px-3 text-xs font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white"
                            >
                              <Plus className="h-3.5 w-3.5 mr-1.5" />
                              Add Participant
                            </Button>
                          </div>

                          <div
                            className="border rounded-lg overflow-hidden"
                            style={{
                              borderColor:
                                "var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[900px]">
                                <thead
                                  style={{
                                    backgroundColor:
                                      "var(--slds-g-color-background-alt)",
                                  }}
                                >
                                  <tr>
                                    <th
                                      className="px-3 py-2.5 text-center"
                                      style={{ width: "40px" }}
                                    >
                                      <Checkbox
                                        surface="base"
                                        checked={
                                          advocateSelectedIds.length >
                                            0 &&
                                          advocateSelectedIds.length ===
                                            advocateParticipants.filter(
                                              (p) =>
                                                !p.isOrganizer,
                                            ).length
                                        }
                                        onCheckedChange={(
                                          checked,
                                        ) =>
                                          handleToggleAllAdvocateParticipants(
                                            checked === true,
                                          )
                                        }
                                      />
                                    </th>
                                    <th
                                      className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      Type
                                    </th>
                                    <th
                                      className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      Participant
                                    </th>
                                    <th
                                      className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      Role
                                    </th>
                                    <th
                                      className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      Organizer
                                    </th>
                                    <th
                                      className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      Attended
                                    </th>
                                    <th
                                      className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      Reason Missed
                                    </th>
                                    <th
                                      className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      Other Reason
                                    </th>
                                    <th
                                      className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody
                                  className="divide-y"
                                  style={{
                                    borderColor:
                                      "var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  {advocateIsAdding && (
                                    <tr
                                      style={{
                                        backgroundColor:
                                          "#f0faf4",
                                      }}
                                    >
                                      <td className="px-3 py-2 text-center">
                                        —
                                      </td>
                                      <td className="px-3 py-2">
                                        <Select
                                          value={
                                            advocateAddDraft.constituentType
                                          }
                                          onValueChange={(
                                            val,
                                          ) =>
                                            setAdvocateAddDraft(
                                              {
                                                ...advocateAddDraft,
                                                constituentType:
                                                  val,
                                                role: "",
                                              },
                                            )
                                          }
                                        >
                                          <SelectTrigger
                                            surface="base"
                                            className="h-8 text-xs"
                                          >
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="Constituent">
                                              Constituent
                                            </SelectItem>
                                            <SelectItem value="Non-Constituent">
                                              Non-Constituent
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </td>
                                      <td className="px-3 py-2">
                                        {advocateAddDraft.constituentType ===
                                        "Constituent" ? (
                                          <Select
                                            value={
                                              advocateAddDraft.participant
                                            }
                                            onValueChange={(
                                              val,
                                            ) =>
                                              setAdvocateAddDraft(
                                                {
                                                  ...advocateAddDraft,
                                                  participant:
                                                    val,
                                                },
                                              )
                                            }
                                          >
                                            <SelectTrigger
                                              surface="base"
                                              className="h-8 text-xs"
                                            >
                                              <SelectValue placeholder="Select..." />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[200px] overflow-y-auto">
                                              {ADVOCATE_PARTICIPANT_OPTIONS.map(
                                                (p) => (
                                                  <SelectItem
                                                    key={p}
                                                    value={p}
                                                  >
                                                    {p}
                                                  </SelectItem>
                                                ),
                                              )}
                                            </SelectContent>
                                          </Select>
                                        ) : (
                                          <Input
                                            surface="base"
                                            value={
                                              advocateAddDraft.participant
                                            }
                                            onChange={(e) =>
                                              setAdvocateAddDraft(
                                                {
                                                  ...advocateAddDraft,
                                                  participant:
                                                    e.target
                                                      .value,
                                                },
                                              )
                                            }
                                            className="h-8 text-xs"
                                            placeholder="Enter name..."
                                          />
                                        )}
                                      </td>
                                      <td className="px-3 py-2">
                                        <Select
                                          value={
                                            advocateAddDraft.role
                                          }
                                          onValueChange={(
                                            val,
                                          ) =>
                                            setAdvocateAddDraft(
                                              {
                                                ...advocateAddDraft,
                                                role: val,
                                              },
                                            )
                                          }
                                        >
                                          <SelectTrigger
                                            surface="base"
                                            className="h-8 text-xs"
                                          >
                                            <SelectValue placeholder="Role" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {(advocateAddDraft.constituentType ===
                                            "Constituent"
                                              ? ADVOCATE_CONSTITUENT_ROLES
                                              : ADVOCATE_NON_CONSTITUENT_ROLES
                                            ).map((role) => (
                                              <SelectItem
                                                key={role}
                                                value={role}
                                              >
                                                {role}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        —
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        —
                                      </td>
                                      <td className="px-3 py-2">
                                        —
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        —
                                      </td>
                                      <td className="px-3 py-2 text-right">
                                        <div className="flex justify-end gap-1">
                                          <button
                                            type="button"
                                            onClick={
                                              handleConfirmAdvocateAdd
                                            }
                                            className="p-1.5 rounded hover:bg-[#d8ecfe]"
                                            title="Save"
                                          >
                                            <Check
                                              className="h-4 w-4"
                                              style={{
                                                color:
                                                  "#145F33",
                                              }}
                                            />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={
                                              handleCancelAdvocateAdd
                                            }
                                            className="p-1.5 rounded hover:bg-[#fef3f2]"
                                            title="Cancel"
                                          >
                                            <X
                                              className="h-4 w-4"
                                              style={{
                                                color:
                                                  "#c23934",
                                              }}
                                            />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                  {advocateParticipants.map(
                                    (p) =>
                                      advocateEditingId ===
                                      p.id ? (
                                        <tr
                                          key={p.id}
                                          style={{
                                            backgroundColor:
                                              "#f0faf4",
                                          }}
                                        >
                                          <td className="px-3 py-2 text-center">
                                            —
                                          </td>
                                          <td className="px-3 py-2">
                                            <Select
                                              value={
                                                advocateEditDraft.constituentType
                                              }
                                              onValueChange={(
                                                val,
                                              ) =>
                                                setAdvocateEditDraft(
                                                  {
                                                    ...advocateEditDraft,
                                                    constituentType:
                                                      val,
                                                    role: "",
                                                  },
                                                )
                                              }
                                            >
                                              <SelectTrigger
                                                surface="base"
                                                className="h-8 text-xs"
                                              >
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="Constituent">
                                                  Constituent
                                                </SelectItem>
                                                <SelectItem value="Non-Constituent">
                                                  Non-Constituent
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </td>
                                          <td className="px-3 py-2">
                                            {advocateEditDraft.constituentType ===
                                            "Constituent" ? (
                                              <Select
                                                value={
                                                  advocateEditDraft.participant
                                                }
                                                onValueChange={(
                                                  val,
                                                ) =>
                                                  setAdvocateEditDraft(
                                                    {
                                                      ...advocateEditDraft,
                                                      participant:
                                                        val,
                                                    },
                                                  )
                                                }
                                              >
                                                <SelectTrigger
                                                  surface="base"
                                                  className="h-8 text-xs"
                                                >
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[200px] overflow-y-auto">
                                                  {ADVOCATE_PARTICIPANT_OPTIONS.map(
                                                    (opt) => (
                                                      <SelectItem
                                                        key={
                                                          opt
                                                        }
                                                        value={
                                                          opt
                                                        }
                                                      >
                                                        {opt}
                                                      </SelectItem>
                                                    ),
                                                  )}
                                                </SelectContent>
                                              </Select>
                                            ) : (
                                              <Input
                                                surface="base"
                                                value={
                                                  advocateEditDraft.participant
                                                }
                                                onChange={(e) =>
                                                  setAdvocateEditDraft(
                                                    {
                                                      ...advocateEditDraft,
                                                      participant:
                                                        e.target
                                                          .value,
                                                    },
                                                  )
                                                }
                                                className="h-8 text-xs"
                                              />
                                            )}
                                          </td>
                                          <td className="px-3 py-2">
                                            <Select
                                              value={
                                                advocateEditDraft.role
                                              }
                                              onValueChange={(
                                                val,
                                              ) =>
                                                setAdvocateEditDraft(
                                                  {
                                                    ...advocateEditDraft,
                                                    role: val,
                                                  },
                                                )
                                              }
                                            >
                                              <SelectTrigger
                                                surface="base"
                                                className="h-8 text-xs"
                                              >
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {(advocateEditDraft.constituentType ===
                                                "Constituent"
                                                  ? ADVOCATE_CONSTITUENT_ROLES
                                                  : ADVOCATE_NON_CONSTITUENT_ROLES
                                                ).map(
                                                  (role) => (
                                                    <SelectItem
                                                      key={role}
                                                      value={
                                                        role
                                                      }
                                                    >
                                                      {role}
                                                    </SelectItem>
                                                  ),
                                                )}
                                              </SelectContent>
                                            </Select>
                                          </td>
                                          <td className="px-3 py-2 text-center">
                                            <Checkbox
                                              checked={
                                                p.isOrganizer
                                              }
                                              disabled
                                            />
                                          </td>
                                          <td className="px-3 py-2 text-center">
                                            —
                                          </td>
                                          <td className="px-3 py-2">
                                            —
                                          </td>
                                          <td className="px-3 py-2 text-center">
                                            —
                                          </td>
                                          <td className="px-3 py-2 text-right">
                                            <div className="flex justify-end gap-1">
                                              <button
                                                type="button"
                                                onClick={
                                                  handleConfirmAdvocateEdit
                                                }
                                                className="p-1.5 rounded hover:bg-[#d8ecfe]"
                                                title="Save"
                                              >
                                                <Check
                                                  className="h-4 w-4"
                                                  style={{
                                                    color:
                                                      "#145F33",
                                                  }}
                                                />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={
                                                  handleCancelAdvocateEdit
                                                }
                                                className="p-1.5 rounded hover:bg-[#fef3f2]"
                                                title="Cancel"
                                              >
                                                <X
                                                  className="h-4 w-4"
                                                  style={{
                                                    color:
                                                      "#c23934",
                                                  }}
                                                />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ) : (
                                        <tr key={p.id}>
                                          <td className="px-3 py-2 text-center">
                                            {!p.isOrganizer && (
                                              <Checkbox
                                                surface="base"
                                                checked={advocateSelectedIds.includes(
                                                  p.id,
                                                )}
                                                onCheckedChange={(
                                                  checked,
                                                ) =>
                                                  handleToggleAdvocateParticipant(
                                                    p.id,
                                                    checked ===
                                                      true,
                                                  )
                                                }
                                              />
                                            )}
                                          </td>
                                          <td
                                            className="px-3 py-2 text-sm"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                            }}
                                          >
                                            {p.constituentType}
                                          </td>
                                          <td
                                            className="px-3 py-2 text-sm font-medium"
                                            style={{
                                              color: "#0176d3",
                                            }}
                                          >
                                            {p.participant}
                                          </td>
                                          <td
                                            className="px-3 py-2 text-sm"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                            }}
                                          >
                                            {p.role}
                                          </td>
                                          <td className="px-3 py-2 text-center">
                                            <Checkbox
                                              checked={
                                                p.isOrganizer
                                              }
                                              disabled
                                              className={
                                                p.isOrganizer
                                                  ? "data-[state=checked]:bg-[#145F33]"
                                                  : ""
                                              }
                                            />
                                          </td>
                                          <td className="px-3 py-2 text-center">
                                            <Select
                                              value={
                                                p.attended ===
                                                null
                                                  ? "null"
                                                  : p.attended
                                                    ? "yes"
                                                    : "no"
                                              }
                                              onValueChange={(
                                                val,
                                              ) =>
                                                handleSetAdvocateAttended(
                                                  p.id,
                                                  val === "null"
                                                    ? null
                                                    : val ===
                                                        "yes",
                                                )
                                              }
                                            >
                                              <SelectTrigger
                                                surface="base"
                                                className="h-8 w-20 text-xs mx-auto"
                                              >
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="null">
                                                  —
                                                </SelectItem>
                                                <SelectItem value="yes">
                                                  Yes
                                                </SelectItem>
                                                <SelectItem value="no">
                                                  No
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </td>
                                          <td className="px-3 py-2">
                                            {p.attended ===
                                            false ? (
                                              <Select
                                                value={
                                                  p.reasonMissed
                                                }
                                                onValueChange={(
                                                  val,
                                                ) =>
                                                  handleSetAdvocateReasonMissed(
                                                    p.id,
                                                    val,
                                                  )
                                                }
                                              >
                                                <SelectTrigger
                                                  surface="base"
                                                  className="h-8 text-xs"
                                                >
                                                  <SelectValue placeholder="Select..." />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[200px] overflow-y-auto">
                                                  {ADVOCATE_REASON_MISSED_OPTIONS.map(
                                                    (r) => (
                                                      <SelectItem
                                                        key={r}
                                                        value={
                                                          r
                                                        }
                                                      >
                                                        {r}
                                                      </SelectItem>
                                                    ),
                                                  )}
                                                </SelectContent>
                                              </Select>
                                            ) : (
                                              <span
                                                className="text-sm"
                                                style={{
                                                  color:
                                                    "var(--slds-g-color-text-weak)",
                                                }}
                                              >
                                                —
                                              </span>
                                            )}
                                          </td>
                                          <td className="px-3 py-2 text-center">
                                            {p.reasonMissed ===
                                            "Other" ? (
                                              <Input
                                                surface="base"
                                                value={
                                                  p.otherReason
                                                }
                                                onChange={(e) =>
                                                  handleSetAdvocateOtherReason(
                                                    p.id,
                                                    e.target
                                                      .value,
                                                  )
                                                }
                                                className="h-8 text-xs"
                                                placeholder="Specify..."
                                              />
                                            ) : (
                                              <span
                                                className="text-sm"
                                                style={{
                                                  color:
                                                    "var(--slds-g-color-text-weak)",
                                                }}
                                              >
                                                —
                                              </span>
                                            )}
                                          </td>
                                          <td className="px-3 py-2 text-right">
                                            <div className="flex justify-end gap-1">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleStartAdvocateEdit(
                                                    p,
                                                  )
                                                }
                                                className="p-1.5 rounded hover:bg-[#f3f2f2]"
                                                title="Edit"
                                              >
                                                <Pencil
                                                  className="h-4 w-4"
                                                  style={{
                                                    color:
                                                      "var(--slds-g-color-text-weak)",
                                                  }}
                                                />
                                              </button>
                                              {!p.isOrganizer && (
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    handleDeleteAdvocateParticipant(
                                                      p.id,
                                                    )
                                                  }
                                                  className="p-1.5 rounded hover:bg-[#fef3f2]"
                                                  title="Delete"
                                                >
                                                  <Trash2
                                                    className="h-4 w-4"
                                                    style={{
                                                      color:
                                                        "#c23934",
                                                    }}
                                                  />
                                                </button>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      ),
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* 2. Youth Participants (MOVED FROM BELOW) */}
                        <div className="space-y-2">
                          <Label
                            className="text-sm font-semibold"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            Youth Participants
                          </Label>

                          {/* Show Clean List for Milieu Meeting */}
                          {connectionType ===
                          "Milieu Meeting" ? (
                            <div className="space-y-2">
                              {(YOUTH_STATUS || []).map(
                                (youth) => (
                                  <div
                                    key={youth.id}
                                    className="rounded-md p-3"
                                    style={{
                                      border:
                                        "1px solid var(--slds-g-color-border-base-1)",
                                      backgroundColor:
                                        milieuYouthAttendance[
                                          youth.name
                                        ]
                                          ? "var(--slds-g-color-background-base)"
                                          : "var(--slds-g-color-neutral-base-95)",
                                    }}
                                  >
                                    <div className="flex items-start gap-3">
                                      {/* Checkbox */}
                                      <div className="pt-1">
                                        <Checkbox
                                          surface="base"
                                          checked={
                                            milieuYouthAttendance[
                                              youth.name
                                            ] || false
                                          }
                                          onCheckedChange={(
                                            checked,
                                          ) => {
                                            setMilieuYouthAttendance(
                                              (prev) => ({
                                                ...prev,
                                                [youth.name]:
                                                  checked as boolean,
                                              }),
                                            );
                                          }}
                                          className="h-4 w-4"
                                        />
                                      </div>

                                      {/* Youth Info */}
                                      <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                          <div
                                            className={cn(
                                              "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white",
                                              youth.color,
                                            )}
                                          >
                                            {youth.initials}
                                          </div>
                                          <span
                                            className="font-medium"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                            }}
                                          >
                                            {youth.name}
                                          </span>
                                        </div>

                                        {/* Observation Tags - Multi-select */}
                                        {milieuYouthAttendance[
                                          youth.name
                                        ] && (
                                          <div className="flex flex-wrap gap-1.5">
                                            {availableObservations.map(
                                              (observation) => {
                                                const isSelected =
                                                  (
                                                    milieuYouthObservations[
                                                      youth.name
                                                    ] || []
                                                  ).includes(
                                                    observation,
                                                  );
                                                return (
                                                  <button
                                                    key={
                                                      observation
                                                    }
                                                    type="button"
                                                    onClick={() => {
                                                      setMilieuYouthObservations(
                                                        (
                                                          prev,
                                                        ) => {
                                                          const current =
                                                            prev[
                                                              youth
                                                                .name
                                                            ] ||
                                                            [];
                                                          const updated =
                                                            current.includes(
                                                              observation,
                                                            )
                                                              ? current.filter(
                                                                  (
                                                                    o,
                                                                  ) =>
                                                                    o !==
                                                                    observation,
                                                                )
                                                              : [
                                                                  ...current,
                                                                  observation,
                                                                ];
                                                          return {
                                                            ...prev,
                                                            [youth.name]:
                                                              updated,
                                                          };
                                                        },
                                                      );
                                                    }}
                                                    className="px-2.5 py-1 text-xs rounded-full transition-all cursor-pointer hover:opacity-80"
                                                    style={{
                                                      backgroundColor:
                                                        isSelected
                                                          ? "#0176d3"
                                                          : "#f3f3f3",
                                                      color:
                                                        isSelected
                                                          ? "#ffffff"
                                                          : "#706e6b",
                                                      border: `1px solid ${isSelected ? "#0176d3" : "#c9c7c5"}`,
                                                    }}
                                                  >
                                                    {
                                                      observation
                                                    }
                                                  </button>
                                                );
                                              },
                                            )}
                                          </div>
                                        )}

                                        {/* Notes Field */}
                                        {milieuYouthAttendance[
                                          youth.name
                                        ] && (
                                          <Input
                                            value={
                                              milieuYouthNotes[
                                                youth.name
                                              ] || ""
                                            }
                                            onChange={(e) => {
                                              setMilieuYouthNotes(
                                                (prev) => ({
                                                  ...prev,
                                                  [youth.name]:
                                                    e.target
                                                      .value,
                                                }),
                                              );
                                            }}
                                            placeholder="Add notes about this youth's participation..."
                                            className="h-9 text-sm"
                                            style={{
                                              border:
                                                "1px solid var(--slds-g-color-border-base-1)",
                                              backgroundColor:
                                                "white",
                                            }}
                                          />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          ) : (
                            /* Show Popover for other connection types */
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start h-10"
                                  style={{
                                    border:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                    backgroundColor:
                                      "var(--slds-g-color-background-base)",
                                  }}
                                >
                                  <User
                                    className="h-4 w-4 mr-2"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                    }}
                                  />
                                  {connectionYouth.length > 0
                                    ? `${connectionYouth.length} youth selected`
                                    : "Select youth"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-full p-0"
                                align="start"
                              >
                                <div className="max-h-[280px] overflow-y-auto">
                                  <div className="p-2 space-y-1">
                                    {(YOUTH_STATUS || []).map(
                                      (youth) => (
                                        <div
                                          key={youth.id}
                                          className="flex items-center space-x-3 p-2 rounded-md cursor-pointer"
                                          style={{
                                            backgroundColor:
                                              connectionYouth.includes(
                                                youth.name,
                                              )
                                                ? "var(--slds-g-color-background-selection)"
                                                : "transparent",
                                          }}
                                          onMouseEnter={(e) => {
                                            if (
                                              !connectionYouth.includes(
                                                youth.name,
                                              )
                                            ) {
                                              e.currentTarget.style.backgroundColor =
                                                "var(--slds-g-color-background-row-hover)";
                                            }
                                          }}
                                          onMouseLeave={(e) => {
                                            if (
                                              !connectionYouth.includes(
                                                youth.name,
                                              )
                                            ) {
                                              e.currentTarget.style.backgroundColor =
                                                "transparent";
                                            }
                                          }}
                                          onClick={() => {
                                            setConnectionYouth(
                                              (prev) =>
                                                prev.includes(
                                                  youth.name,
                                                )
                                                  ? prev.filter(
                                                      (y) =>
                                                        y !==
                                                        youth.name,
                                                    )
                                                  : [
                                                      ...prev,
                                                      youth.name,
                                                    ],
                                            );
                                          }}
                                        >
                                          <Checkbox
                                            surface="base"
                                            checked={connectionYouth.includes(
                                              youth.name,
                                            )}
                                            onCheckedChange={() => {}}
                                            className="h-4 w-4"
                                          />
                                          <div
                                            className={cn(
                                              "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white",
                                              youth.color,
                                            )}
                                          >
                                            {youth.initials}
                                          </div>
                                          <div className="flex-1">
                                            <div
                                              className="text-sm"
                                              style={{
                                                color:
                                                  "var(--slds-g-color-text-default)",
                                              }}
                                            >
                                              {youth.name}
                                            </div>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                          {connectionType !==
                            "Milieu Meeting" &&
                            connectionYouth.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {connectionYouth.map(
                                  (youthName, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="gap-1"
                                    >
                                      {youthName}
                                      <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() =>
                                          setConnectionYouth(
                                            (prev) =>
                                              prev.filter(
                                                (y) =>
                                                  y !==
                                                  youthName,
                                              ),
                                          )
                                        }
                                      />
                                    </Badge>
                                  ),
                                )}
                              </div>
                            )}
                        </div>

                        {/* 3. Previously Scheduled Sessions (MOVED FROM BELOW) */}
                        {(connectionType ===
                          "Advocate Meeting" ||
                          connectionType === "Parent Contact" ||
                          connectionType ===
                            "Milieu Meeting") && (
                          <div className="space-y-1.5">
                            <Label
                              className="text-sm font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              Previously Scheduled Sessions
                            </Label>
                            <Select
                              value={connectionSession}
                              onValueChange={
                                setConnectionSession
                              }
                            >
                              <SelectTrigger
                                className="h-10"
                                style={{
                                  border:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                  backgroundColor:
                                    "var(--slds-g-color-background-base)",
                                }}
                              >
                                <SelectValue placeholder="Create new or select scheduled session" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">
                                  {connectionType ===
                                  "Parent Contact"
                                    ? "Create New Parent Contact Session"
                                    : connectionType ===
                                        "Milieu Meeting"
                                      ? "Create New Milieu Meeting Session"
                                      : "Create New Advocate Meeting Session"}
                                </SelectItem>
                                {PREVIOUS_SESSIONS.filter(
                                  (session) =>
                                    !session.completed,
                                ).map((session) => (
                                  <SelectItem
                                    key={session.id}
                                    value={session.id.toString()}
                                  >
                                    {session.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p
                              className="text-xs"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              Select a previously scheduled
                              session that hasn't been completed
                              yet, or create a new one
                            </p>
                          </div>
                        )}

                        {/* 4. When Section - Enhanced Recurring UI */}
                        <div className="space-y-4">
                          <Label
                            className="text-sm font-semibold"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            When{" "}
                            <span className="text-red-600">
                              *
                            </span>
                          </Label>

                          <div
                            className="rounded-lg p-4 space-y-4"
                            style={{
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                            }}
                          >
                            {/* Date */}
                            <div className="space-y-1.5">
                              <Label
                                className="text-xs"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Date
                              </Label>
                              <DateInput
                                value={isoToMdy(
                                  connectionStartDate,
                                )}
                                onChange={(v) =>
                                  ((e) =>
                                    setConnectionStartDate(
                                      e.target.value,
                                    ))({
                                    target: {
                                      value: mdyToIso(v),
                                    },
                                  })
                                }
                                className="h-9"
                                style={{
                                  border:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                  backgroundColor: "white",
                                }}
                              />
                            </div>

                            {/* Start Time and End Time Row */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <Label
                                  className="text-xs"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  Start Time
                                </Label>
                                <TimeInput
                                  surface="base"
                                  format="24h"
                                  value={connectionStartTime}
                                  onChange={
                                    setConnectionStartTime
                                  }
                                  placeholder="hh:mm AM/PM"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label
                                  className="text-xs"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  End Time
                                </Label>
                                <TimeInput
                                  surface="base"
                                  format="24h"
                                  value={connectionEndTime}
                                  onChange={
                                    setConnectionEndTime
                                  }
                                  placeholder="hh:mm AM/PM"
                                />
                              </div>
                            </div>

                            {/* Repeat Dropdown */}
                            <div className="space-y-1.5">
                              <Label
                                className="text-xs"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Repeat
                              </Label>
                              <Select
                                value={connectionRepeatType}
                                onValueChange={(
                                  value:
                                    | "none"
                                    | "daily"
                                    | "weekly"
                                    | "monthly",
                                ) => {
                                  setConnectionRepeatType(
                                    value,
                                  );
                                  if (value === "none") {
                                    setConnectionDaysOfWeek([]);
                                  }
                                }}
                              >
                                <SelectTrigger
                                  className="h-9"
                                  style={{
                                    border:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                    backgroundColor: "white",
                                  }}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">
                                    None
                                  </SelectItem>
                                  <SelectItem value="daily">
                                    Daily
                                  </SelectItem>
                                  <SelectItem value="weekly">
                                    Weekly
                                  </SelectItem>
                                  <SelectItem value="monthly">
                                    Monthly
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Weekly Options */}
                            {connectionRepeatType ===
                              "weekly" && (
                              <>
                                {/* Repeat Every X Week(s) */}
                                <div className="space-y-2">
                                  <Label
                                    className="text-xs"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    Repeat Every
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      min="1"
                                      value={
                                        connectionRepeatInterval
                                      }
                                      onChange={(e) =>
                                        setConnectionRepeatInterval(
                                          parseInt(
                                            e.target.value,
                                          ) || 1,
                                        )
                                      }
                                      className="h-9 w-20"
                                      style={{
                                        border:
                                          "1px solid var(--slds-g-color-border-base-1)",
                                        backgroundColor:
                                          "white",
                                      }}
                                    />
                                    <span
                                      className="text-sm"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      week(s)
                                    </span>
                                  </div>
                                </div>

                                {/* Day of Week Selector */}
                                <div className="space-y-2">
                                  <Label
                                    className="text-xs"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    Repeat On
                                  </Label>
                                  <div className="flex gap-2">
                                    {[
                                      "S",
                                      "M",
                                      "T",
                                      "W",
                                      "T",
                                      "F",
                                      "S",
                                    ].map((day, index) => {
                                      const dayNames = [
                                        "Sun",
                                        "Mon",
                                        "Tue",
                                        "Wed",
                                        "Thu",
                                        "Fri",
                                        "Sat",
                                      ];
                                      const dayName =
                                        dayNames[index];
                                      const isSelected =
                                        connectionDaysOfWeek.includes(
                                          dayName,
                                        );
                                      return (
                                        <button
                                          key={index}
                                          type="button"
                                          onClick={() => {
                                            setConnectionDaysOfWeek(
                                              (prev) =>
                                                isSelected
                                                  ? prev.filter(
                                                      (d) =>
                                                        d !==
                                                        dayName,
                                                    )
                                                  : [
                                                      ...prev,
                                                      dayName,
                                                    ],
                                            );
                                          }}
                                          className="w-10 h-10 rounded-full text-sm font-semibold transition-all flex items-center justify-center"
                                          style={{
                                            border: `2px solid ${isSelected ? "#145F33" : "var(--slds-g-color-border-base-1)"}`,
                                            backgroundColor:
                                              isSelected
                                                ? "#145F33"
                                                : "white",
                                            color: isSelected
                                              ? "white"
                                              : "var(--slds-g-color-text-default)",
                                          }}
                                        >
                                          {day}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </>
                            )}

                            {/* End Options (for all recurring types except 'none') */}
                            {connectionRepeatType !==
                              "none" && (
                              <div className="space-y-3">
                                <Label
                                  className="text-xs"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  End
                                </Label>

                                {/* End Date */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      id="end-on"
                                      checked={
                                        connectionEndType ===
                                        "on"
                                      }
                                      onChange={() =>
                                        setConnectionEndType(
                                          "on",
                                        )
                                      }
                                      className="h-4 w-4"
                                      style={{
                                        accentColor: "#145F33",
                                      }}
                                    />
                                    <Label
                                      htmlFor="end-on"
                                      className="text-sm cursor-pointer"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      On
                                    </Label>
                                  </div>
                                  {connectionEndType ===
                                    "on" && (
                                    <DateInput
                                      value={isoToMdy(
                                        connectionEndDate,
                                      )}
                                      onChange={(v) =>
                                        ((e) =>
                                          setConnectionEndDate(
                                            e.target.value,
                                          ))({
                                          target: {
                                            value: mdyToIso(v),
                                          },
                                        })
                                      }
                                      className="h-9 ml-6"
                                      style={{
                                        border:
                                          "1px solid var(--slds-g-color-border-base-1)",
                                        backgroundColor:
                                          "white",
                                      }}
                                    />
                                  )}
                                </div>

                                {/* After X Occurrences */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      id="end-after"
                                      checked={
                                        connectionEndType ===
                                        "after"
                                      }
                                      onChange={() =>
                                        setConnectionEndType(
                                          "after",
                                        )
                                      }
                                      className="h-4 w-4"
                                      style={{
                                        accentColor: "#145F33",
                                      }}
                                    />
                                    <Label
                                      htmlFor="end-after"
                                      className="text-sm cursor-pointer"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      After
                                    </Label>
                                  </div>
                                  {connectionEndType ===
                                    "after" && (
                                    <div className="flex items-center gap-2 ml-6">
                                      <Input
                                        type="number"
                                        min="1"
                                        value={
                                          connectionOccurrences
                                        }
                                        onChange={(e) =>
                                          setConnectionOccurrences(
                                            parseInt(
                                              e.target.value,
                                            ) || 1,
                                          )
                                        }
                                        className="h-9 w-20"
                                        style={{
                                          border:
                                            "1px solid var(--slds-g-color-border-base-1)",
                                          backgroundColor:
                                            "white",
                                        }}
                                      />
                                      <span
                                        className="text-sm"
                                        style={{
                                          color:
                                            "var(--slds-g-color-text-default)",
                                        }}
                                      >
                                        occurrence(s)
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Never Option */}
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    id="end-never"
                                    checked={
                                      connectionEndType ===
                                      "never"
                                    }
                                    onChange={() =>
                                      setConnectionEndType(
                                        "never",
                                      )
                                    }
                                    className="h-4 w-4"
                                    style={{
                                      accentColor: "#145F33",
                                    }}
                                  />
                                  <Label
                                    htmlFor="end-never"
                                    className="text-sm cursor-pointer"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    Never
                                  </Label>
                                </div>
                              </div>
                            )}

                            {/* Summary Text */}
                            {connectionRepeatType !==
                              "none" && (
                              <div
                                className="mt-3 pt-3 text-sm"
                                style={{
                                  borderTop:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                {connectionRepeatType ===
                                  "weekly" &&
                                  connectionDaysOfWeek.length >
                                    0 && (
                                    <>
                                      Repeats every{" "}
                                      {connectionRepeatInterval}{" "}
                                      week(s) on{" "}
                                      {connectionDaysOfWeek.join(
                                        ", ",
                                      )}
                                      {connectionEndType ===
                                        "on" &&
                                        ` until ${connectionEndDate}`}
                                      {connectionEndType ===
                                        "after" &&
                                        ` for ${connectionOccurrences} occurrence(s)`}
                                    </>
                                  )}
                                {connectionRepeatType ===
                                  "daily" && (
                                  <>
                                    Repeats daily
                                    {connectionEndType ===
                                      "on" &&
                                      ` until ${connectionEndDate}`}
                                    {connectionEndType ===
                                      "after" &&
                                      ` for ${connectionOccurrences} occurrence(s)`}
                                  </>
                                )}
                                {connectionRepeatType ===
                                  "monthly" && (
                                  <>
                                    Repeats monthly
                                    {connectionEndType ===
                                      "on" &&
                                      ` until ${connectionEndDate}`}
                                    {connectionEndType ===
                                      "after" &&
                                      ` for ${connectionOccurrences} occurrence(s)`}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 5. Location (MOVED FROM BELOW) */}
                        <div className="space-y-1.5">
                          <Label
                            className="text-sm font-semibold"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            Location
                          </Label>
                          <Input
                            value={connectionLocation}
                            onChange={(e) =>
                              setConnectionLocation(
                                e.target.value,
                              )
                            }
                            placeholder="Enter meeting location"
                            className="h-10"
                            style={{
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                            }}
                          />
                        </div>

                        {/* Checkboxes - Transition Related & Home Visit - Only for Advocate Meeting and Parent Contact */}
                        {(connectionType ===
                          "Advocate Meeting" ||
                          connectionType ===
                            "Parent Contact") && (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                surface="base"
                                id="transition-related"
                                checked={
                                  connectionTransitionRelated
                                }
                                onCheckedChange={(checked) =>
                                  setConnectionTransitionRelated(
                                    checked as boolean,
                                  )
                                }
                              />
                              <label
                                htmlFor="transition-related"
                                className="text-sm cursor-pointer"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                Transition Related
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                surface="base"
                                id="home-visit"
                                checked={connectionHomeVisit}
                                onCheckedChange={(checked) =>
                                  setConnectionHomeVisit(
                                    checked as boolean,
                                  )
                                }
                              />
                              <label
                                htmlFor="home-visit"
                                className="text-sm cursor-pointer"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                Home Visit
                              </label>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {pdvConnActiveTab === "details" && (
                  <div className="pt-4 space-y-4">
                    {connectionType === "Advocate Meeting" && (
                      <div className="space-y-6">
                        {/* Goals */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label
                              className="text-[13px] font-medium"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              Goals
                            </Label>
                            <Button
                              onClick={() =>
                                handleOpenAdvocateGoalModal()
                              }
                              className="rounded-full h-8 px-3 text-[12px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
                            >
                              <Plus className="h-3.5 w-3.5 mr-1.5" />
                              Add
                            </Button>
                          </div>
                          {advocateGoals.length > 0 ? (
                            <div
                              className="border rounded-lg overflow-hidden"
                              style={{
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                              }}
                            >
                              <table className="w-full">
                                <thead
                                  style={{
                                    backgroundColor:
                                      "var(--slds-g-color-background-alt)",
                                  }}
                                >
                                  <tr>
                                    <th
                                      className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                        width: "35%",
                                      }}
                                    >
                                      Goal
                                    </th>
                                    <th
                                      className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      Comments
                                    </th>
                                    <th
                                      className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                        width: "100px",
                                      }}
                                    >
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody
                                  className="divide-y"
                                  style={{
                                    borderColor:
                                      "var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  {advocateGoals.map((goal) => (
                                    <tr key={goal.id}>
                                      <td
                                        className="px-4 py-3 text-[13px]"
                                        style={{
                                          color:
                                            "var(--slds-g-color-text-default)",
                                        }}
                                      >
                                        {goal.goal}
                                      </td>
                                      <td
                                        className="px-4 py-3 text-[13px]"
                                        style={{
                                          color:
                                            "var(--slds-g-color-text-default)",
                                        }}
                                      >
                                        {goal.comments || "—"}
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                        <button
                                          onClick={() =>
                                            handleOpenAdvocateGoalModal(
                                              goal,
                                            )
                                          }
                                          className="p-1.5 rounded hover:bg-gray-100 transition-colors mr-1"
                                          title="Modify"
                                        >
                                          <Pencil className="h-4 w-4 text-[#0176d3]" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteAdvocateGoal(
                                              goal.id,
                                            )
                                          }
                                          className="p-1.5 rounded hover:bg-red-100 transition-colors"
                                          title="Delete"
                                        >
                                          <Trash2 className="h-4 w-4 text-red-600" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div
                              className="border-2 border-dashed rounded-lg p-6 text-center"
                              style={{
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                              }}
                            >
                              <p
                                className="text-[13px]"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                No goals added yet. Click "Add"
                                to add goals.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Meeting Summary */}
                        <div className="grid gap-2">
                          <Label
                            className="text-[13px] font-medium"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            Meeting Summary
                          </Label>
                          <Textarea
                            surface="base"
                            value={advocateMeetingSummary}
                            onChange={(e) =>
                              setAdvocateMeetingSummary(
                                e.target.value,
                              )
                            }
                            placeholder="Enter meeting summary and notes..."
                            className="min-h-[100px] text-[13px] resize-none"
                            style={{
                              borderColor:
                                "var(--slds-g-color-border-base-1)",
                            }}
                          />
                        </div>

                        {/* Themes Addressed */}
                        <div className="grid gap-2">
                          <Label
                            className="text-[13px] font-medium"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            Themes Addressed
                          </Label>
                          <Textarea
                            surface="base"
                            value={themesAddressedAdvocate}
                            onChange={(e) =>
                              setThemesAddressedAdvocate(
                                e.target.value,
                              )
                            }
                            placeholder="Enter themes addressed during the meeting..."
                            className="min-h-[100px] text-[13px] resize-none"
                            style={{
                              borderColor:
                                "var(--slds-g-color-border-base-1)",
                            }}
                          />
                        </div>

                        {/* Treatment Targets */}
                        <div className="space-y-3">
                          <Label
                            className="text-[13px] font-medium"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            Treatment Targets
                          </Label>
                          <div
                            className="border rounded-lg p-4 space-y-2"
                            style={{
                              borderColor:
                                "var(--slds-g-color-border-base-1)",
                            }}
                          >
                            {ADVOCATE_TREATMENT_TARGETS.map(
                              (target) => (
                                <div
                                  key={target}
                                  className="flex items-center gap-2"
                                >
                                  <Checkbox
                                    surface="base"
                                    id={`advocate-target-${target}`}
                                    checked={selectedAdvocateTreatmentTargets.includes(
                                      target,
                                    )}
                                    onCheckedChange={(
                                      checked,
                                    ) => {
                                      if (checked)
                                        setSelectedAdvocateTreatmentTargets(
                                          [
                                            ...selectedAdvocateTreatmentTargets,
                                            target,
                                          ],
                                        );
                                      else
                                        setSelectedAdvocateTreatmentTargets(
                                          selectedAdvocateTreatmentTargets.filter(
                                            (t) => t !== target,
                                          ),
                                        );
                                    }}
                                  />
                                  <Label
                                    htmlFor={`advocate-target-${target}`}
                                    className="text-[13px] cursor-pointer flex-1"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    {target}
                                  </Label>
                                </div>
                              ),
                            )}
                          </div>
                        </div>

                        {/* Coping Skills / Triggers / Strengths — same checklist+detail-modal pattern */}
                        {[
                          {
                            kind: "coping" as const,
                            title: "Coping Skills",
                            options:
                              ADVOCATE_COPING_SKILLS_OPTIONS,
                            list: advocateCopingSkills,
                          },
                          {
                            kind: "trigger" as const,
                            title: "Triggers",
                            options: ADVOCATE_TRIGGERS_OPTIONS,
                            list: advocateTriggers,
                          },
                          {
                            kind: "strength" as const,
                            title: "Strengths",
                            options: ADVOCATE_STRENGTHS_OPTIONS,
                            list: advocateStrengths,
                          },
                        ].map(
                          ({ kind, title, options, list }) => (
                            <div
                              key={kind}
                              className="space-y-2"
                            >
                              <Label
                                className="slds-form-label whitespace-nowrap"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                {title}
                              </Label>
                              <div
                                className="rounded-lg overflow-hidden"
                                style={{
                                  border:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                {options.map(
                                  (option, index) => {
                                    const existing = list.find(
                                      (i) => i.label === option,
                                    );
                                    const isSelected =
                                      !!existing;
                                    return (
                                      <label
                                        key={option}
                                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                                        style={{
                                          borderBottom:
                                            index <
                                            options.length - 1
                                              ? "1px solid var(--slds-g-color-border-base-1)"
                                              : "none",
                                          backgroundColor:
                                            isSelected
                                              ? "rgba(20,95,51,0.05)"
                                              : "var(--slds-g-color-background-base)",
                                        }}
                                      >
                                        <Checkbox
                                          surface="base"
                                          checked={isSelected}
                                          onCheckedChange={(
                                            checked,
                                          ) =>
                                            handleToggleAdvNote(
                                              kind,
                                              option,
                                              checked === true,
                                            )
                                          }
                                        />
                                        <span
                                          className="text-[13px] flex-1"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-default)",
                                          }}
                                        >
                                          {option}
                                        </span>
                                        {isSelected &&
                                          existing && (
                                            <div className="flex items-center gap-2">
                                              <span
                                                className="text-[12px]"
                                                style={{
                                                  color:
                                                    "var(--slds-g-color-text-weak)",
                                                }}
                                              >
                                                {
                                                  existing.dateReported
                                                }
                                              </span>
                                              <button
                                                type="button"
                                                onClick={(
                                                  e,
                                                ) => {
                                                  e.preventDefault();
                                                  handleOpenAdvDetailModal(
                                                    kind,
                                                    existing,
                                                  );
                                                }}
                                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                                                title="Edit details"
                                              >
                                                <Pencil className="h-3.5 w-3.5 text-[#0176d3]" />
                                              </button>
                                            </div>
                                          )}
                                      </label>
                                    );
                                  },
                                )}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}

                    {/* ── Therapy Session — Details tab ── */}
                    {connectionType === "Therapy Session" && (
                      <div className="space-y-6">
                        {/* Goals — inline comments, add via picklist */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label
                              className="text-[13px] font-medium"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              Goals
                            </Label>
                            <Button
                              onClick={handleAddTherapyGoal}
                              className="rounded-full h-8 px-3 text-[12px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
                            >
                              <Plus className="h-3.5 w-3.5 mr-1.5" />
                              Add Goal
                            </Button>
                          </div>
                          <div
                            className="border rounded-lg overflow-hidden"
                            style={{
                              borderColor:
                                "var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <table className="w-full">
                              <thead
                                style={{
                                  backgroundColor:
                                    "var(--slds-g-color-background-alt)",
                                }}
                              >
                                <tr>
                                  <th
                                    className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                      width: "40%",
                                    }}
                                  >
                                    Goal
                                  </th>
                                  <th
                                    className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    Comments
                                  </th>
                                  <th
                                    className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                      width: "60px",
                                    }}
                                  >
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody
                                className="divide-y"
                                style={{
                                  borderColor:
                                    "var(--slds-g-color-border-base-1)",
                                }}
                              >
                                {therapyGoals.map((goal) => (
                                  <tr key={goal.id}>
                                    <td
                                      className="px-4 py-3 text-[13px]"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {goal.goal}
                                    </td>
                                    <td className="px-4 py-3">
                                      <Input
                                        surface="base"
                                        value={goal.comments}
                                        onChange={(e) =>
                                          setTherapyGoals(
                                            therapyGoals.map(
                                              (g) =>
                                                g.id === goal.id
                                                  ? {
                                                      ...g,
                                                      comments:
                                                        e.target
                                                          .value,
                                                    }
                                                  : g,
                                            ),
                                          )
                                        }
                                        className="h-8 text-[13px]"
                                        placeholder="Add comments..."
                                        style={{
                                          borderColor:
                                            "var(--slds-g-color-border-base-1)",
                                        }}
                                      />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <button
                                        onClick={() =>
                                          handleDeleteTherapyGoal(
                                            goal.id,
                                          )
                                        }
                                        className="p-1.5 rounded hover:bg-red-100 transition-colors"
                                      >
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <p
                            className="text-[11px]"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Goals are auto-populated from the
                            Youth's profile. Use "Add Goal" to
                            add additional goals, and add
                            comments inline as needed.
                          </p>
                        </div>

                        {/* Mood / Affect / Behavior — hidden for Family variant */}
                        {pdvSessionVariant !== "Family" && (
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                              <Label
                                className="text-[13px] font-medium"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                Mood
                              </Label>
                              <Select
                                value={pdvMood}
                                onValueChange={setPdvMood}
                              >
                                <SelectTrigger
                                  surface="base"
                                  className="h-9"
                                >
                                  <SelectValue placeholder="Select mood" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    "Euthymic",
                                    "Depressed",
                                    "Anxious",
                                    "Angry",
                                    "Euphoric",
                                    "Irritable",
                                  ].map((o) => (
                                    <SelectItem
                                      key={o}
                                      value={o}
                                    >
                                      {o}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label
                                className="text-[13px] font-medium"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                Affect
                              </Label>
                              <Select
                                value={pdvAffect}
                                onValueChange={setPdvAffect}
                              >
                                <SelectTrigger
                                  surface="base"
                                  className="h-9"
                                >
                                  <SelectValue placeholder="Select affect" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    "Full",
                                    "Constricted",
                                    "Flat",
                                    "Inappropriate",
                                    "Labile",
                                  ].map((o) => (
                                    <SelectItem
                                      key={o}
                                      value={o}
                                    >
                                      {o}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label
                                className="text-[13px] font-medium"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                Behavior
                              </Label>
                              <Select
                                value={pdvBehavior}
                                onValueChange={setPdvBehavior}
                              >
                                <SelectTrigger
                                  surface="base"
                                  className="h-9"
                                >
                                  <SelectValue placeholder="Select behavior" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    "Cooperative",
                                    "Resistant",
                                    "Agitated",
                                    "Impulsive",
                                    "Over Sedated",
                                    "Aggressive",
                                    "Hyperactive",
                                    "Restless",
                                    "Other",
                                  ].map((o) => (
                                    <SelectItem
                                      key={o}
                                      value={o}
                                    >
                                      {o}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}

                        {/* Themes Addressed — hidden for Individual variant */}
                        {pdvSessionVariant !== "Individual" && (
                          <div className="grid gap-2">
                            <Label
                              className="text-[13px] font-medium"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              Themes Addressed
                            </Label>
                            <Textarea
                              surface="base"
                              value={pdvThemesAddressed}
                              onChange={(e) =>
                                setPdvThemesAddressed(
                                  e.target.value,
                                )
                              }
                              placeholder="Document key themes addressed during the session..."
                              className="min-h-[100px] text-[13px] resize-none"
                              style={{
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                              }}
                            />
                          </div>
                        )}

                        {/* Description */}
                        <div className="grid gap-2">
                          <Label
                            className="slds-form-label whitespace-nowrap"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Description
                          </Label>
                          <RichTextEditor
                            value={pdvDescription}
                            onChange={setPdvDescription}
                            placeholder="Document therapy session details..."
                            minHeight="150px"
                          />
                        </div>

                        {/* Plan — hidden for Family variant */}
                        {pdvSessionVariant !== "Family" && (
                          <div className="grid gap-2">
                            <Label
                              className="slds-form-label whitespace-nowrap"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              Plan
                            </Label>
                            <RichTextEditor
                              value={pdvPlan}
                              onChange={setPdvPlan}
                              placeholder="Document next steps and therapeutic plan..."
                              minHeight="120px"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Parent Contact — Details tab ── */}
                    {connectionType === "Parent Contact" && (
                      <div className="space-y-6">
                        <div className="grid gap-2">
                          <Label
                            className="text-[13px] font-medium"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            Themes Addressed
                          </Label>
                          <Textarea
                            surface="base"
                            value={pdvThemesAddressed}
                            onChange={(e) =>
                              setPdvThemesAddressed(
                                e.target.value,
                              )
                            }
                            placeholder="Document key discussion themes during the parent/family contact..."
                            className="min-h-[120px] text-[13px] resize-none"
                            style={{
                              borderColor:
                                "var(--slds-g-color-border-base-1)",
                            }}
                          />
                          <p
                            className="text-[11px]"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Optional: Document the primary
                            themes discussed during this
                            parent/family contact.
                          </p>
                        </div>
                        <div className="grid gap-2">
                          <Label
                            className="text-[13px] font-medium"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            Contact Summary
                          </Label>
                          <Textarea
                            surface="base"
                            value={pdvContactSummary}
                            onChange={(e) =>
                              setPdvContactSummary(
                                e.target.value,
                              )
                            }
                            placeholder="Provide narrative details and outcomes of the interaction..."
                            className="min-h-[180px] text-[13px] resize-none"
                            style={{
                              borderColor:
                                "var(--slds-g-color-border-base-1)",
                            }}
                          />
                          <p
                            className="text-[11px]"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Optional: Provide a comprehensive
                            summary of the contact including
                            outcomes and relevant notes.
                          </p>
                        </div>
                        <div className="space-y-3">
                          <Label
                            className="text-[13px] font-medium"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            Treatment Targets
                          </Label>
                          <div
                            className="border rounded-lg p-4 space-y-2"
                            style={{
                              borderColor:
                                "var(--slds-g-color-border-base-1)",
                            }}
                          >
                            {ADVOCATE_TREATMENT_TARGETS.map(
                              (target) => (
                                <div
                                  key={target}
                                  className="flex items-center gap-2"
                                >
                                  <Checkbox
                                    surface="base"
                                    id={`parent-target-${target}`}
                                    checked={selectedAdvocateTreatmentTargets.includes(
                                      target,
                                    )}
                                    onCheckedChange={(
                                      checked,
                                    ) => {
                                      if (checked)
                                        setSelectedAdvocateTreatmentTargets(
                                          [
                                            ...selectedAdvocateTreatmentTargets,
                                            target,
                                          ],
                                        );
                                      else
                                        setSelectedAdvocateTreatmentTargets(
                                          selectedAdvocateTreatmentTargets.filter(
                                            (t) => t !== target,
                                          ),
                                        );
                                    }}
                                  />
                                  <Label
                                    htmlFor={`parent-target-${target}`}
                                    className="text-[13px] cursor-pointer flex-1"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    {target}
                                  </Label>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Milieu Meeting — Details tab ── */}
                    {connectionType === "Milieu Meeting" && (
                      <div className="space-y-6">
                        <div className="grid gap-2">
                          <Label
                            className="text-[13px] font-medium"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            Themes Addressed
                          </Label>
                          <Textarea
                            surface="base"
                            value={pdvThemesAddressed}
                            onChange={(e) =>
                              setPdvThemesAddressed(
                                e.target.value,
                              )
                            }
                            placeholder="Enter themes addressed during the meeting…"
                            className="min-h-[120px] text-[13px] resize-none"
                            style={{
                              borderColor:
                                "var(--slds-g-color-border-base-1)",
                            }}
                          />
                          <p
                            className="text-[11px]"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Optional: Capture key discussion
                            topics and group dynamics.
                          </p>
                        </div>
                        <div className="grid gap-2">
                          <Label
                            className="text-[13px] font-medium"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            Meeting Summary
                          </Label>
                          <Textarea
                            surface="base"
                            value={advocateMeetingSummary}
                            onChange={(e) =>
                              setAdvocateMeetingSummary(
                                e.target.value,
                              )
                            }
                            placeholder="Enter meeting summary and notes…"
                            className="min-h-[180px] text-[13px] resize-none"
                            style={{
                              borderColor:
                                "var(--slds-g-color-border-base-1)",
                            }}
                          />
                          <p
                            className="text-[11px]"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Optional: Capture overall meeting
                            context, outcomes, and observations.
                          </p>
                        </div>
                        <div className="space-y-3">
                          <Label
                            className="slds-form-label whitespace-nowrap"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Individual Participant Notes
                          </Label>
                          {advocateParticipants.filter(
                            (p) => p.attended === true,
                          ).length > 0 ? (
                            <div
                              className="rounded-lg overflow-hidden"
                              style={{
                                border:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              <table className="w-full">
                                <thead
                                  style={{
                                    backgroundColor:
                                      "var(--slds-g-color-background-alt)",
                                  }}
                                >
                                  <tr>
                                    <th
                                      className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                        width: "25%",
                                      }}
                                    >
                                      Participant
                                    </th>
                                    <th
                                      className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      Notes
                                    </th>
                                    <th
                                      className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                        width: "90px",
                                      }}
                                    >
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {advocateParticipants
                                    .filter(
                                      (p) =>
                                        p.attended === true,
                                    )
                                    .map((p, idx, arr) => {
                                      const note =
                                        pdvParticipantNotes[
                                          p.id
                                        ]?.notes || "";
                                      return (
                                        <tr
                                          key={p.id}
                                          style={{
                                            borderBottom:
                                              idx <
                                              arr.length - 1
                                                ? "1px solid var(--slds-g-color-border-base-1)"
                                                : "none",
                                          }}
                                        >
                                          <td className="px-4 py-3">
                                            <div
                                              className="text-[13px] font-medium"
                                              style={{
                                                color:
                                                  "var(--slds-g-color-text-default)",
                                              }}
                                            >
                                              {p.participant}
                                            </div>
                                            <div
                                              className="text-[12px] mt-0.5"
                                              style={{
                                                color:
                                                  "var(--slds-g-color-text-weak)",
                                              }}
                                            >
                                              {p.role}
                                            </div>
                                          </td>
                                          <td
                                            className="px-4 py-3 text-[13px]"
                                            style={{
                                              color: note
                                                ? "var(--slds-g-color-text-default)"
                                                : "var(--slds-g-color-text-weak)",
                                            }}
                                          >
                                            {note
                                              ? note.length > 80
                                                ? note.slice(
                                                    0,
                                                    80,
                                                  ) + "…"
                                                : note
                                              : "No notes added"}
                                          </td>
                                          <td className="px-4 py-3 text-right">
                                            <button
                                              onClick={() =>
                                                handleOpenPdvNotesModal(
                                                  p.id,
                                                )
                                              }
                                              className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-[12px] font-medium"
                                              style={{
                                                color:
                                                  "#0176d3",
                                                border:
                                                  "1px solid var(--slds-g-color-border-base-1)",
                                              }}
                                            >
                                              <Pencil className="h-3 w-3" />
                                              Modify
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div
                              className="flex flex-col items-center justify-center rounded-lg py-8 text-center"
                              style={{
                                border:
                                  "2px dashed var(--slds-g-color-border-base-1)",
                              }}
                            >
                              <p
                                className="text-[13px]"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                No attended participants yet.
                              </p>
                              <p
                                className="text-[12px] mt-1"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Participant notes appear here
                                once participants are marked as
                                Attended = Yes in the
                                Participants section.
                              </p>
                            </div>
                          )}
                          <p
                            className="text-[11px]"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Participant notes are auto-populated
                            from participants marked as Attended
                            = Yes. Click Modify to add duration,
                            interaction type, and notes.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Participant Notes modal — Milieu Meeting */}
                    {pdvNotesModalOpen && (
                      <div
                        className="fixed inset-0 z-50 flex items-center justify-center"
                        style={{
                          backgroundColor: "rgba(0,0,0,0.4)",
                        }}
                      >
                        <div
                          className="rounded-lg w-full max-w-md mx-4 overflow-hidden"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <div
                            className="px-5 py-4 flex items-center justify-between"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <h3
                              className="text-[14px] font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              Individual Participant Notes
                            </h3>
                            <button
                              onClick={() =>
                                setPdvNotesModalOpen(false)
                              }
                            >
                              <X
                                className="h-4 w-4"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              />
                            </button>
                          </div>
                          <div className="px-5 py-4 space-y-3">
                            <div className="space-y-1.5">
                              <Label
                                className="text-[12px] font-medium"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Duration (Minutes)
                              </Label>
                              <Input
                                surface="base"
                                type="number"
                                min="0"
                                value={
                                  pdvNotesModalDraft.duration
                                }
                                onChange={(e) =>
                                  setPdvNotesModalDraft({
                                    ...pdvNotesModalDraft,
                                    duration: e.target.value,
                                  })
                                }
                                placeholder="e.g. 30"
                                className="h-9 text-[13px]"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                className="text-[12px] font-medium"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Interaction Type / Activity
                              </Label>
                              <div
                                className="rounded-md p-3 space-y-2"
                                style={{
                                  border:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                  backgroundColor:
                                    "var(--slds-g-color-background-alt)",
                                }}
                              >
                                {PDV_INTERACTION_TYPES.map(
                                  (type) => (
                                    <div
                                      key={type}
                                      className="flex items-center gap-2"
                                    >
                                      <Checkbox
                                        surface="base"
                                        id={`pdv-notes-type-${type}`}
                                        checked={pdvNotesModalDraft.interactionTypes.includes(
                                          type,
                                        )}
                                        onCheckedChange={() => {
                                          const updated =
                                            pdvNotesModalDraft.interactionTypes.includes(
                                              type,
                                            )
                                              ? pdvNotesModalDraft.interactionTypes.filter(
                                                  (t) =>
                                                    t !== type,
                                                )
                                              : [
                                                  ...pdvNotesModalDraft.interactionTypes,
                                                  type,
                                                ];
                                          setPdvNotesModalDraft(
                                            {
                                              ...pdvNotesModalDraft,
                                              interactionTypes:
                                                updated,
                                            },
                                          );
                                        }}
                                      />
                                      <Label
                                        htmlFor={`pdv-notes-type-${type}`}
                                        className="text-[13px] cursor-pointer"
                                        style={{
                                          color:
                                            "var(--slds-g-color-text-default)",
                                        }}
                                      >
                                        {type}
                                      </Label>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <Label
                                className="text-[12px] font-medium"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Notes
                              </Label>
                              <Textarea
                                surface="base"
                                value={pdvNotesModalDraft.notes}
                                onChange={(e) =>
                                  setPdvNotesModalDraft({
                                    ...pdvNotesModalDraft,
                                    notes: e.target.value,
                                  })
                                }
                                placeholder="Enter notes for this participant…"
                                className="min-h-[100px] text-[13px] resize-none"
                              />
                            </div>
                          </div>
                          <div
                            className="px-5 py-4 flex justify-end gap-2"
                            style={{
                              borderTop:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <Button
                              variant="outline"
                              className="rounded-full"
                              onClick={() =>
                                setPdvNotesModalOpen(false)
                              }
                            >
                              Cancel
                            </Button>
                            <Button
                              className="rounded-full bg-[#145F33] hover:bg-[#0f4a26]"
                              onClick={handleSavePdvNotesModal}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Shared Coping Skill / Trigger / Strength detail modal */}
                    {advDetailModalOpen &&
                      advDetailModalItem && (
                        <div
                          className="fixed inset-0 z-50 flex items-center justify-center"
                          style={{
                            backgroundColor: "rgba(0,0,0,0.4)",
                          }}
                        >
                          <div
                            className="rounded-lg w-full max-w-md mx-4 overflow-hidden"
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <div
                              className="px-5 py-4 flex items-center justify-between"
                              style={{
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              <h3
                                className="text-[14px] font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                {advDetailModalItem.label}
                              </h3>
                              <button
                                onClick={() =>
                                  setAdvDetailModalOpen(false)
                                }
                              >
                                <X
                                  className="h-4 w-4"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                />
                              </button>
                            </div>
                            <div className="px-5 py-4 space-y-3">
                              <div
                                className="grid grid-cols-2 gap-3 text-[12px]"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                <div>
                                  Reported:{" "}
                                  {
                                    advDetailModalItem.dateReported
                                  }
                                </div>
                                <div>
                                  By:{" "}
                                  {
                                    advDetailModalItem.reportedBy
                                  }{" "}
                                  (
                                  {
                                    advDetailModalItem.relationshipToYouth
                                  }
                                  )
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <Label
                                  className="text-[12px] font-medium"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  Description
                                </Label>
                                <Textarea
                                  surface="base"
                                  value={
                                    advDetailModalDraft.description
                                  }
                                  onChange={(e) =>
                                    setAdvDetailModalDraft({
                                      ...advDetailModalDraft,
                                      description:
                                        e.target.value,
                                    })
                                  }
                                  className="min-h-[80px] text-[13px] resize-none"
                                />
                              </div>
                              {advDetailModalKind ===
                                "coping" && (
                                <div className="space-y-1.5">
                                  <Label
                                    className="text-[12px] font-medium"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    Effective When
                                  </Label>
                                  <Input
                                    surface="base"
                                    value={
                                      advDetailModalDraft.effectiveWhen
                                    }
                                    onChange={(e) =>
                                      setAdvDetailModalDraft({
                                        ...advDetailModalDraft,
                                        effectiveWhen:
                                          e.target.value,
                                      })
                                    }
                                    className="text-[13px]"
                                  />
                                </div>
                              )}
                            </div>
                            <div
                              className="px-5 py-4 flex justify-between"
                              style={{
                                borderTop:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              <button
                                onClick={() => {
                                  if (advDetailModalKind)
                                    handleDeleteAdvNote(
                                      advDetailModalKind,
                                      advDetailModalItem.id,
                                    );
                                  setAdvDetailModalOpen(false);
                                }}
                                className="text-[13px] font-medium text-red-600"
                              >
                                Remove
                              </button>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  className="rounded-full"
                                  onClick={() =>
                                    setAdvDetailModalOpen(false)
                                  }
                                >
                                  Cancel
                                </Button>
                                <Button
                                  className="rounded-full bg-[#145F33] hover:bg-[#0f4a26]"
                                  onClick={
                                    handleSaveAdvDetailModal
                                  }
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Add/Edit Goal modal */}
                    {advocateGoalModalOpen && (
                      <div
                        className="fixed inset-0 z-50 flex items-center justify-center"
                        style={{
                          backgroundColor: "rgba(0,0,0,0.4)",
                        }}
                      >
                        <div
                          className="rounded-lg w-full max-w-md mx-4 overflow-hidden"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <div
                            className="px-5 py-4 flex items-center justify-between"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <h3
                              className="text-[14px] font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              {advocateGoalDraft.id
                                ? "Edit Goal"
                                : "Add Goal"}
                            </h3>
                            <button
                              onClick={() =>
                                setAdvocateGoalModalOpen(false)
                              }
                            >
                              <X
                                className="h-4 w-4"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              />
                            </button>
                          </div>
                          <div className="px-5 py-4 space-y-3">
                            <div className="space-y-1.5">
                              <Label
                                className="text-[12px] font-medium"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Goal
                              </Label>
                              <select
                                value={advocateGoalDraft.goal}
                                onChange={(e) =>
                                  setAdvocateGoalDraft({
                                    ...advocateGoalDraft,
                                    goal: e.target.value,
                                  })
                                }
                                className="h-9 w-full px-2 rounded text-[13px]"
                                style={{
                                  border:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                <option value="">
                                  Select a goal…
                                </option>
                                {ADVOCATE_GOALS_OPTIONS.map(
                                  (g) => (
                                    <option key={g} value={g}>
                                      {g}
                                    </option>
                                  ),
                                )}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <Label
                                className="text-[12px] font-medium"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                Comments
                              </Label>
                              <Textarea
                                surface="base"
                                value={
                                  advocateGoalDraft.comments
                                }
                                onChange={(e) =>
                                  setAdvocateGoalDraft({
                                    ...advocateGoalDraft,
                                    comments: e.target.value,
                                  })
                                }
                                className="min-h-[80px] text-[13px] resize-none"
                              />
                            </div>
                          </div>
                          <div
                            className="px-5 py-4 flex justify-end gap-2"
                            style={{
                              borderTop:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <Button
                              variant="outline"
                              className="rounded-full"
                              onClick={() =>
                                setAdvocateGoalModalOpen(false)
                              }
                            >
                              Cancel
                            </Button>
                            <Button
                              className="rounded-full bg-[#145F33] hover:bg-[#0f4a26]"
                              disabled={!advocateGoalDraft.goal}
                              onClick={handleSaveAdvocateGoal}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 6. Other Meeting Attendees (MOVED FROM BELOW) - Only for Advocate Meeting and Milieu Meeting */}
                    {connectionType === "Milieu Meeting" && (
                      <div className="space-y-2">
                        <Label
                          className="text-sm font-semibold"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          Other Meeting Attendees
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start h-10"
                              style={{
                                border:
                                  "1px solid var(--slds-g-color-border-base-1)",
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                              }}
                            >
                              <Users
                                className="h-4 w-4 mr-2"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              />
                              {connectionOtherAttendees.length >
                              0
                                ? `${connectionOtherAttendees.length} attendees selected`
                                : "Select attendees"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-full p-0"
                            align="start"
                          >
                            <div className="max-h-[280px] overflow-y-auto">
                              <div className="p-2 space-y-1">
                                {PROGRAM_TEAM.map((person) => (
                                  <div
                                    key={person.id}
                                    className="flex items-center space-x-3 p-2 rounded-md cursor-pointer"
                                    style={{
                                      backgroundColor:
                                        connectionOtherAttendees.includes(
                                          person.name,
                                        )
                                          ? "var(--slds-g-color-background-selection)"
                                          : "transparent",
                                    }}
                                    onMouseEnter={(e) => {
                                      if (
                                        !connectionOtherAttendees.includes(
                                          person.name,
                                        )
                                      ) {
                                        e.currentTarget.style.backgroundColor =
                                          "var(--slds-g-color-background-row-hover)";
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (
                                        !connectionOtherAttendees.includes(
                                          person.name,
                                        )
                                      ) {
                                        e.currentTarget.style.backgroundColor =
                                          "transparent";
                                      }
                                    }}
                                    onClick={() => {
                                      setConnectionOtherAttendees(
                                        (prev) =>
                                          prev.includes(
                                            person.name,
                                          )
                                            ? prev.filter(
                                                (a) =>
                                                  a !==
                                                  person.name,
                                              )
                                            : [
                                                ...prev,
                                                person.name,
                                              ],
                                      );
                                    }}
                                  >
                                    <Checkbox
                                      surface="base"
                                      checked={connectionOtherAttendees.includes(
                                        person.name,
                                      )}
                                      onCheckedChange={() => {}}
                                      className="h-4 w-4"
                                    />
                                    <div className="flex-1">
                                      <div
                                        className="text-sm"
                                        style={{
                                          color:
                                            "var(--slds-g-color-text-default)",
                                        }}
                                      >
                                        {person.name}
                                      </div>
                                      <div
                                        className="text-xs"
                                        style={{
                                          color:
                                            "var(--slds-g-color-text-weak)",
                                        }}
                                      >
                                        {person.role}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        {connectionOtherAttendees.length >
                          0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {connectionOtherAttendees.map(
                              (attendeeName, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="gap-1"
                                >
                                  {attendeeName}
                                  <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() =>
                                      setConnectionOtherAttendees(
                                        (prev) =>
                                          prev.filter(
                                            (a) =>
                                              a !==
                                              attendeeName,
                                          ),
                                      )
                                    }
                                  />
                                </Badge>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Themes Addressed - Only for Milieu Meeting */}
                    {connectionType === "Milieu Meeting" && (
                      <div className="space-y-1.5 pt-2">
                        <Label
                          className="text-sm font-semibold"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          Themes Addressed
                        </Label>
                        <textarea
                          value={milieuThemesAddressed}
                          onChange={(e) =>
                            setMilieuThemesAddressed(
                              e.target.value,
                            )
                          }
                          placeholder="Enter themes addressed during the meeting..."
                          rows={4}
                          className="w-full px-3 py-2 rounded-md text-sm resize-none"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        />
                      </div>
                    )}

                    {/* 12. Meeting Summary */}
                    {connectionType !== "Advocate Meeting" && (
                      <div className="space-y-1.5 pt-2">
                        <Label
                          className="text-sm font-semibold"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          Meeting Summary
                        </Label>
                        <textarea
                          value={connectionMeetingSummary}
                          onChange={(e) =>
                            setConnectionMeetingSummary(
                              e.target.value,
                            )
                          }
                          placeholder="Enter meeting summary and notes..."
                          rows={6}
                          className="w-full px-3 py-2 rounded-md text-sm resize-none"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              variant="outline"
              type="button"
              className="rounded-full"
              onClick={handleCancelConnection}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                style={{
                  borderColor: "var(--color-brand-primary)",
                  color: "var(--color-brand-primary)",
                }}
                onClick={handleSaveConnection}
                disabled={
                  !connectionStartDate || !connectionStartTime
                }
              >
                <Save className="h-4 w-4 mr-2" />
                Save Connection
              </Button>
              <Button
                type="button"
                className="rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90"
                onClick={handleFinalizeAndSubmitConnection}
                disabled={
                  !connectionStartDate || !connectionStartTime
                }
              >
                <Check className="h-4 w-4 mr-2" />
                Finalize and Submit
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}