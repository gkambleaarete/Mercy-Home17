import { useState } from "react";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface Medication {
  id: string;
  medicationName: string;
  medicationOther?: string;
  startDate: string;
  endDate: string;
  dose: string;
  psychotropic: boolean;
  details: string;
}

type SortColumn = "medicationName" | "startDate" | "endDate" | "dose" | "psychotropic" | "details";
type SortDirection = "asc" | "desc";

// Mock medication list from Blueprint system (including psychotropic medications)
const MEDICATION_OPTIONS = [
  { value: "adderall-xr", label: "Adderall XR", psychotropic: true },
  { value: "abilify", label: "Abilify", psychotropic: true },
  { value: "amoxicillin", label: "Amoxicillin", psychotropic: false },
  { value: "clonidine", label: "Clonidine", psychotropic: true },
  { value: "haldol", label: "Haldol", psychotropic: true },
  { value: "ibuprofen", label: "Ibuprofen", psychotropic: false },
  { value: "lexapro", label: "Lexapro", psychotropic: true },
  { value: "risperdal", label: "Risperdal", psychotropic: true },
  { value: "strattera", label: "Strattera", psychotropic: true },
  { value: "zoloft", label: "Zoloft", psychotropic: true },
  { value: "other", label: "Other", psychotropic: false }
];

