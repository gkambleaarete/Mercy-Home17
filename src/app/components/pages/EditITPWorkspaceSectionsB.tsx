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
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { toast } from "sonner@2.0.3";

export function EditITPWorkspaceSectionsB(props: any) {
  const {
    formatDate,
    activeSection, setActiveSection,
    isItpFinalized, setIsItpFinalized,
    sectionStatus, setSectionStatus,
    sectionContributors, setSectionContributors,
    itpLifecycleStatus, setItpLifecycleStatus,
    renderSectionHeader, handleSaveSection, handleCompleteSection, handleReopenSection,
    handleScheduleMeeting,
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
    carePlanningMeetingData,
    transitionPlanningData,
    lengthOfStayMonths,
    milieuSupplementalPlansData,
    familyActivitiesData,
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
    handleOpenSelectStrengths, handleCloseSelectStrengths,
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
                            {activeSection === 'care-planning' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('care-planning')}
                                    
                                    {/* 1. Care Planning Meeting Table */}
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
                                                            Date
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Participants
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Summary
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Transition Planning
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {carePlanningMeetingData.length > 0 ? (
                                                        carePlanningMeetingData.map((meeting, index) => (
                                                            <tr 
                                                                key={meeting.id}
                                                                style={{ borderBottom: index < carePlanningMeetingData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(meeting.date)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {meeting.participants}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {meeting.summary}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {meeting.transitionPlanning || '—'}
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
                                                                No Care Planning Meeting records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Care Planning Meeting records are view-only within the ITP. To add, edit, or delete Care Planning Meetings, please manage them through the youth's Connection records.
                                        </p>
                                    </div>

                                    {/* 2. Care Planning Meeting Narrative Section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Care Planning Meeting Summary
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    if (carePlanningMeetingData.length === 0) {
                                                        toast.info("No Care Planning Meeting records to import");
                                                        return;
                                                    }
                                                    toast.info("Generate Summary would import Care Planning Meeting Connection summary");
                                                    const generatedText = carePlanningMeetingData.map(meeting => 
                                                        meeting.summary
                                                    ).join('\n\n');
                                                    setCarePlanningMeetingNarrative(generatedText);
                                                }}
                                                disabled={sectionStatus['care-planning'] === 'Complete'}
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

                                        {/* Instructions (Verbatim as per requirements) */}
                                        

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={carePlanningMeetingNarrative || (carePlanningMeetingData.length === 0 ? "No Care Planning Meeting records exist for the current ITP period." : "")}
                                            onChange={(e) => setCarePlanningMeetingNarrative(e.target.value)}
                                            disabled={sectionStatus['care-planning'] === 'Complete'}
                                            placeholder="Enter Care Planning Meeting summary narrative..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['care-planning'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['care-planning'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('care-planning')}
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
                                                        setCarePlanningMeetingNarrative("");
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
                                                    onClick={() => handleSaveSection('care-planning')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('care-planning')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Transition Planning Section */}
                            {activeSection === 'transition' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('transition')}
                                    
                                    {/* 1. Program Enrollment Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Program Enrollment
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
                                                            Program
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Move In Date
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Move Out Date
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {transitionPlanningData.programEnrollment.length > 0 ? (
                                                        transitionPlanningData.programEnrollment.map((enrollment, index) => (
                                                            <tr 
                                                                key={enrollment.id}
                                                                style={{ borderBottom: index < transitionPlanningData.programEnrollment.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {enrollment.program}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(enrollment.moveInDate)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: enrollment.moveOutDate ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>
                                                                    {enrollment.moveOutDate ? formatDate(enrollment.moveOutDate) : '—'}
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
                                                                No program enrollment records exist for the youth.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Program Enrollment records are view-only within the ITP. To add, edit, or delete program enrollments, please manage them through the youth's profile.
                                        </p>
                                    </div>

                                    {/* 2. Community Launch Plan Table */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Community Launch Plan
                                            </h3>
                                            <button
                                                onClick={handleOpenSelectDomainsModal}
                                                disabled={sectionStatus['transition'] === 'Complete'}
                                                className="text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ 
                                                    color: 'var(--color-brand-primary)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                Select Domains
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
                                                            Domain
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Content
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Timeframe (Months)
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
                                                    {communityLaunchPlanData.length > 0 ? (
                                                        communityLaunchPlanData.map((plan, index) => (
                                                            <tr 
                                                                key={plan.id}
                                                                style={{ borderBottom: index < communityLaunchPlanData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {plan.domain}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {plan.content}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {plan.timeframeMonths}
                                                                </td>
                                                                <td className="text-sm px-4 py-3">
                                                                    <button
                                                                        onClick={() => handleDeleteDomain(plan.id)}
                                                                        disabled={sectionStatus['transition'] === 'Complete'}
                                                                        className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        style={{ color: '#DC2626' }}
                                                                        title="Delete domain"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
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
                                                                No Community Launch Plan entries exist for the youth.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Community Launch Plan entries are view-only within the ITP. Use the Select Domains button to add or remove domains from the table.
                                        </p>
                                    </div>

                                    {/* 3. Calculated Length of Stay */}
                                    <div 
                                        className="p-4 rounded-lg"
                                        style={{ 
                                            backgroundColor: 'white',
                                            border: '1px solid #E5E7EB'
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="p-2 rounded-full"
                                                style={{ 
                                                    backgroundColor: '#E8F5EC' 
                                                }}
                                            >
                                                <Clock 
                                                    className="h-5 w-5" 
                                                    style={{ color: '#145F33' }} 
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p 
                                                    className="text-xs font-semibold uppercase tracking-wide"
                                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                >
                                                    Length of Stay (Calculated)
                                                </p>
                                                <p 
                                                    className="text-2xl font-bold mt-0.5"
                                                    style={{ color: '#145F33' }}
                                                >
                                                    {lengthOfStayMonths} {lengthOfStayMonths === 1 ? 'month' : 'months'}
                                                </p>
                                                <p className="text-xs mt-1 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                    Calculated from Program Move In Date to ITP period end date. This value updates dynamically if upstream dates change.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4. Transition Planning Narrative Section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Transition Planning
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    if (carePlanningMeetingData.length === 0 || !carePlanningMeetingData[0].transitionPlanning) {
                                                        toast.info("No Transition Planning summary available from Care Planning Meeting");
                                                        return;
                                                    }
                                                    toast.info("Generate Summary would import Transition Planning summary from Care Planning Meeting Connection");
                                                    const generatedText = carePlanningMeetingData
                                                        .filter(meeting => meeting.transitionPlanning)
                                                        .map(meeting => meeting.transitionPlanning)
                                                        .join('\n\n');
                                                    setTransitionPlanningNarrative(generatedText);
                                                }}
                                                disabled={sectionStatus['transition'] === 'Complete'}
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

                                        {/* Instructions (Verbatim as per requirements) */}
                                        <div 
                                            className="p-3 rounded-lg mb-3"
                                            style={{ 
                                                backgroundColor: '#EFF6FF',
                                                border: '1px solid #BFDBFE'
                                            }}
                                        >
                                            <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>
                                                <strong>Instructions:</strong> In this text box, briefly discuss the youth's overall investment in program and progress towards a positive transition out of Mercy Home.
                                                <br /><br />
                                                Include the anticipated remaining length of stay for this youth and where the youth hopes to transition to after their stay in the current program.
                                                <br /><br />
                                                Please do not repeat any specific details of the youth's program enrollments or length of stay to date—those details are listed above.
                                                <br /><br />
                                                This can primarily be accomplished by using the Generate Summary link to import the transition planning summary that was entered in the Connection for the Care Planning Meeting.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={transitionPlanningNarrative || (carePlanningMeetingData.length === 0 ? "No relevant Care Planning Meeting exists for the current ITP period." : "")}
                                            onChange={(e) => setTransitionPlanningNarrative(e.target.value)}
                                            disabled={sectionStatus['transition'] === 'Complete'}
                                            placeholder="Enter transition planning narrative..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['transition'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['transition'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('transition')}
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
                                                        setTransitionPlanningNarrative("");
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
                                                    onClick={() => handleSaveSection('transition')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('transition')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Strengths Section */}
                            {activeSection === 'strengths' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('strengths')}
                                    
                                    {/* 1. Strengths Table */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Strengths
                                            </h3>
                                            <button
                                                onClick={handleOpenSelectStrengths}
                                                disabled={sectionStatus['strengths'] === 'Complete'}
                                                className="text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ 
                                                    color: 'var(--color-brand-primary)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                Select Strengths
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
                                                            Strength
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
                                                            Reported Date
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Selected By
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {strengthsData.length > 0 ? (
                                                        strengthsData.map((strength, index) => (
                                                            <tr 
                                                                key={strength.id}
                                                                style={{ borderBottom: index < strengthsData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {strength.strength}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {strength.description}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(strength.reportedDate)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {strength.selectedBy}
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
                                                                No strengths have been identified for this youth during the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Strengths are sourced from the youth's profile and are read-only within the ITP. To add, edit, or delete strengths, please manage them through the youth's profile.
                                        </p>
                                    </div>

                                    {/* 2. Strengths Narrative Section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Strengths
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    if (strengthsData.length === 0) {
                                                        toast.info("No strengths to import");
                                                        return;
                                                    }
                                                    toast.info("Generate Summary would import strength headers and Progress Tracking entries");
                                                    // Simulate AI generation with strengths
                                                    const generatedText = strengthsData.map(strength => 
                                                        `**${strength.strength}**\n\nDuring this treatment quarter, the youth demonstrated this strength through ${strength.description.toLowerCase()}. Staff observed consistent application of this strength in daily interactions and treatment activities.`
                                                    ).join('\n\n');
                                                    setStrengthsNarrative(generatedText);
                                                }}
                                                disabled={sectionStatus['strengths'] === 'Complete'}
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

                                        {/* Instructions (Verbatim as per requirements) */}
                                        

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={strengthsNarrative || (strengthsData.length === 0 ? "No Strengths were relevant during the current ITP period." : "")}
                                            onChange={(e) => setStrengthsNarrative(e.target.value)}
                                            disabled={sectionStatus['strengths'] === 'Complete'}
                                            placeholder="Enter strengths narrative..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['strengths'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['strengths'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('strengths')}
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
                                                        setStrengthsNarrative("");
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
                                                    onClick={() => handleSaveSection('strengths')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('strengths')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Milieu Engagement Section */}
                            {activeSection === 'milieu-engagement' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('milieu-engagement')}
                                    
                                    {/* 1. Supplemental Plans Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Supplemental Plans
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
                                                    {milieuSupplementalPlansData.length > 0 ? (
                                                        milieuSupplementalPlansData.map((plan, index) => (
                                                            <tr 
                                                                key={plan.id}
                                                                style={{ borderBottom: index < milieuSupplementalPlansData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
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
                                                                No Supplemental Plan records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Supplemental Plan records are view-only within the ITP. To add, edit, or delete Supplemental Plans, please manage them through the youth's profile.
                                        </p>
                                    </div>

                                    {/* 1a. Supplemental Plans Commentary */}
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
                                                    if (milieuSupplementalPlansData.length === 0) {
                                                        toast.info("No Supplemental Plans to import");
                                                        return;
                                                    }
                                                    toast.info("Generate Summary would import headers and Progress Tracking entries for Supplemental Plans");
                                                    // Simulate AI generation
                                                    const generatedText = milieuSupplementalPlansData.map(plan => 
                                                        `**${plan.type}**\n\nThe youth has been actively engaged with this supplemental plan during the treatment quarter. ${plan.planDescription} Staff observations indicate consistent participation and progress in achieving the goals outlined in this plan.`
                                                    ).join('\n\n');
                                                    setMilieuSupplementalPlansNarrative(generatedText);
                                                }}
                                                disabled={sectionStatus['milieu-engagement'] === 'Complete'}
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

                                        {/* Instructions */}
                                        

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={milieuSupplementalPlansNarrative || (milieuSupplementalPlansData.length === 0 ? "No relevant Supplemental Plan records exist for the current ITP period." : "")}
                                            onChange={(e) => setMilieuSupplementalPlansNarrative(e.target.value)}
                                            disabled={sectionStatus['milieu-engagement'] === 'Complete'}
                                            placeholder="Enter supplemental plans commentary..."
                                            rows={6}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['milieu-engagement'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* 2. Milieu Meetings / Connections Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Milieu Meetings / Connections
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
                                                            Connection Type
                                                        </th>
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
                                                            Attended
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Themes Addressed
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Participant Note
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Summary
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {milieuMeetingsData.length > 0 ? (
                                                        milieuMeetingsData.map((meeting, index) => (
                                                            <tr 
                                                                key={meeting.id}
                                                                style={{ borderBottom: index < milieuMeetingsData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {meeting.connectionType}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(meeting.date)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3">
                                                                    <Badge 
                                                                        className="text-xs px-2 py-0.5"
                                                                        style={{
                                                                            backgroundColor: meeting.attended === 'Yes' ? '#DCFCE7' : '#FEE2E2',
                                                                            color: meeting.attended === 'Yes' ? '#16A34A' : '#DC2626',
                                                                            border: `1px solid ${meeting.attended === 'Yes' ? '#BBF7D0' : '#FECACA'}`
                                                                        }}
                                                                    >
                                                                        {meeting.attended}
                                                                    </Badge>
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {meeting.themesAddressed}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {meeting.participantNote}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {meeting.summary || '—'}
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
                                                                No Milieu Meeting or Connection records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Milieu Meetings and Connection records are view-only within the ITP. To add, edit, or delete records, please use the Connections module.
                                        </p>
                                    </div>

                                    {/* 2a. Calculated Milieu Engagement Metrics */}
                                    <div 
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        {/* Milieu Meetings Metrics */}
                                        <div 
                                            className="p-4 rounded-lg"
                                            style={{ 
                                                backgroundColor: 'white',
                                                border: '1px solid #E5E7EB'
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="p-2 rounded-full"
                                                    style={{ 
                                                        backgroundColor: '#E8F5EC' 
                                                    }}
                                                >
                                                    <Users2 
                                                        className="h-5 w-5" 
                                                        style={{ color: '#145F33' }} 
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p 
                                                        className="text-xs font-semibold uppercase tracking-wide"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Milieu Meetings
                                                    </p>
                                                    <p 
                                                        className="text-2xl font-bold mt-0.5"
                                                        style={{ color: '#145F33' }}
                                                    >
                                                        {milieuMeetingsAttended} / {milieuMeetingsExpected}
                                                    </p>
                                                    <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                        Attended / Expected
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Other Milieu Engagement Meetings Metrics */}
                                        <div 
                                            className="p-4 rounded-lg"
                                            style={{ 
                                                backgroundColor: 'white',
                                                border: '1px solid #E5E7EB'
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="p-2 rounded-full"
                                                    style={{ 
                                                        backgroundColor: '#E8F5EC' 
                                                    }}
                                                >
                                                    <Activity 
                                                        className="h-5 w-5" 
                                                        style={{ color: '#145F33' }} 
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p 
                                                        className="text-xs font-semibold uppercase tracking-wide"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Other Milieu Engagement
                                                    </p>
                                                    <p 
                                                        className="text-2xl font-bold mt-0.5"
                                                        style={{ color: '#145F33' }}
                                                    >
                                                        {otherMilieuMeetingsAttended} / {otherMilieuMeetingsExpected}
                                                    </p>
                                                    <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                        Attended / Expected
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2b. Milieu Meetings Commentary */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-2"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Milieu Meetings Commentary
                                        </h3>

                                        {/* Instructions */}
                                        

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={milieuMeetingsNarrative || (milieuMeetingsData.filter(m => m.connectionType === 'Milieu Meeting').length === 0 ? "No Milieu Meeting records exist for the current ITP period." : "")}
                                            onChange={(e) => setMilieuMeetingsNarrative(e.target.value)}
                                            disabled={sectionStatus['milieu-engagement'] === 'Complete'}
                                            placeholder="Enter milieu meetings commentary..."
                                            rows={6}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['milieu-engagement'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* 3. Community Service Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Community Service
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
                                                            End Date
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Duration (Hours)
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Summary
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Location
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Attended
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {communityServiceData.length > 0 ? (
                                                        communityServiceData.map((service, index) => (
                                                            <tr 
                                                                key={service.id}
                                                                style={{ borderBottom: index < communityServiceData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(service.startDate)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(service.endDate)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {service.durationHours}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {service.summary}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {service.location}
                                                                </td>
                                                                <td className="text-sm px-4 py-3">
                                                                    <Badge 
                                                                        className="text-xs px-2 py-0.5"
                                                                        style={{
                                                                            backgroundColor: service.attended === 'Yes' ? '#DCFCE7' : '#FEE2E2',
                                                                            color: service.attended === 'Yes' ? '#16A34A' : '#DC2626',
                                                                            border: `1px solid ${service.attended === 'Yes' ? '#BBF7D0' : '#FECACA'}`
                                                                        }}
                                                                    >
                                                                        {service.attended}
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
                                                                No Community Service records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Community Service records are view-only within the ITP. To add, edit, or delete records, please manage them through the youth's profile.
                                        </p>
                                    </div>

                                    {/* 3a. Community Service Calculated Metrics */}
                                    <div 
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        {/* Total Hours */}
                                        <div 
                                            className="p-4 rounded-lg"
                                            style={{ 
                                                backgroundColor: 'white',
                                                border: '1px solid #E5E7EB'
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="p-2 rounded-full"
                                                    style={{ 
                                                        backgroundColor: '#E8F5EC' 
                                                    }}
                                                >
                                                    <Clock 
                                                        className="h-5 w-5" 
                                                        style={{ color: '#145F33' }} 
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p 
                                                        className="text-xs font-semibold uppercase tracking-wide"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Total Community Service Hours
                                                    </p>
                                                    <p 
                                                        className="text-2xl font-bold mt-0.5"
                                                        style={{ color: '#145F33' }}
                                                    >
                                                        {totalCommunityServiceHours}
                                                    </p>
                                                    <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                        Hours completed this quarter
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Activities Attended */}
                                        <div 
                                            className="p-4 rounded-lg"
                                            style={{ 
                                                backgroundColor: 'white',
                                                border: '1px solid #E5E7EB'
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="p-2 rounded-full"
                                                    style={{ 
                                                        backgroundColor: '#E8F5EC' 
                                                    }}
                                                >
                                                    <Heart 
                                                        className="h-5 w-5" 
                                                        style={{ color: '#145F33' }} 
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p 
                                                        className="text-xs font-semibold uppercase tracking-wide"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Activities Attended
                                                    </p>
                                                    <p 
                                                        className="text-2xl font-bold mt-0.5"
                                                        style={{ color: '#145F33' }}
                                                    >
                                                        {communityServiceActivitiesAttended}
                                                    </p>
                                                    <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                        Service activities this quarter
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4. Observational Milieu Commentary - Hygiene/Cleanliness */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-2"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Hygiene / Cleanliness
                                        </h3>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={hygieneCleanlinessNarrative}
                                            onChange={(e) => setHygieneCleanlinessNarrative(e.target.value)}
                                            disabled={sectionStatus['milieu-engagement'] === 'Complete'}
                                            placeholder="Enter observations about hygiene and cleanliness..."
                                            rows={4}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['milieu-engagement'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                        
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: This is a manual entry field. No Generate Summary functionality is available.
                                        </p>
                                    </div>

                                    {/* 5. Observational Milieu Commentary - Daily Routines */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-2"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Daily Routines
                                        </h3>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={dailyRoutinesNarrative}
                                            onChange={(e) => setDailyRoutinesNarrative(e.target.value)}
                                            disabled={sectionStatus['milieu-engagement'] === 'Complete'}
                                            placeholder="Enter observations about daily routines..."
                                            rows={4}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['milieu-engagement'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                        
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: This is a manual entry field. No Generate Summary functionality is available.
                                        </p>
                                    </div>

                                    {/* 6. Observational Milieu Commentary - Relationships with Peers */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-2"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Relationships with Peers
                                        </h3>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={relationshipsWithPeersNarrative}
                                            onChange={(e) => setRelationshipsWithPeersNarrative(e.target.value)}
                                            disabled={sectionStatus['milieu-engagement'] === 'Complete'}
                                            placeholder="Enter observations about relationships with peers..."
                                            rows={4}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['milieu-engagement'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                        
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: This is a manual entry field. No Generate Summary functionality is available.
                                        </p>
                                    </div>

                                    {/* 7. Observational Milieu Commentary - Relationships with Staff */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-2"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Relationships with Staff
                                        </h3>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={relationshipsWithStaffNarrative}
                                            onChange={(e) => setRelationshipsWithStaffNarrative(e.target.value)}
                                            disabled={sectionStatus['milieu-engagement'] === 'Complete'}
                                            placeholder="Enter observations about relationships with staff..."
                                            rows={4}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['milieu-engagement'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                        
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: This is a manual entry field. No Generate Summary functionality is available.
                                        </p>
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['milieu-engagement'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('milieu-engagement')}
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
                                                        setMilieuSupplementalPlansNarrative("");
                                                        setMilieuMeetingsNarrative("");
                                                        setHygieneCleanlinessNarrative("");
                                                        setDailyRoutinesNarrative("");
                                                        setRelationshipsWithPeersNarrative("");
                                                        setRelationshipsWithStaffNarrative("");
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
                                                    onClick={() => handleSaveSection('milieu-engagement')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('milieu-engagement')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Activities Section */}
                            {activeSection === 'activities' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('activities')}
                                    
                                    {/* 1. Activity Participation Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Activity Participation
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
                                                            Activity
                                                        </th>
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
                                                            Registered
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Attended
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Summary
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {activityParticipationData.length > 0 ? (
                                                        activityParticipationData.map((activity, index) => (
                                                            <tr 
                                                                key={activity.id}
                                                                style={{ borderBottom: index < activityParticipationData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {activity.activity}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(activity.date)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3">
                                                                    <Badge 
                                                                        className="text-xs px-2 py-0.5"
                                                                        style={{
                                                                            backgroundColor: activity.registered === 'Yes' ? '#DCFCE7' : '#FEE2E2',
                                                                            color: activity.registered === 'Yes' ? '#16A34A' : '#DC2626',
                                                                            border: `1px solid ${activity.registered === 'Yes' ? '#BBF7D0' : '#FECACA'}`
                                                                        }}
                                                                    >
                                                                        {activity.registered}
                                                                    </Badge>
                                                                </td>
                                                                <td className="text-sm px-4 py-3">
                                                                    <Badge 
                                                                        className="text-xs px-2 py-0.5"
                                                                        style={{
                                                                            backgroundColor: activity.attended === 'Yes' ? '#DCFCE7' : '#FEE2E2',
                                                                            color: activity.attended === 'Yes' ? '#16A34A' : '#DC2626',
                                                                            border: `1px solid ${activity.attended === 'Yes' ? '#BBF7D0' : '#FECACA'}`
                                                                        }}
                                                                    >
                                                                        {activity.attended}
                                                                    </Badge>
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {activity.summary || '—'}
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
                                                                No Activity records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Activity records are view-only within the ITP. To add, edit, or delete activity records, please manage them through the youth's Connection records.
                                        </p>
                                    </div>

                                    {/* 2. Calculated Participation Metrics */}
                                    <div 
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        {/* Number of Activities Registered For */}
                                        <div 
                                            className="p-4 rounded-lg"
                                            style={{ 
                                                backgroundColor: 'white',
                                                border: '1px solid #E5E7EB'
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="p-2 rounded-full"
                                                    style={{ 
                                                        backgroundColor: '#E8F5EC' 
                                                    }}
                                                >
                                                    <Smile 
                                                        className="h-5 w-5" 
                                                        style={{ color: '#145F33' }} 
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p 
                                                        className="text-xs font-semibold uppercase tracking-wide"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Activities Registered For
                                                    </p>
                                                    <p 
                                                        className="text-2xl font-bold mt-0.5"
                                                        style={{ color: '#145F33' }}
                                                    >
                                                        {activitiesRegisteredFor}
                                                    </p>
                                                    <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                        Activities this quarter
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Number of Activities Attended */}
                                        <div 
                                            className="p-4 rounded-lg"
                                            style={{ 
                                                backgroundColor: 'white',
                                                border: '1px solid #E5E7EB'
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="p-2 rounded-full"
                                                    style={{ 
                                                        backgroundColor: '#E8F5EC' 
                                                    }}
                                                >
                                                    <CheckCircle2 
                                                        className="h-5 w-5" 
                                                        style={{ color: '#145F33' }} 
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p 
                                                        className="text-xs font-semibold uppercase tracking-wide"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Activities Attended
                                                    </p>
                                                    <p 
                                                        className="text-2xl font-bold mt-0.5"
                                                        style={{ color: '#145F33' }}
                                                    >
                                                        {activitiesAttended}
                                                    </p>
                                                    <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                        Activities completed this quarter
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Activities Narrative Commentary */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-2"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Activities Summary
                                        </h3>

                                        {/* Instructions (Verbatim as per requirements) */}
                                        

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={activitiesNarrative || (activityParticipationData.length === 0 ? "No Agency Activities occurred for this youth during the current ITP period." : "")}
                                            onChange={(e) => setActivitiesNarrative(e.target.value)}
                                            disabled={sectionStatus['activities'] === 'Complete'}
                                            placeholder="Enter activities summary narrative..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['activities'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                        
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: AI summary generation is not available for this section. Please enter narrative commentary manually.
                                        </p>
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['activities'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('activities')}
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
                                                        setActivitiesNarrative("");
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
                                                    onClick={() => handleSaveSection('activities')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('activities')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Advocate Notes Section */}
                            {activeSection === 'advocate-notes' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('advocate-notes')}
                                    
                                    {/* 1. Advocate Meetings Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Advocate Meetings
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
                                                            Attended
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Themes Addressed
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Other Topics Covered
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Treatment Targets Addressed
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {advocateMeetingsData.length > 0 ? (
                                                        advocateMeetingsData.map((meeting, index) => (
                                                            <tr 
                                                                key={meeting.id}
                                                                style={{ borderBottom: index < advocateMeetingsData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(meeting.date)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3">
                                                                    <Badge 
                                                                        className="text-xs px-2 py-0.5"
                                                                        style={{
                                                                            backgroundColor: meeting.attended === 'Yes' ? '#DCFCE7' : '#FEE2E2',
                                                                            color: meeting.attended === 'Yes' ? '#16A34A' : '#DC2626',
                                                                            border: `1px solid ${meeting.attended === 'Yes' ? '#BBF7D0' : '#FECACA'}`
                                                                        }}
                                                                    >
                                                                        {meeting.attended}
                                                                    </Badge>
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {meeting.themesAddressed || '—'}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {meeting.otherTopicsCovered || '—'}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {meeting.treatmentTargetsAddressed || '—'}
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
                                                                No Advocate Meeting records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Advocate Meeting records are view-only within the ITP. To add, edit, or delete Advocate Meetings, please manage them through the youth's Connection records.
                                        </p>
                                    </div>

                                    {/* 2. Advocate Meetings Metrics - 3 Separate Cards */}
                                    <div>
                                        <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            Advocate Meetings
                                        </h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            {/* Planned Card */}
                                            <div
                                                className="p-4 rounded-lg"
                                                style={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="p-2 rounded-full"
                                                        style={{
                                                            backgroundColor: '#E8F5EC'
                                                        }}
                                                    >
                                                        <Calendar
                                                            className="h-5 w-5"
                                                            style={{ color: '#145F33' }}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p
                                                            className="text-xs font-semibold uppercase tracking-wide"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Expected
                                                        </p>
                                                        <p
                                                            className="text-2xl font-bold mt-0.5"
                                                            style={{ color: '#145F33' }}
                                                        >
                                                            {advocateMeetingsPlanned}
                                                        </p>
                                                        <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                            {itpWeeks} weeks × 1/week
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Scheduled Card */}
                                            <div
                                                className="p-4 rounded-lg"
                                                style={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="p-2 rounded-full"
                                                        style={{
                                                            backgroundColor: '#E8F5EC'
                                                        }}
                                                    >
                                                        <Clock
                                                            className="h-5 w-5"
                                                            style={{ color: '#145F33' }}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p
                                                            className="text-xs font-semibold uppercase tracking-wide"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Scheduled
                                                        </p>
                                                        <p
                                                            className="text-2xl font-bold mt-0.5"
                                                            style={{ color: '#145F33' }}
                                                        >
                                                            {advocateMeetingsScheduled}
                                                        </p>
                                                        <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                            Meetings scheduled
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Attended Card */}
                                            <div
                                                className="p-4 rounded-lg"
                                                style={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="p-2 rounded-full"
                                                        style={{
                                                            backgroundColor: '#E8F5EC'
                                                        }}
                                                    >
                                                        <CheckCircle2
                                                            className="h-5 w-5"
                                                            style={{ color: '#145F33' }}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p
                                                            className="text-xs font-semibold uppercase tracking-wide"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Attended
                                                        </p>
                                                        <p
                                                            className="text-2xl font-bold mt-0.5"
                                                            style={{ color: '#145F33' }}
                                                        >
                                                            {advocateMeetingsAttended}
                                                        </p>
                                                        <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                            Meetings attended
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Advocate Notes Narrative Commentary */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Advocate Notes
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    if (advocateMeetingsData.length === 0) {
                                                        toast.info("No Advocate Meeting records to import");
                                                        return;
                                                    }
                                                    toast.info("Generate Summary would import Advocate Meeting data and themes");
                                                    // Simulate AI generation with meeting data
                                                    const generatedText = advocateMeetingsData
                                                        .filter(m => m.attended === 'Yes')
                                                        .map(meeting => 
                                                            `**${formatDate(meeting.date)}**\n\nThemes Addressed: ${meeting.themesAddressed}\n\nOther Topics: ${meeting.otherTopicsCovered}\n\nTreatment Targets: ${meeting.treatmentTargetsAddressed}`
                                                        ).join('\n\n');
                                                    setAdvocateNotesNarrative(generatedText);
                                                }}
                                                disabled={sectionStatus['advocate-notes'] === 'Complete'}
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

                                        {/* Instructions (Verbatim as per requirements) */}
                                        

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={advocateNotesNarrative || (advocateMeetingsData.length === 0 ? "No Advocate Meetings occurred for this youth during the current ITP period." : "")}
                                            onChange={(e) => setAdvocateNotesNarrative(e.target.value)}
                                            disabled={sectionStatus['advocate-notes'] === 'Complete'}
                                            placeholder="Enter advocate notes narrative..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['advocate-notes'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['advocate-notes'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('advocate-notes')}
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
                                                        setAdvocateNotesNarrative("");
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
                                                    onClick={() => handleSaveSection('advocate-notes')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('advocate-notes')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Family Section */}
                            {activeSection === 'family' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('family')}
                                    
                                    {/* 1. Parent/Family Contacts Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Parent/Family Contacts
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
                                                            Attendees
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Themes Addressed
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Treatment Targets Addressed
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {parentFamilyContactsData.length > 0 ? (
                                                        parentFamilyContactsData.map((contact, index) => (
                                                            <tr 
                                                                key={contact.id}
                                                                style={{ borderBottom: index < parentFamilyContactsData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(contact.date)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {contact.attendees}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {contact.themesAddressed}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {contact.treatmentTargetsAddressed}
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
                                                                No Parent/Family Contact records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Parent/Family Contact records are view-only within the ITP. To add, edit, or delete contacts, please manage them through the youth's Connection records.
                                        </p>
                                    </div>

                                    {/* 1a. Calculated Parent/Family Contacts Metrics */}
                                    <div 
                                        className="grid grid-cols-3 gap-4"
                                    >
                                        {/* Number of Parent/Family Contacts Expected */}
                                        <div 
                                            className="p-4 rounded-lg"
                                            style={{ 
                                                backgroundColor: 'white',
                                                border: '1px solid #E5E7EB'
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="p-2 rounded-full"
                                                    style={{ 
                                                        backgroundColor: '#E8F5EC' 
                                                    }}
                                                >
                                                    <Users2 
                                                        className="h-5 w-5" 
                                                        style={{ color: '#145F33' }} 
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p 
                                                        className="text-xs font-semibold uppercase tracking-wide"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Contacts Expected
                                                    </p>
                                                    <p 
                                                        className="text-2xl font-bold mt-0.5"
                                                        style={{ color: '#145F33' }}
                                                    >
                                                        {parentFamilyContactsExpected}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Number of Parent/Family Contacts Attended */}
                                        <div 
                                            className="p-4 rounded-lg"
                                            style={{ 
                                                backgroundColor: 'white',
                                                border: '1px solid #E5E7EB'
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="p-2 rounded-full"
                                                    style={{ 
                                                        backgroundColor: '#E8F5EC' 
                                                    }}
                                                >
                                                    <CheckCircle2 
                                                        className="h-5 w-5" 
                                                        style={{ color: '#145F33' }} 
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p 
                                                        className="text-xs font-semibold uppercase tracking-wide"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Contacts Attended
                                                    </p>
                                                    <p 
                                                        className="text-2xl font-bold mt-0.5"
                                                        style={{ color: '#145F33' }}
                                                    >
                                                        {parentFamilyContactsAttended}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Number of Home Visits */}
                                        <div 
                                            className="p-4 rounded-lg"
                                            style={{ 
                                                backgroundColor: 'white',
                                                border: '1px solid #E5E7EB'
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="p-2 rounded-full"
                                                    style={{ 
                                                        backgroundColor: '#E8F5EC' 
                                                    }}
                                                >
                                                    <Home 
                                                        className="h-5 w-5" 
                                                        style={{ color: '#145F33' }} 
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p 
                                                        className="text-xs font-semibold uppercase tracking-wide"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Home Visits
                                                    </p>
                                                    <p 
                                                        className="text-2xl font-bold mt-0.5"
                                                        style={{ color: '#145F33' }}
                                                    >
                                                        {homeVisitsCount}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Family Visits Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Family Visits
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
                                                            Attendees
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Summary
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {familyVisitsData.length > 0 ? (
                                                        familyVisitsData.map((visit, index) => (
                                                            <tr 
                                                                key={visit.id}
                                                                style={{ borderBottom: index < familyVisitsData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(visit.startDate)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {visit.attendees}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {visit.summary}
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
                                                                No Family Visit records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Family Visit records are view-only within the ITP. To add, edit, or delete family visits, please manage them through the youth's profile.
                                        </p>
                                    </div>

                                    {/* 2a. Calculated Family Visits Metric */}
                                    <div 
                                        className="p-4 rounded-lg"
                                        style={{ 
                                            backgroundColor: 'white',
                                            border: '1px solid #E5E7EB'
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="p-2 rounded-full"
                                                style={{ 
                                                    backgroundColor: '#E8F5EC' 
                                                }}
                                            >
                                                <Heart 
                                                    className="h-5 w-5" 
                                                    style={{ color: '#145F33' }} 
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p 
                                                    className="text-xs font-semibold uppercase tracking-wide"
                                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                >
                                                    Number of Family Visits
                                                </p>
                                                <p 
                                                    className="text-2xl font-bold mt-0.5"
                                                    style={{ color: '#145F33' }}
                                                >
                                                    {numberOfFamilyVisits}
                                                </p>
                                                <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                    Family visits this quarter
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Passes Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Passes
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
                                                            Date Range
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Location
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Summary
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Between
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Cancelled
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {passesData.length > 0 ? (
                                                        passesData.map((pass, index) => (
                                                            <tr 
                                                                key={pass.id}
                                                                style={{ borderBottom: index < passesData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(pass.startDate)} - {formatDate(pass.endDate)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {pass.location}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {pass.summary}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {pass.between}
                                                                </td>
                                                                <td className="text-sm px-4 py-3">
                                                                    <Badge 
                                                                        className="text-xs px-2 py-0.5"
                                                                        style={{
                                                                            backgroundColor: pass.cancelled === 'Yes' ? '#FEE2E2' : '#DCFCE7',
                                                                            color: pass.cancelled === 'Yes' ? '#DC2626' : '#16A34A',
                                                                            border: `1px solid ${pass.cancelled === 'Yes' ? '#FECACA' : '#BBF7D0'}`
                                                                        }}
                                                                    >
                                                                        {pass.cancelled}
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
                                                                No Pass records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Pass records are view-only within the ITP. To add, edit, or delete passes, please manage them through the youth's profile.
                                        </p>
                                    </div>

                                    {/* 3a. Calculated Passes Metrics */}
                                    <div 
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        {/* Number of Passes Planned */}
                                        <div 
                                            className="p-4 rounded-lg"
                                            style={{ 
                                                backgroundColor: 'white',
                                                border: '1px solid #E5E7EB'
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="p-2 rounded-full"
                                                    style={{ 
                                                        backgroundColor: '#E8F5EC' 
                                                    }}
                                                >
                                                    <Calendar 
                                                        className="h-5 w-5" 
                                                        style={{ color: '#145F33' }} 
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p 
                                                        className="text-xs font-semibold uppercase tracking-wide"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Passes Planned
                                                    </p>
                                                    <p 
                                                        className="text-2xl font-bold mt-0.5"
                                                        style={{ color: '#145F33' }}
                                                    >
                                                        {passesPlanned}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Number of Passes Occurred */}
                                        <div 
                                            className="p-4 rounded-lg"
                                            style={{ 
                                                backgroundColor: 'white',
                                                border: '1px solid #E5E7EB'
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="p-2 rounded-full"
                                                    style={{ 
                                                        backgroundColor: '#E8F5EC' 
                                                    }}
                                                >
                                                    <CheckCircle2 
                                                        className="h-5 w-5" 
                                                        style={{ color: '#145F33' }} 
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p 
                                                        className="text-xs font-semibold uppercase tracking-wide"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Passes Occurred
                                                    </p>
                                                    <p 
                                                        className="text-2xl font-bold mt-0.5"
                                                        style={{ color: '#145F33' }}
                                                    >
                                                        {passesOccurred}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4. Mercy Home Family Activities Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Mercy Home Family Activities
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
                                                            Event Type
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Attendees
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {familyActivitiesData.length > 0 ? (
                                                        familyActivitiesData.map((activity, index) => (
                                                            <tr 
                                                                key={activity.id}
                                                                style={{ borderBottom: index < familyActivitiesData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(activity.date)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {activity.eventType}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {activity.attendees}
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
                                                                No Mercy Home Family Activity records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Mercy Home Family Activity records are view-only within the ITP. To add, edit, or delete family activities, please manage them through the youth's Connection records.
                                        </p>
                                    </div>

                                    {/* 5. Family Involvement Commentary */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-2"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Family Involvement
                                        </h3>

                                        {/* Instructions (Verbatim as per requirements) */}
                                        <div 
                                            className="p-3 rounded-lg mb-3"
                                            style={{ 
                                                backgroundColor: '#EFF6FF',
                                                border: '1px solid #BFDBFE'
                                            }}
                                        >
                                            <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>
                                                <strong>Instructions:</strong> Summarize the youth's family's involvement during this treatment quarter, including parent/family contacts, passes, and family activities.
                                                <br /><br />
                                                Focus on any patterns or trends observed in family involvement and how the youth's family involvement is impacting the overall treatment approach.
                                                <br /><br />
                                                Discuss any patterns related to completion of parent/family contacts. Any weeks that a contact did not occur should be briefly accounted for.
                                                <br /><br />
                                                <strong>Note:</strong> For older youth who do not have a legal guardian directly involved, this section can be used to discuss involvement of other members of the youth's system who may be involved in treatment, including non‑custodial family members, mentors, significant others, or other people. Please also note that the make‑up of an older youth's system may be why there are no parent/family contacts or passes listed in this section.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={familyInvolvementNarrative}
                                            onChange={(e) => setFamilyInvolvementNarrative(e.target.value)}
                                            disabled={sectionStatus['family'] === 'Complete'}
                                            placeholder="Enter family involvement commentary..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['family'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                        
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: AI summary generation is not available for this section. Please enter narrative commentary manually.
                                        </p>
                                    </div>

                                    {/* 6. Who Lives in the Family Home? */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-2"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Who Lives in the Family Home?
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
                                                <strong>Instructions:</strong> Briefly describe the family system including who lives in the family home.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={whoLivesInFamilyHomeNarrative}
                                            onChange={(e) => setWhoLivesInFamilyHomeNarrative(e.target.value)}
                                            disabled={sectionStatus['family'] === 'Complete'}
                                            placeholder="Enter information about who lives in the family home..."
                                            rows={4}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['family'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* 7. Have there been any significant changes to the family system? */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-2"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Have there been any significant changes to the family system?
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
                                                <strong>Instructions:</strong> Summarize any significant changes to the family system that were relevant during this treatment quarter.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={familySystemChangesNarrative}
                                            onChange={(e) => setFamilySystemChangesNarrative(e.target.value)}
                                            disabled={sectionStatus['family'] === 'Complete'}
                                            placeholder="Enter information about significant changes to the family system..."
                                            rows={4}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['family'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['family'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('family')}
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
                                                        setFamilyInvolvementNarrative("");
                                                        setWhoLivesInFamilyHomeNarrative("");
                                                        setFamilySystemChangesNarrative("");
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
                                                    onClick={() => handleSaveSection('family')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('family')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Spirituality Section */}

    </>
  );
}