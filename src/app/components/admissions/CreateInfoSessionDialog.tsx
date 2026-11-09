import { useState, useEffect } from "react";
import { Plus, Users, Save, HelpCircle } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
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
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner@2.0.3";
import {
  Check,
  X as XIcon,
  Pencil,
  Trash2,
} from "@/app/lib/lucide-icons";
import { DateInput } from "../ui/date-input";
import { TimeInput } from "../ui/time-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface Participant {
  id: number;
  type: string;
  participant: string;
  role: string;
  attended: boolean | null; // true = attended, false = not attended, null = unknown
  reasonMissed: string;
}

const ROLE_OPTIONS = [
  "Facilitator",
  "Observer",
  "Case Manager",
  "Clinician",
  "Family Member",
  "Guardian",
  "Candidate",
  "Staff",
  "External Guest",
];

// Pre-populated existing session data
const EXISTING_SESSION_DATA = {
  date: "2024-12-18",
  time: "10:00",
  topic: "Individual Info Session",
  location: "Main Conference Room",
  endDate: "2024-12-18",
  endTime: "11:30",
  homeVisit: false,
  serviceCoordination: false,
};

const EXISTING_PARTICIPANTS: Participant[] = [
  {
    id: 1001,
    type: "Constituent",
    participant: "Marcus Williams",
    role: "Candidate",
    attended: true,
    reasonMissed: "",
  },
  {
    id: 1002,
    type: "Guardian/Family",
    participant: "Denise Williams",
    role: "Guardian",
    attended: true,
    reasonMissed: "",
  },
  {
    id: 1003,
    type: "Staff",
    participant: "Sarah Chen",
    role: "Facilitator",
    attended: true,
    reasonMissed: "",
  },
  {
    id: 1004,
    type: "Staff",
    participant: "James Rodriguez",
    role: "Case Manager",
    attended: null,
    reasonMissed: "",
  },
  {
    id: 1005,
    type: "Guardian/Family",
    participant: "Robert Williams",
    role: "Family Member",
    attended: false,
    reasonMissed: "Scheduling conflict",
  },
  {
    id: 1006,
    type: "External",
    participant: "Dr. Angela Moore",
    role: "Clinician",
    attended: null,
    reasonMissed: "",
  },
];

type AttendanceFilter = "all" | "unknown";