export function MedicationsHistorySection() {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "1",
      medicationName: "Adderall XR",
      startDate: "01/15/2024",
      endDate: "",
      dose: "20mg daily",
      psychotropic: true,
      details: "ADHD treatment, morning administration"
    },
    {
      id: "2",
      medicationName: "Zoloft",
      startDate: "06/10/2023",
      endDate: "12/20/2023",
      dose: "50mg daily",
      psychotropic: true,
      details: "Discontinued due to side effects"
    }
  ]);

  const [showDialog, setShowDialog] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  
  const [formData, setFormData] = useState({
    medicationName: "",
    medicationOther: "",
    startDate: "",
    endDate: "",
    dose: "",
    psychotropic: false,
    details: ""
  });

  // Validation errors
  const [errors, setErrors] = useState({
    medicationName: "",
    medicationOther: "",
    startDate: "",
    endDate: ""
  });

  const handleAdd = () => {
    setEditingMed(null);
    setFormData({
      medicationName: "",
      medicationOther: "",
      startDate: "",
      endDate: "",
      dose: "",
      psychotropic: false,
      details: ""
    });
    setErrors({
      medicationName: "",
      medicationOther: "",
      startDate: "",
      endDate: ""
    });
    setShowDialog(true);
  };

  const handleEdit = (med: Medication) => {
    setEditingMed(med);
    setFormData({
      medicationName: med.medicationName,
      medicationOther: med.medicationOther || "",
      startDate: med.startDate,
      endDate: med.endDate,
      dose: med.dose,
      psychotropic: med.psychotropic,
      details: med.details
    });
    setErrors({
      medicationName: "",
      medicationOther: "",
      startDate: "",
      endDate: ""
    });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this medication?")) {
      setMedications(medications.filter(m => m.id !== id));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      medicationName: "",
      medicationOther: "",
      startDate: "",
      endDate: ""
    };
    let isValid = true;

    // Medication Name required
    if (!formData.medicationName) {
      newErrors.medicationName = "Medication name is required";
      isValid = false;
    }

    // If "Other" is selected, require the text field
    if (formData.medicationName === "Other" && !formData.medicationOther.trim()) {
      newErrors.medicationOther = "Please specify the medication name";
      isValid = false;
    }

    // Date validations
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start Date validation
    if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      if (startDate > today) {
        newErrors.startDate = "Start date cannot be in the future";
        isValid = false;
      }

      // If End Date is populated, Start Date is required and must be <= End Date
      if (formData.endDate) {
        const endDate = new Date(formData.endDate);
        if (startDate > endDate) {
          newErrors.startDate = "Start date must be before or equal to end date";
          isValid = false;
        }
      }
    } else if (formData.endDate) {
      // End Date is populated but Start Date is not
      newErrors.startDate = "Start date is required when end date is provided";
      isValid = false;
    }

    // End Date validation
    if (formData.endDate) {
      const endDate = new Date(formData.endDate);
      if (endDate > today) {
        newErrors.endDate = "End date cannot be in the future";
        isValid = false;
      }
      
      if (formData.startDate) {
        const startDate = new Date(formData.startDate);
        if (endDate < startDate) {
          newErrors.endDate = "End date must be after or equal to start date";
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    // Validate form - silently block if invalid
    if (!validateForm()) {
      return;
    }

    // Determine display name
    const displayName = formData.medicationName === "Other" 
      ? formData.medicationOther 
      : formData.medicationName;

    if (editingMed) {
      // Update existing
      setMedications(medications.map(m => 
        m.id === editingMed.id 
          ? { 
              ...m, 
              medicationName: displayName,
              medicationOther: formData.medicationName === "Other" ? formData.medicationOther : undefined,
              startDate: formData.startDate,
              endDate: formData.endDate,
              dose: formData.dose,
              psychotropic: formData.psychotropic,
              details: formData.details
            }
          : m
      ));
    } else {
      // Add new
      const newMed: Medication = {
        id: Date.now().toString(),
        medicationName: displayName,
        medicationOther: formData.medicationName === "Other" ? formData.medicationOther : undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        dose: formData.dose,
        psychotropic: formData.psychotropic,
        details: formData.details
      };
      setMedications([...medications, newMed]);
    }
    
    // TODO: Create audit log record and attestation record here
    // Each transaction should result in exactly one log record and one attestation record
    // These records are immutable and should never be updated once created
    
    setShowDialog(false);
  };

  const updateFormField = (field: string, value: string | boolean) => {
    const updates: any = { [field]: value };

    // Handle medication selection change
    if (field === "medicationName" && typeof value === "string") {
      // Find the selected medication in the options
      const selectedMed = MEDICATION_OPTIONS.find(opt => opt.label === value);
      
      // Auto-check psychotropic if medication is psychotropic
      if (selectedMed && selectedMed.psychotropic) {
        updates.psychotropic = true;
      } else if (value !== "Other") {
        // Reset psychotropic for non-psychotropic medications (but not for "Other")
        updates.psychotropic = false;
      }

      // Clear "Other" field if not "Other"
      if (value !== "Other") {
        updates.medicationOther = "";
      }
    }

    setFormData({ ...formData, ...updates });
    
    // Clear error for the field being updated
    if (field in errors) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  // Sorting logic
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortedMedications = () => {
    if (!sortColumn) return medications;

    const sorted = [...medications].sort((a, b) => {
      let aValue: any = a[sortColumn];
      let bValue: any = b[sortColumn];

      // Handle date sorting
      if (sortColumn === "startDate" || sortColumn === "endDate") {
        const aDate = aValue ? new Date(aValue).getTime() : 0;
        const bDate = bValue ? new Date(bValue).getTime() : 0;
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      }

      // Handle boolean sorting
      if (sortColumn === "psychotropic") {
        return sortDirection === "asc" 
          ? (aValue === bValue ? 0 : aValue ? 1 : -1)
          : (aValue === bValue ? 0 : aValue ? -1 : 1);
      }

      // Handle string sorting
      const aStr = String(aValue || "").toLowerCase();
      const bStr = String(bValue || "").toLowerCase();
      
      if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
      if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" 
      ? <ChevronUp className="h-3 w-3 inline ml-1" />
      : <ChevronDown className="h-3 w-3 inline ml-1" />;
  };

  return (
    <div>
      {/* Add Button */}
      <div className="mb-4 flex justify-end">
        <Button
          onClick={handleAdd}
          className="h-9 px-4 rounded-full text-[13px] font-semibold"
          style={{
            backgroundColor: '#145F33',
            color: 'white'
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {/* Table */}
      <div 
        className="overflow-hidden rounded-lg"
        style={{
          border: '1px solid var(--slds-g-color-border-base-1)',
          backgroundColor: 'var(--slds-g-color-background-base)'
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr 
                style={{ 
                  backgroundColor: 'var(--slds-g-color-background-alt)',
                  borderBottom: '2px solid var(--slds-g-color-border-base-1)'
                }}
              >
                <th 
                  className="px-4 py-3 text-left text-[12px] font-semibold uppercase cursor-pointer hover:bg-gray-100/50"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                  onClick={() => handleSort("medicationName")}
                >
                  Medication <SortIcon column="medicationName" />
                </th>
                <th 
                  className="px-4 py-3 text-left text-[12px] font-semibold uppercase cursor-pointer hover:bg-gray-100/50"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                  onClick={() => handleSort("startDate")}
                >
                  Start Date <SortIcon column="startDate" />
                </th>
                <th 
                  className="px-4 py-3 text-left text-[12px] font-semibold uppercase cursor-pointer hover:bg-gray-100/50"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                  onClick={() => handleSort("endDate")}
                >
                  End Date <SortIcon column="endDate" />
                </th>
                <th 
                  className="px-4 py-3 text-left text-[12px] font-semibold uppercase cursor-pointer hover:bg-gray-100/50"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                  onClick={() => handleSort("dose")}
                >
                  Dose <SortIcon column="dose" />
                </th>
                <th 
                  className="px-4 py-3 text-left text-[12px] font-semibold uppercase cursor-pointer hover:bg-gray-100/50"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                  onClick={() => handleSort("psychotropic")}
                >
                  Psychotropic <SortIcon column="psychotropic" />
                </th>
                <th 
                  className="px-4 py-3 text-left text-[12px] font-semibold uppercase cursor-pointer hover:bg-gray-100/50"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                  onClick={() => handleSort("details")}
                >
                  Details <SortIcon column="details" />
                </th>
                <th 
                  className="px-4 py-3 text-center text-[12px] font-semibold uppercase"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {getSortedMedications().length === 0 ? (
                <tr>
                  <td 
                    colSpan={7} 
                    className="px-4 py-8 text-center text-[13px]"
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                  >
                    No medications recorded. Click "Add" to get started.
                  </td>
                </tr>
              ) : (
                getSortedMedications().map((med) => (
                  <tr 
                    key={med.id}
                    className="hover:bg-gray-50/50 transition-colors"
                    style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                  >
                    <td 
                      className="px-4 py-3 text-[13px] font-medium"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      {med.medicationName}
                    </td>
                    <td 
                      className="px-4 py-3 text-[13px]"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      {med.startDate || "-"}
                    </td>
                    <td 
                      className="px-4 py-3 text-[13px]"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      {med.endDate || "-"}
                    </td>
                    <td 
                      className="px-4 py-3 text-[13px]"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      {med.dose || "-"}
                    </td>
                    <td 
                      className="px-4 py-3 text-[13px]"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      {med.psychotropic ? "Yes" : "No"}
                    </td>
                    <td 
                      className="px-4 py-3 text-[13px]"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      {med.details || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(med)}
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                        >
                          <Pencil className="h-4 w-4" style={{ color: '#706e6b' }} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(med.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
              {editingMed ? "Edit Medication" : "Add Medication"}
            </DialogTitle>
            <DialogDescription className="text-[13px] font-normal" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              {editingMed ? "Update the details of the medication." : "Enter the details of the medication."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            {/* Medication Name */}
            <div className="sm:col-span-2">
              <Label 
                htmlFor="medication-name" 
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                Medication Name *
              </Label>
              <Select 
                value={formData.medicationName}
                onValueChange={(value) => updateFormField("medicationName", value)}
              >
                <SelectTrigger 
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: errors.medicationName ? '1px solid #c23934' : '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                >
                  <SelectValue placeholder="Select a medication" />
                </SelectTrigger>
                <SelectContent>
                  {MEDICATION_OPTIONS.map((med) => (
                    <SelectItem key={med.value} value={med.label}>
                      {med.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.medicationName && (
                <p className="text-[11px] mt-1" style={{ color: '#c23934' }}>
                  {errors.medicationName}
                </p>
              )}
            </div>

            {/* Other Medication Field (Conditional) */}
            {formData.medicationName === "Other" && (
              <div className="sm:col-span-2">
                <Label 
                  htmlFor="medication-other" 
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Specify Medication *
                </Label>
                <Input
                  id="medication-other"
                  value={formData.medicationOther}
                  onChange={(e) => updateFormField("medicationOther", e.target.value)}
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: errors.medicationOther ? '1px solid #c23934' : '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  placeholder="Enter medication name"
                />
                {errors.medicationOther && (
                  <p className="text-[11px] mt-1" style={{ color: '#c23934' }}>
                    {errors.medicationOther}
                  </p>
                )}
              </div>
            )}

            {/* Start Date */}
            <div>
              <Label 
                htmlFor="start-date" 
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                Start Date
              </Label>
              <DateInput
                id="start-date"
value={isoToMdy(formData.startDate)}
                onChange={(v) => ((e) => updateFormField("startDate", e.target.value))({ target: { value: mdyToIso(v) } })}
                className="h-9 text-[13px] rounded"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: errors.startDate ? '1px solid #c23934' : '1px solid var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
              />
              {errors.startDate && (
                <p className="text-[11px] mt-1" style={{ color: '#c23934' }}>
                  {errors.startDate}
                </p>
              )}
            </div>

            {/* End Date */}
            <div>
              <Label 
                htmlFor="end-date" 
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                End Date
              </Label>
              <DateInput
                id="end-date"
value={isoToMdy(formData.endDate)}
                onChange={(v) => ((e) => updateFormField("endDate", e.target.value))({ target: { value: mdyToIso(v) } })}
                className="h-9 text-[13px] rounded"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: errors.endDate ? '1px solid #c23934' : '1px solid var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
              />
              {errors.endDate && (
                <p className="text-[11px] mt-1" style={{ color: '#c23934' }}>
                  {errors.endDate}
                </p>
              )}
            </div>

            {/* Dose */}
            <div className="sm:col-span-2">
              <Label 
                htmlFor="dose" 
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                Dose
              </Label>
              <Input
                id="dose"
                value={formData.dose}
                onChange={(e) => updateFormField("dose", e.target.value)}
                className="h-9 text-[13px] rounded"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
                placeholder="e.g., 20mg daily"
              />
            </div>

            {/* Psychotropic Checkbox (visible in edit mode, hidden in create mode) */}
            {editingMed && (
              <div className="sm:col-span-2 flex items-center gap-2">
                <Checkbox
                  id="psychotropic"
                  checked={formData.psychotropic}
                  onCheckedChange={(checked) => updateFormField("psychotropic", checked === true)}
                />
                <Label 
                  htmlFor="psychotropic" 
                  className="text-[13px] font-normal cursor-pointer"
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                >
                  Psychotropic
                </Label>
              </div>
            )}

            {/* Details */}
            <div className="sm:col-span-2">
              <Label 
                htmlFor="details" 
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                Details
              </Label>
              <Textarea
                id="details"
                value={formData.details}
                onChange={(e) => updateFormField("details", e.target.value)}
                className="text-[13px] rounded min-h-[80px]"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
                placeholder="Enter any additional notes or details"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="h-9 px-4 rounded-full text-[13px]"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                backgroundColor: 'var(--slds-g-color-background-base)',
                color: 'var(--slds-g-color-text-default)'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="h-9 px-4 rounded-full text-[13px] font-semibold"
              style={{
                backgroundColor: '#145F33',
                color: 'white'
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}