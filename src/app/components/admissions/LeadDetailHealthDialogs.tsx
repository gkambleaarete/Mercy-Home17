import { useState, useMemo, useEffect, useRef } from "react";
import { YouthAlertIcons } from "../youth/YouthAlertIcons";
import {
  ChevronRight,
  Plus,
  User,
  Users,
  Building2,
  Phone,
  Mail,
  CheckSquare,
  Upload,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle,
  Pencil,
  Trash2,
  ChevronDown,
  FileText,
  ChevronUp,
  Check,
  X as XIcon,
  ChevronUp as ArrowUp,
  ChevronDown as ArrowDown,
  MoreVertical,
  Download,
  Eye,
  File,
  Search,
} from "@/app/lib/lucide-icons";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { toast } from "sonner@2.0.3";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { IncidentDetailsDialog } from "../dialogs/IncidentDetailsDialog";
import {
  LegalInvolvementDialog,
  LegalInvolvementRecord,
} from "../dialogs/LegalInvolvementDialog";
import {
  DCFSInvolvementDialog,
  DCFSInvolvementRecord,
} from "../dialogs/DCFSInvolvementDialog";
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
import {
  ActivityTimeline,
  TimelineActivity,
} from "../ActivityTimeline";
import { CaseyLifeSkillsCaregiverFields } from "./CaseyLifeSkillsCaregiverFields";
import { CaseyLifeSkillsYouthFields } from "./CaseyLifeSkillsYouthFields";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";
import { InsurancePolicyDialog } from "./InsurancePolicyDialog";

const EMERGENCY_CONTACT_RELATIONSHIP_TYPES = [
  "Admissions Clinician",
  "Adoptive Brother",
  "Adoptive Daughter",
  "Adoptive Father",
  "Adoptive Granddaughter",
  "Adoptive Grandfather",
  "Adoptive Grandmother",
  "Adoptive Grandson",
  "Adoptive Mother",
  "Adoptive Sister",
  "Adoptive Son",
  "Advisee",
  "Advisor",
  "Aunt",
  "Brother",
  "Case Worker",
  "Cousin",
  "Father",
  "Foster Parent",
  "Grandfather",
  "Grandmother",
  "Grandparent",
  "Guardian",
  "Mother",
  "Other",
  "Sibling",
  "Sister",
  "Uncle",
];

interface LeadDetailHealthDialogsProps {
  availableSubstances: any;
  diagnoses: any;
  diagnosisActiveTab: any;
  diagnosisDialogOpen: any;
  diagnosisFormData: any;
  disclosureDialogOpen: any;
  disclosureFormData: any;
  disclosureReadOnly: any;
  setDisclosureReadOnly: any;
  disclosureSubstanceDialogOpen: any;
  disclosureSubstanceSelection: any;
  toggleDisclosureSubstance: any;
  disclosureSubstanceSearchInput: any;
  setDisclosureSubstanceSearchInput: any;
  disclosureSubstanceSearchApplied: any;
  handleFindDisclosureSubstances: any;
  handleClearDisclosureSubstances: any;
  handleApplyDisclosureSubstances: any;
  handleOpenDisclosureSubstances: any;
  editingDiagnosisId: any;
  editingDisclosureId: any;
  editingEmergencyContactId: any;
  editingInsuranceId: any;
  editingMedicalDateType: any;
  editingMedicalProfessionalId: any;
  editingSubstanceResultId: any;
  editingSubstanceUseTestId: any;
  editingTestDetailId: any;
  emergencyContactDialogOpen: any;
  emergencyContactFormData: any;
  getAvailableDsmCodes: any;
  handleAddProgressNote: any;
  handleDeleteProgressNote: any;
  handleRemoveDisclosureSubstance: any;
  handleSaveDiagnosis: any;
  handleSaveDisclosure: any;
  handleSaveEmergencyContact: any;
  handleSaveInitialEntry: any;
  handleSaveInsurance: any;
  handleSaveMedicalDate: any;
  handleSaveMedicalProfessional: any;
  handleSaveSubstanceResult: any;
  handleSaveTestDetail: any;
  handleSaveTestDetails: any;
  insuranceDialogOpen: any;
  insuranceFormData: any;
  medicalDateDialogOpen: any;
  medicalDateFormData: any;
  medicalProfessionalDialogOpen: any;
  medicalProfessionalFormData: any;
  progressNoteFormData: any;
  setDiagnosisActiveTab: any;
  setDiagnosisDialogOpen: any;
  setDiagnosisFormData: any;
  setDisclosureDialogOpen: any;
  setDisclosureFormData: any;
  setDisclosureSubstanceDialogOpen: any;
  setEditingSubstanceResultId: any;
  setEditingSubstanceUseTestId: any;
  setEditingTestDetailId: any;
  setEmergencyContactDialogOpen: any;
  setEmergencyContactFormData: any;
  setInsuranceDialogOpen: any;
  setInsuranceFormData: any;
  setMedicalDateDialogOpen: any;
  setMedicalDateFormData: any;
  setMedicalProfessionalDialogOpen: any;
  setMedicalProfessionalFormData: any;
  setProgressNoteFormData: any;
  setSubstanceResultDialogOpen: any;
  setSubstanceResultFormData: any;
  setSubstanceResults: any;
  setSubstanceUseTestDialogOpen: any;
  setSubstanceUseTestFormData: any;
  setSubstanceUseTests: any;
  setTestAdditionalDetails: any;
  setTestDetailFormData: any;
  setTestDetailFormDialogOpen: any;
  setTestDetailsDialogOpen: any;
  setViewMedicalConnectionModalOpen: any;
  setViewingTestId: any;
  substanceResultDialogOpen: any;
  substanceResultFormData: any;
  substanceResults: any;
  substanceUseTestDialogOpen: any;
  substanceUseTestFormData: any;
  substanceUseTests: any;
  testAdditionalDetails: any;
  testDetailFormData: any;
  testDetailFormDialogOpen: any;
  testDetails: any;
  testDetailsDialogOpen: any;
  viewMedicalConnectionModalOpen: any;
  viewingMedicalConnection: any;
}

