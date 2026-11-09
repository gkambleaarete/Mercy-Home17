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
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { toast } from "sonner@2.0.3";

export function EditITPWorkspaceSectionsC(props: any) {
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
    showLegalInvolvementModal, setShowLegalInvolvementModal,
    selectedLegalRecords, setSelectedLegalRecords,
    selectedTestIds, setSelectedTestIds,
    showSelectTestsModal, setShowSelectTestsModal,
    tempSelectedTestIds, setTempSelectedTestIds,
    medicationRecords, totalMissedDoses,
    incidentsData, numberOfIncidents, numberOfIncidentsWithRestraint, totalNumberOfHolds,
    spiritualDevClassesData,
    spiritualDevConnectionsData,
    individualTherapySessionsData,
    individualTherapySessionsPlanned,
    individualTherapySessionsScheduled,
    individualTherapySessionsAttended,
    familyTherapySessionsData,
    familyTherapySessionsPlanned,
    familyTherapySessionsScheduled,
    familyTherapySessionsAttended,
    substanceUseTestingData,
    substanceUseDisclosuresData,
    substanceUseAssessmentsData,
    substanceUseSupplementalPlansData,
    dcfsInvolvementData,
    legalInvolvementData,
    groupTherapySessionsData,
    groupTherapySessionsPlanned,
    groupTherapySessionsScheduled,
    groupTherapySessionsAttended,
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
    handleOpenSelectTrauma, handleCloseSelectTraumaModal,
    handleToggleTraumaSelection, handleConfirmTraumaSelection,
    handleOpenSelectDomainsModal, handleCloseSelectDomainsModal,
    handleToggleDomainSelection, handleAddDomains, handleDeleteDomain,
    handleOpenSelectTriggersModal, handleCloseSelectTriggersModal, handleDeleteTrigger,
    handleOpenSelectCopingSkillsModal, handleCloseSelectCopingSkillsModal, handleDeleteCopingSkill,
    handleViewSubstanceUseTest,
    handleViewSubstanceUseDisclosure,
    handleViewSubstanceUseAssessment,
    handleViewSubstanceUseSupplementalPlan,
    handleOpenLegalInvolvementModal, handleCloseLegalInvolvementModal,
    handleToggleLegalRecordSelection, handleConfirmLegalInvolvementSummary,
    handleOpenSelectTestsAssessments, handleCloseSelectTestsModal,
    handleToggleTestSelection, handleConfirmTestSelection,
    itpData,
    navigate, id,
  } = props;

  return (
    <>
                            {activeSection === 'spirituality' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('spirituality')}
                                    
                                    {/* 1. Spiritual Development Class Participation Table */}
                                    

                                    {/* 2. Spiritual Development Connections Table */}
                                    

                                    {/* 3. Spirituality Narrative Commentary */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-2"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Spirituality
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
                                                <strong>Instructions:</strong> For all youth, discuss the youth's relevant spiritual and cultural identity, including participation in any spiritual, religious, or faith communities, even if the youth is not formally involved in Spiritual Development programming.
                                                <br /><br />
                                                If applicable, summarize the youth's participation in Spiritual Development programming at Mercy Home. Please do not repeat the specific details of the youth's participation—those are listed above. Focus on any trends or patterns observed and how the youth's participation in Spiritual Development fits in with their overall treatment.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={spiritualityNarrative || (spiritualDevClassesData.length === 0 && spiritualDevConnectionsData.length === 0 ? "No Spiritual Development activities exist for the current ITP period." : "")}
                                            onChange={(e) => setSpiritualityNarrative(e.target.value)}
                                            disabled={sectionStatus['spirituality'] === 'Complete'}
                                            placeholder="Enter spirituality narrative..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['spirituality'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                        
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: AI summary generation is not available for this section. Please enter narrative commentary manually.
                                        </p>
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['spirituality'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('spirituality')}
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
                                                        setSpiritualityNarrative("");
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
                                                    onClick={() => handleSaveSection('spirituality')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('spirituality')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Trauma Section */}
                            {activeSection === 'trauma' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('trauma')}
                                    
                                    {/* 1. Trauma Table */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Trauma Records
                                            </h3>
                                            <button
                                                onClick={handleOpenSelectTrauma}
                                                disabled={sectionStatus['trauma'] === 'Complete'}
                                                className="text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ 
                                                    color: 'var(--color-brand-primary)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                Select Trauma
                                            </button>
                                        </div>

                                        <p className="text-xs mb-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Select trauma records from the youth's profile that are relevant to this ITP period.
                                        </p>
                                        
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
                                                            Subject
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
                                                            Selected By
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {traumaData.length > 0 ? (
                                                        traumaData.map((trauma, index) => (
                                                            <tr 
                                                                key={trauma.id}
                                                                style={{ borderBottom: index < traumaData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {trauma.type}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {trauma.subject}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {trauma.description}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {trauma.selectedBy}
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
                                                                No trauma records have been selected for the current ITP period. Click "Select Trauma" to add records.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Trauma records are view-only within the ITP. To manage trauma records, please use the youth's profile.
                                        </p>
                                    </div>

                                    {/* 2. Trauma Narrative Commentary */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Trauma Narrative Commentary
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    if (traumaData.length === 0) {
                                                        toast.info("No trauma records to import");
                                                        return;
                                                    }
                                                    toast.info("Generate Summary would create draft narrative from selected trauma records");
                                                    // Simulate AI generation with trauma data
                                                    const generatedText = traumaData.map(trauma => 
                                                        `**${trauma.type} - ${trauma.subject}**\n\nDuring this treatment quarter, the youth's history of ${trauma.type.toLowerCase()} continued to impact their treatment progress and daily functioning. The trauma related to ${trauma.subject.toLowerCase()} was particularly relevant in clinical interventions this quarter.`
                                                    ).join('\n\n');
                                                    setTraumaNarrative(generatedText);
                                                }}
                                                disabled={sectionStatus['trauma'] === 'Complete'}
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
                                                <strong>Instructions:</strong> Summarize any elements of this youth's trauma history that were relevant during this treatment quarter, including any new trauma discovered or disclosed during this quarter.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={traumaNarrative}
                                            onChange={(e) => setTraumaNarrative(e.target.value)}
                                            disabled={sectionStatus['trauma'] === 'Complete'}
                                            placeholder="Enter trauma narrative commentary..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['trauma'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['trauma'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('trauma')}
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
                                                        setTraumaNarrative("");
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
                                                    onClick={() => handleSaveSection('trauma')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('trauma')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Therapy Section */}
                            {activeSection === 'therapy' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('therapy')}
                                    
                                    {/* 1. Individual Therapy Sessions Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Individual Therapy Sessions
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
                                                            Attendance
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
                                                    {individualTherapySessionsData.length > 0 ? (
                                                        individualTherapySessionsData.map((session, index) => (
                                                            <tr 
                                                                key={session.id}
                                                                style={{ borderBottom: index < individualTherapySessionsData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td 
                                                                    className="text-sm px-4 py-3 cursor-pointer hover:underline" 
                                                                    style={{ color: 'var(--color-brand-primary)' }}
                                                                    onClick={() => toast.info('Therapy Session Connection Details modal would open here (separate user story)')}
                                                                >
                                                                    {formatDate(session.date)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {session.type}
                                                                </td>
                                                                <td className="text-sm px-4 py-3">
                                                                    <Badge 
                                                                        className="text-xs px-2 py-0.5"
                                                                        style={{
                                                                            backgroundColor: session.attendance === 'Yes' ? '#DCFCE7' : '#FEE2E2',
                                                                            color: session.attendance === 'Yes' ? '#16A34A' : '#DC2626',
                                                                            border: `1px solid ${session.attendance === 'Yes' ? '#BBF7D0' : '#FECACA'}`
                                                                        }}
                                                                    >
                                                                        {session.attendance}
                                                                    </Badge>
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {session.description}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {session.themesAddressed}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {session.treatmentTargetsAddressed}
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
                                                                No Individual Therapy Records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Individual Therapy session records are view-only within the ITP. To add, edit, or delete therapy sessions, please manage them through the youth's Connection records.
                                        </p>
                                    </div>

                                    {/* 2. Individual Therapy Metrics - 3 Separate Cards */}
                                    <div>
                                        <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            Individual Therapy
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
                                                            Planned
                                                        </p>
                                                        <p
                                                            className="text-2xl font-bold mt-0.5"
                                                            style={{ color: '#145F33' }}
                                                        >
                                                            {individualTherapySessionsPlanned}
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
                                                            {individualTherapySessionsScheduled}
                                                        </p>
                                                        <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                            Sessions scheduled
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
                                                            {individualTherapySessionsAttended}
                                                        </p>
                                                        <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                            Sessions attended
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Individual Therapy Commentary */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Individual Therapy
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    if (individualTherapySessionsData.length === 0) {
                                                        toast.info("No Individual Therapy session records to import");
                                                        return;
                                                    }
                                                    toast.info("Generate Summary would import Individual Therapy session details and themes");
                                                    // Simulate AI generation with session data
                                                    const generatedText = individualTherapySessionsData
                                                        .filter(s => s.attendance === 'Yes')
                                                        .map(session => 
                                                            `The youth engaged in individual therapy on ${formatDate(session.date)}, focusing on ${session.themesAddressed}. ${session.description}`
                                                        ).join('\n\n');
                                                    setIndividualTherapyNarrative(generatedText);
                                                }}
                                                disabled={sectionStatus['therapy'] === 'Complete'}
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
                                                <strong>Instructions:</strong> There should be a session planned for every week of the quarter.
                                                <br />
                                                Comment on any patterns related to the youth's attendance.
                                                <br />
                                                Briefly account for any weeks that an individual therapy session did not occur.
                                                <br /><br />
                                                Discuss the youth's overall engagement in Individual Therapy during this treatment quarter, including the effectiveness of the youth's relationship with the therapist, themes addressed, any specific modalities used, and plans for individual therapy moving forward.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={individualTherapyNarrative || (individualTherapySessionsData.length === 0 ? "No Individual Therapy Records exist for the current ITP period." : "")}
                                            onChange={(e) => setIndividualTherapyNarrative(e.target.value)}
                                            disabled={sectionStatus['therapy'] === 'Complete'}
                                            placeholder="Enter individual therapy narrative..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['therapy'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* 4. Family Therapy Sessions Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Family Therapy Sessions
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
                                                            Attendance
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
                                                    {familyTherapySessionsData.length > 0 ? (
                                                        familyTherapySessionsData.map((session, index) => (
                                                            <tr 
                                                                key={session.id}
                                                                style={{ borderBottom: index < familyTherapySessionsData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td 
                                                                    className="text-sm px-4 py-3 cursor-pointer hover:underline" 
                                                                    style={{ color: 'var(--color-brand-primary)' }}
                                                                    onClick={() => toast.info('Therapy Session Connection Details modal would open here (separate user story)')}
                                                                >
                                                                    {formatDate(session.date)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {session.type}
                                                                </td>
                                                                <td className="text-sm px-4 py-3">
                                                                    <Badge 
                                                                        className="text-xs px-2 py-0.5"
                                                                        style={{
                                                                            backgroundColor: session.attendance === 'Yes' ? '#DCFCE7' : '#FEE2E2',
                                                                            color: session.attendance === 'Yes' ? '#16A34A' : '#DC2626',
                                                                            border: `1px solid ${session.attendance === 'Yes' ? '#BBF7D0' : '#FECACA'}`
                                                                        }}
                                                                    >
                                                                        {session.attendance}
                                                                    </Badge>
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {session.description}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {session.themesAddressed}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {session.treatmentTargetsAddressed}
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
                                                                No Family Therapy Records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Family Therapy session records are view-only within the ITP. To add, edit, or delete therapy sessions, please manage them through the youth's Connection records.
                                        </p>
                                    </div>

                                    {/* 5. Family Therapy Metrics - 3 Separate Cards */}
                                    <div>
                                        <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            Family Therapy
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
                                                            {familyTherapySessionsPlanned}
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
                                                            {familyTherapySessionsScheduled}
                                                        </p>
                                                        <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                            Sessions scheduled
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
                                                            {familyTherapySessionsAttended}
                                                        </p>
                                                        <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                            Sessions attended
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 6. Family Therapy Commentary */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Family Therapy
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    if (familyTherapySessionsData.length === 0) {
                                                        toast.info("No Family Therapy session records to import");
                                                        return;
                                                    }
                                                    toast.info("Generate Summary would import Family Therapy session details and themes");
                                                    // Simulate AI generation with session data
                                                    const generatedText = familyTherapySessionsData
                                                        .filter(s => s.attendance === 'Yes')
                                                        .map(session => 
                                                            `The youth and family participated in family therapy on ${formatDate(session.date)}, focusing on ${session.themesAddressed}. ${session.description}`
                                                        ).join('\n\n');
                                                    setFamilyTherapyNarrative(generatedText);
                                                }}
                                                disabled={sectionStatus['therapy'] === 'Complete'}
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
                                                <strong>Instructions:</strong> Comment on any patterns related to the family's attendance, especially in cases where several or more family therapy sessions did not take place.
                                                <br /><br />
                                                Discuss the youth and their family's overall engagement in Family Therapy during this treatment quarter, including the effectiveness of the family's relationship with the therapist, themes addressed, any specific modalities used, and plans for family therapy moving forward.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={familyTherapyNarrative || (familyTherapySessionsData.length === 0 ? "No Family Therapy Records exist for the current ITP period." : "")}
                                            onChange={(e) => setFamilyTherapyNarrative(e.target.value)}
                                            disabled={sectionStatus['therapy'] === 'Complete'}
                                            placeholder="Enter family therapy narrative..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['therapy'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* 7. Group Therapy Sessions Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Group Therapy Sessions
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
                                                            Attendance
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
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {groupTherapySessionsData.length > 0 ? (
                                                        groupTherapySessionsData.map((session, index) => (
                                                            <tr 
                                                                key={session.id}
                                                                style={{ borderBottom: index < groupTherapySessionsData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td 
                                                                    className="text-sm px-4 py-3 cursor-pointer hover:underline" 
                                                                    style={{ color: 'var(--color-brand-primary)' }}
                                                                    onClick={() => toast.info('Therapy Session Connection Details modal would open here (separate user story)')}
                                                                >
                                                                    {formatDate(session.date)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {session.type}
                                                                </td>
                                                                <td className="text-sm px-4 py-3">
                                                                    <Badge 
                                                                        className="text-xs px-2 py-0.5"
                                                                        style={{
                                                                            backgroundColor: session.attendance === 'Yes' ? '#DCFCE7' : '#FEE2E2',
                                                                            color: session.attendance === 'Yes' ? '#16A34A' : '#DC2626',
                                                                            border: `1px solid ${session.attendance === 'Yes' ? '#BBF7D0' : '#FECACA'}`
                                                                        }}
                                                                    >
                                                                        {session.attendance}
                                                                    </Badge>
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {session.themesAddressed}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {session.participantNote}
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
                                                                No Group Therapy Records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Group Therapy session records are view-only within the ITP. To add, edit, or delete therapy sessions, please manage them through the youth's Connection records.
                                        </p>
                                    </div>

                                    {/* 8. Group Therapy Metrics - 3 Separate Cards */}
                                    <div>
                                        <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            Group Therapy
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
                                                            {groupTherapySessionsPlanned}
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
                                                            {groupTherapySessionsScheduled}
                                                        </p>
                                                        <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                            Sessions scheduled
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
                                                            {groupTherapySessionsAttended}
                                                        </p>
                                                        <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                            Sessions attended
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 9. Group Therapy Commentary */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Group Therapy
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    if (groupTherapySessionsData.length === 0) {
                                                        toast.info("No Group Therapy session records to import");
                                                        return;
                                                    }
                                                    toast.info("Generate Summary would import Group Therapy session details and themes");
                                                    // Simulate AI generation with session data
                                                    const generatedText = groupTherapySessionsData
                                                        .filter(s => s.attendance === 'Yes')
                                                        .map(session => 
                                                            `The youth participated in group therapy on ${formatDate(session.date)}, focusing on ${session.themesAddressed}. ${session.participantNote}`
                                                        ).join('\n\n');
                                                    setGroupTherapyNarrative(generatedText);
                                                }}
                                                disabled={sectionStatus['therapy'] === 'Complete'}
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
                                                <strong>Instructions:</strong> Comment on any patterns related to the youth's attendance.
                                                <br />
                                                Briefly account for any weeks that a group therapy session did not occur.
                                                <br /><br />
                                                Discuss the youth's overall engagement in Group Therapy during this treatment quarter, including the effectiveness of the youth's relationship with the therapist, themes addressed, any specific modalities used, and plans for group therapy moving forward.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={groupTherapyNarrative || (groupTherapySessionsData.length === 0 ? "No Group Therapy Records exist for the current ITP period." : "")}
                                            onChange={(e) => setGroupTherapyNarrative(e.target.value)}
                                            disabled={sectionStatus['therapy'] === 'Complete'}
                                            placeholder="Enter group therapy narrative..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['therapy'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['therapy'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('therapy')}
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
                                                        setIndividualTherapyNarrative("");
                                                        setFamilyTherapyNarrative("");
                                                        setGroupTherapyNarrative("");
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
                                                    onClick={() => handleSaveSection('therapy')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('therapy')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Substance Use Section */}
                            {activeSection === 'substance-use' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('substance-use')}
                                    
                                    {/* 1. Substance Use Testing Table */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Substance Use Testing
                                            </h3>
                                        </div>

                                        <div
                                            className="rounded-lg overflow-hidden"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                            }}
                                        >
                                            <Table>
                                                <TableHeader>
                                                    <TableRow hoverable={false}>
                                                        <TableHead>Date & Time</TableHead>
                                                        <TableHead>Reason</TableHead>
                                                        <TableHead>Results</TableHead>
                                                        <TableHead>New Use</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {substanceUseTestingData.length > 0 ? (
                                                        substanceUseTestingData.map((test) => (
                                                            <TableRow key={test.id}>
                                                                <TableCell>
                                                                    <button
                                                                        type="button"
                                                                        className="hover:underline text-left"
                                                                        style={{ color: 'var(--color-brand-primary)' }}
                                                                        onClick={() => handleViewSubstanceUseTest(test)}
                                                                    >
                                                                        {test.dateTime}
                                                                    </button>
                                                                </TableCell>
                                                                <TableCell style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {test.reason}
                                                                </TableCell>
                                                                <TableCell style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {test.results}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant={test.newUse === 'Yes' ? 'error' : 'success'}>
                                                                        {test.newUse}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow hoverable={false}>
                                                            <TableCell colSpan={4} tone="muted" className="text-center py-8 italic">
                                                                No Substance Use Testing records exist for the current ITP period.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Substance Use Testing records are view-only within the ITP. To add, edit, or delete testing records, please manage them through the youth's records.
                                        </p>
                                    </div>

                                    {/* 2. Disclosures Table */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Disclosures
                                            </h3>
                                        </div>

                                        <div
                                            className="rounded-lg overflow-hidden"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                            }}
                                        >
                                            <Table>
                                                <TableHeader>
                                                    <TableRow hoverable={false}>
                                                        <TableHead>Date & Time</TableHead>
                                                        <TableHead>Substance(s)</TableHead>
                                                        <TableHead style={{ width: '30%' }}>Comments</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {substanceUseDisclosuresData.length > 0 ? (
                                                        substanceUseDisclosuresData.map((disclosure) => (
                                                            <TableRow key={disclosure.id}>
                                                                <TableCell>
                                                                    <button
                                                                        type="button"
                                                                        className="hover:underline text-left"
                                                                        style={{ color: 'var(--color-brand-primary)' }}
                                                                        onClick={() => handleViewSubstanceUseDisclosure(disclosure)}
                                                                    >
                                                                        {disclosure.dateTime}
                                                                    </button>
                                                                </TableCell>
                                                                <TableCell style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {disclosure.substances}
                                                                </TableCell>
                                                                <TableCell style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {disclosure.comments}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow hoverable={false}>
                                                            <TableCell colSpan={3} tone="muted" className="text-center py-8 italic">
                                                                No Disclosure records exist for the current ITP period.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Disclosure records are view-only within the ITP. To add, edit, or delete disclosures, please manage them through the youth's records.
                                        </p>
                                    </div>

                                    {/* Note: Per User Story 18472, the Plan of Action section described in
                                        AC26-34 has been removed at the customer's explicit request (see the
                                        ticket's Plan of Action functional description); it is intentionally
                                        not rendered here. */}

                                    {/* 3. Substance Use Assessments Table */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Substance Use Assessments
                                            </h3>
                                        </div>

                                        <div
                                            className="rounded-lg overflow-hidden"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                            }}
                                        >
                                            <Table>
                                                <TableHeader>
                                                    <TableRow hoverable={false}>
                                                        <TableHead>Date</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Reason for Request</TableHead>
                                                        <TableHead style={{ width: '30%' }}>Results</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {substanceUseAssessmentsData.length > 0 ? (
                                                        substanceUseAssessmentsData.map((assessment) => (
                                                            <TableRow key={assessment.id}>
                                                                <TableCell>
                                                                    <button
                                                                        type="button"
                                                                        className="hover:underline text-left"
                                                                        style={{ color: 'var(--color-brand-primary)' }}
                                                                        onClick={() => handleViewSubstanceUseAssessment(assessment)}
                                                                    >
                                                                        {formatDate(assessment.endDate)}
                                                                    </button>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant={assessment.status === 'Completed' ? 'success' : 'warning'}>
                                                                        {assessment.status}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell style={{ color: 'var(--slds-g-color-text-default)', width: '30%' }}>
                                                                    {assessment.reasonForRequest}
                                                                </TableCell>
                                                                <TableCell style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {assessment.results}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow hoverable={false}>
                                                            <TableCell colSpan={4} tone="muted" className="text-center py-8 italic">
                                                                No Substance Use Assessment records exist for the current ITP period.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Assessment records are view-only within the ITP. To add, edit, or delete assessments, please manage them through the youth's records.
                                        </p>
                                    </div>

                                    {/* 4. Supplemental Plans Table */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Supplemental Plans
                                            </h3>
                                        </div>

                                        <div
                                            className="rounded-lg overflow-hidden"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                            }}
                                        >
                                            <Table>
                                                <TableHeader>
                                                    <TableRow hoverable={false}>
                                                        <TableHead>Start Date</TableHead>
                                                        <TableHead>Type</TableHead>
                                                        <TableHead>Plan Description</TableHead>
                                                        <TableHead>End Date</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {substanceUseSupplementalPlansData.length > 0 ? (
                                                        substanceUseSupplementalPlansData.map((plan) => (
                                                            <TableRow key={plan.id}>
                                                                <TableCell>
                                                                    <button
                                                                        type="button"
                                                                        className="hover:underline text-left"
                                                                        style={{ color: 'var(--color-brand-primary)' }}
                                                                        onClick={() => handleViewSubstanceUseSupplementalPlan(plan)}
                                                                    >
                                                                        {formatDate(plan.startDate)}
                                                                    </button>
                                                                </TableCell>
                                                                <TableCell style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {plan.type}
                                                                </TableCell>
                                                                <TableCell style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {plan.planDescription}
                                                                </TableCell>
                                                                <TableCell style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {plan.endDate}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow hoverable={false}>
                                                            <TableCell colSpan={4} tone="muted" className="text-center py-8 italic">
                                                                No Supplemental Plan records exist for the current ITP period.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Supplemental Plan records are view-only within the ITP. To add, edit, or delete supplemental plans, please manage them through the youth's records.
                                        </p>
                                    </div>

                                    {/* 5. Substance Use Narrative Commentary */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Substance Use
                                            </h3>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const hasAnyData = substanceUseTestingData.length > 0 ||
                                                                      substanceUseDisclosuresData.length > 0 ||
                                                                      substanceUseAssessmentsData.length > 0 ||
                                                                      substanceUseSupplementalPlansData.length > 0;

                                                    if (!hasAnyData) {
                                                        toast.info("No Substance Use records to import");
                                                        return;
                                                    }

                                                    toast.info("Generate Summary would import Progress Tracking entries for Relapse Prevention Plans");

                                                    // Simulate AI generation with substance use data (reasons, descriptions,
                                                    // results, and status from Testing, Assessments, and Supplemental Plans)
                                                    const generatedSections: string[] = [];

                                                    if (substanceUseSupplementalPlansData.length > 0) {
                                                        generatedSections.push(substanceUseSupplementalPlansData.map(plan =>
                                                            `During this treatment quarter, the youth was actively engaged with a ${plan.type}. ${plan.planDescription} Progress tracking indicates the youth is making steady progress in applying learned strategies and building awareness of personal triggers.`
                                                        ).join('\n\n'));
                                                    }

                                                    if (substanceUseTestingData.length > 0) {
                                                        const positiveTests = substanceUseTestingData.filter(t => t.results.includes('Positive'));
                                                        if (positiveTests.length > 0) {
                                                            generatedSections.push(`The youth had ${positiveTests.length} positive substance use test(s) during this quarter. These instances were addressed through individual counseling and increased monitoring.`);
                                                        }
                                                    }

                                                    if (substanceUseAssessmentsData.length > 0) {
                                                        generatedSections.push(substanceUseAssessmentsData.map(assessment =>
                                                            `A substance use assessment (${assessment.status}) was requested due to: ${assessment.reasonForRequest || 'ongoing monitoring'}.${assessment.results && assessment.results !== '—' ? ` Results: ${assessment.results}` : ''}`
                                                        ).join('\n\n'));
                                                    }

                                                    const generatedText = generatedSections.join('\n\n');
                                                    setSubstanceUseNarrative(generatedText || "Substance use treatment continues to be integrated into the youth's overall treatment plan with ongoing monitoring and support.");
                                                }}
                                                disabled={sectionStatus['substance-use'] === 'Complete'}
                                            >
                                                <Sparkles className="h-3.5 w-3.5" />
                                                Generate Summary
                                            </Button>
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
                                                <strong>Instructions:</strong> If applicable, summarize the youth's relevant substance use during this treatment quarter.
                                                <br />
                                                Please do not repeat the specific details of tests or disclosures—those details are listed above.
                                                <br />
                                                Discuss how substance use treatment fits into the youth's overall treatment plan.
                                                <br />
                                                Note any trends or patterns that have been observed in the youth's substance use and how the youth is responding to substance use interventions.
                                                <br /><br />
                                                Use the Generate Summary link to import any Progress Tracking entries associated with a Relapse Prevention Plan.
                                                <br /><br />
                                                If substance use is not a relevant part of this youth's treatment, leave this text box as-is.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={substanceUseNarrative || (() => {
                                                const hasAnyData = substanceUseTestingData.length > 0 ||
                                                                  substanceUseDisclosuresData.length > 0 ||
                                                                  substanceUseAssessmentsData.length > 0 ||
                                                                  substanceUseSupplementalPlansData.length > 0;
                                                return hasAnyData ? "" : "No Substance Use records exist for the current ITP period.";
                                            })()}
                                            onChange={(e) => setSubstanceUseNarrative(e.target.value)}
                                            disabled={sectionStatus['substance-use'] === 'Complete'}
                                            placeholder="Enter substance use narrative..."
                                            aria-label="Substance Use Narrative Commentary"
                                            rows={8}
                                            size="sm"
                                            className="resize-y"
                                        />
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['substance-use'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleReopenSection('substance-use')}
                                            >
                                                Re-Open Section
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSubstanceUseNarrative("");
                                                        toast.info("Changes discarded");
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleSaveSection('substance-use')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleCompleteSection('substance-use')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Incidents Section */}
                            {activeSection === 'incidents' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('incidents')}
                                    
                                    {/* 1. Incidents Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Incidents
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
                                                            Start Date & Time
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            End Date & Time
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Incident Type
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Overview
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Restraint Occurred
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {incidentsData.length > 0 ? (
                                                        incidentsData.map((incident, index) => (
                                                            <tr 
                                                                key={incident.id}
                                                                style={{ borderBottom: index < incidentsData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td 
                                                                    className="text-sm px-4 py-3 cursor-pointer hover:underline" 
                                                                    style={{ color: 'var(--color-brand-primary)' }}
                                                                    onClick={() => toast.info('Incident Details modal would open here (separate user story)')}
                                                                >
                                                                    {incident.startDateTime}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {incident.endDateTime}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {incident.incidentType}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {incident.overview}
                                                                </td>
                                                                <td className="text-sm px-4 py-3">
                                                                    <Badge 
                                                                        className="text-xs px-2 py-0.5"
                                                                        style={{
                                                                            backgroundColor: incident.restraintOccurred === 'Yes' ? '#FEE2E2' : '#DCFCE7',
                                                                            color: incident.restraintOccurred === 'Yes' ? '#DC2626' : '#16A34A',
                                                                            border: `1px solid ${incident.restraintOccurred === 'Yes' ? '#FECACA' : '#BBF7D0'}`
                                                                        }}
                                                                    >
                                                                        {incident.restraintOccurred}
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
                                                                No Incident records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Incident records are view-only within the ITP. To add, edit, or delete incident records, please manage them through the youth's Incident records.
                                        </p>
                                    </div>

                                    {/* 2. Calculated Incident Metrics */}
                                    <div 
                                        className="grid grid-cols-3 gap-4"
                                    >
                                        {/* Number of Incidents */}
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
                                                        backgroundColor: numberOfIncidents > 0 ? '#FEF2F2' : '#E8F5EC' 
                                                    }}
                                                >
                                                    <AlertTriangle 
                                                        className="h-5 w-5" 
                                                        style={{ color: numberOfIncidents > 0 ? '#DC2626' : '#145F33' }} 
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p 
                                                        className="text-xs font-semibold uppercase tracking-wide"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Number of Incidents
                                                    </p>
                                                    <p 
                                                        className="text-2xl font-bold mt-0.5"
                                                        style={{ color: numberOfIncidents > 0 ? '#DC2626' : '#145F33' }}
                                                    >
                                                        {numberOfIncidents}
                                                    </p>
                                                    <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                        Incidents this quarter
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Number of Incidents with Restraint */}
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
                                                        backgroundColor: numberOfIncidentsWithRestraint > 0 ? '#FEF2F2' : '#E8F5EC' 
                                                    }}
                                                >
                                                    <ShieldAlert 
                                                        className="h-5 w-5" 
                                                        style={{ color: numberOfIncidentsWithRestraint > 0 ? '#DC2626' : '#145F33' }} 
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p 
                                                        className="text-xs font-semibold uppercase tracking-wide"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Incidents with Restraint
                                                    </p>
                                                    <p 
                                                        className="text-2xl font-bold mt-0.5"
                                                        style={{ color: numberOfIncidentsWithRestraint > 0 ? '#DC2626' : '#145F33' }}
                                                    >
                                                        {numberOfIncidentsWithRestraint}
                                                    </p>
                                                    <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                        Restraints used this quarter
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Total Number of Holds */}
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
                                                        backgroundColor: totalNumberOfHolds > 0 ? '#FEF2F2' : '#E8F5EC' 
                                                    }}
                                                >
                                                    <Hand 
                                                        className="h-5 w-5" 
                                                        style={{ color: totalNumberOfHolds > 0 ? '#DC2626' : '#145F33' }} 
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p 
                                                        className="text-xs font-semibold uppercase tracking-wide"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Total Number of Holds
                                                    </p>
                                                    <p 
                                                        className="text-2xl font-bold mt-0.5"
                                                        style={{ color: totalNumberOfHolds > 0 ? '#DC2626' : '#145F33' }}
                                                    >
                                                        {totalNumberOfHolds}
                                                    </p>
                                                    <p className="text-xs mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                        Total holds this quarter
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Incidents Narrative Commentary */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-2"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Incidents Summary
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
                                                <strong>Instructions:</strong> Describe any patterns present in the youth's incidents during this treatment quarter.
                                                <br />
                                                Discuss any possible reasons for the patterns present and how they might be impacting this youth's treatment.
                                                <br />
                                                Summarize any responses or interventions the treatment team has put in place that relate to the youth's incidents.
                                                <br />
                                                Please do not repeat the specific details or narratives of any incidents—those details are listed above.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={incidentsNarrative || (incidentsData.length === 0 ? "No Incidents occurred for this youth during the current ITP period." : "")}
                                            onChange={(e) => setIncidentsNarrative(e.target.value)}
                                            disabled={sectionStatus['incidents'] === 'Complete'}
                                            placeholder="Enter incidents summary narrative..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['incidents'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                        
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: AI summary generation is not available for this section. Please enter narrative commentary manually.
                                        </p>
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['incidents'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('incidents')}
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
                                                        setIncidentsNarrative("");
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
                                                    onClick={() => handleSaveSection('incidents')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('incidents')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Legal Involvement Section */}
                            {activeSection === 'legal' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('legal')}
                                    
                                    {/* 1. Legal Involvement Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Legal Involvement
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
                                                            Court Type
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Overview
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
                                                    {legalInvolvementData.length > 0 ? (
                                                        legalInvolvementData.map((legal, index) => (
                                                            <tr 
                                                                key={legal.id}
                                                                style={{ borderBottom: index < legalInvolvementData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td 
                                                                    className="text-sm px-4 py-3 cursor-pointer hover:underline" 
                                                                    style={{ color: 'var(--color-brand-primary)' }}
                                                                    onClick={() => toast.info('Legal Involvement Details modal would open here (separate user story)')}
                                                                >
                                                                    {formatDate(legal.startDate)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {legal.endDate ? formatDate(legal.endDate) : '—'}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {legal.courtType}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {legal.overview}
                                                                </td>
                                                                <td className="text-sm px-4 py-3">
                                                                    <Badge 
                                                                        className="text-xs px-2 py-0.5"
                                                                        style={{
                                                                            backgroundColor: legal.status === 'Open' ? '#FEF3C7' : '#DCFCE7',
                                                                            color: legal.status === 'Open' ? '#D97706' : '#16A34A',
                                                                            border: `1px solid ${legal.status === 'Open' ? '#FCD34D' : '#BBF7D0'}`
                                                                        }}
                                                                    >
                                                                        {legal.status}
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
                                                                No legal involvement records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Legal Involvement records are view-only within the ITP. To add, edit, or delete legal involvement records, please manage them through the youth's profile.
                                        </p>
                                    </div>

                                    {/* 2. Legal Involvement Narrative Commentary */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Legal Involvement Summary
                                            </h3>
                                            <button
                                                onClick={handleOpenLegalInvolvementModal}
                                                disabled={sectionStatus['legal'] === 'Complete'}
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
                                                <strong>Instructions:</strong> If applicable, summarize the youth's relevant legal involvement during this treatment quarter.
                                                <br /><br />
                                                Discuss how these legal issues are impacting the youth's overall treatment plan.
                                                <br /><br />
                                                Comment on the youth's engagement with and response to any interventions related to their legal involvement, especially if there are court‑ordered interventions or requirements in place.
                                                <br /><br />
                                                Use the Generate Summary link to import status updates from the Legal Involvement section.
                                                <br /><br />
                                                If legal involvement is not a relevant part of this youth's treatment, leave this text box as‑is.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={legalInvolvementNarrative || (legalInvolvementData.length === 0 ? "No legal involvement records exist for the current ITP period." : "")}
                                            onChange={(e) => setLegalInvolvementNarrative(e.target.value)}
                                            disabled={sectionStatus['legal'] === 'Complete'}
                                            placeholder="Enter legal involvement summary narrative..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['legal'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['legal'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('legal')}
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
                                                        setLegalInvolvementNarrative("");
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
                                                    onClick={() => handleSaveSection('legal')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('legal')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* DCFS Involvement Section */}
                            {activeSection === 'dcfs-involvement' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('dcfs-involvement')}
                                    
                                    {/* 1. DCFS Involvement Table - AC4-10 */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            DCFS Involvement Records
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
                                                            Investigation Date
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
                                                            Related Incident
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Resolution
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Resolution Date
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dcfsInvolvementData.length > 0 ? (
                                                        dcfsInvolvementData.map((dcfs, index) => (
                                                            <tr 
                                                                key={dcfs.id}
                                                                style={{ borderBottom: index < dcfsInvolvementData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td 
                                                                    className="text-sm px-4 py-3 cursor-pointer hover:underline" 
                                                                    style={{ color: 'var(--color-brand-primary)' }}
                                                                    onClick={() => toast.info('DCFS Involvement Details modal would open here (separate user story)')}
                                                                >
                                                                    {formatDate(dcfs.investigationDate)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {dcfs.summary}
                                                                </td>
                                                                <td 
                                                                    className={`text-sm px-4 py-3 ${dcfs.relatedIncident ? 'cursor-pointer hover:underline' : ''}`}
                                                                    style={{ color: dcfs.relatedIncident ? 'var(--color-brand-primary)' : 'var(--slds-g-color-text-weak)' }}
                                                                    onClick={() => {
                                                                        if (dcfs.relatedIncident) {
                                                                            toast.info('Incident Details modal would open here (separate user story)');
                                                                        }
                                                                    }}
                                                                >
                                                                    {dcfs.relatedIncident || '—'}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {dcfs.resolution}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {dcfs.resolutionDate ? formatDate(dcfs.resolutionDate) : '—'}
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
                                                                No DCFS involvement records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* View-only notice - AC7-8, AC22 */}
                                        <div 
                                            className="flex items-start gap-2 mt-3 p-3 rounded"
                                            style={{ 
                                                backgroundColor: 'var(--slds-g-color-background-alt)',
                                                border: '1px solid var(--slds-g-color-border-base-1)'
                                            }}
                                        >
                                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                            <p className="text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                DCFS Involvement records are view-only within the ITP. All data is sourced from the youth's profile. To add, edit, or delete DCFS involvement records, please manage them through the youth's profile.
                                            </p>
                                        </div>
                                    </div>

                                    {/* 2. DCFS Involvement Narrative Commentary - AC11-21 */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                DCFS Involvement Narrative Commentary
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    if (dcfsInvolvementData.length === 0) {
                                                        toast.info("No DCFS involvement records available to generate summary");
                                                        return;
                                                    }
                                                    // AC20: Generate Summary pulls Summary, Related Incident, Resolution, and Resolution Date
                                                    const generatedText = dcfsInvolvementData.map(dcfs => {
                                                        let text = `**Investigation - ${formatDate(dcfs.investigationDate)}**\n\n${dcfs.summary}`;
                                                        if (dcfs.relatedIncident) {
                                                            text += `\n\nThis investigation was related to ${dcfs.relatedIncident}.`;
                                                        }
                                                        text += `\n\nResolution: ${dcfs.resolution}`;
                                                        if (dcfs.resolutionDate) {
                                                            text += ` (${formatDate(dcfs.resolutionDate)})`;
                                                        }
                                                        return text;
                                                    }).join('\n\n---\n\n');
                                                    setDcfsInvolvementNarrative(generatedText);
                                                    toast.success("Summary generated from DCFS Involvement records");
                                                }}
                                                disabled={sectionStatus['dcfs-involvement'] === 'Complete'}
                                                className="text-xs underline hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                                                style={{ 
                                                    color: 'var(--color-brand-primary)',
                                                    background: 'none',
                                                    border: 'none',
                                                    padding: 0
                                                }}
                                            >
                                                Generate Summary
                                            </button>
                                        </div>

                                        {/* Instructions - AC13 (Verbatim as per requirements) */}
                                        <div 
                                            className="p-3 rounded mb-3"
                                            style={{ 
                                                backgroundColor: '#EFF6FF',
                                                border: '1px solid #BFDBFE'
                                            }}
                                        >
                                            <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>
                                                If applicable, summarize the youth's relevant DCFS involvement. 
                                                Discuss how the youth's DCFS involvement is impacting the youth's overall treatment plan.
                                            </p>
                                            <p className="text-xs leading-relaxed mt-2" style={{ color: '#1E40AF' }}>
                                                Use the Generate Summary link to import the overview from the DCFS Involvement section.
                                            </p>
                                            <p className="text-xs leading-relaxed mt-2" style={{ color: '#1E40AF' }}>
                                                If DCFS involvement is not a relevant part of this youth's treatment, leave this text box as-is.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field - AC14-18, AC23-24 */}
                                        <Textarea
                                            value={dcfsInvolvementNarrative !== null && dcfsInvolvementNarrative !== undefined && dcfsInvolvementNarrative !== '' 
                                                ? dcfsInvolvementNarrative 
                                                : (dcfsInvolvementData.length === 0 ? "No DCFS involvement records exist for the current ITP period." : "")}
                                            onChange={(e) => setDcfsInvolvementNarrative(e.target.value)}
                                            disabled={sectionStatus['dcfs-involvement'] === 'Complete'}
                                            placeholder="Enter narrative commentary regarding DCFS involvement and its impact on treatment..."
                                            rows={10}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['dcfs-involvement'] === 'Complete' ? 'var(--slds-g-color-background-alt)' : 'white'
                                            }}
                                        />
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Focus on treatment relevance, impact on safety/family dynamics, and influence on treatment approaches. Detailed DCFS record information is already displayed in the table above.
                                        </p>
                                    </div>

                                    {/* Save Actions - AC25-26 */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['dcfs-involvement'] === 'Complete' ? (
                                            <button
                                                onClick={() => handleReopenSection('dcfs-involvement')}
                                                className="text-sm px-4 py-2 rounded-full transition-colors"
                                                style={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    color: 'var(--slds-g-color-text-default)'
                                                }}
                                            >
                                                Re-Open Section
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setDcfsInvolvementNarrative("");
                                                        toast.info("Changes discarded");
                                                    }}
                                                    className="text-sm px-4 py-2 rounded-full transition-colors"
                                                    style={{
                                                        backgroundColor: 'white',
                                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                                        color: 'var(--slds-g-color-text-default)'
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleSaveSection('dcfs-involvement')}
                                                    className="text-sm px-4 py-2 rounded-full transition-colors"
                                                    style={{
                                                        backgroundColor: 'white',
                                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                                        color: 'var(--slds-g-color-text-default)'
                                                    }}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => handleCompleteSection('dcfs-involvement')}
                                                    className="text-sm px-4 py-2 rounded-full text-white transition-colors"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                >
                                                    Complete Section
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Testing & Assessments Section */}

    </>
  );
}