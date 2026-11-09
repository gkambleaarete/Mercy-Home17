import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { VisuallyHidden } from "../ui/visually-hidden";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Checkbox } from "../ui/checkbox";
import {
  Save,
  Check,
  Stethoscope,
  AlertTriangle,
  Plus,
  X,
  AlertCircle,
  Users,
  Pencil,
} from "@/app/lib/lucide-icons";
import { AddEditYouthDialog } from "./AddEditYouthDialog";
import { useState } from "react";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface IncidentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incidentYouth: any;
  program: any;
  incidentTab: string;
  setIncidentTab: (tab: string) => void;
  incidentType: string;
  setIncidentType: (type: string) => void;
  incidentLocation: string;
  setIncidentLocation: (location: string) => void;
  incidentStartDate: string;
  setIncidentStartDate: (date: string) => void;
  incidentStartTime: string;
  setIncidentStartTime: (time: string) => void;
  incidentEndDate: string;
  setIncidentEndDate: (date: string) => void;
  incidentEndTime: string;
  setIncidentEndTime: (time: string) => void;
  incidentOverview: string;
  setIncidentOverview: (overview: string) => void;
  incidentNarrative: string;
  setIncidentNarrative: (narrative: string) => void;
  incidentResponse: string;
  setIncidentResponse: (response: string) => void;
  incidentPersonsContacted: Array<{
    id: number;
    name: string;
    relationship: string;
    contactTime: string;
  }>;
  setIncidentPersonsContacted: (
    persons: Array<{
      id: number;
      name: string;
      relationship: string;
      contactTime: string;
    }>,
  ) => void;
  incidentYouthInjuries: Array<{
    id: number;
    description: string;
    cause: string;
    firstAid: boolean;
    firstAidDetails: string;
  }>;
  setIncidentYouthInjuries: (
    injuries: Array<{
      id: number;
      description: string;
      cause: string;
      firstAid: boolean;
      firstAidDetails: string;
    }>,
  ) => void;
  incidentRestraints: Array<{
    id: number;
    type: string;
    startTime: string;
    endTime: string;
    staffInvolved: string;
    reason: string;
  }>;
  setIncidentRestraints: (
    restraints: Array<{
      id: number;
      type: string;
      startTime: string;
      endTime: string;
      staffInvolved: string;
      reason: string;
    }>,
  ) => void;
  incidentDebriefParticipants: Array<{
    id: number;
    name: string;
    role: string;
    attendedDate: string;
  }>;
  setIncidentDebriefParticipants: (
    participants: Array<{
      id: number;
      name: string;
      role: string;
      attendedDate: string;
    }>,
  ) => void;
  incidentDebriefNotes: string;
  setIncidentDebriefNotes: (notes: string) => void;
  incidentFinalized: boolean;
  incidentYouthList: Array<{
    id: number;
    name: string;
    youthId: string;
    age: string;
    status: string;
    statusColor: string;
    program: string;
    initials: string;
    color: string;
    isPrimary: boolean;
  }>;
  setIncidentYouthList: (
    list: Array<{
      id: number;
      name: string;
      youthId: string;
      age: string;
      status: string;
      statusColor: string;
      program: string;
      initials: string;
      color: string;
      isPrimary: boolean;
    }>,
  ) => void;
  handleCancelIncident: () => void;
  handleSaveIncident: () => void;
  handleFinalizeIncident: () => void;
  canFinalizeIncident: () => boolean;
  handleAddPersonContacted: () => void;
  handleRemovePersonContacted: (id: number) => void;
  handleAddYouthInjury: () => void;
  handleRemoveYouthInjury: (id: number) => void;
  handleAddRestraint: () => void;
  handleRemoveRestraint: (id: number) => void;
  handleAddDebriefParticipant: () => void;
  handleRemoveDebriefParticipant: (id: number) => void;
  handleAddIncidentYouth: () => void;
  handleRemoveIncidentYouth: (id: number) => void;
  handleSetPrimaryYouth: (id: number) => void;
}

