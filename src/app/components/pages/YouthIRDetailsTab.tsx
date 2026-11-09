import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
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
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
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
  AlertCircle,
  Clock,
  MapPin,
  CheckCircle,
  Pencil,
  Edit2,
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
} from "@/app/lib/lucide-icons";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../ui/card";

const LOCATION_OPTIONS = [
  "Campus",
  "School",
  "Community",
  "Pass",
  "Work",
  "Agency Vehicle",
  "Home",
  "Agency Trip",
  "Other",
];

const INCIDENT_ROLES = [
  "Restraint Consultant",
  "Youth Involved",
  "Staff Involved",
  "Witness",
  "DCFS Hotline Operator",
  "Police Officer",
  "School Personnel",
  "School",
  "Other",
];

const INCIDENT_TYPES = [
  "Verbal Aggression",
  "Suspended from Mercy Home",
  "Admitted to Inpatient Substance Abuse Program",
  "Substance Use",
  "Contraband – Drugs, Alcohol, or Paraphernalia",
  "Contraband – Weapon",
  "Contraband – Pornography",
  "Contraband – Other",
  "Contraband – Stolen Property",
  "Witnessed a Crime Off Campus",
  "Committed a Crime",
  "Arrest",
  "Vehicle Accident",
  "Threatened Staff",
  "Threatened Peer(s)",
  "Threatened Other(s)",
  "Hospitalization – Medical",
  "Hospitalization – Psychiatric",
  "Problematic Sexual Behavior",
  "Accidental Injury",
  "Alleged Victim of a Crime",
  "Theft",
  "Damage to Property",
  "Physical Aggression Toward Staff",
  "AWOL – Fewer Than 24 Hours",
  "Physical Aggression Toward Peer(s)",
  "Physical Aggression Toward Other(s)",
  "Smoking in Restricted Area",
  "Fire",
  "Suicidal Ideation",
  "Suicide Attempt",
  "Self‑Harm",
  "AWOL – More Than 24 Hours",
  "DCFS Hotline Call",
  "In‑School Suspension",
  "Out‑of‑School Suspension",
  "Expulsion",
  "Sent Home from School",
  "Restorative School Intervention",
  "Other School Incident",
  "Guest Policy Violation",
  "Self‑Harm Ideation",
  "ER Visit",
];

interface YouthIRDetailsTabProps {
  activeTab: any;
  constituent: any;
  constituentId: any;
  constituents: any;
  currentIndividual: any;
  currentLegalInvolvement: any;
  currentPersonContacted: any;
  days: any;
  debriefSectionRequired: any;
  durationDays: any;
  durationHours: any;
  durationMinutes: any;
  durationSeconds: any;
  editingIndividualId: any;
  editingLegalInvolvementId: any;
  editingPersonContactedId: any;
  end: any;
  endDate: any;
  endTimeHours: any;
  endTimeMinutes: any;
  endTimeSeconds: any;
  getYouthInvolved: any;
  handleAddIndividual: any;
  handleAddLegalInvolvement: any;
  handleAddPersonContacted: any;
  handleConstituentSelect: any;
  handleDeleteIndividual: any;
  handleDeleteLegalInvolvement: any;
  handleDeletePersonContacted: any;
  handleEditIndividual: any;
  handleEditLegalInvolvement: any;
  handleEditPersonContacted: any;
  handleIncidentTypeToggle: any;
  handleLocationToggle: any;
  handleSaveIndividual: any;
  handleSaveLegalInvolvement: any;
  handleSavePersonContacted: any;
  hours: any;
  individuals: any;
  initials: any;
  isAddingIndividual: any;
  isAddingLegalInvolvement: any;
  isAddingPersonContacted: any;
  legalInvolvements: any;
  minutes: any;
  otherLocation: any;
  overviewNarrative: any;
  personsContacted: any;
  seconds: any;
  selectedIncidentTypes: any;
  selectedLocations: any;
  selectedSchool: any;
  setCurrentIndividual: any;
  setCurrentLegalInvolvement: any;
  setCurrentPersonContacted: any;
  setDebriefSectionRequired: any;
  setDurationDays: any;
  setDurationHours: any;
  setDurationMinutes: any;
  setDurationSeconds: any;
  setEditingIndividualId: any;
  setEditingLegalInvolvementId: any;
  setEditingPersonContactedId: any;
  setEndDate: any;
  setEndTimeHours: any;
  setEndTimeMinutes: any;
  setEndTimeSeconds: any;
  setIsAddingIndividual: any;
  setIsAddingLegalInvolvement: any;
  setIsAddingPersonContacted: any;
  setOtherLocation: any;
  setOverviewNarrative: any;
  setSelectedSchool: any;
  setStartDate: any;
  setStartTimeHours: any;
  setStartTimeMinutes: any;
  setStartTimeSeconds: any;
  showOtherLocation: any;
  showSchoolField: any;
  start: any;
  startDate: any;
  startTimeHours: any;
  startTimeMinutes: any;
  startTimeSeconds: any;
  youth: any;
  youthId: any;
}

