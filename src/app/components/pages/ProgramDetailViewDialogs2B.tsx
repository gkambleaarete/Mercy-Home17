// @ts-nocheck
import { PROGRAM_LOG_OBSERVATIONS } from "./programLogData";
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
import {
  isoToMdy,
  mdyToIso,
  formatMdy,
} from "../../lib/dateFormat";

interface ProgramDetailViewDialogsProps {
  [key: string]: any;
}

export function ProgramDetailViewDialogs2B(
  props: ProgramDetailViewDialogsProps,
) {
  const {
    program,
    onNavigateToYouthDetail,
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
      {/* New Task Dialog */}
      <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle
              className="text-lg font-semibold flex items-center gap-2"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              <ClipboardList className="h-5 w-5 text-[var(--color-brand-primary)]" />
              Create New Task
            </DialogTitle>
            <DialogDescription
              className="text-sm"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Add a new task to track important actions and
              follow-ups.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Task Title */}
            <div className="space-y-1.5">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Task Title{" "}
                <span className="text-red-600">*</span>
              </Label>
              <Input
                value={newTaskTitle}
                onChange={(e) =>
                  setNewTaskTitle(e.target.value)
                }
                placeholder="Enter task title"
                className="h-10"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              />
            </div>

            {/* Task Description */}
            <div className="space-y-1.5">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Description
              </Label>
              <textarea
                value={newTaskDescription}
                onChange={(e) =>
                  setNewTaskDescription(e.target.value)
                }
                placeholder="Enter task description..."
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-md resize-none"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                }}
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Priority
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    value: "Urgent",
                    color: "text-red-600",
                    bgColor: "bg-red-50",
                    borderColor: "border-red-200",
                  },
                  {
                    value: "High Priority",
                    color: "text-amber-600",
                    bgColor: "bg-amber-50",
                    borderColor: "border-amber-200",
                  },
                  {
                    value: "Medium Priority",
                    color: "text-blue-600",
                    bgColor: "bg-blue-50",
                    borderColor: "border-blue-200",
                  },
                  {
                    value: "Low Priority",
                    color: "text-gray-600",
                    bgColor: "bg-gray-50",
                    borderColor: "border-gray-200",
                  },
                ].map((priority) => {
                  const isSelected =
                    newTaskPriority === priority.value;
                  return (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() =>
                        setNewTaskPriority(priority.value)
                      }
                      className={cn(
                        "flex items-center justify-center gap-2 p-2 rounded-lg border-2 transition-all text-left",
                        isSelected
                          ? `${priority.borderColor} ${priority.bgColor} shadow-sm`
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
                      )}
                    >
                      <span
                        className={cn(
                          "text-xs",
                          isSelected ? "font-semibold" : "",
                        )}
                        style={{
                          color: isSelected
                            ? "var(--slds-g-color-text-default)"
                            : "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {priority.value}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Due Date
              </Label>
              <DateInput
                value={isoToMdy(newTaskDueDate)}
                onChange={(v) =>
                  ((e) => setNewTaskDueDate(e.target.value))({
                    target: { value: mdyToIso(v) },
                  })
                }
                className="h-10"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              />
            </div>

            {/* Assignee */}
            <div className="space-y-1.5">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Assign To
              </Label>
              <Input
                value={newTaskAssignee}
                onChange={(e) =>
                  setNewTaskAssignee(e.target.value)
                }
                placeholder="Assigned to you"
                className="h-10"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              type="button"
              className="rounded-full"
              onClick={handleCancelNewTask}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90"
              onClick={handleSaveNewTask}
              disabled={!newTaskTitle.trim()}
            >
              <Check className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      <Dialog
        open={taskDetailOpen}
        onOpenChange={setTaskDetailOpen}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle
              className="text-lg font-semibold flex items-center gap-2"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              {selectedTask?.icon && (
                <selectedTask.icon className="h-5 w-5 text-[var(--color-brand-primary)]" />
              )}
              {selectedTask?.title ?? "Task Details"}
            </DialogTitle>
            <DialogDescription
              className="text-sm"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {selectedTask?.description ??
                "View and manage task information"}
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <>
              <div className="space-y-4 py-4">
                {/* Youth Follow-up Task */}
                {selectedTask.type === "youth-followup" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          className="text-xs font-semibold uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Youth Name
                        </Label>
                        <div
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <User
                              className="h-4 w-4"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            />
                            <span className="text-sm font-medium">
                              {selectedTask.youthName}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          className="text-xs font-semibold uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Last Contact
                        </Label>
                        <div
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Calendar
                              className="h-4 w-4"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            />
                            <span className="text-sm">
                              {selectedTask.lastContact}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Follow-up Reason
                      </Label>
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-alt)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <span className="text-sm">
                          {selectedTask.followupReason}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Notes
                      </Label>
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: "#FFF9E6",
                          border: "1px solid #F4D587",
                        }}
                      >
                        <p className="text-sm leading-relaxed">
                          {selectedTask.notes}
                        </p>
                      </div>
                    </div>

                    <div
                      className="pt-3"
                      style={{
                        borderTop:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <h4
                        className="text-sm font-semibold mb-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Quick Actions
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="rounded-full h-9 text-xs"
                        >
                          <Calendar className="h-3.5 w-3.5 mr-1.5" />
                          Schedule Meeting
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-full h-9 text-xs"
                        >
                          <Mail className="h-3.5 w-3.5 mr-1.5" />
                          Send Email
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-full h-9 text-xs"
                        >
                          <FileText className="h-3.5 w-3.5 mr-1.5" />
                          Add Note
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-full h-9 text-xs"
                        >
                          <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                          Log Contact
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* Advocate Meeting Task */}
                {selectedTask.type === "advocate-meeting" && (
                  <>
                    <div className="space-y-2">
                      <Label
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Advocate Information
                      </Label>
                      <div
                        className="p-4 rounded-lg space-y-3"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-alt)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <div>
                          <div
                            className="text-xs uppercase tracking-wide mb-1"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Name
                          </div>
                          <div className="text-sm font-medium">
                            {selectedTask.advocateName}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div
                              className="text-xs uppercase tracking-wide mb-1"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              Phone
                            </div>
                            <div className="text-sm">
                              {selectedTask.advocatePhone}
                            </div>
                          </div>
                          <div>
                            <div
                              className="text-xs uppercase tracking-wide mb-1"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              Email
                            </div>
                            <div className="text-sm">
                              {selectedTask.advocateEmail}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          className="text-xs font-semibold uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Youth
                        </Label>
                        <div
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <span className="text-sm font-medium">
                            {selectedTask.youthName}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          className="text-xs font-semibold uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Case Number
                        </Label>
                        <div
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <span className="text-sm font-mono">
                            {selectedTask.caseNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Meeting Purpose
                      </Label>
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: "#FEF7E0",
                          border: "1px solid #F4D587",
                        }}
                      >
                        <p className="text-sm">
                          {selectedTask.meetingPurpose}
                        </p>
                      </div>
                    </div>

                    <div
                      className="pt-3"
                      style={{
                        borderTop:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <h4
                        className="text-sm font-semibold mb-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Schedule Meeting
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">
                              Date
                            </Label>
                            <DateInput
                              value={isoToMdy(meetingDate)}
                              onChange={(v) =>
                                ((e) =>
                                  setMeetingDate(
                                    e.target.value,
                                  ))({
                                  target: {
                                    value: mdyToIso(v),
                                  },
                                })
                              }
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">
                              Time
                            </Label>
                            <Input surface="base"
                              type="time"
                              value={meetingTime}
                              onChange={(e) =>
                                setMeetingTime(e.target.value)
                              }
                              className="h-9"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Location
                          </Label>
                          <Input surface="base"
                            value={meetingLocation}
                            onChange={(e) =>
                              setMeetingLocation(e.target.value)
                            }
                            placeholder="Meeting location or virtual link"
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Meeting Notes
                          </Label>
                          <textarea
                            value={meetingNotes}
                            onChange={(e) =>
                              setMeetingNotes(e.target.value)
                            }
                            placeholder="Additional notes or agenda items..."
                            rows={3}
                            className="w-full px-3 py-2 text-sm rounded-md resize-none"
                            style={{
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                            }}
                          />
                        </div>
                        <Button
                          className="w-full rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90"
                          onClick={handleScheduleMeeting}
                          disabled={
                            !meetingDate || !meetingTime
                          }
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Meeting
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* ITP Completion Task */}
                {selectedTask.type === "itp-completion" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          className="text-xs font-semibold uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Youth Name
                        </Label>
                        <div
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <span className="text-sm font-medium">
                            {selectedTask.youthName}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          className="text-xs font-semibold uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Review Period
                        </Label>
                        <div
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <span className="text-sm">
                            {selectedTask.reviewPeriod}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className="pt-3"
                      style={{
                        borderTop:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4
                          className="text-sm font-semibold"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          ITP Sections
                        </h4>
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0.5"
                        >
                          {
                            selectedTask.sections.filter(
                              (s: any) => s.completed,
                            ).length
                          }{" "}
                          / {selectedTask.sections.length}{" "}
                          Complete
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {selectedTask.sections.map(
                          (section: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                              style={{
                                border:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                              onClick={() =>
                                handleToggleTaskSection(
                                  selectedTask.id,
                                  section.name,
                                )
                              }
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox surface="base"
                                  checked={section.completed}
                                  onCheckedChange={() =>
                                    handleToggleTaskSection(
                                      selectedTask.id,
                                      section.name,
                                    )
                                  }
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
                                />
                                <div className="flex-1">
                                  <span
                                    className={cn(
                                      "text-sm",
                                      section.completed &&
                                        "line-through opacity-60",
                                    )}
                                  >
                                    {section.name}
                                  </span>
                                </div>
                                {section.completed && (
                                  <Check className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="pt-3">
                      <Button
                        variant="outline"
                        className="w-full rounded-full"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Open ITP Document
                      </Button>
                    </div>
                  </>
                )}

                {/* Med Cart Review Task */}
                {selectedTask.type === "med-cart-review" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          className="text-xs font-semibold uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Review Type
                        </Label>
                        <div
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <span className="text-sm font-medium">
                            {selectedTask.reviewType}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          className="text-xs font-semibold uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Last Review
                        </Label>
                        <div
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <span className="text-sm">
                            {selectedTask.lastReview}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className="pt-3"
                      style={{
                        borderTop:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4
                          className="text-sm font-semibold"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          Review Checklist
                        </h4>
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0.5"
                        >
                          {
                            selectedTask.checklist.filter(
                              (item: any) => item.completed,
                            ).length
                          }{" "}
                          / {selectedTask.checklist.length}{" "}
                          Complete
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {selectedTask.checklist.map(
                          (item: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                              style={{
                                border:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                              onClick={() =>
                                handleToggleChecklistItem(
                                  selectedTask.id,
                                  item.item,
                                )
                              }
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox surface="base"
                                  checked={item.completed}
                                  onCheckedChange={() =>
                                    handleToggleChecklistItem(
                                      selectedTask.id,
                                      item.item,
                                    )
                                  }
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
                                />
                                <div className="flex-1">
                                  <span
                                    className={cn(
                                      "text-sm",
                                      item.completed &&
                                        "line-through opacity-60",
                                    )}
                                  >
                                    {item.item}
                                  </span>
                                </div>
                                {item.completed && (
                                  <Check className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <div
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: "#FEF7E0",
                        border: "1px solid #F4D587",
                      }}
                    >
                      <div className="flex gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p
                          className="text-xs"
                          style={{ color: "#705E2E" }}
                        >
                          Complete all checklist items before
                          submitting the review report. Any
                          discrepancies must be documented in
                          the nursing log.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  type="button"
                  className="rounded-full"
                  onClick={handleCloseTaskDetail}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  className="rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90"
                  onClick={handleCompleteTaskFromDetail}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Complete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* IR (Incident Report) Dialog */}
      <Dialog open={irOpen} onOpenChange={setIrOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle
              className="text-lg font-semibold flex items-center gap-2"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              <AlertTriangle className="h-5 w-5 text-[var(--color-brand-primary)]" />
              Create Incident Report
            </DialogTitle>
            <DialogDescription
              className="text-sm"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Document incidents and track follow-up actions.
              All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Incident Type */}
            <div className="space-y-2">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Incident Type{" "}
                <span className="text-red-600">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    value: "Behavioral",
                    icon: AlertCircle,
                    color: "text-orange-600",
                    bgColor: "bg-orange-50",
                    borderColor: "border-orange-200",
                  },
                  {
                    value: "Medical",
                    icon: Stethoscope,
                    color: "text-red-600",
                    bgColor: "bg-red-50",
                    borderColor: "border-red-200",
                  },
                  {
                    value: "Safety",
                    icon: AlertTriangle,
                    color: "text-yellow-600",
                    bgColor: "bg-yellow-50",
                    borderColor: "border-yellow-200",
                  },
                  {
                    value: "AWOL",
                    icon: User,
                    color: "text-purple-600",
                    bgColor: "bg-purple-50",
                    borderColor: "border-purple-200",
                  },
                  {
                    value: "Property Damage",
                    icon: FileText,
                    color: "text-gray-600",
                    bgColor: "bg-gray-50",
                    borderColor: "border-gray-200",
                  },
                  {
                    value: "Conflict/Altercation",
                    icon: Users,
                    color: "text-red-600",
                    bgColor: "bg-red-50",
                    borderColor: "border-red-200",
                  },
                  {
                    value: "Other",
                    icon: MoreHorizontal,
                    color: "text-gray-600",
                    bgColor: "bg-gray-50",
                    borderColor: "border-gray-200",
                  },
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = irType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setIrType(type.value)}
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
                          isSelected ? "font-semibold" : "",
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

            {/* Severity */}
            <div className="space-y-2">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Severity <span className="text-red-600">*</span>
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  {
                    value: "Low",
                    dotColor: "bg-green-500",
                    color: "text-green-600",
                    bgColor: "bg-green-50",
                    borderColor: "border-green-200",
                  },
                  {
                    value: "Medium",
                    dotColor: "bg-yellow-500",
                    color: "text-yellow-600",
                    bgColor: "bg-yellow-50",
                    borderColor: "border-yellow-200",
                  },
                  {
                    value: "High",
                    dotColor: "bg-orange-500",
                    color: "text-orange-600",
                    bgColor: "bg-orange-50",
                    borderColor: "border-orange-200",
                  },
                  {
                    value: "Critical",
                    dotColor: "bg-red-500",
                    color: "text-red-600",
                    bgColor: "bg-red-50",
                    borderColor: "border-red-200",
                  },
                ].map((severity) => {
                  const isSelected =
                    irSeverity === severity.value;
                  return (
                    <button
                      key={severity.value}
                      type="button"
                      onClick={() =>
                        setIrSeverity(severity.value)
                      }
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                        isSelected
                          ? `${severity.borderColor} ${severity.bgColor} shadow-sm`
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
                      )}
                    >
                      <div
                        className={cn(
                          "h-3 w-3 rounded-full",
                          isSelected
                            ? severity.dotColor
                            : "bg-gray-300",
                        )}
                      ></div>
                      <span
                        className={cn(
                          "text-xs",
                          isSelected ? "font-semibold" : "",
                        )}
                        style={{
                          color: isSelected
                            ? "var(--slds-g-color-text-default)"
                            : "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {severity.value}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
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
                    value={isoToMdy(irDate)}
                    onChange={(v) =>
                      ((e) => setIrDate(e.target.value))({
                        target: { value: mdyToIso(v) },
                      })
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
                    value={irTime}
                    onChange={(e) => setIrTime(e.target.value)}
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

            {/* Location */}
            <div className="space-y-1.5">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Location <span className="text-red-600">*</span>
              </Label>
              <Input
                value={irLocation}
                onChange={(e) => setIrLocation(e.target.value)}
                placeholder="e.g., Common Area, Bedroom 2, Kitchen"
                className="h-10"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              />
            </div>

            {/* Youth Involved */}
            <div className="space-y-2">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Youth Involved
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
                    <User
                      className="h-4 w-4 mr-2"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    />
                    {irYouthInvolved.length > 0
                      ? `${irYouthInvolved.length} youth selected`
                      : "Select youth"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full p-0"
                  align="start"
                >
                  <div className="max-h-[280px] overflow-y-auto">
                    <div className="p-2 space-y-1">
                      {(YOUTH_STATUS || []).map((youth) => (
                        <div
                          key={youth.id}
                          className="flex items-center space-x-3 p-2 rounded-md cursor-pointer"
                          style={{
                            backgroundColor:
                              irYouthInvolved.includes(
                                youth.name,
                              )
                                ? "var(--slds-g-color-background-selection)"
                                : "transparent",
                          }}
                          onMouseEnter={(e) => {
                            if (
                              !irYouthInvolved.includes(
                                youth.name,
                              )
                            ) {
                              e.currentTarget.style.backgroundColor =
                                "var(--slds-g-color-background-row-hover)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (
                              !irYouthInvolved.includes(
                                youth.name,
                              )
                            ) {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }
                          }}
                          onClick={() => {
                            setIrYouthInvolved((prev) =>
                              prev.includes(youth.name)
                                ? prev.filter(
                                    (y) => y !== youth.name,
                                  )
                                : [...prev, youth.name],
                            );
                          }}
                        >
                          <Checkbox surface="base"
                            checked={irYouthInvolved.includes(
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
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              {irYouthInvolved.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {irYouthInvolved.map((youthName, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="gap-1"
                    >
                      {youthName}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          setIrYouthInvolved((prev) =>
                            prev.filter((y) => y !== youthName),
                          )
                        }
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Staff Involved */}
            <div className="space-y-2">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Staff Involved
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
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    />
                    {irStaffInvolved.length > 0
                      ? `${irStaffInvolved.length} staff selected`
                      : "Select staff"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full p-0"
                  align="start"
                >
                  <div className="max-h-[280px] overflow-y-auto">
                    <div className="p-2 space-y-1">
                      {PROGRAM_TEAM.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center space-x-3 p-2 rounded-md cursor-pointer"
                          style={{
                            backgroundColor:
                              irStaffInvolved.includes(
                                member.name,
                              )
                                ? "var(--slds-g-color-background-selection)"
                                : "transparent",
                          }}
                          onMouseEnter={(e) => {
                            if (
                              !irStaffInvolved.includes(
                                member.name,
                              )
                            ) {
                              e.currentTarget.style.backgroundColor =
                                "var(--slds-g-color-background-row-hover)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (
                              !irStaffInvolved.includes(
                                member.name,
                              )
                            ) {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }
                          }}
                          onClick={() => {
                            setIrStaffInvolved((prev) =>
                              prev.includes(member.name)
                                ? prev.filter(
                                    (s) => s !== member.name,
                                  )
                                : [...prev, member.name],
                            );
                          }}
                        >
                          <Checkbox surface="base"
                            checked={irStaffInvolved.includes(
                              member.name,
                            )}
                            onCheckedChange={() => {}}
                            className="h-4 w-4"
                          />
                          <div
                            className="h-7 w-7 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-brand-primary-lighter)",
                              color:
                                "var(--color-brand-primary)",
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
              {irStaffInvolved.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {irStaffInvolved.map((staffName, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="gap-1"
                    >
                      {staffName}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          setIrStaffInvolved((prev) =>
                            prev.filter((s) => s !== staffName),
                          )
                        }
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Incident Description{" "}
                <span className="text-red-600">*</span>
              </Label>
              <textarea
                value={irDescription}
                onChange={(e) =>
                  setIrDescription(e.target.value)
                }
                placeholder="Provide a detailed description of what happened..."
                rows={4}
                className="w-full px-3 py-2 rounded-md text-sm"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                }}
              />
            </div>

            {/* Immediate Action Taken */}
            <div className="space-y-1.5">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Immediate Action Taken
              </Label>
              <textarea
                value={irImmediateAction}
                onChange={(e) =>
                  setIrImmediateAction(e.target.value)
                }
                placeholder="Describe actions taken immediately following the incident..."
                rows={3}
                className="w-full px-3 py-2 rounded-md text-sm"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                }}
              />
            </div>

            {/* Follow-up Required */}
            <div className="space-y-1.5">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Follow-up Actions Required
              </Label>
              <textarea
                value={irFollowUp}
                onChange={(e) => setIrFollowUp(e.target.value)}
                placeholder="Describe any follow-up actions needed..."
                rows={3}
                className="w-full px-3 py-2 rounded-md text-sm"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                }}
              />
            </div>

            {/* Notification Required */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox surface="base"
                  id="notification-required"
                  checked={irNotificationRequired}
                  onCheckedChange={(checked) =>
                    setIrNotificationRequired(
                      checked as boolean,
                    )
                  }
                />
                <label
                  htmlFor="notification-required"
                  className="text-sm cursor-pointer"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  External Notification Required (DCFS, Police,
                  etc.)
                </label>
              </div>

              {irNotificationRequired && (
                <div className="ml-6 space-y-2">
                  <Label
                    className="text-sm font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Parties to Notify
                  </Label>
                  <div className="space-y-2">
                    {[
                      "DCFS",
                      "Police",
                      "Probation Officer",
                      "Parent/Guardian",
                      "School",
                      "Medical Provider",
                    ].map((party) => (
                      <div
                        key={party}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox surface="base"
                          id={`notify-${party}`}
                          checked={irNotifiedParties.includes(
                            party,
                          )}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setIrNotifiedParties((prev) => [
                                ...prev,
                                party,
                              ]);
                            } else {
                              setIrNotifiedParties((prev) =>
                                prev.filter((p) => p !== party),
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={`notify-${party}`}
                          className="text-sm cursor-pointer"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {party}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              type="button"
              className="rounded-full"
              onClick={handleCancelIR}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90"
              onClick={handleSaveIR}
              disabled={
                !irDescription.trim() || !irLocation.trim()
              }
            >
              <Check className="h-4 w-4 mr-2" />
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Youth Observation Dialog */}
      <Dialog
        open={observationDialogOpen}
        onOpenChange={setObservationDialogOpen}
      >
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>
                Youth Observation Entry for{" "}
                {observationYouth?.name}
              </DialogTitle>
              <DialogDescription>
                Record observations and current status for{" "}
                {observationYouth?.name}
              </DialogDescription>
            </VisuallyHidden>
            <div className="flex items-center justify-between">
              {observationYouth && (
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center text-base font-bold text-white relative",
                      observationYouth.color,
                    )}
                  >
                    {observationYouth.initials}
                    {/* Status Indicator Dot */}
                    <div
                      className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white"
                      style={{
                        backgroundColor:
                          observationYouth.status === "Onground"
                            ? "#10b981" // Green
                            : observationYouth.status ===
                                "School"
                              ? "#8b5cf6" // Purple
                              : observationYouth.status ===
                                  "Offground"
                                ? "#f97316" // Orange
                                : observationYouth.status ===
                                    "Pass"
                                  ? "#eab308" // Yellow
                                  : observationYouth.status ===
                                      "Alert"
                                    ? "#ef4444" // Red
                                    : "#6b7280", // Gray for Other
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-lg font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {observationYouth.name}
                      </span>
                      <YouthAlertIcons />
                    </div>
                    <div
                      className="text-sm"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {observationYouth.status} •{" "}
                      {observationYouth.program}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                {/* Goals Button - Simple & Clean */}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    if (observationYouth) {
                      handleViewGoals(observationYouth);
                    }
                  }}
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <Target
                    className="h-3.5 w-3.5 mr-1.5"
                    style={{ color: "#145F33" }}
                  />
                  Goals
                  <Badge
                    className="ml-2 rounded-full text-[10px] px-1.5 py-0"
                    style={{
                      backgroundColor: "#E8F5E9",
                      color: "#145F33",
                      border: "none",
                      height: "16px",
                      lineHeight: "16px",
                    }}
                  >
                    3/5
                  </Badge>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    if (
                      observationYouth &&
                      onNavigateToYouthDetail
                    ) {
                      setObservationDialogOpen(false);
                      onNavigateToYouthDetail(observationYouth);
                    }
                  }}
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  View Full Profile
                </Button>
              </div>
            </div>
          </DialogHeader>

          {observationYouth && (
            <div className="space-y-5 py-4">
              {/* Location Dropdown */}
              <div className="space-y-1.5">
                <Label
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Current Location{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={observationLocation}
                  onValueChange={setObservationLocation}
                >
                  <SelectTrigger
                    className="w-full h-10"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Onground">
                      Onground
                    </SelectItem>
                    <SelectItem value="Offground">
                      Offground
                    </SelectItem>
                    <SelectItem value="School">
                      School
                    </SelectItem>
                    <SelectItem value="Pass">Pass</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Comments */}
              <div className="space-y-1.5">
                <Label
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Location Comments
                </Label>
                <textarea
                  value={locationComments}
                  onChange={(e) =>
                    setLocationComments(e.target.value)
                  }
                  placeholder="Add any additional context about the youth's location..."
                  className="w-full min-h-[80px] px-3 py-2.5 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent resize-none"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
              </div>

              {/* Observation Hotkeys */}
              <div className="space-y-3">
                <Label
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Observations
                </Label>
                <div className="flex flex-wrap gap-2">
                  {PROGRAM_LOG_OBSERVATIONS.map(
                    (observation) => (
                      <Badge
                        key={observation}
                        variant={
                          selectedObservations.includes(
                            observation,
                          )
                            ? "default"
                            : "outline"
                        }
                        className={cn(
                          "cursor-pointer transition-all text-xs px-3 py-1.5 font-medium",
                          selectedObservations.includes(
                            observation,
                          )
                            ? "bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary)]/90 border-[var(--color-brand-primary)]"
                            : "hover:bg-gray-100",
                        )}
                        style={
                          !selectedObservations.includes(
                            observation,
                          )
                            ? {
                                border:
                                  "1px solid var(--slds-g-color-border-base-1)",
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                                color:
                                  "var(--slds-g-color-text-default)",
                              }
                            : undefined
                        }
                        onClick={() =>
                          toggleObservation(observation)
                        }
                      >
                        {selectedObservations.includes(
                          observation,
                        ) && (
                          <Check className="h-3 w-3 mr-1 inline" />
                        )}
                        {observation}
                      </Badge>
                    ),
                  )}
                </div>
                {selectedObservations.length > 0 && (
                  <div
                    className="text-xs bg-blue-50 border border-blue-200 rounded p-2"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    <span className="font-semibold">
                      {selectedObservations.length}
                    </span>{" "}
                    observation
                    {selectedObservations.length !== 1
                      ? "s"
                      : ""}{" "}
                    selected
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="space-y-2">
                <Label
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Additional Comments
                </Label>
                <textarea
                  value={observationComments}
                  onChange={(e) =>
                    setObservationComments(e.target.value)
                  }
                  className="w-full min-h-[120px] px-3 py-2.5 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent resize-none"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                  placeholder="Add any additional notes or context about this observation..."
                />
                <div
                  className="text-xs"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Provide specific details about behavior,
                  interactions, or any concerns
                </div>
              </div>

              {/* Timestamp Info */}
              <div
                className="flex items-center gap-2 text-xs rounded-md p-2"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>
                  This observation will be recorded with the
                  current timestamp
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setObservationDialogOpen(false);
                setObservationLocation("Onground");
                setLocationComments("");
                setSelectedObservations([]);
                setObservationComments("");
              }}
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 text-white"
              onClick={handleSaveObservation}
            >
              <Check className="h-4 w-4 mr-2" />
              Save Observation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Log Entry Detail Dialog (Read-Only) */}
      <Dialog
        open={viewLogEntryDialogOpen}
        onOpenChange={setViewLogEntryDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Log Entry Details
            </DialogTitle>
            <DialogDescription
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              View-only mode
            </DialogDescription>
          </DialogHeader>

          {viewingLogEntry && (
            <div className="space-y-4">
              {/* Entry Type and Author */}
              <div
                className="flex items-start gap-3 p-3 rounded-md"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <div
                  className="flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: viewingLogEntry.iconBg
                      .replace("bg-", "")
                      .includes("green")
                      ? "#d1fae5"
                      : viewingLogEntry.iconBg
                            .replace("bg-", "")
                            .includes("purple")
                        ? "#e9d5ff"
                        : viewingLogEntry.iconBg
                              .replace("bg-", "")
                              .includes("blue")
                          ? "#dbeafe"
                          : viewingLogEntry.iconBg
                                .replace("bg-", "")
                                .includes("yellow")
                            ? "#fef3c7"
                            : viewingLogEntry.iconBg
                                  .replace("bg-", "")
                                  .includes("red")
                              ? "#fee2e2"
                              : "#f3f4f6",
                  }}
                >
                  {viewingLogEntry.icon && (
                    <viewingLogEntry.icon
                      className="h-4 w-4"
                      style={{
                        color: viewingLogEntry.iconColor
                          .replace("text-", "")
                          .includes("green")
                          ? "#059669"
                          : viewingLogEntry.iconColor
                                .replace("text-", "")
                                .includes("purple")
                            ? "#9333ea"
                            : viewingLogEntry.iconColor
                                  .replace("text-", "")
                                  .includes("blue")
                              ? "#2563eb"
                              : viewingLogEntry.iconColor
                                    .replace("text-", "")
                                    .includes("yellow")
                                ? "#d97706"
                                : viewingLogEntry.iconColor
                                      .replace("text-", "")
                                      .includes("red")
                                  ? "#dc2626"
                                  : "#6b7280",
                      }}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div
                    className="text-sm font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {viewingLogEntry.type}
                  </div>
                  <div
                    className="text-xs mt-1"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Created by {viewingLogEntry.author} at{" "}
                    {viewingLogEntry.time}
                  </div>
                </div>
              </div>

              {/* Tags/Badges */}
              {viewingLogEntry.badges &&
                viewingLogEntry.badges.length > 0 && (
                  <div className="space-y-2">
                    <Label
                      className="text-sm font-semibold"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      Tagged Individuals
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {viewingLogEntry.badges.map(
                        (badge, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: "#dbeafe",
                              color: "#1e40af",
                              border: "1px solid #93c5fd",
                            }}
                          >
                            {badge}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {/* Content */}
              <div className="space-y-2">
                <Label
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Entry Content
                </Label>
                <div
                  className="p-3 rounded-md text-sm leading-relaxed"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {viewingLogEntry.content}
                </div>
              </div>

              {/* Timestamp Info */}
              <div
                className="flex items-center gap-2 text-xs rounded-md p-2"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {viewingLogEntry.date
                    ? `Recorded on ${formatMdy(viewingLogEntry.date)} at ${viewingLogEntry.time}`
                    : `Recorded at ${viewingLogEntry.time}`}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setViewLogEntryDialogOpen(false);
                setViewingLogEntry(null);
              }}
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Therapy Detail Dialog */}
      <Dialog
        open={therapyDetailOpen}
        onOpenChange={setTherapyDetailOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Therapy Session Details
            </DialogTitle>
            <DialogDescription
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              View therapy session information
            </DialogDescription>
          </DialogHeader>

          {selectedTherapyEntry && (
            <div className="space-y-4">
              {/* Session Header */}
              <div
                className="flex items-start gap-3 p-3 rounded-md"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <div
                  className="flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "#d1fae5" }}
                >
                  <User className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div
                    className="text-sm font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Therapy Session
                  </div>
                  <div
                    className="text-xs mt-1"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Therapist: {selectedTherapyEntry.author}
                  </div>
                </div>
              </div>

              {/* Youth Information */}
              {selectedTherapyEntry.badges &&
                selectedTherapyEntry.badges.length > 0 && (
                  <div className="space-y-2">
                    <Label
                      className="text-sm font-semibold"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      Client
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTherapyEntry.badges.map(
                        (badge, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: "#dbeafe",
                              color: "#1e40af",
                              border: "1px solid #93c5fd",
                            }}
                          >
                            {badge}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {/* Session Notes */}
              <div className="space-y-2">
                <Label
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Session Notes
                </Label>
                <div
                  className="p-3 rounded-md text-sm leading-relaxed"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {selectedTherapyEntry.content}
                </div>
              </div>

              {/* Session Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label
                    className="text-xs"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Session Date
                  </Label>
                  <div
                    className="text-sm"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {selectedTherapyEntry.date
                      ? formatMdy(selectedTherapyEntry.date)
                      : "Today"}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label
                    className="text-xs"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Session Time
                  </Label>
                  <div
                    className="text-sm"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {selectedTherapyEntry.time}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setTherapyDetailOpen(false);
                setSelectedTherapyEntry(null);
              }}
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}