export function IncidentDetailsDialog({
  open,
  onOpenChange,
  incidentYouth,
  program,
  incidentTab,
  setIncidentTab,
  incidentType,
  setIncidentType,
  incidentLocation,
  setIncidentLocation,
  incidentStartDate,
  setIncidentStartDate,
  incidentStartTime,
  setIncidentStartTime,
  incidentEndDate,
  setIncidentEndDate,
  incidentEndTime,
  setIncidentEndTime,
  incidentOverview,
  setIncidentOverview,
  incidentNarrative,
  setIncidentNarrative,
  incidentResponse,
  setIncidentResponse,
  incidentPersonsContacted,
  setIncidentPersonsContacted,
  incidentYouthInjuries,
  setIncidentYouthInjuries,
  incidentRestraints,
  setIncidentRestraints,
  incidentDebriefParticipants,
  setIncidentDebriefParticipants,
  incidentDebriefNotes,
  setIncidentDebriefNotes,
  incidentFinalized,
  incidentYouthList,
  setIncidentYouthList,
  handleCancelIncident,
  handleSaveIncident,
  handleFinalizeIncident,
  canFinalizeIncident,
  handleAddPersonContacted,
  handleRemovePersonContacted,
  handleAddYouthInjury,
  handleRemoveYouthInjury,
  handleAddRestraint,
  handleRemoveRestraint,
  handleAddDebriefParticipant,
  handleRemoveDebriefParticipant,
  handleAddIncidentYouth,
  handleRemoveIncidentYouth,
  handleSetPrimaryYouth,
}: IncidentDetailsDialogProps) {
  // State for Add/Edit Youth Dialog
  const [youthDialogOpen, setYouthDialogOpen] = useState(false);
  const [editingYouth, setEditingYouth] = useState<any>(null);

  // "Other Incident Type" conditional field
  const [otherIncidentType, setOtherIncidentType] = useState("");
  const [otherIncidentTypeError, setOtherIncidentTypeError] = useState(false);

  // Get the primary youth for the summary card
  const youthList = incidentYouthList || [];
  const primaryYouth =
    youthList.find((y) => y.isPrimary) ||
    youthList[0] ||
    incidentYouth;

  // Handler to open dialog for adding new youth
  const handleOpenAddYouth = () => {
    setEditingYouth(null);
    setYouthDialogOpen(true);
  };

  // Handler to open dialog for editing existing youth
  const handleOpenEditYouth = (youth: any) => {
    setEditingYouth(youth);
    setYouthDialogOpen(true);
  };

  // Handler to save youth (add or update)
  const handleSaveYouth = (youth: any) => {
    if (editingYouth) {
      // Update existing youth
      const updated = (incidentYouthList || []).map((y) =>
        y.id === youth.id ? youth : y,
      );
      setIncidentYouthList(updated);
    } else {
      // Add new youth
      const newYouth = {
        ...youth,
        isPrimary: (incidentYouthList || []).length === 0, // First youth is primary by default
      };
      setIncidentYouthList([
        ...(incidentYouthList || []),
        newYouth,
      ]);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[95vh] overflow-y-auto p-0">
        {/* Dialog Header */}
        <div
          className="sticky top-0 z-10 px-6 py-4"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <DialogTitle
            className="text-lg font-semibold"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            {incidentType ? (
              <>
                Incident Report{" "}
                <span
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    fontWeight: "normal",
                  }}
                >
                  —{" "}
                  {incidentType
                    .split("-")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1),
                    )
                    .join(" ")}
                </span>
              </>
            ) : (
              "New Incident Report"
            )}
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription>
              Create and manage incident report details
            </DialogDescription>
          </VisuallyHidden>
        </div>

        {/* Incident Summary Card */}
        {primaryYouth && (
          <div
            className="px-6 py-4"
            style={{
              backgroundColor:
                "var(--slds-g-color-background-alt)",
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback
                  className={`text-white text-lg ${primaryYouth.color}`}
                >
                  {primaryYouth.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3
                  className="font-semibold text-lg"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {primaryYouth.name}
                  {incidentYouthList.length > 1 && (
                    <Badge
                      className="ml-2 text-xs px-2 py-0.5"
                      style={{
                        backgroundColor:
                          "var(--color-brand-primary)",
                        color: "white",
                      }}
                    >
                      Primary
                    </Badge>
                  )}
                </h3>
                <div
                  className="flex items-center gap-3 mt-1 text-sm flex-wrap"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  <span>
                    ID:{" "}
                    {primaryYouth.youthId || primaryYouth.id}
                  </span>
                  <span>•</span>
                  <span>Age: {primaryYouth.age}</span>
                  <span>•</span>
                  <Badge
                    className={`${primaryYouth.statusColor} text-xs px-2 py-0.5`}
                  >
                    {primaryYouth.status}
                  </Badge>
                  <span>•</span>
                  <span>
                    {primaryYouth.program || program.name}
                  </span>
                  {incidentYouthList.length > 1 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {incidentYouthList.length} Youth
                        Involved
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full h-8 text-xs"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                  title="View Medical History"
                >
                  <Stethoscope
                    className="h-4 w-4"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  />
                  Medical
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full h-8 text-xs"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                  title="View Safety Alerts"
                >
                  <AlertTriangle
                    className="h-4 w-4"
                    style={{ color: "#E37400" }}
                  />
                  Alerts
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs - Native HTML Buttons */}
        <div
          className="px-6"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => setIncidentTab("general")}
              className="bg-transparent px-0 pb-3 text-sm font-medium transition-colors"
              style={{
                color:
                  incidentTab === "general"
                    ? "var(--color-brand-primary)"
                    : "var(--slds-g-color-text-weak)",
                borderBottom:
                  incidentTab === "general"
                    ? "2px solid var(--color-brand-primary)"
                    : "2px solid transparent",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (incidentTab !== "general") {
                  e.currentTarget.style.color =
                    "var(--slds-g-color-text-default)";
                }
              }}
              onMouseLeave={(e) => {
                if (incidentTab !== "general") {
                  e.currentTarget.style.color =
                    "var(--slds-g-color-text-weak)";
                }
              }}
            >
              General
            </button>
            <button
              type="button"
              onClick={() => setIncidentTab("narrative")}
              className="bg-transparent px-0 pb-3 text-sm font-medium transition-colors"
              style={{
                color:
                  incidentTab === "narrative"
                    ? "var(--color-brand-primary)"
                    : "var(--slds-g-color-text-weak)",
                borderBottom:
                  incidentTab === "narrative"
                    ? "2px solid var(--color-brand-primary)"
                    : "2px solid transparent",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (incidentTab !== "narrative") {
                  e.currentTarget.style.color =
                    "var(--slds-g-color-text-default)";
                }
              }}
              onMouseLeave={(e) => {
                if (incidentTab !== "narrative") {
                  e.currentTarget.style.color =
                    "var(--slds-g-color-text-weak)";
                }
              }}
            >
              Narrative
            </button>
            <button
              type="button"
              onClick={() => setIncidentTab("restraints")}
              className="bg-transparent px-0 pb-3 text-sm font-medium transition-colors"
              style={{
                color:
                  incidentTab === "restraints"
                    ? "var(--color-brand-primary)"
                    : "var(--slds-g-color-text-weak)",
                borderBottom:
                  incidentTab === "restraints"
                    ? "2px solid var(--color-brand-primary)"
                    : "2px solid transparent",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (incidentTab !== "restraints") {
                  e.currentTarget.style.color =
                    "var(--slds-g-color-text-default)";
                }
              }}
              onMouseLeave={(e) => {
                if (incidentTab !== "restraints") {
                  e.currentTarget.style.color =
                    "var(--slds-g-color-text-weak)";
                }
              }}
            >
              Restraints
            </button>
            <button
              type="button"
              onClick={() => setIncidentTab("injuries")}
              className="bg-transparent px-0 pb-3 text-sm font-medium transition-colors"
              style={{
                color:
                  incidentTab === "injuries"
                    ? "var(--color-brand-primary)"
                    : "var(--slds-g-color-text-weak)",
                borderBottom:
                  incidentTab === "injuries"
                    ? "2px solid var(--color-brand-primary)"
                    : "2px solid transparent",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (incidentTab !== "injuries") {
                  e.currentTarget.style.color =
                    "var(--slds-g-color-text-default)";
                }
              }}
              onMouseLeave={(e) => {
                if (incidentTab !== "injuries") {
                  e.currentTarget.style.color =
                    "var(--slds-g-color-text-weak)";
                }
              }}
            >
              Youth Injuries
            </button>
            <button
              type="button"
              onClick={() => setIncidentTab("response")}
              className="bg-transparent px-0 pb-3 text-sm font-medium transition-colors"
              style={{
                color:
                  incidentTab === "response"
                    ? "var(--color-brand-primary)"
                    : "var(--slds-g-color-text-weak)",
                borderBottom:
                  incidentTab === "response"
                    ? "2px solid var(--color-brand-primary)"
                    : "2px solid transparent",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (incidentTab !== "response") {
                  e.currentTarget.style.color =
                    "var(--slds-g-color-text-default)";
                }
              }}
              onMouseLeave={(e) => {
                if (incidentTab !== "response") {
                  e.currentTarget.style.color =
                    "var(--slds-g-color-text-weak)";
                }
              }}
            >
              Response
            </button>
            <button
              type="button"
              onClick={() => setIncidentTab("debrief")}
              className="bg-transparent px-0 pb-3 text-sm font-medium transition-colors"
              style={{
                color:
                  incidentTab === "debrief"
                    ? "var(--color-brand-primary)"
                    : "var(--slds-g-color-text-weak)",
                borderBottom:
                  incidentTab === "debrief"
                    ? "2px solid var(--color-brand-primary)"
                    : "2px solid transparent",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (incidentTab !== "debrief") {
                  e.currentTarget.style.color =
                    "var(--slds-g-color-text-default)";
                }
              }}
              onMouseLeave={(e) => {
                if (incidentTab !== "debrief") {
                  e.currentTarget.style.color =
                    "var(--slds-g-color-text-weak)";
                }
              }}
            >
              Debrief
            </button>
          </div>
        </div>

        {/* Tab Content Container */}
        <Tabs
          value={incidentTab}
          onValueChange={setIncidentTab}
          className="w-full"
        >
          {/* General Tab */}
          <TabsContent
            value="general"
            className="p-6 space-y-4 m-0"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Incident Type */}
              <div className="space-y-1.5">
                <Label
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Incident Type{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={incidentType}
                  onValueChange={(val) => {
                    setIncidentType(val);
                    if (val !== "other") {
                      setOtherIncidentType("");
                      setOtherIncidentTypeError(false);
                    }
                  }}
                >
                  <SelectTrigger
                    className="rounded-md"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  >
                    <SelectValue placeholder="Select incident type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physical-aggression">
                      Physical Aggression
                    </SelectItem>
                    <SelectItem value="verbal-aggression">
                      Verbal Aggression
                    </SelectItem>
                    <SelectItem value="property-damage">
                      Property Damage
                    </SelectItem>
                    <SelectItem value="elopement">
                      Elopement
                    </SelectItem>
                    <SelectItem value="self-harm">
                      Self-Harm
                    </SelectItem>
                    <SelectItem value="medical-emergency">
                      Medical Emergency
                    </SelectItem>
                    <SelectItem value="substance-use">
                      Substance Use
                    </SelectItem>
                    <SelectItem value="policy-violation">
                      Policy Violation
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <Label
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Location{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={incidentLocation}
                  onValueChange={setIncidentLocation}
                >
                  <SelectTrigger
                    className="rounded-md"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  >
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common-area">
                      Common Area
                    </SelectItem>
                    <SelectItem value="bedroom">
                      Bedroom
                    </SelectItem>
                    <SelectItem value="bathroom">
                      Bathroom
                    </SelectItem>
                    <SelectItem value="kitchen">
                      Kitchen/Dining
                    </SelectItem>
                    <SelectItem value="outdoor">
                      Outdoor Area
                    </SelectItem>
                    <SelectItem value="school">
                      School
                    </SelectItem>
                    <SelectItem value="therapy-room">
                      Therapy Room
                    </SelectItem>
                    <SelectItem value="vehicle">
                      Vehicle
                    </SelectItem>
                    <SelectItem value="community">
                      Community
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Other Incident Type — shown only when "Other" is selected */}
              {incidentType === "other" && (
                <div className="col-span-2 space-y-1.5">
                  <Label
                    className="text-sm font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Other Incident Type{" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  <input
                    value={otherIncidentType}
                    onChange={(e) => {
                      setOtherIncidentType(e.target.value);
                      if (e.target.value.trim()) setOtherIncidentTypeError(false);
                    }}
                    placeholder="Enter other incident type..."
                    className="w-full h-9 px-3 rounded-md text-sm focus:outline-none"
                    style={{
                      border: `1px solid ${otherIncidentTypeError ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                      backgroundColor: "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  />
                  {otherIncidentTypeError && (
                    <p className="text-xs" style={{ color: "#c23934" }}>
                      Other Incident Type is required.
                    </p>
                  )}
                </div>
              )}

              {/* Start Date & Time */}
              <div className="space-y-2">
                <Label
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Start Date & Time{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <div className="flex gap-2">
                  <DateInput
value={isoToMdy(incidentStartDate)}
                    onChange={(v) => ((e) =>
                      setIncidentStartDate(e.target.value)
                    )({ target: { value: mdyToIso(v) } })}
                    className="flex-1 rounded-md"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  />
                  <Input
                    type="time"
                    value={incidentStartTime}
                    onChange={(e) =>
                      setIncidentStartTime(e.target.value)
                    }
                    className="w-32 rounded-md"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  />
                </div>
              </div>

              {/* End Date & Time */}
              <div className="space-y-2">
                <Label
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  End Date & Time
                </Label>
                <div className="flex gap-2">
                  <DateInput
value={isoToMdy(incidentEndDate)}
                    onChange={(v) => ((e) =>
                      setIncidentEndDate(e.target.value)
                    )({ target: { value: mdyToIso(v) } })}
                    className="flex-1 rounded-md"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  />
                  <Input
                    type="time"
                    value={incidentEndTime}
                    onChange={(e) =>
                      setIncidentEndTime(e.target.value)
                    }
                    className="w-32 rounded-md"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Overview */}
            <div className="space-y-1.5">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Overview
              </Label>
              <textarea
                value={incidentOverview}
                onChange={(e) =>
                  setIncidentOverview(e.target.value)
                }
                rows={4}
                className="w-full px-3 py-2 rounded-md text-sm resize-none"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                }}
                placeholder="Brief overview of the incident..."
              />
            </div>

            {/* Youth Involved */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Youth Involved{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full h-8 text-xs"
                  onClick={handleOpenAddYouth}
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Youth
                </Button>
              </div>

              {incidentYouthList.length > 0 && (
                <div
                  className="rounded-lg overflow-hidden"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  {/* List Header */}
                  <div
                    className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    <div className="col-span-3">Youth</div>
                    <div className="col-span-2">Youth ID</div>
                    <div className="col-span-1">Age</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Program</div>
                    <div className="col-span-2 text-right">
                      Actions
                    </div>
                  </div>

                  {/* List Items */}
                  {incidentYouthList.map((youth, index) => (
                    <div
                      key={youth.id}
                      className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 transition-colors"
                      style={{
                        borderBottom:
                          index < incidentYouthList.length - 1
                            ? "1px solid var(--slds-g-color-border-base-1)"
                            : "none",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                      }}
                    >
                      {/* Youth Name & Avatar */}
                      <div className="col-span-3 flex items-center gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback
                            className={`text-white text-xs ${youth.color}`}
                          >
                            {youth.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div
                            className="font-medium text-sm truncate"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {youth.name}
                          </div>
                          {youth.isPrimary && (
                            <Badge
                              className="mt-0.5 text-xs px-1.5 py-0"
                              style={{
                                backgroundColor:
                                  "var(--color-brand-primary)",
                                color: "white",
                              }}
                            >
                              Primary
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Youth ID */}
                      <div
                        className="col-span-2 text-sm"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {youth.youthId || "—"}
                      </div>

                      {/* Age */}
                      <div
                        className="col-span-1 text-sm"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {youth.age || "—"}
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <Badge
                          className={`${youth.statusColor} text-xs px-2 py-0.5`}
                        >
                          {youth.status || "—"}
                        </Badge>
                      </div>

                      {/* Program */}
                      <div
                        className="col-span-2 text-sm truncate"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {youth.program || "—"}
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() =>
                            handleOpenEditYouth(youth)
                          }
                          title="Edit youth information"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        {!youth.isPrimary && (
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs hover:underline"
                            onClick={() =>
                              handleSetPrimaryYouth(youth.id)
                            }
                            title="Set as primary youth"
                            style={{
                              color:
                                "var(--color-brand-primary)",
                            }}
                          >
                            Set Primary
                          </Button>
                        )}
                        {incidentYouthList.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              handleRemoveIncidentYouth(
                                youth.id,
                              )
                            }
                            title="Remove this youth"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {incidentYouthList.length === 0 && (
                <div
                  className="p-6 text-center rounded-lg"
                  style={{
                    border:
                      "1px dashed var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  <p
                    className="text-sm mb-3"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    No youth added yet. Click "Add Youth" to
                    include youth involved in this incident.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full h-8 text-xs"
                    onClick={handleOpenAddYouth}
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add First Youth
                  </Button>
                </div>
              )}
            </div>

            {/* Persons Contacted */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Persons Contacted
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full h-8 text-xs"
                  onClick={handleAddPersonContacted}
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Person
                </Button>
              </div>

              {incidentPersonsContacted.length > 0 && (
                <div className="space-y-4">
                  {incidentPersonsContacted.map((person) => (
                    <div
                      key={person.id}
                      className="p-4 rounded-lg grid grid-cols-3 gap-4 items-start"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-alt)",
                      }}
                    >
                      <div className="space-y-1.5">
                        <Label
                          className="text-xs"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Name
                        </Label>
                        <Input
                          value={person.name}
                          onChange={(e) => {
                            const updated =
                              incidentPersonsContacted.map(
                                (p) =>
                                  p.id === person.id
                                    ? {
                                        ...p,
                                        name: e.target.value,
                                      }
                                    : p,
                              );
                            setIncidentPersonsContacted(
                              updated,
                            );
                          }}
                          className="rounded-md h-8 text-sm"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          className="text-xs"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Relationship
                        </Label>
                        <Input
                          value={person.relationship}
                          onChange={(e) => {
                            const updated =
                              incidentPersonsContacted.map(
                                (p) =>
                                  p.id === person.id
                                    ? {
                                        ...p,
                                        relationship:
                                          e.target.value,
                                      }
                                    : p,
                              );
                            setIncidentPersonsContacted(
                              updated,
                            );
                          }}
                          className="rounded-md h-8 text-sm"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label
                            className="text-xs"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Contact Time
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              handleRemovePersonContacted(
                                person.id,
                              )
                            }
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <Input
                          type="time"
                          value={person.contactTime}
                          onChange={(e) => {
                            const updated =
                              incidentPersonsContacted.map(
                                (p) =>
                                  p.id === person.id
                                    ? {
                                        ...p,
                                        contactTime:
                                          e.target.value,
                                      }
                                    : p,
                              );
                            setIncidentPersonsContacted(
                              updated,
                            );
                          }}
                          className="rounded-md h-8 text-sm"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Narrative Tab */}
          <TabsContent
            value="narrative"
            className="p-6 space-y-4 m-0"
          >
            <div
              className="p-3 rounded-md text-xs flex items-start gap-2"
              style={{
                backgroundColor: "#FEF7E0",
                border: "1px solid #E3C66D",
                color: "#705E2E",
              }}
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <strong>Confidentiality Notice:</strong> This
                narrative contains sensitive information and
                should be handled according to agency
                confidentiality policies.
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Detailed Narrative{" "}
                <span className="text-red-600">*</span>
              </Label>
              <p
                className="text-xs"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Provide a detailed, factual account of the
                incident including what happened before, during,
                and after.
              </p>
              <textarea
                value={incidentNarrative}
                onChange={(e) =>
                  setIncidentNarrative(e.target.value)
                }
                rows={15}
                className="w-full px-3 py-2 rounded-md text-sm resize-none font-mono"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                }}
                placeholder="Enter detailed narrative here..."
              />
            </div>
          </TabsContent>

          {/* Restraints Tab */}
          <TabsContent
            value="restraints"
            className="p-6 space-y-4 m-0"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className="font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Restraint Information
                </h3>
                <p
                  className="text-xs mt-1"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Document any physical restraints used during
                  this incident
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full h-8 text-xs"
                onClick={handleAddRestraint}
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Restraint
              </Button>
            </div>

            {incidentRestraints.length === 0 ? (
              <div
                className="p-12 text-center rounded-lg"
                style={{
                  border:
                    "1px dashed var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <div
                  className="h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: "#FEF7E0" }}
                >
                  <AlertCircle
                    className="h-6 w-6"
                    style={{ color: "#E37400" }}
                  />
                </div>
                <h4
                  className="text-sm font-semibold mb-1"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  No Restraints Documented
                </h4>
                <p
                  className="text-xs mb-4"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  If any physical restraints were used during
                  this incident, click "Add Restraint" to
                  document them.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full h-8 text-xs"
                  onClick={handleAddRestraint}
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add First Restraint
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {incidentRestraints.map((restraint) => (
                  <div
                    key={restraint.id}
                    className="p-4 rounded-lg space-y-4"
                    style={{
                      border: "2px solid #E37400",
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <Badge
                        className="text-xs px-2 py-1"
                        style={{
                          backgroundColor: "#FEF7E0",
                          color: "#705E2E",
                          border: "1px solid #E3C66D",
                        }}
                      >
                        Restraint #{restraint.id}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                        onClick={() =>
                          handleRemoveRestraint(restraint.id)
                        }
                      >
                        <X className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label
                          className="text-xs"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Type of Restraint
                        </Label>
                        <Select
                          value={restraint.type}
                          onValueChange={(value) => {
                            const updated =
                              incidentRestraints.map((r) =>
                                r.id === restraint.id
                                  ? { ...r, type: value }
                                  : r,
                              );
                            setIncidentRestraints(updated);
                          }}
                        >
                          <SelectTrigger
                            className="rounded-md h-8 text-sm"
                            style={{
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                            }}
                          >
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="physical-hold">
                              Physical Hold
                            </SelectItem>
                            <SelectItem value="basket-hold">
                              Basket Hold
                            </SelectItem>
                            <SelectItem value="two-person">
                              Two-Person Restraint
                            </SelectItem>
                            <SelectItem value="transport">
                              Transport Restraint
                            </SelectItem>
                            <SelectItem value="other">
                              Other
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          className="text-xs"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Staff Involved
                        </Label>
                        <Input
                          value={restraint.staffInvolved}
                          onChange={(e) => {
                            const updated =
                              incidentRestraints.map((r) =>
                                r.id === restraint.id
                                  ? {
                                      ...r,
                                      staffInvolved:
                                        e.target.value,
                                    }
                                  : r,
                              );
                            setIncidentRestraints(updated);
                          }}
                          className="rounded-md h-8 text-sm"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                          placeholder="Staff names"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          className="text-xs"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Start Time
                        </Label>
                        <Input
                          type="time"
                          value={restraint.startTime}
                          onChange={(e) => {
                            const updated =
                              incidentRestraints.map((r) =>
                                r.id === restraint.id
                                  ? {
                                      ...r,
                                      startTime: e.target.value,
                                    }
                                  : r,
                              );
                            setIncidentRestraints(updated);
                          }}
                          className="rounded-md h-8 text-sm"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          className="text-xs"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          End Time
                        </Label>
                        <Input
                          type="time"
                          value={restraint.endTime}
                          onChange={(e) => {
                            const updated =
                              incidentRestraints.map((r) =>
                                r.id === restraint.id
                                  ? {
                                      ...r,
                                      endTime: e.target.value,
                                    }
                                  : r,
                              );
                            setIncidentRestraints(updated);
                          }}
                          className="rounded-md h-8 text-sm"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        className="text-xs"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Reason for Restraint
                      </Label>
                      <textarea
                        value={restraint.reason}
                        onChange={(e) => {
                          const updated =
                            incidentRestraints.map((r) =>
                              r.id === restraint.id
                                ? {
                                    ...r,
                                    reason: e.target.value,
                                  }
                                : r,
                            );
                          setIncidentRestraints(updated);
                        }}
                        rows={2}
                        className="w-full px-3 py-2 rounded-md text-sm resize-none"
                        style={{
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                        placeholder="Describe why restraint was necessary..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Youth Injuries Tab */}
          <TabsContent
            value="injuries"
            className="p-6 space-y-4 m-0"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className="font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Youth Injuries
                </h3>
                <p
                  className="text-xs mt-1"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Document any injuries sustained by the youth
                  during this incident
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full h-8 text-xs"
                onClick={handleAddYouthInjury}
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Injury
              </Button>
            </div>

            {incidentYouthInjuries.length === 0 ? (
              <div
                className="p-12 text-center rounded-lg"
                style={{
                  border:
                    "1px dashed var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <div
                  className="h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: "#E8F5E9" }}
                >
                  <Stethoscope
                    className="h-6 w-6"
                    style={{ color: "#0B8043" }}
                  />
                </div>
                <h4
                  className="text-sm font-semibold mb-1"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  No Injuries Documented
                </h4>
                <p
                  className="text-xs mb-4"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Great! If the youth sustained any injuries
                  during this incident, click "Add Injury" to
                  document them.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full h-8 text-xs"
                  onClick={handleAddYouthInjury}
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Injury
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {incidentYouthInjuries.map((injury) => (
                  <div
                    key={injury.id}
                    className="p-4 rounded-lg space-y-4"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h4
                        className="text-sm font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Injury #{injury.id}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                        onClick={() =>
                          handleRemoveYouthInjury(injury.id)
                        }
                      >
                        <X className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5 col-span-2">
                        <Label
                          className="text-xs"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Description of Injury
                        </Label>
                        <textarea
                          value={injury.description}
                          onChange={(e) => {
                            const updated =
                              incidentYouthInjuries.map((i) =>
                                i.id === injury.id
                                  ? {
                                      ...i,
                                      description:
                                        e.target.value,
                                    }
                                  : i,
                              );
                            setIncidentYouthInjuries(updated);
                          }}
                          rows={2}
                          className="w-full px-3 py-2 rounded-md text-sm resize-none"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                          placeholder="Describe the injury..."
                        />
                      </div>

                      <div className="space-y-1.5 col-span-2">
                        <Label
                          className="text-xs"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Cause of Injury
                        </Label>
                        <Input
                          value={injury.cause}
                          onChange={(e) => {
                            const updated =
                              incidentYouthInjuries.map((i) =>
                                i.id === injury.id
                                  ? {
                                      ...i,
                                      cause: e.target.value,
                                    }
                                  : i,
                              );
                            setIncidentYouthInjuries(updated);
                          }}
                          className="rounded-md h-8 text-sm"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                          placeholder="How did the injury occur?"
                        />
                      </div>

                      <div className="space-y-2 col-span-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={injury.firstAid}
                            onCheckedChange={(checked) => {
                              const updated =
                                incidentYouthInjuries.map(
                                  (i) =>
                                    i.id === injury.id
                                      ? {
                                          ...i,
                                          firstAid:
                                            checked as boolean,
                                        }
                                      : i,
                                );
                              setIncidentYouthInjuries(updated);
                            }}
                          />
                          <Label
                            className="text-xs font-semibold cursor-pointer"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            First Aid Administered
                          </Label>
                        </div>

                        {injury.firstAid && (
                          <textarea
                            value={injury.firstAidDetails}
                            onChange={(e) => {
                              const updated =
                                incidentYouthInjuries.map(
                                  (i) =>
                                    i.id === injury.id
                                      ? {
                                          ...i,
                                          firstAidDetails:
                                            e.target.value,
                                        }
                                      : i,
                                );
                              setIncidentYouthInjuries(updated);
                            }}
                            rows={2}
                            className="w-full px-3 py-2 rounded-md text-sm resize-none"
                            style={{
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                            placeholder="Describe first aid provided..."
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Response Tab */}
          <TabsContent
            value="response"
            className="p-6 space-y-4 m-0"
          >
            <div>
              <h3
                className="font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Staff Response & Interventions
              </h3>
              <p
                className="text-xs mt-1"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Document all interventions, de-escalation
                techniques, and responses used
              </p>
            </div>

            <div className="space-y-1.5">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Response Details
              </Label>
              <textarea
                value={incidentResponse}
                onChange={(e) =>
                  setIncidentResponse(e.target.value)
                }
                rows={12}
                className="w-full px-3 py-2 rounded-md text-sm resize-none"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                }}
                placeholder="Describe staff response and interventions used..."
              />
            </div>
          </TabsContent>

          {/* Debrief Tab */}
          <TabsContent
            value="debrief"
            className="p-6 space-y-4 m-0"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className="font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Debrief Information
                </h3>
                <p
                  className="text-xs mt-1"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Document post-incident debrief sessions and
                  participants
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full h-8 text-xs"
                onClick={handleAddDebriefParticipant}
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Participant
              </Button>
            </div>

            {/* Debrief Participants */}
            {incidentDebriefParticipants.length > 0 && (
              <div className="space-y-4">
                <Label
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Debrief Participants
                </Label>
                {incidentDebriefParticipants.map(
                  (participant) => (
                    <div
                      key={participant.id}
                      className="p-4 rounded-lg grid grid-cols-3 gap-4 items-start"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-alt)",
                      }}
                    >
                      <div className="space-y-1.5">
                        <Label
                          className="text-xs"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Name
                        </Label>
                        <Input
                          value={participant.name}
                          onChange={(e) => {
                            const updated =
                              incidentDebriefParticipants.map(
                                (p) =>
                                  p.id === participant.id
                                    ? {
                                        ...p,
                                        name: e.target.value,
                                      }
                                    : p,
                              );
                            setIncidentDebriefParticipants(
                              updated,
                            );
                          }}
                          className="rounded-md h-8 text-sm"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          className="text-xs"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Role
                        </Label>
                        <Input
                          value={participant.role}
                          onChange={(e) => {
                            const updated =
                              incidentDebriefParticipants.map(
                                (p) =>
                                  p.id === participant.id
                                    ? {
                                        ...p,
                                        role: e.target.value,
                                      }
                                    : p,
                              );
                            setIncidentDebriefParticipants(
                              updated,
                            );
                          }}
                          className="rounded-md h-8 text-sm"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label
                            className="text-xs"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Date Attended
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              handleRemoveDebriefParticipant(
                                participant.id,
                              )
                            }
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <DateInput
value={isoToMdy(participant.attendedDate)}
                          onChange={(v) => ((e) => {
                            const updated =
                              incidentDebriefParticipants.map(
                                (p) =>
                                  p.id === participant.id
                                    ? {
                                        ...p,
                                        attendedDate:
                                          e.target.value,
                                      }
                                    : p,
                              );
                            setIncidentDebriefParticipants(
                              updated,
                            );
                          })({ target: { value: mdyToIso(v) } })}
                          className="rounded-md h-8 text-sm"
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                          }}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

            {/* Debrief Notes */}
            <div className="space-y-1.5">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Debrief Notes
              </Label>
              <textarea
                value={incidentDebriefNotes}
                onChange={(e) =>
                  setIncidentDebriefNotes(e.target.value)
                }
                rows={8}
                className="w-full px-3 py-2 rounded-md text-sm resize-none"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                }}
                placeholder="Enter debrief discussion notes and outcomes..."
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Sticky Footer with Action Buttons */}
        <div
          className="sticky bottom-0 z-10 px-6 py-4 flex items-center justify-between"
          style={{
            backgroundColor:
              "var(--slds-g-color-background-base)",
            borderTop:
              "1px solid var(--slds-g-color-border-base-1)",
            boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            {!canFinalizeIncident() && (
              <div
                className="flex items-center gap-1.5"
                title="Complete required fields: Incident Type, Location, Start Date & Time, and Narrative"
              >
                <AlertCircle
                  className="h-3.5 w-3.5"
                  style={{ color: "#E37400" }}
                />
                <span>
                  Complete required fields to finalize
                </span>
              </div>
            )}
            {incidentFinalized && (
              <div className="flex items-center gap-1.5">
                <Check
                  className="h-3.5 w-3.5"
                  style={{ color: "#0B8043" }}
                />
                <span style={{ color: "#0B8043" }}>
                  Incident Finalized
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-9 text-sm"
              onClick={handleCancelIncident}
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
              size="sm"
              className="rounded-full h-9 text-sm text-white"
              onClick={() => {
                if (incidentType === "other" && !otherIncidentType.trim()) {
                  setOtherIncidentTypeError(true);
                  return;
                }
                handleSaveIncident();
              }}
              style={{
                backgroundColor: "var(--color-brand-primary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "#0F4A26";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--color-brand-primary)";
              }}
            >
              <Save className="h-3.5 w-3.5" />
              Save & Close
            </Button>
            <Button
              size="sm"
              className="rounded-full h-9 text-sm text-white"
              onClick={handleFinalizeIncident}
              disabled={
                !canFinalizeIncident() || incidentFinalized
              }
              title={
                incidentFinalized
                  ? "This incident has already been finalized"
                  : !canFinalizeIncident()
                    ? "Complete all required fields (Incident Type, Location, Start Date & Time, Narrative) to finalize this report"
                    : "Finalize this incident report"
              }
              style={{
                backgroundColor:
                  canFinalizeIncident() && !incidentFinalized
                    ? "#0B8043"
                    : "#ccc",
                cursor:
                  canFinalizeIncident() && !incidentFinalized
                    ? "pointer"
                    : "not-allowed",
              }}
              onMouseEnter={(e) => {
                if (
                  canFinalizeIncident() &&
                  !incidentFinalized
                ) {
                  e.currentTarget.style.backgroundColor =
                    "#095835";
                }
              }}
              onMouseLeave={(e) => {
                if (
                  canFinalizeIncident() &&
                  !incidentFinalized
                ) {
                  e.currentTarget.style.backgroundColor =
                    "#0B8043";
                }
              }}
            >
              <Check className="h-3.5 w-3.5" />
              Finalize Incident
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Add/Edit Youth Dialog */}
      <AddEditYouthDialog
        open={youthDialogOpen}
        onOpenChange={setYouthDialogOpen}
        youth={editingYouth}
        onSave={handleSaveYouth}
      />
    </Dialog>
  );
}