import { useState, useRef, useEffect } from "react";
import { Plus, X, Trash2, ExternalLink } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { DateInput } from "../ui/date-input";
import { TimeInput } from "../ui/time-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const LOCATION_OPTIONS = [
  "DePalmaGarden",
  "Conference Room - Community Care Satellite Office",
  "20/30 club",
  "Conference Room - Daley Home Therapy Room",
  "Conference Room - Daley Home Staff Office",
  "Conference Room - Daley Home Living Room",
  "Conference Room - Daley Home SMART Room",
  "Girls Campus Back Office",
  "Conference Room - 227 Basement",
  "Conference Room - Admissions",
  "Conference Room - Board of Regents (restricted) (cap. 50)",
  "Conference Room - HR",
  "Conference Room - Chairman's Room",
  "Conference Room - Girls SMART Room",
  "Conference Room - Advancement",
  "Other",
];

const CONSTITUENT_ROLE_OPTIONS = [
  "Attendee",
  "Facilitator",
  "Note Taker",
  "Observer",
  "Organizer",
  "Other Role",
];

const REASON_MISSED_OPTIONS = [
  "Illness",
  "School",
  "Work",
  "Family Emergency",
  "Transportation",
  "Refused",
  "Staff Error",
  "Youth AWOL",
  "Program Conflict",
  "Other",
];

export interface MediationParticipant {
  id: number;
  participant: string;
  role: string;
  attended: boolean | null;
  reasonMissed: string;
}

export interface MediationMeetingData {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  participants: MediationParticipant[];
  meetingSummary: string;
  participantNotes: {
    id: number;
    name: string;
    notes: string;
  }[];
  notesAttachments: string;
  dateTime: string;
  attendees: string;
  comments: string;
}

export interface IncidentReportData {
  id: string;
  youthInvolved: string[];
  incidentDate: string;
  program: string;
  staffInvolved: string[];
  status: string;
}

interface MediationMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (meeting: MediationMeetingData) => void;
  incidentReport?: IncidentReportData;
  mode?: "create" | "view" | "edit";
  initialData?: MediationMeetingData;
}

const DEFAULT_ORGANIZER = (): MediationParticipant => ({
  id: 1,
  participant: "Staff Member (You)",
  role: "Organizer",
  attended: null,
  reasonMissed: "",
});

