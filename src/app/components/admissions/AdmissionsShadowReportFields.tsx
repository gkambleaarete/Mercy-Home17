import React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { MultiSelect } from "../ui/multi-select";

// Admissions Shadow — Shadow Report (US 17657). Values live on the
// Connection record (connectionFormData), so they save and reopen with it.

const STRUCTURE_OPTIONS = [
  "Dinner",
  "Study",
  "Free Time",
  "Group/Meeting",
  "Chore Time",
  "Other",
] as const;
const PARTICIPATION_LEVEL_OPTIONS = [
  "High",
  "Moderate",
  "Low",
  "None",
];
const MOOD_OPTIONS = [
  "Anxious",
  "Calm",
  "Depressed",
  "Irritable",
  "Lethargic",
  "Manic",
  "Playful",
  "Upbeat",
] as const;
const INTERACTION_STYLE_OPTIONS = [
  "Aggressive",
  "Agreeable",
  "Cooperative",
  "Engaging",
  "Impulsive",
  "Impressionable",
  "Intrusive",
  "Open",
  "Oppositional",
  "Passive",
  "Shy",
  "Withdrawn",
] as const;
const OVERALL_EVALUATION_OPTIONS = [
  "No significant concerns",
  "Significant concerns or questions regarding the appropriateness of placement",
];

const labelClass = "slds-form-label";
const labelStyle = { color: "var(--slds-g-color-text-weak)" };
const textareaClass = "slds-text-4 min-h-[100px] resize-y";
const borderStyle = {
  borderColor: "var(--slds-g-color-border-base-1)",
};

interface AdmissionsShadowReportFieldsProps {
  connectionFormData: Partial<any>;
  setConnectionFormData: React.Dispatch<
    React.SetStateAction<Partial<any>>
  >;
}

export function AdmissionsShadowReportFields({
  connectionFormData,
  setConnectionFormData,
}: AdmissionsShadowReportFieldsProps) {
  const set = (field: string, value: unknown) =>
    setConnectionFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

  const textArea = (
    id: string,
    field: string,
    label: string,
  ) => (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className={labelClass}
        style={labelStyle}
      >
        {label}
      </Label>
      <Textarea
        id={id}
        value={connectionFormData[field] || ""}
        onChange={(e) => set(field, e.target.value)}
        className={textareaClass}
        style={borderStyle}
      />
    </div>
  );

  const multiSelect = (
    id: string,
    field: string,
    label: string,
    options: readonly string[],
  ) => (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className={labelClass}
        style={labelStyle}
      >
        {label}
      </Label>
      <MultiSelect
        id={id}
        value={connectionFormData[field] || []}
        onValueChange={(v) => set(field, v)}
        options={options}
      />
    </div>
  );

  // Structure multi-select with its "Other" text field, shown only while
  // Other is selected. The typed text is kept if Other is toggled off/on.
  const structureSelect = (
    id: string,
    field: string,
    otherField: string,
    label: string,
    otherLabel: string,
  ) => (
    <>
      {multiSelect(id, field, label, STRUCTURE_OPTIONS)}
      {(connectionFormData[field] || []).includes("Other") && (
        <div className="space-y-1.5">
          <Label
            htmlFor={`${id}-other`}
            className={labelClass}
            style={labelStyle}
          >
            {otherLabel}
          </Label>
          <Input
            id={`${id}-other`}
            value={connectionFormData[otherField] || ""}
            onChange={(e) => set(otherField, e.target.value)}
            className="h-9 slds-text-4"
            style={borderStyle}
          />
        </div>
      )}
    </>
  );

  const singleSelect = (
    id: string,
    field: string,
    label: string,
    options: string[],
  ) => (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className={labelClass}
        style={labelStyle}
      >
        {label}
      </Label>
      <Select
        value={connectionFormData[field] || ""}
        onValueChange={(v) => set(field, v)}
      >
        <SelectTrigger
          id={id}
          className="h-9 slds-text-4"
          style={borderStyle}
        >
          <SelectValue placeholder="Please Select" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-5">
      {textArea(
        "shadow-strength",
        "shadowMostSignificantStrength",
        "Most significant strength",
      )}
      {textArea(
        "shadow-peer-interactions",
        "shadowPeerInteractions",
        "Interactions with peers",
      )}
      {textArea(
        "shadow-staff-interactions",
        "shadowStaffInteractions",
        "Interactions with staff",
      )}
      {textArea(
        "shadow-behavior-concerns",
        "shadowBehaviorConcerns",
        "Behavior concerns noticed and interventions implemented",
      )}
      {structureSelect(
        "shadow-excelled",
        "shadowExcelledStructures",
        "shadowExcelledOther",
        "Part(s) of structure in which youth excelled",
        "Other structure where youth excelled",
      )}
      {structureSelect(
        "shadow-struggled",
        "shadowStruggledStructures",
        "shadowStruggledOther",
        "Part(s) of structure in which youth struggled",
        "Other structure where youth struggled",
      )}
      {singleSelect(
        "shadow-participation",
        "shadowParticipationLevel",
        "Level of Participation",
        PARTICIPATION_LEVEL_OPTIONS,
      )}
      {multiSelect(
        "shadow-mood",
        "shadowMood",
        "Mood",
        MOOD_OPTIONS,
      )}
      {multiSelect(
        "shadow-interaction-style",
        "shadowInteractionStyle",
        "Interaction Style",
        INTERACTION_STYLE_OPTIONS,
      )}
      {textArea(
        "shadow-additional-comments",
        "shadowAdditionalComments",
        "Additional Comments, Questions, or Concerns",
      )}
      {singleSelect(
        "shadow-overall-evaluation",
        "shadowOverallEvaluation",
        "Overall Evaluation and Next Steps",
        OVERALL_EVALUATION_OPTIONS,
      )}
    </div>
  );
}