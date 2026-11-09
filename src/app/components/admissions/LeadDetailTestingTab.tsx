import { useState, useMemo, useEffect, useRef } from "react";
import { OverflowList } from "../ui/overflow-list";
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
import { Card, CardHeader, CardTitle } from "../ui/card";
import {
  Table as DSTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { EmptyState } from "../ui/empty-state";
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
import { formatMdy } from "../../lib/dateFormat";
import type { FullLifetimeRequirement } from "../../lib/cssrsRequirement";
import {
  CssrsRequirementNotice,
  type OwnedFullLifetime,
} from "./CssrsRequirementNotice";

interface LeadDetailTestingTabProps {
  activeTab: any;
  lead: any;
  handleCreateNewTest: any;
  handleDeleteTest: any;
  handleEditTestRow: any;
  handleTestingSort: any;
  handleViewTestDocuments: any;
  hoveredTestId: any;
  isSystemAdministrator: any;
  setHoveredTestId: any;
  setSelectedTestId: any;
  setViewTestDialogOpen: any;
  sortedTestingAssessments: any;
  testingSortColumn: any;
  testingSortDirection: any;
  /** C-SSRS Full-Lifetime requirement from the saved Risk Factors. */
  fullLifetimeRequirement: FullLifetimeRequirement;
  /** Full-Lifetime assessments owned by THIS Admissions record. */
  ownedFullLifetime: OwnedFullLifetime[];
  onCompleteFullLifetime: () => void;
  fullLifetimeUnavailableReason: string | null;
  onViewCssrs: (id: string) => void;
  onEditCssrs: (id: string) => void;
}

export function LeadDetailTestingTab({
  activeTab,
  lead,
  handleCreateNewTest,
  handleDeleteTest,
  handleEditTestRow,
  handleTestingSort,
  handleViewTestDocuments,
  hoveredTestId,
  isSystemAdministrator,
  setHoveredTestId,
  setSelectedTestId,
  setViewTestDialogOpen,
  sortedTestingAssessments,
  testingSortColumn,
  testingSortDirection,
  fullLifetimeRequirement,
  ownedFullLifetime,
  onCompleteFullLifetime,
  fullLifetimeUnavailableReason,
  onViewCssrs,
  onEditCssrs,
}: LeadDetailTestingTabProps) {
  // Community Care directory: show who each assessment is for.
  const showMembers = !!(lead as any)?.communityCareMemberOptions;
  // Community Care pages: design-system card + table.
  const ccMode = !!(lead as any)?.communityCareSsmOnly;
  return (
    <>
      {activeTab === "testing" && (
        <div className="space-y-6 max-w-full">
          <CssrsRequirementNotice
            idPrefix="testing"
            requirement={fullLifetimeRequirement}
            onComplete={onCompleteFullLifetime}
            unavailableReason={fullLifetimeUnavailableReason}
            owned={ownedFullLifetime}
            onView={onViewCssrs}
            onEdit={onEditCssrs}
          />
          {ccMode && (
            <Card variant="section">
              <CardHeader size="sm" separated className="flex items-center justify-between gap-2">
                <CardTitle size="sm">Assessments</CardTitle>
                <Button
                  size="sm"
                  onClick={handleCreateNewTest}
                  disabled={lead.status !== "Active" && lead.status !== "Referral"}
                >
                  <Plus aria-hidden="true" />
                  New
                </Button>
              </CardHeader>
              {sortedTestingAssessments.length === 0 ? (
                <div className="p-4">
                  <EmptyState icon={FileText} title="No assessments yet" description="Use New to add one." className="py-6" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <DSTable style={{ minWidth: showMembers ? "860px" : "720px" }}>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          variant="slds"
                          size="md"
                          active={testingSortColumn === "date"}
                          aria-sort={testingSortColumn === "date" ? (testingSortDirection === "asc" ? "ascending" : "descending") : "none"}
                        >
                          <button
                            type="button"
                            onClick={() => handleTestingSort("date")}
                            className="inline-flex items-center gap-1 uppercase [font:inherit] [letter-spacing:inherit] outline-none focus-visible:underline"
                          >
                            DATE OF TEST / ASSESSMENT
                            {testingSortColumn === "date" &&
                              (testingSortDirection === "asc" ? (
                                <ArrowUp className="h-3 w-3" aria-hidden="true" />
                              ) : (
                                <ArrowDown className="h-3 w-3" aria-hidden="true" />
                              ))}
                          </button>
                        </TableHead>
                        {showMembers && <TableHead variant="slds" size="md">MEMBERS</TableHead>}
                        <TableHead variant="slds" size="md">TEST</TableHead>
                        <TableHead variant="slds" size="md">SUMMARY</TableHead>
                        <TableHead variant="slds" size="md" className="text-right">ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedTestingAssessments.map((test) => (
                        <TableRow key={test.id}>
                          <TableCell className="px-4 whitespace-nowrap">
                            {formatMdy(new Date(test.date + "T00:00:00Z"))}
                          </TableCell>
                          {showMembers && (
                            <TableCell className="px-4 whitespace-normal">
                              <OverflowList maxVisible={1} label="Members" items={(test as any).members ?? []} />
                            </TableCell>
                          )}
                          <TableCell className="px-4 whitespace-nowrap">
                            <button
                              type="button"
                              className="font-medium hover:underline focus-visible:underline outline-none"
                              style={{ color: "var(--color-link-blue)", fontSize: "inherit" }}
                              onClick={() => {
                                setSelectedTestId(test.id);
                                setViewTestDialogOpen(true);
                              }}
                            >
                              {test.test}
                            </button>
                          </TableCell>
                          <TableCell className="px-4 whitespace-normal min-w-[260px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                            {test.summary}
                          </TableCell>
                          <TableCell className="px-4">
                            <div className="flex justify-end gap-1">
                              {test.documents && test.documents.length > 0 && (
                                <Button variant="ghost" size="icon-xs" aria-label={`View documents for ${test.test}`} title="View Documents" onClick={() => handleViewTestDocuments(test.id)}>
                                  <Eye aria-hidden="true" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon-xs" aria-label={`Edit ${test.test}`} title="Edit" onClick={() => handleEditTestRow(test.id)}>
                                <Pencil aria-hidden="true" />
                              </Button>
                              {isSystemAdministrator && test.source !== "cssrs" && (
                                <Button variant="ghost" size="icon-xs" aria-label={`Delete ${test.test}`} title="Delete" className="text-[#c23934] hover:text-[#c23934]" onClick={() => handleDeleteTest(test.id)}>
                                  <Trash2 aria-hidden="true" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </DSTable>
                </div>
              )}
            </Card>
          )}
          {!ccMode && (<>
          <div
            className="overflow-hidden"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              borderRadius: "var(--slds-c-card-radius-border)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
          >
            {/* Toolbar */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <h2
                className="text-[13px] font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                {(lead as any)?.communityCareSsmOnly ? "Assessments" : "Testing & Assessments"}
              </h2>
              <Button
                onClick={handleCreateNewTest}
                disabled={
                  lead.status !== "Active" &&
                  lead.status !== "Referral"
                }
                className="h-8 px-3 rounded-full text-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "#145F33",
                  color: "white",
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                {(lead as any)?.communityCareSsmOnly ? "New" : "Create New Test"}
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                    }}
                  >
                    <th
                      className="px-3 py-2 text-left font-semibold cursor-pointer hover:bg-[var(--slds-g-color-background-row-hover)] select-none"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                      onClick={() => handleTestingSort("date")}
                    >
                      <div className="flex items-center gap-1">
                        Date of Test / Assessment
                        {testingSortColumn === "date" &&
                          (testingSortDirection === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" />
                          ))}
                      </div>
                    </th>
                    {showMembers && (
                    <th
                      className="px-3 py-2 text-left font-semibold"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      Member
                    </th>
                    )}
                    <th
                      className="px-3 py-2 text-left font-semibold cursor-pointer hover:bg-[var(--slds-g-color-background-row-hover)] select-none"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                      onClick={() => handleTestingSort("test")}
                    >
                      <div className="flex items-center gap-1">
                        Test
                        {testingSortColumn === "test" &&
                          (testingSortDirection === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-3 py-2 text-left font-semibold"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      Summary
                    </th>
                    <th
                      className="px-3 py-2 text-left font-semibold"
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
                  {sortedTestingAssessments.map((test) => (
                    <tr
                      key={test.id}
                      className="hover:bg-[var(--slds-g-color-background-row-hover)]"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <td
                        className="px-3 py-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {(() => {
                          const date = new Date(
                            test.date + "T00:00:00Z",
                          );
                          return formatMdy(date);
                        })()}
                      </td>
                      {showMembers && (
                      <td
                        className="px-3 py-3 text-[12px]"
                        style={{ color: "var(--slds-g-color-text-default)" }}
                      >
                        {((test as any).members ?? []).join(", ") || "\u2014"}
                      </td>
                      )}
                      <td className="px-3 py-3">
                        {/* Every test, ACEs included, opens Standardized Test Details */}
                        {
                          <Popover
                            open={hoveredTestId === test.id}
                            onOpenChange={(open) =>
                              setHoveredTestId(
                                open ? test.id : null,
                              )
                            }
                          >
                            <PopoverTrigger
                              className="text-left hover:underline cursor-pointer bg-transparent border-0 p-0 m-0 text-[14px]"
                              style={{
                                color: "#145F33",
                                fontWeight: 500,
                              }}
                              onClick={() => {
                                setSelectedTestId(test.id);
                                setViewTestDialogOpen(true);
                              }}
                              onMouseEnter={() =>
                                setHoveredTestId(test.id)
                              }
                              onMouseLeave={() =>
                                setTimeout(
                                  () => setHoveredTestId(null),
                                  200,
                                )
                              }
                            >
                              {test.test}
                            </PopoverTrigger>
                            <PopoverContent
                              // Hover preview only: keep focus on the test name
                              onOpenAutoFocus={(e) =>
                                e.preventDefault()
                              }
                              className="w-80 p-4"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                                border:
                                  "1px solid var(--slds-g-color-border-base-1)",
                                boxShadow:
                                  "0 2px 8px rgba(0,0,0,0.1)",
                              }}
                              onMouseEnter={() =>
                                setHoveredTestId(test.id)
                              }
                              onMouseLeave={() =>
                                setHoveredTestId(null)
                              }
                            >
                              <div className="space-y-2">
                                <h3
                                  className="font-semibold text-[14px]"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {test.test}
                                </h3>
                                <div className="space-y-1 text-[12px]">
                                  <div>
                                    <span
                                      className="font-medium"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      Date:{" "}
                                    </span>
                                    <span
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {(() => {
                                        const date = new Date(
                                          test.date +
                                            "T00:00:00Z",
                                        );
                                        return formatMdy(date);
                                      })()}
                                    </span>
                                  </div>
                                  <div>
                                    <span
                                      className="font-medium"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      Summary:{" "}
                                    </span>
                                    <span
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {test.summary}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        }
                      </td>
                      <td
                        className="px-3 py-3 text-[12px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {test.summary}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          {test.documents &&
                            test.documents.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 hover:bg-[var(--slds-g-color-background-row-hover)]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewTestDocuments(
                                    test.id,
                                  );
                                }}
                                title="View Documents"
                              >
                                <Eye
                                  className="h-3.5 w-3.5"
                                  style={{ color: "#145F33" }}
                                />
                              </Button>
                            )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 hover:bg-[var(--slds-g-color-background-row-hover)]"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTestRow(test.id);
                            }}
                            title="Edit"
                          >
                            <Pencil
                              className="h-3.5 w-3.5"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            />
                          </Button>
                          {isSystemAdministrator &&
                            test.source !== "cssrs" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 hover:bg-[var(--slds-g-color-background-row-hover)]"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTest(test.id);
                              }}
                              title="Delete"
                            >
                              <Trash2
                                className="h-3.5 w-3.5"
                                style={{ color: "#c23934" }}
                              />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </>)}
        </div>
      )}
    </>
  );
}