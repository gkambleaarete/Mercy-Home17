import { useState, useMemo, useEffect, useRef } from "react";
import { FieldLabel } from "../ui/field";
import { CssrsScreenerDetails } from "./CssrsScreenerDetails";
import { CssrsFullLifetimeDetails } from "./CssrsFullLifetimeFields";
import type { CssrsAssessment } from "../../data/cssrsAssessmentStore";
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
import { CreateInfoSessionDialog } from "./CreateInfoSessionDialog";
import { CreateClinicalAssessmentDialog } from "./CreateClinicalAssessmentDialog";
import { CreateAdmissionsShadowDialog } from "./CreateAdmissionsShadowDialog";
import { CreateFamilyPartnershipMeetingDialog } from "./CreateFamilyPartnershipMeetingDialog";
import { formatMdy } from "../../lib/dateFormat";

const mockStaffMeetings = [
  {
    id: "sm-001",
    date: "01/19/2025",
    youthAttendance: "Yes",
    title: "Admissions Review Committee",
  },
  {
    id: "sm-002",
    date: "01/15/2025",
    youthAttendance: "No",
    title: "Preliminary Staff Discussion",
  },
];

import { ACES_QUESTIONS } from "./LeadDetailAcesFields";
interface LeadDetailRemainingDialogsProps {
  lead: any;
  handleViewDocumentAt?: (docs: any[], index: number) => void;
  onLeadUpdate?: (leadId: string, updates: any) => void;
  caregiverLinkedToAssessment: any;
  caseInfoEditOpen: any;
  caseInfoFormData: any;
  confirmDeleteTest: any;
  currentTestDocumentIndex: any;
  dcfsInvolvementDialogOpen: any;
  dcfsInvolvementMode: any;
  deleteTestConfirmOpen: any;
  editingDcfsInvolvement: any;
  editingLegalInvolvement: any;
  formatFileSize: any;
  handleEditTestRow: any;
  handleNextTestDocument: any;
  handlePreviousTestDocument: any;
  handleSatDocumentDownload: any;
  handleSaveDcfsInvolvement: any;
  handleSaveLegalInvolvement: any;
  handleTestDocumentDownload: any;
  isStepAdmissionsShadowDialogOpen: any;
  isStepClinicalAssessmentDialogOpen: any;
  isStepFamilyPartnershipMeetingDialogOpen: any;
  isStepInfoSessionDialogOpen: any;
  isStepStaffMeetingDialogOpen: any;
  legalInvolvementDialogOpen: any;
  legalInvolvementMode: any;
  processSteps: any;
  satDocumentViewerOpen: any;
  selectedSatDocument: any;
  selectedTestDocuments: any;
  selectedTestId: any;
  /** C-SSRS records visible for this youth (read from cssrsAssessmentStore). */
  cssrsAssessments: CssrsAssessment[];
  setCaregiverLinkedToAssessment: any;
  setCaseInfoEditOpen: any;
  setCaseInfoFormData: any;
  setDcfsInvolvementDialogOpen: any;
  setDeleteTestConfirmOpen: any;
  setIsStepAdmissionsShadowDialogOpen: any;
  setIsStepClinicalAssessmentDialogOpen: any;
  setIsStepFamilyPartnershipMeetingDialogOpen: any;
  setIsStepInfoSessionDialogOpen: any;
  setIsStepStaffMeetingDialogOpen: any;
  setLegalInvolvementDialogOpen: any;
  setSatDocumentViewerOpen: any;
  setTestDocumentViewerOpen: any;
  setTestToDelete: any;
  setViewTestDialogOpen: any;
  testDocumentViewerOpen: any;
  testingAssessments: any;
  viewTestDialogOpen: any;
}

