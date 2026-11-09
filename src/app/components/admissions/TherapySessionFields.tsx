import React from "react";
import { Button } from "../ui/button";
import { Plus, Pencil, Trash2, Users } from "@/app/lib/lucide-icons";
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
import { Checkbox } from "../ui/checkbox";
import { RichTextEditor } from "../ui/rich-text-editor";
import type {
  ConnectionParticipant,
  ParticipantRating,
} from "./DetailsTabContent";

const moodOptions = [
  "Euthymic",
  "Depressed",
  "Anxious",
  "Angry",
  "Euphoric",
  "Irritable",
];
const affectOptions = [
  "Full",
  "Constricted",
  "Flat",
  "Inappropriate",
  "Labile",
];
const behaviorOptions = [
  "Cooperative",
  "Resistant",
  "Agitated",
  "Impulsive",
  "Over Sedated",
  "Aggressive",
  "Hyperactive",
  "Restless",
  "Other",
];
const youthCopingSkillsOptions = [
  "Deep breathing exercises",
  "Journaling",
  "Physical activity/exercise",
  "Talking to a trusted adult",
  "Listening to music",
  "Taking a break/timeout",
  "Progressive muscle relaxation",
];
const youthTriggersOptions = [
  "Loud noises",
  "Crowded spaces",
  "Academic pressure",
  "Peer conflict",
  "Authority figures",
  "Unstructured time",
  "Transitions between activities",
];
const youthStrengthsOptions = [
  "Creative and artistic",
  "Good problem solver",
  "Empathetic toward others",
  "Strong athletic ability",
  "Leadership qualities",
  "Sense of humor",
  "Resilient and determined",
];

interface TherapySessionFieldsProps {
  connectionFormData: Partial<any>;
  setConnectionFormData: React.Dispatch<
    React.SetStateAction<Partial<any>>
  >;
  connectionDetails: any;
  setConnectionDetails: React.Dispatch<
    React.SetStateAction<any>
  >;
  connectionParticipants: ConnectionParticipant[];
  therapyGoals: {
    id: number;
    goal: string;
    comments: string;
  }[];
  setTherapyGoals: React.Dispatch<
    React.SetStateAction<
      { id: number; goal: string; comments: string }[]
    >
  >;
  handleOpenAddGoalModal: () => void;
  selectedTreatmentTargets: string[];
  setSelectedTreatmentTargets: React.Dispatch<
    React.SetStateAction<string[]>
  >;
  setIsTreatmentTargetsModalOpen: (v: boolean) => void;
  participantRatings: ParticipantRating[];
  setParticipantRatings: React.Dispatch<
    React.SetStateAction<ParticipantRating[]>
  >;
  editingParticipantRating: ParticipantRating | null;
  setEditingParticipantRating: React.Dispatch<
    React.SetStateAction<ParticipantRating | null>
  >;
  setIsParticipantRatingModalOpen: (v: boolean) => void;
  advocateCopingSkills: any[];
  setAdvocateCopingSkills: React.Dispatch<
    React.SetStateAction<any[]>
  >;
  advocateTriggers: any[];
  setAdvocateTriggers: React.Dispatch<
    React.SetStateAction<any[]>
  >;
  advocateStrengths: any[];
  setAdvocateStrengths: React.Dispatch<
    React.SetStateAction<any[]>
  >;
  handleOpenCopingSkillModal: (skill?: any) => void;
  handleDeleteCopingSkill: (id: number) => void;
  handleOpenTriggerModal: (trigger?: any) => void;
  handleDeleteTrigger: (id: number) => void;
  handleOpenStrengthModal: (strength?: any) => void;
  handleDeleteStrength: (id: number) => void;
  getCurrentDate: () => string;
}

