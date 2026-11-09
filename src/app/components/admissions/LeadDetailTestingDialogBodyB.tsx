import { useState, useMemo, useEffect, useRef } from "react";
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
import { formatMdy } from "../../lib/dateFormat";


interface LeadDetailTestingDialogProps {
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

export function LeadDetailTestingDialogBodyB(props: LeadDetailTestingDialogProps) {
  const { actDocuments, actFormData, actFormErrors, asebaAbclDocuments, asebaAbclFormData, asebaAsrFormData, asebaCbclFormData, asebaYsrFormData, calculateKbit2Difference, calculateKbit2Significance, caseyLifeSkillsDocuments, caseyLifeSkillsFormData, caseyLifeSkillsFormErrors, caseyLifeSkillsYouthDocuments, caseyLifeSkillsYouthFormData, caseyLifeSkillsYouthFormErrors, editingTestingId, employabilityDocuments, employabilityFormData, exploreDocuments, exploreFormData, exploreFormErrors, formatFileSize, gainDocuments, gainFileInputRef, gainFormData, gainFormErrors, gedOfficialDocuments, gedOfficialFileInputRef, gedOfficialFormData, gedOfficialFormErrors, gedReadyDocuments, gedReadyFileInputRef, gedReadyFormData, gedReadyFormErrors, handleActFileSelect, handleActRemoveDocument, handleActScoreChange, handleAsebaAbclFileSelect, handleAsebaAbclRemoveDocument, handleCancelTesting, handleCaseyLifeSkillsFileChange, handleCaseyLifeSkillsYouthFileChange, handleEmployabilityFileSelect, handleEmployabilityRemoveDocument, handleExploreFileSelect, handleExploreRemoveDocument, handleExploreScoreChange, handleGainFileChange, handleGainRemoveDocument, handleGainScoreChange, handleGedOfficialFileChange, handleGedOfficialRemoveDocument, handleGedOfficialScoreChange, handleGedReadyFileChange, handleGedReadyRemoveDocument, handleGedReadyScoreChange, handleKbit2FileSelect, handleKbit2RemoveDocument, handleKbit2ScoreChange, handleMaciFileSelect, handleMaciRemoveDocument, handleMcmiFileSelect, handleMcmiRemoveDocument, handleMpaciFileSelect, handleMpaciRemoveDocument, handlePlanFileSelect, handlePlanRemoveDocument, handlePlanScoreChange, handleRemoveCaseyLifeSkillsDocument, handleRemoveCaseyLifeSkillsYouthDocument, handleSatDocumentDelete, handleSatDocumentDownload, handleSatDocumentView, handleSatDragOver, handleSatDrop, handleSatFileSelect, handleSatScoreChange, handleSaveTesting, handleSsmFileSelect, handleSsmRemoveDocument, handleWj4AgeEquivalencyChange, handleWj4GradeEquivalencyChange, handleWj4GradePercentileChange, handleWj4GradeRPIChange, handleWj4PercentileChange, handleWj4RPIChange, kbit2Documents, kbit2FormData, kbit2FormErrors, maciDocuments, maciFormData, mcmi3Documents, mcmi3FormData, mcmiDocuments, mcmiFormData, mpaciDocuments, mpaciFormData, planDocuments, planFormData, planFormErrors, satDocuments, satFileInputRef, satFormData, satFormErrors, setActFormData, setAsebaAbclFormData, setAsebaAsrFormData, setAsebaCbclFormData, setAsebaYsrFormData, setCaseyLifeSkillsFormData, setCaseyLifeSkillsYouthFormData, setEmployabilityFormData, setExploreFormData, setGainFormData, setGedOfficialFormData, setGedReadyFormData, setKbit2FormData, setMaciFormData, setMcmi3Documents, setMcmi3FormData, setMcmiFormData, setMpaciFormData, setPlanFormData, setSatFormData, setSsmFormData, setTestingDialogOpen, setTestingFormData, setWj4FormData, setWj4GradeFormData, ssmDocuments, ssmFormData, testingAssessments, testingDialogOpen, testingFormData, wj4FormData, wj4FormErrors, wj4GradeFormData, wj4GradeFormErrors } = props;
  return (
    <>
                        {/* KBIT-2 Specific Fields */}
                        {testingFormData.test === "KBIT-2" && (
                            <div className="space-y-6 mt-6">
                                {/* Examiner Field */}
                                <div>
                                    <Label htmlFor="kbit2-examiner" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Examiner
                                    </Label>
                                    <div className="relative max-w-xs">
                                        <select
                                            id="kbit2-examiner"
                                            value={kbit2FormData.examiner}
                                            onChange={(e) => setKbit2FormData({ ...kbit2FormData, examiner: e.target.value, examinerOther: "" })}
                                            style={{
                                                height: '36px',
                                                width: '100%',
                                                paddingLeft: '12px',
                                                paddingRight: '32px',
                                                fontSize: '13px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                color: kbit2FormData.examiner ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
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
                                {kbit2FormData.examiner === "Other" && (
                                    <div>
                                        <Label htmlFor="kbit2-examiner-other" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Other <span className="text-red-600">*</span>
                                        </Label>
                                        <Input
                                            id="kbit2-examiner-other"
                                            type="text"
                                            maxLength={50}
                                            value={kbit2FormData.examinerOther}
                                            onChange={(e) => setKbit2FormData({ ...kbit2FormData, examinerOther: e.target.value })}
                                            placeholder="Specify other examiner"
                                            className="h-9 text-[13px] rounded max-w-xs"
                                            style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                        />
                                    </div>
                                )}

                                {/* Standard Scores */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        Standard Scores (40-160)
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="kbit2-verbal" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Verbal
                                            </Label>
                                            <Input
                                                id="kbit2-verbal"
                                                type="text"
                                                maxLength={3}
                                                value={kbit2FormData.verbalStandardScore}
                                                onChange={(e) => handleKbit2ScoreChange('verbalStandardScore', e.target.value)}
                                                placeholder="40-160"
                                                className="h-9 text-[13px] rounded"
                                                style={{ 
                                                    backgroundColor: 'var(--slds-g-color-background-base)', 
                                                    border: `1px solid ${kbit2FormErrors.verbalStandardScore ? '#c23934' : 'var(--slds-g-color-border-base-1)'}`, 
                                                    color: 'var(--slds-g-color-text-default)' 
                                                }}
                                            />
                                            {kbit2FormErrors.verbalStandardScore && (
                                                <p className="text-[12px] text-red-600 mt-1">{kbit2FormErrors.verbalStandardScore}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="kbit2-nonverbal" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Nonverbal
                                            </Label>
                                            <Input
                                                id="kbit2-nonverbal"
                                                type="text"
                                                maxLength={3}
                                                value={kbit2FormData.nonverbalStandardScore}
                                                onChange={(e) => handleKbit2ScoreChange('nonverbalStandardScore', e.target.value)}
                                                placeholder="40-160"
                                                className="h-9 text-[13px] rounded"
                                                style={{ 
                                                    backgroundColor: 'var(--slds-g-color-background-base)', 
                                                    border: `1px solid ${kbit2FormErrors.nonverbalStandardScore ? '#c23934' : 'var(--slds-g-color-border-base-1)'}`, 
                                                    color: 'var(--slds-g-color-text-default)' 
                                                }}
                                            />
                                            {kbit2FormErrors.nonverbalStandardScore && (
                                                <p className="text-[12px] text-red-600 mt-1">{kbit2FormErrors.nonverbalStandardScore}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="kbit2-composite" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                IQ Composite
                                            </Label>
                                            <Input
                                                id="kbit2-composite"
                                                type="text"
                                                maxLength={3}
                                                value={kbit2FormData.iqCompositeStandardScore}
                                                onChange={(e) => handleKbit2ScoreChange('iqCompositeStandardScore', e.target.value)}
                                                placeholder="40-160"
                                                className="h-9 text-[13px] rounded"
                                                style={{ 
                                                    backgroundColor: 'var(--slds-g-color-background-base)', 
                                                    border: `1px solid ${kbit2FormErrors.iqCompositeStandardScore ? '#c23934' : 'var(--slds-g-color-border-base-1)'}`, 
                                                    color: 'var(--slds-g-color-text-default)' 
                                                }}
                                            />
                                            {kbit2FormErrors.iqCompositeStandardScore && (
                                                <p className="text-[12px] text-red-600 mt-1">{kbit2FormErrors.iqCompositeStandardScore}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Calculated Fields */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        Score Analysis
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Difference Between Standard Scores
                                            </Label>
                                            <Input
                                                type="text"
                                                value={calculateKbit2Difference() !== null ? calculateKbit2Difference()! : ''}
                                                readOnly
                                                disabled
                                                placeholder="Auto-calculated"
                                                className="h-9 text-[13px] rounded"
                                                style={{ 
                                                    backgroundColor: 'var(--slds-g-color-background-alt)', 
                                                    border: '1px solid var(--slds-g-color-border-base-1)', 
                                                    color: 'var(--slds-g-color-text-weak)',
                                                    cursor: 'not-allowed'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Significance of Difference
                                            </Label>
                                            <Input
                                                type="text"
                                                value={calculateKbit2Significance()}
                                                readOnly
                                                disabled
                                                placeholder="Auto-calculated"
                                                className="h-9 text-[13px] rounded"
                                                style={{ 
                                                    backgroundColor: 'var(--slds-g-color-background-alt)', 
                                                    border: '1px solid var(--slds-g-color-border-base-1)', 
                                                    color: 'var(--slds-g-color-text-weak)',
                                                    cursor: 'not-allowed'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Commentary */}
                                <div>
                                    <Label htmlFor="kbit2-commentary" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Commentary
                                    </Label>
                                    <Textarea
                                        id="kbit2-commentary"
                                        value={kbit2FormData.commentary}
                                        onChange={(e) => setKbit2FormData({ ...kbit2FormData, commentary: e.target.value })}
                                        placeholder="Enter any additional notes or commentary..."
                                        className="text-[13px] rounded min-h-[100px]"
                                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                    />
                                </div>

                                {/* Document Upload Section */}
                                <div>
                                    <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Document
                                    </Label>
                                    <div 
                                        className="border-2 border-dashed rounded p-6 text-center cursor-pointer hover:bg-gray-50/50 transition-colors"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}
                                        onClick={() => document.getElementById('kbit2-file-input')?.click()}
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
                                                document.getElementById('kbit2-file-input')?.click();
                                            }}
                                        >
                                            Choose File
                                        </Button>
                                        <input
                                            id="kbit2-file-input"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            multiple
                                            onChange={handleKbit2FileSelect}
                                        />
                                    </div>

                                    {/* Uploaded Documents List */}
                                    {kbit2Documents.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <Label className="block text-[12px] font-semibold uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Uploaded Documents ({kbit2Documents.length})
                                            </Label>
                                            <div 
                                                className="border rounded overflow-hidden"
                                                style={{ 
                                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                                }}
                                            >
                                                {kbit2Documents.map((doc, index) => (
                                                    <div 
                                                        key={doc.id} 
                                                        className="flex items-center justify-between p-3 hover:bg-gray-50/50"
                                                        style={{ 
                                                            borderBottom: index < kbit2Documents.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none'
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <File className="h-5 w-5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[13px] font-medium truncate" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {doc.name}
                                                                </p>
                                                                <p className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                    {(doc.size / 1024).toFixed(0)} KB • {doc.uploadedDate}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleKbit2RemoveDocument(doc.id)}
                                                            className="h-8 w-8 p-0 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* M-PACI Specific Fields */}
                        {testingFormData.test === "M-PACI" && (
                            <div className="space-y-6 mt-6">
                                {/* Examiner Field */}
                                <div>
                                    <Label htmlFor="mpaci-examiner" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Examiner
                                    </Label>
                                    <div className="relative max-w-xs">
                                        <select
                                            id="mpaci-examiner"
                                            value={mpaciFormData.examiner}
                                            onChange={(e) => setMpaciFormData({ ...mpaciFormData, examiner: e.target.value, examinerOther: "" })}
                                            style={{
                                                height: '36px',
                                                width: '100%',
                                                paddingLeft: '12px',
                                                paddingRight: '32px',
                                                fontSize: '13px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                color: mpaciFormData.examiner ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
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
                                {mpaciFormData.examiner === "Other" && (
                                    <div>
                                        <Label htmlFor="mpaci-examiner-other" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Other <span className="text-red-600">*</span>
                                        </Label>
                                        <Input
                                            id="mpaci-examiner-other"
                                            type="text"
                                            maxLength={50}
                                            value={mpaciFormData.examinerOther}
                                            onChange={(e) => setMpaciFormData({ ...mpaciFormData, examinerOther: e.target.value })}
                                            placeholder="Specify other examiner"
                                            className="h-9 text-[13px] rounded max-w-xs"
                                            style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                        />
                                    </div>
                                )}

                                {/* Commentary */}
                                <div>
                                    <Label htmlFor="mpaci-commentary" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Commentary
                                    </Label>
                                    <Textarea
                                        id="mpaci-commentary"
                                        value={mpaciFormData.commentary}
                                        onChange={(e) => setMpaciFormData({ ...mpaciFormData, commentary: e.target.value })}
                                        placeholder="Enter any additional notes or commentary..."
                                        className="text-[13px] rounded min-h-[100px]"
                                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                    />
                                </div>

                                {/* Document Upload Section */}
                                <div>
                                    <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Document
                                    </Label>
                                    <div 
                                        className="border-2 border-dashed rounded p-6 text-center cursor-pointer hover:bg-gray-50/50 transition-colors"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}
                                        onClick={() => document.getElementById('mpaci-file-input')?.click()}
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
                                                document.getElementById('mpaci-file-input')?.click();
                                            }}
                                        >
                                            Choose File
                                        </Button>
                                        <input
                                            id="mpaci-file-input"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            multiple
                                            onChange={handleMpaciFileSelect}
                                        />
                                    </div>

                                    {/* Uploaded Documents List */}
                                    {mpaciDocuments.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <Label className="block text-[12px] font-semibold uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Uploaded Documents ({mpaciDocuments.length})
                                            </Label>
                                            <div 
                                                className="border rounded overflow-hidden"
                                                style={{ 
                                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                                }}
                                            >
                                                {mpaciDocuments.map((doc, index) => (
                                                    <div 
                                                        key={doc.id} 
                                                        className="flex items-center justify-between p-3 hover:bg-gray-50/50"
                                                        style={{ 
                                                            borderBottom: index < mpaciDocuments.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none'
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <File className="h-5 w-5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[13px] font-medium truncate" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {doc.name}
                                                                </p>
                                                                <p className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                    {(doc.size / 1024).toFixed(0)} KB • {doc.uploadedDate}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleMpaciRemoveDocument(doc.id)}
                                                            className="h-8 w-8 p-0 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* MACI Specific Fields */}
                        {testingFormData.test === "MACI" && (
                            <div className="space-y-6 mt-6">
                                {/* Examiner Field */}
                                <div>
                                    <Label htmlFor="maci-examiner" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Examiner
                                    </Label>
                                    <div className="relative max-w-xs">
                                        <select
                                            id="maci-examiner"
                                            value={maciFormData.examiner}
                                            onChange={(e) => setMaciFormData({ ...maciFormData, examiner: e.target.value, examinerOther: "" })}
                                            style={{
                                                height: '36px',
                                                width: '100%',
                                                paddingLeft: '12px',
                                                paddingRight: '32px',
                                                fontSize: '13px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                color: maciFormData.examiner ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
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
                                {maciFormData.examiner === "Other" && (
                                    <div>
                                        <Label htmlFor="maci-examiner-other" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Other <span className="text-red-600">*</span>
                                        </Label>
                                        <Input
                                            id="maci-examiner-other"
                                            type="text"
                                            maxLength={50}
                                            value={maciFormData.examinerOther}
                                            onChange={(e) => setMaciFormData({ ...maciFormData, examinerOther: e.target.value })}
                                            placeholder="Specify other examiner"
                                            className="h-9 text-[13px] rounded max-w-xs"
                                            style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                        />
                                    </div>
                                )}

                                {/* Commentary */}
                                <div>
                                    <Label htmlFor="maci-commentary" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Commentary
                                    </Label>
                                    <Textarea
                                        id="maci-commentary"
                                        value={maciFormData.commentary}
                                        onChange={(e) => setMaciFormData({ ...maciFormData, commentary: e.target.value })}
                                        placeholder="Enter any additional notes or commentary..."
                                        className="text-[13px] rounded min-h-[100px]"
                                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                    />
                                </div>

                                {/* Document Upload Section */}
                                <div>
                                    <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Document
                                    </Label>
                                    <div 
                                        className="border-2 border-dashed rounded p-6 text-center cursor-pointer hover:bg-gray-50/50 transition-colors"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}
                                        onClick={() => document.getElementById('maci-file-input')?.click()}
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
                                                document.getElementById('maci-file-input')?.click();
                                            }}
                                        >
                                            Choose File
                                        </Button>
                                        <input
                                            id="maci-file-input"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            multiple
                                            onChange={handleMaciFileSelect}
                                        />
                                    </div>

                                    {/* Uploaded Documents List */}
                                    {maciDocuments.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <Label className="block text-[12px] font-semibold uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Uploaded Documents ({maciDocuments.length})
                                            </Label>
                                            <div 
                                                className="border rounded overflow-hidden"
                                                style={{ 
                                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                                }}
                                            >
                                                {maciDocuments.map((doc, index) => (
                                                    <div 
                                                        key={doc.id} 
                                                        className="flex items-center justify-between p-3 hover:bg-gray-50/50"
                                                        style={{ 
                                                            borderBottom: index < maciDocuments.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' 
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <FileText className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-[13px] font-medium truncate" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {doc.name}
                                                                </p>
                                                                <p className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                    {(doc.size / 1024).toFixed(0)} KB • {doc.uploadedDate}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleMaciRemoveDocument(doc.id)}
                                                            className="h-8 w-8 p-0 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* MCMI-III Specific Fields */}
                        {testingFormData.test === "MCMI-III" && (
                            <div className="space-y-6 mt-6">
                                {/* Examiner Field */}
                                <div>
                                    <Label htmlFor="mcmi3-examiner" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Examiner
                                    </Label>
                                    <div className="relative max-w-xs">
                                        <select
                                            id="mcmi3-examiner"
                                            value={mcmi3FormData.examiner}
                                            onChange={(e) => setMcmi3FormData({ ...mcmi3FormData, examiner: e.target.value, examinerOther: "" })}
                                            style={{
                                                height: '36px',
                                                width: '100%',
                                                paddingLeft: '12px',
                                                paddingRight: '32px',
                                                fontSize: '13px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                color: mcmi3FormData.examiner ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
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
                                {mcmi3FormData.examiner === "Other" && (
                                    <div>
                                        <Label htmlFor="mcmi3-examiner-other" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Other <span className="text-red-600">*</span>
                                        </Label>
                                        <Input
                                            id="mcmi3-examiner-other"
                                            type="text"
                                            maxLength={50}
                                            value={mcmi3FormData.examinerOther}
                                            onChange={(e) => setMcmi3FormData({ ...mcmi3FormData, examinerOther: e.target.value })}
                                            placeholder="Specify other examiner"
                                            className="h-9 text-[13px] rounded max-w-xs"
                                            style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                        />
                                    </div>
                                )}

                                {/* Commentary */}
                                <div>
                                    <Label htmlFor="mcmi3-commentary" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Commentary
                                    </Label>
                                    <Textarea
                                        id="mcmi3-commentary"
                                        value={mcmi3FormData.commentary}
                                        onChange={(e) => setMcmi3FormData({ ...mcmi3FormData, commentary: e.target.value })}
                                        placeholder="Enter any additional notes or commentary..."
                                        className="text-[13px] rounded min-h-[100px]"
                                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                    />
                                </div>

                                {/* Document Upload Section */}
                                <div>
                                    <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Document
                                    </Label>
                                    <div 
                                        className="border-2 border-dashed rounded p-6 text-center cursor-pointer hover:bg-gray-50/50 transition-colors"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}
                                        onClick={() => document.getElementById('mcmi3-file-input')?.click()}
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
                                                document.getElementById('mcmi3-file-input')?.click();
                                            }}
                                        >
                                            Upload File
                                        </Button>
                                        <input
                                            id="mcmi3-file-input"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const newDocument = {
                                                        id: Date.now(),
                                                        name: file.name,
                                                        size: file.size,
                                                        type: file.type,
                                                        uploadedDate: formatMdy(new Date()),
                                                        url: URL.createObjectURL(file)
                                                    };
                                                    setMcmi3Documents([...mcmi3Documents, newDocument]);
                                                    toast.success(`Document "${file.name}" uploaded successfully`);
                                                    e.target.value = '';
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Uploaded Documents List */}
                                    {mcmi3Documents.length > 0 && (
                                        <div className="mt-4">
                                            <div className="space-y-2">
                                                {mcmi3Documents.map((doc) => (
                                                    <div 
                                                        key={doc.id} 
                                                        className="flex items-center justify-between p-3 rounded border"
                                                        style={{ 
                                                            borderColor: 'var(--slds-g-color-border-base-1)', 
                                                            backgroundColor: 'var(--slds-g-color-background-base)' 
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <FileText className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-[13px] font-medium truncate" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {doc.name}
                                                                </p>
                                                                <p className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                    {(doc.size / 1024).toFixed(0)} KB • {doc.uploadedDate}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setMcmi3Documents(mcmi3Documents.filter(d => d.id !== doc.id))}
                                                            className="h-8 w-8 p-0 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* MCMI-IV Specific Fields */}
                        {testingFormData.test === "MCMI-IV" && (
                            <div className="space-y-6 mt-6">
                                {/* Examiner Field */}
                                <div>
                                    <Label htmlFor="mcmi-examiner" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Examiner
                                    </Label>
                                    <div className="relative max-w-xs">
                                        <select
                                            id="mcmi-examiner"
                                            value={mcmiFormData.examiner}
                                            onChange={(e) => setMcmiFormData({ ...mcmiFormData, examiner: e.target.value, examinerOther: "" })}
                                            style={{
                                                height: '36px',
                                                width: '100%',
                                                paddingLeft: '12px',
                                                paddingRight: '32px',
                                                fontSize: '13px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                color: mcmiFormData.examiner ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
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
                                {mcmiFormData.examiner === "Other" && (
                                    <div>
                                        <Label htmlFor="mcmi-examiner-other" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Other <span className="text-red-600">*</span>
                                        </Label>
                                        <Input
                                            id="mcmi-examiner-other"
                                            type="text"
                                            maxLength={50}
                                            value={mcmiFormData.examinerOther}
                                            onChange={(e) => setMcmiFormData({ ...mcmiFormData, examinerOther: e.target.value })}
                                            placeholder="Specify other examiner"
                                            className="h-9 text-[13px] rounded max-w-xs"
                                            style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                        />
                                    </div>
                                )}

                                {/* Commentary */}
                                <div>
                                    <Label htmlFor="mcmi-commentary" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Commentary
                                    </Label>
                                    <Textarea
                                        id="mcmi-commentary"
                                        value={mcmiFormData.commentary}
                                        onChange={(e) => setMcmiFormData({ ...mcmiFormData, commentary: e.target.value })}
                                        placeholder="Enter any additional notes or commentary..."
                                        className="text-[13px] rounded min-h-[100px]"
                                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                    />
                                </div>

                                {/* Document Upload Section */}
                                <div>
                                    <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Document
                                    </Label>
                                    <div 
                                        className="border-2 border-dashed rounded p-6 text-center cursor-pointer hover:bg-gray-50/50 transition-colors"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}
                                        onClick={() => document.getElementById('mcmi-file-input')?.click()}
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
                                                document.getElementById('mcmi-file-input')?.click();
                                            }}
                                        >
                                            Choose File
                                        </Button>
                                        <input
                                            id="mcmi-file-input"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            multiple
                                            onChange={handleMcmiFileSelect}
                                        />
                                    </div>

                                    {/* Uploaded Documents List */}
                                    {mcmiDocuments.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <Label className="block text-[12px] font-semibold uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Uploaded Documents ({mcmiDocuments.length})
                                            </Label>
                                            <div 
                                                className="border rounded overflow-hidden"
                                                style={{ 
                                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                                }}
                                            >
                                                {mcmiDocuments.map((doc, index) => (
                                                    <div 
                                                        key={doc.id} 
                                                        className="flex items-center justify-between p-3 hover:bg-gray-50/50"
                                                        style={{ 
                                                            borderBottom: index < mcmiDocuments.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' 
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <FileText className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-[13px] font-medium truncate" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {doc.name}
                                                                </p>
                                                                <p className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                    {(doc.size / 1024).toFixed(0)} KB • {doc.uploadedDate}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleMcmiRemoveDocument(doc.id)}
                                                            className="h-8 w-8 p-0 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Self Sufficiency Matrix v2 Specific Fields */}
                        {testingFormData.test === "Self Sufficiency Matrix v2" && (
                            <div className="space-y-6 mt-6">
                                {/* Examiner Field */}
                                <div>
                                    <Label htmlFor="ssm-examiner" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Examiner
                                    </Label>
                                    <div className="relative max-w-xs">
                                        <select
                                            id="ssm-examiner"
                                            value={ssmFormData.examiner}
                                            onChange={(e) => setSsmFormData({ ...ssmFormData, examiner: e.target.value, examinerOther: "" })}
                                            style={{
                                                height: '36px',
                                                width: '100%',
                                                paddingLeft: '12px',
                                                paddingRight: '32px',
                                                fontSize: '13px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                color: ssmFormData.examiner ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
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
                                {ssmFormData.examiner === "Other" && (
                                    <div>
                                        <Label htmlFor="ssm-examiner-other" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Other <span className="text-red-600">*</span>
                                        </Label>
                                        <Input
                                            id="ssm-examiner-other"
                                            type="text"
                                            maxLength={50}
                                            value={ssmFormData.examinerOther}
                                            onChange={(e) => setSsmFormData({ ...ssmFormData, examinerOther: e.target.value })}
                                            placeholder="Specify other examiner"
                                            className="h-9 text-[13px] rounded max-w-xs"
                                            style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                        />
                                    </div>
                                )}

                                {/* Divider */}
                                <div className="border-t pt-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                    <h3 className="text-[14px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        Assessment Topics
                                    </h3>
                                </div>

                                {/* Topics - Grid Layout */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                    {[
                                        { label: 'Housing', statusKey: 'housingStatus', commentKey: 'housingComment' },
                                        { label: 'Employment / Finances', statusKey: 'employmentFinancesStatus', commentKey: 'employmentFinancesComment' },
                                        { label: 'Food', statusKey: 'foodStatus', commentKey: 'foodComment' },
                                        { label: 'Clothing', statusKey: 'clothingStatus', commentKey: 'clothingComment' },
                                        { label: 'Transportation', statusKey: 'transportationStatus', commentKey: 'transportationComment' },
                                        { label: 'Executive Functions', statusKey: 'executiveFunctionsStatus', commentKey: 'executiveFunctionsComment' },
                                        { label: 'Adult Education', statusKey: 'adultEducationStatus', commentKey: 'adultEducationComment' },
                                        { label: 'Education (Child/Adolescent)', statusKey: 'educationChildAdolescentStatus', commentKey: 'educationChildAdolescentComment' },
                                        { label: 'Childcare', statusKey: 'childcareStatus', commentKey: 'childcareComment' },
                                        { label: 'Caregiver Skills', statusKey: 'caregiverSkillsStatus', commentKey: 'caregiverSkillsComment' },
                                        { label: 'Social Supports', statusKey: 'socialSupportsStatus', commentKey: 'socialSupportsComment' },
                                        { label: 'Legal (Non-Criminal)', statusKey: 'legalNonCriminalStatus', commentKey: 'legalNonCriminalComment' },
                                        { label: 'Legal (Criminal)', statusKey: 'legalCriminalStatus', commentKey: 'legalCriminalComment' },
                                        { label: 'Physical Health / Health Care Coverage', statusKey: 'physicalHealthStatus', commentKey: 'physicalHealthComment' },
                                        { label: 'Physical Disabilities / Learning Disabilities', statusKey: 'physicalDisabilitiesStatus', commentKey: 'physicalDisabilitiesComment' },
                                        { label: 'Substance Use', statusKey: 'substanceUseStatus', commentKey: 'substanceUseComment' },
                                        { label: 'Mental Health', statusKey: 'mentalHealthStatus', commentKey: 'mentalHealthComment' },
                                        { label: 'Safety', statusKey: 'safetyStatus', commentKey: 'safetyComment' }
                                    ].map((topic, index) => (
                                        <div key={index} className="py-4">
                                            <Label className="block text-[12px] font-semibold uppercase mb-1.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                {topic.label}
                                            </Label>
                                            <div className="space-y-3">
                                                <div style={{ position: 'relative', display: 'block', width: '100%', maxWidth: '400px' }}>
                                                    <select
                                                        value={ssmFormData[topic.statusKey as keyof typeof ssmFormData] as string}
                                                        onChange={(e) => setSsmFormData({ ...ssmFormData, [topic.statusKey]: e.target.value })}
                                                        style={{
                                                            height: '36px',
                                                            width: '100%',
                                                            paddingLeft: '12px',
                                                            paddingRight: '36px',
                                                            fontSize: '13px',
                                                            borderRadius: '6px',
                                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            color: ssmFormData[topic.statusKey as keyof typeof ssmFormData] ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
                                                            appearance: 'none',
                                                            WebkitAppearance: 'none',
                                                            MozAppearance: 'none',
                                                            outline: 'none',
                                                            cursor: 'pointer',
                                                            display: 'block',
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
                                                        <option value="">Select status</option>
                                                        <option value="In Crisis">In Crisis</option>
                                                        <option value="Vulnerable">Vulnerable</option>
                                                        <option value="Safe">Safe</option>
                                                        <option value="Building Capacity">Building Capacity</option>
                                                        <option value="Empowered">Empowered</option>
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
                                                            right: '12px',
                                                            top: '11px',
                                                            width: '14px',
                                                            height: '14px',
                                                            color: 'var(--slds-g-color-text-weak)',
                                                            pointerEvents: 'none',
                                                        }}
                                                    >
                                                        <polyline points="6 9 12 15 18 9" />
                                                    </svg>
                                                </div>
                                                <Textarea
                                                    value={ssmFormData[topic.commentKey as keyof typeof ssmFormData] as string}
                                                    onChange={(e) => setSsmFormData({ ...ssmFormData, [topic.commentKey]: e.target.value })}
                                                    placeholder="Enter comment..."
                                                    className="text-[13px] rounded min-h-[70px]"
                                                    style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Notes for Goals */}
                                <div className="border-t pt-6 mt-6" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                    <Label htmlFor="ssm-notes-goals" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Notes for Goals
                                    </Label>
                                    <Textarea
                                        id="ssm-notes-goals"
                                        value={ssmFormData.notesForGoals}
                                        onChange={(e) => setSsmFormData({ ...ssmFormData, notesForGoals: e.target.value })}
                                        placeholder="Enter notes for goals..."
                                        className="text-[13px] rounded min-h-[100px]"
                                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                    />
                                </div>

                                {/* Passion Statement */}
                                <div>
                                    <Label htmlFor="ssm-passion-statement" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Passion Statement
                                    </Label>
                                    <Textarea
                                        id="ssm-passion-statement"
                                        value={ssmFormData.passionStatement}
                                        onChange={(e) => setSsmFormData({ ...ssmFormData, passionStatement: e.target.value })}
                                        placeholder="Enter passion statement..."
                                        className="text-[13px] rounded min-h-[100px]"
                                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                    />
                                </div>

                                {/* Document Upload Section */}
                                <div>
                                    <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Document
                                    </Label>
                                    <div 
                                        className="border-2 border-dashed rounded p-6 text-center cursor-pointer hover:bg-gray-50/50 transition-colors"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}
                                        onClick={() => document.getElementById('ssm-file-input')?.click()}
                                    >
                                        <Upload className="mx-auto h-8 w-8 mb-2" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                        <p className="text-[13px] mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            Drag and drop assessment report here, or click to browse
                                        </p>
                                        <Button 
                                            type="button"
                                            variant="outline" 
                                            className="h-8 px-4 rounded-full text-[12px]"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                document.getElementById('ssm-file-input')?.click();
                                            }}
                                        >
                                            Choose File
                                        </Button>
                                        <input
                                            id="ssm-file-input"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            multiple
                                            onChange={handleSsmFileSelect}
                                        />
                                    </div>

                                    {/* Uploaded Documents List */}
                                    {ssmDocuments.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <Label className="block text-[12px] font-semibold uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Uploaded Documents ({ssmDocuments.length})
                                            </Label>
                                            <div 
                                                className="border rounded overflow-hidden"
                                                style={{ 
                                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                                }}
                                            >
                                                {ssmDocuments.map((doc, index) => (
                                                    <div 
                                                        key={doc.id} 
                                                        className="flex items-center justify-between p-3 hover:bg-gray-50/50"
                                                        style={{ 
                                                            borderBottom: index < ssmDocuments.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' 
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <FileText className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-[13px] font-medium truncate" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {doc.name}
                                                                </p>
                                                                <p className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                    {(doc.size / 1024).toFixed(0)} KB • {doc.uploadedDate}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleSsmRemoveDocument(doc.id)}
                                                            className="h-8 w-8 p-0 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* SAT-Specific Fields - Show only when SAT is selected */}
                        {testingFormData.test === "SAT" && (
                            <div className="space-y-6 mt-6">
                                {/* Total Score */}
                                <div>
                                    <Label htmlFor="sat-total" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Total Score <span className="text-red-600">*</span>
                                    </Label>
                                    <Input 
                                        id="sat-total" 
                                        type="text" 
                                        maxLength={4}
                                        value={satFormData.totalScore} 
                                        onChange={(e) => handleSatScoreChange('totalScore', e.target.value)} 
                                        placeholder="400-1600"
                                        className="h-9 text-[13px] rounded max-w-xs" 
                                        style={{ 
                                            backgroundColor: 'var(--slds-g-color-background-base)', 
                                            border: `1px solid ${satFormErrors.totalScore ? '#c23934' : 'var(--slds-g-color-border-base-1)'}`, 
                                            color: 'var(--slds-g-color-text-default)' 
                                        }} 
                                    />
                                    {satFormErrors.totalScore && (
                                        <p className="text-[12px] text-red-600 mt-1">{satFormErrors.totalScore}</p>
                                    )}
                                </div>

                                {/* Commentary */}
                                <div>
                                    <Label htmlFor="sat-commentary" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Commentary
                                    </Label>
                                    <Textarea 
                                        id="sat-commentary" 
                                        value={satFormData.commentary} 
                                        onChange={(e) => setSatFormData({ ...satFormData, commentary: e.target.value })} 
                                        placeholder="Enter any additional notes or commentary..."
                                        className="text-[13px] rounded min-h-[100px]" 
                                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }} 
                                    />
                                </div>

                                {/* Document Upload Section */}
                                <div>
                                    <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Document
                                    </Label>
                                    <div 
                                        className="border-2 border-dashed rounded p-6 text-center cursor-pointer hover:bg-gray-50/50 transition-colors"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}
                                        onDragOver={handleSatDragOver}
                                        onDrop={handleSatDrop}
                                        onClick={() => satFileInputRef.current?.click()}
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
                                                satFileInputRef.current?.click();
                                            }}
                                        >
                                            Choose File
                                        </Button>
                                        <input
                                            ref={satFileInputRef}
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            multiple
                                            onChange={handleSatFileSelect}
                                        />
                                    </div>

                                    {/* Uploaded Documents List */}
                                    {satDocuments.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <Label className="block text-[12px] font-semibold uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Uploaded Documents ({satDocuments.length})
                                            </Label>
                                            <div 
                                                className="border rounded overflow-hidden"
                                                style={{ 
                                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                                }}
                                            >
                                                {satDocuments.map((doc) => (
                                                    <div
                                                        key={doc.id}
                                                        className="flex items-center justify-between p-3 hover:bg-gray-50/80 transition-colors"
                                                        style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <File className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[13px] font-medium truncate" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {doc.name}
                                                                </p>
                                                                <p className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                    {formatFileSize(doc.size)} • Uploaded {doc.uploadedDate}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 ml-2">
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleSatDocumentView(doc)}
                                                                className="h-8 w-8 p-0"
                                                                title="View"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleSatDocumentDownload(doc)}
                                                                className="h-8 w-8 p-0"
                                                                title="Download"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleSatDocumentDelete(doc.id)}
                                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ACT-Specific Fields — shown only when ACT is selected */}
                        {testingFormData.test === "ACT" && (
                            <div className="space-y-6">
                                {/* Composite Score - Required */}
                                <div className="max-w-xs">
                                    <Label htmlFor="act-composite" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Composite Score <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        id="act-composite"
                                        type="text"
                                        maxLength={2}
                                        value={actFormData.compositeScore}
                                        onChange={(e) => handleActScoreChange('compositeScore', e.target.value)}
                                        placeholder="1-36"
                                        className="h-9 text-[13px] rounded"
                                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                    />
                                    {actFormErrors.compositeScore && (
                                        <p className="text-[12px] text-red-600 mt-1">{actFormErrors.compositeScore}</p>
                                    )}
                                </div>

                                {/* Commentary */}
                                <div>
                                    <Label htmlFor="act-commentary" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Commentary
                                    </Label>
                                    <Textarea
                                        id="act-commentary"
                                        value={actFormData.commentary}
                                        onChange={(e) => setActFormData(prev => ({ ...prev, commentary: e.target.value }))}
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
                                        className="border-2 border-dashed rounded p-6 text-center cursor-pointer hover:bg-gray-50/50 transition-colors"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}
                                        onClick={() => document.getElementById('act-file-input')?.click()}
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
                                                document.getElementById('act-file-input')?.click();
                                            }}
                                        >
                                            Choose File
                                        </Button>
                                        <input
                                            id="act-file-input"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            multiple
                                            onChange={handleActFileSelect}
                                        />
                                    </div>

                                    {/* Uploaded Documents List */}
                                    {actDocuments.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <Label className="block text-[12px] font-semibold uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Uploaded Documents ({actDocuments.length})
                                            </Label>
                                            <div 
                                                className="border rounded overflow-hidden"
                                                style={{ 
                                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                                }}
                                            >
                                                {actDocuments.map((doc, index) => (
                                                    <div 
                                                        key={doc.id} 
                                                        className="flex items-center justify-between p-3 hover:bg-gray-50/50"
                                                        style={{ 
                                                            borderBottom: index < actDocuments.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none'
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <File className="h-5 w-5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[13px] font-medium truncate" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {doc.name}
                                                                </p>
                                                                <p className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                    {(doc.size / 1024).toFixed(0)} KB • {doc.uploadedDate}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleActRemoveDocument(doc.id)}
                                                            className="h-8 w-8 p-0 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* PLAN-Specific Fields — shown only when PLAN is selected */}
                        {testingFormData.test === "PLAN" && (
                            <div className="space-y-6">
                                {/* Composite Score - Required */}
                                <div className="max-w-xs">
                                    <Label htmlFor="plan-composite" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Composite Score <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        id="plan-composite"
                                        type="text"
                                        maxLength={2}
                                        value={planFormData.compositeScore}
                                        onChange={(e) => handlePlanScoreChange('compositeScore', e.target.value)}
                                        placeholder="1-32"
                                        className="h-9 text-[13px] rounded"
                                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                    />
                                    {planFormErrors.compositeScore && (
                                        <p className="text-[12px] text-red-600 mt-1">{planFormErrors.compositeScore}</p>
                                    )}
                                </div>

                                {/* Commentary */}
                                <div>
                                    <Label htmlFor="plan-commentary" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Commentary
                                    </Label>
                                    <Textarea
                                        id="plan-commentary"
                                        value={planFormData.commentary}
                                        onChange={(e) => setPlanFormData(prev => ({ ...prev, commentary: e.target.value }))}
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
                                        className="border-2 border-dashed rounded p-6 text-center cursor-pointer hover:bg-gray-50/50 transition-colors"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}
                                        onClick={() => document.getElementById('plan-file-input')?.click()}
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
                                                document.getElementById('plan-file-input')?.click();
                                            }}
                                        >
                                            Choose File
                                        </Button>
                                        <input
                                            id="plan-file-input"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            multiple
                                            onChange={handlePlanFileSelect}
                                        />
                                    </div>

                                    {/* Uploaded Documents List */}
                                    {planDocuments.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <Label className="block text-[12px] font-semibold uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Uploaded Documents ({planDocuments.length})
                                            </Label>
                                            <div 
                                                className="border rounded overflow-hidden"
                                                style={{ 
                                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                                }}
                                            >
                                                {planDocuments.map((doc, index) => (
                                                    <div 
                                                        key={doc.id} 
                                                        className="flex items-center justify-between p-3 hover:bg-gray-50/50"
                                                        style={{ 
                                                            borderBottom: index < planDocuments.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none'
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <File className="h-5 w-5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[13px] font-medium truncate" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {doc.name}
                                                                </p>
                                                                <p className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                    {(doc.size / 1024).toFixed(0)} KB • {doc.uploadedDate}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handlePlanRemoveDocument(doc.id)}
                                                            className="h-8 w-8 p-0 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* EXPLORE-Specific Fields — shown only when EXPLORE is selected */}
                        {testingFormData.test === "EXPLORE" && (
                            <div className="space-y-6">
                                {/* Composite Score - Required */}
                                <div className="max-w-xs">
                                    <Label htmlFor="explore-composite" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Composite Score <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        id="explore-composite"
                                        type="text"
                                        maxLength={2}
                                        value={exploreFormData.compositeScore}
                                        onChange={(e) => handleExploreScoreChange('compositeScore', e.target.value)}
                                        placeholder="1-25"
                                        className="h-9 text-[13px] rounded"
                                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                    />
                                    {exploreFormErrors.compositeScore && (
                                        <p className="text-[12px] text-red-600 mt-1">{exploreFormErrors.compositeScore}</p>
                                    )}
                                </div>

                                {/* Commentary */}
                                <div>
                                    <Label htmlFor="explore-commentary" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Commentary
                                    </Label>
                                    <Textarea
                                        id="explore-commentary"
                                        value={exploreFormData.commentary}
                                        onChange={(e) => setExploreFormData(prev => ({ ...prev, commentary: e.target.value }))}
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
                                        className="border-2 border-dashed rounded p-6 text-center cursor-pointer hover:bg-gray-50/50 transition-colors"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}
                                        onClick={() => document.getElementById('explore-file-input')?.click()}
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
                                                document.getElementById('explore-file-input')?.click();
                                            }}
                                        >
                                            Choose File
                                        </Button>
                                        <input
                                            id="explore-file-input"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            multiple
                                            onChange={handleExploreFileSelect}
                                        />
                                    </div>

                                    {/* Uploaded Documents List */}
                                    {exploreDocuments.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <Label className="block text-[12px] font-semibold uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Uploaded Documents ({exploreDocuments.length})
                                            </Label>
                                            <div 
                                                className="border rounded overflow-hidden"
                                                style={{ 
                                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                                }}
                                            >
                                                {exploreDocuments.map((doc, index) => (
                                                    <div 
                                                        key={doc.id} 
                                                        className="flex items-center justify-between p-3 hover:bg-gray-50/50"
                                                        style={{ 
                                                            borderBottom: index < exploreDocuments.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none'
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <File className="h-5 w-5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[13px] font-medium truncate" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {doc.name}
                                                                </p>
                                                                <p className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                    {(doc.size / 1024).toFixed(0)} KB • {doc.uploadedDate}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleExploreRemoveDocument(doc.id)}
                                                            className="h-8 w-8 p-0 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* GAIN-Specific Fields — shown only when GAIN is selected */}
                        {testingFormData.test === "GAIN" && (
                            <div className="space-y-6">
                                {/* English Composite Score - Required */}
                                <div className="max-w-xs">
                                    <Label htmlFor="gain-english" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        English Composite Score <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        id="gain-english"
                                        type="text"
                                        maxLength={4}
                                        value={gainFormData.englishCompositeScore}
                                        onChange={(e) => handleGainScoreChange('englishCompositeScore', e.target.value)}
                                        placeholder="200-1000"
                                        className="h-9 text-[13px] rounded"
                                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                    />
                                    {gainFormErrors.englishCompositeScore && (
                                        <p className="text-[12px] text-red-600 mt-1">{gainFormErrors.englishCompositeScore}</p>
                                    )}
                                </div>

                                {/* Math Composite Score - Required */}
                                <div className="max-w-xs">
                                    <Label htmlFor="gain-math" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Math Composite Score <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        id="gain-math"
                                        type="text"
                                        maxLength={4}
                                        value={gainFormData.mathCompositeScore}
                                        onChange={(e) => handleGainScoreChange('mathCompositeScore', e.target.value)}
                                        placeholder="200-1000"
                                        className="h-9 text-[13px] rounded"
                                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                    />
                                    {gainFormErrors.mathCompositeScore && (
                                        <p className="text-[12px] text-red-600 mt-1">{gainFormErrors.mathCompositeScore}</p>
                                    )}
                                </div>

                                {/* Commentary */}
                                <div>
                                    <Label htmlFor="gain-commentary" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Commentary
                                    </Label>
                                    <Textarea
                                        id="gain-commentary"
                                        value={gainFormData.commentary}
                                        onChange={(e) => setGainFormData(prev => ({ ...prev, commentary: e.target.value }))}
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
                                        className="border-2 border-dashed rounded p-6 text-center cursor-pointer hover:bg-gray-50/50 transition-colors"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}
                                        onClick={() => document.getElementById('gain-file-input')?.click()}
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
                                    <input
                                        id="gain-file-input"
                                        ref={gainFileInputRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        multiple
                                        onChange={handleGainFileChange}
                                        style={{ display: 'none' }}
                                    />

                                    {gainDocuments.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <Label className="block text-[12px] font-semibold uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Uploaded Documents ({gainDocuments.length})
                                            </Label>
                                            <div 
                                                className="border rounded overflow-hidden"
                                                style={{ 
                                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                                }}
                                            >
                                                {gainDocuments.map((doc, index) => (
                                                    <div 
                                                        key={doc.id} 
                                                        className="flex items-center justify-between p-3 hover:bg-gray-50/50"
                                                        style={{ 
                                                            borderBottom: index < gainDocuments.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none'
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <File className="h-5 w-5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[13px] font-medium truncate" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {doc.name}
                                                                </p>
                                                                <p className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                    {(doc.size / 1024).toFixed(0)} KB • {doc.uploadedDate}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleGainRemoveDocument(doc.id)}
                                                            className="h-8 w-8 p-0 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* GED Official-Specific Fields — shown only when GED Official is selected */}
                        {testingFormData.test === "GED Official" && (
                            <div className="space-y-6">
                                {/* Composite Score - Required */}
                                <div className="max-w-xs">
                                    <Label htmlFor="gedofficial-composite" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Composite Score <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        id="gedofficial-composite"
                                        type="text"
                                        maxLength={3}
                                        value={gedOfficialFormData.compositeScore}
                                        onChange={(e) => handleGedOfficialScoreChange('compositeScore', e.target.value)}
                                        placeholder="400-800"
                                        className="h-9 text-[13px] rounded"
                                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                    />
                                    {gedOfficialFormErrors.compositeScore && (
                                        <p className="text-[12px] text-red-600 mt-1">{gedOfficialFormErrors.compositeScore}</p>
                                    )}
                                </div>

                                {/* Commentary */}
                                <div>
                                    <Label htmlFor="gedofficial-commentary" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Commentary
                                    </Label>
                                    <Textarea
                                        id="gedofficial-commentary"
                                        value={gedOfficialFormData.commentary}
                                        onChange={(e) => setGedOfficialFormData(prev => ({ ...prev, commentary: e.target.value }))}
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
                                        className="border-2 border-dashed rounded p-6 text-center cursor-pointer hover:bg-gray-50/50 transition-colors"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}
                                        onClick={() => document.getElementById('gedofficial-file-input')?.click()}
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
                                    <input
                                        id="gedofficial-file-input"
                                        ref={gedOfficialFileInputRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        multiple
                                        onChange={handleGedOfficialFileChange}
                                        style={{ display: 'none' }}
                                    />

                                    {gedOfficialDocuments.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <Label className="block text-[12px] font-semibold uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Uploaded Documents ({gedOfficialDocuments.length})
                                            </Label>
                                            <div 
                                                className="border rounded overflow-hidden"
                                                style={{ 
                                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                                }}
                                            >
                                                {gedOfficialDocuments.map((doc, index) => (
                                                    <div 
                                                        key={doc.id} 
                                                        className="flex items-center justify-between p-3 hover:bg-gray-50/50"
                                                        style={{ 
                                                            borderBottom: index < gedOfficialDocuments.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none'
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <File className="h-5 w-5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[13px] font-medium truncate" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {doc.name}
                                                                </p>
                                                                <p className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                    {(doc.size / 1024).toFixed(0)} KB • {doc.uploadedDate}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleGedOfficialRemoveDocument(doc.id)}
                                                            className="h-8 w-8 p-0 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* GED Ready-Specific Fields — shown only when GED Ready is selected */}
                        {testingFormData.test === "GED Ready" && (
                            <div className="space-y-6">
                                {/* Composite Score - Required */}
                                <div className="max-w-xs">
                                    <Label htmlFor="gedready-composite" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Composite Score <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        id="gedready-composite"
                                        type="text"
                                        maxLength={3}
                                        value={gedReadyFormData.compositeScore}
                                        onChange={(e) => handleGedReadyScoreChange('compositeScore', e.target.value)}
                                        placeholder="400-800"
                                        className="h-9 text-[13px] rounded"
                                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                                    />
                                    {gedReadyFormErrors.compositeScore && (
                                        <p className="text-[12px] text-red-600 mt-1">{gedReadyFormErrors.compositeScore}</p>
                                    )}
                                </div>

                                {/* Commentary */}
                                <div>
                                    <Label htmlFor="gedready-commentary" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Commentary
                                    </Label>
                                    <Textarea
                                        id="gedready-commentary"
                                        value={gedReadyFormData.commentary}
                                        onChange={(e) => setGedReadyFormData(prev => ({ ...prev, commentary: e.target.value }))}
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
                                        className="border-2 border-dashed rounded p-6 text-center cursor-pointer hover:bg-gray-50/50 transition-colors"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}
                                        onClick={() => document.getElementById('gedready-file-input')?.click()}
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
                                    <input
                                        id="gedready-file-input"
                                        ref={gedReadyFileInputRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        multiple
                                        onChange={handleGedReadyFileChange}
                                        style={{ display: 'none' }}
                                    />

                                    {gedReadyDocuments.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <Label className="block text-[12px] font-semibold uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Uploaded Documents ({gedReadyDocuments.length})
                                            </Label>
                                            <div 
                                                className="border rounded overflow-hidden"
                                                style={{ 
                                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                                }}
                                            >
                                                {gedReadyDocuments.map((doc, index) => (
                                                    <div 
                                                        key={doc.id} 
                                                        className="flex items-center justify-between p-3 hover:bg-gray-50/50"
                                                        style={{ 
                                                            borderBottom: index < gedReadyDocuments.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none'
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <File className="h-5 w-5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[13px] font-medium truncate" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {doc.name}
                                                                </p>
                                                                <p className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                    {(doc.size / 1024).toFixed(0)} KB • {doc.uploadedDate}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleGedReadyRemoveDocument(doc.id)}
                                                            className="h-8 w-8 p-0 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Casey Life Skills - Caregiver Specific Fields */}
                        {testingFormData.test === "Casey Life Skills - Caregiver" && (
                            <CaseyLifeSkillsCaregiverFields
                                formData={caseyLifeSkillsFormData}
                                onFormDataChange={setCaseyLifeSkillsFormData}
                                formErrors={caseyLifeSkillsFormErrors}
                                documents={caseyLifeSkillsDocuments}
                                onFileChange={handleCaseyLifeSkillsFileChange}
                                onRemoveDocument={handleRemoveCaseyLifeSkillsDocument}
                            />
                        )}

                        {/* Casey Life Skills (Youth) Specific Fields */}
                        {testingFormData.test === "Casey Life Skills" && (
                            <CaseyLifeSkillsYouthFields
                                formData={caseyLifeSkillsYouthFormData}
                                onFormDataChange={setCaseyLifeSkillsYouthFormData}
                                formErrors={caseyLifeSkillsYouthFormErrors}
                                documents={caseyLifeSkillsYouthDocuments}
                                onFileChange={handleCaseyLifeSkillsYouthFileChange}
                                onRemoveDocument={handleRemoveCaseyLifeSkillsYouthDocument}
                                availableCaregiverTests={testingAssessments.filter(t => 
                                    t.test === "Casey Life Skills - Caregiver" && 
                                    t.id !== editingTestingId
                                )}
                            />
                        )}

                        {/* Employability and Life Skills Assessment-Specific Fields */}
                        {testingFormData.test === "Employability and Life Skills Assessment" && (
                            <div className="space-y-6">
                                {/* FUNDAMENTAL Section */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        FUNDAMENTAL
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Appearance/Hygiene */}
                                        <div>
                                            <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Appearance/Hygiene
                                            </Label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="emp-appearance"
                                                        value="Yes"
                                                        checked={employabilityFormData.appearanceHygiene === "Yes"}
                                                        onChange={(e) => setEmployabilityFormData(prev => ({ ...prev, appearanceHygiene: e.target.value }))}
                                                        className="w-4 h-4 accent-[#145F33]"
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <span className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>Yes</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="emp-appearance"
                                                        value="No"
                                                        checked={employabilityFormData.appearanceHygiene === "No"}
                                                        onChange={(e) => setEmployabilityFormData(prev => ({ ...prev, appearanceHygiene: e.target.value }))}
                                                        className="w-4 h-4 accent-[#145F33]"
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <span className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>No</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Timeliness */}
                                        <div>
                                            <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Timeliness
                                            </Label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="emp-timeliness"
                                                        value="Yes"
                                                        checked={employabilityFormData.timeliness === "Yes"}
                                                        onChange={(e) => setEmployabilityFormData(prev => ({ ...prev, timeliness: e.target.value }))}
                                                        className="w-4 h-4 accent-[#145F33]"
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <span className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>Yes</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="emp-timeliness"
                                                        value="No"
                                                        checked={employabilityFormData.timeliness === "No"}
                                                        onChange={(e) => setEmployabilityFormData(prev => ({ ...prev, timeliness: e.target.value }))}
                                                        className="w-4 h-4 accent-[#145F33]"
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <span className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>No</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Oratory/Public Speaking */}
                                        <div>
                                            <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Oratory/Public Speaking
                                            </Label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="emp-oratory"
                                                        value="Yes"
                                                        checked={employabilityFormData.oratoryPublicSpeaking === "Yes"}
                                                        onChange={(e) => setEmployabilityFormData(prev => ({ ...prev, oratoryPublicSpeaking: e.target.value }))}
                                                        className="w-4 h-4 accent-[#145F33]"
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <span className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>Yes</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="emp-oratory"
                                                        value="No"
                                                        checked={employabilityFormData.oratoryPublicSpeaking === "No"}
                                                        onChange={(e) => setEmployabilityFormData(prev => ({ ...prev, oratoryPublicSpeaking: e.target.value }))}
                                                        className="w-4 h-4 accent-[#145F33]"
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <span className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>No</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* WORK ETHIC/CHARACTER Section */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        WORK ETHIC/CHARACTER
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Attitude */}
                                        <div>
                                            <Label htmlFor="emp-attitude" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Attitude
                                            </Label>
                                            <select
                                                id="emp-attitude"
                                                value={employabilityFormData.attitude}
                                                onChange={(e) => setEmployabilityFormData(prev => ({ ...prev, attitude: e.target.value }))}
                                                className="h-9 text-[13px] rounded w-full"
                                                style={{ 
                                                    backgroundColor: 'var(--slds-g-color-background-base)', 
                                                    border: '1px solid var(--slds-g-color-border-base-1)', 
                                                    color: employabilityFormData.attitude ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
                                                    paddingLeft: '12px',
                                                    paddingRight: '12px'
                                                }}
                                            >
                                                <option value="">Select...</option>
                                                <option value="1">1 - Below Standards/Expectations</option>
                                                <option value="2">2 - Meets Standards/Expectations</option>
                                                <option value="3">3 - Exceeds Standards/Expectations</option>
                                            </select>
                                        </div>

                                        {/* Accountability/Integrity */}
                                        <div>
                                            <Label htmlFor="emp-accountability" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Accountability/Integrity
                                            </Label>
                                            <select
                                                id="emp-accountability"
                                                value={employabilityFormData.accountabilityIntegrity}
                                                onChange={(e) => setEmployabilityFormData(prev => ({ ...prev, accountabilityIntegrity: e.target.value }))}
                                                className="h-9 text-[13px] rounded w-full"
                                                style={{ 
                                                    backgroundColor: 'var(--slds-g-color-background-base)', 
                                                    border: '1px solid var(--slds-g-color-border-base-1)', 
                                                    color: employabilityFormData.accountabilityIntegrity ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
                                                    paddingLeft: '12px',
                                                    paddingRight: '12px'
                                                }}
                                            >
                                                <option value="">Select...</option>
                                                <option value="1">1 - Below Standards/Expectations</option>
                                                <option value="2">2 - Meets Standards/Expectations</option>
                                                <option value="3">3 - Exceeds Standards/Expectations</option>
                                            </select>
                                        </div>

                                        {/* Self-Control */}
                                        <div>
                                            <Label htmlFor="emp-selfcontrol" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Self-Control
                                            </Label>
                                            <select
                                                id="emp-selfcontrol"
                                                value={employabilityFormData.selfControl}
                                                onChange={(e) => setEmployabilityFormData(prev => ({ ...prev, selfControl: e.target.value }))}
                                                className="h-9 text-[13px] rounded w-full"
                                                style={{ 
                                                    backgroundColor: 'var(--slds-g-color-background-base)', 
                                                    border: '1px solid var(--slds-g-color-border-base-1)', 
                                                    color: employabilityFormData.selfControl ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
                                                    paddingLeft: '12px',
                                                    paddingRight: '12px'
                                                }}
                                            >
                                                <option value="">Select...</option>
                                                <option value="1">1 - Below Standards/Expectations</option>
                                                <option value="2">2 - Meets Standards/Expectations</option>
                                                <option value="3">3 - Exceeds Standards/Expectations</option>
                                            </select>
                                        </div>

                                        {/* Ambition/Initiative */}
                                        <div>
                                            <Label htmlFor="emp-ambition" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Ambition/Initiative
                                            </Label>
                                            <select
                                                id="emp-ambition"
                                                value={employabilityFormData.ambitionInitiative}
                                                onChange={(e) => setEmployabilityFormData(prev => ({ ...prev, ambitionInitiative: e.target.value }))}
                                                className="h-9 text-[13px] rounded w-full"
                                                style={{ 
                                                    backgroundColor: 'var(--slds-g-color-background-base)', 
                                                    border: '1px solid var(--slds-g-color-border-base-1)', 
                                                    color: employabilityFormData.ambitionInitiative ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
                                                    paddingLeft: '12px',
                                                    paddingRight: '12px'
                                                }}
                                            >
                                                <option value="">Select...</option>
                                                <option value="1">1 - Below Standards/Expectations</option>
                                                <option value="2">2 - Meets Standards/Expectations</option>
                                                <option value="3">3 - Exceeds Standards/Expectations</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* PROBLEM SOLVING Section */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        PROBLEM SOLVING
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Supervision */}
                                        <div>
                                            <Label htmlFor="emp-supervision" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Supervision
                                            </Label>
                                            <select
                                                id="emp-supervision"
                                                value={employabilityFormData.supervision}
                                                onChange={(e) => setEmployabilityFormData(prev => ({ ...prev, supervision: e.target.value }))}
                                                className="h-9 text-[13px] rounded w-full"
                                                style={{ 
                                                    backgroundColor: 'var(--slds-g-color-background-base)', 
                                                    border: '1px solid var(--slds-g-color-border-base-1)', 
                                                    color: employabilityFormData.supervision ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
                                                    paddingLeft: '12px',
                                                    paddingRight: '12px'
                                                }}
                                            >
                                                <option value="">Select...</option>
                                                <option value="1">1 - Below Standards/Expectations</option>
                                                <option value="2">2 - Meets Standards/Expectations</option>
                                                <option value="3">3 - Exceeds Standards/Expectations</option>
                                            </select>
                                        </div>

                                        {/* Procedure/Rule Following */}
                                        <div>
                                            <Label htmlFor="emp-procedure" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Procedure/Rule Following
                                            </Label>
                                            <select
                                                id="emp-procedure"
                                                value={employabilityFormData.procedureRuleFollowing}
                                                onChange={(e) => setEmployabilityFormData(prev => ({ ...prev, procedureRuleFollowing: e.target.value }))}
                                                className="h-9 text-[13px] rounded w-full"
                                                style={{ 
                                                    backgroundColor: 'var(--slds-g-color-background-base)', 
                                                    border: '1px solid var(--slds-g-color-border-base-1)', 
                                                    color: employabilityFormData.procedureRuleFollowing ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
                                                    paddingLeft: '12px',
                                                    paddingRight: '12px'
                                                }}
                                            >
                                                <option value="">Select...</option>
                                                <option value="1">1 - Below Standards/Expectations</option>
                                                <option value="2">2 - Meets Standards/Expectations</option>
                                                <option value="3">3 - Exceeds Standards/Expectations</option>
                                            </select>
                                        </div>

                                        {/* Problem Solving Approach */}
                                        <div>
                                            <Label htmlFor="emp-problemsolving" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Problem Solving Approach
                                            </Label>
                                            <select
                                                id="emp-problemsolving"
                                                value={employabilityFormData.problemSolvingApproach}
                                                onChange={(e) => setEmployabilityFormData(prev => ({ ...prev, problemSolvingApproach: e.target.value }))}
                                                className="h-9 text-[13px] rounded w-full"
                                                style={{ 
                                                    backgroundColor: 'var(--slds-g-color-background-base)', 
                                                    border: '1px solid var(--slds-g-color-border-base-1)', 
                                                    color: employabilityFormData.problemSolvingApproach ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
                                                    paddingLeft: '12px',
                                                    paddingRight: '12px'
                                                }}
                                            >
                                                <option value="">Select...</option>
                                                <option value="1">1 - Below Standards/Expectations</option>
                                                <option value="2">2 - Meets Standards/Expectations</option>
                                                <option value="3">3 - Exceeds Standards/Expectations</option>
                                            </select>
                                        </div>

                                        {/* Information Management */}
                                        <div>
                                            <Label htmlFor="emp-information" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Information Management
                                            </Label>
                                            <select
                                                id="emp-information"
                                                value={employabilityFormData.informationManagement}
                                                onChange={(e) => setEmployabilityFormData(prev => ({ ...prev, informationManagement: e.target.value }))}
                                                className="h-9 text-[13px] rounded w-full"
                                                style={{ 
                                                    backgroundColor: 'var(--slds-g-color-background-base)', 
                                                    border: '1px solid var(--slds-g-color-border-base-1)', 
                                                    color: employabilityFormData.informationManagement ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
                                                    paddingLeft: '12px',
                                                    paddingRight: '12px'
                                                }}
                                            >
                                                <option value="">Select...</option>
                                                <option value="1">1 - Below Standards/Expectations</option>
                                                <option value="2">2 - Meets Standards/Expectations</option>
                                                <option value="3">3 - Exceeds Standards/Expectations</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* INTERPERSONAL Section */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        INTERPERSONAL
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Verbal Communication */}
                                        <div>
                                            <Label htmlFor="emp-verbal" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Verbal Communication
                                            </Label>
                                            <select
                                                id="emp-verbal"
                                                value={employabilityFormData.verbalCommunication}
                                                onChange={(e) => setEmployabilityFormData(prev => ({ ...prev, verbalCommunication: e.target.value }))}
                                                className="h-9 text-[13px] rounded w-full"
                                                style={{ 
                                                    backgroundColor: 'var(--slds-g-color-background-base)', 
                                                    border: '1px solid var(--slds-g-color-border-base-1)', 
                                                    color: employabilityFormData.verbalCommunication ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
                                                    paddingLeft: '12px',
                                                    paddingRight: '12px'
                                                }}
                                            >
                                                <option value="">Select...</option>
                                                <option value="1">1 - Below Standards/Expectations</option>
                                                <option value="2">2 - Meets Standards/Expectations</option>
                                                <option value="3">3 - Exceeds Standards/Expectations</option>
                                            </select>
                                        </div>

                                        {/* Active Listening */}
                                        <div>
                                            <Label htmlFor="emp-listening" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Active Listening
                                            </Label>
                                            <select
                                                id="emp-listening"
                                                value={employabilityFormData.activeListening}
                                                onChange={(e) => setEmployabilityFormData(prev => ({ ...prev, activeListening: e.target.value }))}
                                                className="h-9 text-[13px] rounded w-full"
                                                style={{ 
                                                    backgroundColor: 'var(--slds-g-color-background-base)', 
                                                    border: '1px solid var(--slds-g-color-border-base-1)', 
                                                    color: employabilityFormData.activeListening ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
                                                    paddingLeft: '12px',
                                                    paddingRight: '12px'
                                                }}
                                            >
                                                <option value="">Select...</option>
                                                <option value="1">1 - Below Standards/Expectations</option>
                                                <option value="2">2 - Meets Standards/Expectations</option>
                                                <option value="3">3 - Exceeds Standards/Expectations</option>
                                            </select>
                                        </div>

                                        {/* Feedback */}
                                        <div>
                                            <Label htmlFor="emp-feedback" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Feedback
                                            </Label>
                                            <select
                                                id="emp-feedback"
                                                value={employabilityFormData.feedback}
                                                onChange={(e) => setEmployabilityFormData(prev => ({ ...prev, feedback: e.target.value }))}
                                                className="h-9 text-[13px] rounded w-full"
                                                style={{ 
                                                    backgroundColor: 'var(--slds-g-color-background-base)', 
                                                    border: '1px solid var(--slds-g-color-border-base-1)', 
                                                    color: employabilityFormData.feedback ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
                                                    paddingLeft: '12px',
                                                    paddingRight: '12px'
                                                }}
                                            >
                                                <option value="">Select...</option>
                                                <option value="1">1 - Below Standards/Expectations</option>
                                                <option value="2">2 - Meets Standards/Expectations</option>
                                                <option value="3">3 - Exceeds Standards/Expectations</option>
                                            </select>
                                        </div>

                                        {/* Teamwork ≥ 2 people */}
                                        <div>
                                            <Label htmlFor="emp-teamwork" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Teamwork ≥ 2 people
                                            </Label>
                                            <select
                                                id="emp-teamwork"
                                                value={employabilityFormData.teamwork}
                                                onChange={(e) => setEmployabilityFormData(prev => ({ ...prev, teamwork: e.target.value }))}
                                                className="h-9 text-[13px] rounded w-full"
                                                style={{ 
                                                    backgroundColor: 'var(--slds-g-color-background-base)', 
                                                    border: '1px solid var(--slds-g-color-border-base-1)', 
                                                    color: employabilityFormData.teamwork ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
                                                    paddingLeft: '12px',
                                                    paddingRight: '12px'
                                                }}
                                            >
                                                <option value="">Select...</option>
                                                <option value="1">1 - Below Standards/Expectations</option>
                                                <option value="2">2 - Meets Standards/Expectations</option>
                                                <option value="3">3 - Exceeds Standards/Expectations</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* COMPUTER Section */}
                                <div>
                                    <h3 className="text-[13px] font-semibold mb-4 uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        COMPUTER
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Computer Literacy */}
                                        <div>
                                            <Label htmlFor="emp-computer" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Computer Literacy
                                            </Label>
                                            <select
                                                id="emp-computer"
                                                value={employabilityFormData.computerLiteracy}
                                                onChange={(e) => setEmployabilityFormData(prev => ({ ...prev, computerLiteracy: e.target.value }))}
                                                className="h-9 text-[13px] rounded w-full"
                                                style={{ 
                                                    backgroundColor: 'var(--slds-g-color-background-base)', 
                                                    border: '1px solid var(--slds-g-color-border-base-1)', 
                                                    color: employabilityFormData.computerLiteracy ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)',
                                                    paddingLeft: '12px',
                                                    paddingRight: '12px'
                                                }}
                                            >
                                                <option value="">Select...</option>
                                                <option value="1">1 - Below Standards/Expectations</option>
                                                <option value="2">2 - Meets Standards/Expectations</option>
                                                <option value="3">3 - Exceeds Standards/Expectations</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Commentary */}
                                <div>
                                    <Label htmlFor="emp-commentary" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Commentary
                                    </Label>
                                    <Textarea
                                        id="emp-commentary"
                                        value={employabilityFormData.commentary}
                                        onChange={(e) => setEmployabilityFormData(prev => ({ ...prev, commentary: e.target.value }))}
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
                                        className="border-2 border-dashed rounded p-6 text-center cursor-pointer hover:bg-gray-50/50 transition-colors"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}
                                        onClick={() => document.getElementById('employability-file-input')?.click()}
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
                                                document.getElementById('employability-file-input')?.click();
                                            }}
                                        >
                                            Choose File
                                        </Button>
                                        <input
                                            id="employability-file-input"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            multiple
                                            onChange={handleEmployabilityFileSelect}
                                        />
                                    </div>

                                    {/* Uploaded Documents List */}
                                    {employabilityDocuments.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <Label className="block text-[12px] font-semibold uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                Uploaded Documents ({employabilityDocuments.length})
                                            </Label>
                                            <div 
                                                className="border rounded overflow-hidden"
                                                style={{ 
                                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                                }}
                                            >
                                                {employabilityDocuments.map((doc, index) => (
                                                    <div 
                                                        key={doc.id} 
                                                        className="flex items-center justify-between p-3 hover:bg-gray-50/50"
                                                        style={{ 
                                                            borderBottom: index < employabilityDocuments.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none'
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <File className="h-5 w-5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[13px] font-medium truncate" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {doc.name}
                                                                </p>
                                                                <p className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                    {(doc.size / 1024).toFixed(0)} KB • {doc.uploadedDate}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEmployabilityRemoveDocument(doc.id)}
                                                            className="h-8 w-8 p-0 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <LeadDetailWj4Fields
                          testingFormData={testingFormData}
                          wj4FormData={wj4FormData}
                          wj4FormErrors={wj4FormErrors}
                          wj4GradeFormData={wj4GradeFormData}
                          wj4GradeFormErrors={wj4GradeFormErrors}
                          setWj4FormData={setWj4FormData}
                          setWj4GradeFormData={setWj4GradeFormData}
                          handleWj4AgeEquivalencyChange={handleWj4AgeEquivalencyChange}
                          handleWj4GradeEquivalencyChange={handleWj4GradeEquivalencyChange}
                          handleWj4GradePercentileChange={handleWj4GradePercentileChange}
                          handleWj4GradeRPIChange={handleWj4GradeRPIChange}
                          handleWj4PercentileChange={handleWj4PercentileChange}
                          handleWj4RPIChange={handleWj4RPIChange}
                        />
    </>
  );
}