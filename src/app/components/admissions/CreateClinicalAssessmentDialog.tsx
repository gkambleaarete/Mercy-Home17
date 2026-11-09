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
import { Textarea } from "../ui/textarea";
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
  attended: boolean | null;
  reasonMissed: string;
}

const ROLE_OPTIONS = [
  "Clinician",
  "Psychologist",
  "Case Manager",
  "Observer",
  "Candidate",
  "Guardian",
  "Family Member",
  "Staff",
];

const EXISTING_ASSESSMENT_DATA = {
  date: "2024-12-22",
  time: "14:00",
  assessmentType: "Initial Clinical Assessment",
  location: "Clinical Assessment Room",
  endDate: "2024-12-22",
  endTime: "16:00",
  homeVisit: false,
  serviceCoordination: false,
};

const EXISTING_PARTICIPANTS: Participant[] = [
  {
    id: 2001,
    type: "Constituent",
    participant: "Marcus Williams",
    role: "Candidate",
    attended: true,
    reasonMissed: "",
  },
  {
    id: 2002,
    type: "Staff",
    participant: "Dr. Sarah Chen",
    role: "Clinician",
    attended: true,
    reasonMissed: "",
  },
  {
    id: 2003,
    type: "Guardian/Family",
    participant: "Denise Williams",
    role: "Guardian",
    attended: true,
    reasonMissed: "",
  },
  {
    id: 2004,
    type: "Staff",
    participant: "James Rodriguez",
    role: "Observer",
    attended: null,
    reasonMissed: "",
  },
];

type AttendanceFilter = "all" | "unknown";

