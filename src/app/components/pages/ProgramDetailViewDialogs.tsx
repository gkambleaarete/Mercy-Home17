// @ts-nocheck
import { useState, useEffect, useMemo } from "react";
import { DateInput } from "../ui/date-input";
import { YouthAlertIcons } from "../youth/YouthAlertIcons";
import { useNavigate, useLocation } from "react-router";
import { IncidentDetailsDialog } from "../dialogs/IncidentDetailsDialog";
import { Search, Calendar, FileText, AlertTriangle, User, Filter, ChevronRight, Settings, RefreshCw, LayoutGrid, Clock, Check, ArrowRight, MoreHorizontal, Mail, ClipboardList, Stethoscope, MessageCircle, Eye, Pill, File, AlertCircle, X, Plus, ChevronDown, Download, ExternalLink, Users, Target, Briefcase, TrendingUp, Edit2, Save, Phone, Trash2, MessageSquare, Sparkles, FileEdit, Upload, Paperclip, Image, Pencil, ChevronUp, EyeOff, SlidersHorizontal, Send, Tag, CheckCircle, XCircle } from "@/app/lib/lucide-icons";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { HandoverChecklistSection, useHandoverChecklist } from "../shift-handover/HandoverChecklistSection";
import { ChecklistResultsReadOnly } from "../shift-handover/ChecklistResults";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { composeChecklistBlock, composeHandoverSummary, displayShiftLabel, draftFromSavedResult } from "../../data/shiftHandoverChecklistStore";
import { VisuallyHidden } from "../ui/visually-hidden";
import { FieldError, FieldLabel } from "../ui/field";
import { StaffStatusHandoverBlock } from "../program-shift-roles/StaffStatusHandoverBlock";
import { buildStaffStatusSnapshot, shiftWindow, useShiftRoleState, withStaffStatusBlock, type StaffStatusSnapshot } from "../../data/shiftRoleStore";
import { STAFF_MEMBER_STATUS_LOG_TYPE, StaffMemberStatusFields, useStaffMemberStatusDraft, useStaffStatusAvailability } from "../program-shift-roles/StaffMemberStatusFields";
import { MANUAL_LOG_MESSAGES, MANUAL_LOG_TYPES, PROGRAM_CLOSE_ACTIONS, createManualLogEntry, type ManualLogFieldErrors } from "../../data/programLogEntryStore";
import { Alert, AlertDescription } from "../ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Checkbox } from "../ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { cn } from "../../lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toast } from "sonner";
import { GeneralTabContent } from "../youth/GeneralTabContent";
import { ProfileContentRenderer } from "../youth/ProfileContentRenderer";
import { OtherTabsContentRenderer } from "../youth/OtherTabsContentRenderer";
import { MedicationsSection } from "../admissions/MedicationsSection";
import { 
  MOCK_PROGRAMS,
  YOUTH_STATUS,
  PROGRAM_LOG_OBSERVATIONS,
  PROGRAM_TEAM,
  OTHER_INDIVIDUALS,
  MY_TASKS,
  PREVIOUS_SESSIONS,
  EVENTS,
  getTimelineItems,
  MEDICATIONS,
  LOG_FEED
} from "./programLogData";
import {
  SHIFT_HANDOVERS,
  BEHAVIORAL_INCIDENTS,
  BEHAVIORAL_SUMMARY
} from "./programLogBehavioralData";
import { ProgramDetailViewDialogs2 } from "./ProgramDetailViewDialogs2";
import { isoToMdy, mdyToIso, formatMdy } from "../../lib/dateFormat";

