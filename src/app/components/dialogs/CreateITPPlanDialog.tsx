import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Calendar, Check, X, AlertCircle } from "@/app/lib/lucide-icons";
import { VisuallyHidden } from "../ui/visually-hidden";
import {
  ConnectionFormDialog,
  Connection,
} from "../admissions/ConnectionFormDialog";
import { formatMdy, toLocalIso, parseIsoLocal } from "../../lib/dateFormat";

interface CreateITPPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePlan: (planData: ITPPlanData) => void;
}

export interface ITPPlanData {
  youthId: number;
  youthName: string;
  advocate: string;
  therapist: string;
  program: string;
  startDate: string;
  endDate: string;
  carePlanningMeetingExpectedDate: string;
  carePlanningMeetingActualDate: string;
  itpDateExpected: string;
  itpDateActual: string;
  completeDateExpected: string;
  finalizedDateExpected: string;
}

// Mock active youth data
const ACTIVE_YOUTH = [
  {
    id: 1,
    name: "Fozzie Bear",
    advocate: "Sarah Thompson, Esq.",
    therapist: "Dr. Michael Chen",
    program: "Mahoney House",
  },
  {
    id: 2,
    name: "Kermit the Frog",
    advocate: "James Wilson, JD",
    therapist: "Dr. Emily Rodriguez",
    program: "Mahoney House",
  },
  {
    id: 3,
    name: "Red Fraggle",
    advocate: "Patricia Martinez, Esq.",
    therapist: "Dr. David Lee",
    program: "Mahoney House",
  },
  {
    id: 4,
    name: "Miss Piggy",
    advocate: "Robert Anderson, JD",
    therapist: "Dr. Sarah Johnson",
    program: "Mahoney House",
  },
  {
    id: 5,
    name: "Gonzo the Great",
    advocate: "Lisa Thompson, Esq.",
    therapist: "Dr. Michael Chen",
    program: "Walsh Campus",
  },
  {
    id: 6,
    name: "Animal",
    advocate: "John Davis, JD",
    therapist: "Dr. Emily Rodriguez",
    program: "Walsh Campus",
  },
];

const PROGRAMS = Array.from(
  new Set(ACTIVE_YOUTH.map((y) => y.program)),
).sort();