export function MediationMeetingModal({
  open,
  onOpenChange,
  onSave,
  incidentReport,
  mode = "create",
  initialData,
}: MediationMeetingModalProps) {
  const participantIdRef = useRef(2);
  const nextId = () => participantIdRef.current++;

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const [activeTab, setActiveTab] = useState<
    "connection" | "details"
  >("connection");

  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");

  const [participants, setParticipants] = useState<
    MediationParticipant[]
  >([DEFAULT_ORGANIZER()]);
  const [isAddingParticipant, setIsAddingParticipant] =
    useState(false);
  const [newParticipantName, setNewParticipantName] =
    useState("");
  const [newParticipantRole, setNewParticipantRole] =
    useState("");

  const [meetingSummary, setMeetingSummary] = useState("");
  const [participantNotes, setParticipantNotes] = useState<
    { id: number; name: string; notes: string }[]
  >([]);
  const [notesAttachments, setNotesAttachments] = useState("");

  const [errors, setErrors] = useState<Record<string, boolean>>(
    {},
  );

  // Populate fields when opening in view or edit mode
  useEffect(() => {
    if (open && initialData && (isViewMode || isEditMode)) {
      setStartDate(initialData.startDate);
      setStartTime(initialData.startTime);
      setEndDate(initialData.endDate);
      setEndTime(initialData.endTime);
      setLocation(initialData.location);
      setParticipants(initialData.participants);
      setMeetingSummary(initialData.meetingSummary);
      setParticipantNotes(initialData.participantNotes);
      setNotesAttachments(initialData.notesAttachments);
      setErrors({});
      setActiveTab("connection");
      if (initialData.participants.length > 0) {
        const maxId = Math.max(
          ...initialData.participants.map((p) => p.id),
        );
        participantIdRef.current = maxId + 1;
      }
    }
  }, [open]);

  const resetForm = () => {
    setActiveTab("connection");
    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setLocation("");
    participantIdRef.current = 2;
    setParticipants([DEFAULT_ORGANIZER()]);
    setIsAddingParticipant(false);
    setNewParticipantName("");
    setNewParticipantRole("");
    setMeetingSummary("");
    setParticipantNotes([]);
    setNotesAttachments("");
    setErrors({});
  };

  const handleClose = () => {
    if (!isViewMode) resetForm();
    onOpenChange(false);
  };

  const handleSave = () => {
    const newErrors: Record<string, boolean> = {};
    if (!startDate) newErrors.startDate = true;
    if (!startTime) newErrors.startTime = true;
    if (!endDate) newErrors.endDate = true;
    if (!endTime) newErrors.endTime = true;
    if (!location) newErrors.location = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setActiveTab("connection");
      return;
    }

    const attendeeNames = participants
      .filter((p) => p.attended !== false)
      .map((p) => p.participant)
      .join(", ");

    const summary =
      meetingSummary.length > 120
        ? meetingSummary.slice(0, 120) + "…"
        : meetingSummary;

    onSave({
      startDate,
      startTime,
      endDate,
      endTime,
      location,
      participants,
      meetingSummary,
      participantNotes,
      notesAttachments,
      dateTime: `${startDate} ${startTime}`,
      attendees:
        attendeeNames ||
        participants.map((p) => p.participant).join(", "),
      comments: summary,
    });

    resetForm();
    onOpenChange(false);
  };

  const handleAddParticipant = () => {
    if (!newParticipantName.trim() || !newParticipantRole)
      return;
    const newId = nextId();
    setParticipants((prev) => [
      ...prev,
      {
        id: newId,
        participant: newParticipantName.trim(),
        role: newParticipantRole,
        attended: null,
        reasonMissed: "",
      },
    ]);
    setParticipantNotes((prev) => [
      ...prev,
      { id: newId, name: newParticipantName.trim(), notes: "" },
    ]);
    setNewParticipantName("");
    setNewParticipantRole("");
    setIsAddingParticipant(false);
  };

  const handleRemoveParticipant = (id: number) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setParticipantNotes((prev) =>
      prev.filter((pn) => pn.id !== id),
    );
  };

  const handleToggleAttended = (
    id: number,
    attended: boolean,
  ) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              attended:
                p.attended === attended ? null : attended,
              reasonMissed: "",
            }
          : p,
      ),
    );
  };

  const handleReasonMissed = (id: number, reason: string) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, reasonMissed: reason } : p,
      ),
    );
  };

  const fieldLabel = (text: string, required?: boolean) => (
    <label
      className="slds-form-label"
      style={{ color: "var(--slds-g-color-text-weak)" }}
    >
      {text.toUpperCase()}
      {required && !isViewMode && (
        <span style={{ color: "#c23934" }}> *</span>
      )}
    </label>
  );

  const fieldError = (key: string) =>
    errors[key] ? (
      <p
        className="slds-text-3 mt-1"
        style={{ color: "#c23934" }}
      >
        This field is required.
      </p>
    ) : null;

  const readOnlyField = (value: string) => (
    <div
      className="h-9 px-3 flex items-center rounded slds-text-4"
      style={{
        border: "1px solid var(--slds-g-color-border-base-1)",
        backgroundColor: "var(--slds-g-color-background-alt)",
        color: "var(--slds-g-color-text-default)",
      }}
    >
      {value || "—"}
    </div>
  );

  const modalTitle = isViewMode
    ? "View Mediation Meeting"
    : isEditMode
      ? "Edit Mediation Meeting"
      : "Schedule Mediation Meeting";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="flex flex-col p-0 gap-0"
        size="xl"
        aria-describedby={undefined}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader
          className="px-6 py-5 shrink-0"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <DialogTitle
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            {modalTitle}
          </DialogTitle>
        </DialogHeader>

        {/* Tab Strip */}
        <div
          className="flex shrink-0"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          {(["connection", "details"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-3 slds-text-4 font-medium capitalize relative"
              style={{
                color:
                  activeTab === tab
                    ? "#145F33"
                    : "var(--slds-g-color-text-weak)",
                borderBottom:
                  activeTab === tab
                    ? "2px solid #145F33"
                    : "2px solid transparent",
                background: "none",
                cursor: "pointer",
              }}
            >
              {tab === "connection" ? "Connection" : "Details"}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 bg-white">
          {/* ── CONNECTION TAB ── */}
          {activeTab === "connection" && (
            <>
              {/* Connection Type (always read-only) */}
              <div className="space-y-1.5">
                {fieldLabel("Connection Type")}
                {readOnlyField("Mediation Meeting")}
              </div>

              {/* Date / Time grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  {fieldLabel("Start Date", true)}
                  {isViewMode ? (
                    readOnlyField(startDate)
                  ) : (
                    <DateInput
                      value={startDate}
                      onChange={(v) => {
                        setStartDate(v);
                        setErrors((e) => ({
                          ...e,
                          startDate: false,
                        }));
                      }}
                      placeholder="MM/DD/YYYY"
                      style={
                        errors.startDate
                          ? { borderColor: "#c23934" }
                          : undefined
                      }
                    />
                  )}
                  {fieldError("startDate")}
                </div>
                <div className="space-y-1.5">
                  {fieldLabel("Start Time", true)}
                  {isViewMode ? (
                    readOnlyField(startTime)
                  ) : (
                    <TimeInput
                      value={startTime}
                      onChange={(v) => {
                        setStartTime(v);
                        setErrors((e) => ({
                          ...e,
                          startTime: false,
                        }));
                      }}
                      placeholder="hh:mm AM/PM"
                      style={
                        errors.startTime
                          ? { borderColor: "#c23934" }
                          : undefined
                      }
                    />
                  )}
                  {fieldError("startTime")}
                </div>
                <div className="space-y-1.5">
                  {fieldLabel("End Date", true)}
                  {isViewMode ? (
                    readOnlyField(endDate)
                  ) : (
                    <DateInput
                      value={endDate}
                      onChange={(v) => {
                        setEndDate(v);
                        setErrors((e) => ({
                          ...e,
                          endDate: false,
                        }));
                      }}
                      placeholder="MM/DD/YYYY"
                      style={
                        errors.endDate
                          ? { borderColor: "#c23934" }
                          : undefined
                      }
                    />
                  )}
                  {fieldError("endDate")}
                </div>
                <div className="space-y-1.5">
                  {fieldLabel("End Time", true)}
                  {isViewMode ? (
                    readOnlyField(endTime)
                  ) : (
                    <TimeInput
                      value={endTime}
                      onChange={(v) => {
                        setEndTime(v);
                        setErrors((e) => ({
                          ...e,
                          endTime: false,
                        }));
                      }}
                      placeholder="hh:mm AM/PM"
                      style={
                        errors.endTime
                          ? { borderColor: "#c23934" }
                          : undefined
                      }
                    />
                  )}
                  {fieldError("endTime")}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                {fieldLabel("Location", true)}
                {isViewMode ? (
                  readOnlyField(location)
                ) : (
                  <Select
                    value={location}
                    onValueChange={(v) => {
                      setLocation(v);
                      setErrors((e) => ({
                        ...e,
                        location: false,
                      }));
                    }}
                  >
                    <SelectTrigger
                      className="h-9 slds-text-4"
                      style={
                        errors.location
                          ? { borderColor: "#c23934" }
                          : {
                              borderColor:
                                "var(--slds-g-color-border-base-1)",
                            }
                      }
                    >
                      <SelectValue placeholder="Please Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATION_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt}
                          value={opt}
                          className="slds-text-4"
                        >
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {fieldError("location")}
              </div>

              {/* Related Incident Report */}
              {incidentReport && (
                <div>
                  <p
                    className="slds-form-label mb-2"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    RELATED INCIDENT REPORT
                  </p>
                  <div
                    className="rounded p-4 space-y-3"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <a
                        href={`/incident-reports/${incidentReport.id}`}
                        className="slds-text-4 font-medium flex items-center gap-1"
                        style={{ color: "#0176d3" }}
                      >
                        Incident Report #{incidentReport.id}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                      <div>
                        <p
                          className="slds-text-3 mb-0.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          YOUTH INVOLVED
                        </p>
                        <p
                          className="slds-text-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {incidentReport.youthInvolved.join(
                            ", ",
                          ) || "—"}
                        </p>
                      </div>
                      <div>
                        <p
                          className="slds-text-3 mb-0.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          INCIDENT DATE
                        </p>
                        <p
                          className="slds-text-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {incidentReport.incidentDate || "—"}
                        </p>
                      </div>
                      <div>
                        <p
                          className="slds-text-3 mb-0.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          PROGRAM
                        </p>
                        <p
                          className="slds-text-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {incidentReport.program || "—"}
                        </p>
                      </div>
                      <div>
                        <p
                          className="slds-text-3 mb-0.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          STAFF INVOLVED
                        </p>
                        <p
                          className="slds-text-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {incidentReport.staffInvolved.join(
                            ", ",
                          ) || "—"}
                        </p>
                      </div>
                      <div>
                        <p
                          className="slds-text-3 mb-0.5"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          STATUS
                        </p>
                        <p
                          className="slds-text-4"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {incidentReport.status || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Participants */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p
                    className="slds-form-label"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    PARTICIPANTS
                  </p>
                  {!isViewMode && (
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() =>
                        setIsAddingParticipant(true)
                      }
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Participant
                    </Button>
                  )}
                </div>

                <div
                  className="rounded overflow-hidden"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
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
                        {[
                          "Participant",
                          "Role",
                          "Attended",
                          "Reason Missed",
                          ...(isViewMode ? [] : ["Actions"]),
                        ].map((col) => (
                          <th
                            key={col}
                            className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((p) => (
                        <tr
                          key={p.id}
                          style={{
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <td
                            className="px-3 py-2.5 slds-text-4"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {p.participant}
                          </td>
                          <td
                            className="px-3 py-2.5 slds-text-4"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            {p.role}
                          </td>
                          <td className="px-3 py-2.5">
                            {isViewMode ? (
                              <span
                                className="slds-text-4"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                {p.attended === true
                                  ? "Y"
                                  : p.attended === false
                                    ? "N"
                                    : "—"}
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    handleToggleAttended(
                                      p.id,
                                      true,
                                    )
                                  }
                                  className="h-6 w-6 rounded-full flex items-center justify-center border transition-colors"
                                  style={{
                                    backgroundColor:
                                      p.attended === true
                                        ? "#145F33"
                                        : "transparent",
                                    borderColor:
                                      p.attended === true
                                        ? "#145F33"
                                        : "var(--slds-g-color-border-base-1)",
                                    color:
                                      p.attended === true
                                        ? "white"
                                        : "var(--slds-g-color-text-weak)",
                                  }}
                                  title="Attended"
                                  aria-label="Mark attended"
                                >
                                  <span className="text-[10px] font-bold">
                                    Yes
                                  </span>
                                </button>
                                <button
                                  onClick={() =>
                                    handleToggleAttended(
                                      p.id,
                                      false,
                                    )
                                  }
                                  className="h-6 w-6 rounded-full flex items-center justify-center border transition-colors"
                                  style={{
                                    backgroundColor:
                                      p.attended === false
                                        ? "#c23934"
                                        : "transparent",
                                    borderColor:
                                      p.attended === false
                                        ? "#c23934"
                                        : "var(--slds-g-color-border-base-1)",
                                    color:
                                      p.attended === false
                                        ? "white"
                                        : "var(--slds-g-color-text-weak)",
                                  }}
                                  title="Not attended"
                                  aria-label="Mark not attended"
                                >
                                  <span className="text-[10px] font-bold">
                                    No
                                  </span>
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            {isViewMode ? (
                              <span
                                className="slds-text-3"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                {p.reasonMissed || "—"}
                              </span>
                            ) : p.attended === false ? (
                              <Select
                                value={p.reasonMissed}
                                onValueChange={(v) =>
                                  handleReasonMissed(p.id, v)
                                }
                              >
                                <SelectTrigger
                                  className="h-8 slds-text-3 w-40"
                                  style={{
                                    borderColor:
                                      "var(--slds-g-color-border-base-1)",
                                  }}
                                >
                                  <SelectValue placeholder="Select reason" />
                                </SelectTrigger>
                                <SelectContent>
                                  {REASON_MISSED_OPTIONS.map(
                                    (r) => (
                                      <SelectItem
                                        key={r}
                                        value={r}
                                        className="slds-text-3"
                                      >
                                        {r}
                                      </SelectItem>
                                    ),
                                  )}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span
                                className="slds-text-3"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                —
                              </span>
                            )}
                          </td>
                          {!isViewMode && (
                            <td className="px-3 py-2.5">
                              {p.role !== "Organizer" && (
                                <button
                                  onClick={() =>
                                    handleRemoveParticipant(
                                      p.id,
                                    )
                                  }
                                  aria-label="Remove participant"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "9999px",
                                    cursor: "pointer",
                                    backgroundColor:
                                      "transparent",
                                    color: "#d4183d",
                                    border: "none",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      "color-mix(in srgb, #d4183d 10%, transparent)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      "transparent";
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}

                      {/* Inline Add Row */}
                      {!isViewMode && isAddingParticipant && (
                        <tr
                          style={{
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                          }}
                        >
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              className="h-8 w-full px-2 rounded slds-text-4 bg-white"
                              placeholder="Participant name"
                              value={newParticipantName}
                              onChange={(e) =>
                                setNewParticipantName(
                                  e.target.value,
                                )
                              }
                              style={{
                                border:
                                  "1px solid var(--slds-g-color-border-base-1)",
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Select
                              value={newParticipantRole}
                              onValueChange={
                                setNewParticipantRole
                              }
                            >
                              <SelectTrigger
                                className="h-8 slds-text-3 w-36"
                                style={{
                                  borderColor:
                                    "var(--slds-g-color-border-base-1)",
                                }}
                              >
                                <SelectValue placeholder="Role" />
                              </SelectTrigger>
                              <SelectContent>
                                {CONSTITUENT_ROLE_OPTIONS.map(
                                  (r) => (
                                    <SelectItem
                                      key={r}
                                      value={r}
                                      className="slds-text-3"
                                    >
                                      {r}
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                          </td>
                          <td
                            className="px-3 py-2"
                            colSpan={2}
                          />
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={handleAddParticipant}
                                className="h-7"
                              >
                                Save
                              </Button>
                              <button
                                onClick={() => {
                                  setIsAddingParticipant(false);
                                  setNewParticipantName("");
                                  setNewParticipantRole("");
                                }}
                                className="p-1 rounded"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                                aria-label="Cancel add"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}

                      {participants.length === 0 &&
                        (isViewMode ||
                          !isAddingParticipant) && (
                          <tr>
                            <td
                              colSpan={isViewMode ? 4 : 5}
                              className="px-4 py-6 text-center slds-text-4"
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              No participants added.
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>

                {incidentReport &&
                  incidentReport.youthInvolved.length > 0 && (
                    <p
                      className="slds-text-3 mt-1.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Youth involved in the originating incident
                      report cannot be added as participants.
                    </p>
                  )}
              </div>
            </>
          )}

          {/* ── DETAILS TAB ── */}
          {activeTab === "details" && (
            <>
              {/* Meeting Summary */}
              <div className="space-y-1.5">
                {fieldLabel("Meeting Summary")}
                <textarea
                  className="w-full rounded slds-text-4 px-3 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                  rows={6}
                  placeholder={
                    isViewMode ? "" : "Enter meeting summary"
                  }
                  value={meetingSummary}
                  readOnly={isViewMode}
                  onChange={(e) =>
                    !isViewMode &&
                    setMeetingSummary(e.target.value)
                  }
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                    backgroundColor: isViewMode
                      ? "var(--slds-g-color-background-alt)"
                      : "white",
                    cursor: isViewMode ? "default" : undefined,
                  }}
                />
              </div>

              {/* Individual Participant Notes */}
              <div className="space-y-3">
                <p
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  INDIVIDUAL PARTICIPANT NOTES
                </p>
                {participants.length === 0 ? (
                  <p
                    className="slds-text-4"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    {isViewMode
                      ? "No participants recorded."
                      : "Add participants in the Connection tab to enter individual notes."}
                  </p>
                ) : (
                  participants.map((p) => {
                    const pNote = participantNotes.find(
                      (pn) => pn.id === p.id,
                    );
                    return (
                      <div key={p.id} className="space-y-1">
                        <p
                          className="slds-form-label"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {p.participant}
                        </p>
                        <textarea
                          className="w-full rounded slds-text-4 px-3 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                          rows={3}
                          placeholder={
                            isViewMode
                              ? ""
                              : "Enter participant notes"
                          }
                          value={pNote?.notes ?? ""}
                          readOnly={isViewMode}
                          onChange={(e) => {
                            if (isViewMode) return;
                            const notes = e.target.value;
                            setParticipantNotes((prev) => {
                              const exists = prev.find(
                                (pn) => pn.id === p.id,
                              );
                              if (exists) {
                                return prev.map((pn) =>
                                  pn.id === p.id
                                    ? { ...pn, notes }
                                    : pn,
                                );
                              }
                              return [
                                ...prev,
                                {
                                  id: p.id,
                                  name: p.participant,
                                  notes,
                                },
                              ];
                            });
                          }}
                          style={{
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            color:
                              "var(--slds-g-color-text-default)",
                            backgroundColor: isViewMode
                              ? "var(--slds-g-color-background-alt)"
                              : "white",
                            cursor: isViewMode
                              ? "default"
                              : undefined,
                          }}
                        />
                      </div>
                    );
                  })
                )}
              </div>

              {/* Notes & Attachments */}
              <div className="space-y-1.5">
                {fieldLabel("Notes & Attachments")}
                <textarea
                  className="w-full rounded slds-text-4 px-3 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-[#145F33]"
                  rows={4}
                  placeholder={
                    isViewMode
                      ? ""
                      : "Enter notes and attachments"
                  }
                  value={notesAttachments}
                  readOnly={isViewMode}
                  onChange={(e) =>
                    !isViewMode &&
                    setNotesAttachments(e.target.value)
                  }
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                    backgroundColor: isViewMode
                      ? "var(--slds-g-color-background-alt)"
                      : "white",
                    cursor: isViewMode ? "default" : undefined,
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter
          className="px-6 py-4 shrink-0 flex justify-end gap-2"
          style={{
            borderTop:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          {isViewMode ? (
            <button
              onClick={handleClose}
              className="h-9 px-4 rounded-full slds-text-4 font-medium"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-neutral-95)",
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Close
            </button>
          ) : (
            <>
              <button
                onClick={handleClose}
                className="h-9 px-4 rounded-full slds-text-4 font-medium"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-neutral-95)",
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="h-9 px-4 rounded-full slds-text-4 font-medium text-white"
                style={{ backgroundColor: "#145F33" }}
              >
                {isEditMode ? "Save Changes" : "Save"}
              </button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}