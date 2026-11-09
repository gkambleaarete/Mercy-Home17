import { useState, useMemo, useEffect, useRef } from "react";
import { FieldLabel } from "../ui/field";
import { FieldError } from "../ui/field";
import { LeadDetailWj4Fields } from "./LeadDetailWj4Fields";
import { YouthAlertIcons } from "../youth/YouthAlertIcons";
import { ChevronRight, Plus, User, Users, Building2, Phone, Mail, CheckSquare, Upload, AlertTriangle, Clock, MapPin, CheckCircle, Pencil, Trash2, ChevronDown, FileText, ChevronUp, Check, X as XIcon, ChevronUp as ArrowUp, ChevronDown as ArrowDown, MoreVertical, Download, Eye, File } from "@/app/lib/lucide-icons";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner@2.0.3";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { IncidentDetailsDialog } from "../dialogs/IncidentDetailsDialog";
import { LegalInvolvementDialog, LegalInvolvementRecord } from "../dialogs/LegalInvolvementDialog";
import { DCFSInvolvementDialog, DCFSInvolvementRecord } from "../dialogs/DCFSInvolvementDialog";
import { MedicationsTabContent } from "./MedicationsTabContent";
import { MedicationsSection } from "./MedicationsSection";
import { PsychosocialFactorsSection } from "./PsychosocialFactorsSection";
import { RiskFactorsSection } from "./RiskFactorsSection";
import { BiologicalHistorySection } from "./BiologicalHistorySection";
import { SocialHistorySection } from "./SocialHistorySection";
import { FamilyHistorySection } from "./FamilyHistorySection";
import { LegalHistorySection } from "./LegalHistorySection";
import { PhysicalHealthSection } from "./PhysicalHealthSection";
import { MentalHealthSection } from "./MentalHealthSection";
import { MentalStatusExamSection } from "./MentalStatusExamSection";
import { SubstanceUseSection } from "./SubstanceUseSection";
import { RecommendationsSection } from "./RecommendationsSection";
import { ConstituentDetailsSection } from "./ConstituentDetailsSection";
import { CPIEligibilitySection } from "./CPIEligibilitySection";
import { RelationshipsSection } from "./RelationshipsSection";
import { ConnectionsSection } from "./ConnectionsSection";
import { DocumentsSection } from "./DocumentsSection";
import { ContactLogDialogSLDS } from "../ContactLogDialogSLDS";
import { CreateInfoSessionDialog } from "./CreateInfoSessionDialog";
import { CreateClinicalAssessmentDialog } from "./CreateClinicalAssessmentDialog";
import { CreateAdmissionsShadowDialog } from "./CreateAdmissionsShadowDialog";
import { CreateFamilyPartnershipMeetingDialog } from "./CreateFamilyPartnershipMeetingDialog";
import { ClinicalAssessmentsView } from "./ClinicalAssessmentsView";
import { EducationCareerView } from "./EducationCareerView";
import { DeterminationView } from "./DeterminationView";
import { TreatmentPlanningView } from "./TreatmentPlanningView";
import { NeedsTabContent } from "./NeedsTabContent";
import { RichTextEditor } from "../ui/rich-text-editor";
import { StageProgressData } from "./StageProgressData";
import { SubstanceUseTestingModals } from "./SubstanceUseTestingModals";
import { AdditionalDocumentation } from "./AdditionalDocumentation";
import { ActivityTimeline, TimelineActivity } from "../ActivityTimeline";
import { CaseyLifeSkillsCaregiverFields } from "./CaseyLifeSkillsCaregiverFields";
import { CaseyLifeSkillsYouthFields } from "./CaseyLifeSkillsYouthFields";
import { MultiSelect } from "../ui/multi-select";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";


interface LeadDetailTestingDialogProps {
  lead: any;
  actDocuments: any;
  actFormData: any;
  actFormErrors: any;
  asebaAbclDocuments: any;
  asebaAbclFormData: any;
  asebaAsrFormData: any;
  asebaCbclFormData: any;
  asebaYsrFormData: any;
  calculateKbit2Difference: any;
  calculateKbit2Significance: any;
  caseyLifeSkillsDocuments: any;
  caseyLifeSkillsFormData: any;
  caseyLifeSkillsFormErrors: any;
  caseyLifeSkillsYouthDocuments: any;
  caseyLifeSkillsYouthFormData: any;
  caseyLifeSkillsYouthFormErrors: any;
  editingTestingId: any;
  /** C-SSRS Screener editing (string id) and its date error. */
  editingCssrsId?: string | null;
  cssrsDateError?: string;
  employabilityDocuments: any;
  employabilityFormData: any;
  exploreDocuments: any;
  exploreFormData: any;
  exploreFormErrors: any;
  formatFileSize: any;
  gainDocuments: any;
  gainFileInputRef: any;
  gainFormData: any;
  gainFormErrors: any;
  gedOfficialDocuments: any;
  gedOfficialFileInputRef: any;
  gedOfficialFormData: any;
  gedOfficialFormErrors: any;
  gedReadyDocuments: any;
  gedReadyFileInputRef: any;
  gedReadyFormData: any;
  gedReadyFormErrors: any;
  handleActFileSelect: any;
  handleActRemoveDocument: any;
  handleActScoreChange: any;
  handleAsebaAbclFileSelect: any;
  handleAsebaAbclRemoveDocument: any;
  handleCancelTesting: any;
  handleCaseyLifeSkillsFileChange: any;
  handleCaseyLifeSkillsYouthFileChange: any;
  handleEmployabilityFileSelect: any;
  handleEmployabilityRemoveDocument: any;
  handleExploreFileSelect: any;
  handleExploreRemoveDocument: any;
  handleExploreScoreChange: any;
  handleGainFileChange: any;
  handleGainRemoveDocument: any;
  handleGainScoreChange: any;
  handleGedOfficialFileChange: any;
  handleGedOfficialRemoveDocument: any;
  handleGedOfficialScoreChange: any;
  handleGedReadyFileChange: any;
  handleGedReadyRemoveDocument: any;
  handleGedReadyScoreChange: any;
  handleKbit2FileSelect: any;
  handleKbit2RemoveDocument: any;
  handleKbit2ScoreChange: any;
  handleMaciFileSelect: any;
  handleMaciRemoveDocument: any;
  handleMcmiFileSelect: any;
  handleMcmiRemoveDocument: any;
  handleMpaciFileSelect: any;
  handleMpaciRemoveDocument: any;
  handlePlanFileSelect: any;
  handlePlanRemoveDocument: any;
  handlePlanScoreChange: any;
  handleRemoveCaseyLifeSkillsDocument: any;
  handleRemoveCaseyLifeSkillsYouthDocument: any;
  handleSatDocumentDelete: any;
  handleSatDocumentDownload: any;
  handleSatDocumentView: any;
  handleSatDragOver: any;
  handleSatDrop: any;
  handleSatFileSelect: any;
  handleSatScoreChange: any;
  handleSaveTesting: any;
  handleSsmFileSelect: any;
  handleSsmRemoveDocument: any;
  handleWj4AgeEquivalencyChange: any;
  handleWj4GradeEquivalencyChange: any;
  handleWj4GradePercentileChange: any;
  handleWj4GradeRPIChange: any;
  handleWj4PercentileChange: any;
  handleWj4RPIChange: any;
  kbit2Documents: any;
  kbit2FormData: any;
  kbit2FormErrors: any;
  maciDocuments: any;
  maciFormData: any;
  mcmi3Documents: any;
  mcmi3FormData: any;
  mcmiDocuments: any;
  mcmiFormData: any;
  mpaciDocuments: any;
  mpaciFormData: any;
  planDocuments: any;
  planFormData: any;
  planFormErrors: any;
  satDocuments: any;
  satFileInputRef: any;
  satFormData: any;
  satFormErrors: any;
  setActFormData: any;
  setAsebaAbclFormData: any;
  setAsebaAsrFormData: any;
  setAsebaCbclFormData: any;
  setAsebaYsrFormData: any;
  setCaseyLifeSkillsFormData: any;
  setCaseyLifeSkillsYouthFormData: any;
  setEmployabilityFormData: any;
  setExploreFormData: any;
  setGainFormData: any;
  setGedOfficialFormData: any;
  setGedReadyFormData: any;
  setKbit2FormData: any;
  setMaciFormData: any;
  setMcmi3Documents: any;
  setMcmi3FormData: any;
  setMcmiFormData: any;
  setMpaciFormData: any;
  setPlanFormData: any;
  setSatFormData: any;
  setSsmFormData: any;
  setTestingDialogOpen: any;
  setTestingFormData: any;
  setWj4FormData: any;
  setWj4GradeFormData: any;
  ssmDocuments: any;
  ssmFormData: any;
  testingAssessments: any;
  testingDialogOpen: any;
  testingFormData: any;
  wj4FormData: any;
  wj4FormErrors: any;
  wj4GradeFormData: any;
  wj4GradeFormErrors: any;
}

