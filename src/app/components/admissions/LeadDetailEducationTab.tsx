import { useState, useMemo, useEffect, useRef } from "react";
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

interface LeadDetailEducationTabProps {
  activeEducationSection: any;
  activeTab: any;
  careerRecommendationComments: any;
  careerRecommendations: any;
  mockSchoolAccounts: any;
  newSchoolData: any;
  newSchoolRecommendation: any;
  schoolComments: any;
  schoolSearch: any;
  selectedSchoolAccount: any;
  setActiveEducationSection: any;
  setCareerRecommendationComments: any;
  setCareerRecommendations: any;
  setNewSchoolData: any;
  setNewSchoolRecommendation: any;
  setSchoolComments: any;
  setSchoolSearch: any;
  setSelectedSchoolAccount: any;
  setShowSchoolDropdown: any;
  setShowSchoolModal: any;
  showSchoolDropdown: any;
  showSchoolModal: any;
}

export function LeadDetailEducationTab({ activeEducationSection, activeTab, careerRecommendationComments, careerRecommendations, mockSchoolAccounts, newSchoolData, newSchoolRecommendation, schoolComments, schoolSearch, selectedSchoolAccount, setActiveEducationSection, setCareerRecommendationComments, setCareerRecommendations, setNewSchoolData, setNewSchoolRecommendation, setSchoolComments, setSchoolSearch, setSelectedSchoolAccount, setShowSchoolDropdown, setShowSchoolModal, showSchoolDropdown, showSchoolModal }: LeadDetailEducationTabProps) {
  return (
    <>
                        {activeTab === "education" && (
                            <div className="space-y-6 w-full">
                                {/* Horizontal Sub-Tabs Navigation */}
                                <div 
                                  className="border rounded-md overflow-hidden"
                                  style={{ 
                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                    backgroundColor: 'var(--slds-g-color-background-alt)'
                                  }}
                                >
                                    <div className="flex overflow-x-auto overflow-y-hidden">
                                        <button
                                          onClick={() => setActiveEducationSection("academic")}
                                          className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                                            activeEducationSection === "academic" 
                                              ? "text-[#145F33]" 
                                              : "text-[#706e6b] hover:text-[#080707]"
                                          }`}
                                          style={
                                            activeEducationSection === "academic"
                                              ? {
                                                  borderBottom: "3px solid #145F33",
                                                  marginBottom: "-1px"
                                                }
                                              : {}
                                          }
                                        >
                                            Academic
                                        </button>
                                        <button
                                          onClick={() => setActiveEducationSection("behavioural")}
                                          className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                                            activeEducationSection === "behavioural" 
                                              ? "text-[#145F33]" 
                                              : "text-[#706e6b] hover:text-[#080707]"
                                          }`}
                                          style={
                                            activeEducationSection === "behavioural"
                                              ? {
                                                  borderBottom: "3px solid #145F33",
                                                  marginBottom: "-1px"
                                                }
                                              : {}
                                          }
                                        >
                                            Behavioral
                                        </button>
                                        <button
                                          onClick={() => setActiveEducationSection("employment")}
                                          className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                                            activeEducationSection === "employment" 
                                              ? "text-[#145F33]" 
                                              : "text-[#706e6b] hover:text-[#080707]"
                                          }`}
                                          style={
                                            activeEducationSection === "employment"
                                              ? {
                                                  borderBottom: "3px solid #145F33",
                                                  marginBottom: "-1px"
                                                }
                                              : {}
                                          }
                                        >
                                            Employment & Extracurricular
                                        </button>
                                        <button
                                          onClick={() => setActiveEducationSection("recommendations")}
                                          className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                                            activeEducationSection === "recommendations" 
                                              ? "text-[#145F33]" 
                                              : "text-[#706e6b] hover:text-[#080707]"
                                          }`}
                                          style={
                                            activeEducationSection === "recommendations"
                                              ? {
                                                  borderBottom: "3px solid #145F33",
                                                  marginBottom: "-1px"
                                                }
                                              : {}
                                          }
                                        >
                                            Recommendations
                                        </button>
                                    </div>
                                </div>

                                {/* Sub-Tab Content Sections */}
                                {activeEducationSection === "academic" && <EducationCareerView />}
                                
                                {activeEducationSection === "behavioural" && (
                                    <div 
                                      className="overflow-hidden"
                                      style={{
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        borderRadius: 'var(--slds-c-card-radius-border)',
                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                      }}
                                    >
                                        <div className="p-3 sm:p-6">
                                            <div className="space-y-6">
                                                {/* Has the youth been suspended? */}
                                                <div>
                                                    <Label 
                                                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Has the youth been suspended?
                                                    </Label>
                                                    <div className="flex gap-6">
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="suspended-yes"
                                                              name="suspended"
                                                              value="yes"
                                                              defaultChecked
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="suspended-yes" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                Yes
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="suspended-no"
                                                              name="suspended"
                                                              value="no"
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="suspended-no" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                No
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="suspended-unknown"
                                                              name="suspended"
                                                              value="unknown"
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="suspended-unknown" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                Unknown
                                                            </Label>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Has the youth been expelled? */}
                                                <div>
                                                    <Label 
                                                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Has the youth been expelled?
                                                    </Label>
                                                    <div className="flex gap-6">
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="expelled-yes"
                                                              name="expelled"
                                                              value="yes"
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="expelled-yes" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                Yes
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="expelled-no"
                                                              name="expelled"
                                                              value="no"
                                                              defaultChecked
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="expelled-no" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                No
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="expelled-unknown"
                                                              name="expelled"
                                                              value="unknown"
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="expelled-unknown" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                Unknown
                                                            </Label>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Does the youth have attendance issues? */}
                                                <div>
                                                    <Label 
                                                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Does the youth have attendance issues?
                                                    </Label>
                                                    <div className="flex gap-6">
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="attendance-yes"
                                                              name="attendance"
                                                              value="yes"
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="attendance-yes" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                Yes
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="attendance-no"
                                                              name="attendance"
                                                              value="no"
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="attendance-no" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                No
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="attendance-unknown"
                                                              name="attendance"
                                                              value="unknown"
                                                              defaultChecked
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="attendance-unknown" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                Unknown
                                                            </Label>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Does the youth have tardiness issues? */}
                                                <div>
                                                    <Label 
                                                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Does the youth have tardiness issues?
                                                    </Label>
                                                    <div className="flex gap-6">
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="tardiness-yes"
                                                              name="tardiness"
                                                              value="yes"
                                                              defaultChecked
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="tardiness-yes" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                Yes
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="tardiness-no"
                                                              name="tardiness"
                                                              value="no"
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="tardiness-no" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                No
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="tardiness-unknown"
                                                              name="tardiness"
                                                              value="unknown"
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="tardiness-unknown" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                Unknown
                                                            </Label>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Summary */}
                                                <div>
                                                    <Label 
                                                      htmlFor="behavioural-summary" 
                                                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Summary:
                                                    </Label>
                                                    <Textarea
                                                      id="behavioural-summary"
                                                      placeholder="Enter Behavioral Summary Notes"
                                                      rows={6}
                                                      className="text-[13px] resize-none"
                                                      style={{ 
                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                      }}
                                                    />
                                                </div>

                                                {/* Save / Cancel */}
                                                <div className="flex justify-end gap-3 pt-4">
                                                    <Button
                                                        variant="outline"
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
                                                        className="h-9 px-6 text-[13px] font-medium rounded-full"
                                                        style={{
                                                            backgroundColor: '#145F33',
                                                            color: 'white'
                                                        }}
                                                    >
                                                        Save
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeEducationSection === "employment" && (
                                    <div 
                                      className="overflow-hidden"
                                      style={{
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        borderRadius: 'var(--slds-c-card-radius-border)',
                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                      }}
                                    >
                                        <div className="p-3 sm:p-6">
                                            <div className="space-y-6">
                                                {/* Does the youth have experience applying to jobs? */}
                                                <div>
                                                    <Label 
                                                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Does the youth have experience applying to jobs?
                                                    </Label>
                                                    <div className="flex gap-6">
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="applying-yes"
                                                              name="applying"
                                                              value="yes"
                                                              defaultChecked
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="applying-yes" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                Yes
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="applying-no"
                                                              name="applying"
                                                              value="no"
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="applying-no" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                No
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="applying-unknown"
                                                              name="applying"
                                                              value="unknown"
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="applying-unknown" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                Unknown
                                                            </Label>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Does the youth have experience interviewing for jobs? */}
                                                <div>
                                                    <Label 
                                                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Does the youth have experience interviewing for jobs?
                                                    </Label>
                                                    <div className="flex gap-6">
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="interviewing-yes"
                                                              name="interviewing"
                                                              value="yes"
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="interviewing-yes" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                Yes
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="interviewing-no"
                                                              name="interviewing"
                                                              value="no"
                                                              defaultChecked
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="interviewing-no" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                No
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="interviewing-unknown"
                                                              name="interviewing"
                                                              value="unknown"
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="interviewing-unknown" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                Unknown
                                                            </Label>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Does the youth have formal employment experience? */}
                                                <div>
                                                    <Label 
                                                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Does the youth have formal employment experience?
                                                    </Label>
                                                    <div className="flex gap-6">
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="formal-yes"
                                                              name="formal"
                                                              value="yes"
                                                              defaultChecked
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="formal-yes" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                Yes
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="formal-no"
                                                              name="formal"
                                                              value="no"
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="formal-no" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                No
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="formal-unknown"
                                                              name="formal"
                                                              value="unknown"
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="formal-unknown" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                Unknown
                                                            </Label>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Does the youth have informal employment experience? */}
                                                <div>
                                                    <Label 
                                                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Does the youth have informal employment experience?
                                                    </Label>
                                                    <div className="flex gap-6">
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="informal-yes"
                                                              name="informal"
                                                              value="yes"
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="informal-yes" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                Yes
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="informal-no"
                                                              name="informal"
                                                              value="no"
                                                              defaultChecked
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="informal-no" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                No
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="informal-unknown"
                                                              name="informal"
                                                              value="unknown"
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="informal-unknown" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                Unknown
                                                            </Label>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Does the youth have internship experience? */}
                                                <div>
                                                    <Label 
                                                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Does the youth have internship experience?
                                                    </Label>
                                                    <div className="flex gap-6">
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="internship-yes"
                                                              name="internship"
                                                              value="yes"
                                                              defaultChecked
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="internship-yes" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                Yes
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="internship-no"
                                                              name="internship"
                                                              value="no"
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="internship-no" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                No
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="internship-unknown"
                                                              name="internship"
                                                              value="unknown"
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="internship-unknown" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                Unknown
                                                            </Label>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Has the youth been fired from a job? */}
                                                <div>
                                                    <Label 
                                                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Has the youth been fired from a job?
                                                    </Label>
                                                    <div className="flex gap-6">
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="fired-yes"
                                                              name="fired"
                                                              value="yes"
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="fired-yes" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                Yes
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="fired-no"
                                                              name="fired"
                                                              value="no"
                                                              defaultChecked
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="fired-no" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                No
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                              type="radio"
                                                              id="fired-unknown"
                                                              name="fired"
                                                              value="unknown"
                                                              className="w-4 h-4 cursor-pointer"
                                                              style={{ accentColor: '#145F33' }}
                                                            />
                                                            <Label 
                                                              htmlFor="fired-unknown" 
                                                              className="text-[13px] cursor-pointer"
                                                              style={{ color: 'var(--slds-g-color-text-default)' }}
                                                            >
                                                                Unknown
                                                            </Label>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Potential Career Interests */}
                                                <div>
                                                    <Label 
                                                      htmlFor="career-interests" 
                                                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Potential Career Interests:
                                                    </Label>
                                                    <Textarea
                                                      id="career-interests"
                                                      placeholder="Enter Potential Career Interest Notes"
                                                      rows={6}
                                                      className="text-[13px] resize-none"
                                                      style={{ 
                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                      }}
                                                    />
                                                </div>

                                                {/* Career Summary */}
                                                <div>
                                                    <Label 
                                                      htmlFor="career-summary" 
                                                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Career Summary:
                                                    </Label>
                                                    <Textarea
                                                      id="career-summary"
                                                      placeholder="Enter Career Summary Notes"
                                                      rows={6}
                                                      className="text-[13px] resize-none"
                                                      style={{ 
                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                      }}
                                                    />
                                                </div>

                                                {/* Extracurricular Interest Summary */}
                                                <div>
                                                    <Label 
                                                      htmlFor="extracurricular-summary" 
                                                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Extracurricular Interest Summary:
                                                    </Label>
                                                    <Textarea
                                                      id="extracurricular-summary"
                                                      placeholder="Enter Extracurricular Interest Summary Notes"
                                                      rows={6}
                                                      className="text-[13px] resize-none"
                                                      style={{ 
                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                      }}
                                                    />
                                                </div>

                                                {/* Save / Cancel */}
                                                <div className="flex justify-end gap-3 pt-4">
                                                    <Button
                                                        variant="outline"
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
                                                        className="h-9 px-6 text-[13px] font-medium rounded-full"
                                                        style={{
                                                            backgroundColor: '#145F33',
                                                            color: 'white'
                                                        }}
                                                    >
                                                        Save
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeEducationSection === "recommendations" && (
                                    <div 
                                      className="overflow-hidden"
                                      style={{
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        borderRadius: 'var(--slds-c-card-radius-border)',
                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                      }}
                                    >
                                        <div className="p-3 sm:p-6">
                                            <div className="space-y-6">
                                                {/* New School Recommendation? Radio Buttons */}
                                                <div>
                                                    <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                        New School Recommendation?
                                                    </Label>
                                                    <RadioGroup value={newSchoolRecommendation} onValueChange={setNewSchoolRecommendation}>
                                                        <div className="flex items-center gap-6">
                                                            <div className="flex items-center gap-2">
                                                                <RadioGroupItem value="yes" id="new-school-yes" />
                                                                <Label htmlFor="new-school-yes" className="text-[13px] cursor-pointer">Yes</Label>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <RadioGroupItem value="no" id="new-school-no" />
                                                                <Label htmlFor="new-school-no" className="text-[13px] cursor-pointer">No</Label>
                                                            </div>
                                                        </div>
                                                    </RadioGroup>
                                                </div>

                                                {/* Recommended School Lookup - Only visible if "Yes" is selected */}
                                                {newSchoolRecommendation === "yes" && (
                                                    <>
                                                        <div>
                                                            <Label 
                                                              htmlFor="recommended-school" 
                                                              className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                              style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                Recommended School: <span className="text-red-600">*</span>
                                                            </Label>
                                                            <div className="flex gap-2">
                                                                <div id="school-search-container" className="relative flex-1">
                                                                    {selectedSchoolAccount ? (
                                                                        <div 
                                                                          className="h-9 px-3 rounded flex items-center justify-between text-[13px] bg-gray-50"
                                                                          style={{
                                                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                                                            color: 'var(--slds-g-color-text-default)'
                                                                          }}
                                                                        >
                                                                            <span>{selectedSchoolAccount.name}</span>
                                                                            <button
                                                                              onClick={() => {
                                                                                setSelectedSchoolAccount(null);
                                                                                setSchoolSearch("");
                                                                              }}
                                                                              className="ml-2 hover:bg-gray-200 rounded p-1"
                                                                              style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                                            >
                                                                                <XIcon className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <Input
                                                                              id="recommended-school"
                                                                              type="text"
                                                                              placeholder="Search for a school..."
                                                                              value={schoolSearch}
                                                                              onChange={(e) => {
                                                                                setSchoolSearch(e.target.value);
                                                                                setShowSchoolDropdown(true);
                                                                              }}
                                                                              onFocus={() => setShowSchoolDropdown(true)}
                                                                              className="text-[13px]"
                                                                              style={{
                                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                                                color: 'var(--slds-g-color-text-default)'
                                                                              }}
                                                                            />
                                                                            {showSchoolDropdown && (
                                                                                <div 
                                                                                  className="absolute z-50 w-full mt-1 rounded shadow-lg"
                                                                                  style={{
                                                                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                                                    maxHeight: '240px',
                                                                                    overflowY: 'auto'
                                                                                  }}
                                                                                >
                                                                                    {/* Filtered School Results */}
                                                                                    {mockSchoolAccounts
                                                                                      .filter(school => 
                                                                                        school.name.toLowerCase().includes(schoolSearch.toLowerCase())
                                                                                      )
                                                                                      .map(school => (
                                                                                        <button
                                                                                          type="button"
                                                                                          key={school.id}
                                                                                          onClick={(e) => {
                                                                                            e.preventDefault();
                                                                                            e.stopPropagation();
                                                                                            setSelectedSchoolAccount({ id: school.id, name: school.name });
                                                                                            setSchoolSearch("");
                                                                                            setShowSchoolDropdown(false);
                                                                                          }}
                                                                                          className="w-full px-3 py-2 text-left text-[13px] hover:bg-gray-100 flex items-center justify-between"
                                                                                          style={{
                                                                                            backgroundColor: selectedSchoolAccount?.id === school.id ? '#f0fdf4' : 'transparent'
                                                                                          }}
                                                                                        >
                                                                                          <div>
                                                                                            <div style={{ color: 'var(--slds-g-color-text-default)', fontWeight: 500 }}>
                                                                                              {school.name}
                                                                                            </div>
                                                                                            <div style={{ color: 'var(--slds-g-color-text-weak)', fontSize: '12px' }}>
                                                                                              {school.type} • {school.level}
                                                                                            </div>
                                                                                          </div>
                                                                                          {selectedSchoolAccount?.id === school.id && (
                                                                                            <Check className="w-4 h-4" style={{ color: '#145F33' }} />
                                                                                          )}
                                                                                        </button>
                                                                                      ))}
                                                                                    
                                                                                    {mockSchoolAccounts.filter(school => 
                                                                                      school.name.toLowerCase().includes(schoolSearch.toLowerCase())
                                                                                    ).length === 0 && schoolSearch && (
                                                                                      <div className="px-3 py-4 text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                                                        No schools found.
                                                                                      </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </div>
                                                                <button
                                                                  onClick={() => setShowSchoolModal(true)}
                                                                  className="px-4 h-9 rounded flex items-center gap-2 text-[13px] font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                                                                  style={{
                                                                    backgroundColor: '#145F33',
                                                                    color: 'white'
                                                                  }}
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                    <span>New School</span>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* School Comments - Only visible if "Yes" is selected */}
                                                        <div>
                                                            <Label 
                                                              htmlFor="school-comments" 
                                                              className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                              style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                School Comments: <span className="text-red-600">*</span>
                                                            </Label>
                                                            <Textarea
                                                              id="school-comments"
                                                              placeholder="Enter school comments..."
                                                              value={schoolComments}
                                                              onChange={(e) => setSchoolComments(e.target.value)}
                                                              rows={6}
                                                              className="text-[13px] resize-none"
                                                              style={{ 
                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                              }}
                                                            />
                                                        </div>
                                                    </>
                                                )}

                                                {/* Career Recommendations? Multi-Select */}
                                                <div>
                                                    <Label 
                                                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Career Recommendations?
                                                    </Label>
                                                    <div className="space-y-2">
                                                        {['Career Awareness', 'Job Readiness', 'Advanced'].map((option) => (
                                                            <div key={option}>
                                                                <div className="flex items-center gap-2">
                                                                    <Checkbox
                                                                      id={`career-${option.toLowerCase().replace(' ', '-')}`}
                                                                      checked={careerRecommendations.includes(option)}
                                                                      onCheckedChange={(checked) => {
                                                                        if (checked) {
                                                                          setCareerRecommendations([...careerRecommendations, option]);
                                                                        } else {
                                                                          setCareerRecommendations(careerRecommendations.filter(item => item !== option));
                                                                          const updated = { ...careerRecommendationComments };
                                                                          delete updated[option];
                                                                          setCareerRecommendationComments(updated);
                                                                        }
                                                                      }}
                                                                    />
                                                                    <Label 
                                                                      htmlFor={`career-${option.toLowerCase().replace(' ', '-')}`}
                                                                      className="text-[13px] cursor-pointer"
                                                                    >
                                                                      {option}
                                                                    </Label>
                                                                </div>
                                                                {careerRecommendations.includes(option) && (
                                                                    <div className="ml-6 mt-1.5 mb-1">
                                                                        <Label 
                                                                          htmlFor={`career-comment-${option.toLowerCase().replace(' ', '-')}`}
                                                                          className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                                          style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                                        >
                                                                            Comment:
                                                                        </Label>
                                                                        <Textarea
                                                                          id={`career-comment-${option.toLowerCase().replace(' ', '-')}`}
                                                                          placeholder={`Enter comment for ${option}...`}
                                                                          value={careerRecommendationComments[option] || ''}
                                                                          onChange={(e) => setCareerRecommendationComments({ ...careerRecommendationComments, [option]: e.target.value })}
                                                                          rows={3}
                                                                          className="text-[13px] resize-none"
                                                                          style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>


                                                {/* Save / Cancel */}
                                                <div className="flex justify-end gap-3 pt-4">
                                                    <Button
                                                        variant="outline"
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
                                                        className="h-9 px-6 text-[13px] font-medium rounded-full"
                                                        style={{
                                                            backgroundColor: '#145F33',
                                                            color: 'white'
                                                        }}
                                                    >
                                                        Save
                                                    </Button>
                                                </div>
                                            </div>
                                            
                                            {/* New School Modal */}
                                            <Dialog open={showSchoolModal} onOpenChange={setShowSchoolModal}>
                                                <DialogContent className="sm:max-w-[600px]" aria-describedby={undefined}>
                                                    <DialogHeader>
                                                        <DialogTitle style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            New School
                                                        </DialogTitle>
                                                        <DialogDescription style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                            Create a new school account record.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    
                                                    <div className="space-y-4 py-4">
                                                        {/* Name */}
                                                        <div>
                                                            <Label 
                                                              htmlFor="new-school-name" 
                                                              className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                              style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                Name: <span className="text-red-600">*</span>
                                                            </Label>
                                                            <Input
                                                              id="new-school-name"
                                                              value={newSchoolData.name}
                                                              onChange={(e) => setNewSchoolData({...newSchoolData, name: e.target.value})}
                                                              placeholder="Enter school name..."
                                                              className="text-[13px]"
                                                            />
                                                        </div>
                                                        
                                                        {/* School Type */}
                                                        <div>
                                                            <Label 
                                                              htmlFor="new-school-type" 
                                                              className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                              style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                School Type:
                                                            </Label>
                                                            <Select 
                                                              value={newSchoolData.schoolType} 
                                                              onValueChange={(value) => setNewSchoolData({...newSchoolData, schoolType: value})}
                                                            >
                                                                <SelectTrigger id="new-school-type" className="text-[13px]">
                                                                    <SelectValue placeholder="Select school type..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Public High School">Public High School</SelectItem>
                                                                    <SelectItem value="Private School">Private School</SelectItem>
                                                                    <SelectItem value="Charter School">Charter School</SelectItem>
                                                                    <SelectItem value="Alternative School">Alternative School</SelectItem>
                                                                    <SelectItem value="Vocational School">Vocational School</SelectItem>
                                                                    <SelectItem value="Technical School">Technical School</SelectItem>
                                                                    <SelectItem value="Online School">Online School</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        
                                                        {/* School Level */}
                                                        <div>
                                                            <Label 
                                                              htmlFor="new-school-level" 
                                                              className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                              style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                School Level:
                                                            </Label>
                                                            <Select 
                                                              value={newSchoolData.schoolLevel} 
                                                              onValueChange={(value) => setNewSchoolData({...newSchoolData, schoolLevel: value})}
                                                            >
                                                                <SelectTrigger id="new-school-level" className="text-[13px]">
                                                                    <SelectValue placeholder="Select school level..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Elementary School">Elementary School</SelectItem>
                                                                    <SelectItem value="Middle School">Middle School</SelectItem>
                                                                    <SelectItem value="High School">High School</SelectItem>
                                                                    <SelectItem value="Middle & High School">Middle & High School</SelectItem>
                                                                    <SelectItem value="K-12">K-12</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        
                                                        {/* Address & Phone Section Header */}
                                                        <div 
                                                          className="pt-3 pb-1 mb-1"
                                                          style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                                                        >
                                                            <div 
                                                              className="text-[11px] font-semibold uppercase tracking-wide"
                                                              style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                Address
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Street */}
                                                        <div>
                                                            <Label 
                                                              htmlFor="new-school-street" 
                                                              className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                              style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                Street:
                                                            </Label>
                                                            <Input
                                                              id="new-school-street"
                                                              value={newSchoolData.street}
                                                              onChange={(e) => setNewSchoolData({...newSchoolData, street: e.target.value})}
                                                              placeholder="Street"
                                                              className="text-[13px]"
                                                            />
                                                        </div>
                                                        
                                                        {/* City and State */}
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <Label 
                                                                  htmlFor="new-school-city" 
                                                                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                                >
                                                                    City:
                                                                </Label>
                                                                <Input
                                                                  id="new-school-city"
                                                                  value={newSchoolData.city}
                                                                  onChange={(e) => setNewSchoolData({...newSchoolData, city: e.target.value})}
                                                                  placeholder="City"
                                                                  className="text-[13px]"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label 
                                                                  htmlFor="new-school-state" 
                                                                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                                >
                                                                    State:
                                                                </Label>
                                                                <Input
                                                                  id="new-school-state"
                                                                  value={newSchoolData.state}
                                                                  onChange={(e) => setNewSchoolData({...newSchoolData, state: e.target.value})}
                                                                  placeholder="State"
                                                                  className="text-[13px]"
                                                                />
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Postal Code and Country */}
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <Label 
                                                                  htmlFor="new-school-postalcode" 
                                                                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                                >
                                                                    Postal Code:
                                                                </Label>
                                                                <Input
                                                                  id="new-school-postalcode"
                                                                  value={newSchoolData.postalCode}
                                                                  onChange={(e) => setNewSchoolData({...newSchoolData, postalCode: e.target.value})}
                                                                  placeholder="Postal Code"
                                                                  className="text-[13px]"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label 
                                                                  htmlFor="new-school-country" 
                                                                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                                >
                                                                    Country:
                                                                </Label>
                                                                <Input
                                                                  id="new-school-country"
                                                                  value={newSchoolData.country}
                                                                  onChange={(e) => setNewSchoolData({...newSchoolData, country: e.target.value})}
                                                                  placeholder="Country"
                                                                  className="text-[13px]"
                                                                />
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Phone Section Header */}
                                                        <div 
                                                          className="pt-3 pb-1 mb-1"
                                                          style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                                                        >
                                                            <div 
                                                              className="text-[11px] font-semibold uppercase tracking-wide"
                                                              style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                Phone
                                                            </div>
                                                        </div>

                                                        {/* Phone Number */}
                                                        <div>
                                                            <Label 
                                                              htmlFor="new-school-phone" 
                                                              className="block text-[12px] font-semibold mb-1.5 uppercase"
                                                              style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                Phone Number:
                                                            </Label>
                                                            <Input
                                                              id="new-school-phone"
                                                              value={newSchoolData.phoneNumber}
                                                              onChange={(e) => setNewSchoolData({...newSchoolData, phoneNumber: e.target.value})}
                                                              placeholder="Enter phone number"
                                                              className="text-[13px]"
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    <DialogFooter>
                                                        <Button
                                                          variant="outline"
                                                          onClick={() => {
                                                            setShowSchoolModal(false);
                                                            setNewSchoolData({
                                                              name: "",
                                                              schoolType: "",
                                                              schoolLevel: "",
                                                              street: "",
                                                              city: "",
                                                              state: "",
                                                              postalCode: "",
                                                              country: "",
                                                              phoneNumber: ""
                                                            });
                                                          }}
                                                          className="rounded-full px-4 text-[13px]"
                                                        >
                                                          Cancel
                                                        </Button>
                                                        <Button
                                                          onClick={() => {
                                                            // Validation
                                                            if (!newSchoolData.name.trim()) {
                                                              return; // Silent validation - don't save if name is empty
                                                            }
                                                            
                                                            // Create new school and select it
                                                            const newSchool = {
                                                              id: `new-${Date.now()}`,
                                                              name: newSchoolData.name
                                                            };
                                                            setSelectedSchoolAccount(newSchool);
                                                            
                                                            // Reset form and close modal
                                                            setShowSchoolModal(false);
                                                            setNewSchoolData({
                                                              name: "",
                                                              schoolType: "",
                                                              schoolLevel: "",
                                                              street: "",
                                                              city: "",
                                                              state: "",
                                                              postalCode: "",
                                                              country: "",
                                                              phoneNumber: ""
                                                            });
                                                          }}
                                                          className="rounded-full px-4 text-[13px]"
                                                          style={{ 
                                                            backgroundColor: '#145F33',
                                                            color: 'white'
                                                          }}
                                                        >
                                                          Save
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
    </>
  );
}
