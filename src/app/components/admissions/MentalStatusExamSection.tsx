import { useState } from "react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";

export function MentalStatusExamSection() {
  const initialMseData = {
    // Section 1: General Observations
    appearance: "",
    build: "",
    eyeContact: "",
    activity: "",
    speech: "",
    demeanor: [] as string[],
    
    // Section 2: Thought Content
    delusions: [] as string[],
    selfAbuse: [] as string[],
    aggression: [] as string[],
    
    // Section 3: Perception
    hallucinations: [] as string[],
    thoughtProcess: [] as string[],
    mood: [] as string[],
    affect: [] as string[],
    behavior: [] as string[],
    
    // Section 4: Cognition
    orientationRating: "",
    memoryRating: "",
    attentionRating: "",
    abstractionRating: "",
    intelligence: "",
    
    // Section 5: Insight/Judgment
    insightJudgment: "",
    insightJudgmentExplain: "",
    
    // Section 6: Comments
    mseComments: ""
  };

  const [mseData, setMseData] = useState(initialMseData);
  const [savedMseData, setSavedMseData] = useState(initialMseData);
  
  // Check if form has unsaved changes
  const hasChanges = JSON.stringify(mseData) !== JSON.stringify(savedMseData);

  const updateMSEField = (field: string, value: any) => {
    setMseData({ ...mseData, [field]: value });
  };

  const handleSave = () => {
    setSavedMseData(mseData);
    // Here you would normally save to backend/database
  };

  const handleCancel = () => {
    setMseData(savedMseData);
  };

  // Helper function for multi-select checkboxes
  const toggleMSEItem = (category: string, value: string) => {
    const currentItems = mseData[category as keyof typeof mseData] as string[];
    
    // Handle "None Present" exclusion logic
    if (value === "None Present") {
      updateMSEField(category, ["None Present"]);
      return;
    }
    
    // If "None Present" was selected, clear it when selecting other items
    const filteredItems = currentItems.filter(item => item !== "None Present");
    
    const exists = filteredItems.includes(value);
    if (exists) {
      updateMSEField(category, filteredItems.filter(item => item !== value));
    } else {
      updateMSEField(category, [...filteredItems, value]);
    }
  };

  const isMSEItemSelected = (category: string, value: string): boolean => {
    const items = mseData[category as keyof typeof mseData] as string[];
    return items.includes(value);
  };

  // Render multi-select component without ratings
  const renderMultiSelect = (
    category: string,
    label: string,
    options: string[]
  ) => {
    const hasNonePresent = options.includes("None Present");
    const nonePresent = isMSEItemSelected(category, "None Present");
    
    return (
      <div>
        <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
          {label}
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
          {options.map((option) => {
            const isSelected = isMSEItemSelected(category, option);
            const isNonePresent = option === "None Present";
            
            return (
              <div key={option} className="flex items-center gap-2">
                <Checkbox
                  id={`${category}-${option}`}
                  checked={isSelected}
                  onCheckedChange={() => toggleMSEItem(category, option)}
                  disabled={!isNonePresent && nonePresent}
                  className="data-[state=checked]:bg-[#145F33] data-[state=checked]:border-[#145F33]"
                />
                <label
                  htmlFor={`${category}-${option}`}
                  className="text-[13px] cursor-pointer"
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                >
                  {option}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Section 1: General Observations */}
      <div className="mb-8">
        <h3
          className="text-[13px] font-semibold pb-2 mb-4"
          style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
        >
          General Observations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Appearance */}
          <div>
            <Label htmlFor="mse-appearance" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Appearance
            </Label>
            <Select value={mseData.appearance} onValueChange={(value) => updateMSEField("appearance", value)}>
              <SelectTrigger
                id="mse-appearance"
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
                <SelectItem value="well-groomed">Well Groomed</SelectItem>
                <SelectItem value="unkempt">Unkempt</SelectItem>
                <SelectItem value="disheveled">Disheveled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Build */}
          <div>
            <Label htmlFor="mse-build" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Build
            </Label>
            <Select value={mseData.build} onValueChange={(value) => updateMSEField("build", value)}>
              <SelectTrigger
                id="mse-build"
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
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="thin">Thin</SelectItem>
                <SelectItem value="overweight">Overweight</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Eye Contact */}
          <div>
            <Label htmlFor="mse-eye-contact" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Eye Contact
            </Label>
            <Select value={mseData.eyeContact} onValueChange={(value) => updateMSEField("eyeContact", value)}>
              <SelectTrigger
                id="mse-eye-contact"
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
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="avoidant">Avoidant</SelectItem>
                <SelectItem value="intense">Intense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Activity */}
          <div>
            <Label htmlFor="mse-activity" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Activity
            </Label>
            <Select value={mseData.activity} onValueChange={(value) => updateMSEField("activity", value)}>
              <SelectTrigger
                id="mse-activity"
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
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="agitated">Agitated</SelectItem>
                <SelectItem value="slow">Slow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Speech */}
          <div>
            <Label htmlFor="mse-speech" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Speech
            </Label>
            <Select value={mseData.speech} onValueChange={(value) => updateMSEField("speech", value)}>
              <SelectTrigger
                id="mse-speech"
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
                <SelectItem value="clear">Clear</SelectItem>
                <SelectItem value="slurred">Slurred</SelectItem>
                <SelectItem value="rapid">Rapid</SelectItem>
                <SelectItem value="pressured">Pressured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Demeanor - Multi-select */}
          <div className="md:col-span-3">
            <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Demeanor
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["Average", "Hostile", "Mistrustful", "Withdrawn", "Preoccupied", "Demanding"].map((option) => (
                <div key={option} className="flex items-center gap-2">
                  <Checkbox
                    id={`demeanor-${option}`}
                    checked={mseData.demeanor.includes(option)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateMSEField("demeanor", [...mseData.demeanor, option]);
                      } else {
                        updateMSEField("demeanor", mseData.demeanor.filter(d => d !== option));
                      }
                    }}
                    className="data-[state=checked]:bg-[#145F33] data-[state=checked]:border-[#145F33]"
                  />
                  <label
                    htmlFor={`demeanor-${option}`}
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Thought Content */}
      <div className="mb-8">
        <h3
          className="text-[13px] font-semibold pb-2 mb-4"
          style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
        >
          Thought Content
        </h3>

        <div className="space-y-6">
          {renderMultiSelect(
            "delusions",
            "Delusions",
            ["Grandiose", "Persecutory", "Somatic", "Bizarre", "Nihilistic", "Religious", "Obsessional", "Phobic", "Guilty", "Ideas of Reverence", "Autistic", "Preoccupied", "Other", "Guarded", "None Present"]
          )}
          {renderMultiSelect(
            "selfAbuse",
            "Self-Abuse",
            ["Suicidal Intent", "Suicidal Plan", "Self-Injury", "None Present"]
          )}
          {renderMultiSelect(
            "aggression",
            "Aggression",
            ["Aggressive Intent", "Aggressive Plan", "None Present"]
          )}
        </div>
      </div>

      {/* Section 3: Perception */}
      <div className="mb-8">
        <h3
          className="text-[13px] font-semibold pb-2 mb-4"
          style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
        >
          Perception
        </h3>

        <div className="space-y-6">
          {renderMultiSelect(
            "hallucinations",
            "Hallucinations",
            ["Auditory", "Visual", "Olfactory", "Gustatory", "Tactile", "Illusions", "Depersonalization", "Derealization", "Other", "None Present"]
          )}
          {renderMultiSelect(
            "thoughtProcess",
            "Thought Process",
            ["Logical", "Circumstantial", "Tangential", "Racing", "Incoherent", "Concrete", "Blocked", "Flight of Ideas", "Other", "Loose"]
          )}
          {renderMultiSelect(
            "mood",
            "Mood",
            ["Euthymic", "Depressed", "Anxious", "Angry", "Euphoric", "Irritable"]
          )}
          {renderMultiSelect(
            "affect",
            "Affect",
            ["Full", "Constricted", "Flat", "Inappropriate", "Labile"]
          )}
          {renderMultiSelect(
            "behavior",
            "Behavior",
            ["Cooperative", "Resistant", "Agitated", "Impulsive", "Over Sedated", "Aggressive", "Hyperactive", "Restless", "Other"]
          )}
        </div>
      </div>

      {/* Section 4: Cognition */}
      <div className="mb-8">
        <h3
          className="text-[13px] font-semibold pb-2 mb-4"
          style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
        >
          Cognition
        </h3>

        <div className="space-y-4">
          <p className="text-[12px] mb-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>
            Rate each impairment area:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Orientation */}
            <div>
              <Label htmlFor="mse-orientation" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Orientation
              </Label>
              <Select value={mseData.orientationRating} onValueChange={(value) => updateMSEField("orientationRating", value)}>
                <SelectTrigger
                  id="mse-orientation"
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
                  <SelectItem value="normal">Normal Finding</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Memory */}
            <div>
              <Label htmlFor="mse-memory" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Memory
              </Label>
              <Select value={mseData.memoryRating} onValueChange={(value) => updateMSEField("memoryRating", value)}>
                <SelectTrigger
                  id="mse-memory"
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
                  <SelectItem value="normal">Normal Finding</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Attention / Concentration */}
            <div>
              <Label htmlFor="mse-attention" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Attention / Concentration
              </Label>
              <Select value={mseData.attentionRating} onValueChange={(value) => updateMSEField("attentionRating", value)}>
                <SelectTrigger
                  id="mse-attention"
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
                  <SelectItem value="normal">Normal Finding</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ability to Abstract */}
            <div>
              <Label htmlFor="mse-abstraction" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Ability to Abstract
              </Label>
              <Select value={mseData.abstractionRating} onValueChange={(value) => updateMSEField("abstractionRating", value)}>
                <SelectTrigger
                  id="mse-abstraction"
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
                  <SelectItem value="normal">Normal Finding</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Intelligence */}
            <div>
              <Label htmlFor="mse-intelligence" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Intelligence
              </Label>
              <Select value={mseData.intelligence} onValueChange={(value) => updateMSEField("intelligence", value)}>
                <SelectTrigger
                  id="mse-intelligence"
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
                  <SelectItem value="borderline">Borderline</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="above-average">Above Average</SelectItem>
                  <SelectItem value="idd">IDD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Insight/Judgment */}
      <div className="mb-8">
        <h3
          className="text-[13px] font-semibold pb-2 mb-4"
          style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
        >
          Insight / Judgment
        </h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="mse-insight-judgment" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Insight and Judgment
            </Label>
            <Select
              value={mseData.insightJudgment}
              onValueChange={(value) => {
                updateMSEField("insightJudgment", value);
                if (value !== "not-appropriate") {
                  updateMSEField("insightJudgmentExplain", "");
                }
              }}
            >
              <SelectTrigger
                id="mse-insight-judgment"
                className="h-9 text-[13px] rounded md:max-w-xs"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
              >
                <SelectValue placeholder="--None--" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appropriate">Appropriate</SelectItem>
                <SelectItem value="not-appropriate">Not Appropriate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mseData.insightJudgment === "not-appropriate" && (
            <div>
              <Label htmlFor="mse-insight-explain" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Explain
              </Label>
              <Textarea
                id="mse-insight-explain"
                className="text-[13px] rounded min-h-[100px]"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
                value={mseData.insightJudgmentExplain}
                onChange={(e) => updateMSEField("insightJudgmentExplain", e.target.value)}
                placeholder="Please explain why insight/judgment is not appropriate..."
              />
            </div>
          )}
        </div>
      </div>

      {/* Section 6: Mental Status Exam Comments */}
      <div className="mb-6">
        <h3
          className="text-[13px] font-semibold pb-2 mb-4"
          style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
        >
          Mental Status Exam Comments
        </h3>

        <Textarea
          id="mse-comments"
          className="text-[13px] rounded min-h-[120px]"
          style={{
            backgroundColor: 'var(--slds-g-color-background-base)',
            border: '1px solid var(--slds-g-color-border-base-1)',
            color: 'var(--slds-g-color-text-default)'
          }}
          value={mseData.mseComments}
          onChange={(e) => updateMSEField("mseComments", e.target.value)}
          placeholder="Enter any additional comments about the mental status exam..."
        />
      </div>

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