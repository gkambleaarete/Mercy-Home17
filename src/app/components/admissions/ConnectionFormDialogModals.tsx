import React from "react";
import { Button } from "../ui/button";
import {
  AlertCircle,
  Check,
  Plus,
  Trash2,
  Users,
  X as XIcon,
} from "@/app/lib/lucide-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
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
import { CopingSkillModal } from "./CopingSkillModal";
import { TriggerModal } from "./TriggerModal";
import { StrengthModal } from "./StrengthModal";

const programSupportedConnectionTypes = [
  "Class Session",
  "Employee Site Visit",
  "Family Event",
  "Group Therapy Session - Contract",
  "Group Therapy Session - External",
  "Group Therapy Session - Program",
  "Justice, Diversity, and Inclusion Event",
  "Mercy Home Activity",
  "Milieu meeting",
  "Spiritual Connection",
  "Therapy Session",
];
const participantLocationOptions = ["In-Person", "Virtual"];
const ratingScaleOptions = [
  "Excellent",
  "Good",
  "Fair",
  "Poor",
  "Very Poor",
];
const engagementOptions = [
  "1 – Very Disengaged",
  "2 – Somewhat Disengaged",
  "3 – Somewhat Engaged",
  "4 – Very Engaged",
];
const treatmentTargetOptions = [
  "Caregiver System Engagement",
  "Assessment & Psychoeducation",
  "Routines, Rituals, & Care Vision",
  "Calm (Caregiver Affect Management)",
  "Connect (Caregiver Attunement)",
  "Effective Caregiving Response",
  "Reflection (Affect Identification)",
  "Modulation",
  "Self-Discipline & Problem Solving (Executive Functions)",
  "Identity & Purpose",
  "Relational Engagement & Self Expression",
  "Resilience (Trauma Experience Integration)",
  "Resilience (Skill Coaching)",
];
const reasonMissedOptions = [
  "Youth Not Intended to Attend",
  "Program Conflict - Excused",
  "Sick - Excused",
  "On Pass - Excused",
  "Hospitalized - Excused",
  "Youth Schedule Conflict - Excused",
  "Suspended From Program - Excused",
  "Youth Refusal - Unexcused",
  "No Show - Unexcused",
  "AWOL - Unexcused",
  "Youth Asked To Leave - Unexcused",
  "Other",
  "Family Event - Youth Don't Attend",
  "Staff Not Intended to Attend",
  "Did not reply",
  "Rescheduled",
  "Supervisor reviewed note",
  "Cancelled but not Rescheduled (Admissions)",
  "Dropped Class/Final Class",
  "Youth Needs to Complete Homework",
  "Excused Program Staff Recommendation-Excused",
  "Youth Not Home From School-Excused",
  "Excused - In School",
  "Excused - Work",
];
const programOptions = [
  "Boys Town",
  "CILA",
  "Connections",
  "Day School",
  "Emergency",
  "Family Services",
  "Foster Care",
  "IndependFent Living",
  "Residential",
  "Transitional Living",
];
const programYouthAssociations: Record<string, string[]> = {
  "Boys Town": ["J. Smith", "M. Johnson"],
  CILA: ["A. Williams", "R. Davis"],
  Connections: ["T. Brown", "K. Lee"],
  "Day School": ["P. Garcia", "S. Martinez", "Aarete Test"],
  Emergency: ["J. Smith"],
  "Family Services": ["M. Johnson", "A. Williams"],
  "Foster Care": ["R. Davis", "T. Brown"],
  "Independent Living": ["K. Lee", "P. Garcia"],
  Residential: ["S. Martinez", "Aarete Test", "J. Smith"],
  "Transitional Living": [
    "M. Johnson",
    "A. Williams",
    "R. Davis",
  ],
};
const nonConstituentRoleOptions = [
  "Coordinator",
  "Director",
  "Manager",
  "Tutor",
  "Advisor",
  "Other Role",
  "Instructor",
  "MHBG Staff",
  "Youth",
  "Volunteer",
  "School Staff",
  "Contractor",
  "PSO Staff",
  "Case Manager",
  "Masters Level Administrative Staff",
  "Mental Health Professional",
  "Physical Health Professional",
  "Community Care Staff",
  "External Constituent",
  "Clinician",
  "Residential Program Authorization Agent",
  "Community Care Member",
  "Ridgeland Tenant",
  "Drivers Education instructor",
  "Community Care Scholar",
  "Friends First Mentee",
  "Friends First Mentor",
  "Friends First MSR",
  "Friends First Coordinator",
  "Nurse",
  "Community Care Employment",
  "Med Leader",
  "Community Care Housing",
  "Community Care Therapy",
  "Community Care-Care Management",
  "Medical Professional",
  "Assigned Shadow Reporter",
];
const constituentRoleOptions = [
  "Youth",
  "Parent/Guardian",
  "Sibling",
  "Family Member",
  "MHBG Staff",
  "Organizer",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ConnectionFormDialogModals(
  props: Record<string, any>,
) {
  const {
    advocateGoalComments,
    advocateGoalModalMode,
    advocateGoals,
    availableYouthGoals,
    connectionDetails,
    connectionFormData,
    dynamicYouthGoals,
    editedOtherReasonText,
    editingAdvocateGoal,
    editingCopingSkill,
    editingParticipantRating,
    editingStrength,
    editingTrigger,
    handleAddParticipantInModal,
    handleAddSelectedGoals,
    handleApplyManageParticipants,
    handleBulkRemoveParticipantsInModal,
    handleBulkSetAttendedInModal,
    handleBulkSetNotAttendedInModal,
    handleCancelManageParticipants,
    handleCancelOtherReason,
    handleCancelProgramSelection,
    handleConfirmProgramSelection,
    handleOpenAddProgramModal,
    handleRemoveParticipantInModal,
    handleSaveAdvocateGoal,
    handleSaveCopingSkill,
    handleSaveNewIntermediateGoal,
    handleSaveNewMajorGoal,
    handleSaveNewTherapyIntermediateGoal,
    handleSaveNewTherapyMajorGoal,
    handleSaveOtherReason,
    handleSaveStrength,
    handleSaveTrigger,
    handleSetOrganizerInModal,
    handleSubmitOtherReason,
    handleToggleAllModalParticipants,
    handleToggleGoalSelection,
    handleToggleProgramSelection,
    handleUpdateParticipantInModal,
    isAddAdvocateGoalModalOpen,
    isAddCopingSkillModalOpen,
    isAddGoalModalOpen,
    isAddProgramModalOpen,
    isAddStrengthModalOpen,
    isAddTriggerModalOpen,
    isManageParticipantsModalOpen,
    isOtherReasonDialogOpen,
    isParticipantRatingModalOpen,
    isTreatmentTargetsModalOpen,
    newGoalName,
    participantRatings,
    saveConnectionData,
    selectedAdvocateGoal,
    selectedGoalsToAdd,
    selectedMajorForIntermediate,
    selectedModalParticipantIds,
    selectedTreatmentTargets,
    setAdvocateGoalComments,
    setAdvocateGoalModalMode,
    setConnectionDetails,
    setConnectionFormData,
    setEditedOtherReasonText,
    setEditingAdvocateGoal,
    setEditingCopingSkill,
    setEditingOtherReasonContext,
    setEditingOtherReasonParticipantId,
    setEditingParticipantRating,
    setEditingStrength,
    setEditingTrigger,
    setIsAddAdvocateGoalModalOpen,
    setIsAddCopingSkillModalOpen,
    setIsAddGoalModalOpen,
    setIsAddProgramModalOpen,
    setIsAddStrengthModalOpen,
    setIsAddTriggerModalOpen,
    setIsManageParticipantsModalOpen,
    setIsParticipantRatingModalOpen,
    setIsTreatmentTargetsModalOpen,
    setNewGoalName,
    setParticipantRatings,
    setSelectedAdvocateGoal,
    setSelectedGoalsToAdd,
    setSelectedMajorForIntermediate,
    setSelectedModalParticipantIds,
    setSelectedTreatmentTargets,
    setShowAttendanceWarning,
    setTempOtherReason,
    setTherapyGoalModalMode,
    setTherapyNewGoalName,
    setTherapySelectedMajorForIntermediate,
    setViewingOtherReason,
    showAttendanceWarning,
    tempOtherReason,
    tempParticipants,
    tempSelectedPrograms,
    therapyGoalModalMode,
    therapyNewGoalName,
    therapySelectedMajorForIntermediate,
    viewingOtherReason,
  } = props;

  return (
    <>
      {/* Other Reason Entry Dialog */}
      <Dialog
        open={isOtherReasonDialogOpen}
        onOpenChange={(open) =>
          !open && handleCancelOtherReason()
        }
      >
        <DialogContent
          className="sm:max-w-md rounded-[8px] bg-white border border-[#dddbda]"
          aria-describedby={undefined}
        >
          <DialogHeader className="border-b border-[#dddbda] pb-4">
            <DialogTitle className="text-[16px] font-bold text-[#080707]">
              Other Reason
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#706e6b] mt-2">
              Please enter the reason details below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={tempOtherReason}
              onChange={(e) =>
                setTempOtherReason(e.target.value)
              }
              className="min-h-[120px] text-[13px] border-[#dddbda]"
              placeholder="Enter reason details..."
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelOtherReason}
              className="rounded-full text-[13px] h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitOtherReason}
              disabled={!tempOtherReason.trim()}
              className="rounded-full text-[13px] text-white h-9 px-4"
              style={{ backgroundColor: "#145F33" }}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Other Reason Dialog */}
      <Dialog
        open={viewingOtherReason !== null}
        onOpenChange={(open) =>
          !open && setViewingOtherReason(null)
        }
      >
        <DialogContent
          className="sm:max-w-lg rounded-[8px] bg-white border border-[#dddbda] p-0"
          aria-describedby={undefined}
        >
          <DialogHeader className="border-b border-[#dddbda] pb-4 px-6 pt-6 mb-0">
            <DialogTitle className="text-[16px] font-bold text-[#080707]">
              Edit Other Reason Details
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#706e6b] mt-2">
              Edit the custom reason details below and click
              Save to update.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4">
            <Textarea
              value={editedOtherReasonText}
              onChange={(e) =>
                setEditedOtherReasonText(e.target.value)
              }
              className="min-h-[120px] text-[13px] text-[#3e3e3c] border-[#dddbda] focus:border-[#145F33] focus:ring-[#145F33]"
              placeholder="Enter other reason details..."
            />
          </div>
          <DialogFooter className="px-6 pb-6 pt-2 flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setViewingOtherReason(null);
                setEditingOtherReasonParticipantId(null);
                setEditingOtherReasonContext(null);
                setEditedOtherReasonText("");
              }}
              className="rounded-full h-9 px-5 text-[13px] font-medium border-[#dddbda] bg-white hover:bg-[#f3f2f2] text-[#3e3e3c] shadow-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveOtherReason}
              className="rounded-full text-[13px] text-white h-9 px-4"
              style={{ backgroundColor: "#145F33" }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attendance Warning Popup */}
      <Dialog
        open={showAttendanceWarning}
        onOpenChange={setShowAttendanceWarning}
      >
        <DialogContent
          className="sm:max-w-[500px] rounded-[8px] bg-white border border-[#dddbda]"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold text-[#080707]">
              Confirm Participant Attendance
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#706e6b] mt-2">
              Attendance is blank for all participants on this
              connection. Please go back and enter attendance
              unless you will be entering it at a future time.
              Would you like to continue with attendance blank?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowAttendanceWarning(false)}
              className="rounded-full h-9 px-5 text-[13px] border-[#dddbda]"
            >
              No
            </Button>
            <Button
              onClick={() => {
                setShowAttendanceWarning(false);
                saveConnectionData();
              }}
              className="rounded-full h-9 px-5 text-[13px] text-white"
              style={{ backgroundColor: "#145F33" }}
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AC32-AC34: Treatment Targets Selection Modal (for Parent / Family Contact) */}
      <Dialog
        open={isTreatmentTargetsModalOpen}
        onOpenChange={setIsTreatmentTargetsModalOpen}
      >
        <DialogContent
          className="sm:max-w-[600px] rounded-[8px] bg-white border border-[#dddbda]"
          aria-describedby={undefined}
        >
          <DialogHeader className="border-b border-[#dddbda] pb-4">
            <DialogTitle className="text-[16px] font-bold text-[#080707]">
              Select Treatment Targets
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#706e6b] mt-2">
              Select one or more treatment targets for this
              parent/family contact.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 px-6 space-y-3 max-h-[400px] overflow-y-auto">
            {treatmentTargetOptions.map((target) => (
              <div
                key={target}
                className="flex items-start gap-3"
              >
                <Checkbox
                  id={`target-${target}`}
                  checked={selectedTreatmentTargets.includes(
                    target,
                  )}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedTreatmentTargets([
                        ...selectedTreatmentTargets,
                        target,
                      ]);
                    } else {
                      setSelectedTreatmentTargets(
                        selectedTreatmentTargets.filter(
                          (t) => t !== target,
                        ),
                      );
                    }
                  }}
                />
                <Label
                  htmlFor={`target-${target}`}
                  className="text-[13px] text-[#3e3e3c] cursor-pointer leading-relaxed"
                >
                  {target}
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter className="border-t border-[#dddbda] pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsTreatmentTargetsModalOpen(false);
                setSelectedTreatmentTargets([]);
              }}
              className="rounded-full h-9 px-5 text-[13px] font-medium border-[#dddbda] bg-white hover:bg-[#f3f2f2] text-[#3e3e3c] shadow-none"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Save to appropriate location based on connection type
                if (
                  connectionFormData.type ===
                  "Parent / Family Contact"
                ) {
                  setConnectionDetails({
                    ...connectionDetails,
                    treatmentTargets: selectedTreatmentTargets,
                  });
                } else if (
                  connectionFormData.type === "Therapy Session"
                ) {
                  setConnectionFormData({
                    ...connectionFormData,
                    treatmentTargets: selectedTreatmentTargets,
                  });
                }
                setIsTreatmentTargetsModalOpen(false);
              }}
              className="rounded-full text-[13px] text-white h-9 px-4"
              style={{ backgroundColor: "#145F33" }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AC3-AC6, AC8: Add Program Modal */}
      <Dialog
        open={isAddProgramModalOpen}
        onOpenChange={setIsAddProgramModalOpen}
      >
        <DialogContent
          className="sm:max-w-[600px] rounded-[8px] bg-white border border-[#dddbda]"
          aria-describedby={undefined}
        >
          <DialogHeader className="border-b border-[#dddbda] pb-4">
            <DialogTitle className="text-[16px] font-bold text-[#080707]">
              Add Program
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#706e6b] mt-2">
              Select one or more Programs. All active youths
              from selected Programs will be added as
              participants.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 px-6">
            {/* Programs List with Multi-select */}
            <div
              className="space-y-3 max-h-[400px] overflow-y-auto border rounded-lg p-4"
              style={{
                borderColor: "#dddbda",
                backgroundColor: "#f8f9fa",
              }}
            >
              <Label className="text-[13px] font-semibold text-[#3e3e3c] mb-1.5 block">
                Active Programs
              </Label>
              {programOptions.map((program) => (
                <div
                  key={program}
                  className="flex items-start gap-3 p-2 hover:bg-white rounded transition-colors"
                >
                  <Checkbox
                    id={`program-${program}`}
                    checked={tempSelectedPrograms.includes(
                      program,
                    )}
                    onCheckedChange={() =>
                      handleToggleProgramSelection(program)
                    }
                    className="mt-0.5"
                    style={{ accentColor: "#145F33" }}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`program-${program}`}
                      className="text-[13px] text-[#3e3e3c] font-medium cursor-pointer block mb-1.5"
                    >
                      {program}
                    </Label>
                    <span className="text-[11px] text-[#706e6b]">
                      {programYouthAssociations[program]
                        ?.length || 0}{" "}
                      active youth
                      {(programYouthAssociations[program]
                        ?.length || 0) !== 1
                        ? "s"
                        : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Programs Summary */}
            {tempSelectedPrograms.length > 0 && (
              <div
                className="mt-4 p-3 rounded-lg"
                style={{
                  backgroundColor: "#e8f5e9",
                  border: "1px solid #c8e6c9",
                }}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-[#145F33] mt-0.5 flex-shrink-0" />
                  <div className="text-[12px] text-[#3e3e3c]">
                    <strong>
                      {tempSelectedPrograms.length} Program
                      {tempSelectedPrograms.length !== 1
                        ? "s"
                        : ""}{" "}
                      selected
                    </strong>
                    <br />
                    {(() => {
                      const totalYouth =
                        tempSelectedPrograms.reduce(
                          (sum, prog) =>
                            sum +
                            (programYouthAssociations[prog]
                              ?.length || 0),
                          0,
                        );
                      return `${totalYouth} youth participant${totalYouth !== 1 ? "s" : ""} will be added`;
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-[#dddbda] pt-4">
            <Button
              variant="outline"
              onClick={handleCancelProgramSelection}
              className="rounded-full h-9 px-5 text-[13px] font-medium border-[#dddbda] bg-white hover:bg-[#f3f2f2] text-[#3e3e3c] shadow-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmProgramSelection}
              disabled={tempSelectedPrograms.length === 0}
              className="rounded-full text-[13px] text-white h-9 px-4"
              style={{
                backgroundColor:
                  tempSelectedPrograms.length === 0
                    ? "#cccccc"
                    : "#145F33",
              }}
            >
              Add Participants
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Goal Modal (for Therapy Session) */}
      <Dialog
        open={isAddGoalModalOpen}
        onOpenChange={setIsAddGoalModalOpen}
      >
        <DialogContent
          className="sm:max-w-[600px] rounded-[8px] bg-white border border-[#dddbda]"
          aria-describedby={undefined}
        >
          <DialogHeader className="border-b border-[#dddbda] pb-4">
            <DialogTitle className="text-[16px] font-bold text-[#080707]">
              {therapyGoalModalMode === "new-major"
                ? "New Major Goal"
                : therapyGoalModalMode === "new-intermediate"
                  ? "New Intermediate Goal"
                  : "Add Goal"}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#706e6b] mt-2">
              {therapyGoalModalMode === "select"
                ? "Select goals from Youth participants marked as attended, or create a new goal."
                : therapyGoalModalMode === "new-major"
                  ? "Create a new Major Goal. It will be added to the Youth's profile and auto-selected."
                  : "Associate this Intermediate Goal to an existing Major Goal."}
            </DialogDescription>
          </DialogHeader>

          {/* Mode: select existing goals */}
          {therapyGoalModalMode === "select" && (
            <>
              <div className="py-4 px-6 space-y-3 max-h-[320px] overflow-y-auto">
                {availableYouthGoals.length > 0 ? (
                  availableYouthGoals.map((goal) => (
                    <div
                      key={goal}
                      className="flex items-start gap-3"
                    >
                      <Checkbox
                        id={`goal-select-${goal}`}
                        checked={selectedGoalsToAdd.includes(
                          goal,
                        )}
                        onCheckedChange={() =>
                          handleToggleGoalSelection(goal)
                        }
                      />
                      <Label
                        htmlFor={`goal-select-${goal}`}
                        className="slds-text-4 cursor-pointer leading-relaxed flex-1"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {goal}
                      </Label>
                    </div>
                  ))
                ) : (
                  <div
                    className="text-center py-8 slds-text-4"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    No attended Youth participants found. Please
                    mark Youth participants as attended first.
                  </div>
                )}
              </div>
              <div
                className="px-6 pb-4 border-t pt-3"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-1)",
                }}
              >
                <p
                  className="slds-text-3 mb-2"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Or create a new goal for this Youth:
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setTherapyNewGoalName("");
                      setTherapyGoalModalMode("new-major");
                    }}
                    className="rounded-full h-8 px-4 slds-text-3 border-[#dddbda] bg-white hover:bg-[#f3f2f2] text-[#3e3e3c] shadow-none"
                  >
                    + Major Goal
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setTherapyNewGoalName("");
                      setTherapySelectedMajorForIntermediate(
                        "",
                      );
                      setTherapyGoalModalMode(
                        "new-intermediate",
                      );
                    }}
                    className="rounded-full h-8 px-4 slds-text-3 border-[#dddbda] bg-white hover:bg-[#f3f2f2] text-[#3e3e3c] shadow-none"
                  >
                    + Intermediate Goal
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Mode: new Major Goal */}
          {therapyGoalModalMode === "new-major" && (
            <div className="py-4 px-6 space-y-4">
              <div className="grid gap-1.5">
                <Label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Major Goal{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={therapyNewGoalName}
                  onValueChange={setTherapyNewGoalName}
                >
                  <SelectTrigger
                    className="h-9 slds-text-4"
                    style={{
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <SelectValue placeholder="Select a Major Goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {dynamicYouthGoals
                      .filter(
                        (g) =>
                          g.type === "Major" &&
                          g.status !== "Complete",
                      )
                      .map(({ goal }) => (
                        <SelectItem
                          key={goal}
                          value={goal}
                          className="slds-text-4"
                        >
                          {goal}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Mode: new Intermediate Goal */}
          {therapyGoalModalMode === "new-intermediate" && (
            <div className="py-4 px-6 space-y-4">
              <div className="grid gap-1.5">
                <Label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Associate to Major Goal{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={therapySelectedMajorForIntermediate}
                  onValueChange={
                    setTherapySelectedMajorForIntermediate
                  }
                >
                  <SelectTrigger
                    className="h-9 slds-text-4"
                    style={{
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <SelectValue placeholder="Select a Major Goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {dynamicYouthGoals
                      .filter(
                        (g) =>
                          g.type === "Major" &&
                          g.status !== "Complete",
                      )
                      .map(({ goal }) => (
                        <SelectItem
                          key={goal}
                          value={goal}
                          className="slds-text-4"
                        >
                          {goal}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Intermediate Goal Name{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  value={therapyNewGoalName}
                  onChange={(e) =>
                    setTherapyNewGoalName(e.target.value)
                  }
                  placeholder="Enter intermediate goal name..."
                  className="h-9 slds-text-4"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                  disabled={
                    !therapySelectedMajorForIntermediate
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-[#dddbda] pt-4">
            {therapyGoalModalMode !== "select" ? (
              <>
                <Button
                  variant="outline"
                  onClick={() =>
                    setTherapyGoalModalMode("select")
                  }
                  className="rounded-full h-9 px-5 slds-text-4 font-medium border-[#dddbda] bg-white hover:bg-[#f3f2f2] text-[#3e3e3c] shadow-none"
                >
                  Back
                </Button>
                <Button
                  onClick={
                    therapyGoalModalMode === "new-major"
                      ? handleSaveNewTherapyMajorGoal
                      : handleSaveNewTherapyIntermediateGoal
                  }
                  disabled={
                    therapyGoalModalMode === "new-major"
                      ? !therapyNewGoalName.trim()
                      : !therapyNewGoalName.trim() ||
                        !therapySelectedMajorForIntermediate
                  }
                  className="rounded-full slds-text-4 text-white h-9 px-4"
                  style={{
                    backgroundColor: (
                      therapyGoalModalMode === "new-major"
                        ? !therapyNewGoalName.trim()
                        : !therapyNewGoalName.trim() ||
                          !therapySelectedMajorForIntermediate
                    )
                      ? "#cccccc"
                      : "#145F33",
                  }}
                >
                  Create &amp; Select
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddGoalModalOpen(false);
                    setSelectedGoalsToAdd([]);
                  }}
                  className="rounded-full h-9 px-5 slds-text-4 font-medium border-[#dddbda] bg-white hover:bg-[#f3f2f2] text-[#3e3e3c] shadow-none"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSelectedGoals}
                  disabled={selectedGoalsToAdd.length === 0}
                  className="rounded-full slds-text-4 text-white h-9 px-4"
                  style={{
                    backgroundColor:
                      selectedGoalsToAdd.length === 0
                        ? "#cccccc"
                        : "#145F33",
                  }}
                >
                  Add Goal
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Participant Rating Modal (for Therapy Session) */}
      <Dialog
        open={isParticipantRatingModalOpen}
        onOpenChange={setIsParticipantRatingModalOpen}
      >
        <DialogContent
          className="sm:max-w-[700px] rounded-[8px] bg-white border border-[#dddbda]"
          aria-describedby={undefined}
        >
          <DialogHeader className="border-b border-[#dddbda] pb-4">
            <DialogTitle className="text-[16px] font-bold text-[#080707]">
              Participant Ratings:{" "}
              {editingParticipantRating?.participantName}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#706e6b] mt-2">
              Update ratings for this participant's therapy
              session experience.
            </DialogDescription>
          </DialogHeader>
          {editingParticipantRating && (
            <div className="py-4 px-6 space-y-6">
              {/* Participant Location */}
              <div className="grid gap-2">
                <Label className="text-[13px] text-[#3e3e3c] font-medium">
                  Participant Location
                </Label>
                <Select
                  value={
                    editingParticipantRating.participantLocation
                  }
                  onValueChange={(val) =>
                    setEditingParticipantRating({
                      ...editingParticipantRating,
                      participantLocation: val,
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-[13px] border-[#dddbda]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {participantLocationOptions.map((opt) => (
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

              {/* Relationship Rating */}
              <div className="grid gap-2">
                <Label className="text-[13px] text-[#3e3e3c] font-medium">
                  Relationship
                </Label>
                <p className="text-[11px] text-[#706e6b] mb-2">
                  Rate how heard, understood, and respected you
                  felt during the session.
                </p>
                <Select
                  value={
                    editingParticipantRating.relationshipRating
                  }
                  onValueChange={(val) =>
                    setEditingParticipantRating({
                      ...editingParticipantRating,
                      relationshipRating: val,
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-[13px] border-[#dddbda]">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {ratingScaleOptions.map((opt) => (
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

              {/* Goals/Topics Rating */}
              <div className="grid gap-2">
                <Label className="text-[13px] text-[#3e3e3c] font-medium">
                  Goals / Topics
                </Label>
                <p className="text-[11px] text-[#706e6b] mb-2">
                  Rate how much the topics that were worked
                  on/talked about were the topics you wanted to
                  work on/talk about.
                </p>
                <Select
                  value={
                    editingParticipantRating.goalsTopicsRating
                  }
                  onValueChange={(val) =>
                    setEditingParticipantRating({
                      ...editingParticipantRating,
                      goalsTopicsRating: val,
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-[13px] border-[#dddbda]">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {ratingScaleOptions.map((opt) => (
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

              {/* Approach/Method Rating */}
              <div className="grid gap-2">
                <Label className="text-[13px] text-[#3e3e3c] font-medium">
                  Approach / Method
                </Label>
                <p className="text-[11px] text-[#706e6b] mb-2">
                  Rate how good of a fit you believe the
                  therapist's approach is for you.
                </p>
                <Select
                  value={
                    editingParticipantRating.approachMethodRating
                  }
                  onValueChange={(val) =>
                    setEditingParticipantRating({
                      ...editingParticipantRating,
                      approachMethodRating: val,
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-[13px] border-[#dddbda]">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {ratingScaleOptions.map((opt) => (
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

              {/* Overall Rating */}
              <div className="grid gap-2">
                <Label className="text-[13px] text-[#3e3e3c] font-medium">
                  Overall
                </Label>
                <p className="text-[11px] text-[#706e6b] mb-2">
                  Rate how satisfied you were with the session
                  overall.
                </p>
                <Select
                  value={editingParticipantRating.overallRating}
                  onValueChange={(val) =>
                    setEditingParticipantRating({
                      ...editingParticipantRating,
                      overallRating: val,
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-[13px] border-[#dddbda]">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {ratingScaleOptions.map((opt) => (
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

              {/* Therapist Engagement Rating */}
              <div className="grid gap-2">
                <Label className="text-[13px] text-[#3e3e3c] font-medium">
                  Therapist Rating – Engagement
                </Label>
                <Select
                  value={
                    editingParticipantRating.therapistEngagementRating
                  }
                  onValueChange={(val) =>
                    setEditingParticipantRating({
                      ...editingParticipantRating,
                      therapistEngagementRating: val,
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-[13px] border-[#dddbda]">
                    <SelectValue placeholder="Select engagement level" />
                  </SelectTrigger>
                  <SelectContent>
                    {engagementOptions.map((opt) => (
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
          <DialogFooter className="border-t border-[#dddbda] pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsParticipantRatingModalOpen(false);
                setEditingParticipantRating(null);
              }}
              className="rounded-full h-9 px-5 text-[13px] font-medium border-[#dddbda] bg-white hover:bg-[#f3f2f2] text-[#3e3e3c] shadow-none"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Update the rating in the participantRatings array
                if (editingParticipantRating) {
                  setParticipantRatings(
                    participantRatings.map((r) =>
                      r.participantId ===
                      editingParticipantRating.participantId
                        ? editingParticipantRating
                        : r,
                    ),
                  );
                }
                setIsParticipantRatingModalOpen(false);
                setEditingParticipantRating(null);
              }}
              className="rounded-full text-[13px] text-white h-9 px-4"
              style={{ backgroundColor: "#145F33" }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Modify Goal Modal (for Advocate Meeting) */}
      <Dialog
        open={isAddAdvocateGoalModalOpen}
        onOpenChange={setIsAddAdvocateGoalModalOpen}
      >
        <DialogContent
          className="sm:max-w-[600px] rounded-[8px] bg-white border border-[#dddbda]"
          aria-describedby={undefined}
        >
          <DialogHeader className="border-b border-[#dddbda] pb-4">
            <DialogTitle className="text-[16px] font-bold text-[#080707]">
              {editingAdvocateGoal
                ? "Modify Goal"
                : advocateGoalModalMode === "new-major"
                  ? "New Major Goal"
                  : advocateGoalModalMode === "new-intermediate"
                    ? "New Intermediate Goal"
                    : "Add Goal"}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#706e6b] mt-2">
              {advocateGoalModalMode === "select"
                ? "Select a goal from the Youth's active goals, or create a new one."
                : advocateGoalModalMode === "new-major"
                  ? "Create a new Major Goal. It will be added to the Youth's profile and auto-selected."
                  : "Associate this Intermediate Goal to an existing Major Goal."}
            </DialogDescription>
          </DialogHeader>

          {/* Mode: Select existing goal */}
          {advocateGoalModalMode === "select" && (
            <div className="py-4 px-6 space-y-4">
              <div className="grid gap-2">
                <Label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Goal <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={selectedAdvocateGoal}
                  onValueChange={setSelectedAdvocateGoal}
                >
                  <SelectTrigger
                    className="h-9 slds-text-4"
                    style={{
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <SelectValue placeholder="Select a goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* AC25: filter out Complete goals */}
                    {dynamicYouthGoals
                      .filter((g) => g.status !== "Complete")
                      .filter(
                        (g) =>
                          !advocateGoals.some(
                            (ag) => ag.goal === g.goal,
                          ) ||
                          editingAdvocateGoal?.goal === g.goal,
                      )
                      .map(({ goal, type }) => (
                        <SelectItem
                          key={goal}
                          value={goal}
                          className="slds-text-4"
                        >
                          <span>{goal}</span>
                          <span
                            className="ml-2 text-[11px]"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            ({type})
                          </span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Comments
                </Label>
                <Textarea
                  value={advocateGoalComments}
                  onChange={(e) =>
                    setAdvocateGoalComments(e.target.value)
                  }
                  placeholder="Enter comments..."
                  className="min-h-[100px] slds-text-4 resize-none"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                    fontFamily: "inherit",
                  }}
                />
              </div>
              {/* AC28: Add New Goal options */}
              {!editingAdvocateGoal && (
                <div
                  className="border-t pt-3"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                >
                  <p
                    className="slds-text-3 mb-2"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Or create a new goal for this Youth:
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setNewGoalName("");
                        setAdvocateGoalModalMode("new-major");
                      }}
                      className="rounded-full h-8 px-4 slds-text-3 border-[#dddbda] bg-white hover:bg-[#f3f2f2] text-[#3e3e3c] shadow-none"
                    >
                      + Major Goal
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setNewGoalName("");
                        setSelectedMajorForIntermediate("");
                        setAdvocateGoalModalMode(
                          "new-intermediate",
                        );
                      }}
                      className="rounded-full h-8 px-4 slds-text-3 border-[#dddbda] bg-white hover:bg-[#f3f2f2] text-[#3e3e3c] shadow-none"
                    >
                      + Intermediate Goal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AC29: Mode — New Major Goal */}
          {advocateGoalModalMode === "new-major" && (
            <div className="py-4 px-6 space-y-4">
              <div className="grid gap-1.5">
                <Label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Goal Name{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  value={newGoalName}
                  onChange={(e) =>
                    setNewGoalName(e.target.value)
                  }
                  placeholder="Enter major goal name..."
                  className="h-9 slds-text-4"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                />
              </div>
            </div>
          )}

          {/* AC30: Mode — New Intermediate Goal */}
          {advocateGoalModalMode === "new-intermediate" && (
            <div className="py-4 px-6 space-y-4">
              <div className="grid gap-1.5">
                <Label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Associate to Major Goal{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={selectedMajorForIntermediate}
                  onValueChange={
                    setSelectedMajorForIntermediate
                  }
                >
                  <SelectTrigger
                    className="h-9 slds-text-4"
                    style={{
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <SelectValue placeholder="Select a Major Goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {dynamicYouthGoals
                      .filter(
                        (g) =>
                          g.type === "Major" &&
                          g.status !== "Complete",
                      )
                      .map(({ goal }) => (
                        <SelectItem
                          key={goal}
                          value={goal}
                          className="slds-text-4"
                        >
                          {goal}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label
                  className="slds-form-label"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Intermediate Goal Name{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  value={newGoalName}
                  onChange={(e) =>
                    setNewGoalName(e.target.value)
                  }
                  placeholder="Enter intermediate goal name..."
                  className="h-9 slds-text-4"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                  disabled={!selectedMajorForIntermediate}
                />
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-[#dddbda] pt-4">
            {advocateGoalModalMode !== "select" ? (
              <>
                <Button
                  variant="outline"
                  onClick={() =>
                    setAdvocateGoalModalMode("select")
                  }
                  className="rounded-full h-9 px-5 slds-text-4 font-medium border-[#dddbda] bg-white hover:bg-[#f3f2f2] text-[#3e3e3c] shadow-none"
                >
                  Back
                </Button>
                <Button
                  onClick={
                    advocateGoalModalMode === "new-major"
                      ? handleSaveNewMajorGoal
                      : handleSaveNewIntermediateGoal
                  }
                  disabled={
                    advocateGoalModalMode === "new-major"
                      ? !newGoalName.trim()
                      : !newGoalName.trim() ||
                        !selectedMajorForIntermediate
                  }
                  className="rounded-full slds-text-4 text-white h-9 px-4"
                  style={{
                    backgroundColor: (
                      advocateGoalModalMode === "new-major"
                        ? !newGoalName.trim()
                        : !newGoalName.trim() ||
                          !selectedMajorForIntermediate
                    )
                      ? "#cccccc"
                      : "#145F33",
                  }}
                >
                  Create & Select
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddAdvocateGoalModalOpen(false);
                    setEditingAdvocateGoal(null);
                    setSelectedAdvocateGoal("");
                    setAdvocateGoalComments("");
                  }}
                  className="rounded-full h-9 px-5 slds-text-4 font-medium border-[#dddbda] bg-white hover:bg-[#f3f2f2] text-[#3e3e3c] shadow-none"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAdvocateGoal}
                  disabled={!selectedAdvocateGoal}
                  className="rounded-full slds-text-4 text-white h-9 px-4"
                  style={{
                    backgroundColor: selectedAdvocateGoal
                      ? "#145F33"
                      : "#cccccc",
                  }}
                >
                  {editingAdvocateGoal
                    ? "Update Goal"
                    : "Add Goal"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Coping Skills Modal (for Advocate Meeting) */}
      <CopingSkillModal
        isOpen={isAddCopingSkillModalOpen}
        onClose={() => {
          setIsAddCopingSkillModalOpen(false);
          setEditingCopingSkill(null);
        }}
        onSave={handleSaveCopingSkill}
        initialData={
          editingCopingSkill
            ? {
                copingSkill: editingCopingSkill.skill,
                dateReported:
                  editingCopingSkill.dateReported || "",
                lastITPInclusion:
                  editingCopingSkill.lastITPInclusion || "",
                description:
                  editingCopingSkill.description || "",
                effectiveWhen:
                  editingCopingSkill.effectiveWhen || "",
              }
            : undefined
        }
        title={
          editingCopingSkill
            ? "Edit Coping Skill"
            : "Add New Coping Skill"
        }
      />

      {/* Triggers Modal (for Advocate Meeting) */}
      <TriggerModal
        isOpen={isAddTriggerModalOpen}
        onClose={() => {
          setIsAddTriggerModalOpen(false);
          setEditingTrigger(null);
        }}
        onSave={handleSaveTrigger}
        initialData={
          editingTrigger
            ? {
                trigger: editingTrigger.trigger,
                dateReported: editingTrigger.dateReported || "",
                lastITPInclusion:
                  editingTrigger.lastITPInclusion || "",
                endDate: editingTrigger.endDate || "",
                description: editingTrigger.description || "",
              }
            : undefined
        }
        title={
          editingTrigger ? "Edit Trigger" : "Add New Trigger"
        }
      />

      {/* Strengths Modal (for Advocate Meeting) */}
      <StrengthModal
        isOpen={isAddStrengthModalOpen}
        onClose={() => {
          setIsAddStrengthModalOpen(false);
          setEditingStrength(null);
        }}
        onSave={handleSaveStrength}
        initialData={
          editingStrength
            ? {
                strength: editingStrength.strength,
                dateReported:
                  editingStrength.dateReported || "",
                lastITPInclusion:
                  editingStrength.lastITPInclusion || "",
                subject: editingStrength.subject || "",
                description: editingStrength.description || "",
              }
            : undefined
        }
        title={
          editingStrength ? "Edit Strength" : "Add New Strength"
        }
      />
      {/* AC20-AC27: Manage Participants Modal (for Therapy Session and Milieu Meeting) */}
      <Dialog
        open={isManageParticipantsModalOpen}
        onOpenChange={setIsManageParticipantsModalOpen}
      >
        <DialogContent
          className="sm:max-w-[1000px] rounded-[8px] bg-white border border-[#dddbda] max-h-[90vh] overflow-hidden flex flex-col p-0"
          aria-describedby={undefined}
        >
          <DialogHeader className="border-b border-[#dddbda] pb-4 px-6 pt-6 mb-0">
            <DialogTitle className="text-[16px] font-bold text-[#080707]">
              Manage Participants
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#706e6b] mt-2">
              Add, remove, or update participants for this
              connection.{" "}
              {connectionFormData.type &&
                programSupportedConnectionTypes.includes(
                  connectionFormData.type,
                ) &&
                'Use "Add Program" to automatically add youth from a selected program.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {/* AC21: Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {selectedModalParticipantIds.length > 0 && (
                  <>
                    <span className="text-[12px] text-[#706e6b] mr-1">
                      {selectedModalParticipantIds.length}{" "}
                      selected
                    </span>
                    <Button
                      variant="outline"
                      onClick={handleBulkSetAttendedInModal}
                      className="rounded-full h-8 px-3 text-[12px] font-medium border-[#dddbda] bg-white hover:bg-[#f3f2f2] text-[#3e3e3c] shadow-none"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Set as Attended
                    </Button>
                    <Button
                      onClick={handleBulkSetNotAttendedInModal}
                      variant="outline"
                      className="rounded-full h-8 px-3 text-[12px] font-medium border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
                      style={{ color: "#080707" }}
                    >
                      <XIcon className="h-3.5 w-3.5 mr-1" />
                      Set as Not Attended
                    </Button>
                    <Button
                      onClick={
                        handleBulkRemoveParticipantsInModal
                      }
                      variant="outline"
                      className="rounded-full h-8 px-3 text-[12px] font-medium shadow-none"
                      style={{
                        color: "#c23934",
                        borderColor: "#fecdca",
                        backgroundColor: "#fef3f2",
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Remove Participant(s)
                    </Button>
                  </>
                )}
                <Button
                  onClick={handleAddParticipantInModal}
                  className="rounded-full h-8 px-3 text-[12px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Participant
                </Button>

                {/* Add Program button - only for connection types that support programs */}
                {connectionFormData.type &&
                  programSupportedConnectionTypes.includes(
                    connectionFormData.type,
                  ) && (
                    <Button
                      onClick={handleOpenAddProgramModal}
                      variant="outline"
                      className="rounded-full h-8 px-3 text-[12px] font-medium border-[#145F33] bg-white hover:bg-[#f0faf4] text-[#145F33] shadow-none"
                    >
                      <Users className="h-3.5 w-3.5 mr-1.5" />
                      Add Program
                    </Button>
                  )}
              </div>

              {/* Participants Table */}
              {tempParticipants.length > 0 ? (
                <div className="border rounded-lg overflow-hidden border-[#dddbda]">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-alt)",
                        }}
                      >
                        <tr>
                          <th
                            className="px-3 py-2.5 text-center"
                            style={{ width: "44px" }}
                          >
                            <Checkbox
                              checked={
                                selectedModalParticipantIds.length >
                                  0 &&
                                selectedModalParticipantIds.length ===
                                  tempParticipants.filter(
                                    (p) => !p.isOrganizer,
                                  ).length
                              }
                              onCheckedChange={
                                handleToggleAllModalParticipants
                              }
                              aria-label="Select all participants"
                            />
                          </th>
                          <th
                            className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                              width: "120px",
                            }}
                          >
                            Type
                          </th>
                          <th
                            className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                              width: "180px",
                            }}
                          >
                            Participant
                          </th>
                          <th
                            className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                              width: "140px",
                            }}
                          >
                            Role
                          </th>
                          <th
                            className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                              width: "90px",
                            }}
                          >
                            Organizer
                          </th>
                          <th
                            className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                              width: "100px",
                            }}
                          >
                            Attended
                          </th>
                          <th
                            className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Reason Missed
                          </th>
                          <th
                            className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
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
                        {tempParticipants.map((participant) => (
                          <tr key={participant.id}>
                            <td className="px-3 py-2 text-center">
                              {participant.isOrganizer ? (
                                <div className="h-4 w-4"></div>
                              ) : (
                                <Checkbox
                                  checked={selectedModalParticipantIds.includes(
                                    participant.id,
                                  )}
                                  onCheckedChange={() => {
                                    if (
                                      selectedModalParticipantIds.includes(
                                        participant.id,
                                      )
                                    ) {
                                      setSelectedModalParticipantIds(
                                        selectedModalParticipantIds.filter(
                                          (id) =>
                                            id !==
                                            participant.id,
                                        ),
                                      );
                                    } else {
                                      setSelectedModalParticipantIds(
                                        [
                                          ...selectedModalParticipantIds,
                                          participant.id,
                                        ],
                                      );
                                    }
                                  }}
                                  aria-label={`Select ${participant.participant}`}
                                />
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <Select
                                value={
                                  participant.constituentType
                                }
                                onValueChange={(
                                  val:
                                    | "Constituent"
                                    | "Non-Constituent",
                                ) =>
                                  handleUpdateParticipantInModal(
                                    participant.id,
                                    "constituentType",
                                    val,
                                  )
                                }
                              >
                                <SelectTrigger className="h-8 text-[13px] border-[#dddbda]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Constituent">
                                    Constituent
                                  </SelectItem>
                                  <SelectItem value="Non-Constituent">
                                    Non-Constituent
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                value={participant.participant}
                                onChange={(e) =>
                                  handleUpdateParticipantInModal(
                                    participant.id,
                                    "participant",
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-[13px] border-[#dddbda]"
                                placeholder={
                                  participant.constituentType ===
                                  "Constituent"
                                    ? "Search constituent..."
                                    : "Enter name..."
                                }
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Select
                                value={participant.role}
                                onValueChange={(val) =>
                                  handleUpdateParticipantInModal(
                                    participant.id,
                                    "role",
                                    val,
                                  )
                                }
                              >
                                <SelectTrigger className="h-8 text-[13px] border-[#dddbda]">
                                  <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {(participant.constituentType ===
                                  "Constituent"
                                    ? constituentRoleOptions
                                    : nonConstituentRoleOptions
                                  ).map((role) => (
                                    <SelectItem
                                      key={role}
                                      value={role}
                                      className="text-[13px]"
                                    >
                                      {role}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <div className="flex justify-center">
                                <Checkbox
                                  checked={
                                    participant.isOrganizer ||
                                    false
                                  }
                                  onCheckedChange={() =>
                                    handleSetOrganizerInModal(
                                      participant.id,
                                    )
                                  }
                                  aria-label={`Set ${participant.participant} as organizer`}
                                />
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <div className="flex justify-center">
                                <Select
                                  value={
                                    participant.attended ===
                                    null
                                      ? "null"
                                      : participant.attended
                                        ? "yes"
                                        : "no"
                                  }
                                  onValueChange={(val) =>
                                    handleUpdateParticipantInModal(
                                      participant.id,
                                      "attended",
                                      val === "null"
                                        ? null
                                        : val === "yes",
                                    )
                                  }
                                >
                                  <SelectTrigger className="h-8 w-24 text-[13px] border-[#dddbda]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem
                                      value="null"
                                      className="text-[13px]"
                                    >
                                      —
                                    </SelectItem>
                                    <SelectItem
                                      value="yes"
                                      className="text-[13px]"
                                    >
                                      Yes
                                    </SelectItem>
                                    <SelectItem
                                      value="no"
                                      className="text-[13px]"
                                    >
                                      No
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              {participant.attended ===
                              false ? (
                                <Select
                                  value={
                                    participant.reasonMissed
                                  }
                                  onValueChange={(value) =>
                                    handleUpdateParticipantInModal(
                                      participant.id,
                                      "reasonMissed",
                                      value,
                                    )
                                  }
                                >
                                  <SelectTrigger className="h-8 text-[13px] border-[#dddbda]">
                                    <SelectValue placeholder="Select reason" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {reasonMissedOptions.map(
                                      (opt) => (
                                        <SelectItem
                                          key={opt}
                                          value={opt}
                                          className="text-[13px]"
                                        >
                                          {opt}
                                        </SelectItem>
                                      ),
                                    )}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <span className="text-[13px] text-gray-400">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center justify-end">
                                <button
                                  onClick={() =>
                                    handleRemoveParticipantInModal(
                                      participant.id,
                                    )
                                  }
                                  className="p-1.5 rounded hover:bg-red-100 transition-colors"
                                  title="Remove participant"
                                  disabled={
                                    participant.isOrganizer
                                  }
                                >
                                  <Trash2
                                    className={`h-4 w-4 ${participant.isOrganizer ? "text-gray-400" : "text-red-600"}`}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-[13px] text-[#706e6b] border border-dashed border-[#dddbda] rounded-lg">
                  No participants added yet. Click "Add
                  Participant" to get started.
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="border-t border-[#dddbda] px-6 py-4">
            <Button
              variant="outline"
              onClick={handleCancelManageParticipants}
              className="rounded-full text-[13px] h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyManageParticipants}
              className="rounded-full text-[13px] text-white h-9 px-4"
              style={{ backgroundColor: "#145F33" }}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}