// Observation filter (20044) — one section rendered in both log filter
// dialogs (both are bound to `filterOpen`). Entries match when tagged with
// ANY selected observation, e.g. "Pass Related".
function ObservationFilterSection({
    selected = [],
    onToggle,
    idPrefix,
}: {
    selected?: string[];
    onToggle?: (observation: string) => void;
    idPrefix: string;
}) {
    return (
        <div className="space-y-2">
            <Label className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                Observations
            </Label>
            <div className="flex flex-wrap gap-2">
                {PROGRAM_LOG_OBSERVATIONS.map(observation => (
                    <div key={observation} className="flex items-center">
                        <Checkbox surface="base"
                            id={`${idPrefix}-${observation}`}
                            checked={selected.includes(observation)}
                            onCheckedChange={() => onToggle?.(observation)}
                        />
                        <Label
                            htmlFor={`${idPrefix}-${observation}`}
                            className="ml-2 text-sm cursor-pointer"
                            style={{ color: 'var(--slds-g-color-text-default)' }}
                        >
                            {observation}
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface ProgramDetailViewDialogsProps { [key: string]: any; }

export function ProgramDetailViewDialogs(props: ProgramDetailViewDialogsProps) {
  const {
    program,
    // Email dialog
    emailDialogOpen, setEmailDialogOpen,
    emailSubject, setEmailSubject,
    emailBody, setEmailBody,
    // Handover dialog
    handoverDialogOpen, setHandoverDialogOpen,
    handoverNote, setHandoverNote,
    isAiGenerated, setIsAiGenerated,
    handoverNoteMode, setHandoverNoteMode,
    isGeneratingAiNote, setIsGeneratingAiNote,
    handovers, setHandovers,
    editingHandoverId, setEditingHandoverId,
    viewingHandover, setViewingHandover,
    viewHandoverDialogOpen, setViewHandoverDialogOpen,
    deleteHandoverDialogOpen, setDeleteHandoverDialogOpen,
    handoverToDelete, setHandoverToDelete,
    handoverShift, setHandoverShift,
    handoverAuthor, setHandoverAuthor,
    handoverDate, setHandoverDate,
    handoverTime, setHandoverTime,
    handoverCriticalCount, setHandoverCriticalCount,
    expandedShiftId, setExpandedShiftId,
    // Goals dialog
    viewingYouthGoals, setViewingYouthGoals,
    viewGoalsDialogOpen, setViewGoalsDialogOpen,
    goals, setGoals,
    showAddGoal, setShowAddGoal,
    expandedGoals, setExpandedGoals,
    newGoal, setNewGoal,
    editingGoalId, setEditingGoalId,
    editGoalData, setEditGoalData,
    showCommentForm, setShowCommentForm,
    newComment, setNewComment,
    youthGoalsData, setYouthGoalsData,
    calculateOverallProgress,
    handleDeleteGoal,
    handleEditGoal,
    handleSaveGoal,
    handleCancelEditGoal,
    handleAddGoal,
    handleAddComment,
    // Incident dialog
    incidentDialogOpen, setIncidentDialogOpen,
    incidentYouth, setIncidentYouth,
    incidentTab, setIncidentTab,
    incidentType, setIncidentType,
    incidentStartDate, setIncidentStartDate,
    incidentStartTime, setIncidentStartTime,
    incidentEndDate, setIncidentEndDate,
    incidentEndTime, setIncidentEndTime,
    incidentLocation, setIncidentLocation,
    incidentOverview, setIncidentOverview,
    incidentNarrative, setIncidentNarrative,
    incidentResponse, setIncidentResponse,
    incidentPersonsContacted, setIncidentPersonsContacted,
    incidentParticipants, setIncidentParticipants,
    incidentYouthInjuries, setIncidentYouthInjuries,
    incidentRestraints, setIncidentRestraints,
    incidentDebriefParticipants, setIncidentDebriefParticipants,
    incidentDebriefNotes, setIncidentDebriefNotes,
    incidentFinalized, setIncidentFinalized,
    incidentYouthList, setIncidentYouthList,
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
    filterOpen, setFilterOpen,
    selectedTypes, setSelectedTypes,
    selectedAuthors, setSelectedAuthors,
    selectedYouthFilter, setSelectedYouthFilter,
    selectedObservationFilter = [], toggleObservationFilter,
    selectedPriorities, setSelectedPriorities,
    dateRangeFilter, setDateRangeFilter,
    customStartDate, setCustomStartDate,
    customEndDate, setCustomEndDate,
    toggleType,
    toggleAuthor,
    toggleYouthFilter,
    togglePriority,
    clearAllFilters,
    activeFilterCount,
    // Task list dialog (pl)
    plDetailTask, setPlDetailTask,
    plDS, setPlDS,
    plDD, setPlDD,
    plDA, setPlDA,
    plDR, setPlDR,
    plDSt, setPlDSt,
    plComment, setPlComment,
    addPlComment,
    cancelPlTask,
    // Tasks
    tasks, setTasks,
    taskDetailOpen, setTaskDetailOpen,
    selectedTask, setSelectedTask,
    meetingDate, setMeetingDate,
    meetingTime, setMeetingTime,
    meetingLocation, setMeetingLocation,
    meetingNotes, setMeetingNotes,
    newTaskOpen, setNewTaskOpen,
    newTaskTitle, setNewTaskTitle,
    newTaskDescription, setNewTaskDescription,
    newTaskPriority, setNewTaskPriority,
    newTaskDueDate, setNewTaskDueDate,
    newTaskAssignee, setNewTaskAssignee,
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
    youthDetailOpen, setYouthDetailOpen,
    selectedYouth, setSelectedYouth,
    // Observation dialog
    observationDialogOpen, setObservationDialogOpen,
    observationYouth, setObservationYouth,
    observationLocation, setObservationLocation,
    locationComments, setLocationComments,
    selectedObservations, setSelectedObservations,
    observationComments, setObservationComments,
    handleSaveObservation,
    toggleObservation,
    // Event detail
    eventDetailOpen, setEventDetailOpen,
    selectedEvent, setSelectedEvent,
    showExpandedDetails, setShowExpandedDetails,
    handleAddToCalendar,
    // Shift/log
    expandedYouth, setExpandedYouth,
    selectedShift, setSelectedShift,
    // New entry dialog
    newEntryOpen, setNewEntryOpen,
    newEntryType, setNewEntryType,
    newEntryLogType, setNewEntryLogType,
    newEntryContent, setNewEntryContent,
    newEntryPriority, setNewEntryPriority,
    newEntryTags, setNewEntryTags,
    newEntryYouth, setNewEntryYouth,
    newEntryProgramTeam, setNewEntryProgramTeam,
    newEntryOther, setNewEntryOther,
    newEntryFiles, setNewEntryFiles,
    newEntryDate, setNewEntryDate,
    newEntryTime, setNewEntryTime,
    isDragging, setIsDragging,
    youthSearchQuery, setYouthSearchQuery,
    programTeamSearchQuery, setProgramTeamSearchQuery,
    otherSearchQuery, setOtherSearchQuery,
    externalIndividuals, setExternalIndividuals,
    externalIndividualInput, setExternalIndividualInput,
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
    mentionInput, setMentionInput,
    showMentionDropdown, setShowMentionDropdown,
    mentionQuery, setMentionQuery,
    selectedMentionIndex, setSelectedMentionIndex,
    handleMentionInputChange,
    handleMentionSelect,
    handleMentionKeyDown,
    removeYouthMention,
    // Log feed
    logFeedData, setLogFeedData,
    expandedComments, setExpandedComments,
    showAllComments, setShowAllComments,
    newCommentText, setNewCommentText,
    editingLogId, setEditingLogId,
    editedContent, setEditedContent,
    editedLogs, setEditedLogs,
    expandedOriginals, setExpandedOriginals,
    toggleComments,
    toggleShowAllComments,
    startEditingLog,
    cancelEditingLog,
    saveEditedLog,
    toggleOriginalContent,
    // Edit entry modal
    editModalOpen, setEditModalOpen,
    editingEntry, setEditingEntry,
    editEntryLogType, setEditEntryLogType,
    editEntryDate, setEditEntryDate,
    editEntryTime, setEditEntryTime,
    editEntryPriority, setEditEntryPriority,
    editEntryContent, setEditEntryContent,
    editEntryYouth, setEditEntryYouth,
    editEntryProgramTeam, setEditEntryProgramTeam,
    editEntryOther, setEditEntryOther,
    editEntryTags, setEditEntryTags,
    editEntryAttachments, setEditEntryAttachments,
    handleSaveEditedEntry,
    handleCancelEditEntry,
    // View log entry
    viewingLogEntry, setViewingLogEntry,
    viewLogEntryDialogOpen, setViewLogEntryDialogOpen,
    getYouthRecentLogs,
    // Therapy detail
    therapyDetailOpen, setTherapyDetailOpen,
    selectedTherapyEntry, setSelectedTherapyEntry,
    // Connections dialog
    connectionsOpen, setConnectionsOpen,
    connectionType, setConnectionType,
    connectionStartDate, setConnectionStartDate,
    connectionEndDate, setConnectionEndDate,
    connectionRecurring, setConnectionRecurring,
    connectionCadence, setConnectionCadence,
    connectionRepeatType, setConnectionRepeatType,
    connectionRepeatInterval, setConnectionRepeatInterval,
    connectionDaysOfWeek, setConnectionDaysOfWeek,
    connectionEndType, setConnectionEndType,
    connectionOccurrences, setConnectionOccurrences,
    connectionStartTime, setConnectionStartTime,
    connectionEndTime, setConnectionEndTime,
    connectionYouth, setConnectionYouth,
    connectionLocation, setConnectionLocation,
    connectionTransitionRelated, setConnectionTransitionRelated,
    connectionHomeVisit, setConnectionHomeVisit,
    connectionSession, setConnectionSession,
    connectionGoals, setConnectionGoals,
    connectionNewGoal, setConnectionNewGoal,
    connectionCopingSkills, setConnectionCopingSkills,
    connectionNewCopingSkill, setConnectionNewCopingSkill,
    connectionTriggers, setConnectionTriggers,
    connectionNewTrigger, setConnectionNewTrigger,
    connectionStrengths, setConnectionStrengths,
    connectionNewStrength, setConnectionNewStrength,
    connectionMeetingSummary, setConnectionMeetingSummary,
    connectionOtherAttendees, setConnectionOtherAttendees,
    advocateQuestion1, setAdvocateQuestion1,
    advocateQuestion2, setAdvocateQuestion2,
    advocateQuestion3, setAdvocateQuestion3,
    milieuYouthAttendance, setMilieuYouthAttendance,
    milieuYouthNotes, setMilieuYouthNotes,
    milieuYouthObservations, setMilieuYouthObservations,
    milieuThemesAddressed, setMilieuThemesAddressed,
    handleSaveConnection,
    handleFinalizeAndSubmitConnection,
    handleCancelConnection,
    connDays, setConnDays,
    // IR dialog
    irOpen, setIrOpen,
    irType, setIrType,
    irSeverity, setIrSeverity,
    irDate, setIrDate,
    irTime, setIrTime,
    irLocation, setIrLocation,
    irYouthInvolved, setIrYouthInvolved,
    irStaffInvolved, setIrStaffInvolved,
    irDescription, setIrDescription,
    irImmediateAction, setIrImmediateAction,
    irFollowUp, setIrFollowUp,
    irNotificationRequired, setIrNotificationRequired,
    irNotifiedParties, setIrNotifiedParties,
    handleSaveIR,
    handleCancelIR,
    // Handover handlers
    handleGenerateAiNote,
    handleSaveHandover,
    handleViewGoals,
    filteredHandovers,
    regenerateHandoverNote,
    canFinalizeIncident,
    confirmDeleteHandover,
    logTypes,
    authors,
    PL_STAFF,
    PL_CONSTITUENTS,
    completePlTask,
    reopenPlTask,
    savePlDetail,
    openPlDetail,
    handleEditHandover,
  } = props;

  // US 20221 — Staff Member Status branch of Create New Program Log Entry.
  // It has its own save path, keyed on the selected Log Type.
  // US 20222: ONE selected Log Type drives both the form and the writer.
  const isStaffStatus = newEntryLogType === STAFF_MEMBER_STATUS_LOG_TYPE;
  const isMilieu = newEntryLogType === "Milieu Observation";
  const isCloseReopen = newEntryLogType === "Program Close / Reopen";
  const staffStatus = useStaffMemberStatusDraft(Number(program?.id), newEntryOpen);
  const staffAvailability = useStaffStatusAvailability(Number(program?.id));
  const [closeAction, setCloseAction] = useState("");
  const [closeNotes, setCloseNotes] = useState("");
  const [manualErrors, setManualErrors] = useState<ManualLogFieldErrors & { form?: string }>({});
  useEffect(() => {
    setCloseAction("");
    setCloseNotes("");
    setManualErrors({});
  }, [newEntryOpen, newEntryLogType, program?.id]);
  const dateTimeErrors = isStaffStatus
    ? { date: staffStatus.errors.date, time: staffStatus.errors.time }
    : { date: manualErrors.date, time: manualErrors.time };
  const saveNewLogEntry = () => {
    if (isStaffStatus) {
      const entry = staffStatus.save({ date: newEntryDate, time: newEntryTime });
      if (!entry) return; // inputs kept; errors shown inline
      toast.success(`Staff Member Status logged for ${entry.staffNameAtSave}.`);
      handleCancelNewEntry();
      return;
    }
    const res = createManualLogEntry({
      programId: Number(program?.id),
      logType: newEntryLogType,
      date: newEntryDate,
      time: newEntryTime,
      content: newEntryContent,
      priority: newEntryPriority,
      youth: newEntryYouth,
      programTeam: newEntryProgramTeam,
      other: newEntryOther,
      action: closeAction,
      notes: closeNotes,
    });
    if (!res.ok) {
      setManualErrors(res.fieldErrors ?? { form: MANUAL_LOG_MESSAGES[res.error] });
      return; // form and entered values kept
    }
    toast.success(`${res.entry.logType === "Program Close / Reopen" ? (res.entry.action === "Closing" ? "Program Closed" : "Program Reopened") : res.entry.logType} logged.`);
    handleCancelNewEntry();
  };
  const createDisabled = isStaffStatus
    ? !staffAvailability.canCreate
    : isMilieu
      ? !newEntryContent.trim()
      : !isCloseReopen;

  // US 20185 Chunk 2 — Create Handover checklist draft (UI prototype).
  const handoverChecklist = useHandoverChecklist({
    // Program Log passes the shared ProgramRecord id as a string ("1").
    programId: Number(program?.id),
    shiftValue: handoverShift,
    setShiftValue: setHandoverShift,
    open: handoverDialogOpen,
    // Edit: restore this record's recorded checklist responses.
    initialDraft: (() => {
      const rec = editingHandoverId
        ? handovers?.find((h) => h.id === editingHandoverId)
        : null;
      return rec?.checklist
        ? draftFromSavedResult(rec.checklist, Number(program?.id))
        : null;
    })(),
  });
  // Confirms before AI generation / Start Over would replace typed notes.
  const [noteConfirm, setNoteConfirm] = useState<null | 'ai' | 'startOver'>(null);
  // US 20221 — Staff Member Status block. Create: built from the saved
  // status entries for this Program + date + shift. Edit: the snapshot saved
  // with the handover is restored, unless the date or shift was changed, in
  // which case the new context is previewed and replaces it on save.
  const shiftRoleState = useShiftRoleState();
  const editingHandoverRec = editingHandoverId
    ? handovers?.find((h) => h.id === editingHandoverId)
    : null;
  const savedStaffSnap: StaffStatusSnapshot | null = editingHandoverRec?.staffStatus ?? null;
  const liveStaffSnap = buildStaffStatusSnapshot(
    shiftRoleState.status === "ok" ? shiftRoleState.statusEntries : [],
    Number(program?.id),
    handoverDate,
    handoverShift,
    handoverTime,
  );
  // The effective window changed when date, shift or (overnight) the
  // side of 23:00 changed.
  const sameWindow = (a: StaffStatusSnapshot) =>
    shiftWindow(a.shiftDate, a.shiftKey, a.handoverTime).join() ===
    shiftWindow(handoverDate, handoverShift, handoverTime).join();
  const staffSnap: StaffStatusSnapshot | null = !editingHandoverRec
    ? liveStaffSnap
    : savedStaffSnap && !sameWindow(savedStaffSnap)
      ? liveStaffSnap
      : savedStaffSnap;
  const saveHandoverWithChecklist = () =>
    handleSaveHandover({
      summary: composeHandoverSummary(
        withStaffStatusBlock(handoverNote, staffSnap),
        handoverChecklist.result,
      ),
      narrative: handoverNote,
      checklist: handoverChecklist.result,
      staffStatus: staffSnap,
    });
  return (
    <>

            {/* Email Dialog */}
            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Draft Email to Jim Henson</DialogTitle>
                        <DialogDescription>
                            Create a draft email to follow up on Kermit's evening call.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="email-to" className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>To</Label>
                            <Input
                                id="email-to"
                                value="Jim Henson <jim.henson@example.com>"
                                disabled
                                className="h-9"
                                style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="email-subject" className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Subject</Label>
                            <Input surface="base"
                                id="email-subject"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="email-body" className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Message</Label>
                            <textarea
                                id="email-body"
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                                className="w-full min-h-[200px] px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent resize-none"
                                style={{
                                  border: '1px solid var(--slds-g-color-border-base-1)'
                                }}
                                placeholder="Type your message here..."
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex gap-2">
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="rounded-full"
                            onClick={() => setEmailDialogOpen(false)}
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="button"
                            className="rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 text-white"
                            onClick={() => {
                                // Handle send email
                                setEmailDialogOpen(false);
                            }}
                        >
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Handover Dialog */}
            <Dialog open={handoverDialogOpen} onOpenChange={setHandoverDialogOpen}>
                {/* overflow-clip: the frame must never scroll (focus moves were
                    scrolling it under overflow-hidden, hiding the title); only
                    DialogBody scrolls. */}
                <DialogContent size="xl" className="overflow-clip">
                    <DialogHeader>
                        <DialogTitle className="text-lg">
                            {editingHandoverId ? 'Edit Shift Handover Note' : 'New Shift Handover Note'}
                        </DialogTitle>
                        <DialogDescription style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            {editingHandoverId 
                                ? 'Update the shift handover information below.' 
                                : 'Create a comprehensive shift handover note for the incoming team.'}
                            {' '}Program: <span className="font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{program?.name}</span>
                        </DialogDescription>
                    </DialogHeader>
                    
                    <DialogBody>
                    <div className="space-y-4">
                        {/* Shift Selection */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                Shift
                            </Label>
                            <Select value={handoverShift} onValueChange={handoverChecklist.changeShift}>
                                <SelectTrigger 
                                    className="h-9 rounded-md"
                                    style={{
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                    }}
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="morning">Morning (7A - 3P)</SelectItem>
                                    <SelectItem value="afternoon">Evening (3P - 11P)</SelectItem>
                                    <SelectItem value="night">Overnight (11P - 7A)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                    Date
                                </Label>
                                <DateInput
value={isoToMdy(handoverDate)}
                                    onChange={(v) => ((e) => setHandoverDate(e.target.value))({ target: { value: mdyToIso(v) } })}
                                    className="h-9"
                                    style={{
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                    }}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                    Time
                                </Label>
                                <Input
                                    type="time"
                                    value={handoverTime}
                                    onChange={(e) => setHandoverTime(e.target.value)}
                                    className="h-9"
                                    style={{
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Author */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                Author
                            </Label>
                            <Input
                                value={handoverAuthor}
                                onChange={(e) => setHandoverAuthor(e.target.value)}
                                placeholder="Staff name"
                                className="h-9"
                                style={{
                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                }}
                            />
                        </div>

                        {/* Critical Alerts Count */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                Critical Alerts Count
                            </Label>
                            <Input
                                type="number"
                                min="0"
                                value={handoverCriticalCount}
                                onChange={(e) => setHandoverCriticalCount(parseInt(e.target.value) || 0)}
                                className="h-9"
                                style={{
                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                }}
                            />
                        </div>

                        {/* Checklist (US 20185) — directly above Handover Notes */}
                        <div className="pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                            <HandoverChecklistSection state={handoverChecklist} programName={program?.name ?? ''} />
                        </div>

                        {/* Handover Note Content */}
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                Handover Note
                            </Label>
                            
                            {/* Mode Selection Buttons */}
                            {handoverNoteMode === 'none' && (
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 min-w-0 whitespace-normal h-24 flex flex-col items-center justify-center gap-2 rounded-lg transition-all hover:border-[var(--color-brand-primary)] hover:bg-[var(--slds-g-color-background-brand-primary-lighter)]"
                                        style={{
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            backgroundColor: 'var(--slds-g-color-background-base)'
                                        }}
                                        onClick={() => (handoverNote.trim() ? setNoteConfirm('ai') : handleGenerateAiNote())}
                                    >
                                        <Sparkles className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
                                        <div className="text-center">
                                            <div className="font-semibold text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>AI Generate Notes</div>
                                            <div className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>Auto-create summary from shift data</div>
                                        </div>
                                    </Button>
                                    
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 min-w-0 whitespace-normal h-24 flex flex-col items-center justify-center gap-2 rounded-lg transition-all hover:border-[var(--color-brand-primary)] hover:bg-[var(--slds-g-color-background-brand-primary-lighter)]"
                                        style={{
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            backgroundColor: 'var(--slds-g-color-background-base)'
                                        }}
                                        onClick={() => {
                                            // Keep any text already written.
                                            setHandoverNoteMode('manual');
                                        }}
                                    >
                                        <FileEdit className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
                                        <div className="text-center">
                                            <div className="font-semibold text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>Manual Notes</div>
                                            <div className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>Write notes from scratch</div>
                                        </div>
                                    </Button>
                                </div>
                            )}
                            
                            {/* Loading State */}
                            {isGeneratingAiNote && (
                                <div className="rounded-lg p-8 flex flex-col items-center justify-center gap-3" style={{
                                    backgroundColor: 'var(--slds-g-color-background-alt)',
                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                }}>
                                    <div className="animate-spin h-8 w-8 border-3 border-t-transparent rounded-full" style={{ borderColor: 'var(--color-brand-primary)', borderTopColor: 'transparent' }}></div>
                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>Generating AI summary...</div>
                                    <div className="text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>Analyzing shift data and recent activities</div>
                                </div>
                            )}
                            
                            {/* Textarea (shown after mode selection) */}
                            {(handoverNoteMode === 'ai' || handoverNoteMode === 'manual') && !isGeneratingAiNote && (
                                <div className="space-y-2">
                                    {handoverNoteMode === 'ai' && (
                                        <div className="rounded-md p-2 flex items-center gap-2 text-xs" style={{
                                            backgroundColor: 'var(--slds-g-color-background-success-lighter)',
                                            border: '1px solid var(--slds-g-color-border-success)',
                                            color: 'var(--slds-g-color-text-success)'
                                        }}>
                                            <Sparkles className="h-3.5 w-3.5" />
                                            <span className="font-medium">AI-generated content - You can edit this before saving</span>
                                        </div>
                                    )}
                                    <label htmlFor="handover-staff-notes" className="text-xs font-semibold block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Staff handover notes
                                    </label>
                                    <textarea
                                        id="handover-staff-notes"
                                        value={handoverNote}
                                        onChange={(e) => setHandoverNote(e.target.value)}
                                        className="w-full min-h-[300px] px-3 py-2 text-sm rounded-md focus:outline-none resize-none font-mono"
                                        style={{
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                            color: 'var(--slds-g-color-text-default)'
                                        }}
                                        placeholder="Enter detailed handover notes..."
                                    />
                                    {staffSnap && staffSnap.rows.length > 0 && (
                                        <StaffStatusHandoverBlock
                                            snapshot={staffSnap}
                                            hint="Recorded Staff Member Status entries for this date and shift — added to the summary"
                                        />
                                    )}
                                    {handoverChecklist.result && (
                                        <div className="space-y-1">
                                            <div className="text-xs font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Checklist results — added to the summary from the checklist above
                                            </div>
                                            <pre
                                                aria-label="Checklist results included in the summary"
                                                className="w-full px-3 py-2 text-xs rounded-md whitespace-pre-wrap break-words font-mono"
                                                style={{
                                                    border: '1px dashed var(--slds-g-color-border-base-1)',
                                                    backgroundColor: 'var(--slds-g-color-background-alt)',
                                                    color: 'var(--slds-g-color-text-default)'
                                                }}
                                            >{composeChecklistBlock(handoverChecklist.result)}</pre>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs h-7"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            onClick={() => {
                                                if (handoverNote.trim()) setNoteConfirm('startOver');
                                                else setHandoverNoteMode('none');
                                            }}
                                        >
                                            <X className="h-3 w-3 mr-1" />
                                            Start Over
                                        </Button>
                                        <div className="text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            {handoverNote.length} characters
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    </DialogBody>

                    <AlertDialog open={noteConfirm !== null} onOpenChange={(o) => { if (!o) setNoteConfirm(null); }}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    {noteConfirm === 'ai' ? 'Replace handover notes?' : 'Clear handover notes?'}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    {noteConfirm === 'ai'
                                        ? 'AI-generated notes will replace the staff handover notes you have written. Checklist responses are not affected.'
                                        : 'Starting over clears the staff handover notes you have written. Checklist responses are not affected.'}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-full">Keep My Notes</AlertDialogCancel>
                                <AlertDialogAction
                                    className="rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 text-white"
                                    onClick={() => {
                                        const action = noteConfirm;
                                        setNoteConfirm(null);
                                        if (action === 'ai') handleGenerateAiNote();
                                        else { setHandoverNote(''); setHandoverNoteMode('none'); }
                                    }}
                                >
                                    {noteConfirm === 'ai' ? 'Replace Notes' : 'Clear Notes'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    
                    <DialogFooter className="flex gap-2">
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="rounded-full"
                            onClick={() => {
                                setHandoverDialogOpen(false);
                                setEditingHandoverId(null);
                            }}
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="button"
                            className="rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 text-white"
                            onClick={saveHandoverWithChecklist}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {editingHandoverId ? 'Update' : 'Create'} Handover
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Handover Dialog */}
            <Dialog open={viewHandoverDialogOpen} onOpenChange={setViewHandoverDialogOpen}>
                <DialogContent size="xl" className="overflow-clip">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Shift Handover Details</DialogTitle>
                        <DialogDescription style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            View handover information. Program: <span className="font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{program?.name}</span>
                        </DialogDescription>
                    </DialogHeader>
                    
                    <DialogBody>
                    {viewingHandover && (
                        <div className="space-y-4">
                            {/* Handover Header Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded" style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                <div>
                                    <div className="text-xs font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>Shift</div>
                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        {displayShiftLabel(viewingHandover.shift)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>Author</div>
                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        {viewingHandover.author}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>Date & Time</div>
                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        {viewingHandover.date} at {viewingHandover.timestamp}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>Critical Alerts</div>
                                    <Badge className={cn(
                                        "text-xs",
                                        viewingHandover.criticalCount > 0 
                                            ? "bg-red-50 text-red-700 border-red-200" 
                                            : "bg-green-50 text-green-700 border-green-200"
                                    )}>
                                        {viewingHandover.criticalCount}
                                    </Badge>
                                </div>
                            </div>

                            {/* US 20221 — Staff Member Status, as recorded with this handover */}
                            {viewingHandover.staffStatus && (
                                <StaffStatusHandoverBlock snapshot={viewingHandover.staffStatus} />
                            )}

                            {/* Checklist results (US 20185) — read-only, as recorded */}
                            <div className="space-y-2">
                                <div className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                    Checklist
                                </div>
                                <ChecklistResultsReadOnly result={viewingHandover.checklist} />
                            </div>

                            {/* Handover Content */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                    Shift Summary
                                </Label>
                                <div 
                                    className="p-3 rounded text-sm whitespace-pre-wrap font-mono"
                                    style={{
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: 'var(--slds-g-color-background-alt)',
                                        color: 'var(--slds-g-color-text-default)'
                                    }}
                                >
                                    {viewingHandover.narrative ?? viewingHandover.summary ?? viewingHandover.content}
                                </div>
                            </div>
                        </div>
                    )}
                    </DialogBody>
                    
                    <DialogFooter>
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="rounded-full"
                            onClick={() => {
                                setViewHandoverDialogOpen(false);
                                setViewingHandover(null);
                            }}
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Goals Dialog */}
            <Dialog open={viewGoalsDialogOpen} onOpenChange={setViewGoalsDialogOpen}>
                <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Youth Goals & Progress</DialogTitle>
                        <DialogDescription style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            View goal progress and milestones
                        </DialogDescription>
                    </DialogHeader>
                    
                    {viewingYouthGoals && (() => {
                        // Get mock goals data for this youth - inline data for Fozzie and Kermit
                        const youthGoalsData = viewingYouthGoals.id === 1 ? {
                            totalGoals: 5,
                            completedGoals: 3,
                            overallProgress: 60,
                            goals: [
                                {
                                    id: 1,
                                    title: "Continue mentoring newer residents",
                                    category: "Peer Leadership",
                                    status: "On Track",
                                    progress: 75,
                                    description: "Develop leadership skills by supporting and mentoring new residents.",
                                    milestones: [
                                        { text: "Complete peer mentor training", completed: true, date: "Oct 15, 2025" },
                                        { text: "Successfully mentor first new resident", completed: true, date: "Nov 2, 2025" },
                                        { text: "Lead weekly peer support group", completed: true, date: "Nov 20, 2025" },
                                        { text: "Mentor second new resident", completed: false, date: "Expected Jan 2026" }
                                    ],
                                    recentActivities: [
                                        { date: "Dec 15", activity: "Led peer support group discussion on house rules" },
                                        { date: "Dec 10", activity: "Helped new resident Animal acclimate to routines" }
                                    ],
                                    assignedStaff: "Sarah Mitchell"
                                },
                                {
                                    id: 2,
                                    title: "Maintain zero incident streak",
                                    category: "Behavioral Progress",
                                    status: "Achieved",
                                    progress: 100,
                                    description: "Demonstrate consistent emotional regulation and conflict resolution skills.",
                                    milestones: [
                                        { text: "30 days incident-free", completed: true, date: "Oct 1, 2025" },
                                        { text: "60 days incident-free", completed: true, date: "Nov 1, 2025" },
                                        { text: "90 days incident-free", completed: true, date: "Dec 1, 2025" },
                                        { text: "Complete quarter without incidents", completed: true, date: "Dec 15, 2025" }
                                    ],
                                    recentActivities: [
                                        { date: "Dec 15", activity: "Completed 105 consecutive days incident-free" },
                                        { date: "Dec 10", activity: "Successfully de-escalated potential conflict with peer" }
                                    ],
                                    assignedStaff: "Michael Chen"
                                },
                                {
                                    id: 3,
                                    title: "Academic achievement - maintain B average",
                                    category: "Education",
                                    status: "On Track",
                                    progress: 80,
                                    description: "Maintain consistent academic performance across all subjects.",
                                    milestones: [
                                        { text: "Complete first quarter with B average", completed: true, date: "Nov 15, 2025" },
                                        { text: "Improve math grade from C to B", completed: true, date: "Dec 1, 2025" },
                                        { text: "Complete second quarter with B average", completed: false, date: "Expected Feb 2026" }
                                    ],
                                    recentActivities: [
                                        { date: "Dec 15", activity: "Received B+ on math final exam" },
                                        { date: "Dec 10", activity: "Tutoring session - focused on algebra" }
                                    ],
                                    assignedStaff: "Robert Brown"
                                },
                                {
                                    id: 4,
                                    title: "Develop independent living skills",
                                    category: "Life Skills",
                                    status: "In Progress",
                                    progress: 45,
                                    description: "Build skills for successful transition to independent living.",
                                    milestones: [
                                        { text: "Complete basic cooking course", completed: true, date: "Nov 30, 2025" },
                                        { text: "Develop personal budget plan", completed: false, date: "Expected Jan 2026" },
                                        { text: "Manage own schedule independently", completed: false, date: "Expected Mar 2026" }
                                    ],
                                    recentActivities: [
                                        { date: "Dec 15", activity: "Prepared dinner for house independently" },
                                        { date: "Dec 12", activity: "Attended budgeting workshop" }
                                    ],
                                    assignedStaff: "Lisa Anderson"
                                },
                                {
                                    id: 5,
                                    title: "Build family connections",
                                    category: "Family Engagement",
                                    status: "In Progress",
                                    progress: 35,
                                    description: "Strengthen family relationships through regular contact and therapy.",
                                    milestones: [
                                        { text: "Schedule bi-weekly family calls", completed: true, date: "Oct 30, 2025" },
                                        { text: "Complete 4 family therapy sessions", completed: false, date: "Expected Feb 2026" },
                                        { text: "Participate in family visit", completed: false, date: "Expected Mar 2026" }
                                    ],
                                    recentActivities: [
                                        { date: "Dec 15", activity: "Positive family call - discussed holiday plans" },
                                        { date: "Dec 8", activity: "Second family therapy session completed" }
                                    ],
                                    assignedStaff: "David Thompson"
                                }
                            ]
                        } : {
                            // Kermit's goals
                            totalGoals: 4,
                            completedGoals: 2,
                            overallProgress: 55,
                            goals: [
                                {
                                    id: 1,
                                    title: "Practice conflict resolution skills",
                                    category: "Behavioral Skills",
                                    status: "On Track",
                                    progress: 70,
                                    description: "Learn and apply conflict resolution techniques in daily interactions.",
                                    milestones: [
                                        { text: "Complete conflict resolution training", completed: true, date: "Nov 1, 2025" },
                                        { text: "Apply skills in 3 real situations", completed: true, date: "Dec 1, 2025" },
                                        { text: "Lead conflict mediation session", completed: false, date: "Expected Feb 2026" }
                                    ],
                                    recentActivities: [
                                        { date: "Dec 16", activity: "Successfully resolved disagreement with peer using I-statements" },
                                        { date: "Dec 12", activity: "Practiced de-escalation techniques in group" }
                                    ],
                                    assignedStaff: "David Thompson"
                                },
                                {
                                    id: 2,
                                    title: "Increase frustration tolerance",
                                    category: "Emotional Regulation",
                                    status: "In Progress",
                                    progress: 60,
                                    description: "Develop coping strategies for managing frustration.",
                                    milestones: [
                                        { text: "Identify personal frustration triggers", completed: true, date: "Oct 5, 2025" },
                                        { text: "Learn 3 coping strategies", completed: true, date: "Nov 10, 2025" },
                                        { text: "Use coping skills independently 5 times", completed: false, date: "Expected Jan 2026" }
                                    ],
                                    recentActivities: [
                                        { date: "Dec 16", activity: "Used breathing exercises during math homework" },
                                        { date: "Dec 13", activity: "Requested break when feeling overwhelmed" }
                                    ],
                                    assignedStaff: "Jessica Martinez"
                                },
                                {
                                    id: 3,
                                    title: "Improve medication compliance",
                                    category: "Health & Wellness",
                                    status: "Needs Attention",
                                    progress: 40,
                                    description: "Take all prescribed medications consistently and on schedule.",
                                    milestones: [
                                        { text: "Understand medication schedule", completed: true, date: "Nov 10, 2025" },
                                        { text: "Zero missed doses for 2 weeks", completed: false, date: "In Progress" },
                                        { text: "Self-advocate for medication needs", completed: false, date: "Expected Feb 2026" }
                                    ],
                                    recentActivities: [
                                        { date: "Dec 16", activity: "Missed morning medication - reminder system discussed" },
                                        { date: "Dec 14", activity: "Met with nurse about medication importance" }
                                    ],
                                    assignedStaff: "Amanda Wilson"
                                },
                                {
                                    id: 4,
                                    title: "Strengthen family communication",
                                    category: "Family Engagement",
                                    status: "On Track",
                                    progress: 75,
                                    description: "Maintain regular, positive communication with father and family members.",
                                    milestones: [
                                        { text: "Schedule weekly family calls", completed: true, date: "Oct 15, 2025" },
                                        { text: "Complete 8 successful family calls", completed: true, date: "Dec 5, 2025" },
                                        { text: "Participate in family therapy session", completed: true, date: "Dec 10, 2025" }
                                    ],
                                    recentActivities: [
                                        { date: "Dec 16", activity: "Called father after 7 PM as scheduled" },
                                        { date: "Dec 13", activity: "Discussed summer program plans with dad" }
                                    ],
                                    assignedStaff: "Michael Chen"
                                }
                            ]
                        };

                        return (
                            <div className="space-y-5 py-4">
                                {/* Header Section - Combined Youth Profile & Progress */}
                                <div 
                                    className="rounded-lg p-6"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                    }}
                                >
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between gap-6 mb-3">
                                            <div className="flex items-stretch gap-3 flex-1">
                                                <div className="flex items-center" style={{ color: '#145F33' }}>
                                                    <Target className="w-10 h-10" strokeWidth={1.5} />
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <h3 className="text-[16px] font-semibold text-[#080707]">Treatment Goals</h3>
                                                    <p className="text-[13px] text-[#706e6b] mt-0.5">{viewingYouthGoals.name}</p>
                                                </div>
                                            </div>
                                            
                                            <Button
                                                onClick={() => {
                                                    setNewGoal({
                                                        goal: "",
                                                        goalText: "",
                                                        relatedPTPStatement: "",
                                                        reasonForGoal: "",
                                                        pointPersonName: "",
                                                        outcomeDomain: "",
                                                        startDate: "",
                                                        targetDuration: "",
                                                        targetEndDate: "",
                                                        endDate: "",
                                                        goalPercentage: "",
                                                        targetDate: "",
                                                        category: "",
                                                        parentId: null,
                                                        progress: 0,
                                                        description: "",
                                                        enrollee: viewingYouthGoals.name,
                                                        youthNotes: "",
                                                        enrolleeCount: 1
                                                    });
                                                    setShowAddGoal(showAddGoal === 'top' ? null : 'top');
                                                }}
                                                className="h-9 px-4 rounded-full text-[13px] font-medium"
                                                style={{
                                                    backgroundColor: '#145F33',
                                                    color: 'white'
                                                }}
                                            >
                                                <Plus className="w-4 h-4 mr-1.5" />
                                                New Goal
                                            </Button>
                                        </div>
                                        
                                        {/* Overall Progress Stats - Horizontal Bar */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-[13px] font-semibold text-[#145F33]">
                                                        {calculateOverallProgress()}%
                                                    </span>
                                                    <span className="text-[11px] text-[#706e6b]">
                                                        {goals.filter(g => g.parentId === null && g.progress === 100).length}/{goals.filter(g => g.parentId === null).length} Complete
                                                    </span>
                                                </div>
                                                <div 
                                                    className="h-2 rounded-full overflow-hidden"
                                                    style={{ backgroundColor: 'var(--slds-g-color-border-base-1)' }}
                                                >
                                                    <div 
                                                        className="h-full rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${calculateOverallProgress()}%`,
                                                            backgroundColor: '#145F33'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Add Goal Form */}
                                {showAddGoal === 'top' && (
                                    <div 
                                      className="p-5 rounded"
                                      style={{
                                        backgroundColor: 'var(--slds-g-color-background-alt)',
                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                      }}
                                    >
                                        <div className="space-y-4">
                                            {/* Goal Title */}
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-semibold text-[#080707]">Goal Title *</Label>
                                                <Input
                                                    value={newGoal.goal}
                                                    onChange={(e) => setNewGoal({...newGoal, goal: e.target.value})}
                                                    className="h-9 text-[13px] rounded"
                                                    style={{
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                    }}
                                                    placeholder="Enter goal title"
                                                />
                                            </div>

                                            {/* Goal Description */}
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-semibold text-[#080707]">Goal Description *</Label>
                                                <Textarea
                                                    value={newGoal.goalText}
                                                    onChange={(e) => setNewGoal({...newGoal, goalText: e.target.value})}
                                                    className="min-h-[80px] text-[13px] rounded resize-none"
                                                    style={{
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                    }}
                                                    placeholder="Enter detailed goal description..."
                                                />
                                            </div>

                                            {/* Category and Target Date Row */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">Category</Label>
                                                    <Input
                                                        value={newGoal.category}
                                                        onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                                                        className="h-9 text-[13px] rounded"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                                        }}
                                                        placeholder="e.g., Education, Clinical, Family"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">Target Date *</Label>
                                                    <DateInput
value={isoToMdy(newGoal.targetDate)}
                                                        onChange={(v) => ((e) => setNewGoal({...newGoal, targetDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                        className="h-9 text-[13px] rounded"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                <Button
                                                    onClick={() => {
                                                        setShowAddGoal(null);
                                                        setNewGoal({ 
                                                            goal: "", 
                                                            goalText: "",
                                                            relatedPTPStatement: "",
                                                            reasonForGoal: "",
                                                            pointPersonName: "",
                                                            outcomeDomain: "",
                                                            startDate: "",
                                                            targetDuration: "",
                                                            targetEndDate: "",
                                                            endDate: "",
                                                            goalPercentage: "",
                                                            targetDate: "", 
                                                            category: "", 
                                                            parentId: null, 
                                                            progress: 0, 
                                                            description: "",
                                                            enrollee: viewingYouthGoals.name,
                                                            youthNotes: "",
                                                            enrolleeCount: 1
                                                        });
                                                    }}
                                                    className="h-9 px-4 rounded-full text-[13px] font-medium"
                                                    style={{
                                                        backgroundColor: 'transparent',
                                                        color: '#706e6b',
                                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleAddGoal}
                                                    disabled={!newGoal.goal || !newGoal.targetDate}
                                                    className="h-9 px-4 rounded-full text-[13px] font-medium"
                                                    style={{
                                                        backgroundColor: '#145F33',
                                                        color: 'white',
                                                        opacity: (!newGoal.goal || !newGoal.targetDate) ? 0.5 : 1
                                                    }}
                                                >
                                                    Add Goal
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Goals List */}
                                <div className="space-y-4">
                                    {goals.length === 0 && !showAddGoal && (
                                        <div className="text-center py-8" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            <Target className="w-12 h-12 mx-auto mb-2 opacity-40" />
                                            <p className="text-sm">No goals added yet. Click "New Goal" to get started.</p>
                                        </div>
                                    )}
                                    
                                    {goals.filter(g => g.parentId === null).map((goal: any) => (
                                        <div 
                                            key={goal.id}
                                            className="border rounded-lg p-4 space-y-3"
                                            style={{ 
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'var(--slds-g-color-background-base)'
                                            }}
                                        >
                                            {/* Goal Header */}
                                            {editingGoalId === goal.id ? (
                                                <div className="space-y-4">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[11px] font-semibold text-[#080707]">Goal Title *</Label>
                                                        <Input
                                                            value={editGoalData.goal}
                                                            onChange={(e) => setEditGoalData({...editGoalData, goal: e.target.value})}
                                                            className="h-9 text-[13px] rounded"
                                                            style={{
                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[11px] font-semibold text-[#080707]">Category</Label>
                                                        <Input
                                                            value={editGoalData.category}
                                                            onChange={(e) => setEditGoalData({...editGoalData, category: e.target.value})}
                                                            className="h-9 text-[13px] rounded"
                                                            style={{
                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-[11px] font-semibold text-[#080707]">Target Date</Label>
                                                            <DateInput
value={isoToMdy(editGoalData.targetDate)}
                                                                onChange={(v) => ((e) => setEditGoalData({...editGoalData, targetDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                                className="h-9 text-[13px] rounded"
                                                                style={{
                                                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-[11px] font-semibold text-[#080707]">Progress (%)</Label>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                value={editGoalData.progress}
                                                                onChange={(e) => setEditGoalData({...editGoalData, progress: parseInt(e.target.value) || 0})}
                                                                className="h-9 text-[13px] rounded"
                                                                style={{
                                                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-2 pt-3" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                        <Button
                                                            onClick={handleCancelEditGoal}
                                                            className="h-8 px-3 rounded-full text-[13px]"
                                                            style={{
                                                                backgroundColor: 'transparent',
                                                                color: '#706e6b',
                                                                border: '1px solid var(--slds-g-color-border-base-1)'
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            onClick={handleSaveGoal}
                                                            className="h-8 px-3 rounded-full text-[13px]"
                                                            style={{
                                                                backgroundColor: '#145F33',
                                                                color: 'white'
                                                            }}
                                                        >
                                                            Save
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {goal.goal}
                                                                </h4>
                                                                <Badge 
                                                                    className="text-[10px] px-2 py-0.5"
                                                                    style={{
                                                                        backgroundColor: goal.progress === 100 ? '#E6F4EA' : goal.progress >= 50 ? '#E8F5E9' : '#FEF7E0',
                                                                        color: goal.progress === 100 ? '#0B8043' : goal.progress >= 50 ? '#145F33' : '#705E2E',
                                                                        border: 'none'
                                                                    }}
                                                                >
                                                                    {goal.progress === 100 ? 'Achieved' : goal.progress >= 50 ? 'On Track' : 'In Progress'}
                                                                </Badge>
                                                            </div>
                                                            {goal.category && (
                                                                <p className="text-xs mb-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                    {goal.category}
                                                                </p>
                                                            )}
                                                            {goal.goalText && (
                                                                <p className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {goal.goalText}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-right mr-2">
                                                                <div className="text-xl font-bold" style={{ color: '#145F33' }}>
                                                                    {goal.progress}%
                                                                </div>
                                                                <div className="text-[10px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                    Complete
                                                                </div>
                                                            </div>
                                                            <Button
                                                                onClick={() => handleEditGoal(goal.id)}
                                                                className="h-7 w-7 p-0 rounded-full"
                                                                style={{
                                                                    backgroundColor: 'transparent',
                                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                                }}
                                                            >
                                                                <Edit2 className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleDeleteGoal(goal.id)}
                                                                className="h-7 w-7 p-0 rounded-full"
                                                                style={{
                                                                    backgroundColor: 'transparent',
                                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                                }}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" style={{ color: '#BA0517' }} />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--slds-g-color-border-base-1)' }}>
                                                        <div 
                                                            className="h-full rounded-full transition-all"
                                                            style={{ 
                                                                width: `${goal.progress}%`,
                                                                backgroundColor: '#145F33'
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Target Date */}
                                                    {goal.targetDate && (
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                            <span className="text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                Target Date: {formatMdy(new Date(goal.targetDate))}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Comments Section */}
                                                    <div className="pt-3" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <MessageSquare className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                                <span className="text-xs font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    Comments ({goal.comments?.length || 0})
                                                                </span>
                                                            </div>
                                                            <Button
                                                                onClick={() => setShowCommentForm(showCommentForm === goal.id ? null : goal.id)}
                                                                className="h-7 px-2 rounded-full text-[11px]"
                                                                style={{
                                                                    backgroundColor: 'transparent',
                                                                    color: '#145F33',
                                                                    border: '1px solid #145F33'
                                                                }}
                                                            >
                                                                <Plus className="w-3 h-3 mr-1" />
                                                                Add Comment
                                                            </Button>
                                                        </div>

                                                        {showCommentForm === goal.id && (
                                                            <div className="mb-3 space-y-2">
                                                                <Textarea
                                                                    value={newComment}
                                                                    onChange={(e) => setNewComment(e.target.value)}
                                                                    placeholder="Add a comment..."
                                                                    className="text-[13px] rounded min-h-[60px] resize-none"
                                                                    style={{
                                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                                    }}
                                                                />
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        onClick={() => {
                                                                            setShowCommentForm(null);
                                                                            setNewComment("");
                                                                        }}
                                                                        className="h-7 px-3 rounded-full text-[11px]"
                                                                        style={{
                                                                            backgroundColor: 'transparent',
                                                                            color: '#706e6b',
                                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                                        }}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() => handleAddComment(goal.id)}
                                                                        disabled={!newComment.trim()}
                                                                        className="h-7 px-3 rounded-full text-[11px]"
                                                                        style={{
                                                                            backgroundColor: '#145F33',
                                                                            color: 'white',
                                                                            opacity: !newComment.trim() ? 0.5 : 1
                                                                        }}
                                                                    >
                                                                        Post
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {goal.comments && goal.comments.length > 0 && (
                                                            <div className="space-y-2">
                                                                {goal.comments.map((comment: any) => (
                                                                    <div key={comment.id} className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                                        <div className="flex items-center justify-between mb-1">
                                                                            <span className="text-xs font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                                {comment.author}
                                                                            </span>
                                                                            <span className="text-[10px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                                {comment.date} at {comment.time}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                            {comment.text}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                    
                    <DialogFooter>
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="rounded-full"
                            onClick={() => {
                                setViewGoalsDialogOpen(false);
                                setViewingYouthGoals(null);
                            }}
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Incident Details Dialog */}
            <IncidentDetailsDialog
                open={incidentDialogOpen}
                onOpenChange={setIncidentDialogOpen}
                incidentYouth={incidentYouth}
                program={program}
                incidentTab={incidentTab}
                setIncidentTab={setIncidentTab}
                incidentType={incidentType}
                setIncidentType={setIncidentType}
                incidentLocation={incidentLocation}
                setIncidentLocation={setIncidentLocation}
                incidentStartDate={incidentStartDate}
                setIncidentStartDate={setIncidentStartDate}
                incidentStartTime={incidentStartTime}
                setIncidentStartTime={setIncidentStartTime}
                incidentEndDate={incidentEndDate}
                setIncidentEndDate={setIncidentEndDate}
                incidentEndTime={incidentEndTime}
                setIncidentEndTime={setIncidentEndTime}
                incidentOverview={incidentOverview}
                setIncidentOverview={setIncidentOverview}
                incidentNarrative={incidentNarrative}
                setIncidentNarrative={setIncidentNarrative}
                incidentResponse={incidentResponse}
                setIncidentResponse={setIncidentResponse}
                incidentPersonsContacted={incidentPersonsContacted}
                setIncidentPersonsContacted={setIncidentPersonsContacted}
                incidentYouthInjuries={incidentYouthInjuries}
                setIncidentYouthInjuries={setIncidentYouthInjuries}
                incidentRestraints={incidentRestraints}
                setIncidentRestraints={setIncidentRestraints}
                incidentDebriefParticipants={incidentDebriefParticipants}
                setIncidentDebriefParticipants={setIncidentDebriefParticipants}
                incidentDebriefNotes={incidentDebriefNotes}
                setIncidentDebriefNotes={setIncidentDebriefNotes}
                incidentFinalized={incidentFinalized}
                incidentYouthList={incidentYouthList}
                setIncidentYouthList={setIncidentYouthList}
                handleCancelIncident={handleCancelIncident}
                handleSaveIncident={handleSaveIncident}
                handleFinalizeIncident={handleFinalizeIncident}
                canFinalizeIncident={canFinalizeIncident}
                handleAddPersonContacted={handleAddPersonContacted}
                handleRemovePersonContacted={handleRemovePersonContacted}
                handleAddYouthInjury={handleAddYouthInjury}
                handleRemoveYouthInjury={handleRemoveYouthInjury}
                handleAddRestraint={handleAddRestraint}
                handleRemoveRestraint={handleRemoveRestraint}
                handleAddDebriefParticipant={handleAddDebriefParticipant}
                handleRemoveDebriefParticipant={handleRemoveDebriefParticipant}
                handleAddIncidentYouth={handleAddIncidentYouth}
                handleRemoveIncidentYouth={handleRemoveIncidentYouth}
                handleSetPrimaryYouth={handleSetPrimaryYouth}
            />

            {/* Delete Handover Confirmation Dialog */}
            <Dialog open={deleteHandoverDialogOpen} onOpenChange={setDeleteHandoverDialogOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Delete Handover Note</DialogTitle>
                        <DialogDescription style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            Are you sure you want to delete this handover note? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2">
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="rounded-full"
                            onClick={() => {
                                setDeleteHandoverDialogOpen(false);
                                setHandoverToDelete(null);
                            }}
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="button"
                            className="rounded-full bg-red-600 hover:bg-red-700 text-white"
                            onClick={confirmDeleteHandover}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Filter Dialog */}
            <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Filter Log Entries</DialogTitle>
                        <DialogDescription style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            Apply filters to refine your log feed view
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        {/* Entry Types */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                Entry Type
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {logTypes.map(type => (
                                    <div key={type} className="flex items-center">
                                        <Checkbox surface="base"
                                            id={`type-${type}`}
                                            checked={selectedTypes.includes(type)}
                                            onCheckedChange={() => toggleType(type)}
                                        />
                                        <Label 
                                            htmlFor={`type-${type}`}
                                            className="ml-2 text-sm cursor-pointer"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            {type}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Authors */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                Author
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {authors.map(author => (
                                    <div key={author} className="flex items-center">
                                        <Checkbox surface="base"
                                            id={`author-${author}`}
                                            checked={selectedAuthors.includes(author)}
                                            onCheckedChange={() => toggleAuthor(author)}
                                        />
                                        <Label 
                                            htmlFor={`author-${author}`}
                                            className="ml-2 text-sm cursor-pointer"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            {author}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                Priority Level
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {["Low", "Medium", "High"].map(priority => (
                                    <div key={priority} className="flex items-center">
                                        <Checkbox surface="base"
                                            id={`priority-${priority}`}
                                            checked={selectedPriorities.includes(priority)}
                                            onCheckedChange={() => togglePriority(priority)}
                                        />
                                        <Label 
                                            htmlFor={`priority-${priority}`}
                                            className="ml-2 text-sm cursor-pointer"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            {priority}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Youth Filter */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                Youth
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {(YOUTH_STATUS || []).map(youth => (
                                    <div key={youth.id} className="flex items-center">
                                        <Checkbox surface="base"
                                            id={`youth-${youth.id}`}
                                            checked={selectedYouthFilter.includes(youth.name)}
                                            onCheckedChange={() => toggleYouthFilter(youth.name)}
                                        />
                                        <Label 
                                            htmlFor={`youth-${youth.id}`}
                                            className="ml-2 text-sm cursor-pointer"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            {youth.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Observations (20044) */}
                        <ObservationFilterSection
                            selected={selectedObservationFilter}
                            onToggle={toggleObservationFilter}
                            idPrefix="obs-filter"
                        />
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="rounded-full"
                            onClick={clearAllFilters}
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                        >
                            Clear All
                        </Button>
                        <Button 
                            type="button"
                            className="rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 text-white"
                            onClick={() => setFilterOpen(false)}
                        >
                            Apply Filters
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Handover Confirmation Dialog */}
            <Dialog open={deleteHandoverDialogOpen} onOpenChange={setDeleteHandoverDialogOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Delete Handover Note</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this handover note? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div 
                        className="p-4 rounded-md flex items-start gap-3"
                        style={{ backgroundColor: 'var(--slds-g-color-background-warning)' }}
                    >
                        <AlertTriangle className="h-5 w-5 text-[#ba0517] shrink-0 mt-0.5" />
                        <div className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            This handover note will be permanently removed from the system. Any staff members who may need this information will no longer have access to it.
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="rounded-full"
                            onClick={() => {
                                setDeleteHandoverDialogOpen(false);
                                setHandoverToDelete(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="button" 
                            className="rounded-full bg-[#ba0517] hover:bg-[#ba0517]/90 text-white"
                            onClick={confirmDeleteHandover}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Delete Note
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Program Log Task Detail Modal ──────────────────────── */}
            {plDetailTask && (()=>{
                const closed=plDetailTask.status==="Completed"||plDetailTask.status==="Cancelled";
                const fld=(label:string,val:string,node:React.ReactNode)=>(
                    <div className="space-y-1.5">
                        <label className="slds-form-label" style={{color:"var(--slds-g-color-text-weak)"}}>{label}</label>
                        {closed?<div className="h-9 flex items-center px-3 rounded slds-text-4" style={{border:"1px solid var(--slds-g-color-border-base-1)",backgroundColor:"var(--slds-g-color-neutral-95)",color:"var(--slds-g-color-text-weak)"}}>{val||"—"}</div>:node}
                    </div>
                );
                return (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center" style={{backgroundColor:"rgba(0,0,0,0.45)"}}>
                        <div className="rounded-lg w-full max-w-3xl mx-4 flex flex-col overflow-hidden" style={{maxHeight:"90vh",backgroundColor:"var(--slds-g-color-background-base)",border:"1px solid var(--slds-g-color-border-base-1)",boxShadow:"0 8px 32px rgba(0,0,0,0.22)"}}>
                            <div className="px-6 py-4 flex items-start justify-between flex-shrink-0 gap-3" style={{borderBottom:"1px solid var(--slds-g-color-border-base-1)",backgroundColor:"var(--slds-g-color-background-alt)"}}>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <h3 className="slds-text-5 font-semibold truncate" style={{color:"var(--slds-g-color-text-default)"}}>{plDetailTask.subject}</h3>
                                        {plDetailTask.isSystem&&<span className="slds-text-3 px-1.5 py-0.5 rounded font-medium flex-shrink-0" style={{backgroundColor:"rgba(146,64,14,0.08)",color:"#92400E",border:"1px solid rgba(146,64,14,0.2)"}}>System</span>}
                                    </div>
                                    {(() => {
                                        const sub = plDetailTask.subject.toLowerCase();
                                        let url = "", label = "";
                                        if (plDetailTask.isSystem) {
                                            if (sub.includes("itp")) { url = "/itp-module"; label = "Open ITP Module"; }
                                            else if (sub.includes("contact log") || sub.includes("call back")) { url = "/contact-log"; label = "Open Contact Log"; }
                                            else if (sub.includes("medication") || sub.includes("med")) { url = "/medications"; label = "Open Medications"; }
                                            else if (sub.includes("connection") || sub.includes("finalize")) { url = "/"; label = "Open Admissions"; }
                                            else if (sub.includes("cpi")) { url = "/constituents"; label = "Open Constituents"; }
                                            else { url = "/"; label = "Open Related Page"; }
                                        } else if (plDetailTask.relatedTo) {
                                            url = "/constituents"; label = `View ${plDetailTask.relatedTo}'s Profile`;
                                        }
                                        if (!url) return null;
                                        return (
                                            <a href={url} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 mt-1 slds-text-3 font-medium hover:underline"
                                                style={{color:"#0176d3"}}>
                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                {label}
                                            </a>
                                        );
                                    })()}
                                </div>
                                <button onClick={()=>setPlDetailTask(null)} className="p-1.5 rounded hover:bg-gray-200 flex-shrink-0" style={{color:"var(--slds-g-color-text-weak)"}}><X className="h-5 w-5"/></button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <div className="px-6 py-5 grid grid-cols-2 gap-4" style={{borderBottom:"1px solid var(--slds-g-color-border-base-1)"}}>
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="slds-form-label" style={{color:"var(--slds-g-color-text-weak)"}}>SUBJECT <span className="text-red-600">*</span></label>
                                        {closed?<div className="h-9 flex items-center px-3 rounded slds-text-4" style={{border:"1px solid var(--slds-g-color-border-base-1)",backgroundColor:"var(--slds-g-color-neutral-95)",color:"var(--slds-g-color-text-weak)"}}>{plDS}</div>:
                                        <input type="text" value={plDS} onChange={e=>setPlDS(e.target.value)} className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none" style={{border:"1px solid var(--slds-g-color-border-base-1)",backgroundColor:"var(--slds-g-color-background-base)",color:"var(--slds-g-color-text-default)"}}/>}
                                    </div>
                                    {fld("DUE DATE",plDD,<DateInput value={plDD} onChange={setPlDD} style={{borderColor:"var(--slds-g-color-border-base-1)"}}/>)}
                                    {fld("STATUS",plDSt,
                                        <Select value={plDSt} onValueChange={v=>setPlDSt(v as PlTaskStatus)}>
                                            <SelectTrigger surface="base" className="h-9 slds-text-4" style={{borderColor:"var(--slds-g-color-border-base-1)"}}><SelectValue/></SelectTrigger>
                                            <SelectContent>{(["Open","In Progress","On Hold"] as PlTaskStatus[]).map(s=><SelectItem key={s} value={s} className="slds-text-4">{s}</SelectItem>)}</SelectContent>
                                        </Select>
                                    )}
                                    {fld("ASSIGNED TO",plDA,
                                        <Select value={plDA} onValueChange={setPlDA}>
                                            <SelectTrigger surface="base" className="h-9 slds-text-4" style={{borderColor:"var(--slds-g-color-border-base-1)"}}><SelectValue/></SelectTrigger>
                                            <SelectContent>{PL_STAFF.map(s=><SelectItem key={s} value={s} className="slds-text-4">{s}</SelectItem>)}</SelectContent>
                                        </Select>
                                    )}
                                    {fld("RELATED TO",plDR,
                                        <Select value={plDR||"__none__"} onValueChange={v=>setPlDR(v==="__none__"?"":v)}>
                                            <SelectTrigger surface="base" className="h-9 slds-text-4" style={{borderColor:"var(--slds-g-color-border-base-1)"}}><SelectValue placeholder="None"/></SelectTrigger>
                                            <SelectContent><SelectItem value="__none__" className="slds-text-4">None</SelectItem>{PL_CONSTITUENTS.map(c=><SelectItem key={c} value={c} className="slds-text-4">{c}</SelectItem>)}</SelectContent>
                                        </Select>
                                    )}
                                    <div className="col-span-2 flex items-center gap-6">
                                        {[{icon:User,label:"Created by",val:plDetailTask.createdBy},{icon:Calendar,label:"Created",val:plDetailTask.createDate},{icon:Clock,label:"Modified",val:plDetailTask.modifiedDate}].map(({icon:Icon,label,val})=>(
                                            <div key={label} className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" style={{color:"var(--slds-g-color-text-weak)"}}/><span className="slds-text-3" style={{color:"var(--slds-g-color-text-weak)"}}>{label}:</span><span className="slds-text-3" style={{color:"var(--slds-g-color-text-default)"}}>{val}</span></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="px-6 py-4">
                                    <p className="slds-text-3 font-semibold mb-3" style={{color:"var(--slds-g-color-text-weak)"}}>TASK HISTORY</p>
                                    <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                                        {plDetailTask.history.length===0&&<p className="slds-text-4 italic" style={{color:"var(--slds-g-color-text-weak)"}}>No history yet.</p>}
                                        {plDetailTask.history.map(entry=>(
                                            <div key={entry.id} className="flex items-start gap-3">
                                                {entry.type==="comment"?(
                                                    <>
                                                        <div className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{backgroundColor:"rgba(1,118,211,0.12)",color:"#0176d3"}}><MessageSquare className="h-3.5 w-3.5"/></div>
                                                        <div className="flex-1 rounded-lg px-3 py-2" style={{backgroundColor:"var(--slds-g-color-background-alt)",border:"1px solid var(--slds-g-color-border-base-1)"}}>
                                                            <div className="flex items-center gap-2 mb-1"><span className="slds-text-3 font-semibold" style={{color:"var(--slds-g-color-text-default)"}}>{entry.author}</span><span className="slds-text-3" style={{color:"var(--slds-g-color-text-weak)"}}>{entry.timestamp}</span></div>
                                                            <p className="slds-text-4" style={{color:"var(--slds-g-color-text-default)"}}>{entry.comment}</p>
                                                        </div>
                                                    </>
                                                ):(
                                                    <>
                                                        <div className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{backgroundColor:"rgba(20,95,51,0.1)",color:"#145F33"}}><Tag className="h-3.5 w-3.5"/></div>
                                                        <div className="flex-1 py-1">
                                                            <span className="slds-text-3 font-semibold" style={{color:"var(--slds-g-color-text-default)"}}>{entry.author}</span>
                                                            <span className="slds-text-3" style={{color:"var(--slds-g-color-text-weak)"}}> changed </span>
                                                            <span className="slds-text-3 font-semibold" style={{color:"var(--slds-g-color-text-default)"}}>{entry.field}</span>
                                                            {entry.oldValue?<><span className="slds-text-3" style={{color:"var(--slds-g-color-text-weak)"}}> from </span><span className="slds-text-3 font-medium" style={{color:"#c23934"}}>{entry.oldValue}</span><span className="slds-text-3" style={{color:"var(--slds-g-color-text-weak)"}}> to </span><span className="slds-text-3 font-medium" style={{color:"#145F33"}}>{entry.newValue}</span></>:<><span className="slds-text-3" style={{color:"var(--slds-g-color-text-weak)"}}> set to </span><span className="slds-text-3 font-medium" style={{color:"#145F33"}}>{entry.newValue}</span></>}
                                                            <span className="slds-text-3 ml-2" style={{color:"var(--slds-g-color-text-weak)"}}>· {entry.timestamp}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {!closed&&(
                                        <div className="mt-4 flex items-start gap-2">
                                            <input type="text" value={plComment} onChange={e=>setPlComment(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&addPlComment()} placeholder="Add a comment…" className="flex-1 h-9 px-3 rounded slds-text-4 focus:outline-none" style={{border:"1px solid var(--slds-g-color-border-base-1)",backgroundColor:"var(--slds-g-color-background-base)",color:"var(--slds-g-color-text-default)"}}/>
                                            <button onClick={addPlComment} disabled={!plComment.trim()} className="h-9 w-9 rounded-full flex items-center justify-center disabled:opacity-40" style={{backgroundColor:"#145F33",color:"white"}}><Send className="h-4 w-4"/></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0" style={{borderTop:"1px solid var(--slds-g-color-border-base-1)",backgroundColor:"var(--slds-g-color-background-alt)"}}>
                                <div className="flex items-center gap-2">
                                    {!closed&&<>
                                        <button onClick={completePlTask} className="h-9 px-4 rounded-full slds-text-4 font-medium flex items-center gap-1.5 text-white" style={{backgroundColor:"#145F33"}}><CheckCircle className="h-4 w-4"/>Complete</button>
                                        <button onClick={cancelPlTask} className="h-9 px-4 rounded-full slds-text-4 font-medium flex items-center gap-1.5" style={{border:"1px solid #c23934",color:"#c23934",backgroundColor:"var(--slds-g-color-background-base)"}}><XCircle className="h-4 w-4"/>Cancel Task</button>
                                    </>}
                                    {closed&&<div className="flex items-center gap-3">
                                        <span className="slds-text-3 italic" style={{color:"var(--slds-g-color-text-weak)"}}>This task is {plDetailTask.status.toLowerCase()} and cannot be edited.</span>
                                        <button onClick={reopenPlTask} className="h-9 px-4 rounded-full slds-text-4 font-medium flex items-center gap-1.5" style={{border:"1px solid #0176d3",color:"#0176d3",backgroundColor:"var(--slds-g-color-background-base)"}}><CheckCircle className="h-4 w-4"/>Re-Open</button>
                                    </div>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={()=>setPlDetailTask(null)} className="h-9 px-4 rounded-full slds-text-4 font-medium" style={{border:"1px solid var(--slds-g-color-border-base-1)",color:"var(--slds-g-color-text-default)",backgroundColor:"var(--slds-g-color-background-base)"}}>Close</button>
                                    {!closed&&<button onClick={savePlDetail} className="h-9 px-4 rounded-full slds-text-4 font-medium text-white" style={{backgroundColor:"#145F33"}}>Save Changes</button>}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Task Detail Dialog */}
            <Dialog open={taskDetailOpen} onOpenChange={setTaskDetailOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Task Details</DialogTitle>
                        <DialogDescription>
                            View and manage task information
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTask && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Task Name</Label>
                                <div className="text-sm text-gray-900">{selectedTask.text}</div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">Due Date</Label>
                                    <div className={cn(
                                        "text-sm",
                                        isTaskOverdue(selectedTask.due || selectedTask.dueDate) && !selectedTask.completed ? "text-red-600 font-semibold" : "text-gray-900"
                                    )}>
                                        {selectedTask.due || selectedTask.dueDate}
                                        {isTaskOverdue(selectedTask.due || selectedTask.dueDate) && !selectedTask.completed && (
                                            <Badge className="ml-2 bg-red-50 text-red-700 border-red-200">
                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                Overdue
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">Status</Label>
                                    <div>
                                        <Badge className={cn(
                                            "font-normal border",
                                            selectedTask.completed 
                                                ? "bg-green-50 text-green-700 border-green-200" 
                                                : "bg-blue-50 text-blue-700 border-blue-200"
                                        )}>
                                            {selectedTask.completed ? "Completed" : "In Progress"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Program</Label>
                                <div className="text-sm text-gray-900">{program.name}</div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Priority</Label>
                                <Badge className={cn(
                                    "font-normal border",
                                    isTaskOverdue(selectedTask.due || selectedTask.dueDate) && !selectedTask.completed
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : "bg-orange-50 text-orange-700 border-orange-200"
                                )}>
                                    {isTaskOverdue(selectedTask.due || selectedTask.dueDate) && !selectedTask.completed ? "High" : "Normal"}
                                </Badge>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Notes</Label>
                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
                                    {selectedTask.id === 1 && "Follow up with Red Fraggle's parent regarding recent progress and upcoming goals."}
                                    {selectedTask.id === 2 && "Complete incident documentation for medication administration error. Review with supervisor."}
                                    {selectedTask.id === 3 && "Schedule and complete Individual Treatment Plan review session with Red Fraggle and clinical team."}
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox surface="base"
                                    id="task-complete-toggle"
                                    checked={selectedTask.completed}
                                    onCheckedChange={() => {
                                        toggleTaskCompletion(selectedTask.id);
                                        setSelectedTask({ ...selectedTask, completed: !selectedTask.completed });
                                    }}
                                    className="data-[state=checked]:bg-[var(--color-brand-primary)] data-[state=checked]:border-[var(--color-brand-primary)]"
                                />
                                <Label
                                    htmlFor="task-complete-toggle"
                                    className="text-sm font-medium cursor-pointer"
                                >
                                    Mark as {selectedTask.completed ? "Incomplete" : "Complete"}
                                </Label>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" className="rounded-full" onClick={() => setTaskDetailOpen(false)}>
                            Close
                        </Button>
                        <Button 
                            type="submit" 
                            className="rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90"
                            onClick={() => setTaskDetailOpen(false)}
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Youth Detail Dialog */}
            <Dialog open={youthDetailOpen} onOpenChange={setYouthDetailOpen}>
                <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Youth Profile</DialogTitle>
                        <DialogDescription>
                            View detailed information and recent activity
                        </DialogDescription>
                    </DialogHeader>
                    {selectedYouth && (
                        <div className="space-y-4 py-4">
                            {/* Youth Header with Avatar */}
                            <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                                <div className={cn("h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold text-white", selectedYouth.color)}>
                                    {selectedYouth.initials}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">{selectedYouth.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-normal">
                                            {selectedYouth.status}
                                        </Badge>
                                        {selectedYouth.name === "Kermit the Frog" && (
                                            <Badge className="bg-orange-50 text-orange-700 border-orange-200 font-normal">
                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                Requires Attention
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-2">Program: {program.name}</div>
                                </div>
                            </div>
                            
                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <div className="text-xs text-gray-600 font-medium mb-1">Current Location</div>
                                    <div className="text-sm font-semibold text-gray-900">
                                        {selectedYouth.name === "Kermit the Frog" && "Residential Unit"}
                                        {selectedYouth.name === "Red Fraggle" && "Learning Center"}
                                        {selectedYouth.name === "Fozzie Bear" && "Therapy Office"}
                                        {selectedYouth.name === "Miss Piggy" && "Residential Unit"}
                                        {selectedYouth.name === "Gonzo the Great" && "Rec Room"}
                                        {selectedYouth.name === "Animal" && "Music Room"}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <div className="text-xs text-gray-600 font-medium mb-1">Last Activity</div>
                                    <div className="text-sm font-semibold text-gray-900">
                                        {selectedYouth.name === "Kermit the Frog" && "2:15 PM"}
                                        {selectedYouth.name === "Red Fraggle" && "3:45 PM"}
                                        {selectedYouth.name === "Fozzie Bear" && "2:30 PM"}
                                        {selectedYouth.name === "Miss Piggy" && "1:00 PM"}
                                        {selectedYouth.name === "Gonzo the Great" && "12:30 PM"}
                                        {selectedYouth.name === "Animal" && "11:00 AM"}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <div className="text-xs text-gray-600 font-medium mb-1">Current Location</div>
                                    <div className="text-sm font-semibold text-gray-900">
                                        {selectedYouth.status}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Active Alerts Section */}
                            {selectedYouth.name === "Kermit the Frog" && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-orange-900 mb-1">Active Alert</div>
                                            <div className="text-sm text-orange-800">
                                                Parent contact with Jim Henson - REQUIRES evening call home after 7:00 PM (reminder set for 6:55 PM)
                                            </div>
                                            <div className="mt-2 text-xs text-orange-700 font-medium">Priority: High • Due: Today 7:00 PM</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Recent Activity Feed */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Recent Activity</Label>
                                <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
                                    {getYouthRecentLogs(selectedYouth.name).length > 0 ? (
                                        getYouthRecentLogs(selectedYouth.name).map((log, idx) => (
                                            <div key={idx} className="p-3">
                                                <div className="flex items-start gap-2">
                                                    <Badge className={cn(
                                                        "text-[10px] font-medium shrink-0 border",
                                                        log.type === "Note" && "bg-blue-50 text-blue-700 border-blue-200",
                                                        log.type === "Alert" && "bg-orange-50 text-orange-700 border-orange-200",
                                                        log.type === "Medication" && "bg-purple-50 text-purple-700 border-purple-200",
                                                        log.type === "Event" && "bg-green-50 text-green-700 border-green-200"
                                                    )}>
                                                        {log.type}
                                                    </Badge>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs text-gray-600 font-medium mb-0.5">{log.author} • {log.time}</div>
                                                        <div className="text-sm text-gray-900">{log.details}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-sm text-gray-500">
                                            No recent activity logged for this youth
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Medication Status */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Today's Medication Status</Label>
                                <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                                    {selectedYouth.name === "Kermit the Frog" && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-700">Morning Dose</span>
                                                <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    Missed
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-700">Afternoon Dose</span>
                                                <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">Pending</Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-700">Evening Dose</span>
                                                <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">Pending</Badge>
                                            </div>
                                        </div>
                                    )}
                                    {selectedYouth.name === "Red Fraggle" && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-700">Afternoon - Tenex 2.5mg</span>
                                                <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                                                    <Check className="h-3 w-3 mr-1" />
                                                    Completed
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                    {selectedYouth.name === "Gonzo the Great" && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-700">Evening Dose</span>
                                                <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">Pending</Badge>
                                            </div>
                                        </div>
                                    )}
                                    {selectedYouth.name === "Fozzie Bear" && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-700">Bedtime Dose</span>
                                                <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">Pending</Badge>
                                            </div>
                                        </div>
                                    )}
                                    {(selectedYouth.name === "Miss Piggy" || selectedYouth.name === "Animal") && (
                                        <div className="text-sm text-gray-600 text-center py-1">
                                            No medications scheduled for today
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Quick Actions */}
                            <div className="flex gap-2 pt-2">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="flex-1"
                                >
                                    <User className="h-4 w-4 mr-2" />
                                    View Full Profile
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="flex-1"
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    View All Logs
                                </Button>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" className="rounded-full" onClick={() => setYouthDetailOpen(false)}>
                            Close
                        </Button>
                        <Button 
                            type="submit" 
                            className="rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90"
                            onClick={() => setYouthDetailOpen(false)}
                        >
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Event Detail Dialog */}
            <Dialog open={eventDetailOpen} onOpenChange={setEventDetailOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Event Details</DialogTitle>
                        <DialogDescription>
                            View event information and details
                        </DialogDescription>
                    </DialogHeader>
                    {selectedEvent && (
                        <div className="space-y-4 py-4">
                            {/* Event Header */}
                            <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                                <div className={cn(
                                    "h-12 w-12 rounded-lg flex items-center justify-center shrink-0",
                                    selectedEvent.status === "CANCELED" ? "bg-red-100" : "bg-green-100"
                                )}>
                                    <Calendar className={cn(
                                        "h-6 w-6",
                                        selectedEvent.status === "CANCELED" ? "text-red-600" : "text-green-600"
                                    )} />
                                </div>
                                <div className="flex-1">
                                    <h3 className={cn(
                                        "text-lg font-semibold mb-1",
                                        selectedEvent.status === "CANCELED" ? "text-red-600 line-through" : "text-gray-900"
                                    )}>
                                        {selectedEvent.title}
                                    </h3>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge className={cn(
                                            selectedEvent.status === "CANCELED" 
                                                ? "bg-red-50 text-red-700 border-red-200" 
                                                : "bg-blue-50 text-blue-700 border-blue-200"
                                        )}>
                                            {selectedEvent.status === "CANCELED" ? "Canceled" : "Scheduled"}
                                        </Badge>
                                        {selectedEvent.id === 4 && (
                                            <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                Action Required
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Cancellation Notice */}
                            {selectedEvent.status === "CANCELED" && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                            <X className="h-4 w-4 text-red-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-red-900 mb-1">Event Canceled</div>
                                            <div className="text-sm text-red-800">
                                                This event has been canceled. All participants have been notified.
                                            </div>
                                            <div className="mt-2 text-xs text-red-700 font-medium">
                                                Canceled by: Staff • Reason: Scheduling conflict
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Event Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-gray-600 uppercase">Date & Time</Label>
                                    <div className="flex items-center gap-2 text-sm text-gray-900">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        {selectedEvent.time}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-gray-600 uppercase">Duration</Label>
                                    <div className="text-sm text-gray-900">
                                        {selectedEvent.id === 1 && "1 hour"}
                                        {selectedEvent.id === 2 && "30 minutes"}
                                        {selectedEvent.id === 3 && "45 minutes"}
                                        {selectedEvent.id === 4 && "2 hours"}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-gray-600 uppercase">Location</Label>
                                    <div className="text-sm text-gray-900">
                                        {selectedEvent.id === 1 && "Conference Room A"}
                                        {selectedEvent.id === 2 && "Therapy Office 3"}
                                        {selectedEvent.id === 3 && "Main Hall"}
                                        {selectedEvent.id === 4 && "Learning Center"}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-gray-600 uppercase">Organizer</Label>
                                    <div className="text-sm text-gray-900">
                                        {selectedEvent.id === 1 && "Jane Foster, LCSW"}
                                        {selectedEvent.id === 2 && "Dr. Emily Chen"}
                                        {selectedEvent.id === 3 && "Mike Rodriguez"}
                                        {selectedEvent.id === 4 && "Sarah Johnson"}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Description */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Description</Label>
                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
                                    {selectedEvent.id === 1 && "Weekly team meeting to review program progress, discuss youth status updates, and coordinate care plans for the upcoming week."}
                                    {selectedEvent.id === 2 && "Individual therapy session focused on cognitive behavioral techniques and emotion regulation skills development."}
                                    {selectedEvent.id === 3 && "Group recreational activity designed to promote social skills, teamwork, and positive peer interactions."}
                                    {selectedEvent.id === 4 && "Structured educational workshop covering life skills, independent living preparation, and goal-setting activities."}
                                </div>
                            </div>
                            
                            {/* Participants */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Participants ({
                                    selectedEvent.id === 1 ? "8" : 
                                    selectedEvent.id === 2 ? "2" : 
                                    selectedEvent.id === 3 ? "12" : "6"
                                })</Label>
                                <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                                    <div className="flex flex-wrap gap-2">
                                        {selectedEvent.id === 1 && (
                                            <>
                                                <Badge className="bg-white border-gray-300 text-gray-700 font-normal">Jane Foster (Facilitator)</Badge>
                                                <Badge className="bg-white border-gray-300 text-gray-700 font-normal">Tom Chen</Badge>
                                                <Badge className="bg-white border-gray-300 text-gray-700 font-normal">Sarah Johnson</Badge>
                                                <Badge className="bg-white border-gray-300 text-gray-700 font-normal">Mike Rodriguez</Badge>
                                                <Badge className="bg-white border-gray-300 text-gray-700 font-normal">+4 more</Badge>
                                            </>
                                        )}
                                        {selectedEvent.id === 2 && (
                                            <>
                                                <Badge className="bg-white border-gray-300 text-gray-700 font-normal">Dr. Emily Chen (Therapist)</Badge>
                                                <Badge className="bg-white border-gray-300 text-gray-700 font-normal">Kermit the Frog</Badge>
                                            </>
                                        )}
                                        {selectedEvent.id === 3 && (
                                            <>
                                                <Badge className="bg-white border-gray-300 text-gray-700 font-normal">Mike Rodriguez (Lead)</Badge>
                                                <Badge className="bg-white border-gray-300 text-gray-700 font-normal">All Residents</Badge>
                                                <Badge className="bg-white border-gray-300 text-gray-700 font-normal">Support Staff (3)</Badge>
                                            </>
                                        )}
                                        {selectedEvent.id === 4 && (
                                            <>
                                                <Badge className="bg-white border-gray-300 text-gray-700 font-normal">Sarah Johnson (Instructor)</Badge>
                                                <Badge className="bg-white border-gray-300 text-gray-700 font-normal">Red Fraggle</Badge>
                                                <Badge className="bg-white border-gray-300 text-gray-700 font-normal">Fozzie Bear</Badge>
                                                <Badge className="bg-white border-gray-300 text-gray-700 font-normal">+3 more</Badge>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Preparation/Notes */}
                            {selectedEvent.id === 4 && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">Preparation Required</Label>
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                                            <div className="text-sm text-orange-900">
                                                <div className="font-semibold mb-1">Materials needed:</div>
                                                <ul className="list-disc list-inside space-y-0.5 text-orange-800">
                                                    <li>Workshop handouts (6 copies)</li>
                                                    <li>Whiteboard markers</li>
                                                    <li>Goal-setting worksheets</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Expanded Details Section */}
                            {showExpandedDetails && (
                                <div className="space-y-4 border-t border-gray-200 pt-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ExternalLink className="h-4 w-4 text-[var(--color-brand-primary)]" />
                                        <Label className="text-sm font-semibold text-gray-700">Extended Information</Label>
                                    </div>
                                    
                                    {/* Recurring Event Info */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-gray-600 uppercase">Event Recurrence</Label>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <div className="flex items-start gap-2">
                                                <RefreshCw className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                                                <div className="text-sm text-blue-900">
                                                    {selectedEvent.id === 1 && (
                                                        <>
                                                            <div className="font-semibold mb-1">Weekly - Every Monday</div>
                                                            <div className="text-blue-800">Repeats every week on Monday at 2:00 PM until December 31, 2025</div>
                                                        </>
                                                    )}
                                                    {selectedEvent.id === 2 && (
                                                        <>
                                                            <div className="font-semibold mb-1">Bi-weekly</div>
                                                            <div className="text-blue-800">Repeats every other Tuesday at 3:30 PM</div>
                                                        </>
                                                    )}
                                                    {selectedEvent.id === 3 && (
                                                        <>
                                                            <div className="font-semibold mb-1">Does not repeat</div>
                                                            <div className="text-blue-800">This is a one-time event</div>
                                                        </>
                                                    )}
                                                    {selectedEvent.id === 4 && (
                                                        <>
                                                            <div className="font-semibold mb-1">Monthly - 2nd Wednesday</div>
                                                            <div className="text-blue-800">Repeats on the 2nd Wednesday of each month at 10:00 AM</div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Reminders */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-gray-600 uppercase">Reminders</Label>
                                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                                            <div className="space-y-2 text-sm text-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5 text-gray-500" />
                                                    <span>15 minutes before (Email & Push notification)</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5 text-gray-500" />
                                                    <span>1 day before (Email notification)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Full Participant Details */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-gray-600 uppercase">Full Participant Contact List</Label>
                                        <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
                                            {selectedEvent.id === 1 && (
                                                <>
                                                    <div className="p-3 hover:bg-gray-100 transition-colors">
                                                        <div className="flex items-start gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="bg-[var(--color-brand-primary)] text-white text-xs">JF</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <div className="text-sm font-semibold text-gray-900">Jane Foster, LCSW</div>
                                                                <div className="text-xs text-gray-600">Program Director • Facilitator</div>
                                                                <div className="text-xs text-blue-600 mt-1">jane.foster@mercyhome.org</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 hover:bg-gray-100 transition-colors">
                                                        <div className="flex items-start gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="bg-gray-500 text-white text-xs">TC</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <div className="text-sm font-semibold text-gray-900">Tom Chen</div>
                                                                <div className="text-xs text-gray-600">Case Manager</div>
                                                                <div className="text-xs text-blue-600 mt-1">tom.chen@mercyhome.org</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 hover:bg-gray-100 transition-colors">
                                                        <div className="flex items-start gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="bg-gray-500 text-white text-xs">SJ</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <div className="text-sm font-semibold text-gray-900">Sarah Johnson</div>
                                                                <div className="text-xs text-gray-600">Youth Coordinator</div>
                                                                <div className="text-xs text-blue-600 mt-1">sarah.johnson@mercyhome.org</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-2 text-center">
                                                        <Button variant="link" className="rounded-full text-xs text-blue-600 h-6">View All 8 Participants</Button>
                                                    </div>
                                                </>
                                            )}
                                            {selectedEvent.id === 2 && (
                                                <>
                                                    <div className="p-3 hover:bg-gray-100 transition-colors">
                                                        <div className="flex items-start gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="bg-[var(--color-brand-primary)] text-white text-xs">EC</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <div className="text-sm font-semibold text-gray-900">Dr. Emily Chen</div>
                                                                <div className="text-xs text-gray-600">Licensed Therapist • Facilitator</div>
                                                                <div className="text-xs text-blue-600 mt-1">emily.chen@mercyhome.org</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 hover:bg-gray-100 transition-colors">
                                                        <div className="flex items-start gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="bg-green-500 text-white text-xs">KF</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <div className="text-sm font-semibold text-gray-900">Kermit the Frog</div>
                                                                <div className="text-xs text-gray-600">Resident • Participant</div>
                                                                <div className="text-xs text-gray-500 mt-1">Individual therapy client</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {selectedEvent.id === 4 && (
                                                <>
                                                    <div className="p-3 hover:bg-gray-100 transition-colors">
                                                        <div className="flex items-start gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="bg-[var(--color-brand-primary)] text-white text-xs">SJ</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <div className="text-sm font-semibold text-gray-900">Sarah Johnson</div>
                                                                <div className="text-xs text-gray-600">Youth Coordinator • Instructor</div>
                                                                <div className="text-xs text-blue-600 mt-1">sarah.johnson@mercyhome.org</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-2 text-center">
                                                        <Button variant="link" className="rounded-full text-xs text-blue-600 h-6">View All 6 Participants</Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Attachments/Resources */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-gray-600 uppercase">Event Resources</Label>
                                        <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
                                            {selectedEvent.id === 1 && (
                                                <>
                                                    <div className="p-3 hover:bg-gray-100 cursor-pointer transition-colors flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center shrink-0">
                                                            <FileText className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-gray-900 truncate">Meeting Agenda - Nov 26.pdf</div>
                                                            <div className="text-xs text-gray-500">Added by Jane Foster • 124 KB</div>
                                                        </div>
                                                        <Download className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <div className="p-3 hover:bg-gray-100 cursor-pointer transition-colors flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded bg-green-100 flex items-center justify-center shrink-0">
                                                            <File className="h-4 w-4 text-green-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-gray-900 truncate">Last Week's Action Items.xlsx</div>
                                                            <div className="text-xs text-gray-500">Added by Tom Chen • 87 KB</div>
                                                        </div>
                                                        <Download className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                </>
                                            )}
                                            {selectedEvent.id === 2 && (
                                                <div className="p-3 hover:bg-gray-100 cursor-pointer transition-colors flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded bg-purple-100 flex items-center justify-center shrink-0">
                                                        <FileText className="h-4 w-4 text-purple-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-gray-900 truncate">CBT Worksheet - Session 8.pdf</div>
                                                        <div className="text-xs text-gray-500">Added by Dr. Chen • 215 KB</div>
                                                    </div>
                                                    <Download className="h-4 w-4 text-gray-400" />
                                                </div>
                                            )}
                                            {selectedEvent.id === 4 && (
                                                <>
                                                    <div className="p-3 hover:bg-gray-100 cursor-pointer transition-colors flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded bg-orange-100 flex items-center justify-center shrink-0">
                                                            <FileText className="h-4 w-4 text-orange-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-gray-900 truncate">Life Skills Curriculum.pdf</div>
                                                            <div className="text-xs text-gray-500">Added by Sarah Johnson • 2.4 MB</div>
                                                        </div>
                                                        <Download className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <div className="p-3 hover:bg-gray-100 cursor-pointer transition-colors flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center shrink-0">
                                                            <File className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-gray-900 truncate">Goal Setting Template.docx</div>
                                                            <div className="text-xs text-gray-500">Added by Sarah Johnson • 156 KB</div>
                                                        </div>
                                                        <Download className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                </>
                                            )}
                                            {selectedEvent.id === 3 && (
                                                <div className="p-3 text-center">
                                                    <div className="text-sm text-gray-500">No attachments for this event</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Calendar Integration Links */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-gray-600 uppercase">Quick Add to Calendar</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="justify-start"
                                                disabled={selectedEvent.status === "CANCELED"}
                                            >
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Google Calendar
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="justify-start"
                                                disabled={selectedEvent.status === "CANCELED"}
                                            >
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Outlook
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="justify-start"
                                                disabled={selectedEvent.status === "CANCELED"}
                                            >
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Apple Calendar
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="justify-start"
                                                disabled={selectedEvent.status === "CANCELED"}
                                            >
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Yahoo Calendar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Quick Actions */}
                            <div className="flex gap-2 pt-2">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="flex-1"
                                    disabled={selectedEvent.status === "CANCELED"}
                                    onClick={handleAddToCalendar}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Add to Calendar
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="flex-1"
                                    onClick={handleViewFullDetails}
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Full Details
                                </Button>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" className="rounded-full" onClick={() => setEventDetailOpen(false)}>
                            Close
                        </Button>
                        {selectedEvent?.status !== "CANCELED" && (
                            <Button 
                                type="submit" 
                                className="rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90"
                                onClick={() => setEventDetailOpen(false)}
                            >
                                <Check className="h-4 w-4 mr-2" />
                                Mark as Reviewed
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Filter Dialog */}
            <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Additional Filters</DialogTitle>
                        <DialogDescription>
                            Apply filters to narrow down the log entries.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                        {/* Active Filters Badge */}
                        {activeFilterCount > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-2 flex items-center justify-between">
                                <span className="text-xs text-blue-800 font-medium">
                                    {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100 px-2 rounded-full"
                                    onClick={clearAllFilters}
                                >
                                    <X className="h-3 w-3 mr-1" />
                                    Clear All
                                </Button>
                            </div>
                        )}
                        
                        
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold text-gray-700">Log Types</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {logTypes.map(type => (
                                    <div key={type} className="flex items-center space-x-2">
                                        <Checkbox surface="base"
                                            id={`filter-type-${type}`}
                                            checked={selectedTypes.includes(type)}
                                            onCheckedChange={() => toggleType(type)}
                                            className="data-[state=checked]:bg-[var(--color-brand-primary)] data-[state=checked]:border-[var(--color-brand-primary)]"
                                        />
                                        <Label
                                            htmlFor={`filter-type-${type}`}
                                            className="text-sm font-normal text-gray-700 cursor-pointer"
                                        >
                                            {type}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold text-gray-700">Authors</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {authors.map(author => (
                                    <div key={author} className="flex items-center space-x-2">
                                        <Checkbox surface="base"
                                            id={`filter-author-${author}`}
                                            checked={selectedAuthors.includes(author)}
                                            onCheckedChange={() => toggleAuthor(author)}
                                            className="data-[state=checked]:bg-[var(--color-brand-primary)] data-[state=checked]:border-[var(--color-brand-primary)]"
                                        />
                                        <Label
                                            htmlFor={`filter-author-${author}`}
                                            className="text-sm font-normal text-gray-700 cursor-pointer"
                                        >
                                            {author}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold text-gray-700">Youth</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {(YOUTH_STATUS || []).map(youth => (
                                    <div key={youth.id} className="flex items-center space-x-2">
                                        <Checkbox surface="base"
                                            id={`filter-youth-${youth.id}`}
                                            checked={selectedYouthFilter.includes(youth.name)}
                                            onCheckedChange={() => toggleYouthFilter(youth.name)}
                                            className="data-[state=checked]:bg-[var(--color-brand-primary)] data-[state=checked]:border-[var(--color-brand-primary)]"
                                        />
                                        <Label
                                            htmlFor={`filter-youth-${youth.id}`}
                                            className="text-sm font-normal text-gray-700 cursor-pointer"
                                        >
                                            {youth.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Observations (20044) */}
                        <ObservationFilterSection
                            selected={selectedObservationFilter}
                            onToggle={toggleObservationFilter}
                            idPrefix="filter-obs"
                        />
                    </div>
                    <DialogFooter className="flex items-center justify-between">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-full text-xs text-gray-500"
                            onClick={clearAllFilters}
                        >
                            <X className="h-3 w-3 mr-1" />
                            Clear All
                        </Button>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" className="rounded-full" onClick={() => setFilterOpen(false)}>
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                className="rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90"
                                onClick={() => setFilterOpen(false)}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Apply Filters
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* New Entry Dialog */}
            <Dialog open={newEntryOpen} onOpenChange={setNewEntryOpen}>
                <DialogContent size="xl" className="overflow-clip" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Create New Program Log Entry</DialogTitle>
                        <DialogDescription>
                            Add a new entry to the {program?.name ?? "program"} activity log. Fields marked * are required.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <DialogBody>
                    <div className="space-y-4">
                        {/* Entry Type Selector */}
                        <div>
                            <FieldLabel htmlFor="new-entry-log-type" required>Log Type</FieldLabel>
                            <Select value={newEntryLogType} onValueChange={setNewEntryLogType}>
                                <SelectTrigger id="new-entry-log-type" surface="base" aria-required className="w-full sm:w-1/2">
                                    <SelectValue placeholder="Select log type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MANUAL_LOG_TYPES.map((t) => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {/* Date & Time Fields */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Date Field */}
                            <div>
                                <FieldLabel htmlFor="new-entry-date" required>Date</FieldLabel>
                                <DateInput
                                    id="new-entry-date"
                                    value={isoToMdy(newEntryDate)}
                                    onChange={(v) => setNewEntryDate(mdyToIso(v))}
                                />
                                <FieldError role="alert">{dateTimeErrors.date}</FieldError>
                            </div>
                            
                            {/* Time Field */}
                            <div>
                                <FieldLabel htmlFor="new-entry-time" required>Time</FieldLabel>
                                <Input
                                    id="new-entry-time"
                                    surface="base"
                                    type="time"
                                    value={newEntryTime}
                                    onChange={(e) => setNewEntryTime(e.target.value)}
                                />
                                <FieldError role="alert">{dateTimeErrors.time}</FieldError>
                            </div>
                        </div>
                        
                        {isStaffStatus && (
                            <StaffMemberStatusFields programId={Number(program?.id)} draft={staffStatus.draft} setDraft={staffStatus.setDraft} errors={staffStatus.errors} />
                        )}
                        {manualErrors.form && (
                            <Alert variant="error" role="alert">
                                <AlertCircle aria-hidden="true" />
                                <AlertDescription>{manualErrors.form}</AlertDescription>
                            </Alert>
                        )}
                        {isCloseReopen && (
                            <div className="space-y-4" data-testid="program-close-reopen-fields">
                                <div>
                                    <FieldLabel htmlFor="pcr-action" required>Action</FieldLabel>
                                    <Select value={closeAction} onValueChange={(v) => { setCloseAction(v); setManualErrors((e) => ({ ...e, action: undefined })); }}>
                                        <SelectTrigger id="pcr-action" surface="base" className="w-full sm:w-1/2" aria-required aria-invalid={!!manualErrors.action} aria-describedby={manualErrors.action ? "pcr-action-err" : undefined}>
                                            <SelectValue placeholder="Select action" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PROGRAM_CLOSE_ACTIONS.map((a) => (
                                                <SelectItem key={a} value={a}>{a}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError id="pcr-action-err" role="alert">{manualErrors.action}</FieldError>
                                </div>
                                <div>
                                    <FieldLabel htmlFor="pcr-notes">Notes</FieldLabel>
                                    <Textarea id="pcr-notes" rows={4} value={closeNotes} onChange={(e) => setCloseNotes(e.target.value)} placeholder="Optional notes" />
                                </div>
                            </div>
                        )}
                        {isMilieu && (<>
                        {/* Priority Level */}
                        <div>
                            <FieldLabel>Priority Level</FieldLabel>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={newEntryPriority === "Low" ? "default" : "outline"}
                                    size="sm"
                                    className={cn(
                                        "flex-1",
                                        newEntryPriority === "Low" && "bg-green-600 hover:bg-green-700 text-white"
                                    )}
                                    onClick={() => setNewEntryPriority("Low")}
                                >
                                    Low
                                </Button>
                                <Button
                                    type="button"
                                    variant={newEntryPriority === "Medium" ? "default" : "outline"}
                                    size="sm"
                                    className={cn(
                                        "flex-1",
                                        newEntryPriority === "Medium" && "bg-orange-500 hover:bg-orange-600 text-white"
                                    )}
                                    onClick={() => setNewEntryPriority("Medium")}
                                >
                                    Medium
                                </Button>
                                <Button
                                    type="button"
                                    variant={newEntryPriority === "High" ? "default" : "outline"}
                                    size="sm"
                                    className={cn(
                                        "flex-1",
                                        newEntryPriority === "High" && "bg-red-600 hover:bg-red-700 text-white"
                                    )}
                                    onClick={() => setNewEntryPriority("High")}
                                >
                                    High Priority
                                </Button>
                            </div>
                        </div>
                        </>)}
                        
                        {/* Entry Content */}
                        {isMilieu && (
                        <div>
                            <FieldLabel htmlFor="new-entry-content" required>Entry Content</FieldLabel>
                            <Textarea
                                id="new-entry-content"
                                aria-required
                                aria-invalid={!!manualErrors.content}
                                aria-describedby={manualErrors.content ? "new-entry-content-err" : undefined}
                                value={newEntryContent}
                                onChange={(e) => setNewEntryContent(e.target.value)}
                                placeholder="Enter detailed information about this log entry..."
                                className="min-h-[120px] resize-y"
                                rows={6}
                            />
                            <FieldError id="new-entry-content-err" role="alert">{manualErrors.content}</FieldError>
                            <div className="mt-1 slds-text-3 text-right text-[var(--slds-g-color-text-weak)]">
                                {newEntryContent.length} characters
                            </div>
                        </div>
                        )}
                        
                        {isMilieu && (<>
                        {/* Associates - Three Dropdowns: Youth, Program Team, Other */}
                        <div className="space-y-4">
                            <FieldLabel>Associate Individuals (Optional)</FieldLabel>
                            
                            {/* Youth Dropdown */}
                            <div className="space-y-2">
                                <Label className="text-xs font-medium" style={{ color: 'var(--slds-g-color-text-weak)' }}>Youth</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full justify-between h-10 rounded-md"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                color: 'var(--slds-g-color-text-default)'
                                            }}
                                        >
                                            <span style={{ color: newEntryYouth.length === 0 ? 'var(--slds-g-color-text-placeholder)' : 'var(--slds-g-color-text-default)' }}>
                                                {newEntryYouth.length === 0 ? "Select youth..." : `${newEntryYouth.length} youth selected`}
                                            </span>
                                            <ChevronDown className="h-4 w-4" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent 
                                        className="w-[400px] p-0" 
                                        align="start"
                                        style={{
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                            boxShadow: 'var(--slds-g-shadow-4)'
                                        }}
                                    >
                                        {/* Search Input */}
                                        <div className="p-3 border-b" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                <Input
                                                    type="text"
                                                    placeholder="Search youth..."
                                                    value={youthSearchQuery}
                                                    onChange={(e) => setYouthSearchQuery(e.target.value)}
                                                    className="pl-9 h-9 text-sm"
                                                    style={{
                                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        color: 'var(--slds-g-color-text-default)'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="max-h-[280px] overflow-y-auto">
                                            <div className="p-2 space-y-1">
                                                {YOUTH_STATUS.filter(youth => 
                                                    youth.name.toLowerCase().includes(youthSearchQuery.toLowerCase()) ||
                                                    youth.program.toLowerCase().includes(youthSearchQuery.toLowerCase())
                                                ).map((youth) => (
                                                    <div
                                                        key={youth.id}
                                                        className="flex items-center space-x-3 p-2 rounded-md cursor-pointer"
                                                        style={{
                                                            backgroundColor: newEntryYouth.includes(youth.name) ? 'var(--slds-g-color-background-selection)' : 'transparent'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!newEntryYouth.includes(youth.name)) {
                                                                e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-row-hover)';
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (!newEntryYouth.includes(youth.name)) {
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                            }
                                                        }}
                                                        onClick={() => {
                                                            setNewEntryYouth(prev =>
                                                                prev.includes(youth.name)
                                                                    ? prev.filter(y => y !== youth.name)
                                                                    : [...prev, youth.name]
                                                            );
                                                        }}
                                                    >
                                                        <Checkbox surface="base"
                                                            checked={newEntryYouth.includes(youth.name)}
                                                            onCheckedChange={() => {}}
                                                            className="h-4 w-4"
                                                        />
                                                        <Avatar className="h-7 w-7">
                                                            <AvatarFallback className={cn(
                                                                "text-xs text-white font-semibold",
                                                                youth.name === "Kermit the Frog" && "bg-green-500",
                                                                youth.name === "Miss Piggy" && "bg-pink-500",
                                                                youth.name === "Fozzie Bear" && "bg-orange-500",
                                                                youth.name === "Red Fraggle" && "bg-red-500",
                                                                youth.name === "Gonzo the Great" && "bg-blue-500",
                                                                youth.name === "Animal" && "bg-purple-500",
                                                                youth.name === "Scooter" && "bg-teal-500",
                                                                youth.name === "Rowlf the Dog" && "bg-amber-600",
                                                                youth.name === "Rizzo the Rat" && "bg-indigo-500",
                                                                youth.name === "Pepe the Prawn" && "bg-rose-500"
                                                            )}>
                                                                {youth.name.split(' ').map(n => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <div className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>{youth.name}</div>
                                                            <div className="text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>{youth.program}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                {newEntryYouth.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {newEntryYouth.map(youthName => (
                                            <Badge 
                                                key={youthName} 
                                                variant="secondary" 
                                                className="pl-2 pr-1 py-1 rounded-full"
                                                style={{
                                                    backgroundColor: 'var(--slds-g-color-background-alt)',
                                                    color: 'var(--slds-g-color-text-default)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                {youthName}
                                                <button
                                                    type="button"
                                                    onClick={() => setNewEntryYouth(prev => prev.filter(y => y !== youthName))}
                                                    className="ml-1 rounded-full p-0.5"
                                                    style={{ 
                                                        color: 'var(--slds-g-color-text-weak)',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-row-hover)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                                <Label className="text-xs font-medium" style={{ color: 'var(--slds-g-color-text-weak)' }}>Program Team</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full justify-between h-10 rounded-md"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                color: 'var(--slds-g-color-text-default)'
                                            }}
                                        >
                                            <span style={{ color: newEntryProgramTeam.length === 0 ? 'var(--slds-g-color-text-placeholder)' : 'var(--slds-g-color-text-default)' }}>
                                                {newEntryProgramTeam.length === 0 ? "Select team members..." : `${newEntryProgramTeam.length} team members selected`}
                                            </span>
                                            <ChevronDown className="h-4 w-4" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent 
                                        className="w-[400px] p-0" 
                                        align="start"
                                        style={{
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                            boxShadow: 'var(--slds-g-shadow-4)'
                                        }}
                                    >
                                        {/* Search Input */}
                                        <div className="p-3 border-b" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                <Input
                                                    type="text"
                                                    placeholder="Search team members..."
                                                    value={programTeamSearchQuery}
                                                    onChange={(e) => setProgramTeamSearchQuery(e.target.value)}
                                                    className="pl-9 h-9 text-sm"
                                                    style={{
                                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        color: 'var(--slds-g-color-text-default)'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="max-h-[280px] overflow-y-auto">
                                            <div className="p-2 space-y-1">
                                                {PROGRAM_TEAM.filter(member => 
                                                    member.name.toLowerCase().includes(programTeamSearchQuery.toLowerCase()) ||
                                                    member.role.toLowerCase().includes(programTeamSearchQuery.toLowerCase()) ||
                                                    member.department.toLowerCase().includes(programTeamSearchQuery.toLowerCase())
                                                ).map((member) => (
                                                    <div
                                                        key={member.id}
                                                        className="flex items-center space-x-3 p-2 rounded-md cursor-pointer"
                                                        style={{
                                                            backgroundColor: newEntryProgramTeam.includes(member.name) ? 'var(--slds-g-color-background-selection)' : 'transparent'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!newEntryProgramTeam.includes(member.name)) {
                                                                e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-row-hover)';
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (!newEntryProgramTeam.includes(member.name)) {
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                            }
                                                        }}
                                                        onClick={() => {
                                                            setNewEntryProgramTeam(prev =>
                                                                prev.includes(member.name)
                                                                    ? prev.filter(m => m !== member.name)
                                                                    : [...prev, member.name]
                                                            );
                                                        }}
                                                    >
                                                        <Checkbox surface="base"
                                                            checked={newEntryProgramTeam.includes(member.name)}
                                                            onCheckedChange={() => {}}
                                                            className="h-4 w-4"
                                                        />
                                                        <div className="h-7 w-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--slds-g-color-background-brand-primary-lighter)', color: 'var(--color-brand-primary)' }}>
                                                            <User className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>{member.name}</div>
                                                            <div className="text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>{member.role} • {member.department}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                {newEntryProgramTeam.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {newEntryProgramTeam.map(memberName => (
                                            <Badge 
                                                key={memberName} 
                                                variant="secondary" 
                                                className="pl-2 pr-1 py-1 rounded-full"
                                                style={{
                                                    backgroundColor: 'var(--slds-g-color-background-brand-primary-lighter)',
                                                    color: 'var(--color-brand-primary)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                {memberName}
                                                <button
                                                    type="button"
                                                    onClick={() => setNewEntryProgramTeam(prev => prev.filter(m => m !== memberName))}
                                                    className="ml-1 rounded-full p-0.5"
                                                    style={{ 
                                                        color: 'var(--color-brand-primary)',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-row-hover)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                                <Label className="text-xs font-medium" style={{ color: 'var(--slds-g-color-text-weak)' }}>Other</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full justify-between h-10 rounded-md"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                color: 'var(--slds-g-color-text-default)'
                                            }}
                                        >
                                            <span style={{ color: newEntryOther.length === 0 ? 'var(--slds-g-color-text-placeholder)' : 'var(--slds-g-color-text-default)' }}>
                                                {newEntryOther.length === 0 ? "Select other individuals..." : `${newEntryOther.length} individuals selected`}
                                            </span>
                                            <ChevronDown className="h-4 w-4" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent 
                                        className="w-[400px] p-0" 
                                        align="start"
                                        style={{
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                            boxShadow: 'var(--slds-g-shadow-4)'
                                        }}
                                    >
                                        {/* Search Input */}
                                        <div className="p-3 border-b" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                <Input
                                                    type="text"
                                                    placeholder="Search individuals..."
                                                    value={otherSearchQuery}
                                                    onChange={(e) => setOtherSearchQuery(e.target.value)}
                                                    className="pl-9 h-9 text-sm"
                                                    style={{
                                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        color: 'var(--slds-g-color-text-default)'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="max-h-[280px] overflow-y-auto">
                                            <div className="p-2 space-y-1">
                                                {OTHER_INDIVIDUALS.filter(individual => 
                                                    individual.name.toLowerCase().includes(otherSearchQuery.toLowerCase()) ||
                                                    individual.category.toLowerCase().includes(otherSearchQuery.toLowerCase())
                                                ).map((individual) => (
                                                    <div
                                                        key={individual.id}
                                                        className="flex items-center space-x-3 p-2 rounded-md cursor-pointer"
                                                        style={{
                                                            backgroundColor: newEntryOther.includes(individual.name) ? 'var(--slds-g-color-background-selection)' : 'transparent'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!newEntryOther.includes(individual.name)) {
                                                                e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-row-hover)';
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (!newEntryOther.includes(individual.name)) {
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                            }
                                                        }}
                                                        onClick={() => {
                                                            setNewEntryOther(prev =>
                                                                prev.includes(individual.name)
                                                                    ? prev.filter(i => i !== individual.name)
                                                                    : [...prev, individual.name]
                                                            );
                                                        }}
                                                    >
                                                        <Checkbox surface="base"
                                                            checked={newEntryOther.includes(individual.name)}
                                                            onCheckedChange={() => {}}
                                                            className="h-4 w-4"
                                                        />
                                                        <div className="h-7 w-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--slds-g-color-background-warning-lighter)', color: 'var(--slds-g-color-text-warning)' }}>
                                                            <User className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>{individual.name}</div>
                                                            <div className="text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>{individual.category}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                {newEntryOther.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {newEntryOther.map(individualName => (
                                            <Badge 
                                                key={individualName} 
                                                variant="secondary" 
                                                className="pl-2 pr-1 py-1 rounded-full"
                                                style={{
                                                    backgroundColor: 'var(--slds-g-color-background-warning-lighter)',
                                                    color: 'var(--slds-g-color-text-warning)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                {individualName}
                                                <button
                                                    type="button"
                                                    onClick={() => setNewEntryOther(prev => prev.filter(i => i !== individualName))}
                                                    className="ml-1 rounded-full p-0.5"
                                                    style={{ 
                                                        color: 'var(--slds-g-color-text-warning)',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-row-hover)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                            <Label className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Tags (Optional)</Label>
                            <div className="flex flex-wrap gap-2">
                                {["Progress", "Follow-up Required", "Milestone", "Concern", "Family Contact", "Educational", "Therapeutic", "Social"].map(tag => (
                                    <Badge
                                        key={tag}
                                        variant={newEntryTags.includes(tag) ? "default" : "outline"}
                                        className={cn(
                                            "cursor-pointer transition-colors",
                                            newEntryTags.includes(tag) 
                                                ? "bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90" 
                                                : ""
                                        )}
                                        style={!newEntryTags.includes(tag) ? {
                                            borderColor: 'var(--slds-g-color-border-base-1)',
                                            color: 'var(--slds-g-color-text-default)'
                                        } : {}}
                                        onClick={() => toggleTag(tag)}
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                            {newEntryTags.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                    {newEntryTags.map(tag => (
                                        <Badge key={tag} className="bg-[var(--color-brand-primary)] text-white text-xs">
                                            {tag}
                                            <X 
                                                className="h-3 w-3 ml-1 cursor-pointer" 
                                                onClick={() => toggleTag(tag)}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        </>)}
                        
                        
                    </div>
                    </DialogBody>
                    
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCancelNewEntry}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={saveNewLogEntry}
                            disabled={createDisabled}
                        >
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

      <ProgramDetailViewDialogs2 {...props} />
    </>
  );
}