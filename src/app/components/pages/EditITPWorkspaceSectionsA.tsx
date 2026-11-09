// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { 
    ArrowLeft, Calendar, Users, Building2, Heart, CheckCircle2, Circle, Clock, FileText,
    Target, Brain, Flag, Users2, Sparkles, Activity, Smile, ClipboardList, UserCircle,
    Home, Church, Stethoscope, HeartPulse, Pill, AlertTriangle, AlertCircle, MessageCircle,
    Scale, Gavel, Shield, ShieldAlert, Hand, FileBarChart, BookOpen, Briefcase, GraduationCap,
    TrendingUp, School, ClipboardCheck, ChevronDown, ChevronRight, Save, Star, X, History,
    Lock, Unlock, Trash2, Info, Sunrise, Sun, Sunset, Moon, Plus, Edit2, Check, MoreHorizontal,
    Download, Upload, Search, Filter, SortAsc, SortDesc, Eye, EyeOff, Copy, ExternalLink,
    ChevronUp, Minus, RefreshCw, Settings, HelpCircle, Bell, BellOff, User, Mail, Phone,
    MapPin, Link, Image, Video, Music, File, Folder, Archive, Inbox, Send, Bookmark,
    Tag, Hash, Globe, Wifi, Battery, Volume2, VolumeX, Maximize, Minimize, RotateCw,
    ZoomIn, ZoomOut, Move, Crop, Scissors, Clipboard, Database, Server, Terminal, Code,
    GitBranch, GitCommit, GitMerge, Package, Box, Grid, List, Layout, Sidebar, Menu,
    MoreVertical, Sliders, Toggle, Radio, Checkbox, Square, Triangle, Circle as LucideCircle,
    Hexagon, Octagon, Pentagon, Star as StarIcon, Zap, Flame, Drop, Leaf, Feather, Wind,
    Sun as SunIcon, Moon as MoonIcon, Cloud, CloudRain, Snowflake, Thermometer, Umbrella
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { toast } from "sonner@2.0.3";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

