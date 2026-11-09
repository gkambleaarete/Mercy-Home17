import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";
import { Plus, Edit2, Trash2, AlertCircle } from "@/app/lib/lucide-icons";
import { getDemoUserName } from "../../lib/demoIdentity";
import { toast } from "sonner@2.0.3";

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

const MOCK_CONSTITUENTS = [
  { id: 1, name: "Bear, Fozzie", type: "Youth", program: "Mahoney House" },
  { id: 2, name: "Frog, Kermit", type: "Youth", program: "Rydell House" },
  { id: 3, name: "Fraggle, Red", type: "Youth", program: "Mahoney House" },
  { id: 4, name: "Smith, John", type: "Staff", program: null },
  { id: 5, name: "Johnson, Sarah", type: "Staff", program: null },
  { id: 6, name: "Davis, Emily", type: "Guardian", program: null },
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
  substanceUse: boolean;
}

const BLANK_INDIVIDUAL: Individual = {
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
  substanceUse: false,
};

interface ConstituentCreateIncidentDialogProps {
  createIncidentDialogOpen: any;
  setCreateIncidentDialogOpen: any;
  newIncidentType: any;
  setNewIncidentType: any;
  newIncidentOtherType: any;
  setNewIncidentOtherType: any;
  newIncidentOtherTypeError: boolean;
  setNewIncidentOtherTypeError: any;
  newIncidentStartDate: any;
  setNewIncidentStartDate: any;
  newIncidentStartTime: any;
  setNewIncidentStartTime: any;
  newIncidentEndDate: any;
  setNewIncidentEndDate: any;
  newIncidentEndTime: any;
  setNewIncidentEndTime: any;
  newIncidentIndividuals: any;
  setNewIncidentIndividuals: any;
  newIncidentProgram: any;
  setNewIncidentProgram: any;
  newIncidentInvolvementType: any;
  setNewIncidentInvolvementType: any;
  newIncidentLocation: any;
  setNewIncidentLocation: any;
  newIncidentDescription: any;
  setNewIncidentDescription: any;
  handleCancelCreateIncident: any;
  handleSaveCreateIncident: any;
  /** Community Care Member profile: the viewed member, pre-selected as an
   *  individual involved (by Constituent ID). */
  participant?: IncidentPerson;
  /** Real constituents to pick additional individuals from (replaces the
   *  built-in sample list). */
  constituentOptions?: IncidentPerson[];
  /** When given, Save validates and hands the incident here instead of the
   *  host's handler. Returns an error message, or null once it is saved. */
  onSubmitIncident?: (data: SubmittedIncident) => string | null;
}

export interface IncidentPerson {
  id: number;
  name: string;
  type: string;
  program: string | null;
}

export interface SubmittedIncident {
  startDateTime: string; // ISO local "YYYY-MM-DDTHH:MM:SS"
  endDateTime: string; // "" when not entered
  individuals: {
    constituentId: number | null;
    name: string;
    role: string;
    program: string;
  }[];
}

