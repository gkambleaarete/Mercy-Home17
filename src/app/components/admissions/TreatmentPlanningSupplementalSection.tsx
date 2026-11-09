import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { OverflowList } from "../ui/overflow-list"
import { useNavigate } from "react-router-dom"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { MultiSelect } from "../ui/multi-select"
import { Textarea } from "../ui/textarea"
import { Checkbox } from "../ui/checkbox"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { toast } from "sonner@2.0.3"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
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
  X,
  ChevronLeft,
  Search,
  Filter,
  Calendar,
  Package,
  Tag,
  ClipboardList,
  ChevronsUpDown,
  Download,
  Eye,
  File,
  MoreVertical,
  AlertCircle,
} from "lucide-react"
import { DateInput } from "../ui/date-input"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import {
  Table as DSTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { EmptyState } from "../ui/empty-state"
import { FieldLabel } from "../ui/field"
import { isoToMdy, mdyToIso } from "../../lib/dateFormat"
import { AcademicServicePlanDetails } from "./AcademicServicePlanDetails"
import { HRAPlanDetails } from "./HRAPlanDetails"
import { StrengthsAssessmentPlanDetails } from "./StrengthsAssessmentPlanDetails"
import { ScholarshipAgreementPlanDetails } from "./ScholarshipAgreementPlanDetails"
import {
  STUDY_TIME_PLAN,
  StudyTimePlanDetails,
  StudyTimePlanSignaturesSection,
  isStudyTimePlanValid,
  studyTimePlanRecordFields,
  type TestingRecord,
} from "./StudyTimePlanDetails"

interface TreatmentPlanningSupplementalSectionProps {
  AGREEMENT_TYPES: any
  ASP_SERVICES: any
  CLP_DOMAINS: any
  PLANS_WITH_SIGNATURES: any
  PLAN_TYPES: any
  SA_CATEGORIES: any
  activeSubSection: any
  addPlanTab: any
  editingPlanId: any
  handleDeletePlan: any
  handleSavePlanModal: any
  isAddPlanModalOpen: any
  planForm: any
  resetAddPlanModal: any
  setAddPlanTab: any
  setEditingPlanId: any
  setIsAddPlanModalOpen: any
  setPlanForm: any
  setSupplementalPlans: any
  supplementalPlans: any
  hiddenTabs: string[]
  testingAssessments?: TestingRecord[]
  /** Optional, additive: label the section "Plans" (and the dialog "New
   *  Plan" / "Edit Plan") instead of "Supplemental Plans". */
  plainPlansLabel?: boolean
  /** Optional, additive: show a Member column after Start Date. */
  showMemberColumn?: boolean
  /** Optional: names offered in the dialog's Member dropdown (Community Care directory). */
  memberOptions?: string[]
}

export function TreatmentPlanningSupplementalSection({
  AGREEMENT_TYPES,
  ASP_SERVICES,
  CLP_DOMAINS,
  PLANS_WITH_SIGNATURES,
  PLAN_TYPES,
  SA_CATEGORIES,
  activeSubSection,
  addPlanTab,
  editingPlanId,
  handleDeletePlan,
  handleSavePlanModal,
  isAddPlanModalOpen,
  planForm,
  resetAddPlanModal,
  setAddPlanTab,
  setEditingPlanId,
  setIsAddPlanModalOpen,
  setPlanForm,
  setSupplementalPlans,
  supplementalPlans,
  hiddenTabs,
  testingAssessments = [],
  plainPlansLabel = false,
  showMemberColumn = false,
  memberOptions,
}: TreatmentPlanningSupplementalSectionProps) {
  const openEditPlan = (plan: any) => {
    setPlanForm((f: any) => ({
      ...f,
      planType: plan.planType || "",
      startDate: plan.startDate || "",
      endDate: plan.endDate || "",
      reEvalDates: [
        plan.reEvaluationDate || "",
        plan.reEvalDate2 || "",
        plan.reEvalDate3 || "",
      ],
      description: plan.description || "",
      member: plan.member || "",
      ...(plan.studyTime ?? {}),
    }))
    setEditingPlanId(plan.id)
    setAddPlanTab("overview")
    setIsAddPlanModalOpen(true)
  }
  const isStudyTimePlan = planForm.planType === STUDY_TIME_PLAN
  const isStudyTimeInvalid = isStudyTimePlan && !isStudyTimePlanValid(planForm)
  return (
    <>
      {activeSubSection === "supplementalPlans" &&
        !hiddenTabs.includes("supplementalPlans") && (
          <div className="space-y-4">
            {!plainPlansLabel && (
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-[#080707]">
                  Supplemental Plans
                </h3>
                <Button
                  onClick={() => setIsAddPlanModalOpen(true)}
                  className="h-8 px-3 rounded-full text-[13px]"
                  style={{
                    backgroundColor: "#145F33",
                    color: "white",
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add Plan
                </Button>
              </div>
            )}

            {/* Add Plan Dialog — 3-tab modal */}
            <Dialog
              open={isAddPlanModalOpen}
              onOpenChange={(open) => {
                if (!open) {
                  setEditingPlanId(null)
                  resetAddPlanModal()
                }
              }}
            >
              <DialogContent
                className={`sm:max-w-[820px] max-h-[90vh] flex flex-col p-0${
                  plainPlansLabel ? " gap-0" : ""
                }`}
                style={{
                  backgroundColor: "var(--slds-g-color-background-base)",
                  border: "1px solid #dddbda",
                }}
              >
                {/* Header */}
                <DialogHeader
                  className="px-6 pt-6 pb-4 border-b flex-shrink-0"
                  style={{
                    borderColor: "#dddbda",
                  }}
                >
                  <DialogTitle className="text-[15px] font-semibold text-[#080707]">
                    {editingPlanId !== null
                      ? plainPlansLabel
                        ? "Edit Plan"
                        : "Edit Supplemental Plan"
                      : plainPlansLabel
                        ? "New Plan"
                        : "New Supplemental Plan"}
                  </DialogTitle>
                  <DialogDescription
                    className="text-[13px] mt-0.5"
                    style={{ color: "#706e6b" }}
                  >
                    {editingPlanId !== null
                      ? "Update the plan details across all tabs and save your changes."
                      : "Complete the plan details across all tabs before saving."}
                  </DialogDescription>
                </DialogHeader>

                {plainPlansLabel ? (
                  <Tabs
                    value={addPlanTab}
                    onValueChange={(v) => setAddPlanTab(v as any)}
                    className="flex-shrink-0"
                  >
                    <TabsList variant="underline" separated className="px-6">
                      <TabsTrigger value="overview" variant="underline">
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="plan-details" variant="underline">
                        Plan Details
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                ) : (
                  <>
                    {/* Tab Navigation */}
                    <div
                      className="border-b flex-shrink-0"
                      style={{
                        borderColor: "#dddbda",
                      }}
                    >
                      <div className="flex px-6">
                        {(() => {
                          const baseTabs = [
                            {
                              key: "overview" as const,
                              label: "Overview",
                            },
                            {
                              key: "plan-details" as const,
                              label: "Plan Details",
                            },
                          ]
                          const isAcademicServicePlan =
                            planForm.planType === "Academic Service Plan"
                          const tabs = isAcademicServicePlan
                            ? [
                                ...baseTabs,
                                {
                                  key: "services" as const,
                                  label: "Services",
                                },
                              ]
                            : baseTabs

                          return tabs.map((tab) => (
                            <button
                              key={tab.key}
                              onClick={() => setAddPlanTab(tab.key)}
                              className="px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap"
                              style={{
                                color:
                                  addPlanTab === tab.key
                                    ? "#145F33"
                                    : "#706e6b",
                                borderBottomWidth: "3px",
                                borderBottomStyle: "solid",
                                borderBottomColor:
                                  addPlanTab === tab.key
                                    ? "#145F33"
                                    : "transparent",
                                marginBottom: "-1px",
                              }}
                            >
                              {tab.label}
                            </button>
                          ))
                        })()}
                      </div>
                    </div>
                  </>
                )}

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                  {/* ── OVERVIEW TAB ── */}
                  {addPlanTab === "overview" && (
                    <div className="space-y-5">
                      {plainPlansLabel ? (
                        <>
                          {memberOptions && (
                            <div className="space-y-1.5">
                              <FieldLabel required htmlFor="plan-member">
                                Members
                              </FieldLabel>
                              {/* Multi-select; stored as "A, B" so the
                                  table and validation keep working. */}
                              <MultiSelect
                                id="plan-member"
                                value={
                                  (planForm as any).member
                                    ? memberOptions.filter((o) =>
                                        String((planForm as any).member)
                                          .split(", ")
                                          .includes(o),
                                      )
                                    : []
                                }
                                onValueChange={(v) =>
                                  setPlanForm((f: any) => ({
                                    ...f,
                                    member: v.join(", "),
                                  }))
                                }
                                options={memberOptions}
                                placeholder="Please Select"
                              />
                            </div>
                          )}
                          <div className="space-y-1.5">
                            <FieldLabel required htmlFor="plan-type">
                              Plan Type
                            </FieldLabel>
                            <Select
                              value={planForm.planType || undefined}
                              onValueChange={(v) =>
                                setPlanForm((f) => ({ ...f, planType: v }))
                              }
                            >
                              <SelectTrigger id="plan-type" surface="base">
                                <SelectValue placeholder="Select plan type…" />
                              </SelectTrigger>
                              <SelectContent>
                                {PLAN_TYPES.map((t: string) => (
                                  <SelectItem key={t} value={t}>
                                    {t}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <FieldLabel required htmlFor="plan-start">
                                Start Date
                              </FieldLabel>
                              <DateInput
                                id="plan-start"
                                value={isoToMdy(planForm.startDate)}
                                onChange={(v) =>
                                  setPlanForm((f) => ({
                                    ...f,
                                    startDate: mdyToIso(v),
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-1.5">
                              <FieldLabel htmlFor="plan-end">
                                End Date
                              </FieldLabel>
                              <DateInput
                                id="plan-end"
                                value={isoToMdy(planForm.endDate)}
                                onChange={(v) =>
                                  setPlanForm((f) => ({
                                    ...f,
                                    endDate: mdyToIso(v),
                                  }))
                                }
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <FieldLabel id="plan-reeval-label">
                              Re-Evaluation Dates (max 3)
                            </FieldLabel>
                            <div
                              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                              role="group"
                              aria-labelledby="plan-reeval-label"
                            >
                              {planForm.reEvalDates.map(
                                (d: string, i: number) => (
                                  <DateInput
                                    key={i}
                                    id={`plan-reeval-${i + 1}`}
                                    aria-describedby="plan-reeval-label"
                                    value={isoToMdy(d)}
                                    placeholder={`Date ${i + 1}`}
                                    onChange={(v) =>
                                      ((i: number, v: string) =>
                                        setPlanForm((f) => {
                                          const r = [...f.reEvalDates]
                                          r[i] = mdyToIso(v)
                                          return { ...f, reEvalDates: r }
                                        }))(i, v)
                                    }
                                  />
                                ),
                              )}
                            </div>
                          </div>
                          {planForm.planType !== "Community Launch Plan" && (
                            <div className="space-y-1.5">
                              <FieldLabel htmlFor="plan-description">
                                Description
                              </FieldLabel>
                              <Textarea
                                id="plan-description"
                                rows={4}
                                value={planForm.description}
                                onChange={(e) =>
                                  setPlanForm((f) => ({
                                    ...f,
                                    description: e.target.value,
                                  }))
                                }
                                placeholder="Enter plan description…"
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Plan Type */}
                          <div className="space-y-1.5">
                            <Label
                              className="slds-form-label"
                              style={{ color: "#706e6b" }}
                            >
                              PLAN TYPE <span className="text-red-600">*</span>
                            </Label>
                            <select
                              value={planForm.planType}
                              onChange={(e) =>
                                setPlanForm((f) => ({
                                  ...f,
                                  planType: e.target.value,
                                }))
                              }
                              className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                              style={{
                                border: "1px solid #dddbda",
                                color: planForm.planType
                                  ? "var(--slds-g-color-text-default)"
                                  : "#706e6b",
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                              }}
                            >
                              <option value="">Select plan type…</option>
                              {PLAN_TYPES.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Dates row */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label
                                className="slds-form-label"
                                style={{ color: "#706e6b" }}
                              >
                                START DATE{" "}
                                <span className="text-red-600">*</span>
                              </Label>
                              <DateInput
                                value={isoToMdy(planForm.startDate)}
                                onChange={(v) =>
                                  ((e) =>
                                    setPlanForm((f) => ({
                                      ...f,
                                      startDate: e.target.value,
                                    })))({
                                    target: { value: mdyToIso(v) },
                                  })
                                }
                                className="h-9 slds-text-4"
                                style={{
                                  borderColor: "#dddbda",
                                }}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label
                                className="slds-form-label"
                                style={{ color: "#706e6b" }}
                              >
                                END DATE
                              </Label>
                              <DateInput
                                value={isoToMdy(planForm.endDate)}
                                onChange={(v) =>
                                  ((e) =>
                                    setPlanForm((f) => ({
                                      ...f,
                                      endDate: e.target.value,
                                    })))({
                                    target: { value: mdyToIso(v) },
                                  })
                                }
                                className="h-9 slds-text-4"
                                style={{
                                  borderColor: "#dddbda",
                                }}
                              />
                            </div>
                          </div>

                          {/* Re-evaluation Dates — Study Time Plan: Date 1 required, 2–3 optional */}
                          {isStudyTimePlan ? (
                            <div className="grid grid-cols-3 gap-3">
                              {planForm.reEvalDates.map((d, i) => (
                                <div key={i} className="space-y-1.5">
                                  <Label
                                    className="slds-form-label"
                                    style={{ color: "#706e6b" }}
                                  >
                                    RE-EVALUATION DATE {i + 1}
                                    {i === 0 && (
                                      <span className="text-red-600"> *</span>
                                    )}
                                  </Label>
                                  <DateInput
                                    value={isoToMdy(d)}
                                    onChange={(v) =>
                                      setPlanForm((f) => {
                                        const r = [...f.reEvalDates]
                                        r[i] = mdyToIso(v)
                                        return {
                                          ...f,
                                          reEvalDates: r,
                                        }
                                      })
                                    }
                                    className="h-9 slds-text-4"
                                    style={{
                                      borderColor: "#dddbda",
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            /* Re-evaluation Dates — max 1 for HRA, max 3 for all others */
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <Label
                                  className="slds-form-label"
                                  style={{ color: "#706e6b" }}
                                >
                                  RE-EVALUATION DATE
                                  {planForm.planType !== "Harm Risk Assessment"
                                    ? "S (MAX 3)"
                                    : ""}
                                </Label>
                                {planForm.planType ===
                                  "Harm Risk Assessment" && (
                                  <span
                                    className="inline-flex items-center gap-1 slds-text-3 px-2 py-0.5 rounded"
                                    style={{
                                      backgroundColor: "#fff8e1",
                                      color: "#78520a",
                                      border: "1px solid #fde68a",
                                    }}
                                  >
                                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                    Only 1 re-evaluation date allowed
                                  </span>
                                )}
                              </div>
                              {planForm.planType === "Harm Risk Assessment" ? (
                                <DateInput
                                  value={isoToMdy(planForm.reEvalDates[0])}
                                  onChange={(v) =>
                                    ((e) =>
                                      setPlanForm((f) => {
                                        const r = ["", "", ""]
                                        r[0] = e.target.value
                                        return {
                                          ...f,
                                          reEvalDates: r,
                                        }
                                      }))({
                                      target: {
                                        value: mdyToIso(v),
                                      },
                                    })
                                  }
                                  className="h-9 slds-text-4"
                                  style={{
                                    borderColor: "#dddbda",
                                  }}
                                />
                              ) : (
                                <div className="grid grid-cols-3 gap-3">
                                  {planForm.reEvalDates.map((d, i) => (
                                    <DateInput
                                      key={i}
                                      value={isoToMdy(d)}
                                      onChange={(v) =>
                                        ((e) =>
                                          setPlanForm((f) => {
                                            const r = [...f.reEvalDates]
                                            r[i] = e.target.value
                                            return {
                                              ...f,
                                              reEvalDates: r,
                                            }
                                          }))({
                                          target: {
                                            value: mdyToIso(v),
                                          },
                                        })
                                      }
                                      className="h-9 slds-text-4"
                                      style={{
                                        borderColor: "#dddbda",
                                      }}
                                      placeholder={`Date ${i + 1}`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Review Dates — shown only for Academic Service Plan */}
                          {planForm.planType === "Academic Service Plan" && (
                            <div className="space-y-1.5">
                              <Label
                                className="slds-form-label"
                                style={{ color: "#706e6b" }}
                              >
                                REVIEW DATES (MAX 3)
                              </Label>
                              <div className="grid grid-cols-3 gap-3">
                                {planForm.reviewDates.map((d, i) => (
                                  <DateInput
                                    key={i}
                                    value={isoToMdy(d)}
                                    onChange={(v) =>
                                      ((e) =>
                                        setPlanForm((f) => {
                                          const r = [...f.reviewDates]
                                          r[i] = e.target.value
                                          return {
                                            ...f,
                                            reviewDates: r,
                                          }
                                        }))({
                                        target: {
                                          value: mdyToIso(v),
                                        },
                                      })
                                    }
                                    className="h-9 slds-text-4"
                                    style={{
                                      borderColor: "#dddbda",
                                    }}
                                    placeholder={`Date ${i + 1}`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Description — hidden for Community Launch Plan (grid-only layout) */}
                          {planForm.planType !== "Community Launch Plan" && (
                            <div className="space-y-1.5">
                              <Label
                                className="slds-form-label"
                                style={{ color: "#706e6b" }}
                              >
                                {isStudyTimePlan
                                  ? "PLAN DESCRIPTION"
                                  : "DESCRIPTION"}
                              </Label>
                              <Textarea
                                value={planForm.description}
                                onChange={(e) =>
                                  setPlanForm((f) => ({
                                    ...f,
                                    description: e.target.value,
                                  }))
                                }
                                placeholder="Enter plan description…"
                                className="slds-text-4 min-h-[80px] resize-y"
                                style={{
                                  borderColor: "#dddbda",
                                  backgroundColor:
                                    "var(--slds-g-color-background-base)",
                                }}
                              />
                            </div>
                          )}
                        </>
                      )}

                      {/* Required Signatures — Study Time Plan uses the add/edit signature modal */}
                      {isStudyTimePlan && (
                        <StudyTimePlanSignaturesSection
                          planForm={planForm}
                          setPlanForm={setPlanForm}
                        />
                      )}

                      {/* Required Signatures — shown for plans with signatures AND Strengths Assessment */}
                      {(PLANS_WITH_SIGNATURES.has(planForm.planType) ||
                        planForm.planType === "Strengths Assessment") &&
                        (plainPlansLabel ? (
                          <div className="space-y-2">
                            <FieldLabel>Required Signatures</FieldLabel>
                            <DSTable>
                              <TableHeader>
                                <TableRow>
                                  <TableHead variant="slds" size="md">
                                    Role Name
                                  </TableHead>
                                  <TableHead variant="slds" size="md">
                                    Number of Signatures
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {planForm.signatures.map((sig, i) => (
                                  <TableRow key={sig.role}>
                                    <TableCell>{sig.role}</TableCell>
                                    <TableCell>
                                      <Select
                                        value={
                                          sig.numSignatures
                                            ? String(sig.numSignatures)
                                            : undefined
                                        }
                                        onValueChange={(v) =>
                                          setPlanForm((f) => {
                                            const s = [...f.signatures]
                                            s[i] = { ...s[i], numSignatures: v }
                                            return { ...f, signatures: s }
                                          })
                                        }
                                      >
                                        <SelectTrigger
                                          surface="base"
                                          className="w-24"
                                          aria-label={`Number of signatures for ${sig.role}`}
                                        >
                                          <SelectValue placeholder="—" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Array.from(
                                            { length: 10 },
                                            (_, n) => n + 1,
                                          ).map((n) => (
                                            <SelectItem
                                              key={n}
                                              value={String(n)}
                                            >
                                              {n}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </DSTable>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label
                              className="slds-form-label"
                              style={{ color: "#706e6b" }}
                            >
                              REQUIRED SIGNATURES
                            </Label>
                            <div
                              className="rounded-lg overflow-hidden"
                              style={{
                                border: "1px solid #dddbda",
                              }}
                            >
                              <div
                                className="grid grid-cols-2 px-4 py-2 slds-text-3 font-semibold"
                                style={{
                                  backgroundColor:
                                    "var(--slds-g-color-background-alt)",
                                  borderBottom: "1px solid #dddbda",
                                  color: "#706e6b",
                                }}
                              >
                                <span>ROLE NAME</span>
                                <span>NUMBER OF SIGNATURES</span>
                              </div>
                              {planForm.signatures.map((sig, i) => (
                                <div
                                  key={sig.role}
                                  className="grid grid-cols-2 items-center px-4 py-2 gap-4"
                                  style={{
                                    borderBottom:
                                      i < planForm.signatures.length - 1
                                        ? "1px solid #dddbda"
                                        : "none",
                                  }}
                                >
                                  <span
                                    className="slds-text-4"
                                    style={{
                                      color: "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    {sig.role}
                                  </span>
                                  <select
                                    value={sig.numSignatures}
                                    onChange={(e) =>
                                      setPlanForm((f) => {
                                        const s = [...f.signatures]
                                        s[i] = {
                                          ...s[i],
                                          numSignatures: e.target.value,
                                        }
                                        return {
                                          ...f,
                                          signatures: s,
                                        }
                                      })
                                    }
                                    className="h-8 px-2 rounded slds-text-4"
                                    style={{
                                      border: "1px solid #dddbda",
                                      backgroundColor:
                                        "var(--slds-g-color-background-base)",
                                      color: "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    <option value="">—</option>
                                    {Array.from(
                                      { length: 10 },
                                      (_, n) => n + 1,
                                    ).map((n) => (
                                      <option key={n} value={n}>
                                        {n}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* ── PLAN DETAILS TAB ── */}
                  {addPlanTab === "plan-details" &&
                    (isStudyTimePlan ? (
                      <StudyTimePlanDetails
                        planForm={planForm}
                        setPlanForm={setPlanForm}
                        testingAssessments={testingAssessments}
                      />
                    ) : planForm.planType === "Harm Risk Assessment" ? (
                      <HRAPlanDetails
                        planForm={planForm}
                        setPlanForm={setPlanForm}
                      />
                    ) : planForm.planType === "Strengths Assessment" ? (
                      <StrengthsAssessmentPlanDetails
                        planForm={planForm}
                        setPlanForm={setPlanForm}
                        SA_CATEGORIES={SA_CATEGORIES}
                      />
                    ) : planForm.planType === "Community Launch Plan" ? (
                      /* ═══ COMMUNITY LAUNCH PLAN DETAILS ═══ */
                      (() => {
                        const fieldStyle = {
                          borderColor: "#dddbda",
                        }
                        const selectStyle = {
                          border: "1px solid #dddbda",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          color: "var(--slds-g-color-text-default)",
                        }

                        const openAddEntry = () =>
                          setPlanForm((f) => ({
                            ...f,
                            clp_entryModalOpen: true,
                            clp_editingEntryId: null,
                            clp_entryDomain: "",
                            clp_entryContent: "",
                            clp_entryTimeframe: "",
                          }))
                        const openModifyEntry = (e: {
                          id: number
                          domain: string
                          content: string
                          timeframe: string
                        }) =>
                          setPlanForm((f) => ({
                            ...f,
                            clp_entryModalOpen: true,
                            clp_editingEntryId: e.id,
                            clp_entryDomain: e.domain,
                            clp_entryContent: e.content,
                            clp_entryTimeframe: e.timeframe,
                          }))
                        const saveEntry = () => {
                          if (!planForm.clp_entryDomain) return
                          if (planForm.clp_editingEntryId !== null) {
                            setPlanForm((f) => ({
                              ...f,
                              clp_entries: f.clp_entries.map((x) =>
                                x.id === f.clp_editingEntryId
                                  ? {
                                      ...x,
                                      domain: f.clp_entryDomain,
                                      content: f.clp_entryContent,
                                      timeframe: f.clp_entryTimeframe,
                                    }
                                  : x,
                              ),
                              clp_entryModalOpen: false,
                            }))
                          } else {
                            setPlanForm((f) => ({
                              ...f,
                              clp_entries: [
                                ...f.clp_entries,
                                {
                                  id: Date.now(),
                                  domain: f.clp_entryDomain,
                                  content: f.clp_entryContent,
                                  timeframe: f.clp_entryTimeframe,
                                },
                              ],
                              clp_entryModalOpen: false,
                            }))
                          }
                        }
                        const removeEntry = (id: number) =>
                          setPlanForm((f) => ({
                            ...f,
                            clp_entries: f.clp_entries.filter(
                              (x) => x.id !== id,
                            ),
                          }))

                        if (plainPlansLabel) {
                          return (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <p className="slds-text-4 font-semibold text-[var(--slds-g-color-text-default)]">
                                  Community Launch Plan
                                </p>
                                <Button size="sm" onClick={openAddEntry}>
                                  <Plus />
                                  Add
                                </Button>
                              </div>

                              {planForm.clp_entryModalOpen && (
                                <Card variant="section">
                                  <CardHeader size="sm" separated>
                                    <CardTitle size="sm">
                                      {planForm.clp_editingEntryId !== null
                                        ? "Modify Entry"
                                        : "Add Entry"}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent size="sm" className="space-y-4">
                                    <div className="space-y-1.5">
                                      <FieldLabel
                                        required
                                        htmlFor="clp-entry-domain"
                                      >
                                        Domain
                                      </FieldLabel>
                                      <Select
                                        value={
                                          planForm.clp_entryDomain || undefined
                                        }
                                        onValueChange={(v) =>
                                          setPlanForm((f) => ({
                                            ...f,
                                            clp_entryDomain: v,
                                          }))
                                        }
                                      >
                                        <SelectTrigger
                                          id="clp-entry-domain"
                                          surface="base"
                                          className="w-full"
                                        >
                                          <SelectValue placeholder="Select domain…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {CLP_DOMAINS.map((d) => (
                                            <SelectItem key={d} value={d}>
                                              {d}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                      <FieldLabel htmlFor="clp-entry-content">
                                        Content
                                      </FieldLabel>
                                      <Textarea
                                        id="clp-entry-content"
                                        value={planForm.clp_entryContent}
                                        onChange={(e) =>
                                          setPlanForm((f) => ({
                                            ...f,
                                            clp_entryContent: e.target.value,
                                          }))
                                        }
                                        placeholder="Describe the content for this domain…"
                                        className="min-h-[72px] resize-y"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <FieldLabel htmlFor="clp-entry-timeframe">
                                        Timeframe
                                      </FieldLabel>
                                      <Input
                                        id="clp-entry-timeframe"
                                        surface="base"
                                        value={planForm.clp_entryTimeframe}
                                        onChange={(e) =>
                                          setPlanForm((f) => ({
                                            ...f,
                                            clp_entryTimeframe: e.target.value,
                                          }))
                                        }
                                        placeholder="e.g., 3 months, 6 weeks, etc."
                                      />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          setPlanForm((f) => ({
                                            ...f,
                                            clp_entryModalOpen: false,
                                          }))
                                        }
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={saveEntry}
                                        disabled={!planForm.clp_entryDomain}
                                      >
                                        Apply
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {planForm.clp_entries.length > 0 ? (
                                <DSTable>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead variant="slds" size="md">
                                        Domain
                                      </TableHead>
                                      <TableHead variant="slds" size="md">
                                        Content
                                      </TableHead>
                                      <TableHead variant="slds" size="md">
                                        Timeframe
                                      </TableHead>
                                      <TableHead variant="slds" size="md">
                                        <span className="sr-only">Actions</span>
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {planForm.clp_entries.map((e) => (
                                      <TableRow key={e.id}>
                                        <TableCell className="font-medium min-w-[160px]">
                                          {e.domain}
                                        </TableCell>
                                        <TableCell className="whitespace-pre-wrap">
                                          {e.content || "—"}
                                        </TableCell>
                                        <TableCell className="min-w-[120px]">
                                          {e.timeframe || "—"}
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-1">
                                            <Button
                                              variant="ghost"
                                              size="icon-xs"
                                              aria-label={`Modify ${e.domain}`}
                                              onClick={() => openModifyEntry(e)}
                                            >
                                              <Pencil />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon-xs"
                                              aria-label={`Remove ${e.domain}`}
                                              onClick={() => removeEntry(e.id)}
                                            >
                                              <Trash2 />
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </DSTable>
                              ) : (
                                <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
                                  No plan entries yet. Click "Add" to record a
                                  domain entry.
                                </p>
                              )}
                            </div>
                          )
                        }

                        return (
                          <div className="space-y-6">
                            {/* ── Domain/Content/Timeframe Grid ── */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p
                                  className="slds-text-4 font-semibold"
                                  style={{
                                    color: "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  Community Launch Plan
                                </p>
                                <Button
                                  onClick={openAddEntry}
                                  className="h-8 px-3 rounded-full slds-text-4 text-white"
                                  style={{
                                    backgroundColor: "#145F33",
                                  }}
                                >
                                  <Plus className="h-3.5 w-3.5 mr-1" />
                                  Add
                                </Button>
                              </div>

                              {/* Entry Modal */}
                              {planForm.clp_entryModalOpen && (
                                <div
                                  className="rounded-lg p-4 space-y-4"
                                  style={{
                                    backgroundColor:
                                      "var(--slds-g-color-background-alt)",
                                    border: "1px solid #dddbda",
                                  }}
                                >
                                  <p
                                    className="slds-text-4 font-semibold"
                                    style={{
                                      color: "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    {planForm.clp_editingEntryId !== null
                                      ? "Modify Entry"
                                      : "Add Entry"}
                                  </p>
                                  <div className="space-y-1.5">
                                    <Label
                                      className="slds-form-label"
                                      style={{
                                        color: "#706e6b",
                                      }}
                                    >
                                      DOMAIN{" "}
                                      <span className="text-red-600">*</span>
                                    </Label>
                                    <select
                                      value={planForm.clp_entryDomain}
                                      onChange={(e) =>
                                        setPlanForm((f) => ({
                                          ...f,
                                          clp_entryDomain: e.target.value,
                                        }))
                                      }
                                      className="h-9 w-full px-3 rounded slds-text-4"
                                      style={{
                                        ...selectStyle,
                                        color: planForm.clp_entryDomain
                                          ? "var(--slds-g-color-text-default)"
                                          : "#706e6b",
                                      }}
                                    >
                                      <option value="">Select domain…</option>
                                      {CLP_DOMAINS.map((d) => (
                                        <option key={d} value={d}>
                                          {d}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label
                                      className="slds-form-label"
                                      style={{
                                        color: "#706e6b",
                                      }}
                                    >
                                      CONTENT
                                    </Label>
                                    <Textarea
                                      value={planForm.clp_entryContent}
                                      onChange={(e) =>
                                        setPlanForm((f) => ({
                                          ...f,
                                          clp_entryContent: e.target.value,
                                        }))
                                      }
                                      placeholder="Describe the content for this domain…"
                                      className="slds-text-4 min-h-[72px] resize-y bg-white"
                                      style={fieldStyle}
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label
                                      className="slds-form-label"
                                      style={{
                                        color: "#706e6b",
                                      }}
                                    >
                                      TIMEFRAME
                                    </Label>
                                    <Input
                                      value={planForm.clp_entryTimeframe}
                                      onChange={(e) =>
                                        setPlanForm((f) => ({
                                          ...f,
                                          clp_entryTimeframe: e.target.value,
                                        }))
                                      }
                                      placeholder="e.g., 3 months, 6 weeks, etc."
                                      className="h-9 slds-text-4"
                                      style={fieldStyle}
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        setPlanForm((f) => ({
                                          ...f,
                                          clp_entryModalOpen: false,
                                        }))
                                      }
                                      className="h-8 px-4 rounded-full slds-text-4"
                                      style={{
                                        borderColor: "#dddbda",
                                        color: "#706e6b",
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={saveEntry}
                                      disabled={!planForm.clp_entryDomain}
                                      className="h-8 px-4 rounded-full slds-text-4 text-white"
                                      style={{
                                        backgroundColor:
                                          planForm.clp_entryDomain
                                            ? "#145F33"
                                            : "var(--slds-g-color-neutral-95)",
                                        color: planForm.clp_entryDomain
                                          ? "white"
                                          : "#706e6b",
                                      }}
                                    >
                                      Apply
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Grid */}
                              {planForm.clp_entries.length > 0 ? (
                                <div
                                  className="rounded-lg overflow-hidden"
                                  style={{
                                    border: "1px solid #dddbda",
                                  }}
                                >
                                  <table className="w-full">
                                    <thead>
                                      <tr
                                        style={{
                                          backgroundColor:
                                            "var(--slds-g-color-background-alt)",
                                          borderBottom: "1px solid #dddbda",
                                        }}
                                      >
                                        {[
                                          "DOMAIN",
                                          "CONTENT",
                                          "TIMEFRAME",
                                          "",
                                        ].map((h) => (
                                          <th
                                            key={h}
                                            className="px-3 py-2.5 text-left slds-text-3 font-semibold"
                                            style={{
                                              color: "#706e6b",
                                            }}
                                          >
                                            {h}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {planForm.clp_entries.map((e, idx) => (
                                        <tr
                                          key={e.id}
                                          style={{
                                            borderBottom:
                                              idx <
                                              planForm.clp_entries.length - 1
                                                ? "1px solid #dddbda"
                                                : "none",
                                          }}
                                        >
                                          <td
                                            className="px-3 py-2.5 slds-text-4 font-medium"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                              minWidth: "160px",
                                            }}
                                          >
                                            {e.domain}
                                          </td>
                                          <td
                                            className="px-3 py-2.5 slds-text-4"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                              whiteSpace: "pre-wrap",
                                            }}
                                          >
                                            {e.content || "—"}
                                          </td>
                                          <td
                                            className="px-3 py-2.5 slds-text-4"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                              minWidth: "120px",
                                            }}
                                          >
                                            {e.timeframe || "—"}
                                          </td>
                                          <td className="px-3 py-2.5">
                                            <div className="flex items-center gap-1">
                                              <button
                                                onClick={() =>
                                                  openModifyEntry(e)
                                                }
                                                className="p-1 rounded hover:bg-gray-100"
                                                title="Modify"
                                              >
                                                <Pencil
                                                  className="h-3.5 w-3.5"
                                                  style={{
                                                    color: "#0176d3",
                                                  }}
                                                />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  removeEntry(e.id)
                                                }
                                                className="p-1 rounded hover:bg-red-50"
                                                title="Remove"
                                              >
                                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div
                                  className="flex flex-col items-center justify-center py-6 rounded-lg"
                                  style={{
                                    border: "2px dashed #dddbda",
                                  }}
                                >
                                  <p
                                    className="slds-text-4"
                                    style={{ color: "#706e6b" }}
                                  >
                                    No plan entries yet.
                                  </p>
                                  <p
                                    className="slds-text-3 mt-0.5"
                                    style={{ color: "#706e6b" }}
                                  >
                                    Click "Add" to record a domain entry.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })()
                    ) : planForm.planType === "Academic Service Plan" ? (
                      /* ═══ ACADEMIC SERVICE PLAN DETAILS ═══ */
                      <AcademicServicePlanDetails
                        planForm={planForm}
                        setPlanForm={setPlanForm}
                      />
                    ) : planForm.planType === "IEP" ||
                      planForm.planType === "504" ? (
                      /* ═══ IEP / 504 PLAN DETAILS ═══ */
                      (() => {
                        const iep_reasons: {
                          id: number
                          reason: string
                        }[] = planForm.iep_reasons ?? []
                        const iep_documents: {
                          id: number
                          name: string
                          uploadDate: string
                          uploadedBy: string
                          size: string
                        }[] = planForm.iep_documents ?? []
                        const MOCK_SCHOOLS = [
                          {
                            name: "Lincoln High School",
                            type: "Public High School",
                            grades: ["9", "10", "11", "12"],
                          },
                          {
                            name: "Roosevelt Middle School",
                            type: "Public Middle School",
                            grades: ["6", "7", "8"],
                          },
                          {
                            name: "Jefferson Elementary",
                            type: "Public Elementary School",
                            grades: ["K", "1", "2", "3", "4", "5"],
                          },
                          {
                            name: "St. Mary Catholic School",
                            type: "Private School",
                            grades: [
                              "K",
                              "1",
                              "2",
                              "3",
                              "4",
                              "5",
                              "6",
                              "7",
                              "8",
                            ],
                          },
                          {
                            name: "Chicago Academy Charter",
                            type: "Charter School",
                            grades: [
                              "K",
                              "1",
                              "2",
                              "3",
                              "4",
                              "5",
                              "6",
                              "7",
                              "8",
                              "9",
                              "10",
                              "11",
                              "12",
                            ],
                          },
                        ]

                        const IEP_REASONS = [
                          "Cognitive Impairment",
                          "Emotional Disturbance",
                          "Hearing Impairment",
                          "Physical Impairment",
                          "Multiple Disabilities",
                          "Specific Learning Disability",
                          "Speech or Language Impairment",
                          "Other Health Impairment",
                          "Autism Spectrum Disorder",
                        ]

                        const selectedSchool = MOCK_SCHOOLS.find(
                          (s) => s.name === planForm.iep_school,
                        )
                        const availableGrades = selectedSchool
                          ? selectedSchool.grades
                          : [
                              "PreK",
                              "K",
                              "1",
                              "2",
                              "3",
                              "4",
                              "5",
                              "6",
                              "7",
                              "8",
                              "9",
                              "10",
                              "11",
                              "12",
                            ]

                        const sectionCard = (
                          title: string,
                          children: React.ReactNode,
                        ) => (
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
                            <div
                              className="px-4 py-3"
                              style={{
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                                backgroundColor:
                                  "var(--slds-g-color-background-alt)",
                              }}
                            >
                              <h3
                                className="text-[13px] font-semibold"
                                style={{
                                  color: "var(--slds-g-color-text-default)",
                                }}
                              >
                                {title}
                              </h3>
                            </div>
                            <div className="p-4 sm:p-5 space-y-4">
                              {children}
                            </div>
                          </div>
                        )

                        const fieldLabel = (
                          label: string,
                          required?: boolean,
                        ) => (
                          <label
                            className="block text-[11px] font-semibold uppercase mb-1.5"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {label}
                            {required && (
                              <span style={{ color: "#c23934" }}> *</span>
                            )}
                          </label>
                        )

                        const inputStyle = {
                          border: "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          color: "var(--slds-g-color-text-default)",
                        }

                        const readOnlyStyle = {
                          border: "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor: "var(--slds-g-color-neutral-95)",
                          color: "var(--slds-g-color-text-default)",
                        }

                        return (
                          <div className="space-y-4">
                            {/* ── School Information ── */}
                            {sectionCard(
                              "School Information",
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* School */}
                                <div className="space-y-1.5">
                                  {fieldLabel("School", true)}
                                  <select
                                    value={planForm.iep_school}
                                    onChange={(e) => {
                                      const school = MOCK_SCHOOLS.find(
                                        (s) => s.name === e.target.value,
                                      )
                                      setPlanForm((f) => ({
                                        ...f,
                                        iep_school: e.target.value,
                                        iep_schoolType: school
                                          ? school.type
                                          : "",
                                        iep_gradeAtStart: "",
                                      }))
                                    }}
                                    className="h-9 w-full px-3 rounded slds-text-4"
                                    style={inputStyle}
                                  >
                                    <option value="">Select School</option>
                                    {MOCK_SCHOOLS.map((s) => (
                                      <option key={s.name} value={s.name}>
                                        {s.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* School Type (read-only) */}
                                <div className="space-y-1.5">
                                  {fieldLabel("School Type")}
                                  <input
                                    type="text"
                                    value={planForm.iep_schoolType}
                                    readOnly
                                    placeholder="Auto-populated from School"
                                    className="h-9 w-full px-3 rounded slds-text-4"
                                    style={readOnlyStyle}
                                  />
                                </div>

                                {/* District */}
                                <div className="space-y-1.5">
                                  {fieldLabel("District")}
                                  <input
                                    type="text"
                                    value={planForm.iep_district}
                                    onChange={(e) =>
                                      setPlanForm((f) => ({
                                        ...f,
                                        iep_district: e.target.value,
                                      }))
                                    }
                                    placeholder="Enter district..."
                                    className="h-9 w-full px-3 rounded slds-text-4"
                                    style={inputStyle}
                                  />
                                </div>

                                {/* Grade at Start */}
                                <div className="space-y-1.5">
                                  {fieldLabel("Grade at Start")}
                                  <select
                                    value={planForm.iep_gradeAtStart}
                                    onChange={(e) =>
                                      setPlanForm((f) => ({
                                        ...f,
                                        iep_gradeAtStart: e.target.value,
                                      }))
                                    }
                                    className="h-9 w-full px-3 rounded slds-text-4"
                                    style={inputStyle}
                                  >
                                    <option value="">Select Grade</option>
                                    {availableGrades.map((g) => (
                                      <option key={g} value={g}>
                                        {g === "K"
                                          ? "Kindergarten"
                                          : g === "PreK"
                                            ? "Pre-K"
                                            : `Grade ${g}`}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>,
                            )}

                            {/* ── Reason(s) for Plan ── */}
                            {sectionCard(
                              "Reason(s) for Plan",
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <span
                                    className="text-[12px] font-semibold uppercase tracking-wide"
                                    style={{
                                      color: "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    {iep_reasons.length}{" "}
                                    {iep_reasons.length === 1
                                      ? "Reason"
                                      : "Reasons"}{" "}
                                    Added
                                  </span>
                                  <button
                                    onClick={() =>
                                      setPlanForm((f) => ({
                                        ...f,
                                        iep_reasonModalOpen: true,
                                        iep_editingReasonId: null,
                                        iep_selectedReason: "",
                                      }))
                                    }
                                    className="h-7 px-3 rounded-full text-[11px] font-medium flex items-center gap-1"
                                    style={{
                                      backgroundColor: "#145F33",
                                      color: "white",
                                    }}
                                  >
                                    <Plus className="h-3 w-3" /> Add
                                  </button>
                                </div>
                                {iep_reasons.length === 0 ? (
                                  <div
                                    className="py-6 text-center text-[13px] border-2 border-dashed rounded"
                                    style={{
                                      color: "var(--slds-g-color-text-weak)",
                                      borderColor:
                                        "var(--slds-g-color-border-base-1)",
                                    }}
                                  >
                                    No reasons for plan added.
                                  </div>
                                ) : (
                                  <table
                                    className="w-full text-[13px]"
                                    style={{
                                      borderCollapse: "collapse",
                                    }}
                                  >
                                    <thead>
                                      <tr
                                        style={{
                                          backgroundColor:
                                            "var(--slds-g-color-background-alt)",
                                        }}
                                      >
                                        <th
                                          className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-weak)",
                                            borderBottom:
                                              "1px solid var(--slds-g-color-border-base-1)",
                                          }}
                                        >
                                          Reason(s)
                                        </th>
                                        <th
                                          className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase w-16"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-weak)",
                                            borderBottom:
                                              "1px solid var(--slds-g-color-border-base-1)",
                                          }}
                                        >
                                          Actions
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {iep_reasons.map((r) => (
                                        <tr
                                          key={r.id}
                                          style={{
                                            borderBottom:
                                              "1px solid var(--slds-g-color-border-base-1)",
                                          }}
                                        >
                                          <td
                                            className="px-3 py-2.5"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                            }}
                                          >
                                            {r.reason}
                                          </td>
                                          <td className="px-3 py-2.5 text-right">
                                            <button
                                              onClick={() =>
                                                setPlanForm((f) => ({
                                                  ...f,
                                                  iep_reasons: (
                                                    f.iep_reasons ?? []
                                                  ).filter(
                                                    (x) => x.id !== r.id,
                                                  ),
                                                }))
                                              }
                                              className="p-1 rounded hover:bg-red-50 transition-colors"
                                              title="Remove"
                                            >
                                              <Trash2
                                                className="h-3.5 w-3.5"
                                                style={{
                                                  color: "#c23934",
                                                }}
                                              />
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}

                                {/* Add/Modify Reason Modal */}
                                {planForm.iep_reasonModalOpen && (
                                  <div
                                    className="fixed inset-0 z-50 flex items-center justify-center"
                                    style={{
                                      backgroundColor: "rgba(0,0,0,0.4)",
                                    }}
                                  >
                                    <div
                                      className="w-full max-w-sm rounded-lg shadow-xl p-6 space-y-4"
                                      style={{
                                        backgroundColor:
                                          "var(--slds-g-color-background-base)",
                                        border:
                                          "1px solid var(--slds-g-color-border-base-1)",
                                      }}
                                    >
                                      <h3
                                        className="text-[15px] font-semibold"
                                        style={{
                                          color:
                                            "var(--slds-g-color-text-default)",
                                        }}
                                      >
                                        {planForm.iep_editingReasonId !== null
                                          ? "Modify Reason"
                                          : "Add Reason(s) for Plan"}
                                      </h3>
                                      <div className="space-y-1.5">
                                        {fieldLabel("SELECT REASONS", true)}
                                        <div className="space-y-0.5">
                                          {IEP_REASONS.map((r) => {
                                            const selected = (
                                              planForm.iep_selectedReason || ""
                                            )
                                              .split(",")
                                              .map((s: string) => s.trim())
                                              .filter(Boolean)
                                            const isChecked =
                                              selected.includes(r)
                                            return (
                                              <label
                                                key={r}
                                                className="flex items-center gap-2.5 py-1.5 cursor-pointer"
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={isChecked}
                                                  onChange={() => {
                                                    const current = (
                                                      planForm.iep_selectedReason ||
                                                      ""
                                                    )
                                                      .split(",")
                                                      .map((s: string) =>
                                                        s.trim(),
                                                      )
                                                      .filter(Boolean)
                                                    const next = isChecked
                                                      ? current.filter(
                                                          (v: string) =>
                                                            v !== r,
                                                        )
                                                      : [...current, r]
                                                    setPlanForm((f) => ({
                                                      ...f,
                                                      iep_selectedReason:
                                                        next.join(", "),
                                                    }))
                                                  }}
                                                  className="h-4 w-4 flex-shrink-0 cursor-pointer rounded-sm"
                                                  style={{
                                                    accentColor: "#145F33",
                                                  }}
                                                />
                                                <span
                                                  className="slds-text-4"
                                                  style={{
                                                    color:
                                                      "var(--slds-g-color-text-default)",
                                                  }}
                                                >
                                                  {r}
                                                </span>
                                              </label>
                                            )
                                          })}
                                        </div>
                                      </div>
                                      <div className="flex justify-end gap-3 pt-2">
                                        <button
                                          onClick={() =>
                                            setPlanForm((f) => ({
                                              ...f,
                                              iep_reasonModalOpen: false,
                                              iep_editingReasonId: null,
                                              iep_selectedReason: "",
                                            }))
                                          }
                                          className="h-9 px-5 rounded-full text-[13px] font-medium"
                                          style={{
                                            backgroundColor:
                                              "var(--slds-g-color-neutral-95)",
                                            color:
                                              "var(--slds-g-color-text-default)",
                                            border:
                                              "1px solid var(--slds-g-color-border-base-1)",
                                          }}
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (!planForm.iep_selectedReason)
                                              return
                                            if (
                                              planForm.iep_editingReasonId !==
                                              null
                                            ) {
                                              setPlanForm((f) => ({
                                                ...f,
                                                iep_reasons: (
                                                  f.iep_reasons ?? []
                                                ).map((r) =>
                                                  r.id === f.iep_editingReasonId
                                                    ? {
                                                        ...r,
                                                        reason:
                                                          f.iep_selectedReason,
                                                      }
                                                    : r,
                                                ),
                                                iep_reasonModalOpen: false,
                                                iep_editingReasonId: null,
                                                iep_selectedReason: "",
                                              }))
                                            } else {
                                              setPlanForm((f) => {
                                                const newReasons = (
                                                  f.iep_selectedReason || ""
                                                )
                                                  .split(",")
                                                  .map((s: string) => s.trim())
                                                  .filter(Boolean)
                                                  .map(
                                                    (
                                                      reason: string,
                                                      i: number,
                                                    ) => ({
                                                      id: Date.now() + i,
                                                      reason,
                                                    }),
                                                  )
                                                return {
                                                  ...f,
                                                  iep_reasons: [
                                                    ...(f.iep_reasons ?? []),
                                                    ...newReasons,
                                                  ],
                                                  iep_reasonModalOpen: false,
                                                  iep_selectedReason: "",
                                                }
                                              })
                                            }
                                          }}
                                          className="h-9 px-5 rounded-full text-[13px] font-medium"
                                          style={{
                                            backgroundColor: "#145F33",
                                            color: "white",
                                          }}
                                        >
                                          Save
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>,
                            )}

                            {/* ── Educational and Support Needs ── */}
                            {sectionCard(
                              "Educational and Support Needs",
                              <div className="space-y-4">
                                {([
                                  {
                                    key: "iep_academicNeeds",
                                    label: "Academic Needs",
                                  },
                                  {
                                    key: "iep_behaviorNeeds",
                                    label: "Behavior Needs",
                                  },
                                  {
                                    key: "iep_accommodations",
                                    label: "Accommodations/Modifications",
                                  },
                                  {
                                    key: "iep_testing",
                                    label: "Testing",
                                  },
                                ] as {
                                  key: keyof typeof planForm
                                  label: string
                                }[]).map(({ key, label }) => (
                                  <div key={key} className="space-y-1.5">
                                    {fieldLabel(label)}
                                    <textarea
                                      value={planForm[key] as string}
                                      onChange={(e) =>
                                        setPlanForm((f) => ({
                                          ...f,
                                          [key]: e.target.value,
                                        }))
                                      }
                                      rows={4}
                                      placeholder={`Enter ${label.toLowerCase()}...`}
                                      className="w-full px-3 py-2 rounded slds-text-4 resize-y"
                                      style={{
                                        ...inputStyle,
                                        minHeight: "100px",
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>,
                            )}

                            {/* ── Documents ── */}
                            {sectionCard(
                              "Documents",
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <span
                                    className="text-[12px]"
                                    style={{
                                      color: "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    {iep_documents.length} document
                                    {iep_documents.length !== 1 ? "s" : ""}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const mockDoc = {
                                        id: Date.now(),
                                        name: `IEP_Document_${new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }).replace(/\//g, "")}.pdf`,
                                        uploadDate:
                                          new Date().toLocaleDateString(
                                            "en-US",
                                            {
                                              month: "2-digit",
                                              day: "2-digit",
                                              year: "numeric",
                                            },
                                          ),
                                        uploadedBy: "Current User",
                                        size: "1.2 MB",
                                      }
                                      setPlanForm((f) => ({
                                        ...f,
                                        iep_documents: [
                                          ...(f.iep_documents ?? []),
                                          mockDoc,
                                        ],
                                      }))
                                    }}
                                    className="h-7 px-3 rounded-full text-[11px] font-medium flex items-center gap-1"
                                    style={{
                                      backgroundColor: "#145F33",
                                      color: "white",
                                    }}
                                  >
                                    <Plus className="h-3 w-3" /> Upload Document
                                  </button>
                                </div>
                                {iep_documents.length === 0 ? (
                                  <div
                                    className="py-6 text-center text-[13px] border-2 border-dashed rounded"
                                    style={{
                                      color: "var(--slds-g-color-text-weak)",
                                      borderColor:
                                        "var(--slds-g-color-border-base-1)",
                                    }}
                                  >
                                    No documents uploaded.
                                  </div>
                                ) : (
                                  <table
                                    className="w-full text-[13px]"
                                    style={{
                                      borderCollapse: "collapse",
                                    }}
                                  >
                                    <thead>
                                      <tr
                                        style={{
                                          backgroundColor:
                                            "var(--slds-g-color-background-alt)",
                                        }}
                                      >
                                        {[
                                          "Document Name",
                                          "Upload Date",
                                          "Uploaded By",
                                          "Size",
                                          "Actions",
                                        ].map((h) => (
                                          <th
                                            key={h}
                                            className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-weak)",
                                              borderBottom:
                                                "1px solid var(--slds-g-color-border-base-1)",
                                            }}
                                          >
                                            {h}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {iep_documents.map((doc) => (
                                        <tr
                                          key={doc.id}
                                          style={{
                                            borderBottom:
                                              "1px solid var(--slds-g-color-border-base-1)",
                                          }}
                                        >
                                          <td className="px-3 py-2.5">
                                            <div
                                              className="flex items-center gap-2"
                                              style={{
                                                color:
                                                  "var(--slds-g-color-text-default)",
                                              }}
                                            >
                                              <FileText
                                                className="h-4 w-4 flex-shrink-0"
                                                style={{
                                                  color:
                                                    "var(--slds-g-color-text-weak)",
                                                }}
                                              />
                                              {doc.name}
                                            </div>
                                          </td>
                                          <td
                                            className="px-3 py-2.5"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                            }}
                                          >
                                            {doc.uploadDate}
                                          </td>
                                          <td
                                            className="px-3 py-2.5"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                            }}
                                          >
                                            {doc.uploadedBy}
                                          </td>
                                          <td
                                            className="px-3 py-2.5"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                            }}
                                          >
                                            {doc.size}
                                          </td>
                                          <td className="px-3 py-2.5">
                                            <div className="flex items-center gap-1">
                                              <button
                                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                                                title="View"
                                              >
                                                <Eye
                                                  className="h-3.5 w-3.5"
                                                  style={{
                                                    color: "#0176d3",
                                                  }}
                                                />
                                              </button>
                                              <button
                                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                                                title="Download"
                                              >
                                                <Download
                                                  className="h-3.5 w-3.5"
                                                  style={{
                                                    color: "#0176d3",
                                                  }}
                                                />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  setPlanForm((f) => ({
                                                    ...f,
                                                    iep_documents: (
                                                      f.iep_documents ?? []
                                                    ).filter(
                                                      (d) => d.id !== doc.id,
                                                    ),
                                                  }))
                                                }
                                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                                                title="Remove"
                                              >
                                                <Trash2
                                                  className="h-3.5 w-3.5"
                                                  style={{
                                                    color: "#c23934",
                                                  }}
                                                />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>,
                            )}
                          </div>
                        )
                      })()
                    ) : planForm.planType === "Self Harm Safety Plan" ? (
                      /* ═══ SELF HARM SAFETY PLAN DETAILS ═══ */
                      (() => {
                        const shsp_copingSkills: {
                          id: number
                          skill: string
                        }[] = planForm.shsp_copingSkills ?? []
                        const sectionCard = (
                          title: string,
                          children: React.ReactNode,
                        ) => (
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
                            <div
                              className="px-4 py-3"
                              style={{
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                                backgroundColor:
                                  "var(--slds-g-color-background-alt)",
                              }}
                            >
                              <h3
                                className="text-[13px] font-semibold"
                                style={{
                                  color: "var(--slds-g-color-text-default)",
                                }}
                              >
                                {title}
                              </h3>
                            </div>
                            <div className="p-4 sm:p-5">{children}</div>
                          </div>
                        )

                        return (
                          <div className="space-y-4">
                            {sectionCard(
                              "Coping Skills",
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <span
                                    className="text-[12px]"
                                    style={{
                                      color: "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    {shsp_copingSkills.length} coping skill
                                    {shsp_copingSkills.length !== 1 ? "s" : ""}
                                  </span>
                                  <button
                                    onClick={() =>
                                      setPlanForm((f) => ({
                                        ...f,
                                        shsp_copingSkillModalOpen: true,
                                        shsp_editingSkillId: null,
                                        shsp_skillText: "",
                                      }))
                                    }
                                    className="h-7 px-3 rounded-full text-[11px] font-medium flex items-center gap-1"
                                    style={{
                                      backgroundColor: "#145F33",
                                      color: "white",
                                    }}
                                  >
                                    <Plus className="h-3 w-3" /> Add
                                  </button>
                                </div>

                                {shsp_copingSkills.length === 0 ? (
                                  <div
                                    className="py-6 text-center text-[13px] border-2 border-dashed rounded"
                                    style={{
                                      color: "var(--slds-g-color-text-weak)",
                                      borderColor:
                                        "var(--slds-g-color-border-base-1)",
                                    }}
                                  >
                                    No coping skills recorded.
                                  </div>
                                ) : (
                                  <table
                                    className="w-full text-[13px]"
                                    style={{
                                      borderCollapse: "collapse",
                                    }}
                                  >
                                    <thead>
                                      <tr
                                        style={{
                                          backgroundColor:
                                            "var(--slds-g-color-background-alt)",
                                        }}
                                      >
                                        <th
                                          className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-weak)",
                                            borderBottom:
                                              "1px solid var(--slds-g-color-border-base-1)",
                                          }}
                                        >
                                          Coping Skills
                                        </th>
                                        <th
                                          className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase w-24"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-weak)",
                                            borderBottom:
                                              "1px solid var(--slds-g-color-border-base-1)",
                                          }}
                                        >
                                          Actions
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {shsp_copingSkills.map((s) => (
                                        <tr
                                          key={s.id}
                                          style={{
                                            borderBottom:
                                              "1px solid var(--slds-g-color-border-base-1)",
                                          }}
                                        >
                                          <td
                                            className="px-3 py-2.5"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                            }}
                                          >
                                            {s.skill}
                                          </td>
                                          <td className="px-3 py-2.5">
                                            <div className="flex items-center gap-1">
                                              <button
                                                onClick={() =>
                                                  setPlanForm((f) => ({
                                                    ...f,
                                                    shsp_copingSkillModalOpen: true,
                                                    shsp_editingSkillId: s.id,
                                                    shsp_skillText: s.skill,
                                                  }))
                                                }
                                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                                                title="Modify"
                                              >
                                                <Pencil
                                                  className="h-3.5 w-3.5"
                                                  style={{
                                                    color: "#0176d3",
                                                  }}
                                                />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  setPlanForm((f) => ({
                                                    ...f,
                                                    shsp_copingSkills: (
                                                      f.shsp_copingSkills ?? []
                                                    ).filter(
                                                      (x) => x.id !== s.id,
                                                    ),
                                                  }))
                                                }
                                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                                                title="Remove"
                                              >
                                                <Trash2
                                                  className="h-3.5 w-3.5"
                                                  style={{
                                                    color: "#c23934",
                                                  }}
                                                />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}

                                {/* Add/Modify Coping Skill Modal */}
                                {planForm.shsp_copingSkillModalOpen && (
                                  <div
                                    className="fixed inset-0 z-50 flex items-center justify-center"
                                    style={{
                                      backgroundColor: "rgba(0,0,0,0.4)",
                                    }}
                                  >
                                    <div
                                      className="w-full max-w-sm rounded-lg shadow-xl p-6 space-y-4"
                                      style={{
                                        backgroundColor:
                                          "var(--slds-g-color-background-base)",
                                        border:
                                          "1px solid var(--slds-g-color-border-base-1)",
                                      }}
                                    >
                                      <h3
                                        className="text-[15px] font-semibold"
                                        style={{
                                          color:
                                            "var(--slds-g-color-text-default)",
                                        }}
                                      >
                                        {planForm.shsp_editingSkillId !== null
                                          ? "Modify Coping Skill"
                                          : "Add Coping Skill"}
                                      </h3>
                                      <div className="space-y-1.5">
                                        <label
                                          className="block text-[11px] font-semibold uppercase mb-1.5"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-weak)",
                                          }}
                                        >
                                          Coping Skill{" "}
                                          <span
                                            style={{
                                              color: "#c23934",
                                            }}
                                          >
                                            *
                                          </span>
                                        </label>
                                        <Textarea
                                          value={planForm.shsp_skillText}
                                          onChange={(e) =>
                                            setPlanForm((f) => ({
                                              ...f,
                                              shsp_skillText: e.target.value,
                                            }))
                                          }
                                          placeholder="Describe the coping skill..."
                                          className="slds-text-4 min-h-[80px] resize-y"
                                          style={{
                                            border:
                                              "1px solid var(--slds-g-color-border-base-1)",
                                            backgroundColor:
                                              "var(--slds-g-color-background-base)",
                                            color:
                                              "var(--slds-g-color-text-default)",
                                          }}
                                        />
                                      </div>
                                      <div className="flex justify-end gap-3 pt-2">
                                        <button
                                          onClick={() =>
                                            setPlanForm((f) => ({
                                              ...f,
                                              shsp_copingSkillModalOpen: false,
                                              shsp_editingSkillId: null,
                                              shsp_skillText: "",
                                            }))
                                          }
                                          className="h-9 px-5 rounded-full text-[13px] font-medium"
                                          style={{
                                            backgroundColor:
                                              "var(--slds-g-color-neutral-95)",
                                            color:
                                              "var(--slds-g-color-text-default)",
                                            border:
                                              "1px solid var(--slds-g-color-border-base-1)",
                                          }}
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (!planForm.shsp_skillText.trim())
                                              return
                                            if (
                                              planForm.shsp_editingSkillId !==
                                              null
                                            ) {
                                              setPlanForm((f) => ({
                                                ...f,
                                                shsp_copingSkills: (
                                                  f.shsp_copingSkills ?? []
                                                ).map((x) =>
                                                  x.id === f.shsp_editingSkillId
                                                    ? {
                                                        ...x,
                                                        skill:
                                                          f.shsp_skillText.trim(),
                                                      }
                                                    : x,
                                                ),
                                                shsp_copingSkillModalOpen: false,
                                                shsp_editingSkillId: null,
                                                shsp_skillText: "",
                                              }))
                                            } else {
                                              setPlanForm((f) => ({
                                                ...f,
                                                shsp_copingSkills: [
                                                  ...(f.shsp_copingSkills ??
                                                    []),
                                                  {
                                                    id: Date.now(),
                                                    skill:
                                                      f.shsp_skillText.trim(),
                                                  },
                                                ],
                                                shsp_copingSkillModalOpen: false,
                                                shsp_skillText: "",
                                              }))
                                            }
                                          }}
                                          className="h-9 px-5 rounded-full text-[13px] font-medium"
                                          style={{
                                            backgroundColor: "#145F33",
                                            color: "white",
                                          }}
                                        >
                                          Save
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>,
                            )}
                          </div>
                        )
                      })()
                    ) : planForm.planType === "Scholarship Agreement" ? (
                      <ScholarshipAgreementPlanDetails
                        useDesignSystem={plainPlansLabel}
                        planForm={planForm}
                        setPlanForm={setPlanForm}
                      />
                    ) : planForm.planType === "Relapse Prevention Plan" ? (
                      /* ═══ RELAPSE PREVENTION PLAN DETAILS ═══ */
                      (() => {
                        const RPP_SECTIONS: {
                          key: string
                          label: string
                          emptyMsg: string
                        }[] = [
                          {
                            key: "reasons",
                            label: "Reason for Plan",
                            emptyMsg:
                              "No reasons for this plan have been added.",
                          },
                          {
                            key: "physical",
                            label: "Physical Well-Being",
                            emptyMsg:
                              "No physical well-being entries have been added.",
                          },
                          {
                            key: "emotional",
                            label: "Emotional Well-Being",
                            emptyMsg:
                              "No emotional well-being entries have been added.",
                          },
                          {
                            key: "social",
                            label: "Social Well-Being",
                            emptyMsg:
                              "No social well-being entries have been added.",
                          },
                          {
                            key: "spiritual",
                            label: "Spiritual Well-Being",
                            emptyMsg:
                              "No spiritual well-being entries have been added.",
                          },
                          {
                            key: "toxicology",
                            label: "Toxicology Screening",
                            emptyMsg:
                              "No toxicology screening entries have been added.",
                          },
                        ]

                        const rpp_panelSection: string | null =
                          (planForm as any).rpp_panelSection ?? null
                        const rpp_panelEditingId: number | null =
                          (planForm as any).rpp_panelEditingId ?? null
                        const rpp_panelText: string =
                          (planForm as any).rpp_panelText ?? ""
                        const rpp_panelValidationError: boolean =
                          (planForm as any).rpp_panelValidationError ?? false
                        const rpp_confirmDeleteSection: string | null =
                          (planForm as any).rpp_confirmDeleteSection ?? null
                        const rpp_confirmDeleteId: number | null =
                          (planForm as any).rpp_confirmDeleteId ?? null

                        const getList = (key: string): {
                          id: number
                          text: string
                        }[] => (planForm as any)[`rpp_${key}`] ?? []

                        const openAdd = (sectionKey: string) =>
                          setPlanForm((f) => ({
                            ...f,
                            rpp_panelSection: sectionKey,
                            rpp_panelEditingId: null,
                            rpp_panelText: "",
                            rpp_panelValidationError: false,
                          }))

                        const openEdit = (
                          sectionKey: string,
                          item: { id: number; text: string },
                        ) =>
                          setPlanForm((f) => ({
                            ...f,
                            rpp_panelSection: sectionKey,
                            rpp_panelEditingId: item.id,
                            rpp_panelText: item.text,
                            rpp_panelValidationError: false,
                          }))

                        const savePanel = () => {
                          if (!rpp_panelText.trim()) {
                            setPlanForm((f) => ({
                              ...f,
                              rpp_panelValidationError: true,
                            }))
                            return
                          }
                          const listKey = `rpp_${rpp_panelSection}`
                          if (rpp_panelEditingId !== null) {
                            setPlanForm((f) => ({
                              ...f,
                              [listKey]: ((f as any)[listKey] ?? []).map(
                                (x: { id: number; text: string }) =>
                                  x.id === rpp_panelEditingId
                                    ? {
                                        ...x,
                                        text: rpp_panelText.trim(),
                                      }
                                    : x,
                              ),
                              rpp_panelSection: null,
                              rpp_panelEditingId: null,
                              rpp_panelText: "",
                              rpp_panelValidationError: false,
                            }))
                          } else {
                            setPlanForm((f) => ({
                              ...f,
                              [listKey]: [
                                ...((f as any)[listKey] ?? []),
                                {
                                  id: Date.now(),
                                  text: rpp_panelText.trim(),
                                },
                              ],
                              rpp_panelSection: null,
                              rpp_panelEditingId: null,
                              rpp_panelText: "",
                              rpp_panelValidationError: false,
                            }))
                          }
                        }

                        const cancelPanel = () =>
                          setPlanForm((f) => ({
                            ...f,
                            rpp_panelSection: null,
                            rpp_panelEditingId: null,
                            rpp_panelText: "",
                            rpp_panelValidationError: false,
                          }))

                        const requestDelete = (
                          sectionKey: string,
                          itemId: number,
                        ) =>
                          setPlanForm((f) => ({
                            ...f,
                            rpp_confirmDeleteSection: sectionKey,
                            rpp_confirmDeleteId: itemId,
                          }))

                        const executeDelete = () => {
                          if (
                            !rpp_confirmDeleteSection ||
                            rpp_confirmDeleteId === null
                          )
                            return
                          const listKey = `rpp_${rpp_confirmDeleteSection}`
                          setPlanForm((f) => ({
                            ...f,
                            [listKey]: ((f as any)[listKey] ?? []).filter(
                              (x: { id: number }) =>
                                x.id !== rpp_confirmDeleteId,
                            ),
                            rpp_confirmDeleteSection: null,
                            rpp_confirmDeleteId: null,
                          }))
                        }

                        const renderRPPSection = (sec: {
                          key: string
                          label: string
                          emptyMsg: string
                        }) => {
                          const list = getList(sec.key)
                          const isPanelOpen = rpp_panelSection === sec.key
                          const isEditing =
                            isPanelOpen && rpp_panelEditingId !== null

                          return (
                            <div key={sec.key} className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p
                                  className="slds-text-4 font-semibold"
                                  style={{
                                    color: "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {sec.label}
                                </p>
                                <button
                                  onClick={() => openAdd(sec.key)}
                                  className="h-7 px-3 rounded-full text-[11px] font-medium flex items-center gap-1"
                                  style={{
                                    backgroundColor: "#145F33",
                                    color: "white",
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                  Add
                                </button>
                              </div>

                              {isPanelOpen && (
                                <div
                                  className="rounded-lg p-4 space-y-3"
                                  style={{
                                    backgroundColor:
                                      "var(--slds-g-color-background-alt)",
                                    border: "1px solid #dddbda",
                                  }}
                                >
                                  <p
                                    className="slds-text-4 font-semibold"
                                    style={{
                                      color: "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    {isEditing
                                      ? `Edit ${sec.label}`
                                      : `Add ${sec.label}`}
                                  </p>
                                  <div className="space-y-1.5">
                                    <Label
                                      className="slds-form-label"
                                      style={{
                                        color: "#706e6b",
                                      }}
                                    >
                                      {sec.label.toUpperCase()}{" "}
                                      <span
                                        style={{
                                          color: "#c23934",
                                        }}
                                      >
                                        *
                                      </span>
                                    </Label>
                                    <Textarea
                                      value={rpp_panelText}
                                      onChange={(e) =>
                                        setPlanForm((f) => ({
                                          ...f,
                                          rpp_panelText: e.target.value,
                                          rpp_panelValidationError: false,
                                        }))
                                      }
                                      placeholder={`Enter ${sec.label.toLowerCase()}…`}
                                      className="slds-text-4 min-h-[80px] resize-y bg-white"
                                      style={{
                                        borderColor: rpp_panelValidationError
                                          ? "#c23934"
                                          : "#dddbda",
                                        backgroundColor:
                                          "var(--slds-g-color-background-base)",
                                      }}
                                    />
                                    {rpp_panelValidationError && (
                                      <p
                                        className="slds-text-3"
                                        style={{
                                          color: "#c23934",
                                        }}
                                      >
                                        {sec.label} is required.
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={cancelPanel}
                                      className="h-8 px-4 rounded-full slds-text-4"
                                      style={{
                                        borderColor: "#dddbda",
                                        color: "#706e6b",
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={savePanel}
                                      className="h-8 px-4 rounded-full slds-text-4 text-white"
                                      style={{
                                        backgroundColor: "#145F33",
                                      }}
                                    >
                                      Save
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {list.length > 0 ? (
                                <div
                                  className="rounded-lg overflow-hidden"
                                  style={{
                                    border: "1px solid #dddbda",
                                  }}
                                >
                                  <table className="w-full">
                                    <thead>
                                      <tr
                                        style={{
                                          backgroundColor:
                                            "var(--slds-g-color-background-alt)",
                                          borderBottom: "1px solid #dddbda",
                                        }}
                                      >
                                        <th
                                          className="px-3 py-2.5 text-left slds-text-3 font-semibold"
                                          style={{
                                            color: "#706e6b",
                                          }}
                                        >
                                          {sec.label.toUpperCase()}
                                        </th>
                                        <th
                                          className="px-3 py-2.5 text-left slds-text-3 font-semibold w-20"
                                          style={{
                                            color: "#706e6b",
                                          }}
                                        >
                                          ACTIONS
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {list.map((item, idx) => (
                                        <tr
                                          key={item.id}
                                          style={{
                                            borderBottom:
                                              idx < list.length - 1
                                                ? "1px solid #dddbda"
                                                : "none",
                                          }}
                                        >
                                          <td
                                            className="px-3 py-2.5 slds-text-4"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                              whiteSpace: "pre-wrap",
                                            }}
                                          >
                                            {item.text}
                                          </td>
                                          <td className="px-3 py-2.5">
                                            <div className="flex items-center gap-1">
                                              <button
                                                onClick={() =>
                                                  openEdit(sec.key, item)
                                                }
                                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                                                title={`Edit ${sec.label}`}
                                              >
                                                <Pencil
                                                  className="h-3.5 w-3.5"
                                                  style={{
                                                    color: "#0176d3",
                                                  }}
                                                />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  requestDelete(
                                                    sec.key,
                                                    item.id,
                                                  )
                                                }
                                                className="p-1 rounded hover:bg-red-50 transition-colors"
                                                title={`Delete ${sec.label}`}
                                              >
                                                <Trash2
                                                  className="h-3.5 w-3.5"
                                                  style={{
                                                    color: "#c23934",
                                                  }}
                                                />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div
                                  className="flex flex-col items-center justify-center py-6 rounded-lg"
                                  style={{
                                    border: "2px dashed #dddbda",
                                  }}
                                >
                                  <p
                                    className="slds-text-4"
                                    style={{ color: "#706e6b" }}
                                  >
                                    {sec.emptyMsg}
                                  </p>
                                </div>
                              )}
                            </div>
                          )
                        }

                        return (
                          <div className="space-y-7">
                            {rpp_confirmDeleteId !== null && (
                              <div
                                className="fixed inset-0 z-50 flex items-center justify-center"
                                style={{
                                  backgroundColor: "rgba(0,0,0,0.4)",
                                }}
                              >
                                <div
                                  className="w-full max-w-sm rounded-lg shadow-xl p-6 space-y-4"
                                  style={{
                                    backgroundColor:
                                      "var(--slds-g-color-background-base)",
                                    border:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  <h3
                                    className="text-[15px] font-semibold"
                                    style={{
                                      color: "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    Delete Entry
                                  </h3>
                                  <p
                                    className="slds-text-4"
                                    style={{
                                      color: "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    Are you sure you want to delete this entry?
                                    This action cannot be undone.
                                  </p>
                                  <div className="flex justify-end gap-3 pt-2">
                                    <button
                                      onClick={() =>
                                        setPlanForm((f) => ({
                                          ...f,
                                          rpp_confirmDeleteSection: null,
                                          rpp_confirmDeleteId: null,
                                        }))
                                      }
                                      className="h-9 px-5 rounded-full slds-text-4 font-medium"
                                      style={{
                                        backgroundColor:
                                          "var(--slds-g-color-neutral-95)",
                                        color:
                                          "var(--slds-g-color-text-default)",
                                        border:
                                          "1px solid var(--slds-g-color-border-base-1)",
                                      }}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={executeDelete}
                                      className="h-9 px-5 rounded-full slds-text-4 font-medium"
                                      style={{
                                        backgroundColor: "#c23934",
                                        color: "white",
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {RPP_SECTIONS.map((sec, idx) => (
                              <div key={sec.key}>
                                {renderRPPSection(sec)}
                                {idx < RPP_SECTIONS.length - 1 && (
                                  <div
                                    className="border-t mt-4"
                                    style={{
                                      borderColor: "#dddbda",
                                    }}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )
                      })()
                    ) : planForm.planType === "Suicide Prevention Agreement" ? (
                      /* ═══ SUICIDE PREVENTION AGREEMENT PLAN DETAILS ═══ */
                      (() => {
                        const SPA_STAFF = [
                          "Marcus Thompson",
                          "Swapnali Shingare",
                          "Jyotir Dhalmahapatra",
                          "Ajit Khulape",
                          "Mukesh Jaiswal",
                          "Teg Chanderpaul",
                        ]
                        const SPA_CONSTITUENTS = [
                          "Johnson, Sarah (Parent/Guardian)",
                          "Johnson, Michael (Father)",
                          "Davis, Linda (Aunt)",
                        ]
                        const MOCK_COPING_SKILLS_SPA = [
                          {
                            id: 1,
                            skill: "Deep breathing exercises",
                            description:
                              "Slow, controlled breathing to reduce anxiety and calm the nervous system.",
                            effectiveWhen: "Feeling anxious or overwhelmed",
                          },
                          {
                            id: 2,
                            skill: "Journaling emotions",
                            description:
                              "Writing thoughts and feelings to process emotions and gain clarity.",
                            effectiveWhen:
                              "Feeling confused or emotionally flooded",
                          },
                          {
                            id: 3,
                            skill: "Progressive muscle relaxation",
                            description:
                              "Tensing and releasing muscle groups to reduce physical tension.",
                            effectiveWhen:
                              "Feeling physically tense or stressed",
                          },
                          {
                            id: 4,
                            skill: "Calling a trusted friend",
                            description:
                              "Reaching out to a supportive person for connection and perspective.",
                            effectiveWhen:
                              "Feeling isolated or in need of support",
                          },
                        ]

                        const spa_trustedContact: string =
                          (planForm as any).spa_trustedContact ?? ""
                        const spa_steps: {
                          id: number
                          text: string
                        }[] = (planForm as any).spa_steps ?? []
                        const spa_panelOpen: boolean =
                          (planForm as any).spa_panelOpen ?? false
                        const spa_editingStepId: number | null =
                          (planForm as any).spa_editingStepId ?? null
                        const spa_stepText: string =
                          (planForm as any).spa_stepText ?? ""
                        const spa_stepValidationError: boolean =
                          (planForm as any).spa_stepValidationError ?? false
                        const spa_confirmDeleteStepId: number | null =
                          (planForm as any).spa_confirmDeleteStepId ?? null
                        const spa_selectedCopingSkillIds: number[] =
                          (planForm as any).spa_selectedCopingSkillIds ?? []
                        const spa_selectedStepId: number | null =
                          (planForm as any).spa_selectedStepId ?? null
                        const canModifyRemove =
                          spa_selectedStepId !== null && !spa_panelOpen

                        const openAdd = () =>
                          setPlanForm((f) => ({
                            ...f,
                            spa_panelOpen: true,
                            spa_editingStepId: null,
                            spa_stepText: "",
                            spa_stepValidationError: false,
                            spa_selectedStepId: null,
                          }))

                        const openModify = () => {
                          if (spa_selectedStepId === null) return
                          const item = spa_steps.find(
                            (x) => x.id === spa_selectedStepId,
                          )
                          if (!item) return
                          setPlanForm((f) => ({
                            ...f,
                            spa_panelOpen: true,
                            spa_editingStepId: item.id,
                            spa_stepText: item.text,
                            spa_stepValidationError: false,
                          }))
                        }

                        const saveStep = () => {
                          if (!spa_stepText.trim()) {
                            setPlanForm((f) => ({
                              ...f,
                              spa_stepValidationError: true,
                            }))
                            return
                          }
                          if (spa_editingStepId !== null) {
                            setPlanForm((f) => ({
                              ...f,
                              spa_steps: ((f as any).spa_steps ?? []).map(
                                (x: { id: number; text: string }) =>
                                  x.id === spa_editingStepId
                                    ? {
                                        ...x,
                                        text: spa_stepText.trim(),
                                      }
                                    : x,
                              ),
                              spa_panelOpen: false,
                              spa_editingStepId: null,
                              spa_stepText: "",
                              spa_stepValidationError: false,
                              spa_selectedStepId: null,
                            }))
                          } else {
                            setPlanForm((f) => ({
                              ...f,
                              spa_steps: [
                                ...((f as any).spa_steps ?? []),
                                {
                                  id: Date.now(),
                                  text: spa_stepText.trim(),
                                },
                              ],
                              spa_panelOpen: false,
                              spa_stepText: "",
                              spa_stepValidationError: false,
                            }))
                          }
                        }

                        const cancelPanel = () =>
                          setPlanForm((f) => ({
                            ...f,
                            spa_panelOpen: false,
                            spa_editingStepId: null,
                            spa_stepText: "",
                            spa_stepValidationError: false,
                          }))

                        const selectRow = (id: number) =>
                          setPlanForm((f) => ({
                            ...f,
                            spa_selectedStepId: id,
                            spa_panelOpen: false,
                            spa_stepText: "",
                            spa_stepValidationError: false,
                          }))

                        const requestRemove = () => {
                          if (spa_selectedStepId === null) return
                          setPlanForm((f) => ({
                            ...f,
                            spa_confirmDeleteStepId: spa_selectedStepId,
                          }))
                        }

                        const executeRemove = () => {
                          if (spa_confirmDeleteStepId === null) return
                          setPlanForm((f) => ({
                            ...f,
                            spa_steps: ((f as any).spa_steps ?? []).filter(
                              (x: { id: number }) =>
                                x.id !== spa_confirmDeleteStepId,
                            ),
                            spa_confirmDeleteStepId: null,
                            spa_selectedStepId: null,
                          }))
                        }

                        const inputStyle = {
                          border: "1px solid #dddbda",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          color: "var(--slds-g-color-text-default)",
                        }

                        return (
                          <div className="space-y-7">
                            {/* ── Remove Confirmation Overlay ── */}
                            {spa_confirmDeleteStepId !== null && (
                              <div
                                className="fixed inset-0 z-50 flex items-center justify-center"
                                style={{
                                  backgroundColor: "rgba(0,0,0,0.4)",
                                }}
                              >
                                <div
                                  className="w-full max-w-sm rounded-lg shadow-xl p-6 space-y-4"
                                  style={{
                                    backgroundColor:
                                      "var(--slds-g-color-background-base)",
                                    border:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  <h3
                                    className="text-[15px] font-semibold"
                                    style={{
                                      color: "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    Remove Prevention Step
                                  </h3>
                                  <p
                                    className="slds-text-4"
                                    style={{
                                      color: "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    Are you sure you want to remove this
                                    prevention step?
                                  </p>
                                  <div className="flex justify-end gap-3 pt-2">
                                    <button
                                      onClick={() =>
                                        setPlanForm((f) => ({
                                          ...f,
                                          spa_confirmDeleteStepId: null,
                                        }))
                                      }
                                      className="h-9 px-5 rounded-full slds-text-4 font-medium"
                                      style={{
                                        backgroundColor:
                                          "var(--slds-g-color-neutral-95)",
                                        color:
                                          "var(--slds-g-color-text-default)",
                                        border:
                                          "1px solid var(--slds-g-color-border-base-1)",
                                      }}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={executeRemove}
                                      className="h-9 px-5 rounded-full slds-text-4 font-medium"
                                      style={{
                                        backgroundColor: "#c23934",
                                        color: "white",
                                      }}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ── 1. Trusted Contact ── */}
                            <div className="space-y-1.5">
                              <Label
                                className="slds-form-label"
                                style={{ color: "#706e6b" }}
                              >
                                FAMILY MEMBER OR STAFF I CAN SPEAK WITH
                              </Label>
                              <select
                                value={spa_trustedContact}
                                onChange={(e) =>
                                  setPlanForm((f) => ({
                                    ...f,
                                    spa_trustedContact: e.target.value,
                                  }))
                                }
                                className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                                style={{
                                  ...inputStyle,
                                  color: spa_trustedContact
                                    ? "var(--slds-g-color-text-default)"
                                    : "#706e6b",
                                }}
                              >
                                <option value="">Please Select</option>
                                <optgroup label="Active Mercy Home Staff">
                                  {SPA_STAFF.map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="Related Constituents">
                                  {SPA_CONSTITUENTS.map((c) => (
                                    <option key={c} value={c}>
                                      {c}
                                    </option>
                                  ))}
                                </optgroup>
                              </select>
                            </div>

                            {/* ── Divider ── */}
                            <div
                              className="border-t"
                              style={{ borderColor: "#dddbda" }}
                            />

                            {/* ── 2. Suicide Prevention Steps ── */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p
                                  className="slds-text-4 font-semibold"
                                  style={{
                                    color: "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  Suicide Prevention Steps
                                </p>
                                <button
                                  onClick={openAdd}
                                  className="h-7 px-3 rounded-full text-[11px] font-medium flex items-center gap-1"
                                  style={{
                                    backgroundColor: "#145F33",
                                    color: "white",
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                  Add
                                </button>
                              </div>

                              {/* Inline Add / Edit panel */}
                              {spa_panelOpen && (
                                <div
                                  className="rounded-lg p-4 space-y-3"
                                  style={{
                                    backgroundColor:
                                      "var(--slds-g-color-background-alt)",
                                    border: "1px solid #dddbda",
                                  }}
                                >
                                  <p
                                    className="slds-text-4 font-semibold"
                                    style={{
                                      color: "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    {spa_editingStepId !== null
                                      ? "Edit Suicide Prevention Step"
                                      : "Add Suicide Prevention Step"}
                                  </p>
                                  <div className="space-y-1.5">
                                    <Label
                                      className="slds-form-label"
                                      style={{
                                        color: "#706e6b",
                                      }}
                                    >
                                      SUICIDE PREVENTION STEP{" "}
                                      <span
                                        style={{
                                          color: "#c23934",
                                        }}
                                      >
                                        *
                                      </span>
                                    </Label>
                                    <Textarea
                                      value={spa_stepText}
                                      onChange={(e) =>
                                        setPlanForm((f) => ({
                                          ...f,
                                          spa_stepText: e.target.value,
                                          spa_stepValidationError: false,
                                        }))
                                      }
                                      placeholder="Describe the prevention step…"
                                      className="slds-text-4 min-h-[80px] resize-y bg-white"
                                      style={{
                                        borderColor: spa_stepValidationError
                                          ? "#c23934"
                                          : "#dddbda",
                                        backgroundColor:
                                          "var(--slds-g-color-background-base)",
                                      }}
                                    />
                                    {spa_stepValidationError && (
                                      <p
                                        className="slds-text-3"
                                        style={{
                                          color: "#c23934",
                                        }}
                                      >
                                        Suicide Prevention Step is required.
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={cancelPanel}
                                      className="h-8 px-4 rounded-full slds-text-4"
                                      style={{
                                        borderColor: "#dddbda",
                                        color: "#706e6b",
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={saveStep}
                                      className="h-8 px-4 rounded-full slds-text-4 text-white"
                                      style={{
                                        backgroundColor: "#145F33",
                                      }}
                                    >
                                      Save
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Steps grid */}
                              {spa_steps.length > 0 ? (
                                <div
                                  className="rounded-lg overflow-hidden"
                                  style={{
                                    border: "1px solid #dddbda",
                                  }}
                                >
                                  <table className="w-full">
                                    <thead>
                                      <tr
                                        style={{
                                          backgroundColor:
                                            "var(--slds-g-color-background-alt)",
                                          borderBottom: "1px solid #dddbda",
                                        }}
                                      >
                                        <th
                                          className="px-3 py-2.5 text-left slds-text-3 font-semibold"
                                          style={{
                                            color: "#706e6b",
                                          }}
                                        >
                                          SUICIDE PREVENTION STEP
                                        </th>
                                        <th
                                          className="px-3 py-2.5 text-left slds-text-3 font-semibold w-20"
                                          style={{
                                            color: "#706e6b",
                                          }}
                                        >
                                          ACTIONS
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {spa_steps.map((step, idx) => (
                                        <tr
                                          key={step.id}
                                          style={{
                                            borderBottom:
                                              idx < spa_steps.length - 1
                                                ? "1px solid #dddbda"
                                                : "none",
                                          }}
                                        >
                                          <td
                                            className="px-3 py-2.5 slds-text-4"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                              whiteSpace: "pre-wrap",
                                            }}
                                          >
                                            {step.text}
                                          </td>
                                          <td className="px-3 py-2.5">
                                            <div className="flex items-center gap-1">
                                              <button
                                                onClick={() =>
                                                  setPlanForm((f) => ({
                                                    ...f,
                                                    spa_panelOpen: true,
                                                    spa_editingStepId: step.id,
                                                    spa_stepText: step.text,
                                                    spa_stepValidationError: false,
                                                  }))
                                                }
                                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                                                title="Edit Suicide Prevention Step"
                                              >
                                                <Pencil
                                                  className="h-3.5 w-3.5"
                                                  style={{
                                                    color: "#0176d3",
                                                  }}
                                                />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  setPlanForm((f) => ({
                                                    ...f,
                                                    spa_confirmDeleteStepId:
                                                      step.id,
                                                  }))
                                                }
                                                className="p-1 rounded hover:bg-red-50 transition-colors"
                                                title="Delete Suicide Prevention Step"
                                              >
                                                <Trash2
                                                  className="h-3.5 w-3.5"
                                                  style={{
                                                    color: "#c23934",
                                                  }}
                                                />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div
                                  className="flex flex-col items-center justify-center py-6 rounded-lg"
                                  style={{
                                    border: "2px dashed #dddbda",
                                  }}
                                >
                                  <p
                                    className="slds-text-4"
                                    style={{ color: "#706e6b" }}
                                  >
                                    No prevention steps have been added.
                                  </p>
                                  <p
                                    className="slds-text-3 mt-0.5"
                                    style={{ color: "#706e6b" }}
                                  >
                                    Click "Add" to record a prevention step.
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* ── Divider ── */}
                            <div
                              className="border-t"
                              style={{ borderColor: "#dddbda" }}
                            />

                            {/* ── 3. Coping Skills ── */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p
                                  className="slds-text-4 font-semibold"
                                  style={{
                                    color: "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  Utilize The Following Coping Skills
                                </p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPlanForm((f) => ({
                                      ...f,
                                      spa_copingSkillModalOpen: true,
                                      spa_copingSkillPendingIds:
                                        (f as any).spa_selectedCopingSkillIds ??
                                        [],
                                    }))
                                  }
                                  className="flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-medium text-white flex-shrink-0"
                                  style={{
                                    backgroundColor: "#145F33",
                                  }}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  Add
                                </button>
                              </div>

                              {spa_selectedCopingSkillIds.length === 0 ? (
                                <div
                                  className="flex flex-col items-center justify-center py-8 rounded text-center"
                                  style={{
                                    border:
                                      "2px dashed var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  <p
                                    className="slds-text-4"
                                    style={{
                                      color: "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    No coping skills have been added.
                                  </p>
                                  <p
                                    className="slds-text-3 mt-1 max-w-xs"
                                    style={{
                                      color: "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    Click Add to select coping skills for this
                                    Suicide Prevention Agreement.
                                  </p>
                                </div>
                              ) : (
                                <div
                                  className="rounded overflow-hidden"
                                  style={{
                                    border:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  {MOCK_COPING_SKILLS_SPA.filter((s) =>
                                    spa_selectedCopingSkillIds.includes(s.id),
                                  ).map((skill, idx, arr) => (
                                    <div
                                      key={skill.id}
                                      className="flex items-center justify-between px-3 py-2.5"
                                      style={{
                                        borderBottom:
                                          idx < arr.length - 1
                                            ? "1px solid #dddbda"
                                            : "none",
                                      }}
                                    >
                                      <span
                                        className="slds-text-4"
                                        style={{
                                          color: "#080707",
                                        }}
                                      >
                                        {skill.skill}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPlanForm((f) => ({
                                            ...f,
                                            spa_confirmDeleteCopingSkillId:
                                              skill.id,
                                          }))
                                        }
                                        className="h-6 w-6 flex items-center justify-center rounded hover:bg-red-50 flex-shrink-0 ml-2"
                                        title="Remove coping skill"
                                      >
                                        <Trash2
                                          className="h-3.5 w-3.5"
                                          style={{
                                            color: "#c23934",
                                          }}
                                        />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Add Coping Skills Modal */}
                              {(planForm as any).spa_copingSkillModalOpen && (
                                <Dialog
                                  open={
                                    (planForm as any).spa_copingSkillModalOpen
                                  }
                                  onOpenChange={(open) => {
                                    if (!open)
                                      setPlanForm((f) => ({
                                        ...f,
                                        spa_copingSkillModalOpen: false,
                                      }))
                                  }}
                                >
                                  <DialogContent
                                    className="sm:max-w-[520px] max-h-[85vh] flex flex-col p-0"
                                    aria-describedby={undefined}
                                    style={{
                                      backgroundColor: "#ffffff",
                                      border: "1px solid #dddbda",
                                    }}
                                  >
                                    {/* Header */}
                                    <DialogHeader
                                      className="px-5 pt-5 pb-4 flex-shrink-0"
                                      style={{
                                        borderBottom: "1px solid #dddbda",
                                      }}
                                    >
                                      <DialogTitle
                                        className="text-[15px] font-semibold"
                                        style={{
                                          color: "#080707",
                                        }}
                                      >
                                        Select Coping Skills
                                      </DialogTitle>
                                    </DialogHeader>

                                    {/* Search */}
                                    <div className="px-5 pt-4 pb-2 flex-shrink-0">
                                      <div className="relative">
                                        <svg
                                          className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="#706E6B"
                                          strokeWidth="1.33333"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <circle cx="11" cy="11" r="8" />
                                          <path d="M21 21L16.65 16.65" />
                                        </svg>
                                        <input
                                          type="text"
                                          placeholder="Search coping skills"
                                          value={
                                            (planForm as any)
                                              .spa_copingSkillSearchQuery ?? ""
                                          }
                                          onChange={(e) =>
                                            setPlanForm((f) => ({
                                              ...f,
                                              spa_copingSkillSearchQuery:
                                                e.target.value,
                                            }))
                                          }
                                          className="h-9 w-full pl-8 pr-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                                          style={{
                                            border: "1px solid #dddbda",
                                            backgroundColor: "#ffffff",
                                            color: "#080707",
                                          }}
                                        />
                                      </div>
                                    </div>

                                    {/* Skills List */}
                                    <div className="flex-1 overflow-y-auto px-5 py-2">
                                      {(() => {
                                        const query = (
                                          (planForm as any)
                                            .spa_copingSkillSearchQuery ?? ""
                                        )
                                          .toLowerCase()
                                          .trim()
                                        const filtered =
                                          MOCK_COPING_SKILLS_SPA.filter((s) =>
                                            s.skill
                                              .toLowerCase()
                                              .includes(query),
                                          )
                                        const pendingIds: number[] =
                                          (planForm as any)
                                            .spa_copingSkillPendingIds ?? []
                                        if (filtered.length === 0) {
                                          return (
                                            <div
                                              className="flex flex-col items-center justify-center py-8 text-center rounded"
                                              style={{
                                                border: "2px dashed #dddbda",
                                              }}
                                            >
                                              <p
                                                className="slds-text-4"
                                                style={{
                                                  color: "#706e6b",
                                                }}
                                              >
                                                No coping skills match your
                                                search.
                                              </p>
                                            </div>
                                          )
                                        }
                                        return (
                                          <div className="space-y-0.5">
                                            {filtered.map((skill) => {
                                              const checked =
                                                pendingIds.includes(skill.id)
                                              return (
                                                <label
                                                  key={skill.id}
                                                  className="flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer"
                                                  style={{
                                                    backgroundColor: checked
                                                      ? "#f0f7f2"
                                                      : "transparent",
                                                    border:
                                                      "1px solid var(--slds-g-color-border-base-1)",
                                                  }}
                                                  onMouseEnter={(e) => {
                                                    if (!checked)
                                                      e.currentTarget.style.backgroundColor =
                                                        "#fafaf9"
                                                  }}
                                                  onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor =
                                                      checked
                                                        ? "#f0f7f2"
                                                        : "transparent"
                                                  }}
                                                >
                                                  <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => {
                                                      setPlanForm((f) => {
                                                        const ids: number[] =
                                                          (f as any)
                                                            .spa_copingSkillPendingIds ??
                                                          []
                                                        return {
                                                          ...f,
                                                          spa_copingSkillPendingIds:
                                                            checked
                                                              ? ids.filter(
                                                                  (id) =>
                                                                    id !==
                                                                    skill.id,
                                                                )
                                                              : [
                                                                  ...ids,
                                                                  skill.id,
                                                                ],
                                                        }
                                                      })
                                                    }}
                                                    className="h-4 w-4 flex-shrink-0"
                                                    style={{
                                                      accentColor: "#145F33",
                                                    }}
                                                  />
                                                  <span
                                                    className="slds-text-4"
                                                    style={{
                                                      color: "#080707",
                                                    }}
                                                  >
                                                    {skill.skill}
                                                  </span>
                                                </label>
                                              )
                                            })}
                                          </div>
                                        )
                                      })()}
                                    </div>

                                    {/* Footer */}
                                    <DialogFooter
                                      className="px-5 py-4 flex-shrink-0 gap-2"
                                      style={{
                                        borderTop: "1px solid #dddbda",
                                      }}
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full h-9"
                                        style={{
                                          border: "1px solid #dddbda",
                                        }}
                                        onClick={() =>
                                          setPlanForm((f) => ({
                                            ...f,
                                            spa_copingSkillModalOpen: false,
                                            spa_copingSkillSearchQuery: "",
                                          }))
                                        }
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="rounded-full h-9 text-white"
                                        style={{
                                          backgroundColor: "#145F33",
                                        }}
                                        onClick={() =>
                                          setPlanForm((f) => ({
                                            ...f,
                                            spa_selectedCopingSkillIds:
                                              (f as any)
                                                .spa_copingSkillPendingIds ??
                                              [],
                                            spa_copingSkillModalOpen: false,
                                            spa_copingSkillSearchQuery: "",
                                          }))
                                        }
                                      >
                                        Save
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}

                              {/* Delete Confirmation Dialog */}
                              {(planForm as any)
                                .spa_confirmDeleteCopingSkillId != null && (
                                <Dialog
                                  open={true}
                                  onOpenChange={() =>
                                    setPlanForm((f) => ({
                                      ...f,
                                      spa_confirmDeleteCopingSkillId: null,
                                    }))
                                  }
                                >
                                  <DialogContent
                                    className="sm:max-w-[380px]"
                                    aria-describedby={undefined}
                                    style={{
                                      backgroundColor:
                                        "var(--slds-g-color-background-base)",
                                      border:
                                        "1px solid var(--slds-g-color-border-base-1)",
                                    }}
                                  >
                                    <DialogHeader>
                                      <DialogTitle className="text-[15px] font-semibold text-[#080707]">
                                        Remove Coping Skill
                                      </DialogTitle>
                                    </DialogHeader>
                                    <p
                                      className="slds-text-4 py-2"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      Are you sure you want to remove "
                                      {
                                        MOCK_COPING_SKILLS_SPA.find(
                                          (s) =>
                                            s.id ===
                                            (planForm as any)
                                              .spa_confirmDeleteCopingSkillId,
                                        )?.skill
                                      }
                                      " from this plan?
                                    </p>
                                    <DialogFooter className="gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full h-9"
                                        style={{
                                          border:
                                            "1px solid var(--slds-g-color-border-base-1)",
                                        }}
                                        onClick={() =>
                                          setPlanForm((f) => ({
                                            ...f,
                                            spa_confirmDeleteCopingSkillId:
                                              null,
                                          }))
                                        }
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="rounded-full h-9 text-white"
                                        style={{
                                          backgroundColor: "#c23934",
                                        }}
                                        onClick={() =>
                                          setPlanForm((f) => ({
                                            ...f,
                                            spa_selectedCopingSkillIds: (
                                              (f as any)
                                                .spa_selectedCopingSkillIds ??
                                              []
                                            ).filter(
                                              (id: number) =>
                                                id !==
                                                (f as any)
                                                  .spa_confirmDeleteCopingSkillId,
                                            ),
                                            spa_confirmDeleteCopingSkillId:
                                              null,
                                          }))
                                        }
                                      >
                                        Delete
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </div>
                        )
                      })()
                    ) : planForm.planType === "No Harm Contract" ? (
                      /* ═══ NO HARM CONTRACT PLAN DETAILS ═══ */
                      (() => {
                        const NHC_STAFF = [
                          "Marcus Thompson",
                          "Swapnali Shingare",
                          "Jyotir Dhalmahapatra",
                          "Ajit Khulape",
                          "Mukesh Jaiswal",
                          "Teg Chanderpaul",
                        ]
                        const NHC_CONSTITUENTS = [
                          "Johnson, Sarah (Parent/Guardian)",
                          "Johnson, Michael (Father)",
                          "Davis, Linda (Aunt)",
                        ]
                        const MOCK_COPING_SKILLS = [
                          {
                            id: 1,
                            skill: "Deep breathing exercises",
                            description:
                              "Slow, controlled breathing to reduce anxiety and calm the nervous system.",
                            effectiveWhen: "Feeling anxious or overwhelmed",
                          },
                          {
                            id: 2,
                            skill: "Journaling emotions",
                            description:
                              "Writing thoughts and feelings to process emotions and gain clarity.",
                            effectiveWhen:
                              "Feeling confused or emotionally flooded",
                          },
                          {
                            id: 3,
                            skill: "Progressive muscle relaxation",
                            description:
                              "Tensing and releasing muscle groups to reduce physical tension.",
                            effectiveWhen:
                              "Feeling physically tense or stressed",
                          },
                          {
                            id: 4,
                            skill: "Calling a trusted friend",
                            description:
                              "Reaching out to a supportive person for connection and perspective.",
                            effectiveWhen:
                              "Feeling isolated or in need of support",
                          },
                        ]

                        const nhc_trustedContact: string =
                          (planForm as any).nhc_trustedContact ?? ""
                        const nhc_safetyCommitments: {
                          id: number
                          text: string
                        }[] = (planForm as any).nhc_safetyCommitments ?? []
                        const nhc_commitmentModalOpen: boolean =
                          (planForm as any).nhc_commitmentModalOpen ?? false
                        const nhc_editingCommitmentId: number | null =
                          (planForm as any).nhc_editingCommitmentId ?? null
                        const nhc_commitmentText: string =
                          (planForm as any).nhc_commitmentText ?? ""
                        const nhc_commitmentValidationError: boolean =
                          (planForm as any).nhc_commitmentValidationError ??
                          false
                        const nhc_confirmDeleteCommitmentId: number | null =
                          (planForm as any).nhc_confirmDeleteCommitmentId ??
                          null
                        const nhc_selectedCopingSkillIds: number[] =
                          (planForm as any).nhc_selectedCopingSkillIds ?? []
                        const openAddCommitment = () =>
                          setPlanForm((f) => ({
                            ...f,
                            nhc_commitmentModalOpen: true,
                            nhc_editingCommitmentId: null,
                            nhc_commitmentText: "",
                            nhc_commitmentValidationError: false,
                          }))

                        const openModifyCommitment = (c: {
                          id: number
                          text: string
                        }) =>
                          setPlanForm((f) => ({
                            ...f,
                            nhc_commitmentModalOpen: true,
                            nhc_editingCommitmentId: c.id,
                            nhc_commitmentText: c.text,
                            nhc_commitmentValidationError: false,
                          }))

                        const saveCommitment = () => {
                          if (!nhc_commitmentText.trim()) {
                            setPlanForm((f) => ({
                              ...f,
                              nhc_commitmentValidationError: true,
                            }))
                            return
                          }
                          if (nhc_editingCommitmentId !== null) {
                            setPlanForm((f) => ({
                              ...f,
                              nhc_safetyCommitments: (
                                (f as any).nhc_safetyCommitments ?? []
                              ).map((x: { id: number; text: string }) =>
                                x.id === nhc_editingCommitmentId
                                  ? {
                                      ...x,
                                      text: nhc_commitmentText.trim(),
                                    }
                                  : x,
                              ),
                              nhc_commitmentModalOpen: false,
                              nhc_editingCommitmentId: null,
                              nhc_commitmentText: "",
                              nhc_commitmentValidationError: false,
                            }))
                          } else {
                            setPlanForm((f) => ({
                              ...f,
                              nhc_safetyCommitments: [
                                ...((f as any).nhc_safetyCommitments ?? []),
                                {
                                  id: Date.now(),
                                  text: nhc_commitmentText.trim(),
                                },
                              ],
                              nhc_commitmentModalOpen: false,
                              nhc_commitmentText: "",
                              nhc_commitmentValidationError: false,
                            }))
                          }
                        }

                        const inputStyle = {
                          border: "1px solid #dddbda",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          color: "var(--slds-g-color-text-default)",
                        }

                        return (
                          <div className="space-y-7">
                            {/* ── Delete Confirmation Overlay ── */}
                            {nhc_confirmDeleteCommitmentId !== null && (
                              <div
                                className="fixed inset-0 z-50 flex items-center justify-center"
                                style={{
                                  backgroundColor: "rgba(0,0,0,0.4)",
                                }}
                              >
                                <div
                                  className="w-full max-w-sm rounded-lg shadow-xl p-6 space-y-4"
                                  style={{
                                    backgroundColor:
                                      "var(--slds-g-color-background-base)",
                                    border:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  <h3
                                    className="text-[15px] font-semibold"
                                    style={{
                                      color: "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    Remove Safety Commitment
                                  </h3>
                                  <p
                                    className="slds-text-4"
                                    style={{
                                      color: "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    Are you sure you want to remove this safety
                                    commitment?
                                  </p>
                                  <div className="flex justify-end gap-3 pt-2">
                                    <button
                                      onClick={() =>
                                        setPlanForm((f) => ({
                                          ...f,
                                          nhc_confirmDeleteCommitmentId: null,
                                        }))
                                      }
                                      className="h-9 px-5 rounded-full slds-text-4 font-medium"
                                      style={{
                                        backgroundColor:
                                          "var(--slds-g-color-neutral-95)",
                                        color:
                                          "var(--slds-g-color-text-default)",
                                        border:
                                          "1px solid var(--slds-g-color-border-base-1)",
                                      }}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() =>
                                        setPlanForm((f) => ({
                                          ...f,
                                          nhc_safetyCommitments: (
                                            (f as any).nhc_safetyCommitments ??
                                            []
                                          ).filter(
                                            (x: { id: number }) =>
                                              x.id !==
                                              nhc_confirmDeleteCommitmentId,
                                          ),
                                          nhc_confirmDeleteCommitmentId: null,
                                        }))
                                      }
                                      className="h-9 px-5 rounded-full slds-text-4 font-medium"
                                      style={{
                                        backgroundColor: "#c23934",
                                        color: "white",
                                      }}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ── 1. Trusted Contact ── */}
                            <div className="space-y-1.5">
                              <Label
                                className="slds-form-label"
                                style={{ color: "#706e6b" }}
                              >
                                FAMILY MEMBER OR STAFF I CAN SPEAK WITH
                              </Label>
                              <select
                                value={nhc_trustedContact}
                                onChange={(e) =>
                                  setPlanForm((f) => ({
                                    ...f,
                                    nhc_trustedContact: e.target.value,
                                  }))
                                }
                                className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                                style={{
                                  ...inputStyle,
                                  color: nhc_trustedContact
                                    ? "var(--slds-g-color-text-default)"
                                    : "#706e6b",
                                }}
                              >
                                <option value="">Please Select</option>
                                <optgroup label="Active Mercy Home Staff">
                                  {NHC_STAFF.map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="Related Constituents">
                                  {NHC_CONSTITUENTS.map((c) => (
                                    <option key={c} value={c}>
                                      {c}
                                    </option>
                                  ))}
                                </optgroup>
                              </select>
                            </div>

                            {/* ── Divider ── */}
                            <div
                              className="border-t"
                              style={{ borderColor: "#dddbda" }}
                            />

                            {/* ── 2. Safety Commitments ── */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p
                                  className="slds-text-4 font-semibold"
                                  style={{
                                    color: "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  In Order To Keep Myself And Others Safe, I
                                  Will
                                </p>
                                <button
                                  onClick={openAddCommitment}
                                  className="h-7 px-3 rounded-full text-[11px] font-medium flex items-center gap-1"
                                  style={{
                                    backgroundColor: "#145F33",
                                    color: "white",
                                  }}
                                >
                                  <Plus className="h-3 w-3" /> Add
                                </button>
                              </div>

                              {/* Add / Modify inline panel */}
                              {nhc_commitmentModalOpen && (
                                <div
                                  className="rounded-lg p-4 space-y-3"
                                  style={{
                                    backgroundColor:
                                      "var(--slds-g-color-background-alt)",
                                    border: "1px solid #dddbda",
                                  }}
                                >
                                  <p
                                    className="slds-text-4 font-semibold"
                                    style={{
                                      color: "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    {nhc_editingCommitmentId !== null
                                      ? "Modify Safety Commitment"
                                      : "Add Safety Commitment"}
                                  </p>
                                  <div className="space-y-1.5">
                                    <Label
                                      className="slds-form-label"
                                      style={{
                                        color: "#706e6b",
                                      }}
                                    >
                                      ACTIONS{" "}
                                      <span
                                        style={{
                                          color: "#c23934",
                                        }}
                                      >
                                        *
                                      </span>
                                    </Label>
                                    <Textarea
                                      value={nhc_commitmentText}
                                      onChange={(e) =>
                                        setPlanForm((f) => ({
                                          ...f,
                                          nhc_commitmentText: e.target.value,
                                          nhc_commitmentValidationError: false,
                                        }))
                                      }
                                      placeholder="Describe the safety commitment…"
                                      className="slds-text-4 min-h-[80px] resize-y bg-white"
                                      style={{
                                        borderColor:
                                          nhc_commitmentValidationError
                                            ? "#c23934"
                                            : "#dddbda",
                                        backgroundColor:
                                          "var(--slds-g-color-background-base)",
                                      }}
                                    />
                                    {nhc_commitmentValidationError && (
                                      <p
                                        className="slds-text-3"
                                        style={{
                                          color: "#c23934",
                                        }}
                                      >
                                        Actions is required.
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        setPlanForm((f) => ({
                                          ...f,
                                          nhc_commitmentModalOpen: false,
                                          nhc_commitmentText: "",
                                          nhc_editingCommitmentId: null,
                                          nhc_commitmentValidationError: false,
                                        }))
                                      }
                                      className="h-8 px-4 rounded-full slds-text-4"
                                      style={{
                                        borderColor: "#dddbda",
                                        color: "#706e6b",
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={saveCommitment}
                                      className="h-8 px-4 rounded-full slds-text-4 text-white"
                                      style={{
                                        backgroundColor: "#145F33",
                                      }}
                                    >
                                      Save
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Safety Commitments grid */}
                              {nhc_safetyCommitments.length > 0 ? (
                                <div
                                  className="rounded-lg overflow-hidden"
                                  style={{
                                    border: "1px solid #dddbda",
                                  }}
                                >
                                  <table className="w-full">
                                    <thead>
                                      <tr
                                        style={{
                                          backgroundColor:
                                            "var(--slds-g-color-background-alt)",
                                          borderBottom: "1px solid #dddbda",
                                        }}
                                      >
                                        <th
                                          className="px-3 py-2.5 text-left slds-text-3 font-semibold"
                                          style={{
                                            color: "#706e6b",
                                          }}
                                        >
                                          ACTIONS
                                        </th>
                                        <th className="px-3 py-2.5 w-20" />
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {nhc_safetyCommitments.map((c, idx) => (
                                        <tr
                                          key={c.id}
                                          style={{
                                            borderBottom:
                                              idx <
                                              nhc_safetyCommitments.length - 1
                                                ? "1px solid #dddbda"
                                                : "none",
                                          }}
                                        >
                                          <td
                                            className="px-3 py-2.5 slds-text-4"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                            }}
                                          >
                                            {c.text}
                                          </td>
                                          <td className="px-3 py-2.5">
                                            <div className="flex items-center gap-1">
                                              <button
                                                onClick={() =>
                                                  openModifyCommitment(c)
                                                }
                                                className="p-1 rounded hover:bg-gray-100"
                                                title="Modify"
                                              >
                                                <Pencil
                                                  className="h-3.5 w-3.5"
                                                  style={{
                                                    color: "#0176d3",
                                                  }}
                                                />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  setPlanForm((f) => ({
                                                    ...f,
                                                    nhc_confirmDeleteCommitmentId:
                                                      c.id,
                                                  }))
                                                }
                                                className="p-1 rounded hover:bg-red-50"
                                                title="Remove"
                                              >
                                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div
                                  className="flex flex-col items-center justify-center py-6 rounded-lg"
                                  style={{
                                    border: "2px dashed #dddbda",
                                  }}
                                >
                                  <p
                                    className="slds-text-4"
                                    style={{ color: "#706e6b" }}
                                  >
                                    No safety commitments added yet.
                                  </p>
                                  <p
                                    className="slds-text-3 mt-0.5"
                                    style={{ color: "#706e6b" }}
                                  >
                                    Click "Add" to record a commitment.
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* ── Divider ── */}
                            <div
                              className="border-t"
                              style={{ borderColor: "#dddbda" }}
                            />

                            {/* ── 3. Coping Skills ── */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p
                                  className="slds-text-4 font-semibold"
                                  style={{ color: "#080707" }}
                                >
                                  Utilize The Following Coping Skills
                                </p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPlanForm((f) => ({
                                      ...f,
                                      nhc_copingSkillModalOpen: true,
                                      nhc_copingSkillPendingIds:
                                        (f as any).nhc_selectedCopingSkillIds ??
                                        [],
                                    }))
                                  }
                                  className="flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-medium text-white flex-shrink-0"
                                  style={{
                                    backgroundColor: "#145F33",
                                  }}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  Add
                                </button>
                              </div>

                              {nhc_selectedCopingSkillIds.length === 0 ? (
                                <div
                                  className="flex flex-col items-center justify-center py-8 rounded text-center"
                                  style={{
                                    border: "2px dashed #dddbda",
                                  }}
                                >
                                  <p
                                    className="slds-text-4"
                                    style={{ color: "#706e6b" }}
                                  >
                                    No coping skills have been added.
                                  </p>
                                  <p
                                    className="slds-text-3 mt-1 max-w-xs"
                                    style={{ color: "#706e6b" }}
                                  >
                                    Click Add to select coping skills for this
                                    No Harm Contract.
                                  </p>
                                </div>
                              ) : (
                                <div
                                  className="rounded overflow-hidden"
                                  style={{
                                    border: "1px solid #dddbda",
                                  }}
                                >
                                  {MOCK_COPING_SKILLS.filter((s) =>
                                    nhc_selectedCopingSkillIds.includes(s.id),
                                  ).map((skill, idx, arr) => (
                                    <div
                                      key={skill.id}
                                      className="flex items-center justify-between px-3 py-2.5"
                                      style={{
                                        borderBottom:
                                          idx < arr.length - 1
                                            ? "1px solid #dddbda"
                                            : "none",
                                      }}
                                    >
                                      <span
                                        className="slds-text-4"
                                        style={{
                                          color: "#080707",
                                        }}
                                      >
                                        {skill.skill}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPlanForm((f) => ({
                                            ...f,
                                            nhc_confirmDeleteCopingSkillId:
                                              skill.id,
                                          }))
                                        }
                                        className="h-6 w-6 flex items-center justify-center rounded hover:bg-red-50 flex-shrink-0 ml-2"
                                        title="Remove coping skill"
                                      >
                                        <Trash2
                                          className="h-3.5 w-3.5"
                                          style={{
                                            color: "#c23934",
                                          }}
                                        />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Add Coping Skills Modal */}
                              {(planForm as any).nhc_copingSkillModalOpen && (
                                <Dialog
                                  open={
                                    (planForm as any).nhc_copingSkillModalOpen
                                  }
                                  onOpenChange={(open) => {
                                    if (!open)
                                      setPlanForm((f) => ({
                                        ...f,
                                        nhc_copingSkillModalOpen: false,
                                      }))
                                  }}
                                >
                                  <DialogContent
                                    className="sm:max-w-[520px] max-h-[85vh] flex flex-col p-0"
                                    aria-describedby={undefined}
                                    style={{
                                      backgroundColor: "#ffffff",
                                      border: "1px solid #dddbda",
                                    }}
                                  >
                                    {/* Header */}
                                    <DialogHeader
                                      className="px-5 pt-5 pb-4 flex-shrink-0"
                                      style={{
                                        borderBottom: "1px solid #dddbda",
                                      }}
                                    >
                                      <DialogTitle
                                        className="text-[15px] font-semibold"
                                        style={{
                                          color: "#080707",
                                        }}
                                      >
                                        Select Coping Skills
                                      </DialogTitle>
                                    </DialogHeader>

                                    {/* Search */}
                                    <div className="flex-shrink-0 px-[20px] py-[0px]">
                                      <div className="relative">
                                        <Search
                                          className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                                          style={{
                                            color: "#706e6b",
                                          }}
                                        />
                                        <input
                                          type="text"
                                          placeholder="Search coping skills"
                                          value={
                                            (planForm as any)
                                              .nhc_copingSkillSearchQuery ?? ""
                                          }
                                          onChange={(e) =>
                                            setPlanForm((f) => ({
                                              ...f,
                                              nhc_copingSkillSearchQuery:
                                                e.target.value,
                                            }))
                                          }
                                          className="h-9 w-full pl-8 pr-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                                          style={{
                                            border: "1px solid #dddbda",
                                            backgroundColor: "#ffffff",
                                            color: "#080707",
                                          }}
                                        />
                                      </div>
                                    </div>

                                    {/* Skills List */}
                                    <div className="flex-1 overflow-y-auto px-5 py-2">
                                      {(() => {
                                        const query = (
                                          (planForm as any)
                                            .nhc_copingSkillSearchQuery ?? ""
                                        )
                                          .toLowerCase()
                                          .trim()
                                        const filtered =
                                          MOCK_COPING_SKILLS.filter((s) =>
                                            s.skill
                                              .toLowerCase()
                                              .includes(query),
                                          )
                                        const pendingIds: number[] =
                                          (planForm as any)
                                            .nhc_copingSkillPendingIds ?? []
                                        if (filtered.length === 0) {
                                          return (
                                            <div
                                              className="flex flex-col items-center justify-center py-8 text-center rounded"
                                              style={{
                                                border: "2px dashed #dddbda",
                                              }}
                                            >
                                              <p
                                                className="slds-text-4"
                                                style={{
                                                  color: "#706e6b",
                                                }}
                                              >
                                                No coping skills match your
                                                search.
                                              </p>
                                            </div>
                                          )
                                        }
                                        return (
                                          <div className="space-y-0.5">
                                            {filtered.map((skill) => {
                                              const checked =
                                                pendingIds.includes(skill.id)
                                              return (
                                                <label
                                                  key={skill.id}
                                                  className="flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer"
                                                  style={{
                                                    backgroundColor: checked
                                                      ? "#f0f7f2"
                                                      : "transparent",
                                                    border:
                                                      "1px solid var(--slds-g-color-border-base-1)",
                                                  }}
                                                  onMouseEnter={(e) => {
                                                    if (!checked)
                                                      e.currentTarget.style.backgroundColor =
                                                        "#fafaf9"
                                                  }}
                                                  onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor =
                                                      checked
                                                        ? "#f0f7f2"
                                                        : "transparent"
                                                  }}
                                                >
                                                  <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => {
                                                      setPlanForm((f) => {
                                                        const ids: number[] =
                                                          (f as any)
                                                            .nhc_copingSkillPendingIds ??
                                                          []
                                                        return {
                                                          ...f,
                                                          nhc_copingSkillPendingIds:
                                                            checked
                                                              ? ids.filter(
                                                                  (id) =>
                                                                    id !==
                                                                    skill.id,
                                                                )
                                                              : [
                                                                  ...ids,
                                                                  skill.id,
                                                                ],
                                                        }
                                                      })
                                                    }}
                                                    className="h-4 w-4 flex-shrink-0"
                                                    style={{
                                                      accentColor: "#145F33",
                                                    }}
                                                  />
                                                  <span
                                                    className="slds-text-4"
                                                    style={{
                                                      color: "#080707",
                                                    }}
                                                  >
                                                    {skill.skill}
                                                  </span>
                                                </label>
                                              )
                                            })}
                                          </div>
                                        )
                                      })()}
                                    </div>

                                    {/* Footer */}
                                    <DialogFooter
                                      className="px-5 py-4 flex-shrink-0 gap-2"
                                      style={{
                                        borderTop: "1px solid #dddbda",
                                      }}
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full h-9"
                                        style={{
                                          border: "1px solid #dddbda",
                                        }}
                                        onClick={() =>
                                          setPlanForm((f) => ({
                                            ...f,
                                            nhc_copingSkillModalOpen: false,
                                            nhc_copingSkillSearchQuery: "",
                                          }))
                                        }
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="rounded-full h-9 text-white"
                                        style={{
                                          backgroundColor: "#145F33",
                                        }}
                                        onClick={() =>
                                          setPlanForm((f) => ({
                                            ...f,
                                            nhc_selectedCopingSkillIds:
                                              (f as any)
                                                .nhc_copingSkillPendingIds ??
                                              [],
                                            nhc_copingSkillModalOpen: false,
                                            nhc_copingSkillSearchQuery: "",
                                          }))
                                        }
                                      >
                                        Save
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}

                              {/* Delete Confirmation Dialog */}
                              {(planForm as any)
                                .nhc_confirmDeleteCopingSkillId != null && (
                                <Dialog
                                  open={true}
                                  onOpenChange={() =>
                                    setPlanForm((f) => ({
                                      ...f,
                                      nhc_confirmDeleteCopingSkillId: null,
                                    }))
                                  }
                                >
                                  <DialogContent
                                    className="sm:max-w-[380px]"
                                    aria-describedby={undefined}
                                    style={{
                                      backgroundColor: "#ffffff",
                                      border: "1px solid #dddbda",
                                    }}
                                  >
                                    <DialogHeader>
                                      <DialogTitle className="text-[15px] font-semibold text-[#080707]">
                                        Remove Coping Skill
                                      </DialogTitle>
                                    </DialogHeader>
                                    <p
                                      className="slds-text-4 py-2"
                                      style={{
                                        color: "#080707",
                                      }}
                                    >
                                      Are you sure you want to remove "
                                      {
                                        MOCK_COPING_SKILLS.find(
                                          (s) =>
                                            s.id ===
                                            (planForm as any)
                                              .nhc_confirmDeleteCopingSkillId,
                                        )?.skill
                                      }
                                      " from this plan?
                                    </p>
                                    <DialogFooter className="gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full h-9"
                                        style={{
                                          border: "1px solid #dddbda",
                                        }}
                                        onClick={() =>
                                          setPlanForm((f) => ({
                                            ...f,
                                            nhc_confirmDeleteCopingSkillId:
                                              null,
                                          }))
                                        }
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="rounded-full h-9 text-white"
                                        style={{
                                          backgroundColor: "#c23934",
                                        }}
                                        onClick={() =>
                                          setPlanForm((f) => ({
                                            ...f,
                                            nhc_selectedCopingSkillIds: (
                                              (f as any)
                                                .nhc_selectedCopingSkillIds ??
                                              []
                                            ).filter(
                                              (id: number) =>
                                                id !==
                                                (f as any)
                                                  .nhc_confirmDeleteCopingSkillId,
                                            ),
                                            nhc_confirmDeleteCopingSkillId:
                                              null,
                                          }))
                                        }
                                      >
                                        Delete
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </div>
                        )
                      })()
                    ) : planForm.planType === "School Safety Plan" ? (
                      /* ═══ SCHOOL SAFETY PLAN DETAILS ═══ */
                      (() => {
                        const ssp_reasons: {
                          id: number
                          reason: string
                        }[] = (planForm as any).ssp_reasons ?? []
                        const ssp_panelOpen: boolean =
                          (planForm as any).ssp_panelOpen ?? false
                        const ssp_editingReasonId: number | null =
                          (planForm as any).ssp_editingReasonId ?? null
                        const ssp_reasonText: string =
                          (planForm as any).ssp_reasonText ?? ""
                        const ssp_reasonValidationError: boolean =
                          (planForm as any).ssp_reasonValidationError ?? false
                        const ssp_confirmDeleteReasonId: number | null =
                          (planForm as any).ssp_confirmDeleteReasonId ?? null
                        const ssp_documents: {
                          id: number
                          name: string
                          uploadDate: string
                          uploadedBy: string
                          size: string
                        }[] = (planForm as any).ssp_documents ?? []

                        const openAdd = () =>
                          setPlanForm((f) => ({
                            ...f,
                            ssp_panelOpen: true,
                            ssp_editingReasonId: null,
                            ssp_reasonText: "",
                            ssp_reasonValidationError: false,
                          }))

                        const openEdit = (item: {
                          id: number
                          reason: string
                        }) =>
                          setPlanForm((f) => ({
                            ...f,
                            ssp_panelOpen: true,
                            ssp_editingReasonId: item.id,
                            ssp_reasonText: item.reason,
                            ssp_reasonValidationError: false,
                          }))

                        const savePanel = () => {
                          if (!ssp_reasonText.trim()) {
                            setPlanForm((f) => ({
                              ...f,
                              ssp_reasonValidationError: true,
                            }))
                            return
                          }
                          if (ssp_editingReasonId !== null) {
                            setPlanForm((f) => ({
                              ...f,
                              ssp_reasons: ((f as any).ssp_reasons ?? []).map(
                                (x: { id: number; reason: string }) =>
                                  x.id === ssp_editingReasonId
                                    ? {
                                        ...x,
                                        reason: ssp_reasonText.trim(),
                                      }
                                    : x,
                              ),
                              ssp_panelOpen: false,
                              ssp_editingReasonId: null,
                              ssp_reasonText: "",
                              ssp_reasonValidationError: false,
                            }))
                          } else {
                            setPlanForm((f) => ({
                              ...f,
                              ssp_reasons: [
                                ...((f as any).ssp_reasons ?? []),
                                {
                                  id: Date.now(),
                                  reason: ssp_reasonText.trim(),
                                },
                              ],
                              ssp_panelOpen: false,
                              ssp_reasonText: "",
                              ssp_reasonValidationError: false,
                            }))
                          }
                        }

                        const cancelPanel = () =>
                          setPlanForm((f) => ({
                            ...f,
                            ssp_panelOpen: false,
                            ssp_editingReasonId: null,
                            ssp_reasonText: "",
                            ssp_reasonValidationError: false,
                          }))

                        const requestDelete = (id: number) =>
                          setPlanForm((f) => ({
                            ...f,
                            ssp_confirmDeleteReasonId: id,
                          }))

                        const executeDelete = () => {
                          if (ssp_confirmDeleteReasonId === null) return
                          setPlanForm((f) => ({
                            ...f,
                            ssp_reasons: ((f as any).ssp_reasons ?? []).filter(
                              (x: { id: number }) =>
                                x.id !== ssp_confirmDeleteReasonId,
                            ),
                            ssp_confirmDeleteReasonId: null,
                          }))
                        }

                        const inputStyle = {
                          border: "1px solid #dddbda",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          color: "var(--slds-g-color-text-default)",
                        }

                        return (
                          <div className="space-y-7">
                            {/* ── Delete Confirmation Overlay ── */}
                            {ssp_confirmDeleteReasonId !== null && (
                              <div
                                className="fixed inset-0 z-50 flex items-center justify-center"
                                style={{
                                  backgroundColor: "rgba(0,0,0,0.4)",
                                }}
                              >
                                <div
                                  className="w-full max-w-sm rounded-lg shadow-xl p-6 space-y-4"
                                  style={{
                                    backgroundColor:
                                      "var(--slds-g-color-background-base)",
                                    border:
                                      "1px solid var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  <h3
                                    className="text-[15px] font-semibold"
                                    style={{
                                      color: "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    Remove Reason
                                  </h3>
                                  <p
                                    className="slds-text-4"
                                    style={{
                                      color: "var(--slds-g-color-text-weak)",
                                    }}
                                  >
                                    Are you sure you want to remove this reason?
                                    This action cannot be undone.
                                  </p>
                                  <div className="flex justify-end gap-3 pt-2">
                                    <button
                                      onClick={() =>
                                        setPlanForm((f) => ({
                                          ...f,
                                          ssp_confirmDeleteReasonId: null,
                                        }))
                                      }
                                      className="h-9 px-5 rounded-full slds-text-4 font-medium"
                                      style={{
                                        backgroundColor:
                                          "var(--slds-g-color-neutral-95)",
                                        color:
                                          "var(--slds-g-color-text-default)",
                                        border:
                                          "1px solid var(--slds-g-color-border-base-1)",
                                      }}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={executeDelete}
                                      className="h-9 px-5 rounded-full slds-text-4 font-medium"
                                      style={{
                                        backgroundColor: "#c23934",
                                        color: "white",
                                      }}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ── 1. Reason for Plan (Overview) ── */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label
                                  className="slds-form-label"
                                  style={{ color: "#706e6b" }}
                                >
                                  REASON FOR PLAN (OVERVIEW)
                                </Label>
                                <button
                                  onClick={openAdd}
                                  className="h-7 px-3 rounded-full text-[11px] font-medium flex items-center gap-1"
                                  style={{
                                    backgroundColor: "#145F33",
                                    color: "white",
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                  Add
                                </button>
                              </div>

                              {/* Inline Add / Edit panel */}
                              {ssp_panelOpen && (
                                <div
                                  className="rounded-lg p-4 space-y-3"
                                  style={{
                                    backgroundColor:
                                      "var(--slds-g-color-background-alt)",
                                    border: "1px solid #dddbda",
                                  }}
                                >
                                  <p
                                    className="slds-text-4 font-semibold"
                                    style={{
                                      color: "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    {ssp_editingReasonId !== null
                                      ? "Edit Reason"
                                      : "Add Reason"}
                                  </p>
                                  <div className="space-y-1.5">
                                    <Label
                                      className="slds-form-label"
                                      style={{
                                        color: "#706e6b",
                                      }}
                                    >
                                      REASON{" "}
                                      <span
                                        style={{
                                          color: "#c23934",
                                        }}
                                      >
                                        *
                                      </span>
                                    </Label>
                                    <Textarea
                                      value={ssp_reasonText}
                                      onChange={(e) =>
                                        setPlanForm((f) => ({
                                          ...f,
                                          ssp_reasonText: e.target.value,
                                          ssp_reasonValidationError: false,
                                        }))
                                      }
                                      placeholder="Enter reason for plan…"
                                      className="slds-text-4 min-h-[80px] resize-y"
                                      style={{
                                        borderColor: ssp_reasonValidationError
                                          ? "#c23934"
                                          : "#dddbda",
                                        backgroundColor:
                                          "var(--slds-g-color-background-base)",
                                      }}
                                    />
                                    {ssp_reasonValidationError && (
                                      <p
                                        className="slds-text-3"
                                        style={{
                                          color: "#c23934",
                                        }}
                                      >
                                        Reason is required.
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={cancelPanel}
                                      className="h-8 px-4 rounded-full slds-text-4"
                                      style={{
                                        borderColor: "#dddbda",
                                        color: "#706e6b",
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={savePanel}
                                      className="h-8 px-4 rounded-full slds-text-4 text-white"
                                      style={{
                                        backgroundColor: "#145F33",
                                      }}
                                    >
                                      Save
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Reasons grid */}
                              {ssp_reasons.length > 0 ? (
                                <div
                                  className="rounded-lg overflow-hidden"
                                  style={{
                                    border: "1px solid #dddbda",
                                  }}
                                >
                                  <table className="w-full">
                                    <thead>
                                      <tr
                                        style={{
                                          backgroundColor:
                                            "var(--slds-g-color-background-alt)",
                                          borderBottom: "1px solid #dddbda",
                                        }}
                                      >
                                        <th
                                          className="px-3 py-2.5 text-left slds-text-3 font-semibold"
                                          style={{
                                            color: "#706e6b",
                                          }}
                                        >
                                          REASON
                                        </th>
                                        <th
                                          className="px-3 py-2.5 text-left slds-text-3 font-semibold w-20"
                                          style={{
                                            color: "#706e6b",
                                          }}
                                        >
                                          ACTIONS
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {ssp_reasons.map((item, idx) => (
                                        <tr
                                          key={item.id}
                                          style={{
                                            borderBottom:
                                              idx < ssp_reasons.length - 1
                                                ? "1px solid #dddbda"
                                                : "none",
                                          }}
                                        >
                                          <td
                                            className="px-3 py-2.5 slds-text-4"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                              whiteSpace: "pre-wrap",
                                            }}
                                          >
                                            {item.reason}
                                          </td>
                                          <td className="px-3 py-2.5">
                                            <div className="flex items-center gap-1">
                                              <button
                                                onClick={() => openEdit(item)}
                                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                                                title="Edit Reason"
                                              >
                                                <Pencil
                                                  className="h-3.5 w-3.5"
                                                  style={{
                                                    color: "#0176d3",
                                                  }}
                                                />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  requestDelete(item.id)
                                                }
                                                className="p-1 rounded hover:bg-red-50 transition-colors"
                                                title="Remove Reason"
                                              >
                                                <Trash2
                                                  className="h-3.5 w-3.5"
                                                  style={{
                                                    color: "#c23934",
                                                  }}
                                                />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div
                                  className="flex flex-col items-center justify-center py-6 rounded-lg"
                                  style={{
                                    border: "2px dashed #dddbda",
                                  }}
                                >
                                  <p
                                    className="slds-text-4"
                                    style={{ color: "#706e6b" }}
                                  >
                                    No reasons added yet.
                                  </p>
                                  <p
                                    className="slds-text-3 mt-0.5"
                                    style={{ color: "#706e6b" }}
                                  >
                                    Click "Add" to record a reason for this
                                    plan.
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* ── Divider ── */}
                            <div
                              className="border-t"
                              style={{ borderColor: "#dddbda" }}
                            />

                            {/* ── 2–5. Textarea fields ── */}
                            {([
                              {
                                key: "ssp_behaviorDescription",
                                label:
                                  "DESCRIPTION OF BEHAVIORS BEING ADDRESSED",
                              },
                              {
                                key: "ssp_locationTransitionInfo",
                                label:
                                  "INFORMATION ABOUT LOCATIONS, TRANSITIONS, ARRIVAL/DISMISSAL",
                              },
                              {
                                key: "ssp_restrictions",
                                label: "RESTRICTIONS",
                              },
                              {
                                key: "ssp_durationHowOftenReviewed",
                                label: "DURATION / HOW OFTEN REVIEWED",
                              },
                            ] as {
                              key: string
                              label: string
                            }[]).map(({ key, label }) => (
                              <div key={key} className="space-y-1.5">
                                <Label
                                  className="slds-form-label"
                                  style={{ color: "#706e6b" }}
                                >
                                  {label}
                                </Label>
                                <Textarea
                                  value={
                                    ((planForm as any)[key] ?? "") as string
                                  }
                                  onChange={(e) =>
                                    setPlanForm((f) => ({
                                      ...f,
                                      [key]: e.target.value,
                                    }))
                                  }
                                  className="slds-text-4 min-h-[80px] resize-y"
                                  style={{
                                    borderColor: "#dddbda",
                                    backgroundColor:
                                      "var(--slds-g-color-background-base)",
                                  }}
                                />
                              </div>
                            ))}

                            {/* ── Divider ── */}
                            <div
                              className="border-t"
                              style={{ borderColor: "#dddbda" }}
                            />

                            {/* ── 6. Documents ── */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label
                                  className="slds-form-label"
                                  style={{ color: "#706e6b" }}
                                >
                                  DOCUMENTS
                                </Label>
                                <button
                                  onClick={() => {
                                    const mockDoc = {
                                      id: Date.now(),
                                      name: `SchoolSafetyPlan_Document_${new Date()
                                        .toLocaleDateString("en-US", {
                                          month: "2-digit",
                                          day: "2-digit",
                                          year: "numeric",
                                        })
                                        .replace(/\//g, "")}.pdf`,
                                      uploadDate: new Date().toLocaleDateString(
                                        "en-US",
                                        {
                                          month: "2-digit",
                                          day: "2-digit",
                                          year: "numeric",
                                        },
                                      ),
                                      uploadedBy: "Current User",
                                      size: "1.2 MB",
                                    }
                                    setPlanForm((f) => ({
                                      ...f,
                                      ssp_documents: [
                                        ...((f as any).ssp_documents ?? []),
                                        mockDoc,
                                      ],
                                    }))
                                  }}
                                  className="h-7 px-3 rounded-full text-[11px] font-medium flex items-center gap-1"
                                  style={{
                                    backgroundColor: "#145F33",
                                    color: "white",
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                  Upload Document
                                </button>
                              </div>

                              {ssp_documents.length === 0 ? (
                                <div
                                  className="flex flex-col items-center justify-center py-6 rounded-lg"
                                  style={{
                                    border: "2px dashed #dddbda",
                                  }}
                                >
                                  <p
                                    className="slds-text-4"
                                    style={{ color: "#706e6b" }}
                                  >
                                    No documents uploaded.
                                  </p>
                                </div>
                              ) : (
                                <div
                                  className="rounded-lg overflow-hidden"
                                  style={{
                                    border: "1px solid #dddbda",
                                  }}
                                >
                                  <table className="w-full">
                                    <thead>
                                      <tr
                                        style={{
                                          backgroundColor:
                                            "var(--slds-g-color-background-alt)",
                                          borderBottom: "1px solid #dddbda",
                                        }}
                                      >
                                        {[
                                          "DOCUMENT NAME",
                                          "UPLOAD DATE",
                                          "UPLOADED BY",
                                          "SIZE",
                                          "ACTIONS",
                                        ].map((h) => (
                                          <th
                                            key={h}
                                            className="px-3 py-2.5 text-left slds-text-3 font-semibold"
                                            style={{
                                              color: "#706e6b",
                                            }}
                                          >
                                            {h}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {ssp_documents.map((doc, idx) => (
                                        <tr
                                          key={doc.id}
                                          style={{
                                            borderBottom:
                                              idx < ssp_documents.length - 1
                                                ? "1px solid #dddbda"
                                                : "none",
                                          }}
                                        >
                                          <td className="px-3 py-2.5">
                                            <div
                                              className="flex items-center gap-2 slds-text-4"
                                              style={{
                                                color:
                                                  "var(--slds-g-color-text-default)",
                                              }}
                                            >
                                              <FileText
                                                className="h-4 w-4 flex-shrink-0"
                                                style={{
                                                  color:
                                                    "var(--slds-g-color-text-weak)",
                                                }}
                                              />
                                              {doc.name}
                                            </div>
                                          </td>
                                          <td
                                            className="px-3 py-2.5 slds-text-4"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                            }}
                                          >
                                            {doc.uploadDate}
                                          </td>
                                          <td
                                            className="px-3 py-2.5 slds-text-4"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                            }}
                                          >
                                            {doc.uploadedBy}
                                          </td>
                                          <td
                                            className="px-3 py-2.5 slds-text-4"
                                            style={{
                                              color:
                                                "var(--slds-g-color-text-default)",
                                            }}
                                          >
                                            {doc.size}
                                          </td>
                                          <td className="px-3 py-2.5">
                                            <div className="flex items-center gap-1">
                                              <button
                                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                                                title="View"
                                              >
                                                <Eye
                                                  className="h-3.5 w-3.5"
                                                  style={{
                                                    color: "#0176d3",
                                                  }}
                                                />
                                              </button>
                                              <button
                                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                                                title="Download"
                                              >
                                                <Download
                                                  className="h-3.5 w-3.5"
                                                  style={{
                                                    color: "#0176d3",
                                                  }}
                                                />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  setPlanForm((f) => ({
                                                    ...f,
                                                    ssp_documents: (
                                                      (f as any)
                                                        .ssp_documents ?? []
                                                    ).filter(
                                                      (d: { id: number }) =>
                                                        d.id !== doc.id,
                                                    ),
                                                  }))
                                                }
                                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                                                title="Remove"
                                              >
                                                <Trash2
                                                  className="h-3.5 w-3.5"
                                                  style={{
                                                    color: "#c23934",
                                                  }}
                                                />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })()
                    ) : plainPlansLabel ? (
                      /* ═══ GENERIC PLAN DETAILS (design system, Community Care) ═══ */
                      <div className="space-y-5">
                        <div className="space-y-1.5">
                          <FieldLabel htmlFor="plan-agreement-type">
                            Agreement Type
                          </FieldLabel>
                          <Select
                            value={planForm.agreementType || undefined}
                            onValueChange={(v) =>
                              setPlanForm((f) => ({
                                ...f,
                                agreementType: v,
                                agreementTypeOther:
                                  v !== "Other" ? "" : f.agreementTypeOther,
                              }))
                            }
                          >
                            <SelectTrigger
                              id="plan-agreement-type"
                              surface="base"
                            >
                              <SelectValue placeholder="Select agreement type…" />
                            </SelectTrigger>
                            <SelectContent>
                              {AGREEMENT_TYPES.map((t: string) => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {planForm.agreementType === "Other" && (
                          <div className="space-y-1.5">
                            <FieldLabel required htmlFor="plan-agreement-other">
                              Other
                            </FieldLabel>
                            <Input
                              id="plan-agreement-other"
                              surface="base"
                              value={planForm.agreementTypeOther}
                              onChange={(e) =>
                                setPlanForm((f) => ({
                                  ...f,
                                  agreementTypeOther: e.target.value,
                                }))
                              }
                              placeholder="Describe the agreement type…"
                            />
                          </div>
                        )}
                        {([
                          ["reasonForAgreement", "Reason for Agreement"],
                          [
                            "previousSupports",
                            "Previous Supports / Interventions",
                          ],
                          ["youthCommitsTo", "Youth Commits To"],
                          ["supportSystemHelp", "Support System Can Help By"],
                          [
                            "expectedBenefits",
                            "Expected Benefits if Agreement Is Successful",
                          ],
                          [
                            "expectedConsequences",
                            "Expected Consequences if Agreement Is Unsuccessful",
                          ],
                        ] as const).map(([key, label]) => (
                          <div key={key} className="space-y-1.5">
                            <FieldLabel htmlFor={`plan-${key}`}>
                              {label}
                            </FieldLabel>
                            <Textarea
                              id={`plan-${key}`}
                              rows={3}
                              value={(planForm as any)[key] as string}
                              onChange={(e) =>
                                setPlanForm((f) => ({
                                  ...f,
                                  [key]: e.target.value,
                                }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* ═══ GENERIC PLAN DETAILS ═══ */
                      <div className="space-y-5">
                        {/* Agreement Type */}
                        <div className="space-y-1.5">
                          <Label
                            className="slds-form-label"
                            style={{ color: "#706e6b" }}
                          >
                            AGREEMENT TYPE
                          </Label>
                          <select
                            value={planForm.agreementType}
                            onChange={(e) =>
                              setPlanForm((f) => ({
                                ...f,
                                agreementType: e.target.value,
                                agreementTypeOther:
                                  e.target.value !== "Other"
                                    ? ""
                                    : f.agreementTypeOther,
                              }))
                            }
                            className="h-9 w-full px-3 rounded slds-text-4"
                            style={{
                              border: "1px solid #dddbda",
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                              color: planForm.agreementType
                                ? "var(--slds-g-color-text-default)"
                                : "#706e6b",
                            }}
                          >
                            <option value="">Select agreement type…</option>
                            {AGREEMENT_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>

                        {planForm.agreementType === "Other" && (
                          <div className="space-y-1.5">
                            <Label
                              className="slds-form-label"
                              style={{ color: "#706e6b" }}
                            >
                              OTHER <span className="text-red-600">*</span>
                            </Label>
                            <Input
                              value={planForm.agreementTypeOther}
                              onChange={(e) =>
                                setPlanForm((f) => ({
                                  ...f,
                                  agreementTypeOther: e.target.value,
                                }))
                              }
                              placeholder="Describe the agreement type…"
                              className="h-9 slds-text-4"
                              style={{
                                borderColor: "#dddbda",
                              }}
                            />
                          </div>
                        )}

                        {([
                          {
                            key: "reasonForAgreement",
                            label: "REASON FOR AGREEMENT",
                          },
                          {
                            key: "previousSupports",
                            label: "PREVIOUS SUPPORTS / INTERVENTIONS",
                          },
                          {
                            key: "youthCommitsTo",
                            label: "YOUTH COMMITS TO",
                          },
                          {
                            key: "supportSystemHelp",
                            label: "SUPPORT SYSTEM CAN HELP BY",
                          },
                          {
                            key: "expectedBenefits",
                            label:
                              "EXPECTED BENEFITS IF AGREEMENT IS SUCCESSFUL",
                          },
                          {
                            key: "expectedConsequences",
                            label:
                              "EXPECTED CONSEQUENCES IF AGREEMENT IS UNSUCCESSFUL",
                          },
                        ] as {
                          key: keyof typeof planForm
                          label: string
                        }[]).map(({ key, label }) => (
                          <div key={key} className="space-y-1.5">
                            <Label
                              className="slds-form-label"
                              style={{ color: "#706e6b" }}
                            >
                              {label}
                            </Label>
                            <Textarea
                              value={planForm[key] as string}
                              onChange={(e) =>
                                setPlanForm((f) => ({
                                  ...f,
                                  [key]: e.target.value,
                                }))
                              }
                              className="slds-text-4 min-h-[72px] resize-y bg-white"
                              style={{
                                borderColor: "#dddbda",
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ))}

                  {/* ── SERVICES TAB (Academic Service Plan only) ── */}
                  {addPlanTab === "services" &&
                    planForm.planType === "Academic Service Plan" &&
                    (() => {
                      const fieldStyle = {
                        borderColor: "#dddbda",
                      }

                      // Service handlers
                      const openAddService = () =>
                        setPlanForm(
                          (f) =>
                            ({
                              ...f,
                              asp_serviceModalOpen: true,
                              asp_editingServiceId: null,
                              asp_selectedServices: [],
                              asp_serviceBreakdown: "",
                            }) as any,
                        )
                      const openModifyService = (s: {
                        id: number
                        serviceName: string
                        breakdownOfMinutes?: string
                      }) => {
                        const services = s.serviceName.split(", ")
                        setPlanForm(
                          (f) =>
                            ({
                              ...f,
                              asp_serviceModalOpen: true,
                              asp_editingServiceId: s.id,
                              asp_selectedServices: services,
                              asp_serviceBreakdown: s.breakdownOfMinutes || "",
                            }) as any,
                        )
                      }
                      const saveService = () => {
                        if (planForm.asp_selectedServices.length === 0) return
                        const serviceText =
                          planForm.asp_selectedServices.join(", ")
                        const breakdown =
                          (planForm as any).asp_serviceBreakdown || ""
                        if (planForm.asp_editingServiceId !== null) {
                          setPlanForm(
                            (f) =>
                              ({
                                ...f,
                                asp_services: f.asp_services.map((x) =>
                                  x.id === f.asp_editingServiceId
                                    ? {
                                        ...x,
                                        serviceName: serviceText,
                                        breakdownOfMinutes: breakdown,
                                      }
                                    : x,
                                ),
                                asp_serviceModalOpen: false,
                                asp_selectedServices: [],
                                asp_serviceBreakdown: "",
                              }) as any,
                          )
                        } else {
                          setPlanForm(
                            (f) =>
                              ({
                                ...f,
                                asp_services: [
                                  ...f.asp_services,
                                  {
                                    id: Date.now(),
                                    serviceName: serviceText,
                                    breakdownOfMinutes: breakdown,
                                  },
                                ],
                                asp_serviceModalOpen: false,
                                asp_selectedServices: [],
                                asp_serviceBreakdown: "",
                              }) as any,
                          )
                        }
                      }
                      const removeService = (id: number) =>
                        setPlanForm((f) => ({
                          ...f,
                          asp_services: f.asp_services.filter(
                            (x) => x.id !== id,
                          ),
                        }))
                      const toggleService = (service: string) => {
                        setPlanForm((f) => ({
                          ...f,
                          asp_selectedServices: f.asp_selectedServices.includes(
                            service,
                          )
                            ? f.asp_selectedServices.filter(
                                (s) => s !== service,
                              )
                            : [...f.asp_selectedServices, service],
                        }))
                      }

                      return (
                        <div className="space-y-5">
                          {/* Services Grid */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p
                                className="slds-text-4 font-semibold"
                                style={{
                                  color: "var(--slds-g-color-text-default)",
                                }}
                              >
                                Services
                              </p>
                              <Button
                                onClick={openAddService}
                                className="h-8 px-3 rounded-full slds-text-4 text-white"
                                style={{
                                  backgroundColor: "#145F33",
                                }}
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Add
                              </Button>
                            </div>

                            {/* Service Modal */}
                            {planForm.asp_serviceModalOpen && (
                              <div
                                className="rounded-lg p-4 space-y-4"
                                style={{
                                  backgroundColor:
                                    "var(--slds-g-color-background-alt)",
                                  border: "1px solid #dddbda",
                                }}
                              >
                                <p
                                  className="slds-text-4 font-semibold"
                                  style={{
                                    color: "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {planForm.asp_editingServiceId !== null
                                    ? "Modify Service"
                                    : "Add Service"}
                                </p>
                                <div className="space-y-2">
                                  <Label
                                    className="slds-form-label"
                                    style={{ color: "#706e6b" }}
                                  >
                                    SELECT SERVICES{" "}
                                    <span className="text-red-600">*</span>
                                  </Label>
                                  <div className="space-y-1.5">
                                    {ASP_SERVICES?.map((service) => (
                                      <label
                                        key={service}
                                        className="flex items-center gap-2 cursor-pointer"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={planForm.asp_selectedServices.includes(
                                            service,
                                          )}
                                          onChange={() =>
                                            toggleService(service)
                                          }
                                          className="h-4 w-4 rounded"
                                          style={{
                                            accentColor: "#145F33",
                                          }}
                                        />
                                        <span
                                          className="slds-text-4"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-default)",
                                          }}
                                        >
                                          {service}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                                {/* Breakdown of Minutes dropdown */}
                                <div className="space-y-1.5">
                                  <Label
                                    className="slds-form-label"
                                    style={{ color: "#706e6b" }}
                                  >
                                    BREAKDOWN OF MINUTES{" "}
                                    <span className="text-red-600">*</span>
                                  </Label>
                                  <select
                                    value={
                                      (planForm as any).asp_serviceBreakdown ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      setPlanForm(
                                        (f) =>
                                          ({
                                            ...f,
                                            asp_serviceBreakdown:
                                              e.target.value,
                                          }) as any,
                                      )
                                    }
                                    className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                                    style={{
                                      border: "1px solid #dddbda",
                                      backgroundColor:
                                        "var(--slds-g-color-background-base)",
                                      color: (planForm as any)
                                        .asp_serviceBreakdown
                                        ? "var(--slds-g-color-text-default)"
                                        : "#706e6b",
                                    }}
                                  >
                                    <option value="">Select minutes…</option>
                                    {[
                                      "15",
                                      "30",
                                      "45",
                                      "60",
                                      "90",
                                      "120",
                                      "150",
                                      "180",
                                    ].map((m) => (
                                      <option key={m} value={m}>
                                        {m}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    onClick={() =>
                                      setPlanForm(
                                        (f) =>
                                          ({
                                            ...f,
                                            asp_serviceModalOpen: false,
                                            asp_selectedServices: [],
                                            asp_serviceBreakdown: "",
                                          }) as any,
                                      )
                                    }
                                    className="h-8 px-3 rounded-full slds-text-4"
                                    style={{
                                      backgroundColor: "transparent",
                                      color: "#706e6b",
                                      border: "1px solid #dddbda",
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={saveService}
                                    disabled={
                                      planForm.asp_selectedServices.length ===
                                        0 ||
                                      !(planForm as any).asp_serviceBreakdown
                                    }
                                    className="h-8 px-3 rounded-full slds-text-4 text-white"
                                    style={{
                                      backgroundColor:
                                        planForm.asp_selectedServices.length >
                                          0 &&
                                        (planForm as any).asp_serviceBreakdown
                                          ? "#145F33"
                                          : "var(--slds-g-color-neutral-95)",
                                      color:
                                        planForm.asp_selectedServices.length >
                                          0 &&
                                        (planForm as any).asp_serviceBreakdown
                                          ? "white"
                                          : "#706e6b",
                                    }}
                                  >
                                    Apply
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Service Grid */}
                            {planForm.asp_services.length > 0 ? (
                              <div
                                className="rounded-lg overflow-hidden"
                                style={{
                                  border: "1px solid #dddbda",
                                }}
                              >
                                <table className="w-full">
                                  <thead>
                                    <tr
                                      style={{
                                        backgroundColor:
                                          "var(--slds-g-color-background-alt)",
                                        borderBottom: "1px solid #dddbda",
                                      }}
                                    >
                                      {[
                                        "SERVICE NAME",
                                        "BREAKDOWN OF MINUTES",
                                        "ACTIONS",
                                      ].map((h) => (
                                        <th
                                          key={h}
                                          className="px-3 py-2.5 text-left slds-text-3 font-semibold"
                                          style={{
                                            color: "#706e6b",
                                          }}
                                        >
                                          {h}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {planForm.asp_services.map((s, idx) => (
                                      <tr
                                        key={s.id}
                                        style={{
                                          borderBottom:
                                            idx <
                                            planForm.asp_services.length - 1
                                              ? "1px solid #dddbda"
                                              : "none",
                                        }}
                                      >
                                        <td
                                          className="px-3 py-2.5 slds-text-4"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-default)",
                                          }}
                                        >
                                          {s.serviceName}
                                        </td>
                                        <td
                                          className="px-3 py-2.5 slds-text-4"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-default)",
                                          }}
                                        >
                                          {(s as any).breakdownOfMinutes || "—"}
                                        </td>
                                        <td className="px-3 py-2.5">
                                          <div className="flex items-center gap-1">
                                            <button
                                              onClick={() =>
                                                openModifyService(s)
                                              }
                                              className="p-1 rounded hover:bg-gray-100"
                                              title="Modify"
                                            >
                                              <Pencil
                                                className="h-3.5 w-3.5"
                                                style={{
                                                  color: "#0176d3",
                                                }}
                                              />
                                            </button>
                                            <button
                                              onClick={() =>
                                                removeService(s.id)
                                              }
                                              className="p-1 rounded hover:bg-red-50"
                                              title="Remove"
                                            >
                                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div
                                className="flex flex-col items-center justify-center py-6 rounded-lg"
                                style={{
                                  border: "2px dashed #dddbda",
                                }}
                              >
                                <p
                                  className="slds-text-4"
                                  style={{ color: "#706e6b" }}
                                >
                                  No services added yet.
                                </p>
                                <p
                                  className="slds-text-3 mt-0.5"
                                  style={{ color: "#706e6b" }}
                                >
                                  Click \"Add\" to select services.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })()}
                </div>

                {/* Footer */}
                <DialogFooter
                  className="px-6 py-4 border-t flex-shrink-0 flex justify-between items-center"
                  style={{
                    borderColor: "#dddbda",
                  }}
                >
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingPlanId(null)
                      resetAddPlanModal()
                    }}
                    className="h-9 px-4 rounded-full slds-text-4"
                    style={{
                      borderColor: "#dddbda",
                      color: "#706e6b",
                    }}
                  >
                    Cancel
                  </Button>
                  <div className="flex items-center gap-2">
                    {addPlanTab !== "overview" && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (addPlanTab === "services") {
                            setAddPlanTab("plan-details")
                          } else {
                            setAddPlanTab("overview")
                          }
                        }}
                        className="h-9 px-4 rounded-full slds-text-4"
                        style={{
                          borderColor: "#dddbda",
                          color: "var(--slds-g-color-text-default)",
                        }}
                      >
                        Back
                      </Button>
                    )}
                    {addPlanTab === "overview" ||
                    (addPlanTab === "plan-details" &&
                      planForm.planType === "Academic Service Plan") ? (
                      <Button
                        onClick={() => {
                          const isASP =
                            planForm.planType === "Academic Service Plan"
                          if (addPlanTab === "overview") {
                            setAddPlanTab("plan-details")
                          } else if (addPlanTab === "plan-details" && isASP) {
                            setAddPlanTab("services")
                          }
                        }}
                        className="h-9 px-4 rounded-full slds-text-4 text-white"
                        style={{ backgroundColor: "#145F33" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#0e4524")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#145F33")
                        }
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          const isASPValid =
                            planForm.planType !== "Academic Service Plan" ||
                            (planForm.asp_school && planForm.asp_gradeAtStart)
                          if (
                            !planForm.planType ||
                            !planForm.startDate ||
                            (memberOptions && !(planForm as any).member) ||
                            isStudyTimeInvalid ||
                            !isASPValid
                          )
                            return

                          if (editingPlanId !== null) {
                            // ── Update existing plan ──────────────────────────
                            setSupplementalPlans((prev) =>
                              prev.map((p) =>
                                p.id === editingPlanId
                                  ? {
                                      ...p,
                                      planType: planForm.planType,
                                      startDate: planForm.startDate,
                                      endDate: planForm.endDate || "",
                                      reEvaluationDate:
                                        planForm.reEvalDates.filter(
                                          Boolean,
                                        )[0] || "",
                                      description: planForm.description,
                                      ...(memberOptions
                                        ? {
                                            member:
                                              (planForm as any).member || "",
                                          }
                                        : {}),
                                      ...studyTimePlanRecordFields(planForm),
                                    }
                                  : p,
                              ),
                            )
                            setEditingPlanId(null)
                            resetAddPlanModal()
                          } else {
                            // ── Create new plan ───────────────────────────────
                            handleSavePlanModal()
                          }
                        }}
                        disabled={
                          !planForm.planType ||
                          !planForm.startDate ||
                          (memberOptions && !(planForm as any).member) ||
                          isStudyTimeInvalid ||
                          (planForm.planType === "Academic Service Plan" &&
                            (!planForm.asp_school ||
                              !planForm.asp_gradeAtStart))
                        }
                        className="h-9 px-4 rounded-full slds-text-4 text-white"
                        style={{
                          backgroundColor:
                            !planForm.planType ||
                            !planForm.startDate ||
                            (memberOptions && !(planForm as any).member) ||
                            isStudyTimeInvalid ||
                            (planForm.planType === "Academic Service Plan" &&
                              (!planForm.asp_school ||
                                !planForm.asp_gradeAtStart))
                              ? "var(--slds-g-color-neutral-95)"
                              : "#145F33",
                          color:
                            !planForm.planType ||
                            !planForm.startDate ||
                            (memberOptions && !(planForm as any).member) ||
                            isStudyTimeInvalid ||
                            (planForm.planType === "Academic Service Plan" &&
                              (!planForm.asp_school ||
                                !planForm.asp_gradeAtStart))
                              ? "#706e6b"
                              : "white",
                        }}
                        onMouseEnter={(e) => {
                          const isValid =
                            planForm.planType &&
                            planForm.startDate &&
                            !isStudyTimeInvalid &&
                            (planForm.planType !== "Academic Service Plan" ||
                              (planForm.asp_school &&
                                planForm.asp_gradeAtStart))
                          if (isValid)
                            (e.currentTarget as HTMLElement).style.backgroundColor =
                              "#0e4524"
                        }}
                        onMouseLeave={(e) => {
                          const isValid =
                            planForm.planType &&
                            planForm.startDate &&
                            !isStudyTimeInvalid &&
                            (planForm.planType !== "Academic Service Plan" ||
                              (planForm.asp_school &&
                                planForm.asp_gradeAtStart))
                          if (isValid)
                            (e.currentTarget as HTMLElement).style.backgroundColor =
                              "#145F33"
                        }}
                      >
                        {editingPlanId !== null ? "Update Plan" : "Save Plan"}
                      </Button>
                    )}
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {plainPlansLabel && (
              <Card variant="section">
                <CardHeader
                  size="sm"
                  separated
                  className="flex items-center justify-between gap-2"
                >
                  <CardTitle size="sm">Plans</CardTitle>
                  <Button size="sm" onClick={() => setIsAddPlanModalOpen(true)}>
                    <Plus aria-hidden="true" />
                    Add Plan
                  </Button>
                </CardHeader>
                {supplementalPlans.length === 0 ? (
                  <div className="p-4">
                    <EmptyState
                      icon={FileText}
                      title="No plans yet"
                      description="Use Add Plan to create one."
                      className="py-6"
                    />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <DSTable
                      className="table-fixed"
                      style={{ minWidth: showMemberColumn ? "860px" : "760px" }}
                    >
                      <TableHeader>
                        <TableRow>
                          <TableHead
                            variant="slds"
                            size="md"
                            className={showMemberColumn ? "w-[10%]" : "w-[11%]"}
                          >
                            START DATE
                          </TableHead>
                          {showMemberColumn && (
                            <TableHead
                              variant="slds"
                              size="md"
                              className="w-[13%]"
                            >
                              MEMBERS
                            </TableHead>
                          )}
                          <TableHead
                            variant="slds"
                            size="md"
                            className={showMemberColumn ? "w-[17%]" : "w-[19%]"}
                          >
                            PLAN TYPE
                          </TableHead>
                          <TableHead
                            variant="slds"
                            size="md"
                            className={showMemberColumn ? "w-[32%]" : "w-[38%]"}
                          >
                            DESCRIPTION
                          </TableHead>
                          <TableHead
                            variant="slds"
                            size="md"
                            className={
                              showMemberColumn
                                ? "w-[11%] whitespace-normal"
                                : "w-[12%] whitespace-normal"
                            }
                          >
                            RE-EVALUATION DATE
                          </TableHead>
                          <TableHead
                            variant="slds"
                            size="md"
                            className={showMemberColumn ? "w-[9%]" : "w-[10%]"}
                          >
                            END DATE
                          </TableHead>
                          <TableHead
                            variant="slds"
                            size="md"
                            className="w-[8%] text-right"
                          >
                            ACTIONS
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      {/* All body cells use the design-system secondary text color. */}
                      <TableBody className="text-[var(--slds-g-color-text-weak)]">
                        {supplementalPlans.map((plan: any) => (
                          <TableRow key={plan.id}>
                            <TableCell className="px-4 whitespace-nowrap">
                              {isoToMdy(plan.startDate) || plan.startDate}
                            </TableCell>
                            {showMemberColumn && (
                              <TableCell className="px-4">
                                <OverflowList
                                  maxVisible={1}
                                  label="Members"
                                  items={String(plan.member ?? "").split(", ").filter(Boolean)}
                                />
                              </TableCell>
                            )}
                            <TableCell className="px-4 whitespace-normal">
                              <button
                                type="button"
                                onClick={() => openEditPlan(plan)}
                                className="text-left font-medium hover:underline focus-visible:underline outline-none"
                                style={{
                                  color: "var(--slds-g-color-text-default)",
                                  fontSize: "inherit",
                                }}
                                aria-label={`Open ${plan.planType}${
                                  plan.member ? ` for ${plan.member}` : ""
                                }`}
                              >
                                {plan.planType}
                              </button>
                            </TableCell>
                            <TableCell className="px-4 whitespace-normal">
                              {plan.description}
                            </TableCell>
                            <TableCell className="px-4 whitespace-nowrap">
                              {isoToMdy(plan.reEvaluationDate) ||
                                plan.reEvaluationDate ||
                                "\u2014"}
                            </TableCell>
                            <TableCell className="px-4 whitespace-nowrap">
                              {isoToMdy(plan.endDate) ||
                                plan.endDate ||
                                "\u2014"}
                            </TableCell>
                            <TableCell className="px-4">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  aria-label={`Edit ${plan.planType}`}
                                  title="Edit Plan"
                                  onClick={() => openEditPlan(plan)}
                                >
                                  <Pencil aria-hidden="true" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  aria-label={`Delete ${plan.planType}`}
                                  title="Delete Plan"
                                  className="text-[#c23934] hover:text-[#c23934]"
                                  onClick={() => handleDeletePlan(plan.id)}
                                >
                                  <Trash2 aria-hidden="true" />
                                </Button>
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
            {!plainPlansLabel && (
              <>
                {/* Supplemental Plans Table */}
                <div
                  className="rounded overflow-hidden"
                  style={{
                    border: "1px solid #dddbda",
                  }}
                >
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
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom: "1px solid #dddbda",
                              width: "12%",
                            }}
                          >
                            Start Date
                          </th>
                          {showMemberColumn && (
                            <th
                              className="px-3 py-2 text-left font-semibold text-[#080707]"
                              style={{
                                borderBottom: "1px solid #dddbda",
                                width: "14%",
                              }}
                            >
                              Member
                            </th>
                          )}
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom: "1px solid #dddbda",
                              width: "13%",
                            }}
                          >
                            Plan Type
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom: "1px solid #dddbda",
                              width: "30%",
                            }}
                          >
                            Description
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom: "1px solid #dddbda",
                              width: "13%",
                            }}
                          >
                            Re-Evaluation Date
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom: "1px solid #dddbda",
                              width: "12%",
                            }}
                          >
                            End Date
                          </th>
                          <th
                            className="px-3 py-2 text-right font-semibold text-[#080707]"
                            style={{
                              borderBottom: "1px solid #dddbda",
                              width: "10%",
                            }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {supplementalPlans.map((plan, index) => (
                          <tr
                            key={plan.id}
                            style={{
                              borderBottom:
                                index < supplementalPlans.length - 1
                                  ? "1px solid #dddbda"
                                  : "none",
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                            }}
                          >
                            <td className="px-3 py-3 text-[#080707]">
                              {plan.startDate}
                            </td>
                            {showMemberColumn && (
                              <td className="px-3 py-3 text-[#080707]">
                                {plan.member || "\u2014"}
                              </td>
                            )}
                            <td className="px-3 py-3 text-[#080707]">
                              {plan.planType}
                            </td>
                            <td className="px-3 py-3 text-[#706e6b]">
                              {plan.description}
                            </td>
                            <td className="px-3 py-3 text-[#080707]">
                              {plan.reEvaluationDate}
                            </td>
                            <td className="px-3 py-3 text-[#080707]">
                              {plan.endDate}
                            </td>
                            <td className="px-3 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  className="text-[#706e6b] hover:text-[#3e3e3c] text-[13px]"
                                  title="Edit Plan"
                                  onClick={() => {
                                    // Pre-fill 3-tab modal with existing plan data
                                    setPlanForm((f) => ({
                                      ...f,
                                      planType: plan.planType || "",
                                      startDate: plan.startDate || "",
                                      endDate: (plan as any).endDate || "",
                                      reEvalDates: [
                                        plan.reEvaluationDate || "",
                                        (plan as any).reEvalDate2 || "",
                                        (plan as any).reEvalDate3 || "",
                                      ],
                                      description: plan.description || "",
                                      ...((plan as any).studyTime ?? {}),
                                    }))
                                    setEditingPlanId(plan.id)
                                    setAddPlanTab("overview")
                                    setIsAddPlanModalOpen(true)
                                  }}
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  className="text-[#c23934] hover:text-[#8a2a27] text-[13px]"
                                  onClick={() => handleDeletePlan(plan.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Edit Plan is handled by the 3-tab Add/Edit Plan modal above */}
          </div>
        )}

      {/* Trauma History Tab Content */}
    </>
  )
}