export function LeadDetailHealthDialogs({
  availableSubstances,
  diagnoses,
  diagnosisActiveTab,
  diagnosisDialogOpen,
  diagnosisFormData,
  disclosureDialogOpen,
  disclosureFormData,
  disclosureReadOnly,
  setDisclosureReadOnly,
  disclosureSubstanceDialogOpen,
  disclosureSubstanceSelection,
  toggleDisclosureSubstance,
  disclosureSubstanceSearchInput,
  setDisclosureSubstanceSearchInput,
  disclosureSubstanceSearchApplied,
  handleFindDisclosureSubstances,
  handleClearDisclosureSubstances,
  handleApplyDisclosureSubstances,
  handleOpenDisclosureSubstances,
  editingDiagnosisId,
  editingDisclosureId,
  editingEmergencyContactId,
  editingInsuranceId,
  editingMedicalDateType,
  editingMedicalProfessionalId,
  editingSubstanceResultId,
  editingSubstanceUseTestId,
  editingTestDetailId,
  emergencyContactDialogOpen,
  emergencyContactFormData,
  getAvailableDsmCodes,
  handleAddProgressNote,
  handleDeleteProgressNote,
  handleRemoveDisclosureSubstance,
  handleSaveDiagnosis,
  handleSaveDisclosure,
  handleSaveEmergencyContact,
  handleSaveInitialEntry,
  handleSaveInsurance,
  handleSaveMedicalDate,
  handleSaveMedicalProfessional,
  handleSaveSubstanceResult,
  handleSaveTestDetail,
  handleSaveTestDetails,
  insuranceDialogOpen,
  insuranceFormData,
  medicalDateDialogOpen,
  medicalDateFormData,
  medicalProfessionalDialogOpen,
  medicalProfessionalFormData,
  progressNoteFormData,
  setDiagnosisActiveTab,
  setDiagnosisDialogOpen,
  setDiagnosisFormData,
  setDisclosureDialogOpen,
  setDisclosureFormData,
  setDisclosureSubstanceDialogOpen,
  setEditingSubstanceResultId,
  setEditingSubstanceUseTestId,
  setEditingTestDetailId,
  setEmergencyContactDialogOpen,
  setEmergencyContactFormData,
  setInsuranceDialogOpen,
  setInsuranceFormData,
  setMedicalDateDialogOpen,
  setMedicalDateFormData,
  setMedicalProfessionalDialogOpen,
  setMedicalProfessionalFormData,
  setProgressNoteFormData,
  setSubstanceResultDialogOpen,
  setSubstanceResultFormData,
  setSubstanceResults,
  setSubstanceUseTestDialogOpen,
  setSubstanceUseTestFormData,
  setSubstanceUseTests,
  setTestAdditionalDetails,
  setTestDetailFormData,
  setTestDetailFormDialogOpen,
  setTestDetailsDialogOpen,
  setViewMedicalConnectionModalOpen,
  setViewingTestId,
  substanceResultDialogOpen,
  substanceResultFormData,
  substanceResults,
  substanceUseTestDialogOpen,
  substanceUseTestFormData,
  substanceUseTests,
  testAdditionalDetails,
  testDetailFormData,
  testDetailFormDialogOpen,
  testDetails,
  testDetailsDialogOpen,
  viewMedicalConnectionModalOpen,
  viewingMedicalConnection,
}: LeadDetailHealthDialogsProps) {
  return (
    <>
      {/* Physical Health Dialogs */}
      <Dialog
        open={emergencyContactDialogOpen}
        onOpenChange={setEmergencyContactDialogOpen}
      >
        <DialogContent size="md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {editingEmergencyContactId
                ? "Edit Emergency Contact"
                : "Add Emergency Contact"}
            </DialogTitle>
            <DialogDescription>
              {editingEmergencyContactId
                ? "Update emergency contact information."
                : "Add a new emergency contact for this constituent."}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 bg-white">
            <div>
              <Label
                htmlFor="ec-relationship"
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Relationship *
              </Label>
              <Select
                value={emergencyContactFormData.relationship}
                onValueChange={(value) =>
                  setEmergencyContactFormData({
                    ...emergencyContactFormData,
                    relationship: value,
                  })
                }
              >
                <SelectTrigger
                  id="ec-relationship"
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent>
                  {EMERGENCY_CONTACT_RELATIONSHIP_TYPES.map(
                    (opt) => (
                      <SelectItem
                        key={opt}
                        value={opt}
                        className="text-[13px]"
                      >
                        {opt}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="ec-sort"
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Sort Order *
              </Label>
              <Select
                value={emergencyContactFormData.sortOrder}
                onValueChange={(value) =>
                  setEmergencyContactFormData({
                    ...emergencyContactFormData,
                    sortOrder: value,
                  })
                }
              >
                <SelectTrigger
                  id="ec-sort"
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="7">7</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="9">9</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              onClick={() =>
                setEmergencyContactDialogOpen(false)
              }
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor:
                  "var(--slds-g-color-neutral-95)",
                color: "var(--slds-g-color-text-default)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEmergencyContact}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={medicalProfessionalDialogOpen}
        onOpenChange={setMedicalProfessionalDialogOpen}
      >
        <DialogContent size="md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {editingMedicalProfessionalId
                ? "Edit Medical Professional"
                : "Add Medical Professional"}
            </DialogTitle>
            <DialogDescription>
              {editingMedicalProfessionalId
                ? "Update medical professional information."
                : "Add a new medical professional to the constituent's care team."}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 bg-white">
            <div>
              <Label
                htmlFor="mp-type"
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Type *
              </Label>
              <Select
                value={medicalProfessionalFormData.type}
                onValueChange={(value) =>
                  setMedicalProfessionalFormData({
                    ...medicalProfessionalFormData,
                    type: value,
                  })
                }
              >
                <SelectTrigger
                  id="mp-type"
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primary Care Physician">
                    Primary Care Physician
                  </SelectItem>
                  <SelectItem value="Psychiatrist">
                    Psychiatrist
                  </SelectItem>
                  <SelectItem value="Dentist">
                    Dentist
                  </SelectItem>
                  <SelectItem value="Therapist">
                    Therapist
                  </SelectItem>
                  <SelectItem value="Specialist">
                    Specialist
                  </SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="mp-name"
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Name *
              </Label>
              <Input
                id="mp-name"
                value={medicalProfessionalFormData.name}
                onChange={(e) =>
                  setMedicalProfessionalFormData({
                    ...medicalProfessionalFormData,
                    name: e.target.value,
                  })
                }
                className="h-9 text-[13px] rounded"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-default)",
                }}
              />
            </div>
            <div>
              <Label
                htmlFor="mp-phone"
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Phone *
              </Label>
              <Input
                id="mp-phone"
                value={medicalProfessionalFormData.phone}
                onChange={(e) =>
                  setMedicalProfessionalFormData({
                    ...medicalProfessionalFormData,
                    phone: e.target.value,
                  })
                }
                className="h-9 text-[13px] rounded"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-default)",
                }}
              />
            </div>
            <div>
              <Label
                htmlFor="mp-address"
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Address
              </Label>
              <Textarea
                id="mp-address"
                value={medicalProfessionalFormData.address}
                onChange={(e) =>
                  setMedicalProfessionalFormData({
                    ...medicalProfessionalFormData,
                    address: e.target.value,
                  })
                }
                className="text-[13px] rounded min-h-[80px]"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-default)",
                }}
              />
            </div>
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              onClick={() =>
                setMedicalProfessionalDialogOpen(false)
              }
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor:
                  "var(--slds-g-color-neutral-95)",
                color: "var(--slds-g-color-text-default)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveMedicalProfessional}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={medicalDateDialogOpen}
        onOpenChange={setMedicalDateDialogOpen}
      >
        <DialogContent size="md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              Edit {editingMedicalDateType}
            </DialogTitle>
            <DialogDescription>
              Update the date for this medical appointment or
              screening.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Label
              htmlFor="md-date"
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Date *
            </Label>
            <DateInput
              id="md-date"
              value={isoToMdy(medicalDateFormData)}
              onChange={(v) =>
                ((e) => setMedicalDateFormData(e.target.value))(
                  { target: { value: mdyToIso(v) } },
                )
              }
              className="h-9 text-[13px] rounded"
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-base)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
              }}
            />
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => setMedicalDateDialogOpen(false)}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor:
                  "var(--slds-g-color-neutral-95)",
                color: "var(--slds-g-color-text-default)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveMedicalDate}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Medical Connection Details Modal */}
      <Dialog
        open={viewMedicalConnectionModalOpen}
        onOpenChange={setViewMedicalConnectionModalOpen}
      >
        <DialogContent size="lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {viewingMedicalConnection?.testDate
                ? "TB Tests"
                : viewingMedicalConnection?.documentDate
                  ? "Immunization Record"
                  : "Connection Record Details"}
            </DialogTitle>
            {!viewingMedicalConnection?.testDate &&
              !viewingMedicalConnection?.documentDate && (
                <DialogDescription>
                  View full details for this medical appointment
                  connection.
                </DialogDescription>
              )}
          </DialogHeader>
          <DialogBody>
            {viewingMedicalConnection &&
              (viewingMedicalConnection.testDate ? (
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  {/* BASIC INFORMATION */}
                  <div className="pb-0.5">
                    <p
                      className="text-[11px] font-semibold uppercase tracking-[0.48px]"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Basic Information
                    </p>
                    <div
                      className="mt-1"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 pb-2">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-[11px] uppercase tracking-[0.48px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Youth
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {viewingMedicalConnection.participants}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-[11px] uppercase tracking-[0.48px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Document Type
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        TB Tests
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5 col-span-2">
                      <span
                        className="text-[11px] uppercase tracking-[0.48px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Document Name
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {(() => {
                          const td =
                            viewingMedicalConnection.testDate ||
                            "";
                          const parts = td.split("/");
                          if (parts.length === 3) {
                            const months = [
                              "Jan",
                              "Feb",
                              "Mar",
                              "Apr",
                              "May",
                              "Jun",
                              "Jul",
                              "Aug",
                              "Sep",
                              "Oct",
                              "Nov",
                              "Dec",
                            ];
                            return `TB Tests — ${months[parseInt(parts[0], 10) - 1]} ${parts[2]}`;
                          }
                          return "TB Tests";
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* DOCUMENT INFORMATION */}
                  <div className="pt-4 pb-0.5">
                    <p
                      className="text-[11px] font-semibold uppercase tracking-[0.48px]"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Document Information
                    </p>
                    <div
                      className="mt-1"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 pb-2">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-[11px] uppercase tracking-[0.48px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Test Date
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {viewingMedicalConnection.testDate}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-[11px] uppercase tracking-[0.48px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Read Date
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {viewingMedicalConnection.readDate ||
                          "—"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-[11px] uppercase tracking-[0.48px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Date Received
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {viewingMedicalConnection.dateReceived ||
                          "08/18/2026"}
                      </span>
                    </div>
                  </div>
                  <div className="pt-1 pb-3">
                    <a
                      href={
                        viewingMedicalConnection.document || "#"
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[13px]"
                      style={{ color: "#0176d3" }}
                    >
                      View TB Tests
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>

                  {/* AUDIT INFORMATION */}
                  <div className="pt-4 pb-0.5">
                    <p
                      className="text-[11px] font-semibold uppercase tracking-[0.48px]"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Audit Information
                    </p>
                    <div
                      className="mt-1"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 pb-2">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-[11px] uppercase tracking-[0.48px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Created By
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {(viewingMedicalConnection as any)
                          ?.createdBy || "Sarah Johnson"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-[11px] uppercase tracking-[0.48px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Created Date
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {(viewingMedicalConnection as any)
                          ?.createdDate || "08/18/2026"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-[11px] uppercase tracking-[0.48px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Last Modified By
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {(viewingMedicalConnection as any)
                          ?.lastModifiedBy || "Sarah Johnson"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-[11px] uppercase tracking-[0.48px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Last Modified Date
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {(viewingMedicalConnection as any)
                          ?.lastModifiedDate || "08/18/2026"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : viewingMedicalConnection.documentDate ? (
                <div
                  className="flex-1 overflow-y-auto px-6 py-6"
                  style={{
                    backgroundColor: "#ffffff",
                  }}
                >
                  {/* BASIC INFORMATION */}
                  <div className="pt-4 pb-0.5">
                    <p
                      className="text-[11px] font-semibold uppercase tracking-[0.48px]"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Basic Information
                    </p>
                    <div
                      className="mt-1"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 pb-2">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-[11px] uppercase tracking-[0.48px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Youth
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {viewingMedicalConnection.participants}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-[11px] uppercase tracking-[0.48px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Document Type
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Immunization Records
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5 col-span-2">
                      <span
                        className="text-[11px] uppercase tracking-[0.48px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Document Name
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {(() => {
                          const dd =
                            viewingMedicalConnection.documentDate ||
                            "";
                          const parts = dd.split("/");
                          if (parts.length === 3) {
                            const months = [
                              "Jan",
                              "Feb",
                              "Mar",
                              "Apr",
                              "May",
                              "Jun",
                              "Jul",
                              "Aug",
                              "Sep",
                              "Oct",
                              "Nov",
                              "Dec",
                            ];
                            return `Immunization Records — ${months[parseInt(parts[0], 10) - 1]} ${parts[2]}`;
                          }
                          return "Immunization Records";
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* DOCUMENT INFORMATION */}
                  <div className="pt-4 pb-0.5">
                    <p
                      className="text-[11px] font-semibold uppercase tracking-[0.48px]"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Document Information
                    </p>
                    <div
                      className="mt-1"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 pb-2">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-[11px] uppercase tracking-[0.48px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Document Date
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {viewingMedicalConnection.documentDate}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-[11px] uppercase tracking-[0.48px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Date Received
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {viewingMedicalConnection.dateReceived ||
                          "—"}
                      </span>
                    </div>
                  </div>
                  <div className="pt-1 pb-3">
                    <a
                      href={
                        viewingMedicalConnection.document || "#"
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[13px]"
                      style={{ color: "#0176d3" }}
                    >
                      View Immunization Record
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>

                  {/* AUDIT INFORMATION */}
                  <div className="pt-4 pb-0.5">
                    <p
                      className="text-[11px] font-semibold uppercase tracking-[0.48px]"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Audit Information
                    </p>
                    <div
                      className="mt-1"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 pb-2">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-[11px] uppercase tracking-[0.48px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Created By
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {(viewingMedicalConnection as any)
                          ?.createdBy || "Michael Davis"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-[11px] uppercase tracking-[0.48px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Created Date
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {(viewingMedicalConnection as any)
                          ?.createdDate || "08/12/2026"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-[11px] uppercase tracking-[0.48px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Last Modified By
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {(viewingMedicalConnection as any)
                          ?.lastModifiedBy || "Michael Davis"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-[11px] uppercase tracking-[0.48px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Last Modified Date
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {(viewingMedicalConnection as any)
                          ?.lastModifiedDate || "08/12/2026"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="flex-1 overflow-y-auto px-6 py-6"
                  style={{
                    backgroundColor: "#ffffff",
                  }}
                >
                  {/* Connection Information Section */}
                  <div>
                    <h3
                      className="text-[14px] font-semibold mb-3 pb-2"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom: "2px solid #145F33",
                      }}
                    >
                      Connection Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label
                          className="block text-[11px] font-medium mb-1.5 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Type
                        </Label>
                        <p
                          className="text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {viewingMedicalConnection.type}
                        </p>
                      </div>
                      <div>
                        <Label
                          className="block text-[11px] font-medium mb-1.5 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Date
                        </Label>
                        <p
                          className="text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {viewingMedicalConnection.startDate}
                        </p>
                      </div>
                      <div>
                        <Label
                          className="block text-[11px] font-medium mb-1.5 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Start Time
                        </Label>
                        <p
                          className="text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {viewingMedicalConnection.startTime}
                        </p>
                      </div>
                      <div>
                        <Label
                          className="block text-[11px] font-medium mb-1.5 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          End Time
                        </Label>
                        <p
                          className="text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {viewingMedicalConnection.endTime}
                        </p>
                      </div>
                      <div>
                        <Label
                          className="block text-[11px] font-medium mb-1.5 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Location
                        </Label>
                        <p
                          className="text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {viewingMedicalConnection.location ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label
                          className="block text-[11px] font-medium mb-1.5 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Department
                        </Label>
                        <p
                          className="text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {viewingMedicalConnection.department ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label
                          className="block text-[11px] font-medium mb-1.5 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Participants
                        </Label>
                        <p
                          className="text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {
                            viewingMedicalConnection.participants
                          }
                        </p>
                      </div>
                      <div>
                        <Label
                          className="block text-[11px] font-medium mb-1.5 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Programs
                        </Label>
                        <p
                          className="text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {viewingMedicalConnection.programs}
                        </p>
                      </div>
                      <div>
                        <Label
                          className="block text-[11px] font-medium mb-1.5 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Attended
                        </Label>
                        <p
                          className="text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {viewingMedicalConnection.attended ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium"
                              style={{
                                backgroundColor: "#e6f4ea",
                                color: "#137333",
                              }}
                            >
                              <Check className="h-3 w-3" />
                              Yes
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium"
                              style={{
                                backgroundColor: "#fce8e6",
                                color: "#c5221f",
                              }}
                            >
                              <XIcon className="h-3 w-3" />
                              No
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary Section */}
                  {viewingMedicalConnection.summary && (
                    <div>
                      <h3
                        className="text-[14px] font-semibold mb-3 pb-2"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                          borderBottom: "2px solid #145F33",
                        }}
                      >
                        Summary
                      </h3>
                      <p
                        className="text-[13px] whitespace-pre-wrap"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {viewingMedicalConnection.summary}
                      </p>
                    </div>
                  )}

                  {/* Appointment-Specific Details */}
                  {(viewingMedicalConnection.reason ||
                    viewingMedicalConnection.diagnosis ||
                    viewingMedicalConnection.newMedicationPrescribed !==
                      undefined ||
                    viewingMedicalConnection.biannualDentalRequirement !==
                      undefined ||
                    viewingMedicalConnection.followUp) && (
                    <div>
                      <h3
                        className="text-[14px] font-semibold mb-3 pb-2"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                          borderBottom: "2px solid #145F33",
                        }}
                      >
                        Appointment Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {viewingMedicalConnection.reason && (
                          <div>
                            <Label
                              className="block text-[11px] font-medium mb-1.5 uppercase"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              Reason
                            </Label>
                            <p
                              className="text-[13px]"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              {viewingMedicalConnection.reason}
                            </p>
                          </div>
                        )}
                        {viewingMedicalConnection.diagnosis && (
                          <div>
                            <Label
                              className="block text-[11px] font-medium mb-1.5 uppercase"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              Diagnosis
                            </Label>
                            <p
                              className="text-[13px]"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              {
                                viewingMedicalConnection.diagnosis
                              }
                            </p>
                          </div>
                        )}
                        {viewingMedicalConnection.newMedicationPrescribed !==
                          undefined &&
                          viewingMedicalConnection.newMedicationPrescribed !==
                            null && (
                            <div>
                              <Label
                                className="block text-[11px] font-medium mb-1.5 uppercase"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                New Medication Prescribed
                              </Label>
                              <p
                                className="text-[13px]"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                {viewingMedicalConnection.newMedicationPrescribed
                                  ? "Yes"
                                  : "No"}
                              </p>
                            </div>
                          )}
                        {viewingMedicalConnection.biannualDentalRequirement !==
                          undefined && (
                          <div>
                            <Label
                              className="block text-[11px] font-medium mb-1.5 uppercase"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              Biannual Dental Requirement
                            </Label>
                            <p
                              className="text-[13px]"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              {viewingMedicalConnection.biannualDentalRequirement
                                ? "Yes"
                                : "No"}
                            </p>
                          </div>
                        )}
                        {viewingMedicalConnection.followUp && (
                          <div className="col-span-2">
                            <Label
                              className="block text-[11px] font-medium mb-1.5 uppercase"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              Follow Up
                            </Label>
                            <p
                              className="text-[13px]"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              {
                                viewingMedicalConnection.followUp
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              onClick={() =>
                setViewMedicalConnectionModalOpen(false)
              }
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor:
                  "var(--slds-g-color-neutral-95)",
                color: "var(--slds-g-color-text-default)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InsurancePolicyDialog
        open={insuranceDialogOpen}
        mode={editingInsuranceId ? "edit" : "create"}
        initialData={insuranceFormData}
        onClose={() => {
          setInsuranceDialogOpen(false);
        }}
        onSave={(data) => handleSaveInsurance(data)}
      />

      {/* Mental Health - Diagnosis Dialog */}
      <Dialog
        open={diagnosisDialogOpen}
        onOpenChange={setDiagnosisDialogOpen}
      >
        <DialogContent size="lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {editingDiagnosisId
                ? "Modify Diagnosis"
                : "Add Diagnosis"}
            </DialogTitle>
            <DialogDescription>
              {editingDiagnosisId
                ? "Update diagnosis information and track progress."
                : "Add a new diagnosis for this constituent."}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {/* Tabs */}
            <div
              className="border-b"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
              }}
            >
              <div className="flex gap-6">
                <button
                  onClick={() =>
                    setDiagnosisActiveTab("details")
                  }
                  className="px-1 py-2 text-[13px] font-medium transition-colors relative"
                  style={{
                    color:
                      diagnosisActiveTab === "details"
                        ? "#145F33"
                        : "var(--slds-g-color-text-default)",
                  }}
                >
                  Details
                  {diagnosisActiveTab === "details" && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[2px]"
                      style={{ backgroundColor: "#145F33" }}
                    />
                  )}
                </button>
                <button
                  onClick={() =>
                    setDiagnosisActiveTab("progress")
                  }
                  className="px-1 py-2 text-[13px] font-medium transition-colors relative"
                  style={{
                    color:
                      diagnosisActiveTab === "progress"
                        ? "#145F33"
                        : "var(--slds-g-color-text-default)",
                  }}
                >
                  Progress Tracking
                  {diagnosisActiveTab === "progress" && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[2px]"
                      style={{ backgroundColor: "#145F33" }}
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {diagnosisActiveTab === "details" && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="diag-start"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Start Date *
                    </Label>
                    <DateInput
                      id="diag-start"
                      value={isoToMdy(
                        diagnosisFormData.startDate,
                      )}
                      onChange={(v) =>
                        ((e) =>
                          setDiagnosisFormData({
                            ...diagnosisFormData,
                            startDate: e.target.value,
                          }))({
                          target: { value: mdyToIso(v) },
                        })
                      }
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="diag-end"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      End Date
                    </Label>
                    <DateInput
                      id="diag-end"
                      value={isoToMdy(
                        diagnosisFormData.endDate,
                      )}
                      onChange={(v) =>
                        ((e) =>
                          setDiagnosisFormData({
                            ...diagnosisFormData,
                            endDate: e.target.value,
                          }))({
                          target: { value: mdyToIso(v) },
                        })
                      }
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="diag-dsm"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      DSM Version *
                    </Label>
                    <Select
                      value={diagnosisFormData.dsmVersion}
                      onValueChange={(value) =>
                        setDiagnosisFormData({
                          ...diagnosisFormData,
                          dsmVersion: value,
                          code: "",
                        })
                      }
                    >
                      <SelectTrigger
                        id="diag-dsm"
                        className="h-9 text-[13px] rounded"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        <SelectValue placeholder="Select DSM version..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DSM V">
                          DSM V
                        </SelectItem>
                        <SelectItem value="DSM IV">
                          DSM IV
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label
                      htmlFor="diag-code"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      DSM Code *
                    </Label>
                    <Select
                      value={diagnosisFormData.code}
                      onValueChange={(value) =>
                        setDiagnosisFormData({
                          ...diagnosisFormData,
                          code: value,
                        })
                      }
                    >
                      <SelectTrigger
                        id="diag-code"
                        className="h-9 text-[13px] rounded"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        <SelectValue placeholder="Select DSM code..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {getAvailableDsmCodes().map((item) => (
                          <SelectItem
                            key={item.code}
                            value={item.code}
                          >
                            {item.code} - {item.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="diag-details"
                    className="block text-[12px] font-semibold mb-1.5 uppercase"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Diagnosis Details
                  </Label>
                  <Textarea
                    id="diag-details"
                    value={diagnosisFormData.details}
                    onChange={(e) =>
                      setDiagnosisFormData({
                        ...diagnosisFormData,
                        details: e.target.value,
                      })
                    }
                    placeholder="Enter additional diagnosis details..."
                    className="text-[13px] rounded min-h-[80px]"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="diag-preliminary"
                    checked={diagnosisFormData.preliminary}
                    onChange={(e) =>
                      setDiagnosisFormData({
                        ...diagnosisFormData,
                        preliminary: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded"
                    style={{ accentColor: "#145F33" }}
                  />
                  <Label
                    htmlFor="diag-preliminary"
                    className="text-[13px] cursor-pointer"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Preliminary (from admissions process)
                  </Label>
                </div>
              </div>
            )}

            {diagnosisActiveTab === "progress" && (
              <div className="space-y-4 py-4">
                {editingDiagnosisId ? (
                  <>
                    {/* Add Progress Note Form */}
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-alt)",
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <h4
                        className="text-[13px] font-semibold mb-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Add Progress Note
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <Label
                            htmlFor="progress-date"
                            className="block text-[12px] font-semibold mb-1.5 uppercase"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Date
                          </Label>
                          <DateInput
                            id="progress-date"
                            value={isoToMdy(
                              progressNoteFormData.date,
                            )}
                            onChange={(v) =>
                              ((e) =>
                                setProgressNoteFormData({
                                  ...progressNoteFormData,
                                  date: e.target.value,
                                }))({
                                target: { value: mdyToIso(v) },
                              })
                            }
                            className="h-9 text-[13px] rounded"
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="progress-comment"
                            className="block text-[12px] font-semibold mb-1.5 uppercase"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Comment *
                          </Label>
                          <Textarea
                            id="progress-comment"
                            value={progressNoteFormData.comment}
                            onChange={(e) =>
                              setProgressNoteFormData({
                                ...progressNoteFormData,
                                comment: e.target.value,
                              })
                            }
                            placeholder="Enter progress note..."
                            className="text-[13px] rounded min-h-[60px]"
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          />
                        </div>
                        <Button
                          onClick={handleAddProgressNote}
                          className="h-8 px-4 rounded-full text-[13px]"
                          style={{
                            backgroundColor: "#145F33",
                            color: "white",
                          }}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Add Note
                        </Button>
                      </div>
                    </div>

                    {/* Progress Notes List */}
                    <div>
                      <h4
                        className="text-[13px] font-semibold mb-2"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Progress Notes
                      </h4>
                      <div
                        className="rounded-lg overflow-hidden"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <table
                          className="w-full text-[13px]"
                          style={{ borderCollapse: "collapse" }}
                        >
                          <thead
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-alt)",
                            }}
                          >
                            <tr>
                              <th
                                className="px-3 py-2 text-left text-[12px] font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                  borderBottom:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                Date
                              </th>
                              <th
                                className="px-3 py-2 text-left text-[12px] font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                  borderBottom:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                Comment
                              </th>
                              <th
                                className="px-3 py-2 text-left text-[12px] font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                  borderBottom:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                Created By
                              </th>
                              <th
                                className="px-3 py-2 text-left text-[12px] font-semibold w-16"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                  borderBottom:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {diagnoses
                              .find(
                                (d) =>
                                  d.id === editingDiagnosisId,
                              )
                              ?.progressNotes?.map(
                                (note, index) => (
                                  <tr
                                    key={note.id}
                                    className="hover:bg-gray-50/50"
                                    style={{
                                      borderBottom:
                                        index <
                                        (diagnoses.find(
                                          (d) =>
                                            d.id ===
                                            editingDiagnosisId,
                                        )?.progressNotes
                                          ?.length || 0) -
                                          1
                                          ? "1px solid var(--slds-g-color-border-base-1)"
                                          : "none",
                                    }}
                                  >
                                    <td
                                      className="px-3 py-2"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {note.date}
                                    </td>
                                    <td
                                      className="px-3 py-2"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {note.comment}
                                    </td>
                                    <td
                                      className="px-3 py-2"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {note.createdBy}
                                    </td>
                                    <td className="px-3 py-2">
                                      <button
                                        onClick={() =>
                                          handleDeleteProgressNote(
                                            note.id,
                                          )
                                        }
                                        className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                        title="Delete"
                                      >
                                        <Trash2 className="h-3 w-3 text-[#c23934]" />
                                      </button>
                                    </td>
                                  </tr>
                                ),
                              )}
                            {(!diagnoses.find(
                              (d) =>
                                d.id === editingDiagnosisId,
                            )?.progressNotes ||
                              diagnoses.find(
                                (d) =>
                                  d.id === editingDiagnosisId,
                              )?.progressNotes?.length ===
                                0) && (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="px-3 py-4 text-center text-[13px]"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  No progress notes yet. Add one
                                  above.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    className="text-center py-8 text-[13px]"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Save the diagnosis first to add progress
                    notes.
                  </div>
                )}
              </div>
            )}
          </DialogBody>

          <DialogFooter className="gap-2">
            <Button
              onClick={() => {
                setDiagnosisDialogOpen(false);
                setDiagnosisActiveTab("details");
              }}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor:
                  "var(--slds-g-color-neutral-95)",
                color: "var(--slds-g-color-text-default)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDiagnosis}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OLD TESTING MODALS - REPLACED BY SubstanceUseTestingModals COMPONENT */}
      {/* The old testing modals (including a dead "Initial Entry" dialog that was
                            incorrectly wired to disclosureDialogOpen instead of substanceUseTestDialogOpen,
                            which caused it to render alongside the real Disclosure dialog) have been
                            removed - see SubstanceUseTestingModals component below for the real thing. */}

      {/* Substance Use - Test Details Dialog */}
      <Dialog
        open={testDetailsDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Reset when closing
            setTestDetailsDialogOpen(false);
            setEditingSubstanceUseTestId(null);
            setViewingTestId(null);
          } else {
            setTestDetailsDialogOpen(open);
          }
        }}
      >
        <DialogContent size="xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Results & Test Details</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-6">
            {/* New Use Indicator */}
            <div
              className="p-4 rounded-lg"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <Label
                    htmlFor="new-use-indicator"
                    className="block text-[12px] font-semibold mb-1.5 uppercase"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Results Indicate New Use *
                  </Label>
                  <Select
                    value={testAdditionalDetails.newUse}
                    onValueChange={(value) =>
                      setTestAdditionalDetails({
                        ...testAdditionalDetails,
                        newUse: value,
                      })
                    }
                    disabled={
                      testDetails.length === 0 &&
                      substanceResults.length === 0
                    }
                  >
                    <SelectTrigger
                      id="new-use-indicator"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">
                        Pending
                      </SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                  {testDetails.length === 0 &&
                    substanceResults.length === 0 && (
                      <p
                        className="text-[11px] mt-1"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Non-editable until test results are
                        recorded
                      </p>
                    )}
                </div>
                {testAdditionalDetails.newUse === "Yes" && (
                  <div
                    className="flex-1 p-3 rounded"
                    style={{
                      backgroundColor: "#fef3cd",
                      border: "1px solid #f5d87a",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#856404]" />
                      <span className="text-[13px] font-medium text-[#856404]">
                        New Use Requires Incident Report
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        toast.info(
                          "Opening Incident Report creation...",
                        )
                      }
                      className="mt-2 text-[13px] text-[#145F33] hover:underline font-medium"
                    >
                      Create Incident Report →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tests List View */}
            <div
              className="rounded-lg overflow-hidden"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{
                  borderBottom:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <h4 className="text-[13px] font-semibold text-[#080707]">
                  Tests
                </h4>
                <Button
                  onClick={() => {
                    setTestDetailFormData({
                      testType: "",
                      testPanel: "",
                      relatedTest: "",
                      refusalDetail: "",
                      resultsDate: "",
                      results: "",
                    });
                    setEditingTestDetailId(null);
                    setTestDetailFormDialogOpen(true);
                  }}
                  className="h-7 px-3 rounded-full text-[12px]"
                  style={{
                    backgroundColor: "#145F33",
                    color: "white",
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table
                  className="w-full text-[13px]"
                  style={{ borderCollapse: "collapse" }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-alt)",
                      }}
                    >
                      <th
                        className="px-4 py-2 text-left text-[12px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        Type
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[12px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        Test Panel
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[12px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        Results Date
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[12px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        Results
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[12px] font-semibold w-20"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {testDetails.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          No tests added yet
                        </td>
                      </tr>
                    ) : (
                      testDetails.map((td, index) => (
                        <tr
                          key={td.id}
                          className="hover:bg-gray-50/50 transition-colors"
                          style={{
                            borderBottom:
                              index < testDetails.length - 1
                                ? "1px solid var(--slds-g-color-border-base-1)"
                                : "none",
                          }}
                        >
                          <td
                            className="px-4 py-2"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {td.testType}
                          </td>
                          <td
                            className="px-4 py-2"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {td.testPanel || "—"}
                          </td>
                          <td
                            className="px-4 py-2"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {td.resultsDate || "—"}
                          </td>
                          <td
                            className="px-4 py-2"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {td.results || "—"}
                          </td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => {
                                setTestDetailFormData(td);
                                setEditingTestDetailId(td.id);
                                setTestDetailFormDialogOpen(
                                  true,
                                );
                              }}
                              className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                              title="Edit"
                            >
                              <Pencil
                                className="h-3 w-3"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Substance Results */}
            <div
              className="rounded-lg overflow-hidden"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{
                  borderBottom:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <h4 className="text-[13px] font-semibold text-[#080707]">
                  Substance Results
                </h4>
                <Button
                  onClick={() => {
                    setSubstanceResultFormData({
                      substance: "",
                      result: "",
                      level: "",
                      unitOfMeasure: "",
                    });
                    setEditingSubstanceResultId(null);
                    setSubstanceResultDialogOpen(true);
                  }}
                  className="h-7 px-3 rounded-full text-[12px]"
                  style={{
                    backgroundColor: "#145F33",
                    color: "white",
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Substance
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table
                  className="w-full text-[13px]"
                  style={{ borderCollapse: "collapse" }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-alt)",
                      }}
                    >
                      <th
                        className="px-4 py-2 text-left text-[12px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        Substance
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[12px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        Result
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[12px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        Level
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[12px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        Unit
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[12px] font-semibold w-20"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {substanceResults.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          No substance results added yet
                        </td>
                      </tr>
                    ) : (
                      substanceResults.map((sr, index) => (
                        <tr
                          key={sr.id}
                          className="hover:bg-gray-50/50 transition-colors"
                          style={{
                            borderBottom:
                              index <
                              substanceResults.length - 1
                                ? "1px solid var(--slds-g-color-border-base-1)"
                                : "none",
                          }}
                        >
                          <td
                            className="px-4 py-2"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {sr.substance}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-medium ${sr.result === "Positive" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                            >
                              {sr.result}
                            </span>
                          </td>
                          <td
                            className="px-4 py-2"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {sr.level || "—"}
                          </td>
                          <td
                            className="px-4 py-2"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {sr.unitOfMeasure || "—"}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setSubstanceResultFormData(
                                    sr,
                                  );
                                  setEditingSubstanceResultId(
                                    sr.id,
                                  );
                                  setSubstanceResultDialogOpen(
                                    true,
                                  );
                                }}
                                className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                title="Edit"
                              >
                                <Pencil
                                  className="h-3 w-3"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                />
                              </button>
                              <button
                                onClick={() => {
                                  setSubstanceResults(
                                    substanceResults.filter(
                                      (s) => s.id !== sr.id,
                                    ),
                                  );
                                  toast.success(
                                    "Substance result deleted successfully",
                                  );
                                }}
                                className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3 text-[#c23934]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Details */}
            <div
              className="p-4 space-y-4 rounded-lg"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <h4 className="text-[13px] font-semibold text-[#080707]">
                Additional Details
              </h4>

              {/* Suspect Tampering */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="suspect-tampering"
                  checked={
                    testAdditionalDetails.suspectTampering
                  }
                  onCheckedChange={(checked) =>
                    setTestAdditionalDetails({
                      ...testAdditionalDetails,
                      suspectTampering: checked as boolean,
                    })
                  }
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="suspect-tampering"
                    className="text-[13px] cursor-pointer"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Suspect Tampering
                  </Label>
                </div>
              </div>

              {testAdditionalDetails.suspectTampering && (
                <div>
                  <Label
                    htmlFor="tampering-comments"
                    className="block text-[12px] font-semibold mb-1.5 uppercase"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Comments *
                  </Label>
                  <Textarea
                    id="tampering-comments"
                    value={
                      testAdditionalDetails.tamperingComments
                    }
                    onChange={(e) =>
                      setTestAdditionalDetails({
                        ...testAdditionalDetails,
                        tamperingComments: e.target.value,
                      })
                    }
                    placeholder="Describe suspected tampering..."
                    className="text-[13px] rounded min-h-[80px]"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  />
                </div>
              )}

              {/* Lab Consultation */}
              <div>
                <Label
                  htmlFor="lab-consultation"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Consultation with Lab
                </Label>
                <Textarea
                  id="lab-consultation"
                  value={testAdditionalDetails.labConsultation}
                  onChange={(e) =>
                    setTestAdditionalDetails({
                      ...testAdditionalDetails,
                      labConsultation: e.target.value,
                    })
                  }
                  placeholder="Enter lab consultation notes..."
                  className="text-[13px] rounded min-h-[80px]"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
              </div>

              {/* Action - Only for Instant Test */}
              {testDetails.some(
                (td) => td.testType === "Instant Test",
              ) && (
                <>
                  <div>
                    <Label
                      htmlFor="test-action"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Action
                    </Label>
                    <Select
                      value={testAdditionalDetails.action}
                      onValueChange={(value) =>
                        setTestAdditionalDetails({
                          ...testAdditionalDetails,
                          action: value,
                        })
                      }
                    >
                      <SelectTrigger
                        id="test-action"
                        className="h-9 text-[13px] rounded"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        <SelectValue placeholder="Select action..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sent to Lab">
                          Sent to Lab
                        </SelectItem>
                        <SelectItem value="Discard">
                          Discard
                        </SelectItem>
                        <SelectItem value="Null">
                          Null
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {testAdditionalDetails.action ===
                    "Sent to Lab" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="refrigerator-date"
                          className="block text-[12px] font-semibold mb-1.5 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Refrigerator Date *
                        </Label>
                        <DateInput
                          id="refrigerator-date"
                          value={isoToMdy(
                            testAdditionalDetails.refrigeratorDate,
                          )}
                          onChange={(v) =>
                            ((e) =>
                              setTestAdditionalDetails({
                                ...testAdditionalDetails,
                                refrigeratorDate:
                                  e.target.value,
                              }))({
                              target: { value: mdyToIso(v) },
                            })
                          }
                          className="h-9 text-[13px] rounded"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="pickup-date"
                          className="block text-[12px] font-semibold mb-1.5 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Pickup Date *
                        </Label>
                        <DateInput
                          id="pickup-date"
                          value={isoToMdy(
                            testAdditionalDetails.pickupDate,
                          )}
                          onChange={(v) =>
                            ((e) =>
                              setTestAdditionalDetails({
                                ...testAdditionalDetails,
                                pickupDate: e.target.value,
                              }))({
                              target: { value: mdyToIso(v) },
                            })
                          }
                          className="h-9 text-[13px] rounded"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {testAdditionalDetails.action ===
                    "Discard" && (
                    <div className="space-y-4">
                      <div>
                        <Label
                          htmlFor="discard-date"
                          className="block text-[12px] font-semibold mb-1.5 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Discard Date *
                        </Label>
                        <DateInput
                          id="discard-date"
                          value={isoToMdy(
                            testAdditionalDetails.discardDate,
                          )}
                          onChange={(v) =>
                            ((e) =>
                              setTestAdditionalDetails({
                                ...testAdditionalDetails,
                                discardDate: e.target.value,
                              }))({
                              target: { value: mdyToIso(v) },
                            })
                          }
                          className="h-9 text-[13px] rounded"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="discard-reason"
                          className="block text-[12px] font-semibold mb-1.5 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Discard Reason
                        </Label>
                        <Textarea
                          id="discard-reason"
                          value={
                            testAdditionalDetails.discardReason
                          }
                          onChange={(e) =>
                            setTestAdditionalDetails({
                              ...testAdditionalDetails,
                              discardReason: e.target.value,
                            })
                          }
                          placeholder="Enter reason for discarding..."
                          className="text-[13px] rounded min-h-[80px]"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => {
                setTestDetailsDialogOpen(false);
                setEditingSubstanceUseTestId(null);
                setViewingTestId(null);
              }}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor:
                  "var(--slds-g-color-neutral-95)",
                color: "var(--slds-g-color-text-default)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTestDetails}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Detail Form Dialog (nested within Test Details) */}
      <Dialog
        open={testDetailFormDialogOpen}
        onOpenChange={setTestDetailFormDialogOpen}
      >
        <DialogContent size="md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {editingTestDetailId ? "Edit Test" : "Add Test"}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4 bg-white">
            <div>
              <Label
                htmlFor="test-type"
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Test Type *
              </Label>
              <Select
                value={testDetailFormData.testType}
                onValueChange={(value) => {
                  setTestDetailFormData({
                    ...testDetailFormData,
                    testType: value,
                    testPanel: "",
                    relatedTest: "",
                    refusalDetail: "",
                  });
                }}
              >
                <SelectTrigger
                  id="test-type"
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  <SelectValue placeholder="Select test type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Instant Test">
                    Instant Test
                  </SelectItem>
                  <SelectItem value="Lab Test">
                    Lab Test
                  </SelectItem>
                  <SelectItem value="Rerun Test">
                    Rerun Test
                  </SelectItem>
                  <SelectItem value="Refused Test">
                    Refused Test
                  </SelectItem>
                  <SelectItem value="Alcohol Instant">
                    Alcohol Instant
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Test Panel - Dependent on Test Type */}
            {(testDetailFormData.testType === "Instant Test" ||
              testDetailFormData.testType === "Refused Test" ||
              testDetailFormData.testType ===
                "Alcohol Instant") && (
              <div>
                <Label
                  htmlFor="test-panel"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Test Panel *
                </Label>
                <Select
                  value={testDetailFormData.testPanel}
                  onValueChange={(value) =>
                    setTestDetailFormData({
                      ...testDetailFormData,
                      testPanel: value,
                    })
                  }
                >
                  <SelectTrigger
                    id="test-panel"
                    className="h-9 text-[13px] rounded"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    <SelectValue placeholder="Select test panel..." />
                  </SelectTrigger>
                  <SelectContent>
                    {testDetailFormData.testType ===
                      "Instant Test" && (
                      <>
                        <SelectItem value="iCup Instant 5-Panel">
                          iCup Instant 5-Panel
                        </SelectItem>
                        <SelectItem value="iCup Instant 10-Panel">
                          iCup Instant 10-Panel
                        </SelectItem>
                        <SelectItem value="iCup Instant 12-Panel">
                          iCup Instant 12-Panel
                        </SelectItem>
                      </>
                    )}
                    {testDetailFormData.testType ===
                      "Refused Test" && (
                      <>
                        <SelectItem value="iCup Instant 5-Panel">
                          iCup Instant 5-Panel
                        </SelectItem>
                        <SelectItem value="iCup Instant 10-Panel">
                          iCup Instant 10-Panel
                        </SelectItem>
                        <SelectItem value="iCup Instant 12-Panel">
                          iCup Instant 12-Panel
                        </SelectItem>
                        <SelectItem value="Breathalyzer">
                          Breathalyzer
                        </SelectItem>
                      </>
                    )}
                    {testDetailFormData.testType ===
                      "Alcohol Instant" && (
                      <SelectItem value="Breathalyzer">
                        Breathalyzer
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Lab Test - Panel Greyed Out */}
            {testDetailFormData.testType === "Lab Test" && (
              <div>
                <Label
                  htmlFor="test-panel-disabled"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Test Panel
                </Label>
                <Input
                  id="test-panel-disabled"
                  type="text"
                  disabled
                  placeholder="Not applicable for Lab Test"
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-neutral-95)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-weak)",
                  }}
                />
              </div>
            )}

            {/* Rerun Test - Related Test */}
            {testDetailFormData.testType === "Rerun Test" && (
              <div>
                <Label
                  htmlFor="related-test"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Related Test
                </Label>
                <Select
                  value={testDetailFormData.relatedTest}
                  onValueChange={(value) =>
                    setTestDetailFormData({
                      ...testDetailFormData,
                      relatedTest: value,
                    })
                  }
                  disabled={substanceUseTests.length === 0}
                >
                  <SelectTrigger
                    id="related-test"
                    className="h-9 text-[13px] rounded"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    <SelectValue
                      placeholder={
                        substanceUseTests.length === 0
                          ? "No tests available"
                          : "Select related test..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {substanceUseTests.map((test) => (
                      <SelectItem
                        key={test.id}
                        value={`Test #${test.id} - ${test.dateTime}`}
                      >
                        Test #{test.id} - {test.dateTime}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Refused Test - Refusal Detail */}
            {testDetailFormData.testType === "Refused Test" && (
              <div>
                <Label
                  htmlFor="refusal-detail"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Refusal Detail *
                </Label>
                <Textarea
                  id="refusal-detail"
                  value={testDetailFormData.refusalDetail}
                  onChange={(e) =>
                    setTestDetailFormData({
                      ...testDetailFormData,
                      refusalDetail: e.target.value,
                    })
                  }
                  placeholder="Describe refusal circumstances..."
                  className="text-[13px] rounded min-h-[80px]"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
              </div>
            )}

            <div>
              <Label
                htmlFor="results-date"
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Results Date
              </Label>
              <DateInput
                id="results-date"
                value={isoToMdy(testDetailFormData.resultsDate)}
                onChange={(v) =>
                  ((e) =>
                    setTestDetailFormData({
                      ...testDetailFormData,
                      resultsDate: e.target.value,
                    }))({ target: { value: mdyToIso(v) } })
                }
                className="h-9 text-[13px] rounded"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-default)",
                }}
              />
            </div>

            <div>
              <Label
                htmlFor="test-results"
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Results
              </Label>
              <Textarea
                id="test-results"
                value={testDetailFormData.results}
                onChange={(e) =>
                  setTestDetailFormData({
                    ...testDetailFormData,
                    results: e.target.value,
                  })
                }
                placeholder="Enter test results..."
                className="text-[13px] rounded min-h-[80px]"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-default)",
                }}
              />
            </div>
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => setTestDetailFormDialogOpen(false)}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor:
                  "var(--slds-g-color-neutral-95)",
                color: "var(--slds-g-color-text-default)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTestDetail}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Substance Result Form Dialog */}
      <Dialog
        open={substanceResultDialogOpen}
        onOpenChange={setSubstanceResultDialogOpen}
      >
        <DialogContent size="md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {editingSubstanceResultId
                ? "Edit Substance Result"
                : "Add Substance Result"}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4 bg-white">
            <div>
              <Label
                htmlFor="substance"
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Substance *
              </Label>
              <Select
                value={substanceResultFormData.substance}
                onValueChange={(value) =>
                  setSubstanceResultFormData({
                    ...substanceResultFormData,
                    substance: value,
                  })
                }
              >
                <SelectTrigger
                  id="substance"
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  <SelectValue placeholder="Select substance..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alcohol (Ethanol)">
                    Alcohol (Ethanol)
                  </SelectItem>
                  <SelectItem value="Alcohol (Instant)">
                    Alcohol (Instant)
                  </SelectItem>
                  <SelectItem value="Alcohol (Lab)">
                    Alcohol (Lab)
                  </SelectItem>
                  <SelectItem value="Amphetamines">
                    Amphetamines
                  </SelectItem>
                  <SelectItem value="Benzodiazepines">
                    Benzodiazepines
                  </SelectItem>
                  <SelectItem value="Cocaine">
                    Cocaine
                  </SelectItem>
                  <SelectItem value="Designer Stimulants - Premium">
                    Designer Stimulants - Premium
                  </SelectItem>
                  <SelectItem value="Dextromethorphan">
                    Dextromethorphan
                  </SelectItem>
                  <SelectItem value="Ethyl Glucuronide (EtG)">
                    Ethyl Glucuronide (EtG)
                  </SelectItem>
                  <SelectItem value="Ethyl Glucuronide (EtG)/Ethyl Sulfate">
                    Ethyl Glucuronide (EtG)/Ethyl Sulfate
                  </SelectItem>
                  <SelectItem value="Fentanyl">
                    Fentanyl
                  </SelectItem>
                  <SelectItem value="Lysergic Acid Diethylamide (LSD)">
                    Lysergic Acid Diethylamide (LSD)
                  </SelectItem>
                  <SelectItem value="Opiates">
                    Opiates
                  </SelectItem>
                  <SelectItem value="Oxycodone/Oxymorphane">
                    Oxycodone/Oxymorphane
                  </SelectItem>
                  <SelectItem value="Phencyclidine (PCP)">
                    Phencyclidine (PCP)
                  </SelectItem>
                  <SelectItem value="Selective Serotonin Reuptake Inhibitors (SSRIs)">
                    Selective Serotonin Reuptake Inhibitors
                    (SSRIs)
                  </SelectItem>
                  <SelectItem value="THC Ratio">
                    THC Ratio
                  </SelectItem>
                  <SelectItem value="THC/Cannabinoids">
                    THC/Cannabinoids
                  </SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="result"
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Result *
              </Label>
              <Select
                value={substanceResultFormData.result}
                onValueChange={(value) =>
                  setSubstanceResultFormData({
                    ...substanceResultFormData,
                    result: value,
                  })
                }
              >
                <SelectTrigger
                  id="result"
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  <SelectValue placeholder="Select result..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Positive">
                    Positive
                  </SelectItem>
                  <SelectItem value="Negative">
                    Negative
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {substanceResultFormData.result === "Positive" && (
              <>
                <div>
                  <Label
                    htmlFor="level"
                    className="block text-[12px] font-semibold mb-1.5 uppercase"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Level *
                  </Label>
                  <Input
                    id="level"
                    type="text"
                    value={substanceResultFormData.level}
                    onChange={(e) =>
                      setSubstanceResultFormData({
                        ...substanceResultFormData,
                        level: e.target.value,
                      })
                    }
                    placeholder="Enter level value..."
                    className="h-9 text-[13px] rounded"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="unit-of-measure"
                    className="block text-[12px] font-semibold mb-1.5 uppercase"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Unit of Measure *
                  </Label>
                  <Select
                    value={
                      substanceResultFormData.unitOfMeasure
                    }
                    onValueChange={(value) =>
                      setSubstanceResultFormData({
                        ...substanceResultFormData,
                        unitOfMeasure: value,
                      })
                    }
                  >
                    <SelectTrigger
                      id="unit-of-measure"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      <SelectValue placeholder="Select unit..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ng/mL">
                        ng/mL
                      </SelectItem>
                      <SelectItem value="gm/dL">
                        gm/dL
                      </SelectItem>
                      <SelectItem value="pg/mL">
                        pg/mL
                      </SelectItem>
                      <SelectItem value="mcg/mL">
                        mcg/mL
                      </SelectItem>
                      <SelectItem value="mg/dL">
                        mg/dL
                      </SelectItem>
                      <SelectItem value="ng/ng Creat">
                        ng/ng Creat
                      </SelectItem>
                      <SelectItem value="BAC">BAC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              onClick={() =>
                setSubstanceResultDialogOpen(false)
              }
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor:
                  "var(--slds-g-color-neutral-95)",
                color: "var(--slds-g-color-text-default)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSubstanceResult}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Substance Use - Disclosure Dialog (Details) - also used for View in read-only mode */}
      <Dialog
        open={disclosureDialogOpen}
        onOpenChange={(open) => {
          setDisclosureDialogOpen(open);
          if (!open) setDisclosureReadOnly(false);
        }}
      >
        <DialogContent size="lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {disclosureReadOnly
                ? "View Substance Use Disclosure"
                : editingDisclosureId
                  ? "Edit Substance Use Disclosure"
                  : "Add Substance Use Disclosure"}
            </DialogTitle>
            <DialogDescription>
              {disclosureReadOnly
                ? "View substance use disclosure information."
                : editingDisclosureId
                  ? "Update substance use disclosure information."
                  : "Add a new substance use disclosure record for this constituent."}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="disclosure-date"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Disclosure Date{" "}
                  {!disclosureReadOnly && (
                    <span className="text-red-600">*</span>
                  )}
                </Label>
                {disclosureReadOnly ? (
                  <div
                    className="text-[13px] h-9 flex items-center"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {isoToMdy(disclosureFormData.date) || "—"}
                  </div>
                ) : (
                  <DateInput
                    id="disclosure-date"
                    value={isoToMdy(disclosureFormData.date)}
                    onChange={(v) =>
                      ((e) =>
                        setDisclosureFormData({
                          ...disclosureFormData,
                          date: e.target.value,
                        }))({ target: { value: mdyToIso(v) } })
                    }
                    className="h-9 text-[13px] rounded"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  />
                )}
              </div>
              <div>
                <Label
                  htmlFor="disclosure-time"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Time{" "}
                  {!disclosureReadOnly && (
                    <span className="text-red-600">*</span>
                  )}
                </Label>
                {disclosureReadOnly ? (
                  <div
                    className="text-[13px] h-9 flex items-center"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {disclosureFormData.time || "—"}
                  </div>
                ) : (
                  <Input
                    id="disclosure-time"
                    type="time"
                    value={disclosureFormData.time}
                    onChange={(e) =>
                      setDisclosureFormData({
                        ...disclosureFormData,
                        time: e.target.value,
                      })
                    }
                    className="h-9 text-[13px] rounded"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  />
                )}
              </div>
            </div>
            <div>
              <Label
                htmlFor="disclosure-related-to-test"
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Related to Test?{" "}
                {!disclosureReadOnly && (
                  <span className="text-red-600">*</span>
                )}
              </Label>
              {disclosureReadOnly ? (
                <div
                  className="text-[13px] h-9 flex items-center"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {disclosureFormData.relatedToTest || "—"}
                </div>
              ) : (
                <Select
                  value={disclosureFormData.relatedToTest}
                  onValueChange={(value) =>
                    setDisclosureFormData({
                      ...disclosureFormData,
                      relatedToTest: value,
                      beforeAfterTest:
                        value === "No"
                          ? ""
                          : disclosureFormData.beforeAfterTest,
                      relatedTestSet:
                        value === "No"
                          ? ""
                          : disclosureFormData.relatedTestSet,
                    })
                  }
                >
                  <SelectTrigger
                    id="disclosure-related-to-test"
                    className="h-9 text-[13px] rounded"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Conditional fields - only show when Related to Test = Yes */}
            {disclosureFormData.relatedToTest === "Yes" && (
              <>
                <div>
                  <Label
                    htmlFor="disclosure-before-after"
                    className="block text-[12px] font-semibold mb-1.5 uppercase"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Before/After Test{" "}
                    {!disclosureReadOnly && (
                      <span className="text-red-600">*</span>
                    )}
                  </Label>
                  {disclosureReadOnly ? (
                    <div
                      className="text-[13px] h-9 flex items-center"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {disclosureFormData.beforeAfterTest ||
                        "—"}
                    </div>
                  ) : (
                    <Select
                      value={disclosureFormData.beforeAfterTest}
                      onValueChange={(value) =>
                        setDisclosureFormData({
                          ...disclosureFormData,
                          beforeAfterTest: value,
                        })
                      }
                    >
                      <SelectTrigger
                        id="disclosure-before-after"
                        className="h-9 text-[13px] rounded"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="After Test">
                          After Test
                        </SelectItem>
                        <SelectItem value="Before Test">
                          Before Test
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="disclosure-related-test-set"
                    className="block text-[12px] font-semibold mb-1.5 uppercase"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Related Test Set{" "}
                    {!disclosureReadOnly && (
                      <span className="text-red-600">*</span>
                    )}
                  </Label>
                  {disclosureReadOnly ? (
                    <div
                      className="text-[13px] h-9 flex items-center"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {disclosureFormData.relatedTestSet || "—"}
                    </div>
                  ) : (
                    <Select
                      value={disclosureFormData.relatedTestSet}
                      onValueChange={(value) =>
                        setDisclosureFormData({
                          ...disclosureFormData,
                          relatedTestSet: value,
                        })
                      }
                    >
                      <SelectTrigger
                        id="disclosure-related-test-set"
                        className="h-9 text-[13px] rounded"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        <SelectValue placeholder="Select associated test..." />
                      </SelectTrigger>
                      <SelectContent>
                        {substanceUseTests.map((test) => {
                          const [datePart, timePart] =
                            test.dateTime.split(", ");
                          return (
                            <SelectItem
                              key={test.id}
                              value={`Test #${test.id} - ${test.dateTime}`}
                            >
                              Test #{test.id} - {datePart} at{" "}
                              {timePart}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </>
            )}

            <div>
              <Label
                htmlFor="disclosure-reporter"
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Reporter{" "}
                {!disclosureReadOnly && (
                  <span className="text-red-600">*</span>
                )}
              </Label>
              {disclosureReadOnly ? (
                <div
                  className="text-[13px] h-9 flex items-center"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {disclosureFormData.reporter || "—"}
                </div>
              ) : (
                <Input
                  id="disclosure-reporter"
                  value={disclosureFormData.reporter}
                  onChange={(e) =>
                    setDisclosureFormData({
                      ...disclosureFormData,
                      reporter: e.target.value,
                    })
                  }
                  placeholder="Enter reporter name and credentials"
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
              )}
            </div>
            <div>
              <Label
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Substances{" "}
                {!disclosureReadOnly && (
                  <>
                    <span className="text-red-600">*</span>
                    <span> (Select At Least One)</span>
                  </>
                )}
              </Label>
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                {!disclosureReadOnly && (
                  <div
                    className="px-3 py-2 flex items-center justify-end"
                    style={{
                      borderBottom:
                        disclosureFormData.substances.length > 0
                          ? "1px solid var(--slds-g-color-border-base-1)"
                          : "none",
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                    }}
                  >
                    <Button
                      onClick={handleOpenDisclosureSubstances}
                      className="h-7 px-3 rounded-full text-[12px]"
                      style={{
                        backgroundColor: "#145F33",
                        color: "white",
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {disclosureFormData.substances.length > 0
                        ? "Modify"
                        : "Add"}
                    </Button>
                  </div>
                )}
                {disclosureFormData.substances.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow hoverable={false}>
                        <TableHead>Substance</TableHead>
                        {!disclosureReadOnly && (
                          <TableHead className="w-16">
                            Actions
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {disclosureFormData.substances.map(
                        (substance, index) => (
                          <TableRow key={index}>
                            <TableCell
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              {substance}
                            </TableCell>
                            {!disclosureReadOnly && (
                              <TableCell>
                                <button
                                  onClick={() =>
                                    handleRemoveDisclosureSubstance(
                                      index,
                                    )
                                  }
                                  className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                  title="Remove"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-[#c23934]" />
                                </button>
                              </TableCell>
                            )}
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                ) : (
                  <p
                    className="text-[13px] text-center py-4"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    No substances selected
                    {disclosureReadOnly ? "" : " yet"}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label
                htmlFor="disclosure-comments"
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Comments
              </Label>
              {disclosureReadOnly ? (
                <div
                  className="text-[13px]"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {disclosureFormData.comments || "—"}
                </div>
              ) : (
                <Textarea
                  id="disclosure-comments"
                  value={disclosureFormData.comments}
                  onChange={(e) =>
                    setDisclosureFormData({
                      ...disclosureFormData,
                      comments: e.target.value,
                    })
                  }
                  placeholder="Enter disclosure details..."
                  className="text-[13px] rounded min-h-[120px]"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
              )}
            </div>
          </DialogBody>
          <DialogFooter className="gap-2">
            {disclosureReadOnly ? (
              <Button
                onClick={() => {
                  setDisclosureDialogOpen(false);
                  setDisclosureReadOnly(false);
                }}
                className="h-9 px-6 text-[13px] font-medium rounded-full"
                style={{
                  backgroundColor: "#f3f2f2",
                  color: "#080707",
                  border: "1px solid #dddbda",
                }}
              >
                Close
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => setDisclosureDialogOpen(false)}
                  className="h-9 px-6 text-[13px] font-medium rounded-full"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-neutral-95)",
                    color: "var(--slds-g-color-text-default)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveDisclosure}
                  className="h-9 px-6 text-[13px] font-medium rounded-full"
                  style={{
                    backgroundColor: "#145F33",
                    color: "white",
                  }}
                >
                  Save
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disclosure - Substance Multi-Select Dialog */}
      <Dialog
        open={disclosureSubstanceDialogOpen}
        onOpenChange={setDisclosureSubstanceDialogOpen}
      >
        <DialogContent size="md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Select Substances</DialogTitle>
            <DialogDescription>
              Select all substances that apply to this
              disclosure. You can select multiple items.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 bg-white">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label
                  htmlFor="disclosure-substance-search"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Search
                </Label>
                <Input
                  id="disclosure-substance-search"
                  type="text"
                  value={disclosureSubstanceSearchInput}
                  onChange={(e) =>
                    setDisclosureSubstanceSearchInput(
                      e.target.value,
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleFindDisclosureSubstances();
                    }
                  }}
                  placeholder="Search substances..."
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
              </div>
              <Button
                onClick={handleFindDisclosureSubstances}
                className="h-9 px-4 rounded-full text-[12px]"
                style={{
                  backgroundColor: "#145F33",
                  color: "white",
                }}
              >
                <Search className="w-3 h-3 mr-1" />
                Find
              </Button>
              <Button
                onClick={handleClearDisclosureSubstances}
                className="h-9 px-4 rounded-full text-[12px]"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-neutral-95)",
                  color: "var(--slds-g-color-text-default)",
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                Clear
              </Button>
            </div>

            <div
              className="rounded-lg overflow-hidden"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <div className="max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow hoverable={false}>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Substance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableSubstances
                      .filter((substance: string) =>
                        disclosureSubstanceSearchApplied
                          ? substance
                              .toLowerCase()
                              .includes(
                                disclosureSubstanceSearchApplied.toLowerCase(),
                              )
                          : true,
                      )
                      .map((substance: string) => {
                        const isSelected =
                          disclosureSubstanceSelection.includes(
                            substance,
                          );
                        return (
                          <TableRow
                            key={substance}
                            className="cursor-pointer"
                            style={
                              isSelected
                                ? {
                                    backgroundColor:
                                      "var(--slds-g-color-background-alt)",
                                  }
                                : undefined
                            }
                            onClick={() =>
                              toggleDisclosureSubstance(
                                substance,
                              )
                            }
                          >
                            <TableCell
                              onClick={(e) =>
                                e.stopPropagation()
                              }
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() =>
                                  toggleDisclosureSubstance(
                                    substance,
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              {substance}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </div>
            <p
              className="text-[12px]"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {disclosureSubstanceSelection.length} substance
              {disclosureSubstanceSelection.length === 1
                ? ""
                : "s"}{" "}
              selected
            </p>
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              onClick={() =>
                setDisclosureSubstanceDialogOpen(false)
              }
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor:
                  "var(--slds-g-color-neutral-95)",
                color: "var(--slds-g-color-text-default)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyDisclosureSubstances}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Substance Use Testing Modals (New Comprehensive System) */}
      <SubstanceUseTestingModals
        tests={substanceUseTests}
        onUpdateTests={setSubstanceUseTests}
        initialEntryOpen={substanceUseTestDialogOpen}
        onInitialEntryOpenChange={setSubstanceUseTestDialogOpen}
        editingTestId={editingSubstanceUseTestId}
        onEditingTestIdChange={setEditingSubstanceUseTestId}
      />
    </>
  );
}