export function LeadDetailRemainingDialogs({
  lead,
  handleViewDocumentAt,
  onLeadUpdate,
  caregiverLinkedToAssessment,
  caseInfoEditOpen,
  caseInfoFormData,
  confirmDeleteTest,
  currentTestDocumentIndex,
  dcfsInvolvementDialogOpen,
  dcfsInvolvementMode,
  deleteTestConfirmOpen,
  editingDcfsInvolvement,
  editingLegalInvolvement,
  formatFileSize,
  handleEditTestRow,
  handleNextTestDocument,
  handlePreviousTestDocument,
  handleSatDocumentDownload,
  handleSaveDcfsInvolvement,
  handleSaveLegalInvolvement,
  handleTestDocumentDownload,
  isStepAdmissionsShadowDialogOpen,
  isStepClinicalAssessmentDialogOpen,
  isStepFamilyPartnershipMeetingDialogOpen,
  isStepInfoSessionDialogOpen,
  isStepStaffMeetingDialogOpen,
  legalInvolvementDialogOpen,
  legalInvolvementMode,
  processSteps,
  satDocumentViewerOpen,
  selectedSatDocument,
  selectedTestDocuments,
  selectedTestId,
  cssrsAssessments,
  setCaregiverLinkedToAssessment,
  setCaseInfoEditOpen,
  setCaseInfoFormData,
  setDcfsInvolvementDialogOpen,
  setDeleteTestConfirmOpen,
  setIsStepAdmissionsShadowDialogOpen,
  setIsStepClinicalAssessmentDialogOpen,
  setIsStepFamilyPartnershipMeetingDialogOpen,
  setIsStepInfoSessionDialogOpen,
  setIsStepStaffMeetingDialogOpen,
  setLegalInvolvementDialogOpen,
  setSatDocumentViewerOpen,
  setTestDocumentViewerOpen,
  setTestToDelete,
  setViewTestDialogOpen,
  testDocumentViewerOpen,
  testingAssessments,
  viewTestDialogOpen,
}: LeadDetailRemainingDialogsProps) {
  return (
    <>
      {/* Testing & Assessments - View Dialog */}
      <Dialog
        open={viewTestDialogOpen}
        onOpenChange={setViewTestDialogOpen}
      >
        <DialogContent
          className="sm:max-w-2xl max-h-[calc(100vh-32px)] flex flex-col gap-0 p-0"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
            border:
              "1px solid var(--slds-g-color-border-base-1)",
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
              Standardized Test Details
            </DialogTitle>
            <DialogDescription className="sr-only">
              Read-only details of the selected standardized
              test.
            </DialogDescription>
          </DialogHeader>
          {selectedTestId &&
            (() => {
              // C-SSRS records (string ids) come from their own store.
              if (typeof selectedTestId === "string") {
                const cssrs = cssrsAssessments.find(
                  (r) => r.id === selectedTestId,
                );
                if (!cssrs) return null;
                return (
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p
                          className="text-[12px] font-semibold mb-1"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          DATE
                        </p>
                        <p
                          className="text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {formatMdy(
                            new Date(
                              cssrs.assessmentDate +
                                "T00:00:00Z",
                            ),
                          )}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-[12px] font-semibold mb-1"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          TEST
                        </p>
                        <p
                          className="text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {cssrs.testType}
                        </p>
                      </div>
                    </div>
                    {cssrs.instrument === "cssrs-screener" ? (
                      <CssrsScreenerDetails record={cssrs} />
                    ) : (
                      <CssrsFullLifetimeDetails
                        responses={cssrs.responses}
                      />
                    )}
                  </div>
                );
              }
              const testData = testingAssessments.find(
                (t) => t.id === selectedTestId,
              );
              if (!testData) return null;
              const formattedDate = (() => {
                const date = new Date(
                  testData.date + "T00:00:00Z",
                );
                return formatMdy(date);
              })();
              return (
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                  {/* Member (Community Care) — shown first */}
                  {(testData as any).members?.length > 0 && (
                    <div>
                      <FieldLabel>Members</FieldLabel>
                      <p
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {(testData as any).members.join(", ")}
                      </p>
                    </div>
                  )}
                  {/* Header Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p
                        className="text-[12px] font-semibold mb-1"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        DATE
                      </p>
                      <p
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {formattedDate}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-[12px] font-semibold mb-1"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        TEST
                      </p>
                      <p
                        className="text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {testData.test}
                      </p>
                    </div>
                  </div>

                  {testData.test === "ACEs" ? (
                    // ACEs: read-only answers, the saved (manually entered)
                    // total, commentary and documents
                    <div
                      className="border-t pt-4 space-y-5"
                      style={{
                        borderColor:
                          "var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <div>
                        <h4
                          className="text-[13px] font-semibold uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          ACEs Assessment
                        </h4>
                        <p
                          className="text-[12px] font-semibold uppercase mt-2 mb-3"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          While you were growing up, during your
                          first 18 years of life:
                        </p>
                        <ol className="space-y-3">
                          {ACES_QUESTIONS.map((q, i) => (
                            <li key={i}>
                              <p
                                className="text-[12px] font-semibold uppercase"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                {i + 1}. {q}
                              </p>
                              <p
                                className="text-[13px]"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                {testData.acesData?.answers?.[
                                  i + 1
                                ] ?? "--"}
                              </p>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div
                        className="border-t pt-4"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <p
                          className="text-[12px] font-semibold mb-1 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Total Number of ACEs
                        </p>
                        <p
                          className="text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {testData.acesData?.totalAces ??
                            (testData.totalAces != null
                              ? String(testData.totalAces)
                              : "--")}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-[12px] font-semibold mb-1 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Commentary
                        </p>
                        <p
                          className="text-[13px] whitespace-pre-wrap"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {testData.acesData?.commentary ||
                            "--"}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-[12px] font-semibold mb-1 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Documents
                        </p>
                        {testData.documents?.length ? (
                          <ul className="space-y-1">
                            {testData.documents.map(
                              (doc: any, i: number) => (
                                <li
                                  key={doc.id}
                                  className="flex items-center gap-3"
                                >
                                  <File
                                    className="h-4 w-4 flex-shrink-0"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                    }}
                                  />
                                  <span
                                    className="flex-1 min-w-0 truncate text-[13px]"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    {doc.name}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    aria-label={`View ${doc.name}`}
                                    onClick={() =>
                                      handleViewDocumentAt?.(
                                        testData.documents,
                                        i,
                                      )
                                    }
                                  >
                                    <Eye
                                      className="h-4 w-4"
                                      style={{
                                        color: "#145F33",
                                      }}
                                    />{" "}
                                    View
                                  </Button>
                                </li>
                              ),
                            )}
                          </ul>
                        ) : (
                          <p
                            className="text-[13px]"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            --
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Summary
                    <div
                      className="border-t pt-4"
                      style={{
                        borderColor:
                          "var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <h4
                        className="text-[13px] font-semibold mb-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Summary
                      </h4>
                      <div
                        className="p-3 rounded"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-neutral-95)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <p
                          className="text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {testData.summary || "--"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          {/* Cancel | Edit, right-aligned (DialogFooter's own sm:justify-end) */}
          <DialogFooter
            className="gap-2 px-6 py-3"
            style={{
              borderTop:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <Button
              variant="outline"
              onClick={() => setViewTestDialogOpen(false)}
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
              onClick={() => {
                setViewTestDialogOpen(false);
                if (selectedTestId)
                  handleEditTestRow(selectedTestId);
              }}
              className="h-9 px-6 rounded-full text-[13px] font-medium"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Testing & Assessments - Delete Confirmation Dialog */}
      <Dialog
        open={deleteTestConfirmOpen}
        onOpenChange={setDeleteTestConfirmOpen}
      >
        <DialogContent
          className="sm:max-w-md"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
            border:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="text-[16px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Delete{" "}
              {caregiverLinkedToAssessment
                ? "Caregiver"
                : "Test"}{" "}
              Record
            </DialogTitle>
            <DialogDescription
              className="text-[13px]"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {caregiverLinkedToAssessment ? (
                // AC2, AC3, AC4: Caregiver-specific warning message
                <span>
                  This caregiver is linked to a Youth's Casey
                  Life Skills Assessment. Deleting this record
                  will remove the caregiver from the assessment.
                  Do you want to continue?
                </span>
              ) : (
                // AC12: Standard deletion message for non-linked records
                <span>
                  Are you sure you want to delete this test
                  record? This action cannot be undone.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            {/* AC6: Cancel option */}
            <Button
              variant="outline"
              onClick={() => {
                // AC10, AC11: Cancel - no deletion, no changes
                setDeleteTestConfirmOpen(false);
                setTestToDelete(null);
                setCaregiverLinkedToAssessment(false);
              }}
              className="h-9 rounded-full text-[13px] shadow-none"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
              }}
            >
              Cancel
            </Button>
            {/* AC5: Confirm option */}
            <Button
              onClick={confirmDeleteTest}
              className="h-9 rounded-full text-[13px]"
              style={{
                backgroundColor: "#c23934",
                color: "white",
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Case Information Edit Dialog */}
      <Dialog
        open={caseInfoEditOpen}
        onOpenChange={setCaseInfoEditOpen}
      >
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
            border:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle
              className="text-[16px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Edit Case Information
            </DialogTitle>
            <DialogDescription
              className="text-[13px]"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Update case information and program details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Case Manager */}
            <div>
              <Label
                className="block text-[13px] font-semibold mb-1.5"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Case Manager
              </Label>
              <Input
                value={caseInfoFormData.caseManager}
                onChange={(e) =>
                  setCaseInfoFormData({
                    ...caseInfoFormData,
                    caseManager: e.target.value,
                  })
                }
                className="h-9 text-[13px] rounded"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-4)",
                }}
                placeholder="Enter case manager name"
              />
            </div>

            {/* Guardians */}
            <div>
              <Label
                className="block text-[13px] font-semibold mb-1.5"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Guardians
              </Label>
              <Input
                value={caseInfoFormData.guardians}
                onChange={(e) =>
                  setCaseInfoFormData({
                    ...caseInfoFormData,
                    guardians: e.target.value,
                  })
                }
                className="h-9 text-[13px] rounded"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-4)",
                }}
                placeholder="Enter guardian names"
              />
            </div>

            {/* Medical Conditions */}
            <div>
              <Label
                className="block text-[13px] font-semibold mb-1.5"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Medical Conditions
              </Label>
              <Textarea
                value={caseInfoFormData.medicalConditions}
                onChange={(e) =>
                  setCaseInfoFormData({
                    ...caseInfoFormData,
                    medicalConditions: e.target.value,
                  })
                }
                className="text-[13px] rounded min-h-[60px]"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-4)",
                }}
                placeholder="Enter medical conditions"
              />
            </div>

            {/* Category */}
            <div>
              <Label
                className="block text-[13px] font-semibold mb-1.5"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Category
              </Label>
              <Select
                value={caseInfoFormData.category}
                onValueChange={(value) =>
                  setCaseInfoFormData({
                    ...caseInfoFormData,
                    category: value,
                  })
                }
              >
                <SelectTrigger
                  className="h-9 text-[13px] rounded"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-4)",
                  }}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DCFS">DCFS</SelectItem>
                  <SelectItem value="Private Pay">
                    Private Pay
                  </SelectItem>
                  <SelectItem value="Medicaid">
                    Medicaid
                  </SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Current/Intended School */}
            <div className="space-y-3">
              <Label
                className="block text-[13px] font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Current/Intended School
              </Label>

              {/* Radio Buttons */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="schoolType"
                    value="Current"
                    checked={
                      caseInfoFormData.schoolType === "Current"
                    }
                    onChange={(e) =>
                      setCaseInfoFormData({
                        ...caseInfoFormData,
                        schoolType: e.target.value,
                      })
                    }
                    className="w-4 h-4"
                    style={{ accentColor: "#145F33" }}
                  />
                  <span
                    className="text-[13px]"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Current
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="schoolType"
                    value="Intended"
                    checked={
                      caseInfoFormData.schoolType === "Intended"
                    }
                    onChange={(e) =>
                      setCaseInfoFormData({
                        ...caseInfoFormData,
                        schoolType: e.target.value,
                      })
                    }
                    className="w-4 h-4"
                    style={{ accentColor: "#145F33" }}
                  />
                  <span
                    className="text-[13px]"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Intended
                  </span>
                </label>
              </div>

              {/* School Selection and Grade */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Select
                    value={
                      caseInfoFormData.currentIntendedSchool
                    }
                    onValueChange={(value) =>
                      setCaseInfoFormData({
                        ...caseInfoFormData,
                        currentIntendedSchool: value,
                      })
                    }
                  >
                    <SelectTrigger
                      className="h-9 text-[13px] rounded"
                      style={{
                        borderColor:
                          "var(--slds-g-color-border-base-4)",
                      }}
                    >
                      <SelectValue placeholder="Select school" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lincoln Park High School">
                        Lincoln Park High School
                      </SelectItem>
                      <SelectItem value="Whitney Young High School">
                        Whitney Young High School
                      </SelectItem>
                      <SelectItem value="Kenwood Academy">
                        Kenwood Academy
                      </SelectItem>
                      <SelectItem value="Lane Tech High School">
                        Lane Tech High School
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select
                    value={caseInfoFormData.grade}
                    onValueChange={(value) =>
                      setCaseInfoFormData({
                        ...caseInfoFormData,
                        grade: value,
                      })
                    }
                  >
                    <SelectTrigger
                      className="h-9 text-[13px] rounded"
                      style={{
                        borderColor:
                          "var(--slds-g-color-border-base-4)",
                      }}
                    >
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">
                        6th Grade
                      </SelectItem>
                      <SelectItem value="7">
                        7th Grade
                      </SelectItem>
                      <SelectItem value="8">
                        8th Grade
                      </SelectItem>
                      <SelectItem value="9">
                        9th Grade
                      </SelectItem>
                      <SelectItem value="10">
                        10th Grade
                      </SelectItem>
                      <SelectItem value="11">
                        11th Grade
                      </SelectItem>
                      <SelectItem value="12">
                        12th Grade
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* IEP/504 Plan */}
            <div>
              <Label
                className="block text-[13px] font-semibold mb-1.5"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                IEP/504 academic plan in place?
              </Label>
              <Select
                value={caseInfoFormData.iep504Plan}
                onValueChange={(value) =>
                  setCaseInfoFormData({
                    ...caseInfoFormData,
                    iep504Plan: value,
                  })
                }
              >
                <SelectTrigger
                  className="h-9 text-[13px] rounded"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-4)",
                  }}
                >
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes - IEP">
                    Yes - IEP
                  </SelectItem>
                  <SelectItem value="Yes - 504 Plan">
                    Yes - 504 Plan
                  </SelectItem>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Unknown">
                    Unknown
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-2 w-full justify-end">
              <Button
                variant="outline"
                onClick={() => setCaseInfoEditOpen(false)}
                className="h-9 rounded-full text-[13px]"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-4)",
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success(
                    "Case information updated successfully",
                  );
                  // The Pipeline category (Lead.status) is NOT part of this
                  // form: it changes only through Change Category (US
                  // 20140), so an unrelated edit can never write a stale
                  // or default category back to the admission.
                  setCaseInfoEditOpen(false);
                }}
                className="h-9 rounded-full text-[13px]"
                style={{
                  backgroundColor: "#145F33",
                  color: "white",
                }}
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Session Dialog (from Process Steps hyperlink) */}
      <CreateInfoSessionDialog
        open={isStepInfoSessionDialogOpen}
        onOpenChange={setIsStepInfoSessionDialogOpen}
      />

      {/* Clinical Assessment Dialog (from Process Steps hyperlink) */}
      <CreateClinicalAssessmentDialog
        open={isStepClinicalAssessmentDialogOpen}
        onOpenChange={setIsStepClinicalAssessmentDialogOpen}
      />

      {/* Admissions Shadow Dialog (from Process Steps hyperlink) */}
      <CreateAdmissionsShadowDialog
        open={isStepAdmissionsShadowDialogOpen}
        onOpenChange={setIsStepAdmissionsShadowDialogOpen}
      />

      {/* Family Partnership Meeting Dialog (from Process Steps hyperlink) */}
      <CreateFamilyPartnershipMeetingDialog
        open={isStepFamilyPartnershipMeetingDialogOpen}
        onOpenChange={
          setIsStepFamilyPartnershipMeetingDialogOpen
        }
      />

      {/* Staff Meeting Dialog (from Process Steps hyperlink) */}
      <Dialog
        open={isStepStaffMeetingDialogOpen}
        onOpenChange={setIsStepStaffMeetingDialogOpen}
      >
        <DialogContent
          className="max-w-2xl"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle
              className="text-[15px] font-semibold"
              style={{ color: "#080707" }}
            >
              Staff Meeting Details
            </DialogTitle>
            <DialogDescription
              className="text-[13px]"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              View details of the earliest staff meeting with
              youth attendance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {(() => {
              const staffMeeting = mockStaffMeetings.find(
                (sm) =>
                  sm.id ===
                  processSteps.find(
                    (ps) => ps.stepName === "Staff Meeting",
                  )?.recordId,
              );
              if (!staffMeeting) {
                return (
                  <div className="text-center py-8">
                    <p
                      className="text-[13px]"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      No staff meeting record found with youth
                      attendance
                    </p>
                  </div>
                );
              }
              return (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        className="block text-[11px] font-semibold mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Meeting Date
                      </Label>
                      <Input
                        value={staffMeeting.date}
                        readOnly
                        className="h-9 text-[13px] rounded bg-[#f3f2f2] cursor-not-allowed"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-4)",
                        }}
                      />
                    </div>
                    <div>
                      <Label
                        className="block text-[11px] font-semibold mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Youth Attendance
                      </Label>
                      <Input
                        value={staffMeeting.youthAttendance}
                        readOnly
                        className="h-9 text-[13px] rounded bg-[#f3f2f2] cursor-not-allowed"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-4)",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label
                      className="block text-[11px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Meeting Title
                    </Label>
                    <Input
                      value={staffMeeting.title}
                      readOnly
                      className="h-9 text-[13px] rounded bg-[#f3f2f2] cursor-not-allowed"
                      style={{
                        borderColor:
                          "var(--slds-g-color-border-base-4)",
                      }}
                    />
                  </div>
                  <div className="pt-2">
                    <div
                      className="flex items-start gap-2 p-3 rounded"
                      style={{
                        backgroundColor: "#e8f4f0",
                        border: "1px solid #c3e6d8",
                      }}
                    >
                      <CheckCircle
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        style={{ color: "#145F33" }}
                      />
                      <div className="flex-1">
                        <p
                          className="text-[12px] font-medium"
                          style={{ color: "#145F33" }}
                        >
                          This is the earliest staff meeting
                          where the youth attended
                        </p>
                        <p
                          className="text-[11px] mt-1"
                          style={{ color: "#0a3622" }}
                        >
                          This milestone date is automatically
                          populated based on attendance records
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
          <DialogFooter>
            <Button
              onClick={() =>
                setIsStepStaffMeetingDialogOpen(false)
              }
              className="h-9 px-4 rounded font-medium text-[13px]"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Legal Involvement Dialog */}
      <LegalInvolvementDialog
        open={legalInvolvementDialogOpen}
        onClose={() => setLegalInvolvementDialogOpen(false)}
        onSave={handleSaveLegalInvolvement}
        editingRecord={editingLegalInvolvement}
        mode={legalInvolvementMode}
      />

      {/* DCFS Involvement Dialog */}
      <DCFSInvolvementDialog
        open={dcfsInvolvementDialogOpen}
        onClose={() => setDcfsInvolvementDialogOpen(false)}
        onSave={handleSaveDcfsInvolvement}
        editingRecord={editingDcfsInvolvement}
        mode={dcfsInvolvementMode}
      />

      {/* SAT Document Viewer Dialog */}
      <Dialog
        open={satDocumentViewerOpen}
        onOpenChange={setSatDocumentViewerOpen}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <File className="w-5 h-5" />
              {selectedSatDocument?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedSatDocument &&
                `${formatFileSize(selectedSatDocument.size)} • Uploaded ${selectedSatDocument.uploadedDate}`}
            </DialogDescription>
          </DialogHeader>
          <div
            className="flex-1 overflow-auto"
            style={{ minHeight: "500px" }}
          >
            {selectedSatDocument && (
              <>
                {selectedSatDocument.type ===
                "application/pdf" ? (
                  <iframe
                    src={selectedSatDocument.url}
                    className="w-full h-full"
                    style={{
                      minHeight: "500px",
                      border: "none",
                    }}
                    title={selectedSatDocument.name}
                  />
                ) : selectedSatDocument.type.startsWith(
                    "image/",
                  ) ? (
                  <div className="flex items-center justify-center p-4">
                    <img
                      src={selectedSatDocument.url}
                      alt={selectedSatDocument.name}
                      className="max-w-full h-auto"
                      style={{ maxHeight: "600px" }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-12">
                    <div className="text-center">
                      <File
                        className="w-16 h-16 mx-auto mb-4"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      />
                      <p
                        className="text-[14px] mb-2"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Preview not available for this file type
                      </p>
                      <p
                        className="text-[12px] mb-4"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        You can download the file to view it
                      </p>
                      <Button
                        onClick={() =>
                          selectedSatDocument &&
                          handleSatDocumentDownload(
                            selectedSatDocument,
                          )
                        }
                        style={{
                          backgroundColor: "#145F33",
                          color: "white",
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download File
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() =>
                selectedSatDocument &&
                handleSatDocumentDownload(selectedSatDocument)
              }
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              onClick={() => setSatDocumentViewerOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Row Document Viewer Dialog */}
      <Dialog
        open={testDocumentViewerOpen}
        onOpenChange={setTestDocumentViewerOpen}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <File className="w-5 h-5" />
              {selectedTestDocuments &&
                selectedTestDocuments[currentTestDocumentIndex]
                  ?.name}
            </DialogTitle>
            {selectedTestDocuments &&
              selectedTestDocuments[
                currentTestDocumentIndex
              ] && (
                <DialogDescription asChild>
                  <div
                    className="flex items-center gap-2 text-sm"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    <span>
                      {formatFileSize(
                        selectedTestDocuments[
                          currentTestDocumentIndex
                        ].size,
                      )}{" "}
                      • Uploaded{" "}
                      {
                        selectedTestDocuments[
                          currentTestDocumentIndex
                        ].uploadedDate
                      }
                    </span>
                    {selectedTestDocuments.length > 1 && (
                      <span
                        className="ml-2 px-2 py-0.5 text-xs rounded"
                        style={{
                          backgroundColor: "#145F33",
                          color: "white",
                        }}
                      >
                        {currentTestDocumentIndex + 1} of{" "}
                        {selectedTestDocuments.length}
                      </span>
                    )}
                  </div>
                </DialogDescription>
              )}
          </DialogHeader>
          <div
            className="flex-1 overflow-auto"
            style={{ minHeight: "500px" }}
          >
            {selectedTestDocuments &&
              selectedTestDocuments[
                currentTestDocumentIndex
              ] && (
                <>
                  {selectedTestDocuments[
                    currentTestDocumentIndex
                  ].type === "application/pdf" ? (
                    <iframe
                      src={
                        selectedTestDocuments[
                          currentTestDocumentIndex
                        ].url
                      }
                      className="w-full h-full"
                      style={{
                        minHeight: "500px",
                        border: "none",
                      }}
                      title={
                        selectedTestDocuments[
                          currentTestDocumentIndex
                        ].name
                      }
                    />
                  ) : selectedTestDocuments[
                      currentTestDocumentIndex
                    ].type.startsWith("image/") ? (
                    <div className="flex items-center justify-center p-4">
                      <img
                        src={
                          selectedTestDocuments[
                            currentTestDocumentIndex
                          ].url
                        }
                        alt={
                          selectedTestDocuments[
                            currentTestDocumentIndex
                          ].name
                        }
                        className="max-w-full h-auto"
                        style={{ maxHeight: "600px" }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-12">
                      <div className="text-center">
                        <File
                          className="w-16 h-16 mx-auto mb-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        />
                        <p
                          className="text-[14px] mb-2"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          Preview not available for this file
                          type
                        </p>
                        <p
                          className="text-[12px] mb-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          You can download the file to view it
                        </p>
                        <Button
                          onClick={() =>
                            selectedTestDocuments &&
                            handleTestDocumentDownload(
                              selectedTestDocuments[
                                currentTestDocumentIndex
                              ],
                            )
                          }
                          style={{
                            backgroundColor: "#145F33",
                            color: "white",
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download File
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
          </div>
          <DialogFooter className="gap-2">
            {selectedTestDocuments &&
              selectedTestDocuments.length > 1 && (
                <div className="flex gap-2 mr-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousTestDocument}
                    disabled={currentTestDocumentIndex === 0}
                  >
                    <ChevronDown className="w-4 h-4 mr-1 rotate-90" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextTestDocument}
                    disabled={
                      currentTestDocumentIndex ===
                      selectedTestDocuments.length - 1
                    }
                  >
                    Next
                    <ChevronDown className="w-4 h-4 ml-1 -rotate-90" />
                  </Button>
                </div>
              )}
            <Button
              variant="outline"
              onClick={() =>
                selectedTestDocuments &&
                handleTestDocumentDownload(
                  selectedTestDocuments[
                    currentTestDocumentIndex
                  ],
                )
              }
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              onClick={() => setTestDocumentViewerOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}