export function ConstituentCreateIncidentDialog({
  createIncidentDialogOpen,
  setCreateIncidentDialogOpen,
  handleCancelCreateIncident,
  handleSaveCreateIncident,
  participant,
  constituentOptions,
  onSubmitIncident,
}: ConstituentCreateIncidentDialogProps) {
  const options = constituentOptions ?? MOCK_CONSTITUENTS;
  const today = () => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  };

  const [startDate, setStartDate] = useState(today());
  const [startTimeHours, setStartTimeHours] = useState("");
  const [startTimeMinutes, setStartTimeMinutes] = useState("");
  const [startTimeSeconds, setStartTimeSeconds] = useState("00");
  const [endDate, setEndDate] = useState(today());
  const [endTimeHours, setEndTimeHours] = useState("");
  const [endTimeMinutes, setEndTimeMinutes] = useState("");
  const [endTimeSeconds, setEndTimeSeconds] = useState("00");

  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [isAddingIndividual, setIsAddingIndividual] = useState(false);
  const [editingIndividualId, setEditingIndividualId] = useState<string | null>(null);
  const [currentIndividual, setCurrentIndividual] = useState<Individual>(BLANK_INDIVIDUAL);

  // New entries are attributed to the selected demo identity.
  const contributors = [getDemoUserName()];

  useEffect(() => {
    if (createIncidentDialogOpen) {
      setStartDate(today());
      setEndDate(today());
      setStartTimeHours("");
      setStartTimeMinutes("");
      setStartTimeSeconds("00");
      setEndTimeHours("");
      setEndTimeMinutes("");
      setEndTimeSeconds("00");
      setIsAddingIndividual(false);
      setEditingIndividualId(null);
      setCurrentIndividual(BLANK_INDIVIDUAL);
      const youth = participant ?? MOCK_CONSTITUENTS[0];
      setIndividuals([{
        id: "prepop-youth",
        constituentId: youth.id,
        constituentName: youth.name,
        constituentType: youth.type,
        program: youth.program ?? "",
        incidentRole: "Youth Involved",
        incidentRoleOther: "",
        injured: false,
        hrNotifiedDate: "",
        comment: "",
        restraint: false,
        substanceUse: false,
      }]);
    }
  }, [createIncidentDialogOpen]);

  let calcDays = 0, calcHours = 0, calcMinutes = 0;
  if (startDate && endDate && startTimeHours && endTimeHours) {
    const sh = startTimeHours.padStart(2, "0");
    const sm = (startTimeMinutes || "0").padStart(2, "0");
    const ss = (startTimeSeconds || "0").padStart(2, "0");
    const eh = endTimeHours.padStart(2, "0");
    const em = (endTimeMinutes || "0").padStart(2, "0");
    const es = (endTimeSeconds || "0").padStart(2, "0");
    const diffMs = Math.max(0, new Date(`${endDate}T${eh}:${em}:${es}`).getTime() - new Date(`${startDate}T${sh}:${sm}:${ss}`).getTime());
    const totalMin = Math.floor(diffMs / 60000);
    calcDays = Math.floor(totalMin / 1440);
    calcHours = Math.floor((totalMin % 1440) / 60);
    calcMinutes = totalMin % 60;
  }

  const handleAddIndividual = () => {
    setCurrentIndividual(BLANK_INDIVIDUAL);
    setEditingIndividualId(null);
    setIsAddingIndividual(true);
  };

  const handleSaveIndividual = () => {
    if (!currentIndividual.constituentName || !currentIndividual.incidentRole) return;
    if (currentIndividual.incidentRole === "Other" && !currentIndividual.incidentRoleOther) return;
    if (editingIndividualId) {
      setIndividuals((prev) => prev.map((ind) => ind.id === editingIndividualId ? currentIndividual : ind));
    } else {
      setIndividuals((prev) => [...prev, { ...currentIndividual, id: String(Date.now()) }]);
    }
    setIsAddingIndividual(false);
    setEditingIndividualId(null);
    setCurrentIndividual(BLANK_INDIVIDUAL);
  };

  const handleEditIndividual = (ind: Individual) => {
    setCurrentIndividual(ind);
    setEditingIndividualId(ind.id);
    setIsAddingIndividual(true);
  };

  const handleDeleteIndividual = (id: string) => {
    setIndividuals((prev) => prev.filter((ind) => ind.id !== id));
  };

  const handleConstituentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = parseInt(e.target.value);
    const c = options.find((x) => x.id === cid);
    if (c) {
      setCurrentIndividual((prev) => ({
        ...prev,
        constituentId: c.id,
        constituentName: c.name,
        constituentType: c.type,
        program: c.type === "Youth" ? (c.program ?? "") : "",
      }));
    }
  };

  // Member path: validate, then hand the incident to the shared source.
  const submitIncident = () => {
    if (!onSubmitIncident) {
      handleSaveCreateIncident();
      return;
    }
    if (!startDate || !startTimeHours || !startTimeMinutes) {
      toast.error("Please enter the start date and time");
      return;
    }
    if (individuals.length === 0) {
      toast.error("Add at least one individual involved");
      return;
    }
    const t = (h: string, m: string, sec: string) =>
      `${h.padStart(2, "0")}:${(m || "0").padStart(2, "0")}:${(sec || "0").padStart(2, "0")}`;
    const startDateTime = `${startDate}T${t(startTimeHours, startTimeMinutes, startTimeSeconds)}`;
    const endDateTime =
      endDate && endTimeHours
        ? `${endDate}T${t(endTimeHours, endTimeMinutes, endTimeSeconds)}`
        : "";
    if (endDateTime && endDateTime < startDateTime) {
      toast.error("End date and time can't be before the start");
      return;
    }
    const error = onSubmitIncident({
      startDateTime,
      endDateTime,
      individuals: individuals.map((i) => ({
        constituentId: i.constituentId,
        name: i.constituentName,
        role: i.incidentRole === "Other" ? i.incidentRoleOther : i.incidentRole,
        program: i.program,
      })),
    });
    if (error) {
      toast.error("Incident was not saved.", { description: error });
      return;
    }
    toast.success("New incident created successfully");
    setIndividuals([]);
    handleCancelCreateIncident();
  };

  const readOnlyCell = {
    border: "1px solid var(--slds-g-color-border-base-1)",
    backgroundColor: "var(--slds-g-color-neutral-95)",
    color: "var(--slds-g-color-text-default)",
  };
  const inputBorder = { border: "1px solid var(--slds-g-color-border-base-1)" };

  return (
    <Dialog open={createIncidentDialogOpen} onOpenChange={setCreateIncidentDialogOpen}>
      <DialogContent
        className="!w-[60vw] !max-w-[60vw] flex flex-col gap-0 p-0"
        style={{
          backgroundColor: "var(--slds-g-color-background-base)",
          border: "1px solid var(--slds-g-color-border-base-1)",
          height: "90vh",
          maxHeight: "90vh",
        }}
      >
        <DialogHeader
          className="px-6 py-4 flex-shrink-0"
          style={{
            borderBottom: "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor: "var(--slds-g-color-background-alt)",
          }}
        >
          <DialogTitle className="text-[16px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
            Create New Incident
          </DialogTitle>
          <DialogDescription className="text-[13px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
            Enter the incident details below
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-8">

          {/* ── Overall Incident ── */}
          <div>
            <h3 className="text-[18px] font-semibold mb-4" style={{ color: "var(--slds-g-color-text-default)" }}>
              Overall Incident
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: "var(--slds-g-color-text-weak)" }}>
                  Start Date & Time <span style={{ color: "#c23934" }}>*</span>
                </Label>
                <div className="flex items-center gap-3">
                  <DateInput
                    value={isoToMdy(startDate)}
                    onChange={(v) => setStartDate(mdyToIso(v))}
                    className="h-9 text-[13px] flex-1"
                    style={inputBorder}
                    required
                  />
                  <Input
                    type="time"
                    value={startTimeHours && startTimeMinutes ? `${startTimeHours.padStart(2, "0")}:${startTimeMinutes.padStart(2, "0")}:${startTimeSeconds.padStart(2, "0")}` : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [h, m, s = "00"] = e.target.value.split(":");
                        setStartTimeHours(h); setStartTimeMinutes(m); setStartTimeSeconds(s);
                      } else {
                        setStartTimeHours(""); setStartTimeMinutes(""); setStartTimeSeconds("00");
                      }
                    }}
                    step="1"
                    className="h-9 text-[13px] w-32"
                    style={{ ...inputBorder, backgroundColor: "var(--slds-g-color-background-base)" }}
                    required
                  />
                </div>
              </div>
              <div>
                <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: "var(--slds-g-color-text-weak)" }}>
                  End Date & Time
                </Label>
                <div className="flex items-center gap-3">
                  <DateInput
                    value={isoToMdy(endDate)}
                    onChange={(v) => setEndDate(mdyToIso(v))}
                    className="h-9 text-[13px] flex-1"
                    style={inputBorder}
                  />
                  <Input
                    type="time"
                    value={endTimeHours && endTimeMinutes ? `${endTimeHours.padStart(2, "0")}:${endTimeMinutes.padStart(2, "0")}:${endTimeSeconds.padStart(2, "0")}` : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [h, m, s = "00"] = e.target.value.split(":");
                        setEndTimeHours(h); setEndTimeMinutes(m); setEndTimeSeconds(s);
                      } else {
                        setEndTimeHours(""); setEndTimeMinutes(""); setEndTimeSeconds("00");
                      }
                    }}
                    step="1"
                    className="h-9 text-[13px] w-32"
                    style={{ ...inputBorder, backgroundColor: "var(--slds-g-color-background-base)" }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: "var(--slds-g-color-text-weak)" }}>
                Duration of Incident
              </Label>
              <div className="flex items-center justify-center gap-2 p-3 rounded" style={{ backgroundColor: "var(--slds-g-color-background-alt)", border: "1px solid var(--slds-g-color-border-base-1)" }}>
                {[{ val: calcDays, label: "days" }, { val: calcHours, label: "hrs" }, { val: calcMinutes, label: "min" }].map(({ val, label }, i) => (
                  <div key={label} className="flex items-center gap-1.5">
                    {i > 0 && <span className="text-[13px]" style={{ color: "var(--slds-g-color-text-weak)" }}>:</span>}
                    <div className="h-8 w-16 flex items-center justify-center rounded text-[13px] font-medium" style={readOnlyCell}>{val}</div>
                    <span className="text-[11px] font-medium" style={{ color: "var(--slds-g-color-text-weak)" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Individuals Involved ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[18px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
                Individuals Involved
              </h3>
              <Button
                size="sm"
                onClick={handleAddIndividual}
                disabled={isAddingIndividual}
                style={{ backgroundColor: "#145F33", color: "white", borderRadius: "9999px" }}
                className="h-8 px-3 text-[12px]"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Individual
              </Button>
            </div>

            <div className="mb-4 p-3 rounded flex items-start gap-2" style={{ backgroundColor: "#E8F4F8", border: "1px solid #54698D" }}>
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "#54698D" }} />
              <p className="text-[13px]" style={{ color: "#54698D" }}>
                Add all constituents involved in this incident (Youth, Staff, Guardian, School Personnel, Employer, …). For non-Youth constituents, a brief statement describing their involvement should be added to the "Comment" field.
              </p>
            </div>

            {isAddingIndividual && (
              <div className="mb-4 p-4 rounded border" style={{ borderColor: "var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-alt)" }}>
                <h4 className="text-[13px] font-semibold mb-3" style={{ color: "var(--slds-g-color-text-default)" }}>
                  {editingIndividualId ? "Edit Individual" : "Add Individual"}
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
                        Constituent <span style={{ color: "#c23934" }}>*</span>
                      </Label>
                      <select
                        value={currentIndividual.constituentId ?? ""}
                        onChange={handleConstituentSelect}
                        className="w-full h-9 text-[13px] px-3 rounded"
                        style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "white" }}
                      >
                        <option value="">Select Constituent...</option>
                        {options.map((c) => (
                          <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
                        Program
                      </Label>
                      <Input
                        value={currentIndividual.program || (currentIndividual.constituentId ? "N/A" : "")}
                        readOnly
                        className="h-9 text-[13px]"
                        style={{ borderColor: "var(--slds-g-color-border-base-1)", backgroundColor: "#F3F3F3", color: "var(--slds-g-color-text-weak)" }}
                        placeholder={currentIndividual.constituentType === "Youth" ? "Auto-populated" : "N/A"}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
                          Incident Role <span style={{ color: "#c23934" }}>*</span>
                        </Label>
                        <select
                          value={currentIndividual.incidentRole}
                          onChange={(e) => setCurrentIndividual((p) => ({ ...p, incidentRole: e.target.value }))}
                          className="w-full h-9 text-[13px] px-3 rounded"
                          style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "white" }}
                        >
                          <option value="">Select Role...</option>
                          {INCIDENT_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      {currentIndividual.incidentRole === "Other" && (
                        <div>
                          <Label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
                            Specify Role <span style={{ color: "#c23934" }}>*</span>
                          </Label>
                          <Input
                            value={currentIndividual.incidentRoleOther}
                            onChange={(e) => setCurrentIndividual((p) => ({ ...p, incidentRoleOther: e.target.value }))}
                            placeholder="Enter role..."
                            className="h-9 text-[13px]"
                            style={inputBorder}
                          />
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: "var(--slds-g-color-text-weak)" }}>&nbsp;</Label>
                        <div className="flex flex-wrap gap-4 h-9 items-center">
                          {(["injured", "restraint", "substanceUse"] as const).map((field) => (
                            <div key={field} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`new-ind-${field}`}
                                checked={currentIndividual[field] as boolean}
                                onChange={(e) => setCurrentIndividual((p) => ({ ...p, [field]: e.target.checked, ...(field === "injured" && !e.target.checked ? { hrNotifiedDate: "" } : {}) }))}
                                className="h-4 w-4"
                                style={{ accentColor: "#145F33" }}
                              />
                              <Label htmlFor={`new-ind-${field}`} className="text-[13px] font-medium cursor-pointer" style={{ color: "var(--slds-g-color-text-default)" }}>
                                {field === "substanceUse" ? "Substance Use" : field.charAt(0).toUpperCase() + field.slice(1)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      {currentIndividual.injured && (
                        <div>
                          <Label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: "var(--slds-g-color-text-weak)" }}>HR Notified</Label>
                          <DateInput
                            value={isoToMdy(currentIndividual.hrNotifiedDate)}
                            onChange={(v) => setCurrentIndividual((p) => ({ ...p, hrNotifiedDate: mdyToIso(v) }))}
                            className="h-9 text-[13px]"
                            style={inputBorder}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: "var(--slds-g-color-text-weak)" }}>Comment</Label>
                    <textarea
                      value={currentIndividual.comment}
                      onChange={(e) => setCurrentIndividual((p) => ({ ...p, comment: e.target.value }))}
                      placeholder="Describe their involvement..."
                      rows={2}
                      className="w-full px-3 py-2 text-[13px] rounded resize-none"
                      style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "white" }}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => { setIsAddingIndividual(false); setEditingIndividualId(null); }} className="h-8 px-3 text-[12px]" style={{ borderRadius: "9999px" }}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveIndividual} style={{ backgroundColor: "#145F33", color: "white", borderRadius: "9999px" }} className="h-8 px-3 text-[12px]">
                    {editingIndividualId ? "Save" : "Add"}
                  </Button>
                </div>
              </div>
            )}

            {individuals.length > 0 && (
              <div className="border rounded overflow-hidden" style={{ borderColor: "var(--slds-g-color-border-base-1)" }}>
                <table className="w-full text-[13px]">
                  <thead style={{ backgroundColor: "var(--slds-g-color-background-alt)" }}>
                    <tr>
                      {["Constituent", "Program", "Incident Role", "Injured", "Restraint", "Substance Use", "Comment"].map((col) => (
                        <th key={col} className="px-3 py-2 text-left text-[11px] font-semibold uppercase" style={{ color: "var(--slds-g-color-text-weak)" }}>{col}</th>
                      ))}
                      <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase" style={{ color: "var(--slds-g-color-text-weak)" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {individuals.map((ind) => (
                      <tr key={ind.id} className="border-t" style={{ borderColor: "var(--slds-g-color-border-base-1)" }}>
                        <td className="px-3 py-2.5" style={{ color: "#145F33" }}>
                          <button className="hover:underline">{ind.constituentName}</button>
                        </td>
                        <td className="px-3 py-2.5" style={{ color: "var(--slds-g-color-text-default)" }}>{ind.program || "—"}</td>
                        <td className="px-3 py-2.5" style={{ color: "var(--slds-g-color-text-default)" }}>{ind.incidentRole === "Other" ? ind.incidentRoleOther : ind.incidentRole}</td>
                        <td className="px-3 py-2.5" style={{ color: "var(--slds-g-color-text-default)" }}>{ind.injured ? "Yes" : "No"}</td>
                        <td className="px-3 py-2.5" style={{ color: "var(--slds-g-color-text-default)" }}>{ind.restraint ? "Yes" : "No"}</td>
                        <td className="px-3 py-2.5" style={{ color: "var(--slds-g-color-text-default)" }}>{ind.substanceUse ? "Yes" : "No"}</td>
                        <td className="px-3 py-2.5" style={{ color: "var(--slds-g-color-text-default)" }}>{ind.comment || "—"}</td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleEditIndividual(ind)} className="p-1 rounded hover:bg-gray-100" title="Edit">
                              <Edit2 className="h-3.5 w-3.5" style={{ color: "var(--slds-g-color-text-weak)" }} />
                            </button>
                            <button onClick={() => handleDeleteIndividual(ind.id)} className="p-1 rounded hover:bg-gray-100" title="Delete">
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

          {/* ── Contributors ── */}
          <div>
            <div className="flex items-baseline gap-2 mb-3">
              <h3 className="text-[18px] font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>Contributors</h3>
              <span className="text-[13px]" style={{ color: "var(--slds-g-color-text-weak)" }}>(Auto-populated with current user)</span>
            </div>
            <div className="space-y-2">
              {contributors.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded border" style={{ borderColor: "var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-alt)" }}>
                  <div className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-semibold" style={{ backgroundColor: "#145F33", color: "white" }}>
                    {String(c).split(" ").map((n: string) => n[0]).filter(Boolean).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium" style={{ color: "var(--slds-g-color-text-default)" }}>{c}</p>
                    <p className="text-[11px]" style={{ color: "var(--slds-g-color-text-weak)" }}>Current User</p>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#E8F4E8", color: "#145F33", border: "1px solid #145F33" }}>Staff</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter
          className="px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0"
          style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-alt)" }}
        >
          <Button
            onClick={() => { setIndividuals([]); handleCancelCreateIncident(); }}
            className="h-9 px-6 text-[13px] font-medium rounded-full"
            style={{ backgroundColor: "var(--slds-g-color-neutral-95)", color: "var(--slds-g-color-text-default)", border: "1px solid var(--slds-g-color-border-base-1)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={submitIncident}
            className="h-9 px-6 text-[13px] font-medium rounded-full"
            style={{ backgroundColor: "var(--slds-g-color-neutral-95)", color: "var(--slds-g-color-text-default)", border: "1px solid var(--slds-g-color-border-base-1)" }}
          >
            Save &amp; Close
          </Button>
          <Button
            onClick={submitIncident}
            className="h-9 px-6 text-[13px] font-medium rounded-full"
            style={{ backgroundColor: "#145F33", color: "white" }}
          >
            Save &amp; Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