export function LeadDetailTestingDialogBodyA(props: LeadDetailTestingDialogProps) {
  const { lead, actDocuments, actFormData, actFormErrors, asebaAbclDocuments, asebaAbclFormData, asebaAsrFormData, asebaCbclFormData, asebaYsrFormData, calculateKbit2Difference, calculateKbit2Significance, caseyLifeSkillsDocuments, caseyLifeSkillsFormData, caseyLifeSkillsFormErrors, caseyLifeSkillsYouthDocuments, caseyLifeSkillsYouthFormData, caseyLifeSkillsYouthFormErrors, editingTestingId, employabilityDocuments, employabilityFormData, exploreDocuments, exploreFormData, exploreFormErrors, formatFileSize, gainDocuments, gainFileInputRef, gainFormData, gainFormErrors, gedOfficialDocuments, gedOfficialFileInputRef, gedOfficialFormData, gedOfficialFormErrors, gedReadyDocuments, gedReadyFileInputRef, gedReadyFormData, gedReadyFormErrors, handleActFileSelect, handleActRemoveDocument, handleActScoreChange, handleAsebaAbclFileSelect, handleAsebaAbclRemoveDocument, handleCancelTesting, handleCaseyLifeSkillsFileChange, handleCaseyLifeSkillsYouthFileChange, handleEmployabilityFileSelect, handleEmployabilityRemoveDocument, handleExploreFileSelect, handleExploreRemoveDocument, handleExploreScoreChange, handleGainFileChange, handleGainRemoveDocument, handleGainScoreChange, handleGedOfficialFileChange, handleGedOfficialRemoveDocument, handleGedOfficialScoreChange, handleGedReadyFileChange, handleGedReadyRemoveDocument, handleGedReadyScoreChange, handleKbit2FileSelect, handleKbit2RemoveDocument, handleKbit2ScoreChange, handleMaciFileSelect, handleMaciRemoveDocument, handleMcmiFileSelect, handleMcmiRemoveDocument, handleMpaciFileSelect, handleMpaciRemoveDocument, handlePlanFileSelect, handlePlanRemoveDocument, handlePlanScoreChange, handleRemoveCaseyLifeSkillsDocument, handleRemoveCaseyLifeSkillsYouthDocument, handleSatDocumentDelete, handleSatDocumentDownload, handleSatDocumentView, handleSatDragOver, handleSatDrop, handleSatFileSelect, handleSatScoreChange, handleSaveTesting, handleSsmFileSelect, handleSsmRemoveDocument, handleWj4AgeEquivalencyChange, handleWj4GradeEquivalencyChange, handleWj4GradePercentileChange, handleWj4GradeRPIChange, handleWj4PercentileChange, handleWj4RPIChange, kbit2Documents, kbit2FormData, kbit2FormErrors, maciDocuments, maciFormData, mcmi3Documents, mcmi3FormData, mcmiDocuments, mcmiFormData, mpaciDocuments, mpaciFormData, planDocuments, planFormData, planFormErrors, satDocuments, satFileInputRef, satFormData, satFormErrors, setActFormData, setAsebaAbclFormData, setAsebaAsrFormData, setAsebaCbclFormData, setAsebaYsrFormData, setCaseyLifeSkillsFormData, setCaseyLifeSkillsYouthFormData, setEmployabilityFormData, setExploreFormData, setGainFormData, setGedOfficialFormData, setGedReadyFormData, setKbit2FormData, setMaciFormData, setMcmi3Documents, setMcmi3FormData, setMcmiFormData, setMpaciFormData, setPlanFormData, setSatFormData, setSsmFormData, setTestingDialogOpen, setTestingFormData, setWj4FormData, setWj4GradeFormData, ssmDocuments, ssmFormData, testingAssessments, testingDialogOpen, testingFormData, wj4FormData, wj4FormErrors, wj4GradeFormData, wj4GradeFormErrors } = props;
  // Community Care Member profile: Self Sufficiency Matrix has no Rater Type.
  const hideSsmRaterType =
    testingFormData.test === "Self Sufficiency Matrix v2" &&
    (lead as any)?.constituentType === "Individual" &&
    (lead as any)?.role === "Community Care Member";
  // Community Care directory: tests can be recorded for several members.
  const memberOptions: string[] | undefined = (lead as any)?.communityCareMemberOptions;
  return (
    <>
                        {memberOptions && (
                          <div className="space-y-1.5 mb-4">
                            <FieldLabel required htmlFor="test-members">Members</FieldLabel>
                            <MultiSelect
                              id="test-members"
                              aria-label="Members"
                              options={memberOptions}
                              placeholder="Please Select"
                              value={(testingFormData as any).members ?? []}
                              onValueChange={(members) => setTestingFormData({ ...testingFormData, members } as any)}
                            />
                          </div>
                        )}
                        {/* Date and Test share one row; they stack below the sm breakpoint */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="test-date" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                Date <span className="text-red-600">*</span>
                            </Label>
                            <DateInput
                                id="test-date"
value={isoToMdy(testingFormData.date)}
                                onChange={(v) => ((e) => setTestingFormData({ ...testingFormData, date: e.target.value }))({ target: { value: mdyToIso(v) } })}
                                aria-invalid={props.cssrsDateError ? true : undefined}
                                aria-describedby={props.cssrsDateError ? "test-date-error" : undefined}
                            />
                            <FieldError id="test-date-error">{props.cssrsDateError}</FieldError>
                        </div>
                        <div>
                            <Label htmlFor="test-type" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                Test <span className="text-red-600">*</span>
                            </Label>
                            {/*
                             * PERMANENT FIX — DO NOT REVERT TO RADIX SELECT:
                             * Radix <Select> portals its content to document.body. When inside a Radix
                             * <Dialog modal={true}> (the default), pointer-events restrictions applied
                             * by the Dialog's modal layer block the portalled dropdown from receiving
                             * clicks, making it appear as if the dropdown never opens. This has recurred
                             * multiple times. The fix is a native <select> element — it renders inline
                             * with no portal, no z-index conflict, and no modal interference.
                             */}
                            <div className="relative">
                                <select
                                    id="test-type"
                                    value={testingFormData.test}
                                    disabled={!!props.editingCssrsId}
                                    onChange={(e) => {
                                        const newTest = e.target.value;
                                        if (newTest === "ASEBA - ASR") {
                                            // Set default values for ASR
                                            setTestingFormData({ 
                                                ...testingFormData, 
                                                test: newTest,
                                                raterType: "Youth", // Default to constituent's role
                                                rater: lead.name // Default to constituent's record
                                            });
                                        } else if (newTest === "ASEBA - YSR") {
                                            // Set default values for YSR
                                            setTestingFormData({ 
                                                ...testingFormData, 
                                                test: newTest,
                                                raterType: "Youth", // Default to constituent's role
                                                rater: lead.name // Default to constituent's record
                                            });
                                        } else if (newTest === "KBIT-2") {
                                            // Set default values for KBIT-2
                                            setTestingFormData({ 
                                                ...testingFormData, 
                                                test: newTest,
                                                raterType: "Youth", // Default to constituent's role
                                                rater: lead.name // Default to constituent's record
                                            });
                                        } else if (newTest === "M-PACI") {
                                            // Set default values for M-PACI
                                            setTestingFormData({ 
                                                ...testingFormData, 
                                                test: newTest,
                                                raterType: "Youth", // Default to constituent's role
                                                rater: lead.name // Default to constituent's record
                                            });
                                        } else if (newTest === "MACI") {
                                            // Set default values for MACI
                                            setTestingFormData({ 
                                                ...testingFormData, 
                                                test: newTest,
                                                raterType: "Youth", // Default to constituent's role
                                                rater: lead.name // Default to constituent's record
                                            });
                                        } else if (newTest === "MCMI-III") {
                                            // Set default values for MCMI-III
                                            setTestingFormData({ 
                                                ...testingFormData, 
                                                test: newTest,
                                                raterType: "Youth", // Default to constituent's role
                                                rater: lead.name // Default to constituent's record
                                            });
                                        } else if (newTest === "MCMI-IV") {
                                            // Set default values for MCMI-IV
                                            setTestingFormData({ 
                                                ...testingFormData, 
                                                test: newTest,
                                                raterType: "Youth", // Default to constituent's role
                                                rater: lead.name // Default to constituent's record
                                            });
                                        } else if (newTest === "Self Sufficiency Matrix v2") {
                                            // Set default values for Self Sufficiency Matrix v2
                                            setTestingFormData({ 
                                                ...testingFormData, 
                                                test: newTest,
                                                raterType: "Youth", // Default to constituent's role
                                                rater: lead.name // Default to constituent's record
                                            });
                                        } else if (newTest === "Casey Life Skills") {
                                            // Set default values for Casey Life Skills (Youth)
                                            setTestingFormData({ 
                                                ...testingFormData, 
                                                test: newTest,
                                                raterType: "Youth", // Default to Youth, non-editable
                                                rater: lead.name // Default to Youth's record, non-editable
                                            });
                                        } else if (newTest === "Casey Life Skills - Caregiver") {
                                            // Set default values for Casey Life Skills - Caregiver
                                            setTestingFormData({ 
                                                ...testingFormData, 
                                                test: newTest,
                                                raterType: "", // Default to null (empty string)
                                                rater: "" // Default to null (empty string)
                                            });
                                        } else {
                                            setTestingFormData({ ...testingFormData, test: newTest });
                                        }
                                    }}
                                    style={{
                                        height: '36px',
                                        width: '100%',
                                        paddingLeft: '12px',
                                        paddingRight: '32px',
                                        fontSize: '13px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        color: testingFormData.test ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'none',
                                        outline: 'none',
                                        cursor: 'pointer',
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = '#145F33';
                                        e.currentTarget.style.boxShadow = '0 0 0 1px #145F33';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <option value="" disabled>Select a test</option>
                                    {/* Community Care page: Self Sufficiency Matrix v2 only. */}
                                    {(lead as any)?.communityCareSsmOnly ? (
                                        <option value="Self Sufficiency Matrix v2">Self Sufficiency Matrix v2</option>
                                    ) : (<>
                                    <option value="ACEs">ACEs</option>
                                    <option value="ACT">ACT</option>
                                    <option value="ASEBA - ABCL">ASEBA - ABCL</option>
                                    <option value="ASEBA - ASR">ASEBA - ASR</option>
                                    <option value="ASEBA - CBCL">ASEBA - CBCL</option>
                                    <option value="ASEBA - TRF">ASEBA - TRF</option>
                                    <option value="ASEBA - YSR">ASEBA - YSR</option>
                                    {/* A saved C-SSRS Screener keeps its type; a legacy test being edited can't become one. */}
                                    <option value="C-SSRS Full-Lifetime" disabled={editingTestingId !== null && editingTestingId !== undefined && !props.editingCssrsId}>C-SSRS Full-Lifetime</option>
                                    <option value="C-SSRS Screener" disabled={editingTestingId !== null && editingTestingId !== undefined && !props.editingCssrsId}>C-SSRS Screener</option>
                                    <option value="Casey Life Skills">Casey Life Skills</option>
                                    <option value="Casey Life Skills - Caregiver">Casey Life Skills - Caregiver</option>
                                    <option value="Employability and Life Skills Assessment">Employability and Life Skills Assessment</option>
                                    <option value="EXPLORE">EXPLORE</option>
                                    <option value="GAIN">GAIN</option>
                                    <option value="GAIN-SS">GAIN-SS</option>
                                    <option value="GED Official">GED Official</option>
                                    <option value="GED Ready">GED Ready</option>
                                    <option value="KBIT-2">KBIT-2</option>
                                    <option value="M-PACI">M-PACI</option>
                                    <option value="MACI">MACI</option>
                                    <option value="MCMI-III">MCMI-III</option>
                                    <option value="MCMI-IV">MCMI-IV</option>
                                    <option value="PHQ-9">PHQ-9</option>
                                    <option value="PLAN">PLAN</option>
                                    <option value="SAT">SAT</option>
                                    <option value="Self Sufficiency Matrix v2">Self Sufficiency Matrix v2</option>
                                    <option value="WAIS-IV">WAIS-IV</option>
                                    <option value="WISC-V">WISC-V</option>
                                    <option value="WJ-4">WJ-4</option>
                                    <option value="WJ-4 (Grade)">WJ-4 (Grade)</option>
                                    </>)}
                                </select>
                                {/* Decorative chevron — pointer-events:none so it never blocks clicks */}
                                <svg
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '14px',
                                        height: '14px',
                                        color: 'var(--slds-g-color-text-weak)',
                                        pointerEvents: 'none',
                                    }}
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                        </div>
                        </div>

                        {/* Rater Type - Show for all ASEBA tests, KBIT-2, M-PACI, MACI, MCMI-III, MCMI-IV, Self Sufficiency Matrix v2, and Casey Life Skills */}
                        {testingFormData.test && (testingFormData.test.startsWith("ASEBA") || testingFormData.test === "KBIT-2" || testingFormData.test === "M-PACI" || testingFormData.test === "MACI" || testingFormData.test === "MCMI-III" || testingFormData.test === "MCMI-IV" || testingFormData.test === "Self Sufficiency Matrix v2" || testingFormData.test === "Casey Life Skills") && (
                            <>
                                {!hideSsmRaterType && (<>
                                <div>
                                    <Label htmlFor="rater-type" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Rater Type <span className="text-red-600">*</span>
                                    </Label>
                                    <div className="relative max-w-xs">
                                        <select
                                            id="rater-type"
                                            value={testingFormData.raterType}
                                            onChange={(e) => setTestingFormData({ ...testingFormData, raterType: e.target.value, raterTypeOther: e.target.value !== "Other" ? "" : testingFormData.raterTypeOther })}
                                            disabled={testingFormData.test === "ASEBA - ASR" || testingFormData.test === "ASEBA - YSR" || testingFormData.test === "KBIT-2" || testingFormData.test === "M-PACI" || testingFormData.test === "MACI" || testingFormData.test === "MCMI-III" || testingFormData.test === "MCMI-IV" || testingFormData.test === "Self Sufficiency Matrix v2" || testingFormData.test === "Casey Life Skills"}
                                            style={{
                                                height: '36px',
                                                width: '100%',
                                                paddingLeft: '12px',
                                                paddingRight: '32px',
                                                fontSize: '13px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: (testingFormData.test === "ASEBA - ASR" || testingFormData.test === "ASEBA - YSR" || testingFormData.test === "KBIT-2" || testingFormData.test === "M-PACI" || testingFormData.test === "MACI" || testingFormData.test === "MCMI-III" || testingFormData.test === "MCMI-IV" || testingFormData.test === "Self Sufficiency Matrix v2" || testingFormData.test === "Casey Life Skills") ? 'var(--slds-g-color-background-alt)' : 'var(--slds-g-color-background-base)',
                                                color: testingFormData.raterType ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
                                                appearance: 'none',
                                                WebkitAppearance: 'none',
                                                MozAppearance: 'none',
                                                outline: 'none',
                                                cursor: testingFormData.test === "ASEBA - ASR" ? 'not-allowed' : 'pointer',
                                            }}
                                            onFocus={(e) => {
                                                if (testingFormData.test !== "ASEBA - ASR") {
                                                    e.currentTarget.style.borderColor = '#145F33';
                                                    e.currentTarget.style.boxShadow = '0 0 0 1px #145F33';
                                                }
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-1)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <option value="">Select rater type</option>
                                            <option value="Youth">Youth</option>
                                            <option value="Parent/Guardian">Parent/Guardian</option>
                                            <option value="Therapist">Therapist</option>
                                            <option value="Advocate">Advocate</option>
                                            <option value="School Personnel">School Personnel</option>
                                            <option value="Other">Other</option>
                                            <option value="Ridgeland">Ridgeland</option>
                                            <option value="Community Care">Community Care</option>
                                            <option value="Supervisor">Supervisor</option>
                                            <option value="Coordinator – PSOCR">Coordinator – PSOCR</option>
                                        </select>
                                        <svg
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                width: '14px',
                                                height: '14px',
                                                color: 'var(--slds-g-color-text-weak)',
                                                pointerEvents: 'none',
                                            }}
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Other Rater Type - Conditional */}
                                {testingFormData.raterType === "Other" && (
                                    <div>
                                        <Label htmlFor="rater-type-other" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Other <span className="text-red-600">*</span>
                                        </Label>
                                        <Input
                                            id="rater-type-other"
                                            type="text"
                                            value={testingFormData.raterTypeOther}
                                            onChange={(e) => setTestingFormData({ ...testingFormData, raterTypeOther: e.target.value })}
                                            placeholder="Specify rater type..."
                                            className="h-9 text-[13px] rounded"
                                            style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                        />
                                    </div>
                                )}

                                </>)}

                                {/* Rater - Lookup field (simplified as text input for now) */}
                                <div>
                                    <Label htmlFor="rater" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Rater <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        id="rater"
                                        type="text"
                                        value={testingFormData.rater}
                                        onChange={(e) => setTestingFormData({ ...testingFormData, rater: e.target.value })}
                                        placeholder="Enter rater name..."
                                        disabled={testingFormData.test === "ASEBA - ASR" || testingFormData.test === "ASEBA - YSR" || testingFormData.test === "KBIT-2" || testingFormData.test === "M-PACI" || testingFormData.test === "MACI" || testingFormData.test === "MCMI-III" || testingFormData.test === "MCMI-IV" || testingFormData.test === "Self Sufficiency Matrix v2" || testingFormData.test === "Casey Life Skills"}
                                        className="h-9 text-[13px] rounded"
                                        style={{ 
                                            backgroundColor: (testingFormData.test === "ASEBA - ASR" || testingFormData.test === "ASEBA - YSR" || testingFormData.test === "KBIT-2" || testingFormData.test === "M-PACI" || testingFormData.test === "MACI" || testingFormData.test === "MCMI-III" || testingFormData.test === "MCMI-IV" || testingFormData.test === "Self Sufficiency Matrix v2" || testingFormData.test === "Casey Life Skills") ? 'var(--slds-g-color-background-alt)' : 'var(--slds-g-color-background-base)', 
                                            border: '1px solid var(--slds-g-color-border-base-1)', 
                                            color: 'var(--slds-g-color-text-default)',
                                            cursor: (testingFormData.test === "ASEBA - ASR" || testingFormData.test === "ASEBA - YSR" || testingFormData.test === "KBIT-2" || testingFormData.test === "M-PACI" || testingFormData.test === "MACI" || testingFormData.test === "MCMI-III" || testingFormData.test === "MCMI-IV" || testingFormData.test === "Self Sufficiency Matrix v2" || testingFormData.test === "Casey Life Skills") ? 'not-allowed' : 'text'
                                        }}
                                    />
                                </div>
                            </>
                        )}

                        {/* ASEBA - ABCL Specific Fields */}
                        {testingFormData.test === "ASEBA - ABCL" && (
                            <div className="space-y-6 mt-6">
                                {/* Adaptive Functioning Scale T Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        Adaptive Functioning Scale T Scores
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="friends" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Friends
                                            </Label>
                                            <Input
                                                id="friends"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.friends}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, friends: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="spousePartner" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Spouse/Partner
                                            </Label>
                                            <Input
                                                id="spousePartner"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.spousePartner}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, spousePartner: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="personalStrengths" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Personal Strengths
                                            </Label>
                                            <Input
                                                id="personalStrengths"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.personalStrengths}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, personalStrengths: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Syndrome Scale T Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        Syndrome Scale T Scores
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="anxiousDepressed" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Anxious/Depressed
                                            </Label>
                                            <Input
                                                id="anxiousDepressed"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.anxiousDepressed}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, anxiousDepressed: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="withdrawn" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Withdrawn
                                            </Label>
                                            <Input
                                                id="withdrawn"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.withdrawn}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, withdrawn: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="somaticComplaints" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Somatic Complaints
                                            </Label>
                                            <Input
                                                id="somaticComplaints"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.somaticComplaints}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, somaticComplaints: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="thoughtProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Thought Problems
                                            </Label>
                                            <Input
                                                id="thoughtProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.thoughtProblems}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, thoughtProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="attentionProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Attention Problems
                                            </Label>
                                            <Input
                                                id="attentionProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.attentionProblems}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, attentionProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="aggressiveBehavior" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Aggressive Behavior
                                            </Label>
                                            <Input
                                                id="aggressiveBehavior"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.aggressiveBehavior}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, aggressiveBehavior: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="ruleBreakingBehavior" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Rule-Breaking Behavior
                                            </Label>
                                            <Input
                                                id="ruleBreakingBehavior"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.ruleBreakingBehavior}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, ruleBreakingBehavior: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="intrusive" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Intrusive
                                            </Label>
                                            <Input
                                                id="intrusive"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.intrusive}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, intrusive: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Internalizing, Externalizing, Total Problems, Critical Items T Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        Internalizing, Externalizing, Total Problems, Critical Items T Scores
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="internalizingProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Internalizing Problems
                                            </Label>
                                            <Input
                                                id="internalizingProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.internalizingProblems}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, internalizingProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="externalizingProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Externalizing Problems
                                            </Label>
                                            <Input
                                                id="externalizingProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.externalizingProblems}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, externalizingProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="totalProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Total Problems
                                            </Label>
                                            <Input
                                                id="totalProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.totalProblems}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, totalProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="clinicalItems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Clinical Items
                                            </Label>
                                            <Input
                                                id="clinicalItems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.clinicalItems}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, clinicalItems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Substance Use T Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        Substance Use T Scores
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="tobaccoTimesPerDay" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Tobacco Times Per Day
                                            </Label>
                                            <Input
                                                id="tobaccoTimesPerDay"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.tobaccoTimesPerDay}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, tobaccoTimesPerDay: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="alcoholDaysDrunk" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Alcohol Days Drunk
                                            </Label>
                                            <Input
                                                id="alcoholDaysDrunk"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.alcoholDaysDrunk}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, alcoholDaysDrunk: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="drugsDaysUsed" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Drugs Days Used
                                            </Label>
                                            <Input
                                                id="drugsDaysUsed"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.drugsDaysUsed}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, drugsDaysUsed: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="meanSubstanceUse" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Mean Substance Use
                                            </Label>
                                            <Input
                                                id="meanSubstanceUse"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.meanSubstanceUse}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, meanSubstanceUse: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* DSM Oriented Scales T Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        DSM Oriented Scales T Scores
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="depressiveProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Depressive Problems
                                            </Label>
                                            <Input
                                                id="depressiveProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.depressiveProblems}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, depressiveProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="anxietyProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Anxiety Problems
                                            </Label>
                                            <Input
                                                id="anxietyProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.anxietyProblems}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, anxietyProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="somaticProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Somatic Problems
                                            </Label>
                                            <Input
                                                id="somaticProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.somaticProblems}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, somaticProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="avoidantPersonality" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Avoidant Personality
                                            </Label>
                                            <Input
                                                id="avoidantPersonality"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.avoidantPersonality}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, avoidantPersonality: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="adHProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                AD/H Problems
                                            </Label>
                                            <Input
                                                id="adHProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.adHProblems}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, adHProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="antisocialPersonality" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Antisocial Personality
                                            </Label>
                                            <Input
                                                id="antisocialPersonality"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.antisocialPersonality}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, antisocialPersonality: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="attentionProblemsInattention" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Attention Problems Inattention
                                            </Label>
                                            <Input
                                                id="attentionProblemsInattention"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.attentionProblemsInattention}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, attentionProblemsInattention: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="attentionProblemsHyperactivity" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Attention Problems Hyperactivity-Impulsivity
                                            </Label>
                                            <Input
                                                id="attentionProblemsHyperactivity"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.attentionProblemsHyperactivity}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, attentionProblemsHyperactivity: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 2014 Scale T Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        2014 Scale T Scores
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="sluggishCognitiveTempo" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Sluggish Cognitive Tempo
                                            </Label>
                                            <Input
                                                id="sluggishCognitiveTempo"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.sluggishCognitiveTempo}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, sluggishCognitiveTempo: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="obsessiveCompulsiveProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Obsessive-Compulsive Problems
                                            </Label>
                                            <Input
                                                id="obsessiveCompulsiveProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAbclFormData.obsessiveCompulsiveProblems}
                                                onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, obsessiveCompulsiveProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Commentary */}
                                <div>
                                    <Label htmlFor="asebaAbclCommentary" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Commentary
                                    </Label>
                                    <Textarea
                                        id="asebaAbclCommentary"
                                        value={asebaAbclFormData.commentary}
                                        onChange={(e) => setAsebaAbclFormData({ ...asebaAbclFormData, commentary: e.target.value })}
                                        placeholder="Enter any additional notes or commentary..."
                                        className="text-[13px] rounded min-h-[100px]"
                                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                    />
                                </div>

                                {/* Document Upload */}
                                <div>
                                    <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Document
                                    </Label>
                                    <div
                                        className="border-2 border-dashed rounded p-6 text-center"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}
                                    >
                                        <Upload className="mx-auto h-8 w-8 mb-2" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                        <p className="text-[13px] mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            Drag and drop test report here, or click to browse
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-8 px-4 rounded-full text-[12px]"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                document.getElementById('aseba-abcl-file-input')?.click();
                                            }}
                                        >
                                            Choose File
                                        </Button>
                                        <input
                                            id="aseba-abcl-file-input"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            multiple
                                            onChange={handleAsebaAbclFileSelect}
                                        />
                                    </div>

                                    {/* Uploaded Documents List */}
                                    {asebaAbclDocuments.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <Label className="block text-[12px] font-semibold uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Uploaded Documents ({asebaAbclDocuments.length})
                                            </Label>
                                            <div 
                                                className="border rounded overflow-hidden"
                                                style={{ 
                                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                                }}
                                            >
                                                {asebaAbclDocuments.map((doc, index) => (
                                                    <div 
                                                        key={doc.id}
                                                        className="flex items-center justify-between p-3"
                                                        style={{ 
                                                            borderBottom: index < asebaAbclDocuments.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none'
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <FileText className="h-5 w-5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                            <div className="flex-1">
                                                                <p className="text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {doc.name}
                                                                </p>
                                                                <p className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                    {(doc.size / 1024).toFixed(2)} KB • {doc.uploadedDate}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleAsebaAbclRemoveDocument(doc.id)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <XIcon className="h-4 w-4" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ASEBA - ASR Specific Fields */}
                        {testingFormData.test === "ASEBA - ASR" && (
                            <div className="space-y-6 mt-6">
                                {/* Examiner Field */}
                                <div>
                                    <Label htmlFor="asr-examiner" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Examiner
                                    </Label>
                                    <div className="relative max-w-xs">
                                        <select
                                            id="asr-examiner"
                                            value={asebaAsrFormData.examiner}
                                            onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, examiner: e.target.value, examinerOther: e.target.value !== "Other" ? "" : asebaAsrFormData.examinerOther })}
                                            style={{
                                                height: '36px',
                                                width: '100%',
                                                paddingLeft: '12px',
                                                paddingRight: '32px',
                                                fontSize: '13px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                color: asebaAsrFormData.examiner ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
                                                appearance: 'none',
                                                WebkitAppearance: 'none',
                                                MozAppearance: 'none',
                                                outline: 'none',
                                                cursor: 'pointer',
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = '#145F33';
                                                e.currentTarget.style.boxShadow = '0 0 0 1px #145F33';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-1)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <option value="">Select examiner</option>
                                            <option value="John Smith">John Smith</option>
                                            <option value="Jane Doe">Jane Doe</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <svg
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                width: '14px',
                                                height: '14px',
                                                color: 'var(--slds-g-color-text-weak)',
                                                pointerEvents: 'none',
                                            }}
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Other Examiner - Conditional */}
                                {asebaAsrFormData.examiner === "Other" && (
                                    <div>
                                        <Label htmlFor="examiner-other" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Other <span className="text-red-600">*</span>
                                        </Label>
                                        <Input
                                            id="examiner-other"
                                            type="text"
                                            value={asebaAsrFormData.examinerOther}
                                            onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, examinerOther: e.target.value })}
                                            placeholder="Specify examiner..."
                                            className="h-9 text-[13px] rounded"
                                            style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                        />
                                    </div>
                                )}

                                {/* Adaptive Functioning Scale T Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        Adaptive Functioning Scale T Scores
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="asr-friends" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Friends
                                            </Label>
                                            <Input
                                                id="asr-friends"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.friends}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, friends: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-spousePartner" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Spouse/Partner
                                            </Label>
                                            <Input
                                                id="asr-spousePartner"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.spousePartner}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, spousePartner: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-family" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Family
                                            </Label>
                                            <Input
                                                id="asr-family"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.family}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, family: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-job" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Job
                                            </Label>
                                            <Input
                                                id="asr-job"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.job}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, job: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-education" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Education
                                            </Label>
                                            <Input
                                                id="asr-education"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.education}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, education: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-meanAdaptive" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Mean Adaptive
                                            </Label>
                                            <Input
                                                id="asr-meanAdaptive"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.meanAdaptive}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, meanAdaptive: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-personalStrengths" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Personal Strengths
                                            </Label>
                                            <Input
                                                id="asr-personalStrengths"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.personalStrengths}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, personalStrengths: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Syndrome Scale T Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        Syndrome Scale T Scores
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="asr-anxiousDepressed" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Anxious/Depressed
                                            </Label>
                                            <Input
                                                id="asr-anxiousDepressed"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.anxiousDepressed}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, anxiousDepressed: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-withdrawn" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Withdrawn
                                            </Label>
                                            <Input
                                                id="asr-withdrawn"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.withdrawn}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, withdrawn: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-somaticComplaints" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Somatic Complaints
                                            </Label>
                                            <Input
                                                id="asr-somaticComplaints"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.somaticComplaints}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, somaticComplaints: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-thoughtProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Thought Problems
                                            </Label>
                                            <Input
                                                id="asr-thoughtProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.thoughtProblems}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, thoughtProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-attentionProblem" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Attention Problem
                                            </Label>
                                            <Input
                                                id="asr-attentionProblem"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.attentionProblem}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, attentionProblem: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-aggressiveBehavior" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Aggressive Behavior
                                            </Label>
                                            <Input
                                                id="asr-aggressiveBehavior"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.aggressiveBehavior}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, aggressiveBehavior: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-ruleBreakingBehavior" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Rule-Breaking Behavior
                                            </Label>
                                            <Input
                                                id="asr-ruleBreakingBehavior"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.ruleBreakingBehavior}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, ruleBreakingBehavior: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-intrusive" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Intrusive
                                            </Label>
                                            <Input
                                                id="asr-intrusive"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.intrusive}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, intrusive: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Internalizing, Externalizing, Total Problems, Critical Items T Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        Internalizing, Externalizing, Total Problems, Critical Items T Scores
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="asr-internalizingProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Internalizing Problems
                                            </Label>
                                            <Input
                                                id="asr-internalizingProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.internalizingProblems}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, internalizingProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-externalizingProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Externalizing Problems
                                            </Label>
                                            <Input
                                                id="asr-externalizingProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.externalizingProblems}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, externalizingProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-totalProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Total Problems
                                            </Label>
                                            <Input
                                                id="asr-totalProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.totalProblems}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, totalProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-criticalItems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Critical Items
                                            </Label>
                                            <Input
                                                id="asr-criticalItems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.criticalItems}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, criticalItems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Substance Use T Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        Substance Use T Scores
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="asr-tobaccoTimesPerDay" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Tobacco Times Per Day
                                            </Label>
                                            <Input
                                                id="asr-tobaccoTimesPerDay"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.tobaccoTimesPerDay}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, tobaccoTimesPerDay: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-alcoholDaysDrunk" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Alcohol Days Drunk
                                            </Label>
                                            <Input
                                                id="asr-alcoholDaysDrunk"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.alcoholDaysDrunk}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, alcoholDaysDrunk: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-drugsDaysUsed" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Drugs Days Used
                                            </Label>
                                            <Input
                                                id="asr-drugsDaysUsed"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.drugsDaysUsed}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, drugsDaysUsed: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-meanSubstanceUse" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Mean Substance Use
                                            </Label>
                                            <Input
                                                id="asr-meanSubstanceUse"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.meanSubstanceUse}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, meanSubstanceUse: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* DSM Oriented Scales T Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        DSM Oriented Scales T Scores
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="asr-depressiveProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Depressive Problems
                                            </Label>
                                            <Input
                                                id="asr-depressiveProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.depressiveProblems}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, depressiveProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-anxietyProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Anxiety Problems
                                            </Label>
                                            <Input
                                                id="asr-anxietyProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.anxietyProblems}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, anxietyProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-somaticProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Somatic Problems
                                            </Label>
                                            <Input
                                                id="asr-somaticProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.somaticProblems}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, somaticProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-avoidantPersonality" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Avoidant Personality
                                            </Label>
                                            <Input
                                                id="asr-avoidantPersonality"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.avoidantPersonality}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, avoidantPersonality: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-adHProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                AD/H Problems
                                            </Label>
                                            <Input
                                                id="asr-adHProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.adHProblems}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, adHProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-antisocialPersonality" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Antisocial Personality
                                            </Label>
                                            <Input
                                                id="asr-antisocialPersonality"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.antisocialPersonality}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, antisocialPersonality: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-attentionProblemsInattention" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Attention Problems Inattention
                                            </Label>
                                            <Input
                                                id="asr-attentionProblemsInattention"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.attentionProblemsInattention}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, attentionProblemsInattention: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-attentionProblemsHyperactivity" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Attention Problems Hyperactivity-Impulsivity
                                            </Label>
                                            <Input
                                                id="asr-attentionProblemsHyperactivity"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.attentionProblemsHyperactivity}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, attentionProblemsHyperactivity: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 2014 Scale T Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        2014 Scale T Scores
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="asr-sluggishCognitiveTempo" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Sluggish Cognitive Tempo
                                            </Label>
                                            <Input
                                                id="asr-sluggishCognitiveTempo"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.sluggishCognitiveTempo}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, sluggishCognitiveTempo: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="asr-obsessiveCompulsiveProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Obsessive-Compulsive Problems
                                            </Label>
                                            <Input
                                                id="asr-obsessiveCompulsiveProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaAsrFormData.obsessiveCompulsiveProblems}
                                                onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, obsessiveCompulsiveProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Commentary */}
                                <div>
                                    <Label htmlFor="asebaAsrCommentary" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Commentary
                                    </Label>
                                    <Textarea
                                        id="asebaAsrCommentary"
                                        value={asebaAsrFormData.commentary}
                                        onChange={(e) => setAsebaAsrFormData({ ...asebaAsrFormData, commentary: e.target.value })}
                                        placeholder="Enter any additional notes or commentary..."
                                        className="text-[13px] rounded min-h-[100px]"
                                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                    />
                                </div>

                                {/* Document Upload */}
                                <div>
                                    <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Document
                                    </Label>
                                    <div
                                        className="border-2 border-dashed rounded p-6 text-center"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}
                                    >
                                        <Upload className="mx-auto h-8 w-8 mb-2" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                        <p className="text-[13px] mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            Drag and drop test report here, or click to browse
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-8 px-4 rounded-full text-[12px]"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                        >
                                            Choose File
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ASEBA - CBCL Specific Fields */}
                        {testingFormData.test === "ASEBA - CBCL" && (
                            <div className="space-y-6 mt-6">
                                {/* Competence Scale T Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        Competence Scale T Scores
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="activities" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Activities
                                            </Label>
                                            <Input
                                                id="activities"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.activities}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, activities: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="social" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Social
                                            </Label>
                                            <Input
                                                id="social"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.social}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, social: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="school" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                School
                                            </Label>
                                            <Input
                                                id="school"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.school}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, school: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="totalCompetence" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Total Competence
                                            </Label>
                                            <Input
                                                id="totalCompetence"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.totalCompetence}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, totalCompetence: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Syndrome Scale T Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        Syndrome Scale T Scores
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="cbclAnxiousDepressed" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Anxious/Depressed
                                            </Label>
                                            <Input
                                                id="cbclAnxiousDepressed"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.anxiousDepressed}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, anxiousDepressed: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="withdrawnDepressed" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Withdrawn/Depressed
                                            </Label>
                                            <Input
                                                id="withdrawnDepressed"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.withdrawnDepressed}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, withdrawnDepressed: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="cbclSomaticComplaints" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Somatic Complaints
                                            </Label>
                                            <Input
                                                id="cbclSomaticComplaints"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.somaticComplaints}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, somaticComplaints: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="socialProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Social Problems
                                            </Label>
                                            <Input
                                                id="socialProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.socialProblems}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, socialProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="cbclThoughtProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Thought Problems
                                            </Label>
                                            <Input
                                                id="cbclThoughtProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.thoughtProblems}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, thoughtProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="cbclAttentionProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Attention Problems
                                            </Label>
                                            <Input
                                                id="cbclAttentionProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.attentionProblems}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, attentionProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="cbclRuleBreakingBehavior" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Rule-Breaking Behavior
                                            </Label>
                                            <Input
                                                id="cbclRuleBreakingBehavior"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.ruleBreakingBehavior}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, ruleBreakingBehavior: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="cbclAggressiveBehavior" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Aggressive Behavior
                                            </Label>
                                            <Input
                                                id="cbclAggressiveBehavior"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.aggressiveBehavior}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, aggressiveBehavior: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Internalizing, Externalizing, Total Problems, Critical Items T Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        Internalizing, Externalizing, Total Problems, Critical Items T Scores
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="cbclInternalizingProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Internalizing Problems
                                            </Label>
                                            <Input
                                                id="cbclInternalizingProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.internalizingProblems}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, internalizingProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="cbclExternalizingProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Externalizing Problems
                                            </Label>
                                            <Input
                                                id="cbclExternalizingProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.externalizingProblems}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, externalizingProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="cbclTotalProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Total Problems
                                            </Label>
                                            <Input
                                                id="cbclTotalProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.totalProblems}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, totalProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="otherProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Other Problems
                                            </Label>
                                            <Input
                                                id="otherProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.otherProblems}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, otherProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* DSM Oriented Scales T Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        DSM Oriented Scales T Scores
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="cbclDepressiveProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Depressive Problems
                                            </Label>
                                            <Input
                                                id="cbclDepressiveProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.depressiveProblems}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, depressiveProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="cbclAnxietyProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Anxiety Problems
                                            </Label>
                                            <Input
                                                id="cbclAnxietyProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.anxietyProblems}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, anxietyProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="cbclSomaticProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Somatic Problems
                                            </Label>
                                            <Input
                                                id="cbclSomaticProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.somaticProblems}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, somaticProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="attentionDeficitProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Attention Deficit Problems
                                            </Label>
                                            <Input
                                                id="attentionDeficitProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.attentionDeficitProblems}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, attentionDeficitProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="oppositionalDefiantProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Oppositional Defiant Problems
                                            </Label>
                                            <Input
                                                id="oppositionalDefiantProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.oppositionalDefiantProblems}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, oppositionalDefiantProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="conductProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Conduct Problems
                                            </Label>
                                            <Input
                                                id="conductProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.conductProblems}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, conductProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 2007 Scale T Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        2007 Scale T Scores
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="cbclSluggishCognitiveTempo" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Sluggish Cognitive Tempo
                                            </Label>
                                            <Input
                                                id="cbclSluggishCognitiveTempo"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.sluggishCognitiveTempo}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, sluggishCognitiveTempo: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="cbclObsessiveCompulsiveProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Obsessive-Compulsive Problems
                                            </Label>
                                            <Input
                                                id="cbclObsessiveCompulsiveProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.obsessiveCompulsiveProblems}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, obsessiveCompulsiveProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="stressProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Stress Problems
                                            </Label>
                                            <Input
                                                id="stressProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaCbclFormData.stressProblems}
                                                onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, stressProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Commentary */}
                                <div>
                                    <Label htmlFor="asebaCbclCommentary" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Commentary
                                    </Label>
                                    <Textarea
                                        id="asebaCbclCommentary"
                                        value={asebaCbclFormData.commentary}
                                        onChange={(e) => setAsebaCbclFormData({ ...asebaCbclFormData, commentary: e.target.value })}
                                        placeholder="Enter any additional notes or commentary..."
                                        className="text-[13px] rounded min-h-[100px]"
                                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                    />
                                </div>

                                {/* Document Upload */}
                                <div>
                                    <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Document
                                    </Label>
                                    <div
                                        className="border-2 border-dashed rounded p-6 text-center"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}
                                    >
                                        <Upload className="mx-auto h-8 w-8 mb-2" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                        <p className="text-[13px] mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            Drag and drop test report here, or click to browse
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-8 px-4 rounded-full text-[12px]"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                        >
                                            Choose File
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ASEBA - YSR Specific Fields */}
                        {testingFormData.test === "ASEBA - YSR" && (
                            <div className="space-y-6 mt-6">
                                {/* Examiner Field */}
                                <div>
                                    <Label htmlFor="ysr-examiner" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Examiner
                                    </Label>
                                    <div className="relative max-w-xs">
                                        <select
                                            id="ysr-examiner"
                                            value={asebaYsrFormData.examiner}
                                            onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, examiner: e.target.value, examinerOther: "" })}
                                            style={{
                                                height: '36px',
                                                width: '100%',
                                                paddingLeft: '12px',
                                                paddingRight: '32px',
                                                fontSize: '13px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                color: asebaYsrFormData.examiner ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
                                                appearance: 'none',
                                                WebkitAppearance: 'none',
                                                MozAppearance: 'none',
                                                outline: 'none',
                                                cursor: 'pointer',
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = '#145F33';
                                                e.currentTarget.style.boxShadow = '0 0 0 1px #145F33';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--slds-g-color-border-base-1)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <option value="">Select examiner</option>
                                            <option value="Dr. Sarah Williams">Dr. Sarah Williams</option>
                                            <option value="Dr. Michael Chen">Dr. Michael Chen</option>
                                            <option value="Dr. Emily Rodriguez">Dr. Emily Rodriguez</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <svg
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                width: '14px',
                                                height: '14px',
                                                color: 'var(--slds-g-color-text-weak)',
                                                pointerEvents: 'none',
                                            }}
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Conditional Other Examiner Field */}
                                {asebaYsrFormData.examiner === "Other" && (
                                    <div>
                                        <Label htmlFor="ysr-examiner-other" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Other <span className="text-red-600">*</span>
                                        </Label>
                                        <Input
                                            id="ysr-examiner-other"
                                            type="text"
                                            maxLength={50}
                                            value={asebaYsrFormData.examinerOther}
                                            onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, examinerOther: e.target.value })}
                                            placeholder="Specify other examiner"
                                            className="h-9 text-[13px] rounded max-w-xs"
                                            style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                        />
                                    </div>
                                )}

                                {/* Competence Scale T Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        Competence Scale T Scores
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="ysrActivities" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Activities
                                            </Label>
                                            <Input
                                                id="ysrActivities"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.activities}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, activities: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="ysrSocial" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Social
                                            </Label>
                                            <Input
                                                id="ysrSocial"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.social}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, social: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="ysrAcademicPerformance" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Academic Performance
                                            </Label>
                                            <Input
                                                id="ysrAcademicPerformance"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.academicPerformance}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, academicPerformance: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="ysrTotalCompetence" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Total Competence
                                            </Label>
                                            <Input
                                                id="ysrTotalCompetence"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.totalCompetence}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, totalCompetence: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Syndrome Scale T Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        Syndrome Scale T Scores
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="ysrAnxiousDepressed" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Anxious/Depressed
                                            </Label>
                                            <Input
                                                id="ysrAnxiousDepressed"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.anxiousDepressed}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, anxiousDepressed: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="ysrWithdrawnDepressed" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Withdrawn/Depressed
                                            </Label>
                                            <Input
                                                id="ysrWithdrawnDepressed"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.withdrawnDepressed}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, withdrawnDepressed: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="ysrSomaticComplaints" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Somatic Complaints
                                            </Label>
                                            <Input
                                                id="ysrSomaticComplaints"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.somaticComplaints}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, somaticComplaints: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="ysrSocialProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Social Problems
                                            </Label>
                                            <Input
                                                id="ysrSocialProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.socialProblems}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, socialProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="ysrThoughtProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Thought Problems
                                            </Label>
                                            <Input
                                                id="ysrThoughtProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.thoughtProblems}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, thoughtProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="ysrAttentionProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Attention Problems
                                            </Label>
                                            <Input
                                                id="ysrAttentionProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.attentionProblems}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, attentionProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="ysrRuleBreakingBehavior" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Rule-Breaking Behavior
                                            </Label>
                                            <Input
                                                id="ysrRuleBreakingBehavior"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.ruleBreakingBehavior}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, ruleBreakingBehavior: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="ysrAggressiveBehavior" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Aggressive Behavior
                                            </Label>
                                            <Input
                                                id="ysrAggressiveBehavior"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.aggressiveBehavior}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, aggressiveBehavior: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Internalizing, Externalizing, Total Problems, Critical Items T Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        Internalizing, Externalizing, Total Problems, Critical Items T Scores
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="ysrInternalizingProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Internalizing Problems
                                            </Label>
                                            <Input
                                                id="ysrInternalizingProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.internalizingProblems}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, internalizingProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="ysrExternalizingProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Externalizing Problems
                                            </Label>
                                            <Input
                                                id="ysrExternalizingProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.externalizingProblems}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, externalizingProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="ysrTotalProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Total Problems
                                            </Label>
                                            <Input
                                                id="ysrTotalProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.totalProblems}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, totalProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="ysrOtherProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Other Problems
                                            </Label>
                                            <Input
                                                id="ysrOtherProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.otherProblems}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, otherProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* DSM Oriented Scales T Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        DSM Oriented Scales T Scores
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="ysrDepressiveProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Depressive Problems
                                            </Label>
                                            <Input
                                                id="ysrDepressiveProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.depressiveProblems}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, depressiveProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="ysrAnxietyProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Anxiety Problems
                                            </Label>
                                            <Input
                                                id="ysrAnxietyProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.anxietyProblems}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, anxietyProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="ysrSomaticProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Somatic Problems
                                            </Label>
                                            <Input
                                                id="ysrSomaticProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.somaticProblems}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, somaticProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="ysrAttentionDeficitProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Attention Deficit Problems
                                            </Label>
                                            <Input
                                                id="ysrAttentionDeficitProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.attentionDeficitProblems}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, attentionDeficitProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="ysrOppositionalDefiantProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Oppositional Defiant Problems
                                            </Label>
                                            <Input
                                                id="ysrOppositionalDefiantProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.oppositionalDefiantProblems}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, oppositionalDefiantProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="ysrConductProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Conduct Problems
                                            </Label>
                                            <Input
                                                id="ysrConductProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.conductProblems}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, conductProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 2007 Scale T Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        2007 Scale T Scores
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="ysrObsessiveCompulsiveProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Obsessive-Compulsive Problems
                                            </Label>
                                            <Input
                                                id="ysrObsessiveCompulsiveProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.obsessiveCompulsiveProblems}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, obsessiveCompulsiveProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="ysrStressProblems" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Stress Problems
                                            </Label>
                                            <Input
                                                id="ysrStressProblems"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.stressProblems}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, stressProblems: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="ysrPositiveQualities" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Positive Qualities
                                            </Label>
                                            <Input
                                                id="ysrPositiveQualities"
                                                type="text"
                                                maxLength={50}
                                                value={asebaYsrFormData.positiveQualities}
                                                onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, positiveQualities: e.target.value })}
                                                className="h-9 text-[13px] rounded"
                                                style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Commentary */}
                                <div>
                                    <Label htmlFor="asebaYsrCommentary" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Commentary
                                    </Label>
                                    <Textarea
                                        id="asebaYsrCommentary"
                                        value={asebaYsrFormData.commentary}
                                        onChange={(e) => setAsebaYsrFormData({ ...asebaYsrFormData, commentary: e.target.value })}
                                        placeholder="Enter any additional notes or commentary..."
                                        className="text-[13px] rounded min-h-[100px]"
                                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                    />
                                </div>

                                {/* Document Upload */}
                                <div>
                                    <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Document
                                    </Label>
                                    <div
                                        className="border-2 border-dashed rounded p-6 text-center"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}
                                    >
                                        <Upload className="mx-auto h-8 w-8 mb-2" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                        <p className="text-[13px] mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            Drag and drop test report here, or click to browse
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-8 px-4 rounded-full text-[12px]"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                        >
                                            Choose File
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

    </>
  );
}