export function CreateITPPlanDialog({
  open,
  onOpenChange,
  onCreatePlan,
}: CreateITPPlanDialogProps) {
  const [selectedProgram, setSelectedProgram] =
    useState<string>("");
  const [selectedYouthId, setSelectedYouthId] =
    useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [
    carePlanningMeetingScheduled,
    setCarePlanningMeetingScheduled,
  ] = useState<string>("");

  // Local state to host the "New Connection / Interaction" modal,
  // opened on top of this dialog via "Schedule Care Planning Meeting".
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] =
    useState(false);
  const [connections, setConnections] = useState<Connection[]>(
    [],
  );
  const [editingConnection, setEditingConnection] =
    useState<Connection | null>(null);
  const nextParticipantIdRef = useRef(1);
  const getNextParticipantId = () =>
    nextParticipantIdRef.current++;

  // Filtered youths for the selected program
  const filteredYouth = selectedProgram
    ? ACTIVE_YOUTH.filter((y) => y.program === selectedProgram)
    : [];

  // Auto-load youth associations when youth is selected
  const selectedYouth = ACTIVE_YOUTH.find(
    (y) => y.id.toString() === selectedYouthId,
  );

  // Reset youth selection when program changes
  useEffect(() => {
    setSelectedYouthId("");
  }, [selectedProgram]);

  // Auto-calculate end date (13 weeks = 91 days after start date)
  useEffect(() => {
    if (startDate) {
      const start = parseIsoLocal(startDate);
      const end = parseIsoLocal(start);
      end.setDate(end.getDate() + 91); // 13 weeks = 91 days
      setEndDate(toLocalIso(end));
    }
  }, [startDate]);

  // Calculate schedule dates based on end date
  const getScheduleDates = () => {
    if (!endDate) return null;

    const end = new Date(endDate);

    // Care Planning Meeting: End Date - 14 days
    const carePlanningMeeting = new Date(end);
    carePlanningMeeting.setDate(
      carePlanningMeeting.getDate() - 14,
    );

    // Complete Date: End Date + 7 days
    const completeDate = new Date(end);
    completeDate.setDate(completeDate.getDate() + 7);

    // Finalized Date: End Date + 14 days
    const finalizedDate = new Date(end);
    finalizedDate.setDate(finalizedDate.getDate() + 14);

    return {
      carePlanningMeetingExpected:
        carePlanningMeetingScheduled ||
        toLocalIso(carePlanningMeeting),
      itpDateExpected: endDate,
      itpDateActual: endDate,
      completeDateExpected: completeDate
        .toISOString()
        .split("T")[0],
      finalizedDateExpected: finalizedDate
        .toISOString()
        .split("T")[0],
    };
  };

  const scheduleDates = getScheduleDates();

  // Check if form is complete
  const isFormComplete =
    selectedProgram && selectedYouthId && startDate && endDate;

  // Handle schedule care planning meeting: opens the "New Connection / Interaction"
  // modal on top of this dialog, pre-set to the Care Planning Meeting type.
  const handleScheduleCarePlanningMeeting = () => {
    setEditingConnection(null);
    setIsConnectionDialogOpen(true);
  };

  // Once the nested Connection modal is saved, reflect its start date back
  // on the ITP Schedule table's Care Planning Meeting row.
  const handleConnectionDialogOpenChange = (open: boolean) => {
    setIsConnectionDialogOpen(open);
    if (!open && connections.length > 0) {
      const latest = connections[connections.length - 1];
      if (
        latest.type === "Care Planning Meeting" &&
        latest.startDate
      ) {
        setCarePlanningMeetingScheduled(latest.startDate);
      }
    }
  };

  // Handle create ITP plan
  const handleCreatePlan = () => {
    if (!isFormComplete || !selectedYouth || !scheduleDates)
      return;

    const planData: ITPPlanData = {
      youthId: selectedYouth.id,
      youthName: selectedYouth.name,
      advocate: selectedYouth.advocate,
      therapist: selectedYouth.therapist,
      program: selectedYouth.program,
      startDate,
      endDate,
      carePlanningMeetingExpectedDate:
        scheduleDates.carePlanningMeetingExpected,
      carePlanningMeetingActualDate: "n/a",
      itpDateExpected: scheduleDates.itpDateExpected,
      itpDateActual: scheduleDates.itpDateActual,
      completeDateExpected: scheduleDates.completeDateExpected,
      finalizedDateExpected:
        scheduleDates.finalizedDateExpected,
    };

    onCreatePlan(planData);
    handleClose();
  };

  // Handle close and reset
  const handleClose = () => {
    setSelectedProgram("");
    setSelectedYouthId("");
    setStartDate("");
    setEndDate("");
    setCarePlanningMeetingScheduled("");
    setConnections([]);
    setEditingConnection(null);
    setIsConnectionDialogOpen(false);
    onOpenChange(false);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "n/a") return "n/a";
    const date = new Date(dateString);
    return formatMdy(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle
            className="text-lg font-semibold"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            Create New ITP Plan
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription>
              Create a new Individual Treatment Plan for a youth
            </DialogDescription>
          </VisuallyHidden>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Program Name */}
          <div className="space-y-1.5">
            <Label
              className="text-sm font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Program Name{" "}
              <span className="text-red-600">*</span>
            </Label>
            <Select
              value={selectedProgram}
              onValueChange={setSelectedProgram}
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
                <SelectValue placeholder="Select Program" />
              </SelectTrigger>
              <SelectContent>
                {PROGRAMS.map((program) => (
                  <SelectItem key={program} value={program}>
                    {program}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Youth Name */}
          <div className="space-y-2">
            <Label
              className="text-sm font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Youth Name <span className="text-red-600">*</span>
            </Label>
            <Select
              value={selectedYouthId}
              onValueChange={setSelectedYouthId}
              disabled={!selectedProgram}
            >
              <SelectTrigger
                className="rounded-md"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor: !selectedProgram
                    ? "var(--slds-g-color-neutral-95)"
                    : "var(--slds-g-color-background-base)",
                  opacity: !selectedProgram ? 0.6 : 1,
                  cursor: !selectedProgram
                    ? "not-allowed"
                    : "default",
                }}
              >
                <SelectValue placeholder="Select Youth" />
              </SelectTrigger>
              <SelectContent>
                {filteredYouth.length > 0 ? (
                  filteredYouth.map((youth) => (
                    <SelectItem
                      key={youth.id}
                      value={youth.id.toString()}
                    >
                      {youth.name}
                    </SelectItem>
                  ))
                ) : (
                  <div
                    className="px-3 py-2 text-sm"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    No youths available for this program
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Auto-loaded Youth Associations */}
          {selectedYouth && (
            <div
              className="p-4 rounded-lg space-y-3"
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <h3
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Youth Associations
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label
                    className="text-xs"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Advocate
                  </Label>
                  <p
                    className="text-sm mt-1"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {selectedYouth.advocate}
                  </p>
                </div>
                <div>
                  <Label
                    className="text-xs"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Therapist
                  </Label>
                  <p
                    className="text-sm mt-1"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {selectedYouth.therapist}
                  </p>
                </div>
                <div>
                  <Label
                    className="text-xs"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Program
                  </Label>
                  <p
                    className="text-sm mt-1"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {selectedYouth.program}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Start & End Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Start Date{" "}
                <span className="text-red-600">*</span>
              </Label>
              <Input
                type="text"
                placeholder="MM/DD/YYYY"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-md"
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
                className="text-sm font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                End Date <span className="text-red-600">*</span>
              </Label>
              <Input
                type="text"
                placeholder="MM/DD/YYYY"
                value={endDate ? formatDate(endDate) : ""}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-md"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              />
              {startDate && (
                <p
                  className="text-xs mt-1"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Auto-populated to 13 weeks (91 days) from
                  start date. Editable.
                </p>
              )}
            </div>
          </div>

          {/* ITP Schedule Table */}
          {scheduleDates && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  ITP Schedule
                </h3>
              </div>
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <Table>
                  <TableHeader>
                    <TableRow
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-alt)",
                      }}
                    >
                      <TableHead
                        className="text-xs font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Event
                      </TableHead>
                      <TableHead
                        className="text-xs font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Expected Date
                      </TableHead>
                      <TableHead
                        className="text-xs font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Actual Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        className="text-sm"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {(() => {
                          const cpm = connections.find(c => c.type === "Care Planning Meeting");
                          if (cpm) {
                            return (
                              <button
                                className="text-sm underline"
                                style={{ color: '#0176d3', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                onClick={() => {
                                  setEditingConnection(cpm);
                                  setIsConnectionDialogOpen(true);
                                }}
                              >
                                Care Planning Meeting
                              </button>
                            );
                          }
                          return "Care Planning Meeting";
                        })()}
                      </TableCell>
                      <TableCell
                        className="text-sm"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {formatDate(
                          scheduleDates.carePlanningMeetingExpected,
                        )}
                      </TableCell>
                      <TableCell
                        className="text-sm"
                        style={{
                          color: connections.find(c => c.type === "Care Planning Meeting")?.startDate
                            ? "var(--slds-g-color-text-default)"
                            : "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {(() => {
                          const cpm = connections.find(c => c.type === "Care Planning Meeting");
                          return cpm?.startDate ? formatDate(cpm.startDate) : "n/a";
                        })()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        className="text-sm"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        ITP Date
                      </TableCell>
                      <TableCell
                        className="text-sm"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {formatDate(
                          scheduleDates.itpDateExpected,
                        )}
                      </TableCell>
                      <TableCell
                        className="text-sm"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {formatDate(
                          scheduleDates.itpDateActual,
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        className="text-sm"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Complete Date
                      </TableCell>
                      <TableCell
                        className="text-sm"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {formatDate(
                          scheduleDates.completeDateExpected,
                        )}
                      </TableCell>
                      <TableCell
                        className="text-sm"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        n/a
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        className="text-sm"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Finalized Date
                      </TableCell>
                      <TableCell
                        className="text-sm"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {formatDate(
                          scheduleDates.finalizedDateExpected,
                        )}
                      </TableCell>
                      <TableCell
                        className="text-sm"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        n/a
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Schedule / Edit Care Planning Meeting Button */}
              {(() => {
                const cpm = connections.find(c => c.type === "Care Planning Meeting");
                return (
                  <Button
                    size="sm"
                    className="rounded-full h-8 text-xs text-white"
                    onClick={() => {
                      setEditingConnection(cpm ?? null);
                      setIsConnectionDialogOpen(true);
                    }}
                    disabled={!scheduleDates}
                    style={{
                      backgroundColor: "var(--color-brand-primary)",
                    }}
                  >
                    <Calendar className="h-3 w-3" />
                    {cpm ? "Edit Care Planning Meeting" : "Schedule Care Planning Meeting"}
                  </Button>
                );
              })()}
            </div>
          )}

          {/* Required Fields Notice */}
          {!isFormComplete && (
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
                <strong>Required Fields:</strong> Please select
                a youth and provide start date to create an ITP
                plan.
              </div>
            </div>
          )}
        </div>

        {/* Dialog Footer */}
        <div
          className="flex items-center justify-end gap-2 pt-4"
          style={{
            borderTop:
              "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <Button
            variant="outline"
            size="sm"
            className="rounded-full h-9 text-sm"
            onClick={handleClose}
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
            onClick={handleCreatePlan}
            disabled={!isFormComplete}
            style={{
              backgroundColor: isFormComplete
                ? "var(--color-brand-primary)"
                : "#ccc",
              cursor: isFormComplete
                ? "pointer"
                : "not-allowed",
            }}
          >
            <Check className="h-3.5 w-3.5" />
            Create ITP Plan
          </Button>
        </div>
      </DialogContent>

      {/* New Connection / Interaction modal — opened via "Schedule Care Planning
          Meeting" above, pre-set to the Care Planning Meeting type. */}
      <ConnectionFormDialog
        isOpen={isConnectionDialogOpen}
        onOpenChange={handleConnectionDialogOpenChange}
        editingConnection={editingConnection}
        setEditingConnection={setEditingConnection}
        connections={connections}
        setConnections={setConnections}
        getNextParticipantId={getNextParticipantId}
        initialType="Care Planning Meeting"
        lockType={true}
      />
    </Dialog>
  );
}