interface CreateClinicalAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateClinicalAssessmentDialog({
  open,
  onOpenChange,
}: CreateClinicalAssessmentDialogProps) {
  const [formData, setFormData] = useState({
    ...EXISTING_ASSESSMENT_DATA,
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

  const filteredParticipants =
    attendanceFilter === "unknown"
      ? participants.filter((p) => p.attended === null)
      : participants;

  useEffect(() => {
    if (open) {
      setFormData({ ...EXISTING_ASSESSMENT_DATA });
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
    setParticipants([...participants, newParticipant]);
    setInlineAddData({
      type: "",
      participant: "",
      role: "",
      attended: null,
      reasonMissed: "",
    });
    setIsAddingInline(false);
    toast.success("Participant added successfully");
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
    setParticipants(participants.filter((p) => p.id !== id));
    setSelectedIds(
      selectedIds.filter((selectedId) => selectedId !== id),
    );
    toast.success("Participant removed successfully");
  };

  const handleBulkSetAttended = () => {
    setParticipants(
      participants.map((p) =>
        selectedIds.includes(p.id)
          ? { ...p, attended: true, reasonMissed: "" }
          : p,
      ),
    );
    setSelectedIds([]);
    toast.success("Marked selected as attended");
  };

  const handleBulkSetNotAttended = () => {
    setParticipants(
      participants.map((p) =>
        selectedIds.includes(p.id)
          ? { ...p, attended: false }
          : p,
      ),
    );
    setSelectedIds([]);
    toast.success("Marked selected as not attended");
  };

  const handleBulkSetUnknown = () => {
    setParticipants(
      participants.map((p) =>
        selectedIds.includes(p.id)
          ? { ...p, attended: null, reasonMissed: "" }
          : p,
      ),
    );
    setSelectedIds([]);
    toast.success("Marked selected as unknown");
  };

  const handleBulkDelete = () => {
    setParticipants(
      participants.filter((p) => !selectedIds.includes(p.id)),
    );
    setSelectedIds([]);
    toast.success("Selected participants deleted");
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredParticipants.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectParticipant = (
    id: number,
    checked: boolean,
  ) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(
        selectedIds.filter((selectedId) => selectedId !== id),
      );
    }
  };

  const attendedCount = participants.filter(
    (p) => p.attended === true,
  ).length;
  const notAttendedCount = participants.filter(
    (p) => p.attended === false,
  ).length;
  const unknownCount = participants.filter(
    (p) => p.attended === null,
  ).length;

  const handleSubmit = () => {
    toast.success("Clinical Assessment saved successfully");
    onOpenChange(false);
  };

  const toggleAssessmentTool = (tool: string) => {
    setFormData({
      ...formData,
      assessmentTools: formData.assessmentTools.includes(tool)
        ? formData.assessmentTools.filter((t) => t !== tool)
        : [...formData.assessmentTools, tool],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-6xl max-h-[92vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#dddbda]">
          <DialogTitle className="text-[#080707] text-[18px] font-semibold">
            Clinical Assessment
          </DialogTitle>
          <DialogDescription className="text-[13px]">
            Review and update the clinical assessment details
            and participants.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Assessment Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-[15px] font-semibold text-[#080707] mb-4">
                  Assessment Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Topic / Type Field */}
                <div className="col-span-2 space-y-1.5">
                  <Label
                    htmlFor="assessmentType"
                    className="text-[13px] text-[#3e3e3c] font-medium"
                  >
                    Topic / Type{" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  <select
                    id="assessmentType"
                    value={formData.assessmentType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        assessmentType: e.target.value,
                      })
                    }
                    className="w-full h-9 px-3 text-[13px] border border-[#dddbda] rounded-md focus:outline-none focus:ring-2 focus:ring-[#145F33] focus:border-transparent bg-white"
                    style={{
                      color: formData.assessmentType
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
                    <option value="Initial Clinical Assessment">
                      Initial Clinical Assessment
                    </option>
                    <option value="Psychological Evaluation">
                      Psychological Evaluation
                    </option>
                    <option value="Psychiatric Evaluation">
                      Psychiatric Evaluation
                    </option>
                    <option value="Behavioral Assessment">
                      Behavioral Assessment
                    </option>
                    <option value="Follow-up Assessment">
                      Follow-up Assessment
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
                    htmlFor="assessmentLocation"
                    className="text-[13px] text-[#3e3e3c] font-medium"
                  >
                    Location{" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  <select
                    id="assessmentLocation"
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
                    id="assessmentHomeVisit"
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
                    htmlFor="assessmentHomeVisit"
                    className="text-[13px] text-[#3e3e3c] font-medium cursor-pointer"
                  >
                    Home Visit
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="assessmentServiceCoordination"
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
                    htmlFor="assessmentServiceCoordination"
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
                        variant="outline"
                        onClick={handleBulkSetNotAttended}
                        className="rounded-full h-9 px-4 text-[13px] font-medium border-[#dddbda] bg-white hover:bg-[#f3f2f2] text-[#3e3e3c] shadow-none"
                      >
                        <XIcon className="h-4 w-4 mr-1.5" />
                        Not Attended
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleBulkSetUnknown}
                        className="rounded-full h-9 px-4 text-[13px] font-medium border-[#dddbda] bg-white hover:bg-[#f3f2f2] text-[#3e3e3c] shadow-none"
                      >
                        <HelpCircle className="h-4 w-4 mr-1.5" />
                        Unknown
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleBulkDelete}
                        className="rounded-full h-9 px-4 text-[13px] font-medium border-[#c23934] text-[#c23934] bg-white hover:bg-[#fef7f6] shadow-none"
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Delete
                      </Button>
                    </>
                  )}
                  {!isAddingInline && (
                    <>
                      <Select
                        value={attendanceFilter}
                        onValueChange={(
                          value: AttendanceFilter,
                        ) => setAttendanceFilter(value)}
                      >
                        <SelectTrigger className="w-[140px] h-9 text-[13px] border-[#dddbda] rounded-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-[#080707]">
                          <SelectItem value="all">
                            All ({participants.length})
                          </SelectItem>
                          <SelectItem value="unknown">
                            Unknown ({unknownCount})
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => setIsAddingInline(true)}
                        className="rounded-full h-9 px-4 text-[13px] font-medium text-white shadow-none"
                        style={{ backgroundColor: "#145F33" }}
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Add Participant
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="border border-[#dddbda] rounded-lg overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-[#fafaf9] border-b border-[#dddbda]">
                      <th className="w-10 px-4 py-3">
                        <Checkbox
                          checked={
                            selectedIds.length ===
                              filteredParticipants.length &&
                            filteredParticipants.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                          className="h-4 w-4 rounded border-[#dddbda]"
                        />
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-[#080707]">
                        Type
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-[#080707]">
                        Participant
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-[#080707]">
                        Role
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-[#080707]">
                        Attended
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-[#080707]">
                        Reason Missed
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-[#080707] w-20">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParticipants.map((participant) => (
                      <tr
                        key={participant.id}
                        className="border-b border-[#e5e5e4] hover:bg-[#fafaf9]"
                      >
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={selectedIds.includes(
                              participant.id,
                            )}
                            onCheckedChange={(checked) =>
                              handleSelectParticipant(
                                participant.id,
                                !!checked,
                              )
                            }
                            className="h-4 w-4 rounded border-[#dddbda]"
                          />
                        </td>
                        <td className="px-4 py-3 text-[#3e3e3c]">
                          {participant.type}
                        </td>
                        <td className="px-4 py-3 text-[#080707] font-medium">
                          {participant.participant}
                        </td>
                        <td className="px-4 py-3 text-[#3e3e3c]">
                          {participant.role}
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={
                              participant.attended === null
                                ? "unknown"
                                : participant.attended
                                  ? "attended"
                                  : "not-attended"
                            }
                            onValueChange={(value) => {
                              setParticipants(
                                participants.map((p) =>
                                  p.id === participant.id
                                    ? {
                                        ...p,
                                        attended:
                                          value === "unknown"
                                            ? null
                                            : value ===
                                              "attended",
                                        reasonMissed:
                                          value ===
                                            "attended" ||
                                          value === "unknown"
                                            ? ""
                                            : p.reasonMissed,
                                      }
                                    : p,
                                ),
                              );
                            }}
                          >
                            <SelectTrigger className="h-8 text-[12px] border-[#dddbda] w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white text-[#080707]">
                              <SelectItem value="attended">
                                Attended
                              </SelectItem>
                              <SelectItem value="not-attended">
                                Not Attended
                              </SelectItem>
                              <SelectItem value="unknown">
                                Unknown
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3">
                          {participant.attended === false && (
                            <Input
                              value={participant.reasonMissed}
                              onChange={(e) => {
                                setParticipants(
                                  participants.map((p) =>
                                    p.id === participant.id
                                      ? {
                                          ...p,
                                          reasonMissed:
                                            e.target.value,
                                        }
                                      : p,
                                  ),
                                );
                              }}
                              className="h-8 text-[12px] border-[#dddbda]"
                              placeholder="Enter reason"
                            />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() =>
                                handleDeleteParticipant(
                                  participant.id,
                                )
                              }
                              className="p-1 hover:bg-[#e5e5e4] rounded transition-colors"
                            >
                              <Trash2 className="h-4 w-4 text-[#c23934]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {isAddingInline && (
                      <tr className="border-b border-[#e5e5e4] bg-[#f4f6f9]">
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3">
                          <Select
                            value={inlineAddData.type}
                            onValueChange={(value) =>
                              setInlineAddData({
                                ...inlineAddData,
                                type: value,
                              })
                            }
                          >
                            <SelectTrigger className="h-8 text-[12px] border-[#dddbda]">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white text-[#080707]">
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
                        <td className="px-4 py-3">
                          <Input
                            value={inlineAddData.participant}
                            onChange={(e) =>
                              setInlineAddData({
                                ...inlineAddData,
                                participant: e.target.value,
                              })
                            }
                            className="h-8 text-[12px] border-[#dddbda]"
                            placeholder="Name"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={inlineAddData.role}
                            onValueChange={(value) =>
                              setInlineAddData({
                                ...inlineAddData,
                                role: value,
                              })
                            }
                          >
                            <SelectTrigger className="h-8 text-[12px] border-[#dddbda]">
                              <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent className="bg-white text-[#080707]">
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
                        <td className="px-4 py-3">
                          <Select
                            value={
                              inlineAddData.attended === null
                                ? "unknown"
                                : inlineAddData.attended
                                  ? "attended"
                                  : "not-attended"
                            }
                            onValueChange={(value) =>
                              setInlineAddData({
                                ...inlineAddData,
                                attended:
                                  value === "unknown"
                                    ? null
                                    : value === "attended",
                              })
                            }
                          >
                            <SelectTrigger className="h-8 text-[12px] border-[#dddbda] w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white text-[#080707]">
                              <SelectItem value="attended">
                                Attended
                              </SelectItem>
                              <SelectItem value="not-attended">
                                Not Attended
                              </SelectItem>
                              <SelectItem value="unknown">
                                Unknown
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3">
                          {inlineAddData.attended === false && (
                            <Input
                              value={inlineAddData.reasonMissed}
                              onChange={(e) =>
                                setInlineAddData({
                                  ...inlineAddData,
                                  reasonMissed: e.target.value,
                                })
                              }
                              className="h-8 text-[12px] border-[#dddbda]"
                              placeholder="Enter reason"
                            />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={handleSaveInlineAdd}
                              className="p-1 hover:bg-[#d4e7dc] rounded transition-colors"
                              title="Save"
                            >
                              <Check className="h-4 w-4 text-[#145F33]" />
                            </button>
                            <button
                              onClick={handleCancelInlineAdd}
                              className="p-1 hover:bg-[#fef7f6] rounded transition-colors"
                              title="Cancel"
                            >
                              <XIcon className="h-4 w-4 text-[#c23934]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {participants.length > 0 && (
                <div className="flex items-center justify-between text-[12px] text-[#706e6b] px-2">
                  <span>
                    {attendedCount} attended ·{" "}
                    {notAttendedCount} not attended ·{" "}
                    {unknownCount} unknown
                  </span>
                  <span>Total: {participants.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="rounded-full text-white"
            style={{ backgroundColor: "#145F33" }}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Assessment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}