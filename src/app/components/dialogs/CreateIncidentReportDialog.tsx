import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  X,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
} from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner@2.0.3";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, localTodayIso } from "../../lib/dateFormat";
import { getDemoUserName } from "../../lib/demoIdentity";
import { useUnsavedChangesGuard } from "../../lib/useUnsavedChangesGuard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { addIncidentReportRecord } from "../../data/incidentReportStore";

// Mock data for picklists
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

const SCHOOL_RELATED_INCIDENT_TYPES = [
  "In‑School Suspension",
  "Out‑of‑School Suspension",
  "Expulsion",
  "Sent Home from School",
  "Restorative School Intervention",
  "Other School Incident",
];

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

// Mock constituent data
const MOCK_CONSTITUENTS = [
  {
    id: 1,
    name: "Bear, Fozzie",
    type: "Youth",
    program: "Mahoney House",
  },
  {
    id: 2,
    name: "Frog, Kermit",
    type: "Youth",
    program: "Rydell House",
  },
  {
    id: 3,
    name: "Fraggle, Red",
    type: "Youth",
    program: "Mahoney House",
  },
  { id: 4, name: "Smith, John", type: "Staff", program: null },
  {
    id: 5,
    name: "Johnson, Sarah",
    type: "Staff",
    program: null,
  },
  {
    id: 6,
    name: "Davis, Emily",
    type: "Guardian",
    program: null,
  },
];

const MOCK_SCHOOLS = [
  "Lincoln Park High School",
  "Roosevelt High School",
  "Washington Academy",
  "Jefferson Middle School",
];

interface Individual {
  id: string;
  constituentId: number | null;
  constituentName: string;
  constituentType: string;
  program: string;
  incidentRole: string;
  incidentRoleOther: string;
  injured: boolean;
  hrNotifiedDate: string;
  comment: string;
  restraint: boolean;
}

interface CreateIncidentReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
  onSaveAndContinue?: (data: any) => void;
}