export function YouthIRDetailsTab({
  activeTab,
  constituent,
  constituentId,
  constituents,
  currentIndividual,
  currentLegalInvolvement,
  currentPersonContacted,
  days,
  debriefSectionRequired,
  durationDays,
  durationHours,
  durationMinutes,
  durationSeconds,
  editingIndividualId,
  editingLegalInvolvementId,
  editingPersonContactedId,
  end,
  endDate,
  endTimeHours,
  endTimeMinutes,
  endTimeSeconds,
  getYouthInvolved,
  handleAddIndividual,
  handleAddLegalInvolvement,
  handleAddPersonContacted,
  handleConstituentSelect,
  handleDeleteIndividual,
  handleDeleteLegalInvolvement,
  handleDeletePersonContacted,
  handleEditIndividual,
  handleEditLegalInvolvement,
  handleEditPersonContacted,
  handleIncidentTypeToggle,
  handleLocationToggle,
  handleSaveIndividual,
  handleSaveLegalInvolvement,
  handleSavePersonContacted,
  hours,
  individuals,
  initials,
  isAddingIndividual,
  isAddingLegalInvolvement,
  isAddingPersonContacted,
  legalInvolvements,
  minutes,
  otherLocation,
  overviewNarrative,
  personsContacted,
  seconds,
  selectedIncidentTypes,
  selectedLocations,
  selectedSchool,
  setCurrentIndividual,
  setCurrentLegalInvolvement,
  setCurrentPersonContacted,
  setDebriefSectionRequired,
  setDurationDays,
  setDurationHours,
  setDurationMinutes,
  setDurationSeconds,
  setEditingIndividualId,
  setEditingLegalInvolvementId,
  setEditingPersonContactedId,
  setEndDate,
  setEndTimeHours,
  setEndTimeMinutes,
  setEndTimeSeconds,
  setIsAddingIndividual,
  setIsAddingLegalInvolvement,
  setIsAddingPersonContacted,
  setOtherLocation,
  setOverviewNarrative,
  setSelectedSchool,
  setStartDate,
  setStartTimeHours,
  setStartTimeMinutes,
  setStartTimeSeconds,
  showOtherLocation,
  showSchoolField,
  start,
  startDate,
  startTimeHours,
  startTimeMinutes,
  startTimeSeconds,
  youth,
  youthId,
}: YouthIRDetailsTabProps) {
  return (
    <>
      {activeTab === "details" && (
        <Card
          className="shadow-sm"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
            border:
              "1px solid var(--slds-g-color-border-base-1)",
            borderRadius: "var(--slds-c-card-radius-border)",
          }}
        >
          <CardHeader
            style={{
              borderBottom: "1px solid #e0e5ee",
              paddingTop: "12px",
              paddingBottom: "12px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CardTitle
              className="text-base font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
                fontSize: "0.8rem",
                margin: 0,
                lineHeight: 1.2,
                display: "flex",
                alignItems: "center",
              }}
            >
              Incident Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Incident Section */}
            <div className="pt-4">
              <h3
                className="text-sm font-semibold mb-4"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Overall Incident
              </h3>

              <div className="grid grid-cols-2 gap-6">
                {/* Start Date/Time */}
                <div>
                  <label
                    className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Start Date & Time{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <DateInput
                      value={isoToMdy(startDate)}
                      onChange={(v) =>
                        ((e) => setStartDate(e.target.value))({
                          target: { value: mdyToIso(v) },
                        })
                      }
                      className="h-9 text-sm flex-1 px-3 py-2"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                      required
                    />
                    <Input
                      type="time"
                      value={
                        startTimeHours && startTimeMinutes
                          ? `${startTimeHours.padStart(2, "0")}:${startTimeMinutes.padStart(2, "0")}:${startTimeSeconds.padStart(2, "0")}`
                          : ""
                      }
                      onChange={(e) => {
                        if (e.target.value) {
                          const [
                            hours,
                            minutes,
                            seconds = "00",
                          ] = e.target.value.split(":");
                          setStartTimeHours(hours);
                          setStartTimeMinutes(minutes);
                          setStartTimeSeconds(seconds);
                        }
                      }}
                      step="1"
                      className="h-9 text-sm w-40 pl-3 pr-10 py-2"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                      required
                    />
                  </div>
                </div>

                {/* End Date/Time */}
                <div>
                  <label
                    className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    End Date & Time
                  </label>
                  <div className="flex items-center gap-3">
                    <DateInput
                      value={isoToMdy(endDate)}
                      onChange={(v) =>
                        ((e) => setEndDate(e.target.value))({
                          target: { value: mdyToIso(v) },
                        })
                      }
                      className="h-9 text-sm flex-1 px-3 py-2"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    />
                    <Input
                      type="time"
                      value={
                        endTimeHours && endTimeMinutes
                          ? `${endTimeHours.padStart(2, "0")}:${endTimeMinutes.padStart(2, "0")}:${endTimeSeconds.padStart(2, "0")}`
                          : ""
                      }
                      onChange={(e) => {
                        if (e.target.value) {
                          const [
                            hours,
                            minutes,
                            seconds = "00",
                          ] = e.target.value.split(":");
                          setEndTimeHours(hours);
                          setEndTimeMinutes(minutes);
                          setEndTimeSeconds(seconds);
                        }
                      }}
                      step="1"
                      className="h-9 text-sm w-40 pl-3 pr-10 py-2"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="mt-6">
                <label
                  className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Duration of Incident
                </label>
                <div
                  className="flex items-center gap-2 p-3 rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min="0"
                      value={durationDays}
                      onChange={(e) =>
                        setDurationDays(e.target.value)
                      }
                      className="h-8 w-16 text-sm text-center"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor: "white",
                      }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      days
                    </span>
                  </div>
                  <span
                    className="text-sm"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    :
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min="0"
                      max="23"
                      value={durationHours}
                      onChange={(e) =>
                        setDurationHours(e.target.value)
                      }
                      className="h-8 w-16 text-sm text-center"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor: "white",
                      }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      hrs
                    </span>
                  </div>
                  <span
                    className="text-sm"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    :
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={durationMinutes}
                      onChange={(e) =>
                        setDurationMinutes(e.target.value)
                      }
                      className="h-8 w-16 text-sm text-center"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor: "white",
                      }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      min
                    </span>
                  </div>
                  <span
                    className="text-sm"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    :
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={durationSeconds}
                      onChange={(e) =>
                        setDurationSeconds(e.target.value)
                      }
                      className="h-8 w-16 text-sm text-center"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor: "white",
                      }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      sec
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div
              className="w-full"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            />

            {/* Individuals Involved Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Individuals Involved
                </h3>
                <Button
                  size="sm"
                  onClick={handleAddIndividual}
                  disabled={isAddingIndividual}
                  style={{
                    backgroundColor:
                      "var(--color-brand-primary)",
                    color: "white",
                    borderRadius: "9999px",
                  }}
                  className="h-8 px-3 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Individual
                </Button>
              </div>

              {/* Instructional Text */}
              <div
                className="mb-4 p-3 rounded flex items-start gap-2"
                style={{
                  backgroundColor: "#E8F4F8",
                  border: "1px solid #54698D",
                }}
              >
                <AlertCircle
                  className="h-4 w-4 mt-0.5 flex-shrink-0"
                  style={{ color: "#54698D" }}
                />
                <p
                  className="text-sm"
                  style={{ color: "#54698D" }}
                >
                  Add all constituents involved in this incident
                  (Youth, Staff, Guardian, School Personnel,
                  Employer, …). For non‑Youth constituents, a
                  brief statement describing their involvement
                  should be added to the 'Comment' field.
                </p>
              </div>

              {/* Add/Edit Individual Form */}
              {isAddingIndividual && (
                <div
                  className="mb-4 p-4 rounded border"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  <h4
                    className="text-sm font-semibold mb-3"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {editingIndividualId
                      ? "Edit Individual"
                      : "Add Individual"}
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Constituent */}
                    <div>
                      <label
                        className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Constituent{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={
                          currentIndividual.constituentId || ""
                        }
                        onChange={handleConstituentSelect}
                        className="w-full h-9 text-sm px-3 rounded"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor: "white",
                        }}
                      >
                        <option value="">
                          Select Constituent...
                        </option>
                        {constituents.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.type})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Program */}
                    <div>
                      <label
                        className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Program
                      </label>
                      <Input
                        value={currentIndividual.program}
                        readOnly
                        className="h-9 text-sm"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor: "#F3F3F3",
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                        placeholder={
                          currentIndividual.constituentType ===
                          "Youth"
                            ? "Auto-populated"
                            : "N/A"
                        }
                      />
                    </div>

                    {/* Incident Role */}
                    <div>
                      <label
                        className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Incident Role{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={currentIndividual.incidentRole}
                        onChange={(e) =>
                          setCurrentIndividual({
                            ...currentIndividual,
                            incidentRole: e.target.value,
                          })
                        }
                        className="w-full h-9 text-sm px-3 rounded"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor: "white",
                        }}
                      >
                        <option value="">Select Role...</option>
                        {INCIDENT_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Other Role Text */}
                    {currentIndividual.incidentRole ===
                      "Other" && (
                      <div>
                        <label
                          className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Specify Role{" "}
                          <span className="text-red-600">
                            *
                          </span>
                        </label>
                        <Input
                          value={
                            currentIndividual.incidentRoleOther
                          }
                          onChange={(e) =>
                            setCurrentIndividual({
                              ...currentIndividual,
                              incidentRoleOther: e.target.value,
                            })
                          }
                          placeholder="Enter role..."
                          className="h-9 text-sm"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        />
                      </div>
                    )}

                    {/* Injured Checkbox */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="injured"
                        checked={currentIndividual.injured}
                        onChange={(e) =>
                          setCurrentIndividual({
                            ...currentIndividual,
                            injured: e.target.checked,
                            hrNotifiedDate: e.target.checked
                              ? currentIndividual.hrNotifiedDate
                              : "",
                          })
                        }
                        className="h-4 w-4"
                      />
                      <label
                        htmlFor="injured"
                        className="text-sm font-medium cursor-pointer"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Injured
                      </label>
                    </div>

                    {/* Restraint Checkbox */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="restraint"
                        checked={currentIndividual.restraint}
                        onChange={(e) =>
                          setCurrentIndividual({
                            ...currentIndividual,
                            restraint: e.target.checked,
                          })
                        }
                        className="h-4 w-4"
                      />
                      <label
                        htmlFor="restraint"
                        className="text-sm font-medium cursor-pointer"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Restraint
                      </label>
                    </div>

                    {/* HR Notified Date - Only show when Injured = True AND Incident Role = Staff Involved */}
                    {currentIndividual.injured &&
                      currentIndividual.incidentRole ===
                        "Staff Involved" && (
                        <div>
                          <label
                            className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            HR Notified
                          </label>
                          <DateInput
                            value={isoToMdy(
                              currentIndividual.hrNotifiedDate,
                            )}
                            onChange={(v) =>
                              ((e) =>
                                setCurrentIndividual({
                                  ...currentIndividual,
                                  hrNotifiedDate:
                                    e.target.value,
                                }))({
                                target: { value: mdyToIso(v) },
                              })
                            }
                            className="h-9 text-sm"
                            style={{
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          />
                        </div>
                      )}

                    {/* Comment */}
                    <div className="col-span-2">
                      <label
                        className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Comment
                      </label>
                      <textarea
                        value={currentIndividual.comment}
                        onChange={(e) =>
                          setCurrentIndividual({
                            ...currentIndividual,
                            comment: e.target.value,
                          })
                        }
                        placeholder="Describe their involvement..."
                        rows={2}
                        className="w-full px-3 py-2 text-sm rounded resize-none"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor: "white",
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={handleSaveIndividual}
                      style={{
                        backgroundColor:
                          "var(--color-brand-primary)",
                        color: "white",
                        borderRadius: "9999px",
                      }}
                      className="h-8 px-3 text-xs"
                    >
                      {editingIndividualId ? "Update" : "Add"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsAddingIndividual(false);
                        setEditingIndividualId(null);
                      }}
                      className="h-8 px-3 text-xs"
                      style={{ borderRadius: "9999px" }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Individuals Table */}
              {individuals.length > 0 && (
                <div
                  className="border rounded app-scroll-x"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                >
                  <table className="w-full">
                    <thead
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-alt)",
                      }}
                    >
                      <tr>
                        <th
                          className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Constituent
                        </th>
                        <th
                          className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Program
                        </th>
                        <th
                          className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Incident Role
                        </th>
                        <th
                          className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Injured
                        </th>
                        <th
                          className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Restraint
                        </th>
                        <th
                          className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Comment
                        </th>
                        <th
                          className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {individuals.map((individual) => (
                        <tr
                          key={individual.id}
                          className="border-t"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <td
                            className="px-4 py-3 text-sm"
                            style={{
                              color:
                                "var(--color-brand-primary)",
                            }}
                          >
                            <button className="hover:underline">
                              {individual.constituentName}
                            </button>
                          </td>
                          <td
                            className="px-4 py-3 text-sm"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {individual.program || "—"}
                          </td>
                          <td
                            className="px-4 py-3 text-sm"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {individual.incidentRole === "Other"
                              ? individual.incidentRoleOther
                              : individual.incidentRole}
                          </td>
                          <td
                            className="px-4 py-3 text-sm"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {individual.injured ? "Yes" : "No"}
                          </td>
                          <td
                            className="px-4 py-3 text-sm"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {individual.restraint
                              ? "Yes"
                              : "No"}
                          </td>
                          <td
                            className="px-4 py-3 text-sm"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {individual.comment || "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() =>
                                  handleEditIndividual(
                                    individual,
                                  )
                                }
                                className="p-1 rounded hover:bg-gray-100"
                                title="Edit"
                              >
                                <Edit2
                                  className="h-3.5 w-3.5"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteIndividual(
                                    individual.id,
                                  )
                                }
                                className="p-1 rounded hover:bg-gray-100"
                                title="Delete"
                              >
                                <Trash2
                                  className="h-3.5 w-3.5"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
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

            {/* Divider */}
            <div
              className="w-full"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            />

            {/* Incident Classification Section */}
            <div>
              <h3
                className="text-sm font-semibold mb-4"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Incident Classification
              </h3>

              <div>
                <label
                  className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Incident Type
                </label>
                <div
                  className="border rounded p-4 max-h-60 overflow-y-auto"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                >
                  <p
                    className="slds-text-4"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {selectedIncidentTypes.length > 0 ? (
                      selectedIncidentTypes.join(", ")
                    ) : (
                      <span
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        None selected
                      </span>
                    )}
                  </p>
                </div>

                {/* School Field */}
                {showSchoolField && (
                  <div className="mt-4">
                    <label
                      className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      School
                    </label>
                    <select
                      value={selectedSchool}
                      onChange={(e) =>
                        setSelectedSchool(e.target.value)
                      }
                      className="w-full h-9 text-sm px-3 rounded"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor: "white",
                      }}
                    >
                      <option value="">Select School...</option>
                      {MOCK_SCHOOLS.map((school) => (
                        <option key={school} value={school}>
                          {school}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div
              className="w-full"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            />

            {/* Location Section */}
            <div>
              <div>
                <label
                  className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Location
                </label>
                <div
                  className="border rounded p-4"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                >
                  <p
                    className="slds-text-4"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {selectedLocations.length > 0 ? (
                      selectedLocations.join(", ")
                    ) : (
                      <span
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        None selected
                      </span>
                    )}
                  </p>
                </div>

                {/* Other Location Text */}
                {showOtherLocation && (
                  <div className="mt-4">
                    <label
                      className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Specify Other Location{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <Input
                      value={otherLocation}
                      onChange={(e) =>
                        setOtherLocation(e.target.value)
                      }
                      placeholder="Enter location..."
                      className="h-9 text-sm"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div
              className="w-full"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            />

            {/* Debrief Section Required */}
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="debriefSectionRequired"
                  checked={debriefSectionRequired}
                  onChange={(e) =>
                    setDebriefSectionRequired(e.target.checked)
                  }
                  className="h-4 w-4"
                />
                <label
                  htmlFor="debriefSectionRequired"
                  className="text-sm font-medium cursor-pointer"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Debrief Section Required
                </label>
              </div>
            </div>

            {/* Divider */}
            <div
              className="w-full"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            />

            {/* Overview Narrative Section */}
            <div>
              <h3
                className="text-sm font-semibold mb-2"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Overview Narrative
              </h3>

              <div
                className="mb-3 p-3 rounded flex items-start gap-2"
                style={{
                  backgroundColor: "#E8F4F8",
                  border: "1px solid #54698D",
                }}
              >
                <AlertCircle
                  className="h-4 w-4 mt-0.5 flex-shrink-0"
                  style={{ color: "#54698D" }}
                />
                <div
                  style={{ color: "#54698D", fontSize: "14px" }}
                >
                  <p className="mb-1">
                    Include a brief, 1 – 2 sentence explanation.
                  </p>
                  <p className="mb-1">
                    <strong>Example:</strong> The Youth was
                    escalated in Program. Restraint was needed.
                  </p>
                  <p>
                    To maintain confidentiality, narratives can
                    only contain Youth initials.
                  </p>
                </div>
              </div>

              <textarea
                value={overviewNarrative}
                onChange={(e) =>
                  setOverviewNarrative(e.target.value)
                }
                placeholder="Enter overview narrative..."
                rows={4}
                className="w-full px-3 py-2 text-sm rounded resize-none"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor: "white",
                }}
              />
            </div>

            {/* Divider */}
            <div
              className="w-full"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            />

            {/* Persons Contacted Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Persons Contacted
                </h3>
                <Button
                  size="sm"
                  onClick={handleAddPersonContacted}
                  disabled={isAddingPersonContacted}
                  style={{
                    backgroundColor:
                      "var(--color-brand-primary)",
                    color: "white",
                    borderRadius: "9999px",
                  }}
                  className="h-8 px-3 text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add / Modify
                </Button>
              </div>

              {/* Instructional Text */}
              <div
                className="mb-4 p-3 rounded flex items-start gap-2"
                style={{
                  backgroundColor: "#E8F4F8",
                  border: "1px solid #54698D",
                }}
              >
                <AlertCircle
                  className="h-4 w-4 mt-0.5 flex-shrink-0"
                  style={{ color: "#54698D" }}
                />
                <p
                  className="text-sm"
                  style={{ color: "#54698D" }}
                >
                  Always contact and include the Guardian,
                  Program Manager, Director and On‑call Manager.
                  Inform management via calls or text. If
                  front‑line management cannot be reached,
                  escalate up the chain of command.
                </p>
              </div>

              {/* Add/Edit Person Contacted Form */}
              {isAddingPersonContacted && (
                <div
                  className="mb-4 p-4 rounded border"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  <h4
                    className="text-sm font-semibold mb-3"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {editingPersonContactedId
                      ? "Edit Person Contacted"
                      : "Add Person Contacted"}
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Constituent */}
                    <div>
                      <label
                        className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Constituent{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={
                          currentPersonContacted.constituentId ||
                          ""
                        }
                        onChange={(e) => {
                          const constituentId = parseInt(
                            e.target.value,
                          );
                          const constituent = constituents.find(
                            (c) => c.id === constituentId,
                          );
                          if (constituent) {
                            setCurrentPersonContacted({
                              ...currentPersonContacted,
                              constituentId: constituent.id,
                              constituentName: constituent.name,
                            });
                          }
                        }}
                        className="w-full h-9 text-sm px-3 rounded"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor: "white",
                        }}
                      >
                        <option value="">
                          Select Constituent...
                        </option>
                        {constituents.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Youth */}
                    <div>
                      <label
                        className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Youth
                      </label>
                      <select
                        value={
                          currentPersonContacted.youthId || ""
                        }
                        onChange={(e) => {
                          const youthId = parseInt(
                            e.target.value,
                          );
                          const youth = getYouthInvolved().find(
                            (y) => y.constituentId === youthId,
                          );
                          if (youth) {
                            setCurrentPersonContacted({
                              ...currentPersonContacted,
                              youthId: youth.constituentId,
                              youthName: youth.constituentName,
                            });
                          }
                        }}
                        className="w-full h-9 text-sm px-3 rounded"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor: "white",
                        }}
                      >
                        <option value="">
                          Select Youth...
                        </option>
                        {getYouthInvolved().map((youth) => (
                          <option
                            key={youth.constituentId}
                            value={youth.constituentId}
                          >
                            {youth.constituentName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Relationship */}
                    <div>
                      <label
                        className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Relationship
                      </label>
                      <select
                        value={
                          currentPersonContacted.relationship
                        }
                        onChange={(e) =>
                          setCurrentPersonContacted({
                            ...currentPersonContacted,
                            relationship: e.target.value,
                          })
                        }
                        className="w-full h-9 text-sm px-3 rounded"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor: "white",
                        }}
                      >
                        <option value="">
                          Select Relationship...
                        </option>
                        {RELATIONSHIPS.map((rel) => (
                          <option key={rel} value={rel}>
                            {rel}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Contact Date/Time */}
                    <div>
                      <label
                        className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Contact Date/Time{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <Input
                        type="datetime-local"
                        value={
                          currentPersonContacted.contactDateTime
                        }
                        onChange={(e) =>
                          setCurrentPersonContacted({
                            ...currentPersonContacted,
                            contactDateTime: e.target.value,
                          })
                        }
                        className="h-9 text-sm"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      />
                    </div>

                    {/* Comment */}
                    <div className="col-span-2">
                      <label
                        className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Comment
                      </label>
                      <textarea
                        value={currentPersonContacted.comment}
                        onChange={(e) =>
                          setCurrentPersonContacted({
                            ...currentPersonContacted,
                            comment: e.target.value,
                          })
                        }
                        placeholder="Enter comments..."
                        rows={2}
                        className="w-full px-3 py-2 text-sm rounded resize-none"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor: "white",
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={handleSavePersonContacted}
                      style={{
                        backgroundColor:
                          "var(--color-brand-primary)",
                        color: "white",
                        borderRadius: "9999px",
                      }}
                      className="h-8 px-3 text-xs"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsAddingPersonContacted(false);
                        setEditingPersonContactedId(null);
                      }}
                      className="h-8 px-3 text-xs"
                      style={{ borderRadius: "9999px" }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Persons Contacted Table */}
              {personsContacted.length > 0 ? (
                <div
                  className="border rounded app-scroll-x"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                >
                  <table className="w-full">
                    <thead
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-alt)",
                      }}
                    >
                      <tr>
                        <th
                          className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Name
                        </th>
                        <th
                          className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Youth
                        </th>
                        <th
                          className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Relationship
                        </th>
                        <th
                          className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Contact Date/Time
                        </th>
                        <th
                          className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Comment
                        </th>
                        <th
                          className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {personsContacted.map((person) => (
                        <tr
                          key={person.id}
                          className="border-t"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <td
                            className="px-4 py-3 text-sm"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {person.constituentName}
                          </td>
                          <td
                            className="px-4 py-3 text-sm"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {person.youthName || "—"}
                          </td>
                          <td
                            className="px-4 py-3 text-sm"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {person.relationship || "—"}
                          </td>
                          <td
                            className="px-4 py-3 text-sm"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {person.contactDateTime
                              ? new Date(
                                  person.contactDateTime,
                                ).toLocaleString()
                              : "—"}
                          </td>
                          <td
                            className="px-4 py-3 text-sm"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {person.comment || "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() =>
                                  handleEditPersonContacted(
                                    person,
                                  )
                                }
                                className="p-1 rounded hover:bg-gray-100"
                                title="Edit"
                              >
                                <Edit2
                                  className="h-3.5 w-3.5"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeletePersonContacted(
                                    person.id,
                                  )
                                }
                                className="p-1 rounded hover:bg-gray-100"
                                title="Delete"
                              >
                                <Trash2
                                  className="h-3.5 w-3.5"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
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
                  className="text-center py-8 border rounded"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  No persons contacted yet. Click "Add / Modify"
                  to add a person.
                </div>
              )}
            </div>

            {/* Divider */}
            <div
              className="w-full"
              style={{
                borderTop:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            />

            {/* Associated Legal Involvement Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Associated Legal Involvement
                </h3>
                <Button
                  size="sm"
                  onClick={handleAddLegalInvolvement}
                  disabled={isAddingLegalInvolvement}
                  style={{
                    backgroundColor:
                      "var(--color-brand-primary)",
                    color: "white",
                    borderRadius: "9999px",
                  }}
                  className="h-8 px-3 text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add / Modify
                </Button>
              </div>

              {/* Add/Edit Legal Involvement Form */}
              {isAddingLegalInvolvement && (
                <div
                  className="mb-4 p-4 rounded border"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  <h4
                    className="text-sm font-semibold mb-3"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {editingLegalInvolvementId
                      ? "Edit Legal Involvement"
                      : "Add Legal Involvement"}
                  </h4>

                  <div className="space-y-4">
                    {/* Constituent */}
                    <div>
                      <label
                        className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Constituent{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={
                          currentLegalInvolvement.constituentId ||
                          ""
                        }
                        onChange={(e) => {
                          const constituentId = parseInt(
                            e.target.value,
                          );
                          const constituent = constituents.find(
                            (c) => c.id === constituentId,
                          );
                          if (constituent) {
                            setCurrentLegalInvolvement({
                              ...currentLegalInvolvement,
                              constituentId: constituent.id,
                              constituentName: constituent.name,
                            });
                          }
                        }}
                        className="w-full h-9 text-sm px-3 rounded"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor: "white",
                        }}
                      >
                        <option value="">
                          Select Constituent...
                        </option>
                        {constituents.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Youth Name */}
                    <div>
                      <label
                        className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Youth Name
                      </label>
                      <select
                        value={
                          currentLegalInvolvement.youthId || ""
                        }
                        onChange={(e) => {
                          const youthId = parseInt(
                            e.target.value,
                          );
                          const youth = getYouthInvolved().find(
                            (y) => y.constituentId === youthId,
                          );
                          if (youth) {
                            setCurrentLegalInvolvement({
                              ...currentLegalInvolvement,
                              youthId: youth.constituentId,
                              youthName: youth.constituentName,
                            });
                          } else if (!e.target.value) {
                            setCurrentLegalInvolvement({
                              ...currentLegalInvolvement,
                              youthId: null,
                              youthName: "",
                            });
                          }
                        }}
                        className="w-full h-9 text-sm px-3 rounded"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor: "white",
                        }}
                      >
                        <option value="">
                          Select Youth...
                        </option>
                        {getYouthInvolved().map((youth) => (
                          <option
                            key={youth.constituentId}
                            value={youth.constituentId}
                          >
                            {youth.constituentName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Comment */}
                    <div>
                      <label
                        className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Comment
                      </label>
                      <textarea
                        value={currentLegalInvolvement.comment}
                        onChange={(e) =>
                          setCurrentLegalInvolvement({
                            ...currentLegalInvolvement,
                            comment: e.target.value,
                          })
                        }
                        placeholder="Enter comments..."
                        rows={3}
                        className="w-full px-3 py-2 text-sm rounded resize-none"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor: "white",
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={handleSaveLegalInvolvement}
                      style={{
                        backgroundColor:
                          "var(--color-brand-primary)",
                        color: "white",
                        borderRadius: "9999px",
                      }}
                      className="h-8 px-3 text-xs"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsAddingLegalInvolvement(false);
                        setEditingLegalInvolvementId(null);
                      }}
                      className="h-8 px-3 text-xs"
                      style={{ borderRadius: "9999px" }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Legal Involvement Table */}
              {legalInvolvements.length > 0 ? (
                <div
                  className="border rounded app-scroll-x"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                >
                  <table className="w-full">
                    <thead
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-alt)",
                      }}
                    >
                      <tr>
                        <th
                          className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Legal Involvement
                        </th>
                        <th
                          className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Youth Name
                        </th>
                        <th
                          className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Comment
                        </th>
                        <th
                          className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {legalInvolvements.map((involvement) => (
                        <tr
                          key={involvement.id}
                          className="border-t"
                          style={{
                            borderColor:
                              "var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <td
                            className="px-4 py-3 text-sm"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {involvement.constituentName}
                          </td>
                          <td
                            className="px-4 py-3 text-sm"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {involvement.youthName || "—"}
                          </td>
                          <td
                            className="px-4 py-3 text-sm"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {involvement.comment || "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() =>
                                  handleEditLegalInvolvement(
                                    involvement,
                                  )
                                }
                                className="p-1 rounded hover:bg-gray-100"
                                title="Edit"
                              >
                                <Edit2
                                  className="h-3.5 w-3.5"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteLegalInvolvement(
                                    involvement.id,
                                  )
                                }
                                className="p-1 rounded hover:bg-gray-100"
                                title="Delete"
                              >
                                <Trash2
                                  className="h-3.5 w-3.5"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
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
                  className="text-center py-8 border rounded"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  No legal involvements yet. Click "Add /
                  Modify" to add one.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview > Debrief Tab */}
    </>
  );
}