interface CreateInfoSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInfoSessionDialog({
  open,
  onOpenChange,
}: CreateInfoSessionDialogProps) {
  const [formData, setFormData] = useState({
    ...EXISTING_SESSION_DATA,
  });

  const [participants, setParticipants] = useState<
    Participant[]
  >([...EXISTING_PARTICIPANTS]);
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [inlineAddData, setInlineAddData] = useState({
    type: "",
    participant: "",
    role: "",
    attended: null as boolean | null,
    reasonMissed: "",
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [attendanceFilter, setAttendanceFilter] =
    useState<AttendanceFilter>("all");

  // Derived filtered participants
  const filteredParticipants =
    attendanceFilter === "unknown"
      ? participants.filter((p) => p.attended === null)
      : participants;

  // Reset to existing data when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({ ...EXISTING_SESSION_DATA });
      setParticipants([...EXISTING_PARTICIPANTS]);
      setIsAddingInline(false);
      setInlineAddData({
        type: "",
        participant: "",
        role: "",
        attended: null,
        reasonMissed: "",
      });
      setSelectedIds([]);
      setAttendanceFilter("all");
    }
  }, [open]);

  const handleSaveInlineAdd = () => {
    if (!inlineAddData.type || !inlineAddData.participant)
      return;
    const newParticipant: Participant = {
      id: Date.now(),
      type: inlineAddData.type,
      participant: inlineAddData.participant,
      role: inlineAddData.role,
      attended: inlineAddData.attended,
      reasonMissed: inlineAddData.reasonMissed,
    };
    setParticipants((prev) => [...prev, newParticipant]);
    setInlineAddData({
      type: "",
      participant: "",
      role: "",
      attended: null,
      reasonMissed: "",
    });
    setIsAddingInline(false);
  };

  const handleCancelInlineAdd = () => {
    setInlineAddData({
      type: "",
      participant: "",
      role: "",
      attended: null,
      reasonMissed: "",
    });
    setIsAddingInline(false);
  };

  const handleDeleteParticipant = (id: number) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setSelectedIds((prev) => prev.filter((sid) => sid !== id));
  };

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredParticipants.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkSetAttended = () => {
    setParticipants((prev) =>
      prev.map((p) =>
        selectedIds.includes(p.id)
          ? { ...p, attended: true, reasonMissed: "" }
          : p,
      ),
    );
    setSelectedIds([]);
  };

  const handleBulkSetNotAttended = () => {
    setParticipants((prev) =>
      prev.map((p) =>
        selectedIds.includes(p.id)
          ? { ...p, attended: false }
          : p,
      ),
    );
    setSelectedIds([]);
  };

  const handleBulkSetUnknown = () => {
    setParticipants((prev) =>
      prev.map((p) =>
        selectedIds.includes(p.id)
          ? { ...p, attended: null, reasonMissed: "" }
          : p,
      ),
    );
    setSelectedIds([]);
  };

  const handleSave = () => {
    if (
      !formData.date ||
      !formData.time ||
      !formData.topic ||
      !formData.location
    ) {
      toast.error(
        "Please fill in all required fields (Topic, Start Date, Start Time, Location).",
      );
      return;
    }
    toast.success("Info Session updated successfully!");
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const unknownCount = participants.filter(
    (p) => p.attended === null,
  ).length;
  const attendedCount = participants.filter(
    (p) => p.attended === true,
  ).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1100px] rounded-[8px] bg-white border border-[#dddbda] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="border-b border-[#dddbda] pb-4 px-6 pt-6 mb-0">
          <DialogTitle className="text-[16px] font-bold text-[#080707]">
            Info Session
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#706e6b] mt-2">
            View and edit details for this information session.
            Update session information and manage participants
            below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Session Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-[15px] font-semibold text-[#080707] mb-4">
                  Session Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Topic / Type Field */}
                <div className="col-span-2 space-y-1.5">
                  <Label
                    htmlFor="sessionTopic"
                    className="text-[13px] text-[#3e3e3c] font-medium"
                  >
                    Topic / Type{" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  <select
                    id="sessionTopic"
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        topic: e.target.value,
                      })
                    }
                    className="w-full h-9 px-3 text-[13px] border border-[#dddbda] rounded-md focus:outline-none focus:ring-2 focus:ring-[#145F33] focus:border-transparent bg-white"
                    style={{
                      color: formData.topic
                        ? "#080707"
                        : "#706e6b",
                      colorScheme: "light",
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                      backgroundPosition: "right 0.5rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                      paddingRight: "2.5rem",
                      appearance: "none" as const,
                    }}
                  >
                    <option value="">Select a type</option>
                    <option value="Individual Info Session">
                      Individual Info Session
                    </option>
                    <option value="Group Info Session">
                      Group Info Session
                    </option>
                    <option value="Virtual Info Session">
                      Virtual Info Session
                    </option>
                    <option value="On-site Tour">
                      On-site Tour
                    </option>
                  </select>
                </div>

                {/* Start Date and Time */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="startDate"
                    className="text-[13px] text-[#3e3e3c] font-medium"
                  >
                    Start Date{" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  <DateInput
                    id="startDate"
                    value={isoToMdy(formData.date)}
                    onChange={(v) =>
                      ((e) =>
                        setFormData({
                          ...formData,
                          date: e.target.value,
                        }))({ target: { value: mdyToIso(v) } })
                    }
                    className="h-9 text-[13px] border-[#dddbda]"
                    style={{ colorScheme: "light" }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="startTime"
                    className="text-[13px] text-[#3e3e3c] font-medium"
                  >
                    Start Time{" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  <TimeInput
                    id="startTime"
                    format="24h"
                    value={formData.time}
                    onChange={(val) =>
                      setFormData({ ...formData, time: val })
                    }
                    placeholder="hh:mm AM/PM"
                  />
                </div>

                {/* End Date and Time */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="endDate"
                    className="text-[13px] text-[#3e3e3c] font-medium"
                  >
                    End Date
                  </Label>
                  <DateInput
                    id="endDate"
                    value={isoToMdy(formData.endDate)}
                    onChange={(v) =>
                      ((e) =>
                        setFormData({
                          ...formData,
                          endDate: e.target.value,
                        }))({ target: { value: mdyToIso(v) } })
                    }
                    className="h-9 text-[13px] border-[#dddbda]"
                    style={{ colorScheme: "light" }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="endTime"
                    className="text-[13px] text-[#3e3e3c] font-medium"
                  >
                    End Time
                  </Label>
                  <TimeInput
                    id="endTime"
                    format="24h"
                    value={formData.endTime}
                    onChange={(val) =>
                      setFormData({ ...formData, endTime: val })
                    }
                    placeholder="hh:mm AM/PM"
                  />
                </div>

                {/* Location */}
                <div className="col-span-2 space-y-1.5">
                  <Label
                    htmlFor="sessionLocation"
                    className="text-[13px] text-[#3e3e3c] font-medium"
                  >
                    Location{" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  <select
                    id="sessionLocation"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: e.target.value,
                      })
                    }
                    className="w-full h-9 px-3 text-[13px] border border-[#dddbda] rounded-md focus:outline-none focus:ring-2 focus:ring-[#145F33] focus:border-transparent bg-white"
                    style={{
                      color: formData.location
                        ? "#080707"
                        : "#706e6b",
                      colorScheme: "light",
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                      backgroundPosition: "right 0.5rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                      paddingRight: "2.5rem",
                      appearance: "none" as const,
                    }}
                  >
                    <option value="">Select a location</option>
                    <option value="Main Conference Room">
                      Main Conference Room
                    </option>
                    <option value="Clinical Services Wing">
                      Clinical Services Wing
                    </option>
                    <option value="Residential Hall A">
                      Residential Hall A
                    </option>
                    <option value="Education Center">
                      Education Center
                    </option>
                    <option value="Family Services Building">
                      Family Services Building
                    </option>
                    <option value="Medical Clinic">
                      Medical Clinic
                    </option>
                    <option value="Community Room">
                      Community Room
                    </option>
                    <option value="Recreation Center">
                      Recreation Center
                    </option>
                    <option value="Training Room B">
                      Training Room B
                    </option>
                    <option value="Community Outreach Center">
                      Community Outreach Center
                    </option>
                    <option value="Administration Building">
                      Administration Building
                    </option>
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="infoHomeVisit"
                    checked={formData.homeVisit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        homeVisit: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-[#dddbda] text-[#145F33] focus:ring-[#145F33]"
                    style={{ colorScheme: "light" }}
                  />
                  <Label
                    htmlFor="infoHomeVisit"
                    className="text-[13px] text-[#3e3e3c] font-medium cursor-pointer"
                  >
                    Home Visit
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="infoServiceCoordination"
                    checked={formData.serviceCoordination}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        serviceCoordination: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-[#dddbda] text-[#145F33] focus:ring-[#145F33]"
                    style={{ colorScheme: "light" }}
                  />
                  <Label
                    htmlFor="infoServiceCoordination"
                    className="text-[13px] text-[#3e3e3c] font-medium cursor-pointer"
                  >
                    Service Coordination
                  </Label>
                </div>
              </div>
            </div>

            {/* Participants Section */}
            <div className="space-y-4 pt-5 border-t border-[#dddbda]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-[15px] font-semibold text-[#080707]">
                  Participants
                  <span className="ml-2 text-[13px] font-normal text-[#706e6b]">
                    ({participants.length})
                  </span>
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedIds.length > 0 && (
                    <>
                      <span className="text-[12px] text-[#706e6b] mr-1">
                        {selectedIds.length} selected
                      </span>
                      <Button
                        variant="outline"
                        onClick={handleBulkSetAttended}
                        className="rounded-full h-9 px-4 text-[13px] font-medium border-[#dddbda] bg-white hover:bg-[#f3f2f2] text-[#3e3e3c] shadow-none"
                      >
                        <Check className="h-4 w-4 mr-1.5" />
                        Attended
                      </Button>
                      <Button
                        onClick={handleBulkSetNotAttended}
                        variant="outline"
                        className="rounded-full h-9 px-4 text-[13px] font-medium border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
                        style={{ color: "#080707" }}
                      >
                        <XIcon className="h-4 w-4 mr-1.5" />
                        Not Attended
                      </Button>
                      <Button
                        onClick={handleBulkSetUnknown}
                        variant="outline"
                        className="rounded-full h-9 px-4 text-[13px] font-medium border-[#f59e0b] bg-[#fffbeb] hover:bg-[#fef3c7] shadow-none"
                        style={{ color: "#92400e" }}
                      >
                        <HelpCircle className="h-4 w-4 mr-1.5" />
                        Unknown
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => setIsAddingInline(true)}
                    disabled={isAddingInline}
                    className="rounded-full h-9 px-4 text-[13px] font-medium w-full sm:w-auto bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
                  >
                    <Plus
                      className="h-4 w-4 mr-2"
                      style={{
                        strokeWidth: 2,
                        stroke: "currentColor",
                      }}
                    />
                    Add Participant
                  </Button>
                </div>
              </div>

              {/* Active filter indicator */}
              {attendanceFilter === "unknown" && (
                <div className="flex items-center gap-2 px-3 py-2 bg-[#fffbeb] border border-[#fde68a] rounded-lg">
                  <HelpCircle className="h-4 w-4 text-[#92400e] flex-shrink-0" />
                  <span className="text-[12px] text-[#92400e] font-medium">
                    Showing {filteredParticipants.length}{" "}
                    participant
                    {filteredParticipants.length !== 1
                      ? "s"
                      : ""}{" "}
                    with unknown attendance
                  </span>
                  <button
                    onClick={() => setAttendanceFilter("all")}
                    className="ml-auto text-[12px] text-[#92400e] hover:text-[#78350f] underline cursor-pointer bg-transparent border-none p-0"
                  >
                    Show all
                  </button>
                </div>
              )}

              {filteredParticipants.length > 0 ||
              isAddingInline ? (
                <div className="border rounded-lg overflow-hidden border-[#dddbda]">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-alt)",
                        }}
                      >
                        <tr>
                          <th
                            className="px-3 py-2.5 text-center"
                            style={{ width: "44px" }}
                          >
                            {filteredParticipants.length >
                              0 && (
                              <Checkbox
                                checked={
                                  filteredParticipants.length >
                                    0 &&
                                  selectedIds.length ===
                                    filteredParticipants.length
                                }
                                onCheckedChange={(checked) =>
                                  handleToggleAll(!!checked)
                                }
                                aria-label="Select all participants"
                              />
                            )}
                          </th>
                          <th
                            className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                              width: "80px",
                            }}
                          >
                            Type
                          </th>
                          <th
                            className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                              width: "180px",
                            }}
                          >
                            Participant
                          </th>
                          <th
                            className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                              width: "120px",
                            }}
                          >
                            Role
                          </th>
                          <th
                            className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                              width: "110px",
                            }}
                          >
                            Attended
                          </th>
                          <th
                            className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Reason Missed
                          </th>
                          <th
                            className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                              width: "80px",
                            }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody
                        className="divide-y"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                        }}
                      >
                        {isAddingInline && (
                          <tr className="bg-[#f0faf4]">
                            <td className="px-3 py-3 text-center"></td>
                            <td className="px-3 py-2">
                              <Select
                                value={inlineAddData.type}
                                onValueChange={(val) =>
                                  setInlineAddData({
                                    ...inlineAddData,
                                    type: val,
                                  })
                                }
                              >
                                <SelectTrigger className="h-8 text-[13px] border-[#dddbda] bg-white">
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Constituent">
                                    Constituent
                                  </SelectItem>
                                  <SelectItem value="Guardian/Family">
                                    Guardian/Family
                                  </SelectItem>
                                  <SelectItem value="Staff">
                                    Staff
                                  </SelectItem>
                                  <SelectItem value="External">
                                    External
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                value={
                                  inlineAddData.participant
                                }
                                onChange={(e) =>
                                  setInlineAddData({
                                    ...inlineAddData,
                                    participant: e.target.value,
                                  })
                                }
                                className="h-8 text-[13px] border-[#dddbda]"
                                placeholder="Name"
                                autoFocus
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Select
                                value={inlineAddData.role}
                                onValueChange={(val) =>
                                  setInlineAddData({
                                    ...inlineAddData,
                                    role: val,
                                  })
                                }
                              >
                                <SelectTrigger className="h-8 text-[13px] border-[#dddbda] bg-white">
                                  <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ROLE_OPTIONS.map((role) => (
                                    <SelectItem
                                      key={role}
                                      value={role}
                                    >
                                      {role}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={
                                  inlineAddData.attended ===
                                  null
                                    ? "unknown"
                                    : inlineAddData.attended
                                      ? "yes"
                                      : "no"
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setInlineAddData({
                                    ...inlineAddData,
                                    attended:
                                      val === "unknown"
                                        ? null
                                        : val === "yes",
                                    reasonMissed:
                                      val === "yes" ||
                                      val === "unknown"
                                        ? ""
                                        : inlineAddData.reasonMissed,
                                  });
                                }}
                                className="w-full h-8 px-2 text-[12px] border border-[#dddbda] rounded-md focus:outline-none focus:ring-2 focus:ring-[#145F33] focus:border-transparent bg-white"
                                style={{
                                  colorScheme: "light",
                                  appearance: "none" as const,
                                  backgroundImage:
                                    "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                                  backgroundPosition:
                                    "right 0.25rem center",
                                  backgroundRepeat: "no-repeat",
                                  backgroundSize:
                                    "1.25em 1.25em",
                                  paddingRight: "1.5rem",
                                }}
                              >
                                <option value="unknown">
                                  Unknown
                                </option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              {inlineAddData.attended ===
                                false && (
                                <Input
                                  value={
                                    inlineAddData.reasonMissed
                                  }
                                  onChange={(e) =>
                                    setInlineAddData({
                                      ...inlineAddData,
                                      reasonMissed:
                                        e.target.value,
                                    })
                                  }
                                  className="h-8 text-[13px] border-[#dddbda]"
                                  placeholder="Reason missed"
                                />
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={handleSaveInlineAdd}
                                  className="p-1.5 rounded hover:bg-green-100 transition-colors"
                                  title="Save"
                                >
                                  <Check
                                    className="h-4 w-4"
                                    style={{ color: "#145F33" }}
                                  />
                                </button>
                                <button
                                  onClick={
                                    handleCancelInlineAdd
                                  }
                                  className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                                  title="Cancel"
                                >
                                  <XIcon
                                    className="h-4 w-4"
                                    style={{ color: "#6B7280" }}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                        {filteredParticipants.map(
                          (participant) => (
                            <tr
                              key={participant.id}
                              className={`hover:bg-gray-50 ${selectedIds.includes(participant.id) ? "bg-[#f9fafb]" : ""}`}
                            >
                              <td className="px-3 py-3 text-center">
                                <Checkbox
                                  checked={selectedIds.includes(
                                    participant.id,
                                  )}
                                  onCheckedChange={() => {
                                    setSelectedIds((prev) =>
                                      prev.includes(
                                        participant.id,
                                      )
                                        ? prev.filter(
                                            (id) =>
                                              id !==
                                              participant.id,
                                          )
                                        : [
                                            ...prev,
                                            participant.id,
                                          ],
                                    );
                                  }}
                                  aria-label={`Select ${participant.participant}`}
                                />
                              </td>
                              <td className="px-3 py-3">
                                <span
                                  className="text-[13px]"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {participant.type}
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                <span
                                  className="text-[13px] font-medium"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {participant.participant}
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                <span
                                  className="text-[13px]"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {participant.role}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <div className="flex justify-center">
                                  {participant.attended ===
                                  null ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#fef3c7] text-[#92400e]">
                                      <HelpCircle className="h-3 w-3" />
                                      Unknown
                                    </span>
                                  ) : (
                                    <Checkbox
                                      checked={
                                        participant.attended
                                      }
                                      onCheckedChange={(
                                        checked,
                                      ) => {
                                        setParticipants(
                                          (prev) =>
                                            prev.map((p) =>
                                              p.id ===
                                              participant.id
                                                ? {
                                                    ...p,
                                                    attended:
                                                      checked as boolean,
                                                    reasonMissed:
                                                      checked
                                                        ? ""
                                                        : p.reasonMissed,
                                                  }
                                                : p,
                                            ),
                                        );
                                      }}
                                    />
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                {participant.attended ===
                                  false && (
                                  <div
                                    className="h-8 text-[13px] min-w-[150px] flex items-center px-3"
                                    style={{ color: "#080707" }}
                                  >
                                    {participant.reasonMissed ||
                                      "\u2014"}
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() =>
                                      handleDeleteParticipant(
                                        participant.id,
                                      )
                                    }
                                    className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2
                                      className="h-4 w-4"
                                      style={{
                                        color: "#DC2626",
                                      }}
                                    />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div
                  className="p-8 text-center border rounded-lg"
                  style={{
                    borderColor: "#dddbda",
                    backgroundColor: "#fafaf9",
                  }}
                >
                  {attendanceFilter === "unknown" ? (
                    <>
                      <HelpCircle
                        className="h-12 w-12 mx-auto mb-3"
                        style={{ color: "#f59e0b" }}
                      />
                      <p className="text-[13px] font-medium text-[#080707] mb-1">
                        No participants with unknown attendance
                      </p>
                      <p className="text-[13px] text-[#706e6b]">
                        All participants have a confirmed
                        attendance status
                      </p>
                    </>
                  ) : (
                    <>
                      <Users
                        className="h-12 w-12 mx-auto mb-3"
                        style={{ color: "#9CA3AF" }}
                      />
                      <p className="text-[13px] font-medium text-[#080707] mb-1">
                        No participants added yet
                      </p>
                      <p className="text-[13px] text-[#706e6b]">
                        Click "Add Participant" to start
                        building your attendee list
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-[#dddbda] pt-4 pb-5 px-6 flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="rounded-full h-9 px-6 text-[13px] font-medium border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="rounded-full h-9 px-6 text-[13px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
          >
            <Save
              className="h-4 w-4 mr-2"
              style={{ stroke: "currentColor" }}
            />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}