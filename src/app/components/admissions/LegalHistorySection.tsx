import { useState } from "react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

export function LegalHistorySection() {
  const [formData, setFormData] = useState({
    beenArrested: "",
    beenArrestedDetails: "",
    beenDetained: "",
    beenDetainedDetails: "",
    beenCharged: "",
    beenChargedDetails: "",
    pleadedGuilty: "",
    pleadedGuiltyDetails: "",
    beenOnProbation: "",
    beenOnProbationDetails: "",
    beenOnParole: "",
    beenOnParoleDetails: "",
    summary: ""
  });

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Legal History: Current & Ofyla */}
      <div>
        <div className="space-y-4">
          {/* Has the youth ever been arrested? */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Has the youth ever been arrested?
            </Label>
            <RadioGroup value={formData.beenArrested} onValueChange={(value) => updateField("beenArrested", value)}>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="arrested-yes" />
                  <label 
                    htmlFor="arrested-yes" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="arrested-no" />
                  <label 
                    htmlFor="arrested-no" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    No
                  </label>
                </div>
              </div>
            </RadioGroup>
            {formData.beenArrested === "yes" && (
              <div className="mt-3">
                <Label 
                  htmlFor="arrested-details" 
                  className="block text-[12px] font-semibold mb-1.5 uppercase" 
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Details <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="arrested-details"
                  className="text-[13px] rounded min-h-[100px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={formData.beenArrestedDetails}
                  onChange={(e) => updateField("beenArrestedDetails", e.target.value)}
                  placeholder="Provide details..."
                  required
                />
              </div>
            )}
          </div>

          {/* Has the youth ever been detained or incarcerated? */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Has the youth ever been detained or incarcerated?
            </Label>
            <RadioGroup value={formData.beenDetained} onValueChange={(value) => updateField("beenDetained", value)}>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="detained-yes" />
                  <label 
                    htmlFor="detained-yes" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="detained-no" />
                  <label 
                    htmlFor="detained-no" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    No
                  </label>
                </div>
              </div>
            </RadioGroup>
            {formData.beenDetained === "yes" && (
              <div className="mt-3">
                <Label 
                  htmlFor="detained-details" 
                  className="block text-[12px] font-semibold mb-1.5 uppercase" 
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Details <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="detained-details"
                  className="text-[13px] rounded min-h-[100px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={formData.beenDetainedDetails}
                  onChange={(e) => updateField("beenDetainedDetails", e.target.value)}
                  placeholder="Provide details..."
                  required
                />
              </div>
            )}
          </div>

          {/* Has the youth ever been charged with a crime? */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Has the youth ever been charged with a crime?
            </Label>
            <RadioGroup value={formData.beenCharged} onValueChange={(value) => updateField("beenCharged", value)}>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="charged-yes" />
                  <label 
                    htmlFor="charged-yes" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="charged-no" />
                  <label 
                    htmlFor="charged-no" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    No
                  </label>
                </div>
              </div>
            </RadioGroup>
            {formData.beenCharged === "yes" && (
              <div className="mt-3">
                <Label 
                  htmlFor="charged-details" 
                  className="block text-[12px] font-semibold mb-1.5 uppercase" 
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Details <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="charged-details"
                  className="text-[13px] rounded min-h-[100px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={formData.beenChargedDetails}
                  onChange={(e) => updateField("beenChargedDetails", e.target.value)}
                  placeholder="Provide details..."
                  required
                />
              </div>
            )}
          </div>

          {/* Has the youth ever pleaded or been found guilty of a crime? */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Has the youth ever pleaded or been found guilty of a crime?
            </Label>
            <RadioGroup value={formData.pleadedGuilty} onValueChange={(value) => updateField("pleadedGuilty", value)}>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="guilty-yes" />
                  <label 
                    htmlFor="guilty-yes" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="guilty-no" />
                  <label 
                    htmlFor="guilty-no" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    No
                  </label>
                </div>
              </div>
            </RadioGroup>
            {formData.pleadedGuilty === "yes" && (
              <div className="mt-3">
                <Label 
                  htmlFor="guilty-details" 
                  className="block text-[12px] font-semibold mb-1.5 uppercase" 
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Details <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="guilty-details"
                  className="text-[13px] rounded min-h-[100px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={formData.pleadedGuiltyDetails}
                  onChange={(e) => updateField("pleadedGuiltyDetails", e.target.value)}
                  placeholder="Provide details..."
                  required
                />
              </div>
            )}
          </div>

          {/* Has the youth ever been on probation? */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Has the youth ever been on probation?
            </Label>
            <RadioGroup value={formData.beenOnProbation} onValueChange={(value) => updateField("beenOnProbation", value)}>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="probation-yes" />
                  <label 
                    htmlFor="probation-yes" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="probation-no" />
                  <label 
                    htmlFor="probation-no" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    No
                  </label>
                </div>
              </div>
            </RadioGroup>
            {formData.beenOnProbation === "yes" && (
              <div className="mt-3">
                <Label 
                  htmlFor="probation-details" 
                  className="block text-[12px] font-semibold mb-1.5 uppercase" 
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Details <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="probation-details"
                  className="text-[13px] rounded min-h-[100px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={formData.beenOnProbationDetails}
                  onChange={(e) => updateField("beenOnProbationDetails", e.target.value)}
                  placeholder="Provide details..."
                  required
                />
              </div>
            )}
          </div>

          {/* Has the youth ever been on parole? */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Has the youth ever been on parole?
            </Label>
            <RadioGroup value={formData.beenOnParole} onValueChange={(value) => updateField("beenOnParole", value)}>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="parole-yes" />
                  <label 
                    htmlFor="parole-yes" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="parole-no" />
                  <label 
                    htmlFor="parole-no" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    No
                  </label>
                </div>
              </div>
            </RadioGroup>
            {formData.beenOnParole === "yes" && (
              <div className="mt-3">
                <Label 
                  htmlFor="parole-details" 
                  className="block text-[12px] font-semibold mb-1.5 uppercase" 
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Details <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="parole-details"
                  className="text-[13px] rounded min-h-[100px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={formData.beenOnParoleDetails}
                  onChange={(e) => updateField("beenOnParoleDetails", e.target.value)}
                  placeholder="Provide details..."
                  required
                />
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <Label 
              htmlFor="legal-summary" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Summary
            </Label>
            <Textarea
              id="legal-summary"
              className="text-[13px] rounded min-h-[120px]"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              value={formData.summary}
              onChange={(e) => updateField("summary", e.target.value)}
              placeholder="Provide a summary of the youth's legal history..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
