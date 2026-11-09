import { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface TreatmentHistory {
  id: string;
  treatmentType: string;
  location: string;
  howLongAgoStopped: string;
  howLongAgoUnit: string;
  durationAmount: string;
  durationUnit: string;
  startDate: string;
  endDate: string;
  reason: string;
  outcome: string;
  youthFeedback: string;
}

export function MentalHealthSection() {
  const initialFormData = {
    symptoms: "",
    previousDiagnosis: "",
    comments: ""
  };

  const initialTreatmentHistory: TreatmentHistory[] = [
    {
      id: "1",
      treatmentType: "Outpatient Therapy",
      location: "Chicago Behavioral Health Center",
      howLongAgoStopped: "6",
      howLongAgoUnit: "months",
      durationAmount: "18",
      durationUnit: "months",
      startDate: "2023-01-15",
      endDate: "2024-07-15",
      reason: "Anxiety and depression symptoms",
      outcome: "Significant improvement in managing anxiety, developed coping strategies",
      youthFeedback: "Found weekly sessions helpful. Dr. Martinez was easy to talk to."
    },
    {
      id: "2",
      treatmentType: "Medication Management",
      location: "Lakeview Family Psychiatry",
      howLongAgoStopped: "0",
      howLongAgoUnit: "months",
      durationAmount: "24",
      durationUnit: "months",
      startDate: "2023-06-01",
      endDate: "",
      reason: "ADHD and mood regulation",
      outcome: "Ongoing - medication regimen stabilized",
      youthFeedback: "Medication has helped with focus and emotional stability."
    },
    {
      id: "3",
      treatmentType: "Intensive Outpatient Therapy",
      location: "Northwest Adolescent Services",
      howLongAgoStopped: "2",
      howLongAgoUnit: "years",
      durationAmount: "3",
      durationUnit: "months",
      startDate: "2022-03-10",
      endDate: "2022-06-10",
      reason: "Crisis intervention following family trauma",
      outcome: "Successfully completed program, transitioned to standard outpatient care",
      youthFeedback: "Intense but necessary. Group sessions were especially helpful."
    }
  ];

  const [formData, setFormData] = useState(initialFormData);
  const [treatmentHistory, setTreatmentHistory] = useState<TreatmentHistory[]>(initialTreatmentHistory);
  
  // Track saved state for comparison
  const [savedFormData, setSavedFormData] = useState(initialFormData);
  const [savedTreatmentHistory, setSavedTreatmentHistory] = useState<TreatmentHistory[]>(initialTreatmentHistory);
  
  // Check if form has unsaved changes
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(savedFormData) ||
                     JSON.stringify(treatmentHistory) !== JSON.stringify(savedTreatmentHistory);

  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<TreatmentHistory | null>(null);
  const [treatmentForm, setTreatmentForm] = useState({
    treatmentType: "",
    location: "",
    howLongAgoStopped: "",
    howLongAgoUnit: "days",
    durationAmount: "",
    durationUnit: "days",
    startDate: "",
    endDate: "",
    reason: "",
    outcome: "",
    youthFeedback: ""
  });

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    // Save current state
    setSavedFormData(formData);
    setSavedTreatmentHistory(treatmentHistory);
    // Here you would normally save to backend/database
  };

  const handleCancel = () => {
    // Revert to saved state
    setFormData(savedFormData);
    setTreatmentHistory(savedTreatmentHistory);
  };

  // Treatment History Functions
  const handleAddTreatment = () => {
    setShowTreatmentModal(true);
    setEditingTreatment(null);
    setTreatmentForm({
      treatmentType: "",
      location: "",
      howLongAgoStopped: "",
      howLongAgoUnit: "days",
      durationAmount: "",
      durationUnit: "days",
      startDate: "",
      endDate: "",
      reason: "",
      outcome: "",
      youthFeedback: ""
    });
  };

  const handleModifyTreatment = (treatment: TreatmentHistory) => {
    setEditingTreatment(treatment);
    setTreatmentForm({
      treatmentType: treatment.treatmentType,
      location: treatment.location,
      howLongAgoStopped: treatment.howLongAgoStopped,
      howLongAgoUnit: treatment.howLongAgoUnit,
      durationAmount: treatment.durationAmount,
      durationUnit: treatment.durationUnit,
      startDate: treatment.startDate,
      endDate: treatment.endDate,
      reason: treatment.reason,
      outcome: treatment.outcome,
      youthFeedback: treatment.youthFeedback
    });
    setShowTreatmentModal(true);
  };

  const handleSaveTreatment = () => {
    if (editingTreatment) {
      setTreatmentHistory(treatmentHistory.map(item => 
        item.id === editingTreatment.id 
          ? { ...item, ...treatmentForm }
          : item
      ));
    } else {
      const newTreatment: TreatmentHistory = {
        id: Date.now().toString(),
        ...treatmentForm,
      };
      setTreatmentHistory([...treatmentHistory, newTreatment]);
    }
    setShowTreatmentModal(false);
    setEditingTreatment(null);
  };

  const handleDeleteTreatment = (id: string) => {
    if (confirm("Are you sure you want to delete this treatment record?")) {
      setTreatmentHistory(treatmentHistory.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Mental Health Treatment History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 
            className="text-[13px] font-semibold"
            style={{ color: 'var(--slds-g-color-text-default)' }}
          >
            Mental Health Treatment History
          </h3>
          <Button
            onClick={handleAddTreatment}
            className="h-8 px-4 text-[13px] font-medium rounded-full"
            style={{
              backgroundColor: '#145F33',
              color: 'white'
            }}
          >
            Add New
          </Button>
        </div>

        {/* Treatment History Table */}
        <div 
          className="rounded overflow-hidden"
          style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
        >
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ backgroundColor: 'var(--slds-g-color-neutral-95)' }}>
                <th 
                  className="text-left px-4 py-3 font-semibold uppercase text-[11px]"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Treatment Type
                </th>
                <th 
                  className="text-left px-4 py-3 font-semibold uppercase text-[11px]"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Location
                </th>
                <th 
                  className="text-left px-4 py-3 font-semibold uppercase text-[11px]"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Duration
                </th>
                <th 
                  className="text-left px-4 py-3 font-semibold uppercase text-[11px]"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Reason
                </th>
                <th 
                  className="text-left px-4 py-3 font-semibold uppercase text-[11px]"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Outcome
                </th>
                <th 
                  className="text-left px-4 py-3 font-semibold uppercase text-[11px] w-48"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {treatmentHistory.length === 0 ? (
                <tr>
                  <td 
                    colSpan={6} 
                    className="px-4 py-8 text-center"
                    style={{ 
                      color: 'var(--slds-g-color-text-weak)',
                      borderTop: '1px solid var(--slds-g-color-border-base-1)'
                    }}
                  >
                    No treatment history recorded
                  </td>
                </tr>
              ) : (
                treatmentHistory.map((record) => (
                  <tr 
                    key={record.id}
                    style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}
                  >
                    <td className="px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {record.treatmentType}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {record.location}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {record.durationAmount} {record.durationUnit}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {record.reason}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {record.outcome}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleModifyTreatment(record)}
                          className="h-7 px-3 text-[12px] font-medium rounded-full"
                          style={{
                            backgroundColor: 'var(--slds-g-color-neutral-95)',
                            color: 'var(--slds-g-color-text-default)',
                            border: '1px solid var(--slds-g-color-border-base-1)'
                          }}
                        >
                          Modify
                        </Button>
                        <Button
                          onClick={() => handleDeleteTreatment(record.id)}
                          className="h-7 px-3 text-[12px] font-medium rounded-full"
                          style={{
                            backgroundColor: 'var(--slds-g-color-error-base)',
                            color: 'white'
                          }}
                        >
                          Delete
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

      {/* Symptoms of Psychological Distress */}
      <div>
        <h3 
          className="text-[13px] font-semibold mb-4 pb-2"
          style={{ 
            color: 'var(--slds-g-color-text-default)',
            borderBottom: '1px solid var(--slds-g-color-border-base-1)'
          }}
        >
          Symptoms of Psychological Distress
        </h3>
        
        <div>
          <Textarea
            id="symptoms"
            className="text-[13px] rounded min-h-[120px]"
            style={{
              backgroundColor: 'var(--slds-g-color-background-base)',
              border: '1px solid var(--slds-g-color-border-base-1)',
              color: 'var(--slds-g-color-text-default)'
            }}
            value={formData.symptoms}
            onChange={(e) => updateField("symptoms", e.target.value)}
            placeholder="Enter symptoms of psychological distress..."
          />
        </div>
      </div>

      {/* Previous Diagnosis */}
      <div>
        <h3 
          className="text-[13px] font-semibold mb-4 pb-2"
          style={{ 
            color: 'var(--slds-g-color-text-default)',
            borderBottom: '1px solid var(--slds-g-color-border-base-1)'
          }}
        >
          Previous Diagnosis
        </h3>
        
        <div>
          <Textarea
            id="previous-diagnosis"
            className="text-[13px] rounded min-h-[120px]"
            style={{
              backgroundColor: 'var(--slds-g-color-background-base)',
              border: '1px solid var(--slds-g-color-border-base-1)',
              color: 'var(--slds-g-color-text-default)'
            }}
            value={formData.previousDiagnosis}
            onChange={(e) => updateField("previousDiagnosis", e.target.value)}
            placeholder="Enter previous mental health diagnoses..."
          />
        </div>
      </div>

      {/* Comments */}
      <div>
        <h3 
          className="text-[13px] font-semibold mb-4 pb-2"
          style={{ 
            color: 'var(--slds-g-color-text-default)',
            borderBottom: '1px solid var(--slds-g-color-border-base-1)'
          }}
        >
          Comments
        </h3>
        
        <div>
          <Textarea
            id="comments"
            className="text-[13px] rounded min-h-[120px]"
            style={{
              backgroundColor: 'var(--slds-g-color-background-base)',
              border: '1px solid var(--slds-g-color-border-base-1)',
              color: 'var(--slds-g-color-text-default)'
            }}
            value={formData.comments}
            onChange={(e) => updateField("comments", e.target.value)}
            placeholder="Enter any additional comments about mental health history..."
          />
        </div>
      </div>

      {/* Treatment History Modal */}
      <Dialog open={showTreatmentModal} onOpenChange={setShowTreatmentModal}>
        <DialogContent 
          className="sm:max-w-4xl max-h-[90vh] overflow-y-auto"
          style={{
            backgroundColor: 'var(--slds-g-color-background-base)',
            border: '1px solid var(--slds-g-color-border-base-1)'
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
              {editingTreatment ? "Modify Treatment History" : "Add New Treatment History"}
            </DialogTitle>
            <DialogDescription className="text-[13px] font-normal" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Enter details about mental health treatment history.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Treatment Type */}
            <div>
              <Label htmlFor="treatment-type" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Treatment Type
              </Label>
              <Select value={treatmentForm.treatmentType} onValueChange={(value) => setTreatmentForm({ ...treatmentForm, treatmentType: value })}>
                <SelectTrigger 
                  id="treatment-type"
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                >
                  <SelectValue placeholder="--None--" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outpatient-therapy">Outpatient Therapy</SelectItem>
                  <SelectItem value="intensive-outpatient-therapy">Intensive Outpatient Therapy</SelectItem>
                  <SelectItem value="specialized-outpatient-therapy">Specialized Outpatient Therapy</SelectItem>
                  <SelectItem value="case-management">Case Management</SelectItem>
                  <SelectItem value="mentoring">Mentoring</SelectItem>
                  <SelectItem value="outpatient-substance-abuse">Outpatient Substance Abuse</SelectItem>
                  <SelectItem value="inpatient-substance-abuse">Inpatient Substance Abuse</SelectItem>
                  <SelectItem value="partial-psychiatric-hospitalization">Partial Psychiatric Hospitalization</SelectItem>
                  <SelectItem value="inpatient-psychiatric-hospitalization">Inpatient Psychiatric Hospitalization</SelectItem>
                  <SelectItem value="residential-treatment">Residential Treatment</SelectItem>
                  <SelectItem value="psychological-assessment">Psychological Assessment</SelectItem>
                  <SelectItem value="medication-management">Medication Management</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Treatment Location */}
            <div>
              <Label htmlFor="location" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Treatment Location
              </Label>
              <Input
                id="location"
                type="text"
                className="h-9 text-[13px] rounded"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
                value={treatmentForm.location}
                onChange={(e) => setTreatmentForm({ ...treatmentForm, location: e.target.value })}
                placeholder="Treatment facility or location"
              />
            </div>

            {/* How long ago did treatment stop */}
            <div>
              <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                How long ago did treatment stop?
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="text"
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={treatmentForm.howLongAgoStopped}
                  onChange={(e) => setTreatmentForm({ ...treatmentForm, howLongAgoStopped: e.target.value })}
                  placeholder="Enter number"
                />
                <Select value={treatmentForm.howLongAgoUnit} onValueChange={(value) => setTreatmentForm({ ...treatmentForm, howLongAgoUnit: value })}>
                  <SelectTrigger 
                    className="h-9 text-[13px] rounded"
                    style={{
                      backgroundColor: 'var(--slds-g-color-background-base)',
                      border: '1px solid var(--slds-g-color-border-base-1)',
                      color: 'var(--slds-g-color-text-default)'
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duration of treatment */}
            <div>
              <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Duration of treatment?
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="text"
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={treatmentForm.durationAmount}
                  onChange={(e) => setTreatmentForm({ ...treatmentForm, durationAmount: e.target.value })}
                  placeholder="Enter number"
                />
                <Select value={treatmentForm.durationUnit} onValueChange={(value) => setTreatmentForm({ ...treatmentForm, durationUnit: value })}>
                  <SelectTrigger 
                    className="h-9 text-[13px] rounded"
                    style={{
                      backgroundColor: 'var(--slds-g-color-background-base)',
                      border: '1px solid var(--slds-g-color-border-base-1)',
                      color: 'var(--slds-g-color-text-default)'
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Start Date and End Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  Start Date
                </Label>
                <DateInput
                  id="start-date"
className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={isoToMdy(treatmentForm.startDate)}
                  onChange={(v) => ((e) => setTreatmentForm({ ...treatmentForm, startDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
                />
              </div>

              <div>
                <Label htmlFor="end-date" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  End Date
                </Label>
                <DateInput
                  id="end-date"
className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={isoToMdy(treatmentForm.endDate)}
                  onChange={(v) => ((e) => setTreatmentForm({ ...treatmentForm, endDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
                />
              </div>
            </div>

            {/* Treatment Providers Section */}


            {/* Reasons for Treatment */}
            <div>
              <Label htmlFor="reason" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Reasons for Treatment
              </Label>
              <Textarea
                id="reason"
                className="text-[13px] rounded min-h-[80px]"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
                value={treatmentForm.reason}
                onChange={(e) => setTreatmentForm({ ...treatmentForm, reason: e.target.value })}
                placeholder="Reason for treatment"
              />
            </div>

            {/* Outcome of Treatment */}
            <div>
              <Label htmlFor="outcome" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Outcome of Treatment
              </Label>
              <Textarea
                id="outcome"
                className="text-[13px] rounded min-h-[80px]"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
                value={treatmentForm.outcome}
                onChange={(e) => setTreatmentForm({ ...treatmentForm, outcome: e.target.value })}
                placeholder="Treatment outcome or results"
              />
            </div>

            {/* Youth & Support System Feedback */}
            <div>
              <Label htmlFor="youth-feedback" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Youth & Support System Feedback
              </Label>
              <Textarea
                id="youth-feedback"
                className="text-[13px] rounded min-h-[80px]"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
                value={treatmentForm.youthFeedback}
                onChange={(e) => setTreatmentForm({ ...treatmentForm, youthFeedback: e.target.value })}
                placeholder="Feedback from youth and support system"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              onClick={() => setShowTreatmentModal(false)}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: 'var(--slds-g-color-neutral-95)',
                color: 'var(--slds-g-color-text-default)',
                border: '1px solid var(--slds-g-color-border-base-1)'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTreatment}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
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

      {/* Save/Cancel Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          onClick={handleCancel}
          variant="outline"
          disabled={!hasChanges}
          className="rounded-full h-9 px-6 text-[13px]"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="rounded-full h-9 px-6 text-[13px]"
          style={{
            backgroundColor: '#145F33',
            color: 'white'
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}