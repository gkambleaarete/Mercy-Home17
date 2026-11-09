import { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

export function PhysicalHealthSection() {
  const initialFormData = {
    // History or Current Presence
    traumaticBrainInjury: "",
    traumaticBrainInjuryDetails: "",
    chronicIllness: "",
    chronicIllnessDetails: "",
    injury: "",
    injuryDetails: "",
    surgery: "",
    surgeryDetails: "",
    medicalHospitalization: "",
    medicalHospitalizationDetails: "",
    asthma: "",
    asthmaDetails: "",
    allergies: "",
    epiPen: "",
    epiPenDetails: "",
    
    // Extended Asthma Section
    asthmaStartDate: "",
    asthmaEndDate: "",
    asthmaRelatedDocument: "",
    
    // Extended Allergy Section
    allergyStartDate: "",
    allergyEndDate: "",
    allergyRelatedDocument: "",
    allergyType: "",
    isFoodAllergy: "yes",
    dietaryChecked: true,
    dietaryNeedType: "",
    dietaryOther: "",
    allergyDetails: "",
    
    // Habits
    eatingHabits: "",
    eatingHabitsDetails: "",
    sleepingHabits: "",
    sleepingHabitsDetails: "",
    hygieneHabits: "",
    hygieneHabitsDetails: "",
    habitsDetails: ""
  };

  const [formData, setFormData] = useState(initialFormData);
  const [savedFormData, setSavedFormData] = useState(initialFormData);

  // Check if form has unsaved changes
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(savedFormData);

  const updateField = (field: string, value: string | boolean) => {
    const updates: any = { [field]: value };
    
    // Auto-manage dietary checkbox when food allergy changes
    if (field === "isFoodAllergy") {
      updates.dietaryChecked = value === "yes";
    }
    
    // Auto-set isFoodAllergy to Yes when Food allergy type is selected
    if (field === "allergyType" && value === "food") {
      updates.isFoodAllergy = "yes";
      updates.dietaryChecked = true;
    }
    
    setFormData({ ...formData, ...updates });
  };

  const handleSave = () => {
    // Save current state
    setSavedFormData(formData);
    
    // TODO: When integrating with global state (medicalNeeds array):
    // If formData.asthma === "yes" && formData.asthmaStartDate is filled:
    //   - Create/update record in medicalNeeds array with:
    //     {
    //       id: <new or existing>,
    //       type: "Asthma",
    //       startDate: formData.asthmaStartDate (convert to MM/DD/YYYY),
    //       endDate: formData.asthmaEndDate (convert to MM/DD/YYYY or empty),
    //       details: formData.asthmaDetails,
    //       relatedDocument: formData.asthmaRelatedDocument
    //     }
    //   - This will populate the Current Medical Needs > Medical & Physical Needs list
    
    // Here you would normally save to backend/database
  };

  const handleCancel = () => {
    // Revert to saved state
    setFormData(savedFormData);
  };

  return (
    <div className="space-y-6">
      {/* History or Current Presence Section */}
      <div>
        <h4 
          className="text-[13px] font-semibold mb-4 pb-2"
          style={{ 
            color: 'var(--slds-g-color-text-default)',
            borderBottom: '1px solid var(--slds-g-color-border-base-1)'
          }}
        >
          History or Current Presence
        </h4>
        
        <div className="space-y-4">
          {/* Traumatic Brain Injury */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Traumatic Brain Injury
            </Label>
            <RadioGroup 
              value={formData.traumaticBrainInjury} 
              onValueChange={(value) => updateField("traumaticBrainInjury", value)}
            >
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="tbi-yes" />
                  <Label htmlFor="tbi-yes" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Yes
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="tbi-no" />
                  <Label htmlFor="tbi-no" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    No
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="unknown" id="tbi-unknown" />
                  <Label htmlFor="tbi-unknown" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Unknown
                  </Label>
                </div>
              </div>
            </RadioGroup>
            {formData.traumaticBrainInjury === "yes" && (
              <div className="mt-3">
                <Label 
                  htmlFor="tbi-details" 
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Details
                </Label>
                <Input
                  id="tbi-details"
                  className="text-[13px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={formData.traumaticBrainInjuryDetails}
                  onChange={(e) => updateField("traumaticBrainInjuryDetails", e.target.value)}
                  placeholder="Provide details..."
                />
              </div>
            )}
          </div>

          {/* Chronic Illness */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Chronic Illness
            </Label>
            <RadioGroup 
              value={formData.chronicIllness} 
              onValueChange={(value) => updateField("chronicIllness", value)}
            >
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="chronic-yes" />
                  <Label htmlFor="chronic-yes" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Yes
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="chronic-no" />
                  <Label htmlFor="chronic-no" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    No
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="unknown" id="chronic-unknown" />
                  <Label htmlFor="chronic-unknown" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Unknown
                  </Label>
                </div>
              </div>
            </RadioGroup>
            {formData.chronicIllness === "yes" && (
              <div className="mt-3">
                <Label 
                  htmlFor="chronic-details" 
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Details
                </Label>
                <Textarea
                  id="chronic-details"
                  className="text-[13px] rounded min-h-[80px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={formData.chronicIllnessDetails}
                  onChange={(e) => updateField("chronicIllnessDetails", e.target.value)}
                  placeholder="Provide details..."
                />
              </div>
            )}
          </div>

          {/* Injury */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Injury
            </Label>
            <RadioGroup 
              value={formData.injury} 
              onValueChange={(value) => updateField("injury", value)}
            >
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="injury-yes" />
                  <Label htmlFor="injury-yes" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Yes
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="injury-no" />
                  <Label htmlFor="injury-no" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    No
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="unknown" id="injury-unknown" />
                  <Label htmlFor="injury-unknown" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Unknown
                  </Label>
                </div>
              </div>
            </RadioGroup>
            {formData.injury === "yes" && (
              <div className="mt-3">
                <Label 
                  htmlFor="injury-details" 
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Details
                </Label>
                <Textarea
                  id="injury-details"
                  className="text-[13px] rounded min-h-[80px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={formData.injuryDetails}
                  onChange={(e) => updateField("injuryDetails", e.target.value)}
                  placeholder="Provide details..."
                />
              </div>
            )}
          </div>

          {/* Surgery */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Surgery
            </Label>
            <RadioGroup 
              value={formData.surgery} 
              onValueChange={(value) => updateField("surgery", value)}
            >
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="surgery-yes" />
                  <Label htmlFor="surgery-yes" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Yes
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="surgery-no" />
                  <Label htmlFor="surgery-no" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    No
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="unknown" id="surgery-unknown" />
                  <Label htmlFor="surgery-unknown" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Unknown
                  </Label>
                </div>
              </div>
            </RadioGroup>
            {formData.surgery === "yes" && (
              <div className="mt-3">
                <Label 
                  htmlFor="surgery-details" 
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Details
                </Label>
                <Textarea
                  id="surgery-details"
                  className="text-[13px] rounded min-h-[80px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={formData.surgeryDetails}
                  onChange={(e) => updateField("surgeryDetails", e.target.value)}
                  placeholder="Provide details..."
                />
              </div>
            )}
          </div>

          {/* Medical Hospitalization */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Medical Hospitalization
            </Label>
            <RadioGroup 
              value={formData.medicalHospitalization} 
              onValueChange={(value) => updateField("medicalHospitalization", value)}
            >
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="hospitalization-yes" />
                  <Label htmlFor="hospitalization-yes" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Yes
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="hospitalization-no" />
                  <Label htmlFor="hospitalization-no" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    No
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="unknown" id="hospitalization-unknown" />
                  <Label htmlFor="hospitalization-unknown" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Unknown
                  </Label>
                </div>
              </div>
            </RadioGroup>
            {formData.medicalHospitalization === "yes" && (
              <div className="mt-3">
                <Label 
                  htmlFor="hospitalization-details" 
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Details
                </Label>
                <Textarea
                  id="hospitalization-details"
                  className="text-[13px] rounded min-h-[80px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={formData.medicalHospitalizationDetails}
                  onChange={(e) => updateField("medicalHospitalizationDetails", e.target.value)}
                  placeholder="Provide details..."
                />
              </div>
            )}
          </div>

          {/* Asthma */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Asthma
            </Label>
            <RadioGroup 
              value={formData.asthma} 
              onValueChange={(value) => updateField("asthma", value)}
            >
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="asthma-yes" />
                  <Label htmlFor="asthma-yes" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Yes
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="asthma-no" />
                  <Label htmlFor="asthma-no" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    No
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="unknown" id="asthma-unknown" />
                  <Label htmlFor="asthma-unknown" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Unknown
                  </Label>
                </div>
              </div>
            </RadioGroup>

            {/* Extended Asthma Section */}
            {formData.asthma === "yes" && (
              <div 
                className="p-4 rounded mt-4"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-alt)',
                  border: '1px solid var(--slds-g-color-border-base-1)'
                }}
              >
                <h4 
                  className="text-[13px] font-semibold mb-4 pb-2"
                  style={{ 
                    color: 'var(--slds-g-color-text-default)',
                    borderBottom: '1px solid var(--slds-g-color-border-base-1)'
                  }}
                >
                  Asthma Information
                </h4>

                <div className="space-y-4">
                  {/* Start Date */}
                  <div>
                    <Label 
                      htmlFor="asthma-start-date" 
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      Start Date <span className="text-red-600">*</span>
                    </Label>
                    <DateInput
                      id="asthma-start-date"
className="text-[13px]"
                      style={{
                        backgroundColor: 'var(--slds-g-color-background-base)',
                        border: '1px solid var(--slds-g-color-border-base-1)',
                        color: 'var(--slds-g-color-text-default)'
                      }}
                      value={isoToMdy(formData.asthmaStartDate)}
                      onChange={(v) => ((e) => updateField("asthmaStartDate", e.target.value))({ target: { value: mdyToIso(v) } })}
                      required
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <Label 
                      htmlFor="asthma-end-date" 
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      End Date
                    </Label>
                    <DateInput
                      id="asthma-end-date"
className="text-[13px]"
                      style={{
                        backgroundColor: 'var(--slds-g-color-background-base)',
                        border: '1px solid var(--slds-g-color-border-base-1)',
                        color: 'var(--slds-g-color-text-default)'
                      }}
                      value={isoToMdy(formData.asthmaEndDate)}
                      onChange={(v) => ((e) => updateField("asthmaEndDate", e.target.value))({ target: { value: mdyToIso(v) } })}
                    />
                  </div>

                  {/* Related Document */}
                  <div>
                    <Label 
                      htmlFor="asthma-related-document" 
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      Related Document
                    </Label>
                    <Input
                      id="asthma-related-document"
                      className="text-[13px]"
                      style={{
                        backgroundColor: 'var(--slds-g-color-background-base)',
                        border: '1px solid var(--slds-g-color-border-base-1)',
                        color: 'var(--slds-g-color-text-default)'
                      }}
                      value={formData.asthmaRelatedDocument}
                      onChange={(e) => updateField("asthmaRelatedDocument", e.target.value)}
                      placeholder="Lookup to document records (future)"
                      disabled
                    />
                  </div>

                  {/* Details */}
                  <div>
                    <Label 
                      htmlFor="asthma-details" 
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      Details
                    </Label>
                    <Textarea
                      id="asthma-details"
                      className="text-[13px] rounded min-h-[100px]"
                      style={{
                        backgroundColor: 'var(--slds-g-color-background-base)',
                        border: '1px solid var(--slds-g-color-border-base-1)',
                        color: 'var(--slds-g-color-text-default)'
                      }}
                      value={formData.asthmaDetails}
                      onChange={(e) => updateField("asthmaDetails", e.target.value)}
                      placeholder="Provide asthma details..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Allergies */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Allergies
            </Label>
            <RadioGroup 
              value={formData.allergies} 
              onValueChange={(value) => updateField("allergies", value)}
            >
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="allergies-yes" />
                  <Label htmlFor="allergies-yes" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Yes
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="allergies-no" />
                  <Label htmlFor="allergies-no" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    No
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="unknown" id="allergies-unknown" />
                  <Label htmlFor="allergies-unknown" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Unknown
                  </Label>
                </div>
              </div>
            </RadioGroup>

            {/* Extended Allergy Section */}
            {formData.allergies === "yes" && (
              <div 
                className="p-4 rounded mt-4"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-alt)',
                  border: '1px solid var(--slds-g-color-border-base-1)'
                }}
              >
                <h4 
                  className="text-[13px] font-semibold mb-4 pb-2"
                  style={{ 
                    color: 'var(--slds-g-color-text-default)',
                    borderBottom: '1px solid var(--slds-g-color-border-base-1)'
                  }}
                >
                  Allergy Information
                </h4>

                <div className="space-y-4">
                  {/* Start Date */}
                  <div>
                    <Label 
                      htmlFor="allergy-start-date" 
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      Start Date <span className="text-red-600">*</span>
                    </Label>
                    <DateInput
                      id="allergy-start-date"
className="text-[13px]"
                      style={{
                        backgroundColor: 'var(--slds-g-color-background-base)',
                        border: '1px solid var(--slds-g-color-border-base-1)',
                        color: 'var(--slds-g-color-text-default)'
                      }}
                      value={isoToMdy(formData.allergyStartDate)}
                      onChange={(v) => ((e) => updateField("allergyStartDate", e.target.value))({ target: { value: mdyToIso(v) } })}
                      required
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <Label 
                      htmlFor="allergy-end-date" 
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      End Date
                    </Label>
                    <DateInput
                      id="allergy-end-date"
className="text-[13px]"
                      style={{
                        backgroundColor: 'var(--slds-g-color-background-base)',
                        border: '1px solid var(--slds-g-color-border-base-1)',
                        color: 'var(--slds-g-color-text-default)'
                      }}
                      value={isoToMdy(formData.allergyEndDate)}
                      onChange={(v) => ((e) => updateField("allergyEndDate", e.target.value))({ target: { value: mdyToIso(v) } })}
                    />
                  </div>

                  {/* Related Document */}
                  <div>
                    <Label 
                      htmlFor="allergy-related-document" 
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      Related Document
                    </Label>
                    <Input
                      id="allergy-related-document"
                      className="text-[13px]"
                      style={{
                        backgroundColor: 'var(--slds-g-color-background-base)',
                        border: '1px solid var(--slds-g-color-border-base-1)',
                        color: 'var(--slds-g-color-text-default)'
                      }}
                      value={formData.allergyRelatedDocument}
                      onChange={(e) => updateField("allergyRelatedDocument", e.target.value)}
                      placeholder="Lookup to document records (future)"
                      disabled
                    />
                  </div>

                  {/* Allergy Type */}
                  <div>
                    <Label 
                      htmlFor="allergy-type" 
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      Allergy Type
                    </Label>
                    <select
                      id="allergy-type"
                      className="w-full text-[13px] px-3 py-2 rounded"
                      style={{
                        backgroundColor: 'var(--slds-g-color-background-base)',
                        border: '1px solid var(--slds-g-color-border-base-1)',
                        color: 'var(--slds-g-color-text-default)'
                      }}
                      value={formData.allergyType}
                      onChange={(e) => updateField("allergyType", e.target.value)}
                    >
                      <option value="">-- Select --</option>
                      <option value="environmental">Environmental</option>
                      <option value="food">Food</option>
                      <option value="medical">Medical</option>
                      <option value="animal">Animal/Bug/Insect</option>
                    </select>
                  </div>

                  {/* Food Allergy Specific Fields */}
                  {formData.allergyType === "food" && (
                    <div className="space-y-4 pl-4 border-l-2" style={{ borderColor: '#145F33' }}>
                      {/* Is this a food allergy? */}
                      <div>
                        <Label 
                          className="block text-[12px] font-semibold mb-1.5 uppercase"
                          style={{ color: 'var(--slds-g-color-text-weak)' }}
                        >
                          Is this a food allergy?
                        </Label>
                        <RadioGroup 
                          value={formData.isFoodAllergy} 
                          onValueChange={(value) => updateField("isFoodAllergy", value)}
                        >
                          <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="yes" id="food-allergy-yes" />
                              <Label htmlFor="food-allergy-yes" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="no" id="food-allergy-no" />
                              <Label htmlFor="food-allergy-no" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                No
                              </Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Dietary Checkbox (Read-only) */}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="dietary-checkbox"
                          checked={formData.dietaryChecked}
                          disabled
                          style={{
                            opacity: 0.7,
                            cursor: 'not-allowed'
                          }}
                        />
                        <Label 
                          htmlFor="dietary-checkbox" 
                          className="text-[13px] font-normal"
                          style={{ color: 'var(--slds-g-color-text-weak)' }}
                        >
                          Dietary (Auto-checked for food allergies)
                        </Label>
                      </div>

                      {/* Dietary Need Type */}
                      <div>
                        <Label 
                          htmlFor="dietary-need-type" 
                          className="block text-[12px] font-semibold mb-1.5 uppercase"
                          style={{ color: 'var(--slds-g-color-text-weak)' }}
                        >
                          Dietary Need Type
                        </Label>
                        <select
                          id="dietary-need-type"
                          className="w-full text-[13px] px-3 py-2 rounded"
                          style={{
                            backgroundColor: 'var(--slds-g-color-background-base)',
                            border: '1px solid var(--slds-g-color-border-base-1)',
                            color: 'var(--slds-g-color-text-default)'
                          }}
                          value={formData.dietaryNeedType}
                          onChange={(e) => updateField("dietaryNeedType", e.target.value)}
                        >
                          <option value="">-- Select --</option>
                          <option value="vegetarian">Vegetarian</option>
                          <option value="no-red-meat">No Red Meat</option>
                          <option value="no-chicken">No Chicken</option>
                          <option value="no-fish">No Fish</option>
                          <option value="no-shellfish">No Shellfish</option>
                          <option value="no-eggs">No Eggs</option>
                          <option value="no-pork">No Pork</option>
                          <option value="no-dairy">No Dairy Products</option>
                          <option value="vegetarian-eats-fish">Vegetarian But Eats Fish</option>
                          <option value="vegan">Vegan</option>
                          <option value="kosher">Kosher</option>
                          <option value="halal">Halal</option>
                          <option value="celiac">Celiac Disease</option>
                          <option value="gluten-free">Gluten Free</option>
                          <option value="dairy-free">Dairy Free</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* Other (Dietary) */}
                      {formData.dietaryNeedType === "other" && (
                        <div>
                          <Label 
                            htmlFor="dietary-other" 
                            className="block text-[12px] font-semibold mb-1.5 uppercase"
                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                          >
                            Other (Dietary)
                          </Label>
                          <Input
                            id="dietary-other"
                            className="text-[13px]"
                            style={{
                              backgroundColor: 'var(--slds-g-color-background-base)',
                              border: '1px solid var(--slds-g-color-border-base-1)',
                              color: 'var(--slds-g-color-text-default)'
                            }}
                            value={formData.dietaryOther}
                            onChange={(e) => updateField("dietaryOther", e.target.value)}
                            placeholder="Specify other dietary need..."
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Allergy Details */}
                  <div>
                    <Label 
                      htmlFor="allergy-details" 
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{ color: 'var(--slds-g-color-text-weak)' }}
                    >
                      Comments
                    </Label>
                    <Textarea
                      id="allergy-details"
                      className="text-[13px] rounded min-h-[100px]"
                      style={{
                        backgroundColor: 'var(--slds-g-color-background-base)',
                        border: '1px solid var(--slds-g-color-border-base-1)',
                        color: 'var(--slds-g-color-text-default)'
                      }}
                      value={formData.allergyDetails}
                      onChange={(e) => updateField("allergyDetails", e.target.value)}
                      placeholder="Provide allergy details..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Epi-pen */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Epi-pen
            </Label>
            <RadioGroup 
              value={formData.epiPen} 
              onValueChange={(value) => updateField("epiPen", value)}
            >
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="epipen-yes" />
                  <Label htmlFor="epipen-yes" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Yes
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="epipen-no" />
                  <Label htmlFor="epipen-no" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    No
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="unknown" id="epipen-unknown" />
                  <Label htmlFor="epipen-unknown" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Unknown
                  </Label>
                </div>
              </div>
            </RadioGroup>
            {formData.epiPen === "yes" && (
              <div className="mt-3">
                <Label 
                  htmlFor="epipen-details" 
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Details
                </Label>
                <Textarea
                  id="epipen-details"
                  className="text-[13px] rounded min-h-[80px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={formData.epiPenDetails}
                  onChange={(e) => updateField("epiPenDetails", e.target.value)}
                  placeholder="Provide details..."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Habits Section */}
      <div>
        <h4 
          className="text-[13px] font-semibold mb-4 pb-2"
          style={{ 
            color: 'var(--slds-g-color-text-default)',
            borderBottom: '1px solid var(--slds-g-color-border-base-1)'
          }}
        >
          Habits
        </h4>
        
        <div className="space-y-4">
          {/* Eating Habits */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Eating Habits
            </Label>
            <RadioGroup 
              value={formData.eatingHabits} 
              onValueChange={(value) => updateField("eatingHabits", value)}
            >
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="good" id="eating-good" />
                  <Label htmlFor="eating-good" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Good
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="fair" id="eating-fair" />
                  <Label htmlFor="eating-fair" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Fair
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="poor" id="eating-poor" />
                  <Label htmlFor="eating-poor" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Poor
                  </Label>
                </div>
              </div>
            </RadioGroup>
            {formData.eatingHabits && (
              <div className="mt-3">
                <Label 
                  htmlFor="eating-habits-details" 
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Details
                </Label>
                <Textarea
                  id="eating-habits-details"
                  className="text-[13px] rounded min-h-[80px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={formData.eatingHabitsDetails}
                  onChange={(e) => updateField("eatingHabitsDetails", e.target.value)}
                  placeholder="Provide details about eating habits..."
                />
              </div>
            )}
          </div>

          {/* Sleeping Habits */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Sleeping Habits
            </Label>
            <RadioGroup 
              value={formData.sleepingHabits} 
              onValueChange={(value) => updateField("sleepingHabits", value)}
            >
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="good" id="sleeping-good" />
                  <Label htmlFor="sleeping-good" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Good
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="fair" id="sleeping-fair" />
                  <Label htmlFor="sleeping-fair" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Fair
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="poor" id="sleeping-poor" />
                  <Label htmlFor="sleeping-poor" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Poor
                  </Label>
                </div>
              </div>
            </RadioGroup>
            {formData.sleepingHabits && (
              <div className="mt-3">
                <Label 
                  htmlFor="sleeping-habits-details" 
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Details
                </Label>
                <Textarea
                  id="sleeping-habits-details"
                  className="text-[13px] rounded min-h-[80px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={formData.sleepingHabitsDetails}
                  onChange={(e) => updateField("sleepingHabitsDetails", e.target.value)}
                  placeholder="Provide details about sleeping habits..."
                />
              </div>
            )}
          </div>

          {/* Hygiene Habits */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Hygiene Habits
            </Label>
            <RadioGroup 
              value={formData.hygieneHabits} 
              onValueChange={(value) => updateField("hygieneHabits", value)}
            >
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="good" id="hygiene-good" />
                  <Label htmlFor="hygiene-good" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Good
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="fair" id="hygiene-fair" />
                  <Label htmlFor="hygiene-fair" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Fair
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="poor" id="hygiene-poor" />
                  <Label htmlFor="hygiene-poor" className="text-[13px] font-normal cursor-pointer" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Poor
                  </Label>
                </div>
              </div>
            </RadioGroup>
            {formData.hygieneHabits && (
              <div className="mt-3">
                <Label 
                  htmlFor="hygiene-habits-details" 
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Details
                </Label>
                <Textarea
                  id="hygiene-habits-details"
                  className="text-[13px] rounded min-h-[80px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={formData.hygieneHabitsDetails}
                  onChange={(e) => updateField("hygieneHabitsDetails", e.target.value)}
                  placeholder="Provide details about hygiene habits..."
                />
              </div>
            )}
          </div>

          {/* Persistent Details Field */}
          <div className="mt-6">
            <h4
              className="text-[13px] font-semibold mb-4 pb-2"
              style={{
                color: 'var(--slds-g-color-text-default)',
                borderBottom: '1px solid var(--slds-g-color-border-base-1)'
              }}
            >
              Comments
            </h4>
            <Textarea
              id="habits-details"
              className="text-[13px] rounded min-h-[100px]"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              value={formData.habitsDetails}
              onChange={(e) => updateField("habitsDetails", e.target.value)}
              placeholder="Enter any additional details about habits..."
            />
          </div>
        </div>
      </div>

      {/* Save/Cancel Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          onClick={handleCancel}
          variant="outline"
          className="h-9 px-4 text-[13px]"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="h-9 px-4 text-[13px]"
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