export function CreateIncidentReportDialog({
  isOpen,
  onClose,
  onSave,
  onSaveAndContinue,
}: CreateIncidentReportDialogProps) {
  // Get current date and time for initialization
  const getCurrentDate = () => localTodayIso();

  const getCurrentTime = () => {
    const now = new Date();
    return {
      hours: String(now.getHours()).padStart(2, "0"),
      minutes: String(now.getMinutes()).padStart(2, "0"),
      seconds: String(now.getSeconds()).padStart(2, "0"),
    };
  };

  // Overall Incident fields
  const [startDate, setStartDate] = useState(getCurrentDate());
  const currentTime = getCurrentTime();
  const [startTimeHours, setStartTimeHours] = useState(
    currentTime.hours,
  );
  const [startTimeMinutes, setStartTimeMinutes] = useState(
    currentTime.minutes,
  );
  const [startTimeSeconds, setStartTimeSeconds] = useState(
    currentTime.seconds,
  );
  const [endDate, setEndDate] = useState(getCurrentDate());
  const [endTimeHours, setEndTimeHours] = useState("");
  const [endTimeMinutes, setEndTimeMinutes] = useState("");
  const [endTimeSeconds, setEndTimeSeconds] = useState("00");
  const [durationDays, setDurationDays] = useState("0");
  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("0");
  const [durationSeconds, setDurationSeconds] = useState("0");

  // Individuals Involved
  const [individuals, setIndividuals] = useState<Individual[]>(
    [],
  );
  const [isAddingIndividual, setIsAddingIndividual] =
    useState(false);
  const [editingIndividualId, setEditingIndividualId] =
    useState<string | null>(null);
  const [currentIndividual, setCurrentIndividual] =
    useState<Individual>({
      id: "",
      constituentId: null,
      constituentName: "",
      constituentType: "",
      program: "",
      incidentRole: "",
      incidentRoleOther: "",
      injured: false,
      hrNotifiedDate: "",
      comment: "",
      restraint: false,
    });

  // Incident Classification
  const [selectedIncidentTypes, setSelectedIncidentTypes] =
    useState<string[]>([]);
  const [selectedSchool, setSelectedSchool] = useState("");

  // Location
  const [selectedLocations, setSelectedLocations] = useState<
    string[]
  >([]);
  const [otherLocation, setOtherLocation] = useState("");

  // Contributors
  const [contributors, setContributors] = useState<string[]>([
    getDemoUserName(),
  ]);
  const navigate = useNavigate();
  const submittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeError, setTimeError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const [dirty, setDirty] = useState(false);

  // Reset all state each time the dialog opens, then add the report creator.
  useEffect(() => {
    if (!isOpen) return;
    const t = getCurrentTime();
    setStartDate(getCurrentDate());
    setStartTimeHours(t.hours);
    setStartTimeMinutes(t.minutes);
    setStartTimeSeconds(t.seconds);
    setEndDate(getCurrentDate());
    setEndTimeHours("");
    setEndTimeMinutes("");
    setEndTimeSeconds("00");
    setDurationDays("0");
    setDurationHours("0");
    setDurationMinutes("0");
    setDurationSeconds("0");
    setIsAddingIndividual(false);
    setEditingIndividualId(null);
    setSelectedIncidentTypes([]);
    setSelectedSchool("");
    setSelectedLocations([]);
    setOtherLocation("");
    setTimeError("");
    setContributors([getDemoUserName()]);
    setIndividuals([
      {
        id: Date.now().toString(),
        constituentId: 4,
        constituentName: getDemoUserName(),
        constituentType: "Staff",
        program: "",
        incidentRole: "Staff Involved",
        incidentRoleOther: "",
        injured: false,
        hrNotifiedDate: "",
        comment: "Report creator",
        restraint: false,
      },
    ]);
    submittingRef.current = false;
    setIsSubmitting(false);
    setDirty(false);
    setConfirmDiscard(false);
    requestAnimationFrame(() => dialogRef.current?.focus());
  }, [isOpen]);

  // Calculate duration when start/end dates change
  useEffect(() => {
    if (
      startDate &&
      startTimeHours &&
      startTimeMinutes &&
      endDate &&
      endTimeHours &&
      endTimeMinutes
    ) {
      const start = new Date(
        `${startDate}T${startTimeHours.padStart(2, "0")}:${startTimeMinutes.padStart(2, "0")}:${startTimeSeconds.padStart(2, "0")}`,
      );
      const end = new Date(
        `${endDate}T${endTimeHours.padStart(2, "0")}:${endTimeMinutes.padStart(2, "0")}:${endTimeSeconds.padStart(2, "0")}`,
      );

      if (end > start) {
        const diffMs = end.getTime() - start.getTime();
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor(
          (diffMs % (1000 * 60 * 60)) / (1000 * 60),
        );
        const seconds = Math.floor(
          (diffMs % (1000 * 60)) / 1000,
        );

        setDurationDays(days.toString());
        setDurationHours(hours.toString());
        setDurationMinutes(minutes.toString());
        setDurationSeconds(seconds.toString());
      } else {
        setDurationDays("0");
        setDurationHours("0");
        setDurationMinutes("0");
        setDurationSeconds("0");
      }
      setTimeError(
        end < start ? "End date and time must not be before the start date and time." : "",
      );
    } else {
      setDurationDays("0");
      setDurationHours("0");
      setDurationMinutes("0");
      setDurationSeconds("0");
      setTimeError("");
    }
  }, [
    startDate,
    startTimeHours,
    startTimeMinutes,
    startTimeSeconds,
    endDate,
    endTimeHours,
    endTimeMinutes,
    endTimeSeconds,
  ]);

  // Check if school-related incident type is selected
  const showSchoolField = selectedIncidentTypes.some((type) =>
    SCHOOL_RELATED_INCIDENT_TYPES.includes(type),
  );

  // Check if "Other" location is selected
  const showOtherLocation = selectedLocations.includes("Other");

  const handleAddIndividual = () => {
    setIsAddingIndividual(true);
    setCurrentIndividual({
      id: "",
      constituentId: null,
      constituentName: "",
      constituentType: "",
      program: "",
      incidentRole: "",
      incidentRoleOther: "",
      injured: false,
      hrNotifiedDate: "",
      comment: "",
      restraint: false,
    });
  };

  const handleSaveIndividual = () => {
    if (
      !currentIndividual.constituentName ||
      !currentIndividual.incidentRole
    ) {
      toast.error(
        "Please select a constituent and incident role",
      );
      return;
    }

    if (
      currentIndividual.incidentRole === "Other" &&
      !currentIndividual.incidentRoleOther
    ) {
      toast.error("Please specify the incident role");
      return;
    }

    if (editingIndividualId) {
      setIndividuals(
        individuals.map((ind) =>
          ind.id === editingIndividualId
            ? currentIndividual
            : ind,
        ),
      );
      toast.success("Individual updated successfully");
    } else {
      setIndividuals([
        ...individuals,
        { ...currentIndividual, id: Date.now().toString() },
      ]);
      toast.success("Individual added successfully");
    }

    setIsAddingIndividual(false);
    setEditingIndividualId(null);
  };

  const handleEditIndividual = (individual: Individual) => {
    setCurrentIndividual(individual);
    setEditingIndividualId(individual.id);
    setIsAddingIndividual(true);
  };

  const handleDeleteIndividual = (id: string) => {
    setIndividuals(individuals.filter((ind) => ind.id !== id));
    toast.success("Individual removed");
  };

  const handleConstituentSelect = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const constituentId = parseInt(e.target.value);
    const constituent = MOCK_CONSTITUENTS.find(
      (c) => c.id === constituentId,
    );

    if (constituent) {
      setCurrentIndividual({
        ...currentIndividual,
        constituentId: constituent.id,
        constituentName: constituent.name,
        constituentType: constituent.type,
        program:
          constituent.type === "Youth"
            ? constituent.program || ""
            : "",
      });
    }
  };

  const handleIncidentTypeToggle = (type: string) => {
    if (selectedIncidentTypes.includes(type)) {
      setSelectedIncidentTypes(
        selectedIncidentTypes.filter((t) => t !== type),
      );
    } else {
      setSelectedIncidentTypes([
        ...selectedIncidentTypes,
        type,
      ]);
    }
  };

  const handleLocationToggle = (location: string) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(
        selectedLocations.filter((l) => l !== location),
      );
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  const validateForm = () => {
    if (!startDate || !startTimeHours || !startTimeMinutes) {
      toast.error(
        "Please enter the start date and time of the incident",
      );
      return false;
    }

    if (timeError) {
      toast.error(timeError);
      return false;
    }

    if (individuals.length === 0) {
      toast.error(
        "Please add at least one individual involved",
      );
      return false;
    }

    // Incident Type / Location pickers are not shown in this form, so they are not required here.

    return true;
  };

  const persist = (): { ok: true; id: number } | { ok: false } => {
    const youth = individuals.filter((i) => i.constituentType === "Youth");
    const staff = individuals.filter((i) => i.constituentType === "Staff");
    const result = addIncidentReportRecord({
      constituentIds: youth.map((y) => y.constituentId).filter((n): n is number => n != null),
      youthInvolved: youth.map((y) => y.constituentName).join("; "),
      incidentStartDateTime: `${startDate}T${startTimeHours.padStart(2, "0")}:${startTimeMinutes.padStart(2, "0")}:${startTimeSeconds.padStart(2, "0")}`,
      program: youth.find((y) => y.program)?.program || "",
      staffInvolved: staff.map((x) => x.constituentName).join("; "),
      incidentTypes: selectedIncidentTypes,
    });
    if (!result.ok) {
      toast.error(`Incident report could not be saved. Your entries are preserved. ${result.message}`);
      return { ok: false };
    }
    return { ok: true, id: result.record.id };
  };

  const buildData = () => ({
    startDate,
    startTime: `${startTimeHours}:${startTimeMinutes}:${startTimeSeconds}`,
    endDate,
    endTime: endDate ? `${endTimeHours}:${endTimeMinutes}:${endTimeSeconds}` : null,
    duration: { days: durationDays, hours: durationHours, minutes: durationMinutes, seconds: durationSeconds },
    individuals,
    incidentTypes: selectedIncidentTypes,
    school: showSchoolField ? selectedSchool : null,
    locations: selectedLocations,
    otherLocation: showOtherLocation ? otherLocation : null,
    contributors,
  });

  const submit = (andContinue: boolean) => {
    if (submittingRef.current) return;
    if (!validateForm()) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    const saved = persist();
    if (!saved.ok) {
      submittingRef.current = false;
      setIsSubmitting(false);
      return;
    }
    setDirty(false);
    const data = buildData();
    if (andContinue) {
      toast.success("Incident Report saved. Proceeding to Youth IR Details...");
      onSaveAndContinue?.(data);
      onClose();
      navigate(`/youth-ir-details/${saved.id}`);
    } else {
      toast.success("Incident Report saved (In Progress)");
      onSave?.(data);
      onClose();
    }
  };

  const handleSaveAndClose = () => submit(false);
  const handleSaveAndContinue = () => submit(true);

  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const handleCancel = () => {
    if (isSubmitting) return;
    if (dirty) {
      setConfirmDiscard(true);
      return;
    }
    onClose();
  };

  const guard = useUnsavedChangesGuard(isOpen && dirty, () => {
    setDirty(false);
    onClose();
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {guard}
      <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard this incident report?</AlertDialogTitle>
            <AlertDialogDescription>Any unsaved changes will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmDiscard(false);
                setDirty(false);
                onClose();
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-incident-title"
        tabIndex={-1}
        onChange={() => setDirty(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && !e.defaultPrevented) {
            e.stopPropagation();
            handleCancel();
          }
        }}
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col focus:outline-none"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
        }}
      >
        {/* Modal Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            borderColor: "var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <h2
            id="create-incident-title"
            className="text-xl font-semibold"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            Create New Incident Report
          </h2>
          <button
            onClick={handleCancel}
            aria-label="Close"
            className="p-1 rounded hover:bg-gray-200 transition-colors focus-visible:outline focus-visible:outline-2"
          >
            <X
              className="h-5 w-5"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {(() => {
            // Compute duration from start/end datetime (read-only)
            let calcDays = 0, calcHours = 0, calcMinutes = 0;
            if (startDate && endDate) {
              const sh = (startTimeHours || "0").padStart(2, "0");
              const sm = (startTimeMinutes || "0").padStart(2, "0");
              const ss = (startTimeSeconds || "0").padStart(2, "0");
              const eh = (endTimeHours || "0").padStart(2, "0");
              const em = (endTimeMinutes || "0").padStart(2, "0");
              const es = (endTimeSeconds || "0").padStart(2, "0");
              const startMs = new Date(`${startDate}T${sh}:${sm}:${ss}`).getTime();
              const endMs = new Date(`${endDate}T${eh}:${em}:${es}`).getTime();
              const diffMs = Math.max(0, endMs - startMs);
              const totalMin = Math.floor(diffMs / 60000);
              calcDays = Math.floor(totalMin / 1440);
              calcHours = Math.floor((totalMin % 1440) / 60);
              calcMinutes = totalMin % 60;
            }
            const readOnlyCellStyle = {
              border: "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor: "var(--slds-g-color-neutral-95)",
              color: "var(--slds-g-color-text-default)",
            };
            return (
              <>
                {/* Overall Incident Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--slds-g-color-text-default)" }}>
                    Overall Incident
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Start Date/Time */}
                    <div>
                      <Label className="text-sm mb-1.5 block font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
                        Start Date & Time <span className="text-red-600">*</span>
                      </Label>
                      <div className="flex items-center gap-3">
                        <DateInput
                          value={isoToMdy(startDate)}
                          onChange={(v) => ((e) => setStartDate(e.target.value))({ target: { value: mdyToIso(v) } })}
                          className="h-9 text-sm flex-1"
                          style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
                          required
                        />
                        <Input
                          type="time"
                          aria-label="Start time"
                          value={startTimeHours && startTimeMinutes ? `${startTimeHours.padStart(2, "0")}:${startTimeMinutes.padStart(2, "0")}:${startTimeSeconds.padStart(2, "0")}` : ""}
                          onChange={(e) => {
                            if (e.target.value) {
                              const [hours, minutes, seconds = "00"] = e.target.value.split(":");
                              setStartTimeHours(hours);
                              setStartTimeMinutes(minutes);
                              setStartTimeSeconds(seconds);
                            } else {
                              setStartTimeHours("");
                              setStartTimeMinutes("");
                              setStartTimeSeconds("00");
                            }
                          }}
                          step="1"
                          className="h-9 text-sm w-32"
                          style={{ borderColor: "var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)" }}
                          required
                        />
                      </div>
                    </div>
                    {/* End Date/Time */}
                    <div>
                      <Label className="text-sm mb-1.5 block font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
                        End Date & Time
                      </Label>
                      <div className="flex items-center gap-3">
                        <DateInput
                          value={isoToMdy(endDate)}
                          onChange={(v) => ((e) => setEndDate(e.target.value))({ target: { value: mdyToIso(v) } })}
                          className="h-9 text-sm flex-1"
                          style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
                        />
                        <Input
                          type="time"
                          aria-label="End time"
                          aria-invalid={timeError ? true : undefined}
                          value={endTimeHours && endTimeMinutes ? `${endTimeHours.padStart(2, "0")}:${endTimeMinutes.padStart(2, "0")}:${endTimeSeconds.padStart(2, "0")}` : ""}
                          onChange={(e) => {
                            if (e.target.value) {
                              const [hours, minutes, seconds = "00"] = e.target.value.split(":");
                              setEndTimeHours(hours);
                              setEndTimeMinutes(minutes);
                              setEndTimeSeconds(seconds);
                            } else {
                              setEndTimeHours("");
                              setEndTimeMinutes("");
                              setEndTimeSeconds("00");
                            }
                          }}
                          step="1"
                          className="h-9 text-sm w-32"
                          style={{ borderColor: "var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)" }}
                        />
                      </div>
                    </div>
                  </div>
                  {timeError && (
                    <p role="alert" className="text-sm mt-2" style={{ color: "var(--slds-g-color-error, #C23934)" }}>
                      {timeError}
                    </p>
                  )}
                  {/* Duration — read-only, auto-calculated */}
                  <div className="mt-6">
                    <Label className="text-sm mb-1.5 block font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
                      Duration of Incident
                    </Label>
                    <div className="flex items-center justify-center gap-2 p-3 rounded" style={{ backgroundColor: "var(--slds-g-color-background-alt)", border: "1px solid var(--slds-g-color-border-base-1)" }}>
                      <div className="flex items-center gap-1.5">
                        <div className="h-8 w-16 flex items-center justify-center rounded text-sm font-medium" style={readOnlyCellStyle}>{calcDays}</div>
                        <span className="text-xs font-medium" style={{ color: "var(--slds-g-color-text-weak)" }}>days</span>
                      </div>
                      <span className="text-sm" style={{ color: "var(--slds-g-color-text-weak)" }}>:</span>
                      <div className="flex items-center gap-1.5">
                        <div className="h-8 w-16 flex items-center justify-center rounded text-sm font-medium" style={readOnlyCellStyle}>{calcHours}</div>
                        <span className="text-xs font-medium" style={{ color: "var(--slds-g-color-text-weak)" }}>hrs</span>
                      </div>
                      <span className="text-sm" style={{ color: "var(--slds-g-color-text-weak)" }}>:</span>
                      <div className="flex items-center gap-1.5">
                        <div className="h-8 w-16 flex items-center justify-center rounded text-sm font-medium" style={readOnlyCellStyle}>{calcMinutes}</div>
                        <span className="text-xs font-medium" style={{ color: "var(--slds-g-color-text-weak)" }}>min</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individuals Involved Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
                      Individuals Involved
                    </h3>
                    <Button
                      size="sm"
                      onClick={handleAddIndividual}
                      disabled={isAddingIndividual}
                      style={{ backgroundColor: "var(--color-brand-primary)", color: "white", borderRadius: "9999px" }}
                      className="h-8 px-3 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Add Individual
                    </Button>
                  </div>

                  {/* Informational Banner */}
                  <div className="mb-4 p-3 rounded flex items-start gap-2" style={{ backgroundColor: "#E8F4F8", border: "1px solid #54698D" }}>
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "#54698D" }} />
                    <p className="text-sm" style={{ color: "#54698D" }}>
                      Add all constituents involved in this incident (Youth, Staff, Guardian, School Personnel, Employer, …). For non‑Youth constituents, a brief statement describing their involvement should be added to the 'Comment' field.
                    </p>
                  </div>

                  {/* Add/Edit Individual Form */}
                  {isAddingIndividual && (
                    <div className="mb-4 p-4 rounded border" style={{ borderColor: "var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-alt)" }}>
                      <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--slds-g-color-text-default)" }}>
                        {editingIndividualId ? "Edit Individual" : "Add Individual"}
                      </h4>
                      <div className="space-y-4">
                        {/* Row 1: Constituent | Program */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs mb-1.5 block font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
                              Constituent <span className="text-red-600">*</span>
                            </Label>
                            <select
                              value={currentIndividual.constituentId || ""}
                              onChange={handleConstituentSelect}
                              className="w-full h-9 text-sm px-3 rounded"
                              style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "white" }}
                            >
                              <option value="">Select Constituent...</option>
                              {MOCK_CONSTITUENTS.map((c) => (
                                <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label className="text-xs mb-1.5 block font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
                              Program
                            </Label>
                            <Input
                              value={currentIndividual.program || (currentIndividual.constituentId ? "N/A" : "")}
                              readOnly
                              className="h-9 text-sm"
                              style={{ borderColor: "var(--slds-g-color-border-base-1)", backgroundColor: "#F3F3F3", color: "var(--slds-g-color-text-weak)" }}
                              placeholder={currentIndividual.constituentType === "Youth" ? "Auto-populated" : "N/A"}
                            />
                          </div>
                        </div>
                        {/* Row 2: Incident Role | Checkboxes */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs mb-1.5 block font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
                                Incident Role <span className="text-red-600">*</span>
                              </Label>
                              <select
                                value={currentIndividual.incidentRole}
                                onChange={(e) => setCurrentIndividual({ ...currentIndividual, incidentRole: e.target.value })}
                                className="w-full h-9 text-sm px-3 rounded"
                                style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "white" }}
                              >
                                <option value="">Select Role...</option>
                                {INCIDENT_ROLES.map((role) => (
                                  <option key={role} value={role}>{role}</option>
                                ))}
                              </select>
                            </div>
                            {/* Conditional Specify Role */}
                            {currentIndividual.incidentRole === "Other" && (
                              <div>
                                <Label className="text-xs mb-1.5 block font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
                                  Specify Role <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                  value={currentIndividual.incidentRoleOther}
                                  onChange={(e) => setCurrentIndividual({ ...currentIndividual, incidentRoleOther: e.target.value })}
                                  placeholder="Enter role..."
                                  className="h-9 text-sm"
                                  style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
                                />
                              </div>
                            )}
                          </div>
                          {/* Checkboxes + conditional HR Notified */}
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs mb-1.5 block font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
                                &nbsp;
                              </Label>
                              <div className="flex flex-wrap gap-4 h-9 items-center">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id="injured"
                                    checked={currentIndividual.injured}
                                    onChange={(e) => setCurrentIndividual({ ...currentIndividual, injured: e.target.checked, hrNotifiedDate: e.target.checked ? currentIndividual.hrNotifiedDate : "" })}
                                    className="h-4 w-4"
                                  />
                                  <Label htmlFor="injured" className="text-sm font-medium cursor-pointer" style={{ color: "var(--slds-g-color-text-default)" }}>Injured</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id="restraint"
                                    checked={currentIndividual.restraint}
                                    onChange={(e) => setCurrentIndividual({ ...currentIndividual, restraint: e.target.checked })}
                                    className="h-4 w-4"
                                  />
                                  <Label htmlFor="restraint" className="text-sm font-medium cursor-pointer" style={{ color: "var(--slds-g-color-text-default)" }}>Restraint</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id="substanceUse"
                                    checked={(currentIndividual as any).substanceUse ?? false}
                                    onChange={(e) => setCurrentIndividual({ ...currentIndividual, substanceUse: e.target.checked } as any)}
                                    className="h-4 w-4"
                                  />
                                  <Label htmlFor="substanceUse" className="text-sm font-medium cursor-pointer" style={{ color: "var(--slds-g-color-text-default)" }}>Substance Use</Label>
                                </div>
                              </div>
                            </div>
                            {/* HR Notified (conditional on injured) */}
                            {currentIndividual.injured && (
                              <div>
                                <Label className="text-xs mb-1.5 block font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
                                  HR Notified
                                </Label>
                                <DateInput
                                  value={isoToMdy(currentIndividual.hrNotifiedDate)}
                                  onChange={(v) => ((e) => setCurrentIndividual({ ...currentIndividual, hrNotifiedDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
                                  className="h-9 text-sm"
                                  style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Comment — full width */}
                        <div>
                          <Label className="text-xs mb-1.5 block font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
                            Comment
                          </Label>
                          <textarea
                            value={currentIndividual.comment}
                            onChange={(e) => setCurrentIndividual({ ...currentIndividual, comment: e.target.value })}
                            placeholder="Describe their involvement..."
                            rows={2}
                            className="w-full px-3 py-2 text-sm rounded resize-none"
                            style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "white" }}
                          />
                        </div>
                      </div>
                      {/* Form Actions — bottom right */}
                      <div className="flex items-center justify-end gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setIsAddingIndividual(false); setEditingIndividualId(null); }}
                          className="h-8 px-3 text-xs"
                          style={{ borderRadius: "9999px" }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveIndividual}
                          style={{ backgroundColor: "var(--color-brand-primary)", color: "white", borderRadius: "9999px" }}
                          className="h-8 px-3 text-xs"
                        >
                          {editingIndividualId ? "Save" : "Add"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Individuals Table */}
                  {individuals.length > 0 && (
                    <div className="border rounded overflow-hidden" style={{ borderColor: "var(--slds-g-color-border-base-1)" }}>
                      <table className="w-full">
                        <thead style={{ backgroundColor: "var(--slds-g-color-background-alt)" }}>
                          <tr>
                            {(["Constituent", "Program", "Incident Role", "Injured", "Restraint", "Substance Use", "Comment"] as const).map((col) => (
                              <th key={col} className="px-4 py-2 text-left text-xs font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>{col}</th>
                            ))}
                            <th className="px-4 py-2 text-right text-xs font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {individuals.map((individual) => (
                            <tr key={individual.id} className="border-t" style={{ borderColor: "var(--slds-g-color-border-base-1)" }}>
                              <td className="px-4 py-3 text-sm" style={{ color: "var(--color-brand-primary)" }}>
                                <button className="hover:underline">{individual.constituentName}</button>
                              </td>
                              <td className="px-4 py-3 text-sm" style={{ color: "var(--slds-g-color-text-default)" }}>{individual.program || "—"}</td>
                              <td className="px-4 py-3 text-sm" style={{ color: "var(--slds-g-color-text-default)" }}>
                                {individual.incidentRole === "Other" ? individual.incidentRoleOther : individual.incidentRole}
                              </td>
                              <td className="px-4 py-3 text-sm" style={{ color: "var(--slds-g-color-text-default)" }}>{individual.injured ? "Yes" : "No"}</td>
                              <td className="px-4 py-3 text-sm" style={{ color: "var(--slds-g-color-text-default)" }}>{individual.restraint ? "Yes" : "No"}</td>
                              <td className="px-4 py-3 text-sm" style={{ color: "var(--slds-g-color-text-default)" }}>{(individual as any).substanceUse ? "Yes" : "No"}</td>
                              <td className="px-4 py-3 text-sm" style={{ color: "var(--slds-g-color-text-default)" }}>{individual.comment || "—"}</td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button onClick={() => handleEditIndividual(individual)} className="p-1 rounded hover:bg-gray-100" title="Edit">
                                    <Edit2 className="h-3.5 w-3.5" style={{ color: "var(--slds-g-color-text-weak)" }} />
                                  </button>
                                  <button onClick={() => handleDeleteIndividual(individual.id)} className="p-1 rounded hover:bg-gray-100" title="Delete">
                                    <Trash2 className="h-3.5 w-3.5" style={{ color: "var(--slds-g-color-text-weak)" }} />
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

                {/* Incident Classification Section */}
                {/* <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--slds-g-color-text-default)" }}>
                    Incident Classification
                  </h3>
                  <div>
                    <Label className="text-sm mb-1.5 block font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
                      Incident Type <span className="text-red-600">*</span>
                    </Label>
                    <div className="border rounded p-4 max-h-60 overflow-y-auto" style={{ borderColor: "var(--slds-g-color-border-base-1)" }}>
                      <div className="grid grid-cols-2 gap-2">
                        {INCIDENT_TYPES.map((type) => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedIncidentTypes.includes(type)}
                              onChange={() => handleIncidentTypeToggle(type)}
                              className="h-4 w-4"
                            />
                            <span className="text-sm" style={{ color: "var(--slds-g-color-text-default)" }}>{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {showSchoolField && (
                      <div className="mt-4">
                        <Label className="text-sm mb-1.5 block font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
                          School
                        </Label>
                        <select
                          value={selectedSchool}
                          onChange={(e) => setSelectedSchool(e.target.value)}
                          className="w-full h-9 text-sm px-3 rounded"
                          style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "white" }}
                        >
                          <option value="">Select School...</option>
                          {MOCK_SCHOOLS.map((school) => (
                            <option key={school} value={school}>{school}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div> */}

                {/* Location Section */}
                {/*<div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--slds-g-color-text-default)" }}>
                    Location
                  </h3>
                  <div>
                    <Label className="text-sm mb-1.5 block font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
                      Location <span className="text-red-600">*</span>
                    </Label>
                    <div className="border rounded p-4" style={{ borderColor: "var(--slds-g-color-border-base-1)" }}>
                      <div className="grid grid-cols-3 gap-2">
                        {LOCATION_OPTIONS.map((location) => (
                          <label key={location} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedLocations.includes(location)}
                              onChange={() => handleLocationToggle(location)}
                              className="h-4 w-4"
                            />
                            <span className="text-sm" style={{ color: "var(--slds-g-color-text-default)" }}>{location}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {showOtherLocation && (
                      <div className="mt-4">
                        <Label className="text-sm mb-1.5 block font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>
                          Specify Other Location <span className="text-red-600">*</span>
                        </Label>
                        <Input
                          value={otherLocation}
                          onChange={(e) => setOtherLocation(e.target.value)}
                          placeholder="Enter location..."
                          className="h-9 text-sm"
                          style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
                        />
                      </div>
                    )}
                  </div>
                </div>*/}

                {/* Contributors Section */}
                <div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <h3 className="text-lg font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
                      Contributors
                    </h3>
                    <span className="text-sm" style={{ color: "var(--slds-g-color-text-weak)" }}>
                      (Auto-populated with current user)
                    </span>
                  </div>
                  <div className="space-y-2">
                    {contributors.map((contributor, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded border"
                        style={{ borderColor: "var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-alt)" }}
                      >
                        <div
                          className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold"
                          style={{ backgroundColor: "#145F33", color: "white" }}
                        >
                          {String(contributor).split(" ").map((n: string) => n[0]).filter(Boolean).slice(0, 2).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>{contributor}</p>
                          <p className="text-xs" style={{ color: "var(--slds-g-color-text-weak)" }}>Current User</p>
                        </div>
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: "#E8F4E8", color: "#145F33", border: "1px solid #145F33" }}
                        >
                          Staff
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-end gap-3" style={{ borderColor: "var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-alt)" }}>
          <Button variant="outline" onClick={handleCancel} className="h-9 px-4 text-sm" style={{ borderRadius: "9999px" }}>
            Cancel
          </Button>
          <Button variant="outline" disabled={isSubmitting} onClick={handleSaveAndClose} className="h-9 px-4 text-sm" style={{ borderRadius: "9999px" }}>
            {isSubmitting ? "Saving..." : "Save & Close"}
          </Button>
          <Button disabled={isSubmitting} onClick={handleSaveAndContinue} className="h-9 px-4 text-sm text-white" style={{ backgroundColor: "var(--color-brand-primary)", borderRadius: "9999px" }}>
            {isSubmitting ? "Saving..." : "Save & Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}