export function TherapySessionFields({
  connectionFormData,
  setConnectionFormData,
  connectionDetails,
  setConnectionDetails,
  connectionParticipants,
  therapyGoals,
  setTherapyGoals,
  handleOpenAddGoalModal,
  selectedTreatmentTargets,
  setSelectedTreatmentTargets,
  setIsTreatmentTargetsModalOpen,
  participantRatings,
  setParticipantRatings,
  editingParticipantRating,
  setEditingParticipantRating,
  setIsParticipantRatingModalOpen,
  advocateCopingSkills,
  setAdvocateCopingSkills,
  advocateTriggers,
  setAdvocateTriggers,
  advocateStrengths,
  setAdvocateStrengths,
  handleOpenCopingSkillModal,
  handleDeleteCopingSkill,
  handleOpenTriggerModal,
  handleDeleteTrigger,
  handleOpenStrengthModal,
  handleDeleteStrength,
  getCurrentDate,
}: TherapySessionFieldsProps) {
  const skillOptions = [
    "Needs to Learn",
    "Needs Support",
    "Usually Demonstrates Skill",
    "Independent Skill",
    "N/A",
  ];

  return (
    <div className="space-y-6">
      {/* Goals Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-[13px] text-[#3e3e3c] font-medium">
            Goals
          </Label>
          <button
            onClick={handleOpenAddGoalModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded border transition-colors"
            style={{
              backgroundColor: "white",
              borderColor: "#dddbda",
              color: "#145F33",
            }}
          >
            <Plus className="h-4 w-4" />
            Add Goal
          </button>
        </div>
        <div className="border rounded-lg overflow-hidden border-[#dddbda]">
          <table className="w-full">
            <thead
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <tr>
                <th
                  className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    width: "40%",
                  }}
                >
                  Goal
                </th>
                <th
                  className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Comments
                </th>
                <th
                  className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    width: "80px",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
              }}
            >
              {therapyGoals.map((goal) => (
                <tr key={goal.id}>
                  <td
                    className="px-4 py-3 text-[13px]"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {goal.goal}
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={goal.comments}
                      onChange={(e) =>
                        setTherapyGoals(
                          therapyGoals.map((g) =>
                            g.id === goal.id
                              ? {
                                  ...g,
                                  comments: e.target.value,
                                }
                              : g,
                          ),
                        )
                      }
                      className="h-8 text-[13px] border-[#dddbda]"
                      placeholder="Add comments..."
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to delete this goal?",
                          )
                        ) {
                          setTherapyGoals(
                            therapyGoals.filter(
                              (g) => g.id !== goal.id,
                            ),
                          );
                        }
                      }}
                      className="p-1.5 rounded hover:bg-red-100 transition-colors inline-flex items-center justify-center"
                      title="Delete goal"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-[#706e6b] mt-1">
          Goals are auto-populated from the Youth's profile. Use
          "Add Goal" to add additional goals, and add comments
          inline as needed.
        </p>
      </div>

      {/* Mood, Affect, Behavior — hidden when variant is Family */}
      {connectionFormData.therapySessionVariant !==
        "Family" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label className="text-[13px] text-[#3e3e3c] font-medium">
              Mood
            </Label>
            <Select
              value={connectionFormData.mood || ""}
              onValueChange={(val) =>
                setConnectionFormData({
                  ...connectionFormData,
                  mood: val,
                })
              }
            >
              <SelectTrigger
                className="h-9 text-[13px] border-[#dddbda]"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              >
                <SelectValue placeholder="Select mood" />
              </SelectTrigger>
              <SelectContent>
                {moodOptions.map((opt) => (
                  <SelectItem
                    key={opt}
                    value={opt}
                    className="text-[13px]"
                  >
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label className="text-[13px] text-[#3e3e3c] font-medium">
              Affect
            </Label>
            <Select
              value={connectionFormData.affect || ""}
              onValueChange={(val) =>
                setConnectionFormData({
                  ...connectionFormData,
                  affect: val,
                })
              }
            >
              <SelectTrigger
                className="h-9 text-[13px] border-[#dddbda]"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              >
                <SelectValue placeholder="Select affect" />
              </SelectTrigger>
              <SelectContent>
                {affectOptions.map((opt) => (
                  <SelectItem
                    key={opt}
                    value={opt}
                    className="text-[13px]"
                  >
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label className="text-[13px] text-[#3e3e3c] font-medium">
              Behavior
            </Label>
            <Select
              value={connectionFormData.behavior || ""}
              onValueChange={(val) =>
                setConnectionFormData({
                  ...connectionFormData,
                  behavior: val,
                })
              }
            >
              <SelectTrigger
                className="h-9 text-[13px] border-[#dddbda]"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              >
                <SelectValue placeholder="Select behavior" />
              </SelectTrigger>
              <SelectContent>
                {behaviorOptions.map((opt) => (
                  <SelectItem
                    key={opt}
                    value={opt}
                    className="text-[13px]"
                  >
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Themes Addressed — hidden when variant is Individual */}
      {connectionFormData.therapySessionVariant !==
        "Individual" && (
        <div className="grid gap-2">
          <Label className="text-[13px] text-[#3e3e3c] font-medium">
            Themes Addressed
          </Label>
          <Textarea
            value={connectionFormData.themesAddressed || ""}
            onChange={(e) =>
              setConnectionFormData({
                ...connectionFormData,
                themesAddressed: e.target.value,
              })
            }
            placeholder="Document key themes addressed during the session..."
            className="min-h-[100px] text-[13px] border-[#dddbda] resize-none"
            style={{
              fontFamily: "inherit",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
          />
        </div>
      )}

      {/* Description */}
      <div className="grid gap-2">
        <Label
          className="slds-form-label"
          style={{ color: "var(--slds-g-color-text-weak)" }}
        >
          Description
        </Label>
        <RichTextEditor
          value={connectionFormData.description || ""}
          onChange={(val) =>
            setConnectionFormData({
              ...connectionFormData,
              description: val,
            })
          }
          placeholder="Document therapy session details..."
          minHeight="150px"
        />
      </div>
      {/* Plan — hidden when variant is Family */}
      {connectionFormData.therapySessionVariant !== "Group" && (
        <>
          {/* Skill Assessment */}
          <div className="space-y-4">
            <Label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Skill Assessment
            </Label>

            {[
              {
                label:
                  "Youth can identify and express emotions.",
                name: "skill-identify-express-emotions",
                field: "identifyExpressEmotions",
              },
              {
                label:
                  "Youth can regulate strong emotions in the moment.",
                name: "skill-regulate-emotions",
                field: "regulateStrongEmotions",
              },
              {
                label:
                  "Youth demonstrates healthy boundaries with others.",
                name: "skill-healthy-boundaries",
                field: "healthyBoundaries",
              },
              {
                label:
                  "Youth can effectively reflect on challenging situations.",
                name: "skill-reflect-situations",
                field: "reflectChallengingSituations",
              },
              {
                label: "Youth demonstrates self-acceptance.",
                name: "skill-self-acceptance",
                field: "selfAcceptance",
              },
              {
                label: "Youth is hopeful about their future.",
                name: "skill-hopeful-future",
                field: "hopefulAboutFuture",
              },
            ].map(({ label, name, field }) => (
              <div key={field} className="space-y-2">
                <Label
                  className="slds-text-4"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {label}
                </Label>
                <div className="flex flex-wrap gap-4">
                  {skillOptions.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={name}
                        value={opt}
                        checked={
                          connectionFormData.skillAssessment?.[
                            field
                          ] === opt
                        }
                        onChange={(e) =>
                          setConnectionFormData({
                            ...connectionFormData,
                            skillAssessment: {
                              ...connectionFormData.skillAssessment,
                              [field]: e.target.value,
                            },
                          })
                        }
                        className="h-4 w-4"
                        style={{ accentColor: "#145F33" }}
                      />
                      <span
                        className="slds-text-4"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {/* Plan — hidden when variant is Family */}
      {connectionFormData.therapySessionVariant !==
        "Family" && (
        <div className="grid gap-2">
          <Label
            className="slds-form-label"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            Plan
          </Label>
          <RichTextEditor
            value={connectionFormData.plan || ""}
            onChange={(val) =>
              setConnectionFormData({
                ...connectionFormData,
                plan: val,
              })
            }
            placeholder="Document next steps and therapeutic plan..."
            minHeight="120px"
          />
        </div>
      )}

      {/* Individual variant — extra fields */}
      {connectionFormData.therapySessionVariant ===
        "Individual" && (
        <>
          {/* Data */}
          <div className="space-y-1.5">
            <Label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Data
            </Label>
            <Textarea
              value={connectionFormData.description || ""}
              onChange={(e) =>
                setConnectionFormData({
                  ...connectionFormData,
                  description: e.target.value,
                })
              }
              placeholder="Enter session data and description…"
              className="slds-text-4 min-h-[150px] resize-y"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
              }}
            />
          </div>

          {/* Assessment (Clinical Interpretation) */}
          <div className="space-y-1.5">
            <Label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Assessment (Clinical Interpretation)
            </Label>
            <Textarea
              value={
                (connectionDetails as any).therapyAssessment ||
                ""
              }
              onChange={(e) =>
                setConnectionDetails({
                  ...connectionDetails,
                  therapyAssessment: e.target.value,
                } as any)
              }
              placeholder="Enter clinical assessment…"
              className="slds-text-4 min-h-[150px] resize-y"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
              }}
            />
          </div>

          {/* Plan */}
          <div className="space-y-1.5">
            <Label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Plan
            </Label>
            <Textarea
              value={connectionFormData.plan || ""}
              onChange={(e) =>
                setConnectionFormData({
                  ...connectionFormData,
                  plan: e.target.value,
                })
              }
              placeholder="Enter treatment plan and next steps…"
              className="slds-text-4 min-h-[150px] resize-y"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
              }}
            />
          </div>

          {/* Goals Discussed */}
          <div className="space-y-1.5">
            <Label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Goals Discussed
            </Label>
            <Textarea
              value={
                (connectionDetails as any)
                  .therapyGoalsDiscussed || ""
              }
              onChange={(e) =>
                setConnectionDetails({
                  ...connectionDetails,
                  therapyGoalsDiscussed: e.target.value,
                } as any)
              }
              placeholder="Describe the goals discussed during this session…"
              className="slds-text-4 min-h-[150px] resize-y"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
              }}
            />
          </div>

          {/* Coping Skills */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Coping Skills
              </Label>
              <Button
                onClick={() => handleOpenCopingSkillModal()}
                className="rounded-full h-8 px-3 text-[12px] font-medium bg-[#145F33] hover:bg-[#0e4524] text-white shadow-none"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
            <div
              className="rounded-lg overflow-hidden"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              {youthCopingSkillsOptions.map((option, index) => {
                const existing = advocateCopingSkills.find(
                  (s) => s.skill === option,
                );
                const isSelected = !!existing;
                return (
                  <label
                    key={option}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                    style={{
                      borderBottom:
                        index <
                        youthCopingSkillsOptions.length - 1
                          ? "1px solid var(--slds-g-color-border-base-1)"
                          : "none",
                      backgroundColor: isSelected
                        ? "rgba(20, 95, 51, 0.05)"
                        : "var(--slds-g-color-background-base)",
                    }}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAdvocateCopingSkills((prev) => [
                            ...prev,
                            {
                              id: Date.now(),
                              skill: option,
                              dateReported: getCurrentDate(),
                              reportedBy: "Sohan Jadhavrao",
                              relationshipToYouth: "Therapist",
                              description: "",
                              effectiveWhen: "",
                            },
                          ]);
                        } else {
                          setAdvocateCopingSkills((prev) =>
                            prev.filter(
                              (s) => s.skill !== option,
                            ),
                          );
                        }
                      }}
                    />
                    <span
                      className="slds-text-4 flex-1"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {option}
                    </span>
                    {isSelected && (
                      <div className="flex items-center gap-2">
                        <span
                          className="slds-text-3"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {existing?.dateReported}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleOpenCopingSkillModal(
                              existing,
                            );
                          }}
                          className="p-1 rounded hover:bg-gray-100 transition-colors"
                          title="Edit details"
                        >
                          <Pencil className="h-3.5 w-3.5 text-[#0176d3]" />
                        </button>
                      </div>
                    )}
                  </label>
                );
              })}
              {advocateCopingSkills
                .filter(
                  (s) =>
                    !youthCopingSkillsOptions.includes(s.skill),
                )
                .map((existing) => (
                  <div
                    key={`custom-coping-ind-${existing.id}`}
                    className="flex items-center gap-3 px-4 py-2.5"
                    style={{
                      borderTop:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor: "rgba(20, 95, 51, 0.05)",
                    }}
                  >
                    <Checkbox
                      checked={true}
                      onCheckedChange={() =>
                        handleDeleteCopingSkill(existing.id)
                      }
                    />
                    <span
                      className="slds-text-4 flex-1"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {existing.skill}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="slds-text-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {existing.dateReported}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenCopingSkillModal(existing)
                        }
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                        title="Edit details"
                      >
                        <Pencil className="h-3.5 w-3.5 text-[#0176d3]" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Triggers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Triggers
              </Label>
              <Button
                onClick={() => handleOpenTriggerModal()}
                className="rounded-full h-8 px-3 text-[12px] font-medium bg-[#145F33] hover:bg-[#0e4524] text-white shadow-none"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add
              </Button>
            </div>
            <div
              className="rounded-lg overflow-hidden"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              {youthTriggersOptions.map((option, index) => {
                const existing = advocateTriggers.find(
                  (t) => t.trigger === option,
                );
                const isSelected = !!existing;
                return (
                  <label
                    key={option}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                    style={{
                      borderBottom:
                        index < youthTriggersOptions.length - 1
                          ? "1px solid var(--slds-g-color-border-base-1)"
                          : "none",
                      backgroundColor: isSelected
                        ? "rgba(20, 95, 51, 0.05)"
                        : "var(--slds-g-color-background-base)",
                    }}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAdvocateTriggers((prev) => [
                            ...prev,
                            {
                              id: Date.now(),
                              trigger: option,
                              dateReported: getCurrentDate(),
                              reportedBy: "Sohan Jadhavrao",
                              relationshipToYouth: "Therapist",
                              description: "",
                            },
                          ]);
                        } else {
                          setAdvocateTriggers((prev) =>
                            prev.filter(
                              (t) => t.trigger !== option,
                            ),
                          );
                        }
                      }}
                    />
                    <span
                      className="slds-text-4 flex-1"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {option}
                    </span>
                    {isSelected && (
                      <div className="flex items-center gap-2">
                        <span
                          className="slds-text-3"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {existing?.dateReported}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleOpenTriggerModal(existing);
                          }}
                          className="p-1 rounded hover:bg-gray-100 transition-colors"
                          title="Edit details"
                        >
                          <Pencil className="h-3.5 w-3.5 text-[#0176d3]" />
                        </button>
                      </div>
                    )}
                  </label>
                );
              })}
              {advocateTriggers
                .filter(
                  (t) =>
                    !youthTriggersOptions.includes(t.trigger),
                )
                .map((existing) => (
                  <div
                    key={`custom-trigger-ind-${existing.id}`}
                    className="flex items-center gap-3 px-4 py-2.5"
                    style={{
                      borderTop:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor: "rgba(20, 95, 51, 0.05)",
                    }}
                  >
                    <Checkbox
                      checked={true}
                      onCheckedChange={() =>
                        handleDeleteTrigger(existing.id)
                      }
                    />
                    <span
                      className="slds-text-4 flex-1"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {existing.trigger}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="slds-text-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {existing.dateReported}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenTriggerModal(existing)
                        }
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                        title="Edit details"
                      >
                        <Pencil className="h-3.5 w-3.5 text-[#0176d3]" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Strengths */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                className="slds-form-label"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Strengths
              </Label>
              <Button
                onClick={() => handleOpenStrengthModal()}
                className="rounded-full h-8 px-3 text-[12px] font-medium bg-[#145F33] hover:bg-[#0e4524] text-white shadow-none"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add
              </Button>
            </div>
            <div
              className="rounded-lg overflow-hidden"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              {youthStrengthsOptions.map((option, index) => {
                const existing = advocateStrengths.find(
                  (s) => s.strength === option,
                );
                const isSelected = !!existing;
                return (
                  <label
                    key={option}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                    style={{
                      borderBottom:
                        index < youthStrengthsOptions.length - 1
                          ? "1px solid var(--slds-g-color-border-base-1)"
                          : "none",
                      backgroundColor: isSelected
                        ? "rgba(20, 95, 51, 0.05)"
                        : "var(--slds-g-color-background-base)",
                    }}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAdvocateStrengths((prev) => [
                            ...prev,
                            {
                              id: Date.now(),
                              strength: option,
                              dateReported: getCurrentDate(),
                              reportedBy: "Sohan Jadhavrao",
                              relationshipToYouth: "Therapist",
                              description: "",
                            },
                          ]);
                        } else {
                          setAdvocateStrengths((prev) =>
                            prev.filter(
                              (s) => s.strength !== option,
                            ),
                          );
                        }
                      }}
                    />
                    <span
                      className="slds-text-4 flex-1"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {option}
                    </span>
                    {isSelected && (
                      <div className="flex items-center gap-2">
                        <span
                          className="slds-text-3"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {existing?.dateReported}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleOpenStrengthModal(existing);
                          }}
                          className="p-1 rounded hover:bg-gray-100 transition-colors"
                          title="Edit details"
                        >
                          <Pencil className="h-3.5 w-3.5 text-[#0176d3]" />
                        </button>
                      </div>
                    )}
                  </label>
                );
              })}
              {advocateStrengths
                .filter(
                  (s) =>
                    !youthStrengthsOptions.includes(s.strength),
                )
                .map((existing) => (
                  <div
                    key={`custom-strength-ind-${existing.id}`}
                    className="flex items-center gap-3 px-4 py-2.5"
                    style={{
                      borderTop:
                        "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor: "rgba(20, 95, 51, 0.05)",
                    }}
                  >
                    <Checkbox
                      checked={true}
                      onCheckedChange={() =>
                        handleDeleteStrength(existing.id)
                      }
                    />
                    <span
                      className="slds-text-4 flex-1"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {existing.strength}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="slds-text-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {existing.dateReported}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenStrengthModal(existing)
                        }
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                        title="Edit details"
                      >
                        <Pencil className="h-3.5 w-3.5 text-[#0176d3]" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Skill Assessment */}
          <div className="space-y-4">
            <Label
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Skill Assessment
            </Label>

            {[
              {
                label:
                  "Youth can identify and express emotions.",
                name: "skill-identify-express-emotions",
                field: "identifyExpressEmotions",
              },
              {
                label:
                  "Youth can regulate strong emotions in the moment.",
                name: "skill-regulate-emotions",
                field: "regulateStrongEmotions",
              },
              {
                label:
                  "Youth demonstrates healthy boundaries with others.",
                name: "skill-healthy-boundaries",
                field: "healthyBoundaries",
              },
              {
                label:
                  "Youth can effectively reflect on challenging situations.",
                name: "skill-reflect-situations",
                field: "reflectChallengingSituations",
              },
              {
                label: "Youth demonstrates self-acceptance.",
                name: "skill-self-acceptance",
                field: "selfAcceptance",
              },
              {
                label: "Youth is hopeful about their future.",
                name: "skill-hopeful-future",
                field: "hopefulAboutFuture",
              },
            ].map(({ label, name, field }) => (
              <div key={field} className="space-y-2">
                <Label
                  className="slds-text-4"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {label}
                </Label>
                <div className="flex flex-wrap gap-4">
                  {skillOptions.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={name}
                        value={opt}
                        checked={
                          connectionFormData.skillAssessment?.[
                            field
                          ] === opt
                        }
                        onChange={(e) =>
                          setConnectionFormData({
                            ...connectionFormData,
                            skillAssessment: {
                              ...connectionFormData.skillAssessment,
                              [field]: e.target.value,
                            },
                          })
                        }
                        className="h-4 w-4"
                        style={{ accentColor: "#145F33" }}
                      />
                      <span
                        className="slds-text-4"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Treatment Targets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-[13px] text-[#3e3e3c] font-medium">
            Treatment Targets
          </Label>
          <button
            onClick={() => {
              setSelectedTreatmentTargets(
                connectionFormData.treatmentTargets || [],
              );
              setIsTreatmentTargetsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded border transition-colors"
            style={{
              backgroundColor: "white",
              borderColor: "#dddbda",
              color: "#145F33",
            }}
          >
            <Plus className="h-4 w-4" />
            {(connectionFormData.treatmentTargets?.length ||
              0) > 0
              ? "Modify"
              : "Add"}{" "}
            Treatment Targets
          </button>
        </div>
        {(connectionFormData.treatmentTargets?.length || 0) >
        0 ? (
          <div className="border rounded-lg overflow-hidden border-[#dddbda]">
            <table className="w-full">
              <thead
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <tr>
                  <th
                    className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Treatment Target
                  </th>
                  <th
                    className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      width: "80px",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-1)",
                }}
              >
                {connectionFormData.treatmentTargets?.map(
                  (target, index) => (
                    <tr key={index}>
                      <td
                        className="px-4 py-3 text-[13px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {target}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            const updatedTargets =
                              connectionFormData.treatmentTargets?.filter(
                                (_, i) => i !== index,
                              ) || [];
                            setConnectionFormData({
                              ...connectionFormData,
                              treatmentTargets: updatedTargets,
                            });
                          }}
                          className="p-1.5 rounded hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center"
            style={{ borderColor: "#dddbda" }}
          >
            <p className="text-[13px] text-[#706e6b]">
              No treatment targets selected. Click "Add
              Treatment Targets" to begin.
            </p>
          </div>
        )}
      </div>

      {/* Participant Ratings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-[13px] text-[#3e3e3c] font-medium">
            Participant Ratings
          </Label>
          <button
            onClick={() => {
              const attendedYouth =
                connectionParticipants.filter(
                  (p) =>
                    p.attended === true && p.role === "Youth",
                );
              const newRatings = attendedYouth.map((p) => {
                const existing = participantRatings.find(
                  (r) => r.participantId === p.id,
                );
                return (
                  existing || {
                    participantId: p.id,
                    participantName: p.participant,
                    participantRole: p.role,
                    participantLocation: "In-Person",
                    relationshipRating: "",
                    goalsTopicsRating: "",
                    approachMethodRating: "",
                    overallRating: "",
                    therapistEngagementRating: "",
                  }
                );
              });
              setParticipantRatings(newRatings);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded border transition-colors"
            style={{
              backgroundColor: "white",
              borderColor: "#dddbda",
              color: "#145F33",
            }}
          >
            <Users className="h-4 w-4" />
            Refresh Ratings
          </button>
        </div>
        {participantRatings.length > 0 ? (
          <div className="border rounded-lg overflow-x-auto border-[#dddbda]">
            <table className="w-full">
              <thead
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <tr>
                  <th
                    className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Name
                  </th>
                  <th
                    className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Role
                  </th>
                  <th
                    className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Location
                  </th>
                  <th
                    className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Relationship
                  </th>
                  <th
                    className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Goals/Topics
                  </th>
                  <th
                    className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Approach
                  </th>
                  <th
                    className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Overall
                  </th>
                  <th
                    className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Engagement
                  </th>
                  <th
                    className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      width: "80px",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-1)",
                }}
              >
                {participantRatings.map((rating) => (
                  <tr key={rating.participantId}>
                    <td
                      className="px-4 py-3 text-[13px] whitespace-nowrap"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {rating.participantName}
                    </td>
                    <td
                      className="px-4 py-3 text-[13px] whitespace-nowrap"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {rating.participantRole}
                    </td>
                    <td
                      className="px-4 py-3 text-[13px] whitespace-nowrap"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {rating.participantLocation}
                    </td>
                    <td
                      className="px-4 py-3 text-[13px] text-center whitespace-nowrap"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {rating.relationshipRating || "—"}
                    </td>
                    <td
                      className="px-4 py-3 text-[13px] text-center whitespace-nowrap"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {rating.goalsTopicsRating || "—"}
                    </td>
                    <td
                      className="px-4 py-3 text-[13px] text-center whitespace-nowrap"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {rating.approachMethodRating || "—"}
                    </td>
                    <td
                      className="px-4 py-3 text-[13px] text-center whitespace-nowrap"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {rating.overallRating || "—"}
                    </td>
                    <td
                      className="px-4 py-3 text-[13px] text-center whitespace-nowrap"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {rating.therapistEngagementRating || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setEditingParticipantRating(rating);
                          setIsParticipantRatingModalOpen(true);
                        }}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                        title="Modify Ratings"
                      >
                        <Pencil className="h-4 w-4 text-[#0176d3]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center"
            style={{ borderColor: "#dddbda" }}
          >
            <p className="text-[13px] text-[#706e6b]">
              No participant ratings yet. Click "Refresh
              Ratings" to populate with attended youth
              participants.
            </p>
          </div>
        )}
        <p className="text-[11px] text-[#706e6b] mt-1">
          Participant ratings are auto-populated from youth
          participants marked as attended.
        </p>
      </div>
    </div>
  );
}