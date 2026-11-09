import { useState } from "react";
import { X, Save, AlertTriangle, Info, Calendar as CalendarIcon, Clock } from "@/app/lib/lucide-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

// Mock medication data
const AVAILABLE_MEDICATIONS = [
  "Adderall XR",
  "Vyvanse",
  "Ritalin",
  "Concerta",
  "Strattera",
  "Zoloft",
  "Prozac",
  "Lexapro",
  "Seroquel",
  "Risperdal",
  "Abilify",
  "Trazodone",
  "Clonidine",
  "Melatonin"
];

const DOSING_PERIODS = ["Morning", "Afternoon", "Evening", "Bedtime", "As Needed (PRN)"];
const PACKAGING_TYPES = ["Bottle", "Blister Pack", "Pill Card", "Individual Packets"];
const COUNT_TYPES = ["Tablets", "Capsules", "mL (Liquid)", "Patches", "Inhalers"];

interface NewMedicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  youthName: string;
}

export function NewMedicationDialog({ open, onOpenChange, youthName }: NewMedicationDialogProps) {
  // Basic Info
  const [medication, setMedication] = useState("");
  const [customMedication, setCustomMedication] = useState("");
  const [packageType, setPackageType] = useState("");
  const [dose, setDose] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [consentReceived, setConsentReceived] = useState(false);

  // Dosing Schedule
  const [dosingPeriod, setDosingPeriod] = useState("");
  const [notTakenDaily, setNotTakenDaily] = useState(false);
  const [scheduleType, setScheduleType] = useState<"weekly" | "monthly">("weekly");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [allDay, setAllDay] = useState(false);
  const [doseStartTime, setDoseStartTime] = useState("");
  const [doseEndTime, setDoseEndTime] = useState("");

  // Treatment Details
  const [treatmentPurpose, setTreatmentPurpose] = useState("");
  const [minHoursBetweenDoses, setMinHoursBetweenDoses] = useState("");
  const [maxDailyDoses, setMaxDailyDoses] = useState("");

  // Inventory
  const [countType, setCountType] = useState("");
  const [count, setCount] = useState("");
  const [instructions, setInstructions] = useState("");

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = () => {
    if (!medication && !customMedication) {
      return;
    }
    if (!dose) {
      return;
    }
    if (!startDate) {
      return;
    }
    if (!consentReceived) {
      return;
    }

    // Success
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setMedication("");
    setCustomMedication("");
    setPackageType("");
    setDose("");
    setStartDate("");
    setEndDate("");
    setConsentReceived(false);
    setDosingPeriod("");
    setNotTakenDaily(false);
    setScheduleType("weekly");
    setSelectedDays([]);
    setAllDay(false);
    setDoseStartTime("");
    setDoseEndTime("");
    setTreatmentPurpose("");
    setMinHoursBetweenDoses("");
    setMaxDailyDoses("");
    setCountType("");
    setCount("");
    setInstructions("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="border-b border-[var(--slds-g-color-border-base-1)] pb-5 mb-1">
          <DialogTitle className="text-[18px] font-semibold text-gray-900">
            New Medication for {youthName}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-gray-600 mt-2">
            Complete the required fields below. All fields marked with an asterisk (*) are required.
          </DialogDescription>
        </DialogHeader>

        <div className="px-1 py-5 space-y-7">
          {/* Section 1: Medication Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Medication Details</h3>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="medication" className="text-[13px] font-medium text-gray-700">
                  Medication Name <span className="text-red-600">*</span>
                </Label>
                <select
                  id="medication"
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                  className="w-full h-10 px-3 pr-10 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent bg-white appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:16px_16px] bg-[right_0.75rem_center] bg-no-repeat"
                  style={{ color: medication ? '#111827' : '#6b7280' }}
                >
                  <option value="">Select Medication</option>
                  {AVAILABLE_MEDICATIONS.map((med) => (
                    <option key={med} value={med}>{med}</option>
                  ))}
                  <option value="custom">Other (Specify)</option>
                </select>
                {medication === "custom" && (
                  <Input
                    placeholder="Enter medication name"
                    value={customMedication}
                    onChange={(e) => setCustomMedication(e.target.value)}
                    className="mt-2 h-10 text-[13px]"
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dose" className="text-[13px] font-medium text-gray-700">
                  Dose <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="dose"
                  placeholder="e.g., 20mg, 2 tablets"
                  value={dose}
                  onChange={(e) => setDose(e.target.value)}
                  className="h-10 text-[13px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="purpose" className="text-[13px] font-medium text-gray-700">
                  Treatment Purpose
                </Label>
                <Input
                  id="purpose"
                  placeholder="e.g., ADHD management"
                  value={treatmentPurpose}
                  onChange={(e) => setTreatmentPurpose(e.target.value)}
                  className="h-10 text-[13px]"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-3">
              <Checkbox
                id="consent"
                checked={consentReceived}
                onCheckedChange={(checked) => setConsentReceived(checked as boolean)}
              />
              <Label
                htmlFor="consent"
                className={cn(
                  "text-[13px] cursor-pointer font-medium",
                  !consentReceived && "text-gray-700"
                )}
              >
                Consent received and on file <span className="text-red-600">*</span>
              </Label>
            </div>
          </div>

          {/* Section 2: Schedule */}
          <div className="space-y-4 pt-5 border-t border-gray-200">
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Dosing Schedule</h3>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="dosingPeriod" className="text-[13px] font-medium text-gray-700">
                  Dosing Period <span className="text-red-600">*</span>
                </Label>
                <select
                  id="dosingPeriod"
                  value={dosingPeriod}
                  onChange={(e) => setDosingPeriod(e.target.value)}
                  className="w-full h-10 px-3 pr-10 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent bg-white appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:16px_16px] bg-[right_0.75rem_center] bg-no-repeat"
                  style={{ color: dosingPeriod ? '#111827' : '#6b7280' }}
                >
                  <option value="">Select Period</option>
                  {DOSING_PERIODS.map((period) => (
                    <option key={period} value={period}>{period}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end pb-1">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="notDaily"
                    checked={notTakenDaily}
                    onCheckedChange={(checked) => setNotTakenDaily(checked as boolean)}
                  />
                  <Label htmlFor="notDaily" className="text-[13px] cursor-pointer font-medium text-gray-700">
                    Specific days only
                  </Label>
                </div>
              </div>
            </div>

            {/* Conditional: Specific Days */}
            {notTakenDaily && (
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-5 mt-4">
                <div className="flex items-center gap-6">
                  <Label className="text-[13px] font-semibold text-gray-800">Frequency</Label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="scheduleType"
                        checked={scheduleType === "weekly"}
                        onChange={() => setScheduleType("weekly")}
                        className="h-4 w-4 text-[var(--color-brand-primary)]"
                      />
                      <span className="text-[13px] font-medium text-gray-700">Weekly</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="scheduleType"
                        checked={scheduleType === "monthly"}
                        onChange={() => setScheduleType("monthly")}
                        className="h-4 w-4 text-[var(--color-brand-primary)]"
                      />
                      <span className="text-[13px] font-medium text-gray-700">Monthly</span>
                    </label>
                  </div>
                </div>

                {scheduleType === "weekly" && (
                  <div className="space-y-3">
                    <Label className="text-[13px] font-medium text-gray-700">Days of Week</Label>
                    <div className="flex gap-2.5">
                      {daysOfWeek.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={cn(
                            "flex-1 py-2.5 text-[13px] font-semibold rounded-md border transition-all",
                            selectedDays.includes(day)
                              ? "bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)] shadow-sm"
                              : "bg-white text-gray-700 border-gray-300 hover:border-[var(--color-brand-primary)] hover:bg-gray-50"
                          )}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {scheduleType === "monthly" && (
                  <div className="text-[13px] text-gray-600 py-2">
                    Monthly scheduling options will be available after saving.
                  </div>
                )}
              </div>
            )}

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="startTime" className="text-[13px] font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={doseStartTime}
                  onChange={(e) => setDoseStartTime(e.target.value)}
                  disabled={allDay}
                  className="h-10 text-[13px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="endTime" className="text-[13px] font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  End Time
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={doseEndTime}
                  onChange={(e) => setDoseEndTime(e.target.value)}
                  disabled={allDay}
                  className="h-10 text-[13px]"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <Checkbox
                id="allDay"
                checked={allDay}
                onCheckedChange={(checked) => setAllDay(checked as boolean)}
              />
              <Label htmlFor="allDay" className="text-[13px] cursor-pointer font-medium text-gray-700">
                No specific time required
              </Label>
            </div>
          </div>

          {/* Section 3: Duration */}
          <div className="space-y-4 pt-5 border-t border-gray-200">
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Medication Duration</h3>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="startDate" className="text-[13px] font-medium text-gray-700 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  Start Date <span className="text-red-600">*</span>
                </Label>
                <DateInput
                  id="startDate"
value={isoToMdy(startDate)}
                  onChange={(v) => ((e) => setStartDate(e.target.value))({ target: { value: mdyToIso(v) } })}
                  className="h-10 text-[13px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="endDate" className="text-[13px] font-medium text-gray-700 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  End Date (Optional)
                </Label>
                <DateInput
                  id="endDate"
value={isoToMdy(endDate)}
                  onChange={(v) => ((e) => setEndDate(e.target.value))({ target: { value: mdyToIso(v) } })}
                  className="h-10 text-[13px]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: PRN Details (Conditional) */}
          {dosingPeriod === "As Needed (PRN)" && (
            <div className="space-y-4 pt-5 border-t border-gray-200">
              <div>
                <h3 className="text-[15px] font-semibold text-gray-900 mb-4">PRN Parameters</h3>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="minHours" className="text-[13px] font-medium text-gray-700">
                    Min Hours Between Doses
                  </Label>
                  <Input
                    id="minHours"
                    type="number"
                    placeholder="e.g., 4"
                    value={minHoursBetweenDoses}
                    onChange={(e) => setMinHoursBetweenDoses(e.target.value)}
                    className="h-10 text-[13px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maxDoses" className="text-[13px] font-medium text-gray-700">
                    Max Daily Doses
                  </Label>
                  <Input
                    id="maxDoses"
                    type="number"
                    placeholder="e.g., 3"
                    value={maxDailyDoses}
                    onChange={(e) => setMaxDailyDoses(e.target.value)}
                    className="h-10 text-[13px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Inventory */}
          <div className="space-y-4 pt-5 border-t border-gray-200">
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Inventory</h3>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="countType" className="text-[13px] font-medium text-gray-700">
                  Count Type <span className="text-red-600">*</span>
                </Label>
                <select
                  id="countType"
                  value={countType}
                  onChange={(e) => setCountType(e.target.value)}
                  className="w-full h-10 px-3 pr-10 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent bg-white appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:16px_16px] bg-[right_0.75rem_center] bg-no-repeat"
                  style={{ color: countType ? '#111827' : '#6b7280' }}
                >
                  <option value="">Select Type</option>
                  {COUNT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="count" className="text-[13px] font-medium text-gray-700">
                  Initial Count <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="count"
                  type="number"
                  placeholder="e.g., 30"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="h-10 text-[13px]"
                />
              </div>
            </div>

            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="instructions" className="text-[13px] font-medium text-gray-700">
                Special Instructions
              </Label>
              <Textarea
                id="instructions"
                placeholder="Enter any special administration instructions (e.g., Take with food)"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
                className="resize-none text-[13px]"
              />
            </div>
          </div>

          {/* Warning if consent not received */}
          {!consentReceived && medication && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-red-900">Consent Required</p>
                <p className="text-[13px] text-red-700 mt-0.5">
                  You must confirm that consent has been received before saving this medication.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-[var(--slds-g-color-border-base-1)] pt-5 mt-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
            className="rounded-full h-10 px-6 text-[13px] font-medium"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="rounded-full h-10 px-6 text-[13px] font-medium bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Medication
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
