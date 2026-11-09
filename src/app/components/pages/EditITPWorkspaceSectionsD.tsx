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

export function EditITPWorkspaceSectionsD(props: any) {
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
    aspParticipationData,
    executiveFunctionsData,
    testingAssessmentsData,
    careerEmploymentData,
    careerClassParticipationData,
    careerFinancialLiteracyData,
    careerLearningModulesData,
    careerDriversEducationData,
    careerConnectionsData,
    psoEnrollmentData,
    psClassParticipationData,
    psCredentialsData,
    psConnectionsData,
    schoolIncidentsData,
    schoolConnectionsData,
    reportCardsData,
    courseGradesData,
    courseEnrollmentsData,
    tutorSessionsData,
    iepPlansData,
    academicPlansRecordsData,
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
                            {activeSection === 'testing' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('testing')}
                                    
                                    {/* 1. Testing & Assessments Table */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Testing & Assessments
                                            </h3>
                                            <button
                                                onClick={handleOpenSelectTestsAssessments}
                                                disabled={sectionStatus['testing'] === 'Complete'}
                                                className="text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ 
                                                    color: 'var(--color-brand-primary)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                Select Tests & Assessments
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
                                                            Date
                                                        </th>
                                                        <th 
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Test
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
                                                    {testingAssessmentsData.length > 0 ? (
                                                        testingAssessmentsData.map((test, index) => (
                                                            <tr 
                                                                key={test.id}
                                                                style={{ borderBottom: index < testingAssessmentsData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td 
                                                                    className="text-sm px-4 py-3 cursor-pointer hover:underline" 
                                                                    style={{ color: 'var(--color-brand-primary)' }}
                                                                    onClick={() => toast.info('Testing & Assessments Modal would open here (separate user story)')}
                                                                >
                                                                    {formatDate(test.date)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {test.test}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {test.summary}
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
                                                                No testing or assessment records have been selected for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Testing & Assessment records are view-only within the ITP. To view or edit test records, click on the Date link to open the Testing & Assessments Modal.
                                        </p>
                                    </div>

                                    {/* 2. Testing & Assessments Narrative Commentary */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-2"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Testing & Assessments
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
                                                <strong>Instructions:</strong> Interpret the youth's testing results from this treatment quarter.
                                                <br /><br />
                                                Please do not repeat any specific scores other than those that need to be emphasized for interpretation—the full results of all tests are listed above.
                                                <br /><br />
                                                If applicable, include commentary about the agreement between raters and whether scores align with the youth's presentation in program.
                                                <br /><br />
                                                For the initial ITP, comment on whether or not the MACI/MCM/MPACI interpretation from the Admissions Clinical Assessment aligns with the youth's presentation in program.
                                                <br /><br />
                                                For the full testing schedule click here:
                                                <br />
                                                <a 
                                                    href="https://mercyhome.sharepoint.com/Policies_and_Procedures/Youth%20Care/Youth%20Care%20Supplements/YC-SUPP-400.04_Testing%20Schedule.pdf"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="underline hover:no-underline"
                                                    style={{ color: '#1E40AF', fontWeight: 500 }}
                                                >
                                                    https://mercyhome.sharepoint.com/Policies_and_Procedures/Youth%20Care/Youth%20Care%20Supplements/YC-SUPP-400.04_Testing%20Schedule.pdf
                                                </a>
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={testingAssessmentsNarrative || (testingAssessmentsData.length === 0 ? "No testing and assessment records exist for the current ITP period." : "")}
                                            onChange={(e) => setTestingAssessmentsNarrative(e.target.value)}
                                            disabled={sectionStatus['testing'] === 'Complete'}
                                            placeholder="Enter testing & assessments narrative..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['testing'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                        
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: AI summary generation is not available for this section. Please enter narrative commentary manually.
                                        </p>
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['testing'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('testing')}
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
                                                        setTestingAssessmentsNarrative("");
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
                                                    onClick={() => handleSaveSection('testing')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('testing')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ASP Section */}
                            {activeSection === 'asp' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('asp')}
                                    
                                    {/* 1. ASP Participation Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            ASP Participation
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
                                                            Class Type
                                                        </th>
                                                        <th
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Number Planned
                                                        </th>
                                                        <th
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Number Attended
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {aspParticipationData.length > 0 ? (
                                                        aspParticipationData.map((aspClass, index) => (
                                                            <tr
                                                                key={aspClass.id}
                                                                style={{ borderBottom: index < aspParticipationData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {aspClass.class}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {aspClass.numberPlanned}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {aspClass.numberAttended}
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
                                                                No ASP class records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: ASP Participation records are view-only within the ITP. ASP data is pulled automatically for the ITP timeframe and does not require manual selection.
                                        </p>
                                    </div>

                                    {/* 2. ASP Narrative Commentary */}
                                    <div>
                                        <h3
                                            className="text-sm font-semibold mb-2"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            ASP
                                        </h3>

                                        {/* Instructions - AC11 & AC13 (Verbatim as per requirements) */}
                                        <div
                                            className="p-3 rounded-lg mb-3"
                                            style={{
                                                backgroundColor: '#EFF6FF',
                                                border: '1px solid #BFDBFE'
                                            }}
                                        >
                                            <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>
                                                <strong>Instructions:</strong> Briefly comment on the youth's engagement in ASP this quarter and the youth's response to the programming.
                                            </p>
                                            <p className="text-xs leading-relaxed mt-2" style={{ color: '#1E40AF' }}>
                                                Please do not repeat specific details of the youth's ASP participation—those are listed in the grid above.
                                                Instead, focus on summary level information about the youth's ASP participation.
                                            </p>
                                            <p className="text-xs leading-relaxed mt-2" style={{ color: '#1E40AF' }}>
                                                If ASP classes are not part of a youth's treatment, enter<br />
                                                <em>"&lt;&lt;Youth's Name&gt;&gt; is not enrolled in any formal ASP offerings on‑campus."</em>
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={aspNarrative || (aspParticipationData.length === 0 ? "No ASP class records exist for the current ITP period." : "")}
                                            onChange={(e) => setAspNarrative(e.target.value)}
                                            disabled={sectionStatus['asp'] === 'Complete'}
                                            placeholder="Enter ASP narrative..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['asp'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                        
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: AI summary generation is not available for this section. Please enter narrative commentary manually.
                                        </p>
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['asp'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('asp')}
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
                                                        setAspNarrative("");
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
                                                    onClick={() => handleSaveSection('asp')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('asp')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Executive Functions Section */}
                            {activeSection === 'executive-functions' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('executive-functions')}
                                    
                                    {/* 1. Executive Functions Participation Summary */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Executive Functions Participation Summary
                                        </h3>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Class Sessions Scheduled */}
                                            <div
                                                className="p-4 rounded-lg"
                                                style={{
                                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="p-2 rounded-full"
                                                        style={{ backgroundColor: '#E8F5EC' }}
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
                                                            Class Sessions Scheduled
                                                        </p>
                                                        <p
                                                            className="text-2xl font-bold mt-0.5"
                                                            style={{ color: '#145F33' }}
                                                        >
                                                            {executiveFunctionsData.participationSummary.classSessionsScheduled}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Class Sessions Attended */}
                                            <div
                                                className="p-4 rounded-lg"
                                                style={{
                                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="p-2 rounded-full"
                                                        style={{ backgroundColor: '#E8F5EC' }}
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
                                                            Class Sessions Attended
                                                        </p>
                                                        <p
                                                            className="text-2xl font-bold mt-0.5"
                                                            style={{ color: '#145F33' }}
                                                        >
                                                            {executiveFunctionsData.participationSummary.classSessionsAttended}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-xs mt-3 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Summary metrics update dynamically as underlying Connection data updates upstream.
                                        </p>
                                    </div>

                                    {/* 2. Learning Module Breakdown Table */}
                                    <div>
                                        <h3 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Learning Module Breakdown
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
                                                            Learning Module
                                                        </th>
                                                        <th
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Number Planned
                                                        </th>
                                                        <th
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Number Attended
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {executiveFunctionsData.learningModules.length > 0 ? (
                                                        executiveFunctionsData.learningModules.map((module, index) => (
                                                            <tr
                                                                key={module.id}
                                                                style={{ borderBottom: index < executiveFunctionsData.learningModules.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {module.learningModule}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {module.numberPlanned}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {module.numberAttended}
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
                                                                No Learning Module records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: The Learning Module Breakdown table is view-only within the ITP. Users cannot edit learning module records from this table.
                                        </p>
                                    </div>

                                    {/* 3. Organizational Systems Table */}
                                    <div>
                                        <h3
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Organizational Systems
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
                                                            System
                                                        </th>
                                                        <th
                                                            className="text-left text-xs font-semibold px-4 py-3"
                                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                                        >
                                                            Number Completed
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {executiveFunctionsData.organizationalSystems?.length > 0 ? (
                                                        executiveFunctionsData.organizationalSystems.map((system, index) => (
                                                            <tr
                                                                key={system.id}
                                                                style={{ borderBottom: index < executiveFunctionsData.organizationalSystems.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {system.system}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {system.numberCompleted}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td
                                                                colSpan={2}
                                                                className="text-sm px-4 py-8 text-center italic"
                                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                No Organizational Systems records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: The Organizational Systems table is view-only within the ITP. Users cannot edit organizational systems records from this table.
                                        </p>
                                    </div>

                                    {/* 3b. Executive Functions Connections Grid */}
                                    <div>
                                        <h3
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Executive Functions Connections
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
                                                            Purpose
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
                                                    {executiveFunctionsData.connections?.length > 0 ? (
                                                        executiveFunctionsData.connections.map((connection, index) => (
                                                            <tr
                                                                key={connection.id}
                                                                style={{ borderBottom: index < executiveFunctionsData.connections.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {formatDate(connection.startDate)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {connection.type}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {connection.purpose}
                                                                </td>
                                                                <td className="text-sm px-4 py-3">
                                                                    <span
                                                                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                                        style={{
                                                                            backgroundColor: connection.attendance === 'Yes' ? '#e8f5e9' : '#ffebee',
                                                                            color: connection.attendance === 'Yes' ? '#145F33' : '#c23934',
                                                                            border: `1px solid ${connection.attendance === 'Yes' ? '#c8e6c9' : '#ffcdd2'}`
                                                                        }}
                                                                    >
                                                                        {connection.attendance}
                                                                    </span>
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
                                                                No Executive Functions Connections exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Executive Functions Connections are view-only within the ITP. This includes Internal Academy Meeting connections where Purpose = 'Executive Functions Coaching'.
                                        </p>
                                    </div>

                                    {/* 4. Application of Executive Functions - Narrative Commentary */}
                                    <div>
                                        <h3
                                            className="text-sm font-semibold mb-2"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Application of Executive Functions
                                        </h3>

                                        {/* Instructions - AC21 (Verbatim as per requirements) */}
                                        <div
                                            className="p-3 rounded-lg mb-3"
                                            style={{
                                                backgroundColor: '#EFF6FF',
                                                border: '1px solid #BFDBFE'
                                            }}
                                        >
                                            <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>
                                                <strong>Instructions:</strong> Briefly comment on the youth's application of executive function skills this quarter.
                                            </p>
                                            <p className="text-xs leading-relaxed mt-2" style={{ color: '#1E40AF' }}>
                                                Focus on summary level information about the youth's application of executive functions skills.
                                            </p>
                                            <p className="text-xs leading-relaxed mt-2" style={{ color: '#1E40AF' }}>
                                                For older youth who are not formally enrolled in Executive Functions, state:<br />
                                                <em>"&lt;&lt;Youth's Name&gt;&gt; is not enrolled in any formal Executive Functions classes through Mercy Home."</em><br />
                                                However, feel free to include here if there are any executive functions skills that the youth is working on that should be highlighted.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={executiveFunctionsNarrative}
                                            onChange={(e) => setExecutiveFunctionsNarrative(e.target.value)}
                                            disabled={sectionStatus['executive-functions'] === 'Complete'}
                                            placeholder="Enter application of executive functions narrative..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['executive-functions'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                        
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: No Generate Summary functionality is provided for this section. Please enter narrative commentary manually.
                                        </p>
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['executive-functions'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('executive-functions')}
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
                                                        setExecutiveFunctionsNarrative("");
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
                                                    onClick={() => handleSaveSection('executive-functions')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('executive-functions')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Career Section */}
                            {activeSection === 'career' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('career')}

                                    {/* 1. Employment Table */}
                                    <div>
                                        <h3
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Employment
                                        </h3>
                                        <div
                                            className="rounded-lg overflow-hidden"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Employer</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Type</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Title</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Discipline</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Start Date</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>End Date</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {careerEmploymentData.length > 0 ? (
                                                        careerEmploymentData.map((emp, index) => (
                                                            <tr
                                                                key={emp.id}
                                                                style={{ borderBottom: index < careerEmploymentData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    <button
                                                                        className="hover:underline text-left"
                                                                        style={{ color: '#145F33', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                                                        onClick={() => toast.info("Employment Details modal would open here")}
                                                                    >
                                                                        {emp.employer}
                                                                    </button>
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{emp.type || '—'}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{emp.position}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{emp.discipline || '—'}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{formatDate(emp.startDate)}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{formatDate(emp.endDate)}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    <span
                                                                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                                        style={{
                                                                            backgroundColor: emp.status === 'Active' ? '#e8f5e9' : 'var(--slds-g-color-background-alt)',
                                                                            color: emp.status === 'Active' ? '#145F33' : 'var(--slds-g-color-text-weak)',
                                                                            border: `1px solid ${emp.status === 'Active' ? '#c8e6c9' : 'var(--slds-g-color-border-base-1)'}`
                                                                        }}
                                                                    >
                                                                        {emp.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={7} className="text-sm px-4 py-8 text-center italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                No employment records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Employment records are view-only within the ITP. Data is pulled automatically for the ITP timeframe.
                                        </p>
                                    </div>

                                    {/* 2. Class Participation Table */}
                                    {(() => {
                                        const CLASS_PARTICIPATION_TYPES = ['Career Exposure', 'Financial Literacy', 'Job Skills'];
                                        const filteredClassParticipation = careerClassParticipationData.filter(
                                            cls => CLASS_PARTICIPATION_TYPES.includes(cls.classType)
                                        );
                                        return (
                                    <div>
                                        <h3
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Class Participation
                                        </h3>
                                        <div
                                            className="rounded-lg overflow-hidden"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Class Connection</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Class Type</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Number Planned</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Number Attended</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredClassParticipation.length > 0 ? (
                                                        filteredClassParticipation.map((cls, index) => (
                                                            <tr
                                                                key={cls.id}
                                                                style={{ borderBottom: index < filteredClassParticipation.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{cls.className}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{cls.classType || '—'}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{cls.numberPlanned ?? '—'}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{cls.numberAttended ?? '—'}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={4} className="text-sm px-4 py-8 text-center italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                No career class participation records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Class Participation records are view-only within the ITP. Displays Career Exposure, Financial Literacy, and Job Skills class types only.
                                        </p>
                                    </div>
                                        );
                                    })()}

                                    {/* 3. Financial Literacy Table */}
                                    <div>
                                        <h3
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Financial Literacy
                                        </h3>
                                        <div
                                            className="rounded-lg overflow-hidden"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Module</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Curriculum Version</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Number Planned</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Number Attended</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {careerFinancialLiteracyData.length > 0 ? (
                                                        careerFinancialLiteracyData.map((fl, index) => (
                                                            <tr
                                                                key={fl.id}
                                                                style={{ borderBottom: index < careerFinancialLiteracyData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{fl.className}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{fl.curriculumVersion || '—'}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{fl.numberPlanned}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{fl.numberAttended}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={4} className="text-sm px-4 py-8 text-center italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                No financial literacy records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Financial Literacy records are view-only within the ITP. Data is pulled automatically for the ITP timeframe.
                                        </p>
                                    </div>

                                    {/* 4. Learning Module Breakdown Table */}
                                    {(() => {
                                        const filteredLearningModules = careerLearningModulesData.filter(
                                            m => m.category === 'Job Skills' || m.type === 'Job Skills' || m.moduleType === 'Job Skills'
                                        );
                                        const displayModules = filteredLearningModules.length > 0 ? filteredLearningModules : careerLearningModulesData;
                                        return (
                                    <div>
                                        <h3
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Learning Module Breakdown
                                        </h3>
                                        <div
                                            className="rounded-lg overflow-hidden"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Learning Module</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Number Planned</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Number Attended</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {displayModules.length > 0 ? (
                                                        displayModules.map((module, index) => (
                                                            <tr
                                                                key={module.id}
                                                                style={{ borderBottom: index < displayModules.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{module.learningModule}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{module.numberPlanned}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{module.numberAttended}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={3} className="text-sm px-4 py-8 text-center italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                No job skills learning module records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Learning Module Breakdown displays only Job Skill–related modules and is view-only within the ITP.
                                        </p>
                                    </div>
                                        );
                                    })()}

                                    {/* 4b. Driver's Education Table */}

                                    {/* 5. Career Connections Table */}
                                    {(() => {
                                        const CAREER_CONNECTION_TYPES = ['Internal Academy Meeting', 'Employee Site Visit'];
                                        const CAREER_CONNECTION_PURPOSES = ['Career Advising', 'Employment Advising', 'Internship', 'Off Campus Job'];
                                        const filteredCareerConnections = careerConnectionsData.filter(
                                            conn =>
                                                CAREER_CONNECTION_TYPES.includes(conn.type) &&
                                                CAREER_CONNECTION_PURPOSES.includes(conn.purpose)
                                        );
                                        return (
                                    <div>
                                        <h3
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Career Connections
                                        </h3>
                                        <div
                                            className="rounded-lg overflow-hidden"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Date</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Type</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Purpose</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Attended</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredCareerConnections.length > 0 ? (
                                                        filteredCareerConnections.map((conn, index) => (
                                                            <tr
                                                                key={conn.id}
                                                                style={{ borderBottom: index < filteredCareerConnections.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    <button
                                                                        className="hover:underline text-left"
                                                                        style={{ color: '#145F33', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                                                        onClick={() => toast.info("Career Connection Details modal would open here")}
                                                                    >
                                                                        {formatDate(conn.date)}
                                                                    </button>
                                                                </td>
                                                                <td className="text-sm px-4 py-3 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{conn.type}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{conn.purpose || '—'}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    <span
                                                                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                                        style={{
                                                                            backgroundColor: conn.attended === 'Yes' ? '#e8f5e9' : '#ffebee',
                                                                            color: conn.attended === 'Yes' ? '#145F33' : '#c23934',
                                                                            border: `1px solid ${conn.attended === 'Yes' ? '#c8e6c9' : '#ffcdd2'}`
                                                                        }}
                                                                    >
                                                                        {conn.attended}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={4} className="text-sm px-4 py-8 text-center italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                No career connection records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Career Connection records are view-only within the ITP. Data is pulled automatically for the ITP timeframe.
                                        </p>
                                    </div>
                                        );
                                    })()}

                                    {/* 6. Career Narrative Commentary */}
                                    <div>
                                        <h3
                                            className="text-sm font-semibold mb-2"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Career Planning Commentary
                                        </h3>

                                        {/* Instructions - AC41 (Verbatim as per requirements) */}
                                        <div
                                            className="p-3 rounded-lg mb-3"
                                            style={{
                                                backgroundColor: '#EFF6FF',
                                                border: '1px solid #BFDBFE'
                                            }}
                                        >
                                            <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>
                                                <strong>Instructions:</strong> Summarize the youth's engagement with and response to career planning.
                                            </p>
                                            <p className="text-xs leading-relaxed mt-2" style={{ color: '#1E40AF' }}>
                                                If applicable, include reflections and feedback from employers.
                                            </p>
                                            <p className="text-xs leading-relaxed mt-2" style={{ color: '#1E40AF' }}>
                                                If career planning is not a relevant part of this youth's treatment, enter a comment indicating this.
                                            </p>
                                        </div>

                                        {/* Narrative Text Field */}
                                        <Textarea
                                            value={careerPlanningNarrative}
                                            onChange={(e) => setCareerPlanningNarrative(e.target.value)}
                                            disabled={sectionStatus['career'] === 'Complete'}
                                            placeholder="Enter career narrative..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['career'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />

                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: AI summary generation is not available for this section. Please enter narrative commentary manually.
                                        </p>
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['career'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('career')}
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
                                                        setCareerPlanningNarrative("");
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
                                                    onClick={() => handleSaveSection('career')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('career')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Post Secondary Section */}
                            {activeSection === 'post-secondary' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('post-secondary')}

                                    {/* 1. PSO Enrollment Table */}
                                    <div>
                                        <h3
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            PSO Enrollment
                                        </h3>
                                        <div
                                            className="rounded-lg overflow-hidden"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Program</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Organization</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Start Date</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>End Date</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {psoEnrollmentData.length > 0 ? (
                                                        psoEnrollmentData.map((enr, index) => (
                                                            <tr
                                                                key={enr.id}
                                                                style={{ borderBottom: index < psoEnrollmentData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td
                                                                    className="text-sm px-4 py-3 cursor-pointer hover:underline"
                                                                    style={{ color: 'var(--color-brand-primary)' }}
                                                                    onClick={() => toast.info('PSO Enrollment Details modal would open here (separate user story)')}
                                                                >
                                                                    {enr.program}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{enr.organization}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{formatDate(enr.startDate)}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: enr.endDate ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>
                                                                    {enr.endDate ? formatDate(enr.endDate) : '—'}
                                                                </td>
                                                                <td className="text-sm px-4 py-3">
                                                                    <span
                                                                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                                        style={{
                                                                            backgroundColor: enr.status === 'Active' ? '#e8f5e9' : enr.status === 'Pending' ? '#fff8e1' : 'var(--slds-g-color-background-alt)',
                                                                            color: enr.status === 'Active' ? '#145F33' : enr.status === 'Pending' ? '#f57c00' : 'var(--slds-g-color-text-weak)',
                                                                            border: `1px solid ${enr.status === 'Active' ? '#c8e6c9' : enr.status === 'Pending' ? '#ffe082' : 'var(--slds-g-color-border-base-1)'}`
                                                                        }}
                                                                    >
                                                                        {enr.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={5} className="text-sm px-4 py-8 text-center italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                No PSO Enrollment records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: PSO Enrollment records are view-only within the ITP. Users cannot add, edit, or delete PSO enrollment records from within the ITP.
                                        </p>
                                    </div>

                                    {/* 2. Class Participation Table */}
                                    {(() => {
                                        const filteredPsClassParticipation = psClassParticipationData.filter(
                                            cls => cls.classType === 'Post Secondary Options'
                                        );
                                        return (
                                    <div>
                                        <h3
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Class Participation
                                        </h3>
                                        <div
                                            className="rounded-lg overflow-hidden"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Class Connection</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Number Planned</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Number Attended</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredPsClassParticipation.length > 0 ? (
                                                        filteredPsClassParticipation.map((cls, index) => (
                                                            <tr
                                                                key={cls.id}
                                                                style={{ borderBottom: index < filteredPsClassParticipation.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{cls.className}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{cls.numberPlanned}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{cls.numberAttended}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={3} className="text-sm px-4 py-8 text-center italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                No class participation records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Class Participation records are view-only within the ITP. Displays Post Secondary Options class type only.
                                        </p>
                                    </div>
                                        );
                                    })()}

                                    {/* 3. Credentials Table */}
                                    <div>
                                        <h3
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Credentials
                                        </h3>
                                        <div
                                            className="rounded-lg overflow-hidden"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Credential</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Issuing Organization</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Type</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>Issue Date</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>Expiration Date</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {psCredentialsData.length > 0 ? (
                                                        psCredentialsData.map((cred, index) => (
                                                            <tr
                                                                key={cred.id}
                                                                className="transition-colors hover:bg-neutral-50"
                                                                style={{ borderBottom: index < psCredentialsData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3 align-middle">
                                                                    <button
                                                                        className="hover:underline text-left"
                                                                        style={{ color: '#145F33', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                                                        onClick={() => toast.info('Credential Details modal would open here (separate user story)')}
                                                                    >
                                                                        {cred.credential}
                                                                    </button>
                                                                </td>
                                                                <td className="text-sm px-4 py-3 align-middle" style={{ color: cred.issuingOrganization ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>
                                                                    {cred.issuingOrganization || '—'}
                                                                </td>
                                                                <td className="text-sm px-4 py-3 align-middle" style={{ color: cred.type ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>
                                                                    {cred.type || '—'}
                                                                </td>
                                                                <td className="text-sm px-4 py-3 align-middle whitespace-nowrap" style={{ color: cred.issueDate ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>
                                                                    {cred.issueDate ? formatDate(cred.issueDate) : '—'}
                                                                </td>
                                                                <td className="text-sm px-4 py-3 align-middle whitespace-nowrap" style={{ color: cred.expirationDate ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>
                                                                    {cred.expirationDate ? formatDate(cred.expirationDate) : '—'}
                                                                </td>
                                                                <td className="text-sm px-4 py-3 align-middle">
                                                                    <span
                                                                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                                        style={{
                                                                            backgroundColor: cred.status === 'Earned' ? '#e8f5e9' : '#fff8e1',
                                                                            color: cred.status === 'Earned' ? '#145F33' : '#f57c00',
                                                                            border: `1px solid ${cred.status === 'Earned' ? '#c8e6c9' : '#ffe082'}`
                                                                        }}
                                                                    >
                                                                        {cred.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={6} className="text-sm px-4 py-8 text-center italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                No credential records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Credentials are view-only within the ITP. Users cannot add, edit, or delete credential records from within the ITP.
                                        </p>
                                    </div>

                                    {/* 4. Post Secondary Connections Table */}
                                    {(() => {
                                        const filteredPsConnections = psConnectionsData.filter(
                                            conn => conn.type === 'Internal Academy Meeting' && conn.purpose === 'PSO Advising'
                                        );
                                        return (
                                    <div>
                                        <h3
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Post Secondary Connections
                                        </h3>
                                        <div
                                            className="rounded-lg overflow-hidden"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th className="text-left text-xs font-semibold px-4 py-3 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>Date</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>Type</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>Purpose</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3 w-2/5" style={{ color: 'var(--slds-g-color-text-default)' }}>Summary</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>Attended</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredPsConnections.length > 0 ? (
                                                        filteredPsConnections.map((conn, index) => (
                                                            <tr
                                                                key={conn.id}
                                                                className="transition-colors hover:bg-neutral-50"
                                                                style={{ borderBottom: index < filteredPsConnections.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}
                                                            >
                                                                <td className="text-sm px-4 py-3 align-middle whitespace-nowrap">
                                                                    <button
                                                                        className="hover:underline text-left"
                                                                        style={{ color: '#145F33', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                                                        onClick={() => toast.info('Post Secondary Connection Details modal would open here (separate user story)')}
                                                                    >
                                                                        {formatDate(conn.date)}
                                                                    </button>
                                                                </td>
                                                                <td className="text-sm px-4 py-3 align-middle whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{conn.type}</td>
                                                                <td className="text-sm px-4 py-3 align-middle whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{conn.purpose}</td>
                                                                <td className="text-sm px-4 py-3 align-top" style={{ color: conn.summary ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>
                                                                    {conn.summary || '—'}
                                                                </td>
                                                                <td className="text-sm px-4 py-3 align-middle">
                                                                    <span
                                                                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                                        style={{
                                                                            backgroundColor: conn.attended === 'Yes' ? '#e8f5e9' : '#ffebee',
                                                                            color: conn.attended === 'Yes' ? '#145F33' : '#c23934',
                                                                            border: `1px solid ${conn.attended === 'Yes' ? '#c8e6c9' : '#ffcdd2'}`
                                                                        }}
                                                                    >
                                                                        {conn.attended}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={5} className="text-sm px-4 py-8 text-center italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                No Post Secondary Connection records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Post Secondary Connections are view-only within the ITP. Displays Internal Academy Meeting connections where Purpose = PSO Advising.
                                        </p>
                                    </div>
                                        );
                                    })()}

                                    {/* 5. Post Secondary Narrative Commentary */}
                                    <div>
                                        <h3
                                            className="text-sm font-semibold mb-2"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Post Secondary Planning Commentary
                                        </h3>

                                        {/* Instructions - AC36 (Verbatim as per requirements) */}
                                        <div
                                            className="p-3 rounded-lg mb-3"
                                            style={{
                                                backgroundColor: '#EFF6FF',
                                                border: '1px solid #BFDBFE'
                                            }}
                                        >
                                            <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>
                                                <strong>Instructions:</strong> Summarize the youth's engagement with and response to post‑secondary planning.
                                                Please do not repeat any specific details such as class participation—those details are listed above.
                                            </p>
                                            <p className="text-xs leading-relaxed mt-2" style={{ color: '#1E40AF' }}>
                                                This section will include any internal academy meetings flagged as related to Post‑Secondary Options.
                                            </p>
                                            <p className="text-xs leading-relaxed mt-2" style={{ color: '#1E40AF' }}>
                                                If post secondary planning is not a relevant part of this youth's treatment, enter a comment indicating this.
                                            </p>
                                            <p className="text-xs leading-relaxed mt-2" style={{ color: '#1E40AF' }}>
                                                <strong>Additional Notes:</strong>
                                            </p>
                                            <ul className="text-xs leading-relaxed mt-1 ml-4" style={{ color: '#1E40AF', listStyleType: 'disc' }}>
                                                <li>
                                                    <strong>Youth in college:</strong> If there are no other PSO classes or trips, enter
                                                    <br /><em>"&lt;&lt;Youth's Name&gt;&gt; did not participate in any PSO offerings this treatment quarter. His/Her academic progress in regards to college course work will be discussed in the school section."</em>
                                                </li>
                                                <li className="mt-1">
                                                    <strong>Youth in a PSO program (e.g., Greater West Town, Inspiration Kitchen, Year Up):</strong> The program should be entered as a PSO in Blueprint and the information about the youth's enrollment will be covered in this section.
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Narrative Text Field — No Generate Summary, No auto-generated no-data message */}
                                        <Textarea
                                            value={postSecondaryNarrative}
                                            onChange={(e) => setPostSecondaryNarrative(e.target.value)}
                                            disabled={sectionStatus['post-secondary'] === 'Complete'}
                                            placeholder="Enter post secondary narrative..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['post-secondary'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['post-secondary'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('post-secondary')}
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
                                                        setPostSecondaryNarrative("");
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
                                                    onClick={() => handleSaveSection('post-secondary')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('post-secondary')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* School Section */}
                            {activeSection === 'school' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('school')}

                                    {/* 1. Report Card Summary Table */}
                                    <div>
                                        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            Report Card Summary
                                        </h3>
                                        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Report Card Date</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Credits Earned</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Number of Absences</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>GPA</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Cumulative GPA</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reportCardsData.length > 0 ? (
                                                        reportCardsData.map((rc, index) => (
                                                            <tr key={rc.id} style={{ borderBottom: index < reportCardsData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                                <td
                                                                    className="text-sm px-4 py-3 cursor-pointer hover:underline"
                                                                    style={{ color: 'var(--color-brand-primary)' }}
                                                                    onClick={() => toast.info('Report Card Details modal would open here (separate user story)')}
                                                                >
                                                                    {formatDate(rc.reportCardDate)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{rc.creditsEarned}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: rc.numberOfAbsences > 8 ? '#DC2626' : 'var(--slds-g-color-text-default)' }}>{rc.numberOfAbsences}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{rc.gpa.toFixed(2)}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{rc.cumulativeGpa.toFixed(2)}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={5} className="text-sm px-4 py-8 text-center italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                No report card records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Report card records are view-only within the ITP. Users cannot add, edit, or delete report card records from within the ITP.
                                        </p>
                                    </div>

                                    {/* 2. Course Grade Breakdown Table */}
                                    <div>
                                        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            Course Grade Breakdown
                                        </h3>
                                        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Course</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Grade</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Credits Earned</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {courseGradesData.length > 0 ? (
                                                        courseGradesData.map((cg, index) => (
                                                            <tr key={cg.id} style={{ borderBottom: index < courseGradesData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                                <td
                                                                    className="text-sm px-4 py-3 cursor-pointer hover:underline"
                                                                    style={{ color: 'var(--color-brand-primary)' }}
                                                                    onClick={() => toast.info('Course Grade Details modal would open here (separate user story)')}
                                                                >
                                                                    {cg.course}
                                                                </td>
                                                                <td className="text-sm px-4 py-3 font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>{cg.grade}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{cg.creditsEarned}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={3} className="text-sm px-4 py-8 text-center italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                No course grade records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Course grade records are view-only within the ITP. Users cannot add, edit, or delete course grade records from within the ITP.
                                        </p>
                                    </div>

                                    {/* 3. Current Course Enrollment Table */}
                                    <div>
                                        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            Current Course Enrollment
                                        </h3>
                                        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Course</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {courseEnrollmentsData.length > 0 ? (
                                                        courseEnrollmentsData.map((ce, index) => (
                                                            <tr key={ce.id} style={{ borderBottom: index < courseEnrollmentsData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                                <td
                                                                    className="text-sm px-4 py-3 cursor-pointer hover:underline"
                                                                    style={{ color: 'var(--color-brand-primary)' }}
                                                                    onClick={() => toast.info('Course Enrollment Details modal would open here (separate user story)')}
                                                                >
                                                                    {ce.course}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={1} className="text-sm px-4 py-8 text-center italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                No current course enrollment records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Course enrollment records are view-only within the ITP. Users cannot add, edit, or delete enrollment records from within the ITP.
                                        </p>
                                    </div>

                                    {/* 4. School Incidents Table */}
                                    <div>
                                        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            School Incidents
                                        </h3>
                                        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Start Date & Time</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>End Date & Time</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Incident Type</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Overview</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Restraint Occurred</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {schoolIncidentsData.length > 0 ? (
                                                        schoolIncidentsData.map((incident, index) => (
                                                            <tr key={incident.id} style={{ borderBottom: index < schoolIncidentsData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                                <td
                                                                    className="text-sm px-4 py-3 whitespace-nowrap cursor-pointer hover:underline"
                                                                    style={{ color: 'var(--color-brand-primary)' }}
                                                                    onClick={() => toast.info('School Incident Details modal would open here (separate user story)')}
                                                                >
                                                                    {incident.startDateTime}
                                                                </td>
                                                                <td className="text-sm px-4 py-3 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{incident.endDateTime}</td>
                                                                <td className="text-sm px-4 py-3 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{incident.incidentType}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{incident.overview}</td>
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
                                                            <td colSpan={5} className="text-sm px-4 py-8 text-center italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                No school incident records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: School incident records are view-only within the ITP. Users cannot add, edit, or delete school incident records from within the ITP.
                                        </p>
                                    </div>

                                    {/* 5. School Connections Table */}
                                    <div>
                                        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            School Connections
                                        </h3>
                                        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Date</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Type</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Purpose</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Attended</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {schoolConnectionsData.length > 0 ? (
                                                        schoolConnectionsData.map((conn, index) => (
                                                            <tr key={conn.id} style={{ borderBottom: index < schoolConnectionsData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                                <td
                                                                    className="text-sm px-4 py-3 whitespace-nowrap cursor-pointer hover:underline"
                                                                    style={{ color: 'var(--color-brand-primary)' }}
                                                                    onClick={() => toast.info('School Connection Details modal would open here (separate user story)')}
                                                                >
                                                                    {formatDate(conn.date)}
                                                                </td>
                                                                <td className="text-sm px-4 py-3 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{conn.type}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{conn.purpose}</td>
                                                                <td className="text-sm px-4 py-3">
                                                                    <Badge
                                                                        className="text-xs px-2 py-0.5"
                                                                        style={{
                                                                            backgroundColor: conn.attended === 'Yes' ? '#DCFCE7' : '#FEE2E2',
                                                                            color: conn.attended === 'Yes' ? '#16A34A' : '#DC2626',
                                                                            border: `1px solid ${conn.attended === 'Yes' ? '#BBF7D0' : '#FECACA'}`
                                                                        }}
                                                                    >
                                                                        {conn.attended}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={4} className="text-sm px-4 py-8 text-center italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                No school connection records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: School Connection records are view-only within the ITP. Users cannot add, edit, or delete School Connection records from within the ITP.
                                        </p>
                                    </div>

                                    {/* 6. Commentary on School Performance & Engagement */}
                                    <div>
                                        <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            Commentary on School Performance &amp; Engagement
                                        </h3>
                                        {/* Verbatim instructions per AC38 */}
                                        <div
                                            className="p-3 rounded-lg mb-3"
                                            style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}
                                        >
                                            <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>
                                                <strong>Instructions:</strong> Summarize the youth's school engagement during this treatment quarter.
                                                Please do not repeat any specific details such as grades or school-related incidents—those details are listed above.
                                                Focus on the youth's response to interventions and any patterns or trends observed during the treatment quarter.
                                                Comment on the youth's academic plan going forward.
                                                <br /><br />
                                                If school is not a relevant part of this youth's treatment, enter a comment indicating this.
                                            </p>
                                        </div>
                                        {/* No Generate Summary (AC36). No auto-generated no-data message (AC37). */}
                                        <Textarea
                                            value={schoolPerformanceNarrative}
                                            onChange={(e) => setSchoolPerformanceNarrative(e.target.value)}
                                            disabled={sectionStatus['school'] === 'Complete'}
                                            placeholder="Enter school performance & engagement commentary..."
                                            rows={8}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['school'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* 7. Tutor Session Details Table */}
                                    <div>
                                        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            Tutor Session Details
                                        </h3>
                                        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Day</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Type</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Sessions Planned</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Sessions Attended</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tutorSessionsData.length > 0 ? (
                                                        tutorSessionsData.map((ts, index) => (
                                                            <tr key={ts.id} style={{ borderBottom: index < tutorSessionsData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                                <td
                                                                    className="text-sm px-4 py-3 cursor-pointer hover:underline"
                                                                    style={{ color: 'var(--color-brand-primary)' }}
                                                                    onClick={() => toast.info('Tutor Session Details modal would open here (separate user story)')}
                                                                >
                                                                    {ts.day}
                                                                </td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{ts.type}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{ts.sessionsPlanned}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{ts.sessionsAttended}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={4} className="text-sm px-4 py-8 text-center italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                No tutor session records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Tutor session records are view-only within the ITP. Users cannot add, edit, or delete tutoring session records from within the ITP.
                                        </p>
                                    </div>

                                    {/* 8. Tutoring Attendance & Engagement Commentary */}
                                    <div>
                                        <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            Tutoring Attendance &amp; Engagement
                                        </h3>
                                        {/* Verbatim instructions per AC52 */}
                                        <div
                                            className="p-3 rounded-lg mb-3"
                                            style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}
                                        >
                                            <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>
                                                <strong>Instructions:</strong> Summarize the youth's engagement with and response to tutoring during this treatment quarter.
                                                Please do not repeat the specific details of tutoring sessions—those details are listed above.
                                                <br /><br />
                                                If tutoring is not a relevant part of this youth's treatment, enter a comment indicating this.
                                            </p>
                                        </div>
                                        {/* No Generate Summary (AC51). Auto no-data message if no sessions (AC53/AC54). */}
                                        <Textarea
                                            value={schoolTutoringNarrative || (tutorSessionsData.length === 0 ? "No tutoring session records exist for the current ITP period." : "")}
                                            onChange={(e) => setSchoolTutoringNarrative(e.target.value)}
                                            disabled={sectionStatus['school'] === 'Complete'}
                                            placeholder="Enter tutoring attendance & engagement commentary..."
                                            rows={6}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['school'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['school'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('school')}
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
                                                        setSchoolPerformanceNarrative("");
                                                        setSchoolTutoringNarrative("");
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
                                                    onClick={() => handleSaveSection('school')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('school')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Academic Plans Section */}
                            {activeSection === 'academic-plans' && (
                                <div className="space-y-6">
                                    {renderSectionHeader('academic-plans')}

                                    {/* 1. IEP / 504 Plans Table */}
                                    <div>
                                        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            IEP / 504 Plans
                                        </h3>
                                        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Start Date</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Plan Type</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Description</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>End Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {iepPlansData.length > 0 ? (
                                                        iepPlansData.map((plan, index) => (
                                                            <tr key={plan.id} style={{ borderBottom: index < iepPlansData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <button
                                                                        className="text-sm hover:underline"
                                                                        style={{ color: 'var(--color-brand-primary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                                                        onClick={() => toast.info('IEP / 504 Plan Details modal would open here (separate user story)')}
                                                                    >
                                                                        {formatDate(plan.startDate)}
                                                                    </button>
                                                                </td>
                                                                <td className="text-sm px-4 py-3 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{plan.planType}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{plan.description}</td>
                                                                <td className="text-sm px-4 py-3 whitespace-nowrap" style={{ color: plan.endDate ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>
                                                                    {plan.endDate ? formatDate(plan.endDate) : '—'}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={4} className="text-sm px-4 py-8 text-center italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                No IEP / 504 Plan records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: IEP / 504 Plan records are view-only within the ITP. Users cannot add, edit, or delete plan records from within the ITP.
                                        </p>
                                    </div>

                                    {/* 1a. IEP / 504 Plans Commentary */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                IEP / 504 Plans
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    if (iepPlansData.length === 0) {
                                                        toast.info("No IEP / 504 Plan records to import");
                                                        return;
                                                    }
                                                    toast.info("Generate Summary would import Progress Tracking entries associated with IEP / 504 Plans");
                                                    const generatedText = iepPlansData.map(plan =>
                                                        `**${plan.planType}**\n\nDuring this treatment quarter, the youth continued to benefit from accommodations and services outlined in their ${plan.planType}. ${plan.description} Staff observed the youth's engagement with these supports and noted both areas of growth and continued areas of need.`
                                                    ).join('\n\n');
                                                    setIepPlansNarrative(generatedText);
                                                }}
                                                disabled={sectionStatus['academic-plans'] === 'Complete'}
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
                                        {/* Verbatim instructions per AC12 */}
                                        <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                                            <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>
                                                <strong>Instructions:</strong> Summarize any IEPs, 504 Plans, or Academic Service Plans that were active for this youth during this treatment quarter.
                                                Please do not repeat any specifics such as the dates or plan types—those details are listed above.
                                                Focus on any trends or patterns observed that relate to the use of these plans for this youth.
                                                Describe the youth's response to the plans and how they fit into the youth's overall treatment.
                                                <br /><br />
                                                Use the Generate Summary link to import any Progress Tracking entries associated with these Supplemental Plans.
                                            </p>
                                        </div>
                                        {/* No-data message per AC19/AC20 */}
                                        <Textarea
                                            value={iepPlansNarrative || (iepPlansData.length === 0 ? "No relevant IEP/504 Plan records exist for the current ITP period." : "")}
                                            onChange={(e) => setIepPlansNarrative(e.target.value)}
                                            disabled={sectionStatus['academic-plans'] === 'Complete'}
                                            placeholder="Enter IEP / 504 Plans commentary..."
                                            rows={6}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['academic-plans'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* 3. Education & Career Plans Table (renamed from Academic Plans - AC22-AC27) */}
                                    <div>
                                        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            Education & Career Plans
                                        </h3>
                                        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Start Date</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Plan Type</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Description</th>
                                                        <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>End Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {academicPlansRecordsData.length > 0 ? (
                                                        academicPlansRecordsData.map((plan, index) => (
                                                            <tr key={plan.id} style={{ borderBottom: index < academicPlansRecordsData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <button
                                                                        className="text-sm hover:underline"
                                                                        style={{ color: 'var(--color-brand-primary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                                                        onClick={() => toast.info('Education & Career Plan Details modal would open here (separate user story)')}
                                                                    >
                                                                        {formatDate(plan.startDate)}
                                                                    </button>
                                                                </td>
                                                                <td className="text-sm px-4 py-3 whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{plan.planType}</td>
                                                                <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{plan.description}</td>
                                                                <td className="text-sm px-4 py-3 whitespace-nowrap" style={{ color: plan.endDate ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>
                                                                    {plan.endDate ? formatDate(plan.endDate) : '—'}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={4} className="text-sm px-4 py-8 text-center italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                No Education & Career Plan records exist for the current ITP period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs mt-2 italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Note: Education & Career Plan records are view-only within the ITP. Users cannot add, edit, or delete Education & Career plan records from within the ITP.
                                        </p>
                                    </div>

                                    {/* 3a. Education & Career Plans Commentary (renamed from Academic Plans - AC28-AC33) */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                Education & Career Plans
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    if (academicPlansRecordsData.length === 0) {
                                                        toast.info("No Education & Career Plan records to import");
                                                        return;
                                                    }
                                                    toast.info("Generate Summary would import Progress Tracking entries associated with Education & Career Plans");
                                                    const generatedText = academicPlansRecordsData.map(plan =>
                                                        `**${plan.planType}**\n\nDuring this treatment quarter, the youth participated in a ${plan.planType}. ${plan.description} Staff observed the youth's engagement with this plan and its impact on daily academic functioning and treatment progress.`
                                                    ).join('\n\n');
                                                    setAcademicPlansNarrative(generatedText);
                                                }}
                                                disabled={sectionStatus['academic-plans'] === 'Complete'}
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
                                        {/* Verbatim instructions per AC29 */}
                                        <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                                            <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>
                                                <strong>Instructions:</strong> Summarize any Study Time Plans or Academic Agreements that were active for this youth during this treatment quarter.
                                                Please do not repeat any specifics such as the dates or plan types—those details are listed above.
                                                Focus on any trends or patterns observed that relate to the use of these plans for this youth.
                                                Describe the youth's response to the plans and how they fit into the youth's overall treatment.
                                                <br /><br />
                                                Use the Generate Summary link to import any Progress Tracking entries associated with these Supplemental Plans.
                                                <br /><br />
                                                The system will pre-populate a statement if no supplemental plans exist for this youth.
                                            </p>
                                        </div>
                                        {/* No-data message per AC32/AC33 */}
                                        <Textarea
                                            value={academicPlansNarrative || (academicPlansRecordsData.length === 0 ? "No relevant Education & Career Plan records exist for the current ITP period." : "")}
                                            onChange={(e) => setAcademicPlansNarrative(e.target.value)}
                                            disabled={sectionStatus['academic-plans'] === 'Complete'}
                                            placeholder="Enter Education & Career Plans commentary..."
                                            rows={6}
                                            className="text-sm"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                borderRadius: '4px',
                                                resize: 'vertical',
                                                backgroundColor: sectionStatus['academic-plans'] === 'Complete' ? '#F9FAFB' : 'white'
                                            }}
                                        />
                                    </div>

                                    {/* Save Actions */}
                                    <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                        {sectionStatus['academic-plans'] === 'Complete' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full h-8"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                onClick={() => handleReopenSection('academic-plans')}
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
                                                        setIepPlansNarrative("");
                                                        setAcademicPlansNarrative("");
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
                                                    onClick={() => handleSaveSection('academic-plans')}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="rounded-full text-white h-8"
                                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                                    onClick={() => handleCompleteSection('academic-plans')}
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Finalization Section */}
                            {activeSection === 'finalization' && (() => {
                                // Build complete section list with all details
                                const allSections = [
                                      { category: 'Overview', owners: 'Advocate', name: 'ITP Details', reviewer: 'Program Manager', id: 'itp-details' },
                                      { category: 'Overview', owners: 'Advocate', name: 'Schedule & Meetings', reviewer: 'Program Manager', id: 'schedule' },
                                      { category: 'Treatment & Planning', owners: 'Advocate', name: 'Triggers & Coping Skills', reviewer: 'Program Manager', id: 'triggers' },
                                      { category: 'Treatment & Planning', owners: 'Advocate, Therapist, Education & Career Resources Coordinator', name: 'Goals', reviewer: 'Program Manager/ECR Director', id: 'goals-objectives' },
                                      { category: 'Treatment & Planning', owners: 'Advocate', name: 'Care Planning Meeting', reviewer: 'Program Manager', id: 'care-planning' },
                                      { category: 'Treatment & Planning', owners: 'Advocate', name: 'Transition Planning', reviewer: 'Program Manager', id: 'transition' },
                                      { category: 'Personal Development', owners: 'Advocate', name: 'Strengths', reviewer: 'Program Manager', id: 'strengths' },
                                      { category: 'Personal Development', owners: 'Advocate', name: 'Milieu Engagement', reviewer: 'Program Manager', id: 'milieu-engagement' },
                                      { category: 'Personal Development', owners: 'Advocate', name: 'Activities', reviewer: 'Program Manager', id: 'activities' },
                                      { category: 'Relationships & Support', owners: 'Advocate', name: 'Advocate Notes', reviewer: 'Program Manager', id: 'advocate-notes' },
                                      { category: 'Relationships & Support', owners: 'Advocate', name: 'Family', reviewer: 'Program Manager', id: 'family' },
                                      { category: 'Relationships & Support', owners: 'Advocate', name: 'Spirituality', reviewer: 'Program Manager', id: 'spirituality' },
                                      { category: 'Health & Wellness', owners: 'Advocate', name: 'Physical Health', reviewer: 'Program Manager', id: 'physical-health' },
                                      { category: 'Relationships & Support', owners: 'Therapist', name: 'Mental Health', reviewer: 'Program Manager', id: 'mental-health' },
                                      { category: 'Relationships & Support', owners: 'Therapist', name: 'Medication', reviewer: 'Program Manager', id: 'medication' },
                                      { category: 'Relationships & Support', owners: 'Therapist', name: 'Trauma', reviewer: 'Program Manager', id: 'trauma' },
                                      { category: 'Relationships & Support', owners: 'Therapist', name: 'Therapy', reviewer: 'Program Manager', id: 'therapy' },
                                      { category: 'Relationships & Support', owners: 'Advocate', name: 'Substance Use', reviewer: 'Program Manager', id: 'substance-use' },
                                      { category: 'Incidents & Legal', owners: 'Advocate', name: 'Incidents', reviewer: 'Program Manager', id: 'incidents' },
                                      { category: 'Incidents & Legal', owners: 'Advocate', name: 'Legal Involvement', reviewer: 'Program Manager', id: 'legal' },
                                      { category: 'Incidents & Legal', owners: 'Advocate', name: 'DCFS Involvement', reviewer: 'Program Manager', id: 'dcfs-involvement' },
                                      { category: 'Education & Career', owners: 'Advocate, Therapist, Education & Career Resources Coordinator', name: 'Testing & Assessment', reviewer: 'Program Manager/ECR Director', id: 'testing' },
                                      { category: 'Education & Career', owners: 'After School Programs Coordinator', name: 'ASP', reviewer: 'ECR Director', id: 'asp' },
                                      { category: 'Education & Career', owners: 'Education & Career Resources Coordinator', name: 'Executive Functions', reviewer: 'ECR Director', id: 'executive-functions' },
                                      { category: 'Education & Career', owners: 'Education & Career Resources Coordinator', name: 'Career', reviewer: 'ECR Director', id: 'career' },
                                      { category: 'Education & Career', owners: 'Education & Career Resources Coordinator', name: 'Post Secondary', reviewer: 'ECR Director', id: 'post-secondary' },
                                      { category: 'Education & Career', owners: 'Education & Career Resources Coordinator', name: 'School', reviewer: 'ECR Director', id: 'school' },
                                      { category: 'Education & Career', owners: 'Education & Career Resources Coordinator', name: 'Education & Career Plans', reviewer: 'ECR Director', id: 'academic-plans' }
                                      ];
                                return (
                                    <div className="space-y-6">
                                        {/* Current ITP Status Indicator */}
                                        <div
                                            className="p-4 rounded-lg"
                                            style={{
                                                backgroundColor: 'var(--slds-g-color-background-alt)',
                                                border: '1px solid var(--slds-g-color-border-base-1)'
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                        Current ITP Status
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        {itpLifecycleStatus === 'New' && (
                                                            <>
                                                                <FileText className="h-4 w-4" style={{ color: '#616161' }} />
                                                                <span className="text-sm font-semibold" style={{ color: '#616161' }}>New</span>
                                                            </>
                                                        )}
                                                        {itpLifecycleStatus === 'In Progress' && (
                                                            <>
                                                                <Clock className="h-4 w-4" style={{ color: '#1565C0' }} />
                                                                <span className="text-sm font-semibold" style={{ color: '#1565C0' }}>In Progress</span>
                                                            </>
                                                        )}
                                                        {itpLifecycleStatus === 'Complete' && (
                                                            <>
                                                                <CheckCircle2 className="h-4 w-4" style={{ color: '#2E7D32' }} />
                                                                <span className="text-sm font-semibold" style={{ color: '#2E7D32' }}>Complete</span>
                                                            </>
                                                        )}
                                                        {itpLifecycleStatus === 'Ready for Review' && (
                                                            <>
                                                                <AlertCircle className="h-4 w-4" style={{ color: '#E65100' }} />
                                                                <span className="text-sm font-semibold" style={{ color: '#E65100' }}>Ready for Review</span>
                                                            </>
                                                        )}
                                                        {itpLifecycleStatus === 'Finalized' && (
                                                            <>
                                                                <Lock className="h-4 w-4" style={{ color: '#6A1B9A' }} />
                                                                <span className="text-sm font-semibold" style={{ color: '#6A1B9A' }}>Finalized</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                    {itpLifecycleStatus === 'New' && 'Save any section to move to In Progress'}
                                                    {itpLifecycleStatus === 'In Progress' && 'Complete all sections to enable Ready for Review'}
                                                    {itpLifecycleStatus === 'Complete' && 'Click "Ready for Review" when ready to submit'}
                                                    {itpLifecycleStatus === 'Ready for Review' && 'Click "Finalize" to lock this ITP'}
                                                    {itpLifecycleStatus === 'Finalized' && 'This ITP is locked and finalized'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contributors & Status Table */}
                                        <div>
                                            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                Contributors & Status
                                            </h3>
                                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                <table className="w-full">
                                                    <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                        <tr>
                                                            <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Section</th>
                                                            <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Owners</th>
                                                            <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Contributors</th>
                                                            <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Reviewer</th>
                                                            <th className="text-left text-xs font-semibold px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {allSections.map((section, index) => {
                                                            const status = sectionStatus[section.id] || 'Not Started';
                                                            const contributors = sectionContributors[section.id] || [];
                                                            
                                                            return (
                                                                <tr 
                                                                    key={section.id}
                                                                    style={{ 
                                                                        borderBottom: index < allSections.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                                                    }}
                                                                >
                                                                    <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                        {section.category} &gt; {section.name}
                                                                    </td>
                                                                  <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                      {section.owners} 
                                                                    </td>
                                                                    <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                        {contributors.length > 0 ? (
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {contributors.map((contributor, idx) => (
                                                                                    <span 
                                                                                        key={idx}
                                                                                        className="text-xs px-2 py-0.5 rounded"
                                                                                        style={{
                                                                                            backgroundColor: 'var(--slds-g-color-background-alt)',
                                                                                            color: 'var(--slds-g-color-text-default)',
                                                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                                                        }}
                                                                                    >
                                                                                        {contributor}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-xs italic" style={{ color: 'var(--slds-g-color-text-weak)' }}>—</span>
                                                                        )}
                                                                    </td>
                                                                  <td className="text-sm px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                        {section.reviewer}
                                                                    </td>
                                                                    <td className="text-sm px-4 py-3">
                                                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                                                            {status === 'Complete' && (
                                                                                <>
                                                                                    <CheckCircle2 className="h-4 w-4" style={{ color: '#10B981' }} />
                                                                                    <span className="text-xs font-medium" style={{ color: '#10B981' }}>Complete</span>
                                                                                </>
                                                                            )}
                                                                            {status === 'In Progress' && (
                                                                                <>
                                                                                    <Clock className="h-4 w-4" style={{ color: '#F59E0B' }} />
                                                                                    <span className="text-xs font-medium" style={{ color: '#F59E0B' }}>In Progress</span>
                                                                                </>
                                                                            )}
                                                                            {status === 'Not Started' && (
                                                                                <>
                                                                                    <Circle className="h-4 w-4" style={{ color: '#9CA3AF' }} />
                                                                                    <span className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Not Started</span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Ready for Review & Finalize / Un-Finalize Buttons */}
                                        <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                            {!isItpFinalized ? (
                                                <>
                                                    {/* AC4: Ready for Review button - only enabled when all sections Complete */}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="rounded-full h-8"
                                                        disabled={itpLifecycleStatus !== 'Complete'}
                                                        style={{
                                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                                            color: itpLifecycleStatus === 'Complete'
                                                                ? 'var(--slds-g-color-text-default)'
                                                                : 'var(--slds-g-color-text-weak)',
                                                            opacity: itpLifecycleStatus === 'Complete' ? 1 : 0.5,
                                                            cursor: itpLifecycleStatus === 'Complete' ? 'pointer' : 'not-allowed'
                                                        }}
                                                        onClick={() => {
                                                            if (itpLifecycleStatus === 'Complete') {
                                                                setItpLifecycleStatus('Ready for Review');
                                                                toast.success('ITP status updated to Ready for Review');
                                                            }
                                                        }}
                                                    >
                                                        <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                                                        Ready for Review
                                                    </Button>
                                                    {/* AC5: Finalize button - only enabled when status is Ready for Review */}
                                                    <Button
                                                        size="sm"
                                                        className="rounded-full text-white h-8"
                                                        disabled={itpLifecycleStatus !== 'Ready for Review'}
                                                        style={{
                                                            backgroundColor: itpLifecycleStatus === 'Ready for Review'
                                                                ? 'var(--color-brand-primary)'
                                                                : '#9CA3AF',
                                                            opacity: itpLifecycleStatus === 'Ready for Review' ? 1 : 0.5,
                                                            cursor: itpLifecycleStatus === 'Ready for Review' ? 'pointer' : 'not-allowed'
                                                        }}
                                                        onClick={() => {
                                                            if (itpLifecycleStatus === 'Ready for Review') {
                                                                setIsItpFinalized(true);
                                                                setItpLifecycleStatus('Finalized');
                                                                toast.success('ITP has been finalized. All sections are now locked.');
                                                            }
                                                        }}
                                                    >
                                                        <Lock className="h-3.5 w-3.5 mr-1.5" />
                                                        Finalize
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-full h-8"
                                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                                    onClick={() => {
                                                        setIsItpFinalized(false);
                                                        setItpLifecycleStatus('Ready for Review');
                                                        toast.info('ITP has been un-finalized. All sections are now unlocked for editing.');
                                                    }}
                                                >
                                                    <Unlock className="h-3.5 w-3.5 mr-1.5" />
                                                    Un-Finalize
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Other Sections - Placeholder */}
                            {activeSection !== 'itp-details' && activeSection !== 'schedule' && activeSection !== 'finalization' && activeSection !== 'medication' && activeSection !== 'physical-health' && activeSection !== 'mental-health' && activeSection !== 'triggers' && activeSection !== 'goals-objectives' && activeSection !== 'care-planning' && activeSection !== 'transition' && activeSection !== 'strengths' && activeSection !== 'milieu-engagement' && activeSection !== 'activities' && activeSection !== 'advocate-notes' && activeSection !== 'family' && activeSection !== 'spirituality' && activeSection !== 'trauma' && activeSection !== 'therapy' && activeSection !== 'substance-use' && activeSection !== 'incidents' && activeSection !== 'legal' && activeSection !== 'dcfs-involvement' && activeSection !== 'testing' && activeSection !== 'asp' && activeSection !== 'executive-functions' && activeSection !== 'career' && activeSection !== 'post-secondary' && activeSection !== 'school' && activeSection !== 'academic-plans' && (
                                <div className="space-y-4">
                                    <p className="text-sm" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Section content for <strong>{currentSection.name}</strong> would be displayed here.
                                    </p>
                                    <p className="text-sm" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Each section will have its own specific fields, forms, and content based on the requirements defined in separate user stories.
                                    </p>
                                    
                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-full h-8"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="rounded-full text-white h-8"
                                            style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </div>
                            )}

    </>
  );
}