import { useState, useMemo, useEffect, useRef } from "react";
import { LeadDetailWj4Fields } from "./LeadDetailWj4Fields";
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
} from "@/app/lib/lucide-icons";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
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

import { LeadDetailTestingDialogBodyA } from "./LeadDetailTestingDialogBodyA";
import { LeadDetailAcesFields } from "./LeadDetailAcesFields";
import {
  CSSRS_FULL_LIFETIME_TEST,
  CssrsFullLifetimeFields,
} from "./CssrsFullLifetimeFields";
import {
  CSSRS_SCREENER_TEST,
  CssrsScreenerFields,
  type RelatedIrStatus,
} from "./CssrsScreenerFields";
import type { ScreenerErrors } from "../../data/cssrsScreener";
import type {
  FullLifetimeResponses,
  ScreenerResponses,
} from "../../data/cssrsTypes";
import type { RelatedIrOption } from "../../lib/cssrsRelatedIr";
import { LeadDetailTestingDialogBodyB } from "./LeadDetailTestingDialogBodyB";

interface LeadDetailTestingDialogProps {
  lead: any;
  acesFormData: any;
  setAcesFormData: any;
  acesDocuments: any;
  handleAcesFilesUpload: any;
  handleAcesRemoveDocument: any;
  handleViewDocumentAt: any;
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
  /** C-SSRS Screener (US 20105): the current editing draft only. */
  editingCssrsId: string | null;
  cssrsResponses: ScreenerResponses;
  cssrsFlResponses: FullLifetimeResponses;
  setCssrsFlResponses: (next: FullLifetimeResponses) => void;
  cssrsFlErrors: Record<string, string>;
  /** Unique per assessment, e.g. "cssrs-fl-new" / "cssrs-fl-CSSRS-000007". */
  cssrsFlIdPrefix: string;
  setCssrsResponses: (next: ScreenerResponses) => void;
  cssrsErrors: ScreenerErrors;
  cssrsSaveError: string | null;
  cssrsIrOptions: RelatedIrOption[];
  cssrsIrStatus: RelatedIrStatus;
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

export function LeadDetailTestingDialog(
  props: LeadDetailTestingDialogProps,
) {
  const {
    testingDialogOpen,
    setTestingDialogOpen,
    editingTestingId,
    handleCancelTesting,
    handleSaveTesting,
    testingFormData,
  } = props;
  const isAces = testingFormData?.test === "ACEs";
  const isCssrsScreener =
    testingFormData?.test === CSSRS_SCREENER_TEST;
  const isCssrsFullLifetime =
    testingFormData?.test === CSSRS_FULL_LIFETIME_TEST;
  return (
    <>
      <Dialog
        open={testingDialogOpen}
        onOpenChange={setTestingDialogOpen}
      >
        <DialogContent
          className="sm:max-w-4xl max-h-[calc(100vh-32px)] flex flex-col gap-0 p-0"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
            border:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
          // A document opened with View shows in the separate viewer dialog;
          // working in it must not close this form and lose its entries.
          onInteractOutside={(e) => {
            const target = e.target as Element | null;
            if (target?.closest?.('[role="dialog"]'))
              e.preventDefault();
          }}
        >
          <DialogHeader
            className="px-6 py-4"
            style={{
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <DialogTitle
              className="text-[16px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              {editingTestingId || props.editingCssrsId
                ? "Edit Standardized Test"
                : "Add Standardized Test"}
              {isAces && " - ACEs"}
            </DialogTitle>
            <DialogDescription
              className="text-[13px]"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Select test type and enter assessment information.
            </DialogDescription>
          </DialogHeader>
          {/* Only the body scrolls; header and footer stay in view */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <LeadDetailTestingDialogBodyA
              {...props}
              cssrsDateError={
                isCssrsFullLifetime
                  ? props.cssrsFlErrors.assessmentDate
                  : props.cssrsErrors.assessmentDate
              }
            />
            <LeadDetailTestingDialogBodyB {...props} />
            {isCssrsFullLifetime && (
              <CssrsFullLifetimeFields
                idPrefix={props.cssrsFlIdPrefix}
                responses={props.cssrsFlResponses}
                onResponsesChange={props.setCssrsFlResponses}
                errors={props.cssrsFlErrors}
                saveError={props.cssrsSaveError}
              />
            )}
            {isCssrsScreener && (
              <CssrsScreenerFields
                responses={props.cssrsResponses}
                onResponsesChange={props.setCssrsResponses}
                errors={props.cssrsErrors}
                saveError={props.cssrsSaveError}
                irOptions={props.cssrsIrOptions}
                irStatus={props.cssrsIrStatus}
              />
            )}
            {isAces && (
              <LeadDetailAcesFields
                acesFormData={props.acesFormData}
                setAcesFormData={props.setAcesFormData}
                acesDocuments={props.acesDocuments}
                onFilesSelected={props.handleAcesFilesUpload}
                onRemoveDocument={
                  props.handleAcesRemoveDocument
                }
                onViewDocument={props.handleViewDocumentAt}
              />
            )}
          </div>
          <DialogFooter
            className="gap-2 px-6 py-3"
            style={{
              borderTop:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <Button
              variant="outline"
              onClick={handleCancelTesting}
              className="h-9 px-6 rounded-full text-[13px] font-medium shadow-none"
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
              onClick={handleSaveTesting}
              className="h-9 px-6 rounded-full text-[13px] font-medium"
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
    </>
  );
}