export function EditITPWorkspaceSectionsA(props: any) {
  const {
    formatDate,
    itpStartDate: localStartDate, setItpStartDate: setLocalStartDate,
    itpEndDate: localEndDate, setItpEndDate: setLocalEndDate,
    activeSection, setActiveSection,
    isItpFinalized, setIsItpFinalized,
    sectionStatus, setSectionStatus,
    sectionContributors, setSectionContributors,
    itpLifecycleStatus, setItpLifecycleStatus,
    renderSectionHeader, handleSaveSection, handleCompleteSection, handleReopenSection,
    handleScheduleMeeting,
    connections, setEditingConnection, setIsConnectionDialogOpen,
    medicationNarrative, setMedicationNarrative,
    physicalHealthNarrative, setPhysicalHealthNarrative,
    mentalHealthSupplementalPlansNarrative, setMentalHealthSupplementalPlansNarrative,
    diagnosticImpressionNarrative, setDiagnosticImpressionNarrative,
    mentalHealthConnectionsNarrative, setMentalHealthConnectionsNarrative,
    triggersNarrative, setTriggersNarrative,
    copingSkillsNarrative, setCopingSkillsNarrative,
    goalsAchievedNarrative, setGoalsAchievedNarrative,
    goalsDiscontinuedNarrative, setGoalsDiscontinuedNarrative,
    goalsOpenNarrative, setGoalsOpenNarrative,
    carePlanningMeetingNarrative, setCarePlanningMeetingNarrative,
    transitionPlanningNarrative, setTransitionPlanningNarrative,
    strengthsNarrative, setStrengthsNarrative,
    milieuSupplementalPlansNarrative, setMilieuSupplementalPlansNarrative,
    milieuMeetingsNarrative, setMilieuMeetingsNarrative,
    hygieneCleanlinessNarrative, setHygieneCleanlinessNarrative,
    dailyRoutinesNarrative, setDailyRoutinesNarrative,
    relationshipsWithPeersNarrative, setRelationshipsWithPeersNarrative,
    relationshipsWithStaffNarrative, setRelationshipsWithStaffNarrative,
    activitiesNarrative, setActivitiesNarrative,
    advocateNotesNarrative, setAdvocateNotesNarrative,
    familyInvolvementNarrative, setFamilyInvolvementNarrative,
    whoLivesInFamilyHomeNarrative, setWhoLivesInFamilyHomeNarrative,
    familySystemChangesNarrative, setFamilySystemChangesNarrative,
    spiritualityNarrative, setSpiritualityNarrative,
    traumaNarrative, setTraumaNarrative,
    individualTherapyNarrative, setIndividualTherapyNarrative,
    familyTherapyNarrative, setFamilyTherapyNarrative,
    groupTherapyNarrative, setGroupTherapyNarrative,
    substanceUseNarrative, setSubstanceUseNarrative,
    incidentsNarrative, setIncidentsNarrative,
    legalInvolvementNarrative, setLegalInvolvementNarrative,
    dcfsInvolvementNarrative, setDcfsInvolvementNarrative,
    testingAssessmentsNarrative, setTestingAssessmentsNarrative,
    aspNarrative, setAspNarrative,
    executiveFunctionsNarrative, setExecutiveFunctionsNarrative,
    careerPlanningNarrative, setCareerPlanningNarrative,
    postSecondaryNarrative, setPostSecondaryNarrative,
    schoolPerformanceNarrative, setSchoolPerformanceNarrative,
    schoolTutoringNarrative, setSchoolTutoringNarrative,
    iepPlansNarrative, setIepPlansNarrative,
    academicPlansNarrative, setAcademicPlansNarrative,
    showSelectTraumaModal, setShowSelectTraumaModal,
    tempSelectedTraumaIds, setTempSelectedTraumaIds,
    selectedTraumaIds, setSelectedTraumaIds,
    isSelectStrengthsModalOpen, setIsSelectStrengthsModalOpen,
    selectedStrengthIds, setSelectedStrengthIds,
    isPriorITPsModalOpen, setIsPriorITPsModalOpen,
    isSelectTriggersModalOpen, setIsSelectTriggersModalOpen,
    isSelectCopingSkillsModalOpen, setIsSelectCopingSkillsModalOpen,
    selectedTriggersList, setSelectedTriggersList,
    selectedCopingSkillsList, setSelectedCopingSkillsList,
    showAchievedGoalsModal, setShowAchievedGoalsModal,
    showDiscontinuedGoalsModal, setShowDiscontinuedGoalsModal,
    showOpenGoalsModal, setShowOpenGoalsModal,
    selectedGoalsForSummary, setSelectedGoalsForSummary,
    showSelectDomainsModal, setShowSelectDomainsModal,
    selectedDomainsForModal, setSelectedDomainsForModal,
    communityLaunchPlanData, setCommunityLaunchPlanData,
    showPlanOfActionModal, setShowPlanOfActionModal,
    selectedPlanOfActionIds, setSelectedPlanOfActionIds,
    showLegalInvolvementModal, setShowLegalInvolvementModal,
    selectedLegalRecords, setSelectedLegalRecords,
    selectedTestIds, setSelectedTestIds,
    showSelectTestsModal, setShowSelectTestsModal,
    tempSelectedTestIds, setTempSelectedTestIds,
    medicationRecords, totalMissedDoses,
    physicalHealthData,
    mentalHealthData,
    ptpStatementsData,
    achievedGoals, discontinuedGoals, openGoals, goalsData,
    strengthsData,
    milieuMeetingsAttended, milieuMeetingsExpected,
    otherMilieuMeetingsAttended, otherMilieuMeetingsExpected,
    milieuMeetingsData,
    totalCommunityServiceHours, communityServiceActivitiesAttended, communityServiceData,
    activitiesRegisteredFor, activitiesAttended, activityParticipationData,
    itpWeeks,
    advocateMeetingsPlanned, advocateMeetingsScheduled, advocateMeetingsAttended, advocateMeetingsData,
    parentFamilyContactsExpected, parentFamilyContactsAttended, parentFamilyContactsData,
    homeVisitsCount, numberOfFamilyVisits, familyVisitsData,
    passesPlanned, passesOccurred, passesData,
    traumaData,
    triggersData,
    copingSkillsData,
    handleOpenAchievedGoalsModal, handleOpenDiscontinuedGoalsModal, handleOpenOpenGoalsModal,
    handleOpenSelectTrauma, handleCloseSelectTraumaModal,
    handleToggleTraumaSelection, handleConfirmTraumaSelection,
    handleOpenSelectDomainsModal, handleCloseSelectDomainsModal,
    handleToggleDomainSelection, handleAddDomains, handleDeleteDomain,
    handleOpenSelectTriggersModal, handleCloseSelectTriggersModal, handleDeleteTrigger,
    handleOpenSelectCopingSkillsModal, handleCloseSelectCopingSkillsModal, handleDeleteCopingSkill,
    handleOpenPlanOfActionModal, handleClosePlanOfActionModal, handleAddPlanOfAction,
    handleOpenLegalInvolvementModal, handleCloseLegalInvolvementModal,
    handleToggleLegalRecordSelection, handleConfirmLegalInvolvementSummary,
    handleOpenSelectTestsAssessments, handleCloseSelectTestsModal,
    handleToggleTestSelection, handleConfirmTestSelection,
    itpData,
    navigate, id,
  } = props;

  return (
    <>
                            {activeSection === 'itp-details' && (
                                <div className="space-y-4">
                                    {renderSectionHeader('itp-details')}
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Youth Name <span className="text-red-600">*</span>
                                            </label>
                                            <Input
                                                value={itpData.youthName}
                                                disabled
                                                className="h-9 text-sm bg-gray-50"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    color: 'var(--slds-g-color-text-weak)'
                                                }}
                                            />
                                            <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Youth cannot be changed for an existing ITP
                                            </p>
                                        </div>

                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Program <span className="text-red-600">*</span>
                                            </label>
                                            <Input
                                                value={itpData.program}
                                                disabled
                                                className="h-9 text-sm bg-gray-50"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    color: 'var(--slds-g-color-text-weak)'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Start Date <span className="text-red-600">*</span>
                                            </label>
                                            <DateInput
                                                value={isoToMdy(localStartDate)}
                                                onChange={(v) => setLocalStartDate(mdyToIso(v))}
                                                disabled={sectionStatus['itp-details'] === 'Complete'}
                                                className="h-9 text-sm bg-gray-50"
                                                style={{ 
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    color: sectionStatus['itp-details'] === 'Complete' ? 'var(--slds-g-color-text-weak)' : 'var(--slds-g-color-text-default)'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                End Date <span className="text-red-600">*</span>
                                            </label>
                                            <DateInput
                                                value={isoToMdy(localEndDate)}
                                                onChange={(v) => setLocalEndDate(mdyToIso(v))}
                                                disabled={sectionStatus['itp-details'] === 'Complete'}
                                                className="h-9 text-sm bg-gray-50"
                                                style={{ 
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    color: sectionStatus['itp-details'] === 'Complete' ? 'var(--slds-g-color-text-weak)' : 'var(--slds-g-color-text-default)'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                {itpData.advocates.length > 1 ? 'Advocates' : 'Advocate'}
                                            </label>
                                            <div
                                                className="h-auto min-h-[36px] px-3 py-2 rounded text-sm bg-gray-50"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    color: 'var(--slds-g-color-text-weak)'
                                                }}
                                            >
                                                {itpData.advocates.length > 0 ? itpData.advocates.join(', ') : '—'}
                                            </div>
                                        </div>

                                        <div>
                                            <label
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                {itpData.therapists.length > 1 ? 'Therapists' : 'Therapist'}
                                            </label>
                                            <div
                                                className="h-auto min-h-[36px] px-3 py-2 rounded text-sm bg-gray-50"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    color: 'var(--slds-g-color-text-weak)'
                                                }}
                                            >
                                                {itpData.therapists.length > 0 ? itpData.therapists.join(', ') : '—'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['itp-details'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('itp-details')}
                                            >
                                                Re-Open Section
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-full h-8"
                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                    onClick={() => toast.info('Changes discarded')}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-full h-8"
                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                    onClick={() => handleSaveSection('itp-details')}
                                                >
                                                    Save
                                                </Button>
                                                                                              
                                              <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                >
                                                    Ready for Review
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-full h-8"
                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                    onClick={() => handleCompleteSection('itp-details')}
                                                >
                                                    Reviewed
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Schedule Section */}
                            {activeSection === 'schedule' && (
                                <div className="space-y-4">
                                    {renderSectionHeader('schedule')}
                                    
                                    <div 
                                        className="rounded-lg overflow-hidden"
                                    style={{ 
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                    }}
                                >
                                    <table className="w-full">
                                        <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                            <tr>
                                                <th 
                                                    className="text-left text-xs font-semibold px-4 py-3"
                                                    style={{ color: 'var(--slds-g-color-text-default)' }}
                                                >
                                                    Event
                                                </th>
                                                <th 
                                                    className="text-left text-xs font-semibold px-4 py-3"
                                                    style={{ color: 'var(--slds-g-color-text-default)' }}
                                                >
                                                    Expected Date
                                                </th>
                                                <th 
                                                    className="text-left text-xs font-semibold px-4 py-3"
                                                    style={{ color: 'var(--slds-g-color-text-default)' }}
                                                >
                                                    Actual Date
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                    {(() => {
                                                        const cpm = connections?.find((c: any) => c.type === "Care Planning Meeting");
                                                        if (cpm) {
                                                            return (
                                                                <button
                                                                    style={{ color: '#0176d3', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit' }}
                                                                    onClick={() => {
                                                                        setEditingConnection(cpm);
                                                                        setIsConnectionDialogOpen(true);
                                                                    }}
                                                                >
                                                                    Care Planning Meeting
                                                                </button>
                                                            );
                                                        }
                                                        return "Care Planning Meeting";
                                                    })()}
                                                </td>
                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                    {formatDate(itpData.schedule.carePlanningMeeting.expectedDate)}
                                                </td>
                                                <td className="text-sm px-4 py-3" style={{ color: itpData.schedule.carePlanningMeeting.actualDate ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>
                                                    {formatDate(itpData.schedule.carePlanningMeeting.actualDate)}
                                                </td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                    ITP Date
                                                </td>
                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                    {formatDate(itpData.schedule.itpDate.expectedDate)}
                                                </td>
                                                <td className="text-sm px-4 py-3" style={{ color: itpData.schedule.itpDate.actualDate ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>
                                                    {formatDate(itpData.schedule.itpDate.actualDate)}
                                                </td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                    Complete Date
                                                </td>
                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                    {formatDate(itpData.schedule.completeDate.expectedDate)}
                                                </td>
                                                <td className="text-sm px-4 py-3" style={{ color: itpData.schedule.completeDate.actualDate ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>
                                                    {formatDate(itpData.schedule.completeDate.actualDate)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                    Finalized Date
                                                </td>
                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                    {formatDate(itpData.schedule.finalizedDate.expectedDate)}
                                                </td>
                                                <td className="text-sm px-4 py-3" style={{ color: itpData.schedule.finalizedDate.actualDate ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>
                                                    {formatDate(itpData.schedule.finalizedDate.actualDate)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                
                                <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                    {sectionStatus['schedule'] === 'Complete' ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-full h-8"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                            onClick={() => handleReopenSection('schedule')}
                                        >
                                            Re-Open Section
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                size="sm"
                                                className="rounded-full text-white h-8"
                                                style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                onClick={() => handleCompleteSection('schedule')}
                                            >
                                                Complete Section
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                            )}

                            {/* Medication Section */}
                            {activeSection === 'medication' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('medication')}
                                    
                                    {/* 1. Medications Table */}
                                    <div>
                                        <div 
                                            className="rounded-lg overflow-hidden"
                                            style={{ 
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                            }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Medication
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Dose Period
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Dose
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Total Expected Doses
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Missed Doses
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Start Date
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            End Date
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {medicationRecords.length > 0 ? (
                                                        medicationRecords.map((med, index) => (
                                                            <tr 
                                                                key={med.id}
                                                                style={{ borderBottom: index < medicationRecords.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {med.medication}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {med.dosePeriod}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {med.dose}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {med.totalExpectedDoses}
                                                                </td>
                                                                <td 
                                                                    className="text-sm px-4 py-3" 
                                                                    style={{ color: med.missedDoses > 0 ? '#DC2626' : 'var(--slds-g-color-text-default)' }}
                                                                >
                                                                    {med.missedDoses}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(med.startDate)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(med.endDate)}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td 
                                                                colSpan={7} 
                                                                className="text-sm px-4 py-8 text-center italic"
                                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                No prescription records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Medication records are view-only within the ITP. To add, edit, or delete medications, please manage them through the youth's Medication records.
                                        </p>
                                    </div>

                                    {/* 2. Calculated Medication Compliance Metric */}
                                    <div 
                                        className="p-4 rounded-lg"
                                        style={{ 
                                            backgroundColor: totalMissedDoses > 5 ? '#FEF2F2' : '#F0FDF4',
                                            border: `2px solid ${totalMissedDoses > 5 ? '#FECACA' : '#BBF7D0'}`
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="p-2 rounded-full"
                                                style={{ 
                                                    backgroundColor: totalMissedDoses > 5 ? '#FEE2E2' : '#DCFCE7' 
                                                }}
                                            >
                                                <Pill 
                                                    className="h-5 w-5" 
                                                    style={{ color: totalMissedDoses > 5 ? '#DC2626' : '#16A34A' }} 
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p 
                                                    className="text-xs font-semibold uppercase tracking-wide"
                                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                >
                                                    Total Number of Missing/Incomplete Doses
                                                </p>
                                                <p 
                                                    className="text-2xl font-bold mt-0.5"
                                                    style={{ color: totalMissedDoses > 5 ? '#DC2626' : '#16A34A' }}
                                                >
                                                    {totalMissedDoses}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Medication Narrative Commentary */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-2"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Medication Summary
                                        </h3>

                                        {/* Instructions */}
                                        <div 
                                            className="p-3 rounded-lg mb-3"
                                            style={{ 
                                                backgroundColor: '#EFF6FF',
                                                border: '1px solid #BFDBFE'
                                            }}
                                        >
                                            <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>
                                                <strong>Instructions:</strong> Summarize the use of medication in the youth's treatment. 
                                                Please do not repeat the specific details of different prescriptions—those details are listed above. 
                                                Focus on the youth's response to medication as part of treatment, any significant changes in the 
                                                approach to medication for this youth, and any medication compliance issues the youth has struggled with.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={medicationNarrative || (medicationRecords.length === 0 ? "No prescription records exist for the current ITP period." : "")}
                                            onChange={(e) => setMedicationNarrative(e.target.value)}
                                            disabled={sectionStatus['medication'] === 'Complete'}
                                            placeholder="Enter medication summary narrative..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['medication'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                        
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: AI summary generation is not available for this section. Please enter narrative commentary manually.
                                        </p>
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['medication'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('medication')}
                                            >
                                                Re-Open Section
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-full h-8"
                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                    onClick={() => {
                                                        setMedicationNarrative("");
                                                        toast.info("Changes discarded");
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-full h-8"
                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                    onClick={() => handleSaveSection('medication')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('medication')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Physical Health Section */}
                            {activeSection === 'physical-health' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('physical-health')}
                                    
                                    {/* 1. Current Medical Needs Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Current Medical Needs
                                        </h3>
                                        
                                        <div 
                                            className="rounded-lg overflow-hidden"
                                            style={{ 
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                            }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Type
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Start Date
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            End Date
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Details
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {physicalHealthData.currentMedicalNeeds.length > 0 ? (
                                                        physicalHealthData.currentMedicalNeeds.map((need, index) => (
                                                            <tr 
                                                                key={need.id}
                                                                style={{ borderBottom: index < physicalHealthData.currentMedicalNeeds.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {need.type}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(need.startDate)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(need.endDate)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {need.details}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td 
                                                                colSpan={4} 
                                                                className="text-sm px-4 py-8 text-center italic"
                                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                No current medical needs on file for the youth.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Medical needs are view-only within the ITP. To add, edit, or delete medical needs, please manage them through the youth's profile.
                                        </p>
                                    </div>

                                    {/* 2. Medical Connections Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Medical Connections
                                        </h3>
                                        
                                        <div 
                                            className="rounded-lg overflow-hidden"
                                            style={{ 
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                            }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Date
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Type
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Reason
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {physicalHealthData.medicalConnections.length > 0 ? (
                                                        physicalHealthData.medicalConnections.map((conn, index) => (
                                                            <tr 
                                                                key={conn.id}
                                                                style={{ borderBottom: index < physicalHealthData.medicalConnections.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(conn.date)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {conn.type}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {conn.reason}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td 
                                                                colSpan={3} 
                                                                className="text-sm px-4 py-8 text-center italic"
                                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                No medical connections recorded for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Medical appointments are view-only within the ITP. To add, edit, or delete appointments, please use the Connections module.
                                        </p>
                                    </div>

                                    {/* 3. Key Medical Dates */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Key Medical Dates
                                        </h3>
                                        
                                        <div 
                                            className="p-4 rounded-lg"
                                            style={{ 
                                                backgroundColor: 'var(--slds-g-color-background-alt)',
                                                border: '1px solid var(--slds-g-color-border-base-1)'
                                            }}
                                        >
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Last Annual Physical */}
                                                <div>
                                                    <label 
                                                        className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Last Annual Physical
                                                    </label>
                                                    <div 
                                                        className="text-sm px-3 py-2 rounded bg-white"
                                                        style={{ 
                                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                                            color: 'var(--slds-g-color-text-default)'
                                                        }}
                                                    >
                                                        {formatDate(physicalHealthData.keyMedicalDates.lastAnnualPhysical)}
                                                    </div>
                                                </div>

                                                {/* Last Biennial Dental */}
                                                <div>
                                                    <label 
                                                        className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Last Biennial Dental
                                                    </label>
                                                    <div 
                                                        className="text-sm px-3 py-2 rounded bg-white"
                                                        style={{ 
                                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                                            color: 'var(--slds-g-color-text-default)'
                                                        }}
                                                    >
                                                        {formatDate(physicalHealthData.keyMedicalDates.lastBiennialDental)}
                                                    </div>
                                                </div>

                                                {/* Last Hearing */}
                                                <div>
                                                    <label 
                                                        className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Last Hearing
                                                    </label>
                                                    <div 
                                                        className="text-sm px-3 py-2 rounded bg-white"
                                                        style={{ 
                                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                                            color: 'var(--slds-g-color-text-default)'
                                                        }}
                                                    >
                                                        {formatDate(physicalHealthData.keyMedicalDates.lastHearing)}
                                                    </div>
                                                </div>

                                                {/* Last Vision */}
                                                <div>
                                                    <label 
                                                        className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Last Vision
                                                    </label>
                                                    <div 
                                                        className="text-sm px-3 py-2 rounded bg-white"
                                                        style={{ 
                                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                                            color: 'var(--slds-g-color-text-default)'
                                                        }}
                                                    >
                                                        {formatDate(physicalHealthData.keyMedicalDates.lastVision)}
                                                    </div>
                                                </div>

                                                {/* Behavior */}
                                                <div className="col-span-2">
                                                    <label 
                                                        className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Behavior
                                                    </label>
                                                    <div 
                                                        className="text-sm px-3 py-2 rounded bg-white"
                                                        style={{ 
                                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                                            color: 'var(--slds-g-color-text-default)'
                                                        }}
                                                    >
                                                        {physicalHealthData.keyMedicalDates.behavior || '—'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Key medical dates are sourced from the youth's profile and update dynamically.
                                        </p>
                                    </div>

                                    {/* 4. Eligibility for CPI Holds Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Eligibility for CPI Holds
                                        </h3>
                                        
                                        <div 
                                            className="rounded-lg overflow-hidden"
                                            style={{ 
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                            }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Start Date
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Type
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Details
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Status
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            End Date
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {physicalHealthData.cpiHolds.length > 0 ? (
                                                        physicalHealthData.cpiHolds.map((hold, index) => (
                                                            <tr 
                                                                key={hold.id}
                                                                style={{ borderBottom: index < physicalHealthData.cpiHolds.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(hold.startDate)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {hold.type}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {hold.details}
                                                                </td>
                                                                <td className="text-sm px-4 py-3">
                                                                    <Badge 
                                                                        className="text-xs px-2 py-0.5"
                                                                        style={{
                                                                            backgroundColor: hold.status === 'Active' ? '#FEF2F2' : '#F0FDF4',
                                                                            color: hold.status === 'Active' ? '#DC2626' : '#16A34A',
                                                                            border: `1px solid ${hold.status === 'Active' ? '#FECACA' : '#BBF7D0'}`
                                                                        }}
                                                                    >
                                                                        {hold.status}
                                                                    </Badge>
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(hold.endDate)}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td 
                                                                colSpan={5} 
                                                                className="text-sm px-4 py-8 text-center italic"
                                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                No CPI hold records on file for the youth.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: CPI hold records are view-only within the ITP. To add, edit, or delete CPI holds, please manage them through the youth's profile.
                                        </p>
                                    </div>

                                    {/* 5. Physical Health Narrative Commentary */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-2"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Physical Health Summary
                                        </h3>

                                        {/* Instructions */}
                                        <div 
                                            className="p-3 rounded-lg mb-3"
                                            style={{ 
                                                backgroundColor: '#EFF6FF',
                                                border: '1px solid #BFDBFE'
                                            }}
                                        >
                                            <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>
                                                <strong>Instructions:</strong> Summarize and discuss any relevant medical history or health conditions. 
                                                Include the youth's response to and engagement with treatment for any health conditions, especially if 
                                                compliance with medical treatment is important.
                                                <br /><br />
                                                If the youth is out of compliance with a required medical appointment (e.g., annual physical), explain 
                                                why and what plan is in place to address the compliance.
                                                <br /><br />
                                                Please do not repeat the specific details of medical appointments—those details are listed above.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={physicalHealthNarrative}
                                            onChange={(e) => setPhysicalHealthNarrative(e.target.value)}
                                            disabled={sectionStatus['physical-health'] === 'Complete'}
                                            placeholder="Enter physical health summary narrative..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['physical-health'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                        
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: AI summary generation is not available for this section. Please enter narrative commentary manually.
                                        </p>
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['physical-health'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('physical-health')}
                                            >
                                                Re-Open Section
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-full h-8"
                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                    onClick={() => {
                                                        setPhysicalHealthNarrative("");
                                                        toast.info("Changes discarded");
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-full h-8"
                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                    onClick={() => handleSaveSection('physical-health')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('physical-health')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Mental Health Section */}
                            {activeSection === 'mental-health' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('mental-health')}
                                    
                                    {/* 1. Mental Health Supplemental Plans Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Mental Health Supplemental Plans
                                        </h3>
                                        
                                        <div 
                                            className="rounded-lg overflow-hidden"
                                            style={{ 
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                            }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Start Date
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Type
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Plan Description
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            End Date
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {mentalHealthData.supplementalPlans.length > 0 ? (
                                                        mentalHealthData.supplementalPlans.map((plan, index) => (
                                                            <tr 
                                                                key={plan.id}
                                                                style={{ borderBottom: index < mentalHealthData.supplementalPlans.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(plan.startDate)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {plan.type}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {plan.planDescription}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(plan.endDate)}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td 
                                                                colSpan={4} 
                                                                className="text-sm px-4 py-8 text-center italic"
                                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                No Mental Health Supplemental Plans on file for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Supplemental Plans are view-only within the ITP. To add, edit, or delete plans, please manage them through the youth's profile.
                                        </p>
                                    </div>

                                    {/* 1a. Mental Health Supplemental Plans - Section Commentary */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Supplemental Plans Commentary
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    toast.info("Generate Summary would import Progress Tracking entries for Supplemental Plans");
                                                    // Simulate AI generation
                                                    setMentalHealthSupplementalPlansNarrative(
                                                        "During this treatment quarter, the youth maintained active engagement with their No Harm Contract and Self Harm Safety Plan. Staff observed consistent compliance with notification protocols when experiencing distressing thoughts. The youth demonstrates improved ability to utilize coping strategies outlined in the safety plan, particularly during high-stress situations."
                                                    );
                                                }}
                                                className="text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
                                                style={{ 
                                                    color: 'var(--color-brand-primary)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                <Sparkles className="h-3.5 w-3.5 inline mr-1" />
                                                Generate Summary
                                            </button>
                                        </div>

                                        {/* Instructions */}
                                        <div 
                                            className="p-3 rounded-lg mb-3"
                                            style={{ 
                                                backgroundColor: '#EFF6FF',
                                                border: '1px solid #BFDBFE'
                                            }}
                                        >
                                            <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>
                                                <strong>Instructions:</strong> Summarize any No Harm Contracts, Self Harm Safety Plans, Suicide Prevention Agreements, 
                                                Homicide Prevention Plans, or Harm Risk Assessments that were active for this youth during this treatment quarter.
                                                <br /><br />
                                                Please do not repeat any specifics such as the dates or plan types—those details are listed above.
                                                <br /><br />
                                                Focus on any trends or patterns observed that relate to the use of these Supplemental Plans for this youth. 
                                                Describe the youth's response to the Supplemental Plans and how they fit into the youth's overall treatment.
                                                <br /><br />
                                                Use the Generate Summary link to import any Progress Tracking entries associated with these Supplemental Plans.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={mentalHealthSupplementalPlansNarrative || (mentalHealthData.supplementalPlans.length === 0 ? "No relevant Supplemental Plan records exist for the current ITP period." : "")}
                                            onChange={(e) => setMentalHealthSupplementalPlansNarrative(e.target.value)}
                                            disabled={sectionStatus['mental-health'] === 'Complete'}
                                            placeholder="Enter supplemental plans commentary..."
                                            rows={6}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['mental-health'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* 2. Diagnostic Impression Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Diagnostic Impression
                                        </h3>
                                        
                                        <div 
                                            className="rounded-lg overflow-hidden"
                                            style={{ 
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                            }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Start Date
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Code
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Details
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            End Date
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {mentalHealthData.diagnosticImpression.length > 0 ? (
                                                        mentalHealthData.diagnosticImpression.map((diagnosis, index) => (
                                                            <tr 
                                                                key={diagnosis.id}
                                                                style={{ borderBottom: index < mentalHealthData.diagnosticImpression.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(diagnosis.startDate)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3 font-mono" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {diagnosis.code}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {diagnosis.details}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(diagnosis.endDate)}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td 
                                                                colSpan={4} 
                                                                className="text-sm px-4 py-8 text-center italic"
                                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                No diagnostic impression records on file for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Diagnoses are view-only within the ITP. To add, edit, or delete diagnoses, please manage them through the youth's profile.
                                        </p>
                                    </div>

                                    {/* 2a. Diagnostic Impression - Section Commentary */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Diagnostic Impression Commentary
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    toast.info("Generate Summary would import Progress Tracking entries for Diagnoses");
                                                    // Simulate AI generation
                                                    setDiagnosticImpressionNarrative(
                                                        "The youth's diagnoses remained stable throughout this quarter. Treatment interventions focused primarily on anxiety management and depression symptom reduction. Staff observed moderate improvement in the youth's ability to recognize and communicate symptoms early. Ongoing monitoring of mood patterns will continue to inform treatment adjustments."
                                                    );
                                                }}
                                                className="text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
                                                style={{ 
                                                    color: 'var(--color-brand-primary)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                <Sparkles className="h-3.5 w-3.5 inline mr-1" />
                                                Generate Summary
                                            </button>
                                        </div>

                                        {/* Instructions */}
                                        <div 
                                            className="p-3 rounded-lg mb-3"
                                            style={{ 
                                                backgroundColor: '#EFF6FF',
                                                border: '1px solid #BFDBFE'
                                            }}
                                        >
                                            <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>
                                                <strong>Instructions:</strong> Summarize the youth's diagnoses, focusing on specific ways they were relevant during this treatment quarter.
                                                <br /><br />
                                                Also, comment on potential diagnoses to keep an eye on going forward, even if the diagnoses haven't been given formally yet.
                                                <br /><br />
                                                Please do not list the diagnoses or the original reason for them—those are listed above.
                                                <br /><br />
                                                Feel free to write this section as an overall summary of the youth's diagnoses. 
                                                If a specific diagnosis requires additional attention, use a bold header for the name of that diagnosis with specific comments below.
                                                <br /><br />
                                                Use the Generate Summary link to import Progress Tracking entries associated with the diagnoses.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={diagnosticImpressionNarrative || (mentalHealthData.diagnosticImpression.length === 0 ? "No relevant Diagnoses exist for the current ITP period." : "")}
                                            onChange={(e) => setDiagnosticImpressionNarrative(e.target.value)}
                                            disabled={sectionStatus['mental-health'] === 'Complete'}
                                            placeholder="Enter diagnostic impression commentary..."
                                            rows={6}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['mental-health'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* 3. Mental Health Connections Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Mental Health Connections
                                        </h3>
                                        
                                        <div 
                                            className="rounded-lg overflow-hidden"
                                            style={{ 
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                            }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Date
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Type
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Reason
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {mentalHealthData.mentalHealthConnections.length > 0 ? (
                                                        mentalHealthData.mentalHealthConnections.map((conn, index) => (
                                                            <tr 
                                                                key={conn.id}
                                                                style={{ borderBottom: index < mentalHealthData.mentalHealthConnections.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(conn.date)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {conn.type}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {conn.reason}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td 
                                                                colSpan={3} 
                                                                className="text-sm px-4 py-8 text-center italic"
                                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                No mental health connections recorded for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Mental Health Connections are view-only within the ITP. To add, edit, or delete connections, please use the Connections module.
                                        </p>
                                    </div>

                                    {/* 3a. Mental Health Connections - Section Commentary */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Mental Health Connections Commentary
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    toast.info("Generate Summary would import Mental Health Connection details and themes");
                                                    // Simulate AI generation
                                                    setMentalHealthConnectionsNarrative(
                                                        "The youth attended all scheduled therapy sessions this quarter, demonstrating consistent engagement with mental health services. Sessions focused on anxiety management techniques, with particular emphasis on recognizing triggers and implementing coping strategies. The youth reported progress in applying skills learned during individual therapy to real-world situations within the milieu."
                                                    );
                                                }}
                                                className="text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
                                                style={{ 
                                                    color: 'var(--color-brand-primary)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                <Sparkles className="h-3.5 w-3.5 inline mr-1" />
                                                Generate Summary
                                            </button>
                                        </div>

                                        {/* Instructions */}
                                        <div 
                                            className="p-3 rounded-lg mb-3"
                                            style={{ 
                                                backgroundColor: '#EFF6FF',
                                                border: '1px solid #BFDBFE'
                                            }}
                                        >
                                            <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>
                                                <strong>Instructions:</strong> Summarize any mental health–related Connections that the youth participated in during this treatment quarter.
                                                <br /><br />
                                                Please do not repeat the specific details of the Connections, such as date, time, or frequency—those details are listed above.
                                                <br /><br />
                                                Focus on any trends or major themes present in these Connections and how they fit into the youth's overall treatment.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={mentalHealthConnectionsNarrative || (mentalHealthData.mentalHealthConnections.length === 0 ? "No relevant Mental Health Connections exist for the current ITP period." : "")}
                                            onChange={(e) => setMentalHealthConnectionsNarrative(e.target.value)}
                                            disabled={sectionStatus['mental-health'] === 'Complete'}
                                            placeholder="Enter mental health connections commentary..."
                                            rows={6}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['mental-health'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['mental-health'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('mental-health')}
                                            >
                                                Re-Open Section
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-full h-8"
                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                    onClick={() => {
                                                        setMentalHealthSupplementalPlansNarrative("");
                                                        setDiagnosticImpressionNarrative("");
                                                        setMentalHealthConnectionsNarrative("");
                                                        toast.info("Changes discarded");
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-full h-8"
                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                    onClick={() => handleSaveSection('mental-health')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('mental-health')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Triggers & Coping Skills Section */}
                            {activeSection === 'triggers' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('triggers')}
                                    
                                    {/* 1. Triggers Table */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Triggers
                                            </h3>
                                            <button
                                                onClick={handleOpenSelectTriggersModal}
                                                disabled={sectionStatus['triggers'] === 'Complete'}
                                                className="text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ 
                                                    color: 'var(--color-brand-primary)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                Select Triggers
                                            </button>
                                        </div>
                                        
                                        <div 
                                            className="rounded-lg overflow-hidden"
                                            style={{ 
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                            }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Trigger
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Description
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Related Coping Skills
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Reported Date
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Selected By
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {triggersData.length > 0 ? (
                                                        triggersData.map((trigger, index) => (
                                                            <tr 
                                                                key={trigger.id}
                                                                style={{ borderBottom: index < triggersData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td 
                                                                    className="text-sm px-4 py-3 cursor-pointer hover:underline" 
                                                                    style={{ color: 'var(--color-brand-primary)' }}
                                                                    onClick={() => toast.info('Trigger record modal would open here (separate user story)')}
                                                                >
                                                                    {trigger.trigger}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {trigger.description}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {trigger.relatedCopingSkills}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(trigger.reportedDate)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {trigger.selectedBy}
                                                                </td>
                                                                <td className="text-sm px-4 py-3">
                                                                    <button
                                                                        onClick={() => handleDeleteTrigger(trigger.id)}
                                                                        disabled={sectionStatus['triggers'] === 'Complete'}
                                                                        className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        style={{ color: '#DC2626' }}
                                                                        title="Delete trigger"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td 
                                                                colSpan={6} 
                                                                className="text-sm px-4 py-8 text-center italic"
                                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                No triggers have been identified for this youth during the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Triggers are sourced from the youth's Triggers and Coping Skills records and are read-only within the ITP. Click on a trigger to view or edit the underlying record.
                                        </p>
                                    </div>

                                    {/* 2. Triggers Section Commentary */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Triggers Section Commentary
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    if (triggersData.length === 0) {
                                                        toast.info("No triggers to import");
                                                        return;
                                                    }
                                                    toast.info("Generate Summary modal would open with trigger Progress Tracking entries");
                                                    // Simulate AI generation with triggers
                                                    const generatedText = triggersData.map(trigger => 
                                                        `**${trigger.trigger}**\n\nDuring this treatment quarter, this trigger was particularly relevant when the youth encountered situations involving ${trigger.description.toLowerCase()}. Staff observed that the youth demonstrated increased awareness of this trigger and made efforts to utilize related coping skills including: ${trigger.relatedCopingSkills}.`
                                                    ).join('\n\n');
                                                    setTriggersNarrative(generatedText);
                                                }}
                                                disabled={sectionStatus['triggers'] === 'Complete'}
                                                className="text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ 
                                                    color: 'var(--color-brand-primary)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                <Sparkles className="h-3.5 w-3.5 inline mr-1" />
                                                Generate Summary
                                            </button>
                                        </div>

                                        {/* Instructions (Verbatim as per AC19) */}
                                        <div 
                                            className="p-3 rounded-lg mb-3"
                                            style={{ 
                                                backgroundColor: '#EFF6FF',
                                                border: '1px solid #BFDBFE'
                                            }}
                                        >
                                            <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>
                                                <strong>Instructions:</strong> Use the Select Triggers link to identify only triggers that were relevant or important during this treatment quarter.
                                                <br />
                                                Then, use the Generate Summary link to import headers for each trigger and any Progress Tracking entries.
                                                <br />
                                                Each trigger should have at least one comment under the header explaining how the trigger was relevant during this treatment quarter.
                                                <br />
                                                If a trigger was not relevant during this quarter, it does not need to be listed at all.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={triggersNarrative || (triggersData.length === 0 ? "No Triggers were relevant during the current ITP period." : "")}
                                            onChange={(e) => setTriggersNarrative(e.target.value)}
                                            disabled={sectionStatus['triggers'] === 'Complete'}
                                            placeholder="Enter triggers commentary..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['triggers'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* 3. Coping Skills Table */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Coping Skills
                                            </h3>
                                            <button
                                                onClick={handleOpenSelectCopingSkillsModal}
                                                disabled={sectionStatus['triggers'] === 'Complete'}
                                                className="text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ 
                                                    color: 'var(--color-brand-primary)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                Select Coping Skills
                                            </button>
                                        </div>
                                        
                                        <div 
                                            className="rounded-lg overflow-hidden"
                                            style={{ 
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                            }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Coping Skill
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Description
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Effective When
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Reported Date
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Selected By
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {copingSkillsData.length > 0 ? (
                                                        copingSkillsData.map((skill, index) => (
                                                            <tr 
                                                                key={skill.id}
                                                                style={{ borderBottom: index < copingSkillsData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td 
                                                                    className="text-sm px-4 py-3 cursor-pointer hover:underline" 
                                                                    style={{ color: 'var(--color-brand-primary)' }}
                                                                    onClick={() => toast.info('Coping Skill record modal would open here (separate user story)')}
                                                                >
                                                                    {skill.copingSkill}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {skill.description}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {skill.effectiveWhen}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(skill.reportedDate)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {skill.selectedBy}
                                                                </td>
                                                                <td className="text-sm px-4 py-3">
                                                                    <button
                                                                        onClick={() => handleDeleteCopingSkill(skill.id)}
                                                                        disabled={sectionStatus['triggers'] === 'Complete'}
                                                                        className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        style={{ color: '#DC2626' }}
                                                                        title="Delete coping skill"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td 
                                                                colSpan={6} 
                                                                className="text-sm px-4 py-8 text-center italic"
                                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                No coping skills have been identified for this youth during the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Coping Skills are sourced from the youth's Triggers and Coping Skills records and are read-only within the ITP. Click on a coping skill to view or edit the underlying record.
                                        </p>
                                    </div>

                                    {/* 4. Coping Skills Section Commentary */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Coping Skills Section Commentary
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    if (copingSkillsData.length === 0) {
                                                        toast.info("No coping skills to import");
                                                        return;
                                                    }
                                                    toast.info("Generate Summary modal would open with coping skill Progress Tracking entries");
                                                    // Simulate AI generation with coping skills
                                                    const generatedText = copingSkillsData.map(skill => 
                                                        `**${skill.copingSkill}**\n\nThe youth demonstrated use of this coping skill during the treatment quarter. ${skill.description} This strategy proved particularly effective ${skill.effectiveWhen.toLowerCase()}. Staff observations indicate the youth is developing proficiency with this skill and utilizing it with increasing independence.`
                                                    ).join('\n\n');
                                                    setCopingSkillsNarrative(generatedText);
                                                }}
                                                disabled={sectionStatus['triggers'] === 'Complete'}
                                                className="text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ 
                                                    color: 'var(--color-brand-primary)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                <Sparkles className="h-3.5 w-3.5 inline mr-1" />
                                                Generate Summary
                                            </button>
                                        </div>

                                        {/* Instructions (Verbatim as per AC43) */}
                                        <div 
                                            className="p-3 rounded-lg mb-3"
                                            style={{ 
                                                backgroundColor: '#EFF6FF',
                                                border: '1px solid #BFDBFE'
                                            }}
                                        >
                                            <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>
                                                <strong>Instructions:</strong> Use the Select Coping Skills link to identify only coping skills that were relevant or important during this treatment quarter.
                                                <br />
                                                Then, use the Generate Summary link to import headers for each coping skill and any Progress Tracking entries.
                                                <br />
                                                Each coping skill should have at least one comment under the header explaining how the coping skill was relevant during this treatment quarter.
                                                <br />
                                                If a coping skill was not relevant during this quarter, it does not need to be listed at all.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={copingSkillsNarrative || (copingSkillsData.length === 0 ? "No Coping Skills were relevant during the current ITP period." : "")}
                                            onChange={(e) => setCopingSkillsNarrative(e.target.value)}
                                            disabled={sectionStatus['triggers'] === 'Complete'}
                                            placeholder="Enter coping skills commentary..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['triggers'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['triggers'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('triggers')}
                                            >
                                                Re-Open Section
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-full h-8"
                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                    onClick={() => {
                                                        setTriggersNarrative("");
                                                        setCopingSkillsNarrative("");
                                                        toast.info("Changes discarded");
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-full h-8"
                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                    onClick={() => handleSaveSection('triggers')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('triggers')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Goals & Objectives Section */}
                            {activeSection === 'goals-objectives' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('goals-objectives')}
                                    
                                    {/* 0. PTP Statements Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Positive Transition Planning Statements
                                        </h3>
                                        
                                        <div 
                                            className="rounded-lg overflow-hidden"
                                            style={{ 
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                            }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Statement
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Start Date
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            End Date
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Outcome Domain
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Status
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {ptpStatementsData.length > 0 ? (
                                                        ptpStatementsData.map((ptp, index) => (
                                                            <tr 
                                                                key={ptp.id}
                                                                style={{ borderBottom: index < ptpStatementsData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td 
                                                                    className="text-sm px-4 py-3 cursor-pointer hover:underline" 
                                                                    style={{ color: 'var(--color-brand-primary)' }}
                                                                    onClick={() => toast.info('PTP record modal would open here (separate user story)')}
                                                                >
                                                                    {ptp.statement}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(ptp.startDate)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {ptp.endDate ? formatDate(ptp.endDate) : '—'}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {ptp.outcomeDomain}
                                                                </td>
                                                                <td className="text-sm px-4 py-3">
                                                                    <Badge 
                                                                        className="text-xs px-2 py-0.5"
                                                                        style={{
                                                                            backgroundColor: ptp.status === 'Active' ? '#DCFCE7' : '#FEE2E2',
                                                                            color: ptp.status === 'Active' ? '#16A34A' : '#DC2626',
                                                                            border: `1px solid ${ptp.status === 'Active' ? '#BBF7D0' : '#FECACA'}`
                                                                        }}
                                                                    >
                                                                        {ptp.status}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td 
                                                                colSpan={5} 
                                                                className="text-sm px-4 py-8 text-center italic"
                                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                No PTP statements on file for this youth.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: PTP Statements are sourced from the youth's PTP records and are read-only within the ITP. Click on a statement to view or edit details.
                                        </p>
                                    </div>

                                    {/* 1. Goals Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Goals
                                        </h3>
                                        
                                        <div 
                                            className="rounded-lg overflow-hidden"
                                            style={{ 
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                            }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Goal
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Start Date
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Target End Date
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            End Date
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Outcome Domain
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Status
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {goalsData.length > 0 ? (
                                                        goalsData.map((goal, index) => (
                                                            <tr 
                                                                key={goal.id}
                                                                style={{ borderBottom: index < goalsData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td 
                                                                    className="text-sm px-4 py-3 cursor-pointer hover:underline" 
                                                                    style={{ color: 'var(--color-brand-primary)' }}
                                                                    onClick={() => toast.info('Goal record modal would open here (separate user story)')}
                                                                >
                                                                    {goal.goal}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(goal.startDate)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(goal.targetEndDate)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(goal.endDate)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {goal.outcomeDomain}
                                                                </td>
                                                                <td className="text-sm px-4 py-3">
                                                                    <Badge 
                                                                        className="text-xs px-2 py-0.5"
                                                                        style={{
                                                                            backgroundColor: goal.status === 'Achieved' ? '#DCFCE7' : goal.status === 'Discontinued' ? '#FEE2E2' : '#FEF3C7',
                                                                            color: goal.status === 'Achieved' ? '#16A34A' : goal.status === 'Discontinued' ? '#DC2626' : '#D97706',
                                                                            border: `1px solid ${goal.status === 'Achieved' ? '#BBF7D0' : goal.status === 'Discontinued' ? '#FECACA' : '#FCD34D'}`
                                                                        }}
                                                                    >
                                                                        {goal.status}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td 
                                                                colSpan={6} 
                                                                className="text-sm px-4 py-8 text-center italic"
                                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                No goals on file for this youth.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Goals are sourced from the youth's Goals records and are read-only within the ITP. Click on a goal to view or edit details.
                                        </p>
                                    </div>

                                    {/* 2. Achieved Goals Section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Achieved Goals
                                            </h3>
                                            <button
                                                onClick={handleOpenAchievedGoalsModal}
                                                disabled={sectionStatus['goals-objectives'] === 'Complete'}
                                                className="text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ 
                                                    color: 'var(--color-brand-primary)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                <Sparkles className="h-3.5 w-3.5 inline mr-1" />
                                                Generate Summary
                                            </button>
                                        </div>

                                        {/* Instructions (Verbatim) */}
                                        <div 
                                            className="p-3 rounded-lg mb-3"
                                            style={{ 
                                                backgroundColor: '#EFF6FF',
                                                border: '1px solid #BFDBFE'
                                            }}
                                        >
                                            <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>
                                                <strong>Instructions:</strong> For each goal that the youth achieved during this treatment quarter, use a bold header followed by clear, sequential statements to explain the youth's progress, and how the goal was achieved.
                                                <br /><br />
                                                This can be accomplished mostly by using the Generate Summary link to import Progress Tracking entries and other details about each goal.
                                                <br /><br />
                                                Feel free to use bullet points if they are effective in demonstrating the youth's progress.
                                                <br /><br />
                                                Achieved Goals are defined as Goals that were marked as achieved during the timeframe of this treatment quarter for this youth.
                                                <br /><br />
                                                If no Goals fall into this category, leave this text box as-is.
                                                <br /><br />
                                                Youth should always have at least 3 SMART goals.
                                                <br />
                                                SMART Goals are: Specific, Measurable, Attainable, Relevant, Time-Bound.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={goalsAchievedNarrative || (achievedGoals.length === 0 ? "No Goals were achieved during the current ITP period." : "")}
                                            onChange={(e) => setGoalsAchievedNarrative(e.target.value)}
                                            disabled={sectionStatus['goals-objectives'] === 'Complete'}
                                            placeholder="Enter achieved goals narrative..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['goals-objectives'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* 3. Discontinued Goals Section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Discontinued Goals
                                            </h3>
                                            <button
                                                onClick={handleOpenDiscontinuedGoalsModal}
                                                disabled={sectionStatus['goals-objectives'] === 'Complete'}
                                                className="text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ 
                                                    color: 'var(--color-brand-primary)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                <Sparkles className="h-3.5 w-3.5 inline mr-1" />
                                                Generate Summary
                                            </button>
                                        </div>

                                        {/* Instructions (Verbatim) */}
                                        <div 
                                            className="p-3 rounded-lg mb-3"
                                            style={{ 
                                                backgroundColor: '#EFF6FF',
                                                border: '1px solid #BFDBFE'
                                            }}
                                        >
                                            <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>
                                                <strong>Instructions:</strong> For each goal that was discontinued during this treatment quarter, use a bold header followed by clear, sequential statements to explain the youth's progress, and why the goal was discontinued.
                                                <br /><br />
                                                Explicitly state if there was no relevant progress.
                                                <br /><br />
                                                This can be accomplished mostly by using the Generate Summary link to import Progress Tracking entries and other details about each goal.
                                                <br /><br />
                                                Feel free to use bullet points if they are effective in demonstrating the youth's progress.
                                                <br /><br />
                                                Discontinued Goals are defined as Goals that were discontinued during the timeframe of this treatment quarter for this youth.
                                                <br /><br />
                                                If no Goals fall into this category, leave this text box as-is.
                                                <br /><br />
                                                Youth should always have at least 3 SMART goals.
                                                <br />
                                                SMART Goals are: Specific, Measurable, Attainable, Relevant, Time-Bound.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={goalsDiscontinuedNarrative || (discontinuedGoals.length === 0 ? "No Goals were discontinued during the current ITP period." : "")}
                                            onChange={(e) => setGoalsDiscontinuedNarrative(e.target.value)}
                                            disabled={sectionStatus['goals-objectives'] === 'Complete'}
                                            placeholder="Enter discontinued goals narrative..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['goals-objectives'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* 4. Open (In Progress) Goals Section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Open Goals
                                            </h3>
                                            <button
                                                onClick={handleOpenOpenGoalsModal}
                                                disabled={sectionStatus['goals-objectives'] === 'Complete'}
                                                className="text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ 
                                                    color: 'var(--color-brand-primary)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                <Sparkles className="h-3.5 w-3.5 inline mr-1" />
                                                Generate Summary
                                            </button>
                                        </div>

                                        {/* Instructions (Verbatim) */}
                                        <div 
                                            className="p-3 rounded-lg mb-3"
                                            style={{ 
                                                backgroundColor: '#EFF6FF',
                                                border: '1px solid #BFDBFE'
                                            }}
                                        >
                                            <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>
                                                <strong>Instructions:</strong> For each goal that is still open, use a bold header followed by clear, sequential statements to explain the youth's progress to date and the current status of the goal.
                                                <br /><br />
                                                Explicitly state if there was no relevant progress.
                                                <br /><br />
                                                This can be accomplished mostly by using the Generate Summary link to import Progress Tracking entries and other details about each goal.
                                                <br /><br />
                                                Feel free to use bullet points if they are effective in demonstrating the youth's progress.
                                                <br /><br />
                                                Open Goals are defined as Goals that were still active as of the end of this treatment quarter.
                                                <br /><br />
                                                If no Goals fall into this category, leave this text box as-is.
                                                <br /><br />
                                                Youth should always have at least 3 SMART goals.
                                                <br />
                                                SMART Goals are: Specific, Measurable, Attainable, Relevant, Time-Bound.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={goalsOpenNarrative || (openGoals.length === 0 ? "No Goals are currently In Progress during the current ITP period." : "")}
                                            onChange={(e) => setGoalsOpenNarrative(e.target.value)}
                                            disabled={sectionStatus['goals-objectives'] === 'Complete'}
                                            placeholder="Enter open goals narrative..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['goals-objectives'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['goals-objectives'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('goals-objectives')}
                                            >
                                                Re-Open Section
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-full h-8"
                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                    onClick={() => {
                                                        setGoalsAchievedNarrative("");
                                                        setGoalsDiscontinuedNarrative("");
                                                        setGoalsOpenNarrative("");
                                                        toast.info("Changes discarded");
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-full h-8"
                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                    onClick={() => handleSaveSection('goals-objectives')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('goals-objectives')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Care Planning Meeting Section */}

    </>
  );
}