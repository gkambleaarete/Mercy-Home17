import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner@2.0.3";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ChevronRight, Plus, User, Users, Building2, Phone, Mail, CheckSquare, Upload, AlertTriangle, Clock, MapPin, CheckCircle, Pencil, Trash2, ChevronDown, FileText, ChevronUp, Check, X, ChevronLeft, Search, Filter, Calendar, Package, Tag, ClipboardList, ChevronsUpDown, Download, Eye, File, MoreVertical } from "@/app/lib/lucide-icons";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

const CONSTITUENT_TYPES = ["Youth", "Staff", "Guardian", "Parent", "Family Member", "Social Worker", "Case Manager", "Other"];

const RELATIONSHIPS = [
  "Mother", "Father", "Guardian", "Sibling", "Caseworker", "Therapist", "Teacher", "Coach", "Other"
];

const INVOLVEMENT_TYPES = [
  "Implement Hold",
  "Auxiliary"
];

const REASON_FOR_RELEASE = [
  "Youth Exhibited Signs of Tension Reduction",
  "Youth Escaped Restraint",
  "Staff Injury Suspected",
  "Youth Injury Suspected",
  "Restraint Transitioned to Unsafe Position",
  "Environmental Safety Concerns",
  "Maximum Restraint Time Limit Reached",
  "Change Staff Involved",
  "Youth Required More Restrictive Hold"
];

const RESTRAINT_TYPES = [
  "Child Control Position",
  "Interim",
  "Team Control",
  "Transport",
  "Other Form of Physical Intervention"
];

interface YouthIRDialogsSectionProps {
  activeTab: any;
  allStaff: any;
  associatedStaff: any;
  calculateRestraintDuration: any;
  consOfIntervention: any;
  constituent: any;
  constituentId: any;
  constituents: any;
  currentInjury: any;
  currentPersonContacted: any;
  currentRestraint: any;
  currentStaffInvolvement: any;
  currentYouth: any;
  deEscalationTechniques: any;
  debriefSectionStatus: any;
  editingInjuryId: any;
  editingPersonContactedId: any;
  editingRestraintId: any;
  editingStaffInvolvementId: any;
  editingSubstanceTestId: any;
  end: any;
  endDate: any;
  endTimeHours: any;
  endTimeMinutes: any;
  endTimeSeconds: any;
  getParticipantModalTitle: any;
  getStaffAssociatedWithIncident: any;
  getStaffForDebriefPiclist: any;
  getYouthInvolved: any;
  handleAddConstituent: any;
  handleAddDebriefParticipant: any;
  handleAddInjury: any;
  handleAddStaffInvolvement: any;
  handleAddSubstanceTest: any;
  handleCancelAddConstituent: any;
  handleCompleteYouthDebrief: any;
  handleCompleteYouthInjuries: any;
  handleCompleteYouthResponse: any;
  handleCompleteYouthSubstanceUse: any;
  handleDeleteInjury: any;
  handleDeleteStaffInvolvement: any;
  handleEditInjury: any;
  handleEditStaffInvolvement: any;
  handleEditSubstanceTest: any;
  handleLoadNarrative: any;
  handleLoadOverview: any;
  handleLoadResponse: any;
  handleOpenAddParticipant: any;
  handleRemoveDebriefParticipant: any;
  handleRemoveSubstanceTest: any;
  handleReopenYouthDebrief: any;
  handleReopenYouthInjuries: any;
  handleReopenYouthResponse: any;
  handleReopenYouthSubstanceUse: any;
  handleSaveInjury: any;
  handleSavePersonContacted: any;
  handleSaveRestraint: any;
  handleSaveStaffInvolvement: any;
  handleSaveYouthDebrief: any;
  handleSaveYouthInjuries: any;
  handleSaveYouthResponse: any;
  handleSaveYouthSubstanceUse: any;
  hours: any;
  individuals: any;
  initials: any;
  injuries: any;
  injuriesSectionStatus: any;
  isAddingConstituent: any;
  isAddingDebriefParticipant: any;
  isAddingInjury: any;
  isAddingPersonContacted: any;
  isAddingRestraint: any;
  isAddingStaffInvolvement: any;
  isAddingSubstanceTest: any;
  loadNarrativeSource: any;
  loadOverviewSource: any;
  loadResponseSource: any;
  minutes: any;
  nameParts: any;
  newConstituent: any;
  newTest: any;
  parentDebriefStaff: any;
  parentProcessingInput: any;
  precipitatingFactors: any;
  prosOfIntervention: any;
  relatedSubstanceTests: any;
  responseSectionStatus: any;
  responsesReflection: any;
  seconds: any;
  selectedStaffForDebrief: any;
  selfDisclosedSubstanceUse: any;
  setConsOfIntervention: any;
  setCurrentInjury: any;
  setCurrentParticipantType: any;
  setCurrentPersonContacted: any;
  setCurrentRestraint: any;
  setCurrentStaffInvolvement: any;
  setDeEscalationTechniques: any;
  setEditingInjuryId: any;
  setEditingPersonContactedId: any;
  setEditingRestraintId: any;
  setEditingStaffInvolvementId: any;
  setEditingSubstanceTestId: any;
  setIsAddingConstituent: any;
  setIsAddingDebriefParticipant: any;
  setIsAddingInjury: any;
  setIsAddingPersonContacted: any;
  setIsAddingRestraint: any;
  setIsAddingStaffInvolvement: any;
  setIsAddingSubstanceTest: any;
  setLoadNarrativeSource: any;
  setLoadOverviewSource: any;
  setLoadResponseSource: any;
  setNewConstituent: any;
  setParentProcessingInput: any;
  setPrecipitatingFactors: any;
  setProsOfIntervention: any;
  setRelatedSubstanceTests: any;
  setResponsesReflection: any;
  setSelectedStaffForDebrief: any;
  setSelfDisclosedSubstanceUse: any;
  setShowLoadNarrativeModal: any;
  setShowLoadOverviewModal: any;
  setShowLoadResponseModal: any;
  setStaffTeamChanges: any;
  setSubstanceTestAdministered: any;
  setTeamworkConcerns: any;
  setTeamworkSuccesses: any;
  setYouthProcessingInput: any;
  setYouthResponse: any;
  setYouthTeamChanges: any;
  setYouthWitnessProcessing: any;
  showLoadNarrativeModal: any;
  showLoadOverviewModal: any;
  showLoadResponseModal: any;
  staff: any;
  staffId: any;
  staffTeamChanges: any;
  start: any;
  startDate: any;
  startTimeHours: any;
  startTimeMinutes: any;
  startTimeSeconds: any;
  substanceTestAdministered: any;
  substanceUseSectionStatus: any;
  teamDebriefStaff: any;
  teamworkConcerns: any;
  teamworkSuccesses: any;
  unableToParticipate: any;
  youth: any;
  youthDebriefStaff: any;
  youthId: any;
  youthProcessingInput: any;
  youthResponse: any;
  youthTeamChanges: any;
  youthWitnessProcessing: any;
}

export function YouthIRDialogsSection({ activeTab, allStaff, associatedStaff, calculateRestraintDuration, consOfIntervention, constituent, constituentId, constituents, currentInjury, currentPersonContacted, currentRestraint, currentStaffInvolvement, currentYouth, deEscalationTechniques, debriefSectionStatus, editingInjuryId, editingPersonContactedId, editingRestraintId, editingStaffInvolvementId, editingSubstanceTestId, end, endDate, endTimeHours, endTimeMinutes, endTimeSeconds, getParticipantModalTitle, getStaffAssociatedWithIncident, getStaffForDebriefPiclist, getYouthInvolved, handleAddConstituent, handleAddDebriefParticipant, handleAddInjury, handleAddStaffInvolvement, handleAddSubstanceTest, handleCancelAddConstituent, handleCompleteYouthDebrief, handleCompleteYouthInjuries, handleCompleteYouthResponse, handleCompleteYouthSubstanceUse, handleDeleteInjury, handleDeleteStaffInvolvement, handleEditInjury, handleEditStaffInvolvement, handleEditSubstanceTest, handleLoadNarrative, handleLoadOverview, handleLoadResponse, handleOpenAddParticipant, handleRemoveDebriefParticipant, handleRemoveSubstanceTest, handleReopenYouthDebrief, handleReopenYouthInjuries, handleReopenYouthResponse, handleReopenYouthSubstanceUse, handleSaveInjury, handleSavePersonContacted, handleSaveRestraint, handleSaveStaffInvolvement, handleSaveYouthDebrief, handleSaveYouthInjuries, handleSaveYouthResponse, handleSaveYouthSubstanceUse, hours, individuals, initials, injuries, injuriesSectionStatus, isAddingConstituent, isAddingDebriefParticipant, isAddingInjury, isAddingPersonContacted, isAddingRestraint, isAddingStaffInvolvement, isAddingSubstanceTest, loadNarrativeSource, loadOverviewSource, loadResponseSource, minutes, nameParts, newConstituent, newTest, parentDebriefStaff, parentProcessingInput, precipitatingFactors, prosOfIntervention, relatedSubstanceTests, responseSectionStatus, responsesReflection, seconds, selectedStaffForDebrief, selfDisclosedSubstanceUse, setConsOfIntervention, setCurrentInjury, setCurrentParticipantType, setCurrentPersonContacted, setCurrentRestraint, setCurrentStaffInvolvement, setDeEscalationTechniques, setEditingInjuryId, setEditingPersonContactedId, setEditingRestraintId, setEditingStaffInvolvementId, setEditingSubstanceTestId, setIsAddingConstituent, setIsAddingDebriefParticipant, setIsAddingInjury, setIsAddingPersonContacted, setIsAddingRestraint, setIsAddingStaffInvolvement, setIsAddingSubstanceTest, setLoadNarrativeSource, setLoadOverviewSource, setLoadResponseSource, setNewConstituent, setParentProcessingInput, setPrecipitatingFactors, setProsOfIntervention, setRelatedSubstanceTests, setResponsesReflection, setSelectedStaffForDebrief, setSelfDisclosedSubstanceUse, setShowLoadNarrativeModal, setShowLoadOverviewModal, setShowLoadResponseModal, setStaffTeamChanges, setSubstanceTestAdministered, setTeamworkConcerns, setTeamworkSuccesses, setYouthProcessingInput, setYouthResponse, setYouthTeamChanges, setYouthWitnessProcessing, showLoadNarrativeModal, showLoadOverviewModal, showLoadResponseModal, staff, staffId, staffTeamChanges, start, startDate, startTimeHours, startTimeMinutes, startTimeSeconds, substanceTestAdministered, substanceUseSectionStatus, teamDebriefStaff, teamworkConcerns, teamworkSuccesses, unableToParticipate, youth, youthDebriefStaff, youthId, youthProcessingInput, youthResponse, youthTeamChanges, youthWitnessProcessing }: YouthIRDialogsSectionProps) {
  return (
    <>
                    <Dialog open={isAddingRestraint} onOpenChange={setIsAddingRestraint}>
                        <DialogContent aria-describedby={undefined} className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingRestraintId ? "Edit Restraint" : "Add Restraint"}</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <div className="space-y-4">
                                    {/* Date & Time Fields */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Start Date/Time */}
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Start Date <span className="text-red-600">*</span>
                                            </label>
                                            <DateInput
value={isoToMdy(currentRestraint.startDate)}
                                                onChange={(v) => ((e) => setCurrentRestraint({ ...currentRestraint, startDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
                                                className="h-9 text-sm"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                            />
                                        </div>
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Start Time <span className="text-red-600">*</span>
                                            </label>
                                            <Input
                                                type="time"
                                                value={`${currentRestraint.startTimeHours.padStart(2, '0')}:${currentRestraint.startTimeMinutes.padStart(2, '0')}:${currentRestraint.startTimeSeconds.padStart(2, '0')}`}
                                                onChange={(e) => {
                                                    const [hours, minutes, seconds = '00'] = e.target.value.split(':');
                                                    setCurrentRestraint({
                                                        ...currentRestraint,
                                                        startTimeHours: hours,
                                                        startTimeMinutes: minutes,
                                                        startTimeSeconds: seconds
                                                    });
                                                }}
                                                step="1"
                                                className="h-9 text-sm"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* End Date/Time */}
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                End Date <span className="text-red-600">*</span>
                                            </label>
                                            <DateInput
value={isoToMdy(currentRestraint.endDate)}
                                                onChange={(v) => ((e) => setCurrentRestraint({ ...currentRestraint, endDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
                                                className="h-9 text-sm"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                            />
                                        </div>
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                End Time <span className="text-red-600">*</span>
                                            </label>
                                            <Input
                                                type="time"
                                                value={`${currentRestraint.endTimeHours.padStart(2, '0')}:${currentRestraint.endTimeMinutes.padStart(2, '0')}:${currentRestraint.endTimeSeconds.padStart(2, '0')}`}
                                                onChange={(e) => {
                                                    const [hours, minutes, seconds = '00'] = e.target.value.split(':');
                                                    setCurrentRestraint({
                                                        ...currentRestraint,
                                                        endTimeHours: hours,
                                                        endTimeMinutes: minutes,
                                                        endTimeSeconds: seconds
                                                    });
                                                }}
                                                step="1"
                                                className="h-9 text-sm"
                                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Duration Display */}
                                    <div>
                                        <label 
                                            className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Duration of Restraint
                                        </label>
                                        <div 
                                            className="px-3 py-2 text-sm rounded"
                                            style={{ 
                                                backgroundColor: 'var(--slds-g-color-background-alt)',
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                color: 'var(--slds-g-color-text-default)'
                                            }}
                                        >
                                            {calculateRestraintDuration(currentRestraint)}
                                        </div>
                                    </div>

                                    {/* Type */}
                                    <div>
                                        <label 
                                            className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Type <span className="text-red-600">*</span>
                                        </label>
                                        <select
                                            value={currentRestraint.type}
                                            onChange={(e) => setCurrentRestraint({ ...currentRestraint, type: e.target.value })}
                                            className="w-full h-9 text-sm px-3 rounded"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'white'
                                            }}
                                        >
                                            <option value="">Select Type...</option>
                                            {RESTRAINT_TYPES.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Reason for Release */}
                                    <div>
                                        <label 
                                            className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Reason for Release <span className="text-red-600">*</span>
                                        </label>
                                        <select
                                            value={currentRestraint.reasonForRelease}
                                            onChange={(e) => setCurrentRestraint({ ...currentRestraint, reasonForRelease: e.target.value })}
                                            className="w-full h-9 text-sm px-3 rounded"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'white'
                                            }}
                                        >
                                            <option value="">Select Reason...</option>
                                            {REASON_FOR_RELEASE.map(reason => (
                                                <option key={reason} value={reason}>{reason}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Staff Involved During Restraint */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Staff Involved During Restraint
                                            </label>
                                            <Button
                                                size="sm"
                                                onClick={handleAddStaffInvolvement}
                                                style={{
                                                    backgroundColor: 'var(--color-brand-primary)',
                                                    color: 'white',
                                                    borderRadius: '9999px'
                                                }}
                                                className="h-7 px-2 text-xs"
                                            >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Add Staff
                                            </Button>
                                        </div>

                                        {currentRestraint.staffInvolved.length > 0 ? (
                                            <div 
                                                className="border rounded overflow-hidden"
                                                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                            >
                                                <table className="w-full">
                                                    <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                        <tr>
                                                            <th 
                                                                className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide"
                                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                Staff Member
                                                            </th>
                                                            <th 
                                                                className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide"
                                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                Involvement
                                                            </th>
                                                            <th 
                                                                className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide"
                                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                Actions
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentRestraint.staffInvolved.map((staff) => (
                                                            <tr 
                                                                key={staff.id}
                                                                className="border-t"
                                                                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                                            >
                                                                <td className="px-3 py-2 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {staff.staffName}
                                                                </td>
                                                                <td className="px-3 py-2 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {staff.involvement}
                                                                </td>
                                                                <td className="px-3 py-2 text-right">
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        <button
                                                                            onClick={() => handleEditStaffInvolvement(staff)}
                                                                            className="p-1 rounded hover:bg-gray-100"
                                                                            title="Edit"
                                                                        >
                                                                            <Edit2 className="h-3 w-3" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteStaffInvolvement(staff.id)}
                                                                            className="p-1 rounded hover:bg-gray-100"
                                                                            title="Delete"
                                                                        >
                                                                            <Trash2 className="h-3 w-3" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div 
                                                className="text-center py-4 text-sm rounded"
                                                style={{ 
                                                    color: 'var(--slds-g-color-text-weak)',
                                                    backgroundColor: 'var(--slds-g-color-background-alt)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                No staff added yet. Click "Add Staff" to add one.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddingRestraint(false);
                                        setEditingRestraintId(null);
                                    }}
                                    className="h-8 px-3 text-xs"
                                    style={{ borderRadius: '9999px' }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSaveRestraint}
                                    style={{
                                        backgroundColor: 'var(--color-brand-primary)',
                                        color: 'white',
                                        borderRadius: '9999px'
                                    }}
                                    className="h-8 px-3 text-xs"
                                >
                                    Save Restraint
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Staff Involvement Modal */}
                    <Dialog open={isAddingStaffInvolvement} onOpenChange={setIsAddingStaffInvolvement}>
                        <DialogContent aria-describedby={undefined} className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>{editingStaffInvolvementId ? "Edit Staff Involvement" : "Add Staff Involvement"}</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <div className="space-y-4">
                                    {/* Staff Member */}
                                    <div>
                                        <label 
                                            className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Staff Member <span className="text-red-600">*</span>
                                        </label>
                                        <select
                                            value={currentStaffInvolvement.staffId || ""}
                                            onChange={(e) => {
                                                const staffId = parseInt(e.target.value);
                                                const staff = constituents.find(c => c.id === staffId);
                                                if (staff) {
                                                    setCurrentStaffInvolvement({
                                                        ...currentStaffInvolvement,
                                                        staffId: staff.id,
                                                        staffName: staff.name
                                                    });
                                                }
                                            }}
                                            className="w-full h-9 text-sm px-3 rounded"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'white'
                                            }}
                                        >
                                            <option value="">Select Staff...</option>
                                            <optgroup label="Associated with Incident Report">
                                                {getStaffAssociatedWithIncident().map(staff => (
                                                    <option key={staff.id} value={staff.id}>
                                                        {staff.name}
                                                    </option>
                                                ))}
                                            </optgroup>
                                            <optgroup label="All Staff">
                                                {constituents.filter(c => c.type === "Staff").map(staff => (
                                                    <option key={staff.id} value={staff.id}>
                                                        {staff.name}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        </select>
                                    </div>

                                    {/* Involvement */}
                                    <div>
                                        <label 
                                            className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Involvement <span className="text-red-600">*</span>
                                        </label>
                                        <select
                                            value={currentStaffInvolvement.involvement}
                                            onChange={(e) => setCurrentStaffInvolvement({ ...currentStaffInvolvement, involvement: e.target.value })}
                                            className="w-full h-9 text-sm px-3 rounded"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'white'
                                            }}
                                        >
                                            <option value="">Select Involvement...</option>
                                            {INVOLVEMENT_TYPES.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddingStaffInvolvement(false);
                                        setEditingStaffInvolvementId(null);
                                    }}
                                    className="h-8 px-3 text-xs"
                                    style={{ borderRadius: '9999px' }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSaveStaffInvolvement}
                                    style={{
                                        backgroundColor: 'var(--color-brand-primary)',
                                        color: 'white',
                                        borderRadius: '9999px'
                                    }}
                                    className="h-8 px-3 text-xs"
                                >
                                    Save
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Youth > Youth Injuries Tab */}
                    {activeTab.startsWith("injuries-") && (
                        <Card 
                            className="shadow-sm"
                            style={{
                                backgroundColor: 'var(--slds-g-color-background-base)',
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                borderRadius: 'var(--slds-c-card-radius-border)'
                            }}
                        >
                            <CardHeader style={{ borderBottom: '1px solid #e0e5ee', paddingTop: '12px', paddingBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                <CardTitle 
                                    className="text-base font-semibold"
                                    style={{ color: 'var(--slds-g-color-text-default)', fontSize: '0.8rem', margin: 0, lineHeight: 1.2, display: 'flex', alignItems: 'center' }}
                                >
                                    Youth - Youth Injuries
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Youth Header Section */}
                                <div className="pt-4">
                                    <div 
                                        className="rounded-lg p-4"
                                        style={{ 
                                            backgroundColor: 'var(--slds-g-color-background-alt)',
                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Youth Information */}
                                            <div className="flex-1 grid grid-cols-3 gap-4">
                                                <div>
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Youth Name
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.name}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Age
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.age}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Program
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.program}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Role
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.role}
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Residency Date Range
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.residencyDateRange}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Youth Injuries Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 
                                            className="text-sm font-semibold"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Youth Injuries
                                        </h3>
                                        {injuriesSectionStatus === "in-progress" && (
                                            <Button
                                                size="sm"
                                                onClick={handleAddInjury}
                                                style={{
                                                    backgroundColor: 'var(--color-brand-primary)',
                                                    color: 'white',
                                                    borderRadius: '9999px'
                                                }}
                                                className="h-8 px-3 text-xs"
                                            >
                                                <Plus className="h-3.5 w-3.5 mr-1.5" />
                                                Add Injury
                                            </Button>
                                        )}
                                    </div>

                                    {/* Youth Injuries Table */}
                                    {injuries.length > 0 ? (
                                        <div 
                                            className="border rounded overflow-hidden"
                                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                        >
                                            <table className="w-full">
                                                <thead style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                    <tr>
                                                        <th 
                                                            className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Description
                                                        </th>
                                                        <th 
                                                            className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            How did Injury Occur?
                                                        </th>
                                                        <th 
                                                            className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Result of Restraint
                                                        </th>
                                                        <th 
                                                            className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            First Aid Administered?
                                                        </th>
                                                        {injuriesSectionStatus === "in-progress" && (
                                                            <th 
                                                                className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide"
                                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                            >
                                                                Actions
                                                            </th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {injuries.map((injury) => (
                                                        <tr 
                                                            key={injury.id}
                                                            className="border-t"
                                                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                                        >
                                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {injury.description}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {injury.howDidInjuryOccur}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {injury.resultOfRestraint || "—"}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                {injury.firstAidAdministered || "—"}
                                                            </td>
                                                            {injuriesSectionStatus === "in-progress" && (
                                                                <td className="px-4 py-3 text-right">
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        <button
                                                                            onClick={() => handleEditInjury(injury)}
                                                                            className="p-1 rounded hover:bg-gray-100"
                                                                            title="Edit"
                                                                        >
                                                                            <Edit2 className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteInjury(injury.id)}
                                                                            className="p-1 rounded hover:bg-gray-100"
                                                                            title="Delete"
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div 
                                            className="text-center py-8 text-sm rounded"
                                            style={{ 
                                                color: 'var(--slds-g-color-text-weak)',
                                                backgroundColor: 'var(--slds-g-color-background-alt)',
                                                border: '1px solid var(--slds-g-color-border-base-1)'
                                            }}
                                        >
                                            No injuries recorded yet. Click "Add Injury" to add one.
                                        </div>
                                    )}
                                </div>

                                {/* Section Actions */}
                                <div 
                                    className="flex items-center justify-end gap-2 pt-4"
                                    style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}
                                >
                                    {injuriesSectionStatus === "in-progress" ? (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => navigate('/incident-reports')}
                                                className="h-8 px-3 text-xs"
                                                style={{ borderRadius: '9999px' }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleSaveYouthInjuries}
                                                style={{
                                                    backgroundColor: 'var(--color-brand-primary)',
                                                    color: 'white',
                                                    borderRadius: '9999px'
                                                }}
                                                className="h-8 px-3 text-xs"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleCompleteYouthInjuries}
                                                style={{
                                                    backgroundColor: 'var(--color-brand-primary)',
                                                    color: 'white',
                                                    borderRadius: '9999px'
                                                }}
                                                className="h-8 px-3 text-xs"
                                            >
                                                Complete Section
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={handleReopenYouthInjuries}
                                            style={{
                                                backgroundColor: 'var(--color-brand-primary)',
                                                color: 'white',
                                                borderRadius: '9999px'
                                            }}
                                            className="h-8 px-3 text-xs"
                                        >
                                            Re-Open Section
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Injury Modal */}
                    <Dialog open={isAddingInjury} onOpenChange={setIsAddingInjury}>
                        <DialogContent aria-describedby={undefined} className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingInjuryId ? "Edit Injury" : "Add Injury"}</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <div className="space-y-4">
                                    {/* Injury Sustained as a Result of Restraint */}
                                    <div>
                                        <label 
                                            className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Injury sustained as a result of restraint
                                        </label>
                                        <select
                                            value={currentInjury.resultOfRestraint}
                                            onChange={(e) => setCurrentInjury({ ...currentInjury, resultOfRestraint: e.target.value })}
                                            className="w-full h-9 text-sm px-3 rounded"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'white'
                                            }}
                                        >
                                            <option value=""></option>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                        </select>
                                    </div>

                                    {/* Description of Injury */}
                                    <div>
                                        <label 
                                            className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Description of Injury <span className="text-red-600">*</span>
                                        </label>
                                        <textarea
                                            value={currentInjury.description}
                                            onChange={(e) => setCurrentInjury({ ...currentInjury, description: e.target.value })}
                                            placeholder="Enter injury description..."
                                            rows={4}
                                            className="w-full px-3 py-2 text-sm rounded resize-none"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'white'
                                            }}
                                        />
                                    </div>

                                    {/* How Did Injury Occur? */}
                                    <div>
                                        <label 
                                            className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            How did Injury Occur? <span className="text-red-600">*</span>
                                        </label>
                                        <textarea
                                            value={currentInjury.howDidInjuryOccur}
                                            onChange={(e) => setCurrentInjury({ ...currentInjury, howDidInjuryOccur: e.target.value })}
                                            placeholder="Describe how the injury occurred..."
                                            rows={4}
                                            className="w-full px-3 py-2 text-sm rounded resize-none"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'white'
                                            }}
                                        />
                                    </div>

                                    {/* Was first aid administered by staff? */}
                                    <div>
                                        <label 
                                            className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Was first aid administered by staff?
                                        </label>
                                        <select
                                            value={currentInjury.firstAidAdministered}
                                            onChange={(e) => setCurrentInjury({ ...currentInjury, firstAidAdministered: e.target.value })}
                                            className="w-full h-9 text-sm px-3 rounded"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'white'
                                            }}
                                        >
                                            <option value="">Select...</option>
                                            <option value="Yes">Yes</option>
                                            <option value="Refused">Refused</option>
                                            <option value="Unnecessary">Unnecessary</option>
                                        </select>
                                    </div>

                                    {/* Was professional medical treatment provided? */}
                                    <div>
                                        <label 
                                            className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Was professional medical treatment provided?
                                        </label>
                                        <select
                                            value={currentInjury.professionalMedicalTreatment}
                                            onChange={(e) => setCurrentInjury({ ...currentInjury, professionalMedicalTreatment: e.target.value })}
                                            className="w-full h-9 text-sm px-3 rounded"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'white'
                                            }}
                                        >
                                            <option value="">Select...</option>
                                            <option value="Yes">Yes</option>
                                            <option value="Refused">Refused</option>
                                            <option value="Unnecessary">Unnecessary</option>
                                        </select>
                                    </div>

                                    {/* Further medical follow-up required */}
                                    <div>
                                        <label 
                                            className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Further medical follow-up required
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    checked={currentInjury.furtherMedicalFollowUp === false}
                                                    onChange={() => setCurrentInjury({ ...currentInjury, furtherMedicalFollowUp: false, medicalFollowUpDescription: "" })}
                                                    className="h-4 w-4"
                                                    style={{ accentColor: 'var(--color-brand-primary)' }}
                                                />
                                                <span className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>No</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    checked={currentInjury.furtherMedicalFollowUp === true}
                                                    onChange={() => setCurrentInjury({ ...currentInjury, furtherMedicalFollowUp: true })}
                                                    className="h-4 w-4"
                                                    style={{ accentColor: 'var(--color-brand-primary)' }}
                                                />
                                                <span className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>Yes</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Description of Medical Follow-Up Needed - Conditional */}
                                    {currentInjury.furtherMedicalFollowUp && (
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Description of Medical Follow-Up Needed <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={currentInjury.medicalFollowUpDescription}
                                                onChange={(e) => setCurrentInjury({ ...currentInjury, medicalFollowUpDescription: e.target.value })}
                                                placeholder="Describe medical follow-up needed..."
                                                rows={3}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: 'white'
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Comments */}
                                    <div>
                                        <label 
                                            className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Comments
                                        </label>
                                        <textarea
                                            value={currentInjury.comments}
                                            onChange={(e) => setCurrentInjury({ ...currentInjury, comments: e.target.value })}
                                            placeholder="Enter any additional comments..."
                                            rows={3}
                                            className="w-full px-3 py-2 text-sm rounded resize-none"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'white'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddingInjury(false);
                                        setEditingInjuryId(null);
                                    }}
                                    className="h-8 px-3 text-xs"
                                    style={{ borderRadius: '9999px' }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSaveInjury}
                                    style={{
                                        backgroundColor: 'var(--color-brand-primary)',
                                        color: 'white',
                                        borderRadius: '9999px'
                                    }}
                                    className="h-8 px-3 text-xs"
                                >
                                    Save
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Load Overview Modal */}
                    <Dialog open={showLoadOverviewModal} onOpenChange={setShowLoadOverviewModal}>
                        <DialogContent aria-describedby={undefined}>
                            <DialogHeader>
                                <DialogTitle>Load Overview</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <label 
                                    className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                >
                                    Select Source
                                </label>
                                <select
                                    value={loadOverviewSource}
                                    onChange={(e) => setLoadOverviewSource(e.target.value)}
                                    className="w-full h-9 text-sm px-3 rounded"
                                    style={{
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <option value="">Select...</option>
                                    <option value="overview-details">Overview &gt; Details &gt; Overview</option>
                                    <option value="youth-general">Youth X &gt; General &gt; Overview</option>
                                </select>
                            </div>
                            <DialogFooter>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowLoadOverviewModal(false)}
                                    className="h-8 px-3 text-xs"
                                    style={{ borderRadius: '9999px' }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleLoadOverview}
                                    disabled={!loadOverviewSource}
                                    style={{
                                        backgroundColor: 'var(--color-brand-primary)',
                                        color: 'white',
                                        borderRadius: '9999px'
                                    }}
                                    className="h-8 px-3 text-xs"
                                >
                                    Load
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Youth > Response Tab */}
                    {activeTab.startsWith("response-") && (
                        <Card 
                            className="shadow-sm"
                            style={{
                                backgroundColor: 'var(--slds-g-color-background-base)',
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                borderRadius: 'var(--slds-c-card-radius-border)'
                            }}
                        >
                            <CardHeader style={{ borderBottom: '1px solid #e0e5ee', paddingTop: '12px', paddingBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                <CardTitle 
                                    className="text-base font-semibold"
                                    style={{ color: 'var(--slds-g-color-text-default)', fontSize: '0.8rem', margin: 0, lineHeight: 1.2, display: 'flex', alignItems: 'center' }}
                                >
                                    Youth - Response
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Youth Header Section */}
                                <div className="pt-4">
                                    <div 
                                        className="rounded-lg p-4"
                                        style={{ 
                                            backgroundColor: 'var(--slds-g-color-background-alt)',
                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Youth Initials Icon */}
                                            
                                            
                                            {/* Youth Information */}
                                            <div className="flex-1 grid grid-cols-3 gap-4">
                                                <div>
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Youth Name
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.name}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Age
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.age}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Program
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.program}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Role
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.role}
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Residency Date Range
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.residencyDateRange}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Confidentiality Notice */}
                                <div>
                                    <div 
                                        className="rounded-lg p-3 flex items-start gap-3"
                                        style={{ 
                                            backgroundColor: 'rgba(255, 193, 7, 0.1)',
                                            border: '1px solid rgba(255, 193, 7, 0.3)'
                                        }}
                                    >
                                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#ff8f00' }} />
                                        <div>
                                            <p className="text-sm font-semibold mb-1" style={{ color: '#e65100' }}>
                                                Confidentiality Notice
                                            </p>
                                            <p className="text-sm" style={{ color: '#e65100' }}>
                                                To maintain confidentiality, narrative can only contain Youth initials.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Response Instructions */}
                                <div 
                                    className="rounded-lg p-4"
                                    style={{ 
                                        backgroundColor: 'rgba(232, 244, 248, 0.6)',
                                        border: '1px solid rgba(84, 105, 141, 0.2)'
                                    }}
                                >
                                    <h4 
                                        className="text-sm font-semibold mb-3"
                                        style={{ color: 'var(--slds-g-color-text-default)' }}
                                    >
                                        Response Instructions
                                    </h4>
                                    <div className="text-sm space-y-2" style={{ color: '#54698D' }}>
                                        <p className="text-[14px]">
                                            <strong>This tab should be completed for all incidents, immediately after they occur.</strong> Enter narrative describing the response and follow‑up to the incident. This includes interventions put in place as a result of the incident, processing that occurred, adjustments to the youth's treatment that might be beneficial, or any repairs that need to be facilitated.
                                        </p>
                                        <p>
                                            The Narrative should be written in third person.
                                        </p>
                                        <p className="text-[15px] text-[14px]">
                                            The first mention of Staff should include full name and title; subsequent mentions should only be first name.
                                        </p>
                                        <p className="text-[15px] text-[14px]">
                                            The primary Youth should be referenced by first name. Additional Youth should be referenced by first and last initials.
                                        </p>
                                        <p className="text-[15px] text-[14px]">
                                            Do not use 'this writer' or 'this reporter' when referring to yourself.
                                        </p>
                                    </div>
                                </div>

                                {/* Detailed Response Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label 
                                            className="text-sm font-semibold"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Detailed Response <span className="text-red-600">*</span>
                                        </label>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setShowLoadResponseModal(true)}
                                            disabled={responseSectionStatus === "complete"}
                                            className="h-8 px-3 text-xs gap-1.5"
                                            style={{ borderRadius: '9999px' }}
                                        >
                                            <Upload className="h-3.5 w-3.5" />
                                            Load Response
                                        </Button>
                                    </div>
                                    <textarea
                                        value={youthResponse}
                                        onChange={(e) => setYouthResponse(e.target.value)}
                                        disabled={responseSectionStatus === "complete"}
                                        placeholder="Enter detailed response to the incident..."
                                        rows={12}
                                        className="w-full px-3 py-2 text-sm rounded resize-none"
                                        style={{
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            backgroundColor: responseSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                            lineHeight: '1.6'
                                        }}
                                    />
                                </div>

                                {/* Section Actions */}
                                <div 
                                    className="flex items-center justify-end gap-2 pt-4"
                                    style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}
                                >
                                    {responseSectionStatus === "in-progress" ? (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => navigate('/incident-reports')}
                                                className="h-8 px-3 text-xs"
                                                style={{ borderRadius: '9999px' }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleSaveYouthResponse}
                                                style={{
                                                    backgroundColor: 'var(--color-brand-primary)',
                                                    color: 'white',
                                                    borderRadius: '9999px'
                                                }}
                                                className="h-8 px-3 text-xs"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleCompleteYouthResponse}
                                                style={{
                                                    backgroundColor: 'var(--color-brand-primary)',
                                                    color: 'white',
                                                    borderRadius: '9999px'
                                                }}
                                                className="h-8 px-3 text-xs"
                                            >
                                                Complete Section
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={handleReopenYouthResponse}
                                            style={{
                                                backgroundColor: 'var(--color-brand-primary)',
                                                color: 'white',
                                                borderRadius: '9999px'
                                            }}
                                            className="h-8 px-3 text-xs"
                                        >
                                            Re-Open Section
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Youth > Debrief Tab */}
                    {activeTab.startsWith("debrief-") && (
                        <Card 
                            className="shadow-sm"
                            style={{
                                backgroundColor: 'var(--slds-g-color-background-base)',
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                borderRadius: 'var(--slds-c-card-radius-border)'
                            }}
                        >
                            <CardHeader style={{ borderBottom: '1px solid #e0e5ee', paddingTop: '12px', paddingBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                <CardTitle
                                    className="text-base font-semibold"
                                    style={{ color: 'var(--slds-g-color-text-default)', fontSize: '0.8rem', margin: 0, lineHeight: 1.2, display: 'flex', alignItems: 'center' }}
                                >
                                    Youth - Debrief
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Youth Header Section */}
                                <div className="pt-4">
                                    <div
                                        className="rounded-lg p-4"
                                        style={{
                                            backgroundColor: 'var(--slds-g-color-background-alt)',
                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Youth Initials Icon */}
                                            <div
                                                className="flex items-center justify-center rounded-full flex-shrink-0"
                                                style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    backgroundColor: 'var(--color-brand-primary)',
                                                    color: 'white',
                                                    fontSize: '18px',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {(() => {
                                                    const nameParts = currentYouth.name.split(' ');
                                                    const initials = nameParts.length >= 2
                                                        ? `${nameParts[0][0]}${nameParts[1][0]}`
                                                        : nameParts[0][0];
                                                    return initials.toUpperCase();
                                                })()}
                                            </div>
                                            {/* Youth Information */}
                                            <div className="flex-1 grid grid-cols-3 gap-4">
                                                <div>
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Youth Name
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.name}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Age
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.age}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Program
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.program}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Role
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.role}
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <div 
                                                        className="text-xs font-medium uppercase tracking-wide mb-1"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        Residency Date Range
                                                    </div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {currentYouth.residencyDateRange}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Debrief Instructions */}
                                <div 
                                    className="rounded-lg p-4"
                                    style={{ 
                                        backgroundColor: 'rgba(232, 244, 248, 0.6)',
                                        border: '1px solid rgba(84, 105, 141, 0.2)'
                                    }}
                                >
                                    <h4 
                                        className="text-sm font-semibold mb-3"
                                        style={{ color: 'var(--slds-g-color-text-default)' }}
                                    >
                                        Debrief Instructions
                                    </h4>
                                    <div className="text-sm space-y-2" style={{ color: '#54698D' }}>
                                        <p>
                                            <strong>If a restraint occurred, you are required to complete this tab after a period of time for reflection.</strong> Otherwise, please discuss with your Manager or Director to determine if you should complete this tab.
                                        </p>
                                        <p>
                                            The Narrative should be written in third person. The first mention of Staff should include full name and title; subsequent mentions should only be first name. The primary Youth should be referenced by first name. Additional Youth should be referenced by first and last initials. Do not use 'this writer' or 'this reporter' when referring to yourself.
                                        </p>
                                        <p className="font-semibold mt-3">
                                            The COPING Model – reconnect, debrief for learning, repair the harm, reintegrate into the community
                                        </p>
                                        <ul className="space-y-1 ml-4">
                                            <li><strong>CONTROL</strong> – Get Calm. Youth and Staff are regulated</li>
                                            <li><strong>ORIENT</strong> – What happened? Listen and share perspectives/facts</li>
                                            <li><strong>PATTERNS</strong> – Get Curious. Chase the "Why?"</li>
                                            <li><strong>INVESTIGATE</strong> – Brainstorm. Youth and Staff changes or resources</li>
                                            <li><strong>NEGOTIATE</strong> – Plan. You and staff agree to try new things</li>
                                            <li><strong>GIVE</strong> – Build skill. Praise effort, promote growth and accountability.</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Debrief Participants Section */}
                                <div>
                                    <h3 
                                        className="text-sm font-semibold mb-4"
                                        style={{ color: 'var(--slds-g-color-text-default)' }}
                                    >
                                        Debrief Participants
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Staff Involved in Youth Debrief */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label 
                                                    className="text-xs font-medium uppercase tracking-wide"
                                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                >
                                                    Staff Involved in Youth Debrief
                                                </label>
                                                {debriefSectionStatus === "in-progress" && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOpenAddParticipant("youth")}
                                                        style={{
                                                            backgroundColor: 'var(--color-brand-primary)',
                                                            color: 'white',
                                                            borderRadius: '9999px'
                                                        }}
                                                        className="h-7 px-2 text-xs"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        Add
                                                    </Button>
                                                )}
                                            </div>
                                            {youthDebriefStaff.length > 0 ? (
                                                <div 
                                                    className="border rounded p-3"
                                                    style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                                >
                                                    <div className="flex flex-wrap gap-2">
                                                        {youthDebriefStaff.map(participant => (
                                                            <div 
                                                                key={participant.id}
                                                                className="flex items-center gap-2 px-3 py-1.5 rounded text-sm"
                                                                style={{ 
                                                                    backgroundColor: 'var(--slds-g-color-background-alt)',
                                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                                }}
                                                            >
                                                                <span style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {participant.staffName}
                                                                </span>
                                                                {debriefSectionStatus === "in-progress" && (
                                                                    <button
                                                                        onClick={() => handleRemoveDebriefParticipant(participant.id, "youth")}
                                                                        className="hover:opacity-70"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div 
                                                    className="text-center py-4 text-sm rounded"
                                                    style={{ 
                                                        color: 'var(--slds-g-color-text-weak)',
                                                        backgroundColor: 'var(--slds-g-color-background-alt)',
                                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                                    }}
                                                >
                                                    No participants added yet
                                                </div>
                                            )}
                                        </div>

                                        {/* Staff Involved in Parent/Guardian Debrief */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label 
                                                    className="text-xs font-medium uppercase tracking-wide"
                                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                >
                                                    Staff Involved in Parent/Guardian Debrief
                                                </label>
                                                {debriefSectionStatus === "in-progress" && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOpenAddParticipant("parent")}
                                                        style={{
                                                            backgroundColor: 'var(--color-brand-primary)',
                                                            color: 'white',
                                                            borderRadius: '9999px'
                                                        }}
                                                        className="h-7 px-2 text-xs"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        Add
                                                    </Button>
                                                )}
                                            </div>
                                            {parentDebriefStaff.length > 0 ? (
                                                <div 
                                                    className="border rounded p-3"
                                                    style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                                >
                                                    <div className="flex flex-wrap gap-2">
                                                        {parentDebriefStaff.map(participant => (
                                                            <div 
                                                                key={participant.id}
                                                                className="flex items-center gap-2 px-3 py-1.5 rounded text-sm"
                                                                style={{ 
                                                                    backgroundColor: 'var(--slds-g-color-background-alt)',
                                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                                }}
                                                            >
                                                                <span style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {participant.staffName}
                                                                </span>
                                                                {debriefSectionStatus === "in-progress" && (
                                                                    <button
                                                                        onClick={() => handleRemoveDebriefParticipant(participant.id, "parent")}
                                                                        className="hover:opacity-70"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div 
                                                    className="text-center py-4 text-sm rounded"
                                                    style={{ 
                                                        color: 'var(--slds-g-color-text-weak)',
                                                        backgroundColor: 'var(--slds-g-color-background-alt)',
                                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                                    }}
                                                >
                                                    No participants added yet
                                                </div>
                                            )}
                                        </div>

                                        {/* Staff Involved in Team Debrief */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label 
                                                    className="text-xs font-medium uppercase tracking-wide"
                                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                >
                                                    Staff Involved in Team Debrief
                                                </label>
                                                {debriefSectionStatus === "in-progress" && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOpenAddParticipant("team")}
                                                        style={{
                                                            backgroundColor: 'var(--color-brand-primary)',
                                                            color: 'white',
                                                            borderRadius: '9999px'
                                                        }}
                                                        className="h-7 px-2 text-xs"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        Add
                                                    </Button>
                                                )}
                                            </div>
                                            {teamDebriefStaff.length > 0 ? (
                                                <div 
                                                    className="border rounded p-3"
                                                    style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                                >
                                                    <div className="flex flex-wrap gap-2">
                                                        {teamDebriefStaff.map(participant => (
                                                            <div 
                                                                key={participant.id}
                                                                className="flex items-center gap-2 px-3 py-1.5 rounded text-sm"
                                                                style={{ 
                                                                    backgroundColor: 'var(--slds-g-color-background-alt)',
                                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                                }}
                                                            >
                                                                <span style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {participant.staffName}
                                                                </span>
                                                                {debriefSectionStatus === "in-progress" && (
                                                                    <button
                                                                        onClick={() => handleRemoveDebriefParticipant(participant.id, "team")}
                                                                        className="hover:opacity-70"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div 
                                                    className="text-center py-4 text-sm rounded"
                                                    style={{ 
                                                        color: 'var(--slds-g-color-text-weak)',
                                                        backgroundColor: 'var(--slds-g-color-background-alt)',
                                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                                    }}
                                                >
                                                    No participants added yet
                                                </div>
                                            )}
                                        </div>

                                        {/* Staff and/or Witnesses Unable to Participate */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label 
                                                    className="text-xs font-medium uppercase tracking-wide"
                                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                >
                                                    Staff and/or Witnesses Unable to Participate
                                                </label>
                                                {debriefSectionStatus === "in-progress" && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOpenAddParticipant("unable")}
                                                        style={{
                                                            backgroundColor: 'var(--color-brand-primary)',
                                                            color: 'white',
                                                            borderRadius: '9999px'
                                                        }}
                                                        className="h-7 px-2 text-xs"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        Add
                                                    </Button>
                                                )}
                                            </div>
                                            {unableToParticipate.length > 0 ? (
                                                <div 
                                                    className="border rounded p-3"
                                                    style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                                >
                                                    <div className="flex flex-wrap gap-2">
                                                        {unableToParticipate.map(participant => (
                                                            <div 
                                                                key={participant.id}
                                                                className="flex items-center gap-2 px-3 py-1.5 rounded text-sm"
                                                                style={{ 
                                                                    backgroundColor: 'var(--slds-g-color-background-alt)',
                                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                                }}
                                                            >
                                                                <span style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                    {participant.staffName}
                                                                </span>
                                                                {debriefSectionStatus === "in-progress" && (
                                                                    <button
                                                                        onClick={() => handleRemoveDebriefParticipant(participant.id, "unable")}
                                                                        className="hover:opacity-70"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div 
                                                    className="text-center py-4 text-sm rounded"
                                                    style={{ 
                                                        color: 'var(--slds-g-color-text-weak)',
                                                        backgroundColor: 'var(--slds-g-color-background-alt)',
                                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                                    }}
                                                >
                                                    No participants added yet
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Youth Witness / Milieu Processing */}
                                <div>
                                    <label
                                        className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                    >
                                        Is there a plan for youth witness/milieu processing? <span className="text-red-600">*</span>
                                    </label>
                                    <select
                                        value={youthWitnessProcessing}
                                        onChange={(e) => setYouthWitnessProcessing(e.target.value)}
                                        disabled={debriefSectionStatus === "complete"}
                                        className="w-full h-9 text-sm px-3 rounded"
                                        style={{
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white'
                                        }}
                                    >
                                        <option value="">Select...</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No/Not Indicated">No/Not Indicated</option>
                                    </select>
                                </div>

                                {/* Debrief Reflections Section */}
                                <div>
                                    <h3 
                                        className="text-sm font-semibold mb-4"
                                        style={{ color: 'var(--slds-g-color-text-default)' }}
                                    >
                                        Debrief Reflections
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Precipitating factors */}
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Precipitating factors, warning signs, and preventative staff responses <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={precipitatingFactors}
                                                onChange={(e) => setPrecipitatingFactors(e.target.value)}
                                                disabled={debriefSectionStatus === "complete"}
                                                placeholder="Enter precipitating factors..."
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>

                                        {/* De-escalation techniques */}
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Identify de‑escalation techniques and regulation strategies used during the crisis and/or physical intervention to help you regain self-control <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={deEscalationTechniques}
                                                onChange={(e) => setDeEscalationTechniques(e.target.value)}
                                                disabled={debriefSectionStatus === "complete"}
                                                placeholder="Enter de-escalation techniques..."
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>

                                        {/* Pros of Intervention */}
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Pros of Intervention <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={prosOfIntervention}
                                                onChange={(e) => setProsOfIntervention(e.target.value)}
                                                disabled={debriefSectionStatus === "complete"}
                                                placeholder="Enter pros of intervention..."
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>

                                        {/* Cons of Intervention */}
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Cons of Intervention <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={consOfIntervention}
                                                onChange={(e) => setConsOfIntervention(e.target.value)}
                                                disabled={debriefSectionStatus === "complete"}
                                                placeholder="Enter cons of intervention..."
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>

                                        {/* Teamwork Successes */}
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Teamwork Successes <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={teamworkSuccesses}
                                                onChange={(e) => setTeamworkSuccesses(e.target.value)}
                                                disabled={debriefSectionStatus === "complete"}
                                                placeholder="Enter teamwork successes..."
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>

                                        {/* Teamwork Concerns */}
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Teamwork Concerns <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={teamworkConcerns}
                                                onChange={(e) => setTeamworkConcerns(e.target.value)}
                                                disabled={debriefSectionStatus === "complete"}
                                                placeholder="Enter teamwork concerns..."
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>

                                        {/* General Input from Youth Processing */}
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                General Input and Needs from Youth Processing <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={youthProcessingInput}
                                                onChange={(e) => setYouthProcessingInput(e.target.value)}
                                                disabled={debriefSectionStatus === "complete"}
                                                placeholder="Enter general input and needs from youth processing..."
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>

                                        {/* General Input from Parent/Guardian Processing */}
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                General Input and Needs from Parent/Guardian Processing <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={parentProcessingInput}
                                                onChange={(e) => setParentProcessingInput(e.target.value)}
                                                disabled={debriefSectionStatus === "complete"}
                                                placeholder="Enter general input and needs from parent/guardian processing..."
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>

                                        {/* Staff Team Changes */}
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Staff Team Changes <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={staffTeamChanges}
                                                onChange={(e) => setStaffTeamChanges(e.target.value)}
                                                disabled={debriefSectionStatus === "complete"}
                                                placeholder="Enter staff team changes..."
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>

                                        {/* Youth Team Changes */}
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Youth Team Changes <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={youthTeamChanges}
                                                onChange={(e) => setYouthTeamChanges(e.target.value)}
                                                disabled={debriefSectionStatus === "complete"}
                                                placeholder="Enter youth team changes..."
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>

                                        {/* Reflection on responses */}
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Reflect on responses that were or will be implemented for this youth <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                value={responsesReflection}
                                                onChange={(e) => setResponsesReflection(e.target.value)}
                                                disabled={debriefSectionStatus === "complete"}
                                                placeholder="Enter reflection on responses..."
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded resize-none"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: debriefSectionStatus === "complete" ? 'var(--slds-g-color-background-alt)' : 'white',
                                                    lineHeight: '1.6'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section Actions */}
                                <div 
                                    className="flex items-center justify-end gap-2 pt-4"
                                    style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}
                                >
                                    {debriefSectionStatus === "in-progress" ? (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => navigate('/incident-reports')}
                                                className="h-8 px-3 text-xs"
                                                style={{ borderRadius: '9999px' }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleSaveYouthDebrief}
                                                style={{
                                                    backgroundColor: 'var(--color-brand-primary)',
                                                    color: 'white',
                                                    borderRadius: '9999px'
                                                }}
                                                className="h-8 px-3 text-xs"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleCompleteYouthDebrief}
                                                style={{
                                                    backgroundColor: 'var(--color-brand-primary)',
                                                    color: 'white',
                                                    borderRadius: '9999px'
                                                }}
                                                className="h-8 px-3 text-xs"
                                            >
                                                Complete Section
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={handleReopenYouthDebrief}
                                            style={{
                                                backgroundColor: 'var(--color-brand-primary)',
                                                color: 'white',
                                                borderRadius: '9999px'
                                            }}
                                            className="h-8 px-3 text-xs"
                                        >
                                            Re-Open Section
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* AC1-2: Youth > Substance Use Tab */}
                    {activeTab.startsWith("substance-use-") && (() => {
                        const youthId = activeTab.replace("substance-use-", "");
                        const currentYouth = individuals.find(ind => ind.id === youthId && ind.constituentType === "Youth");
                        
                        if (!currentYouth) return null;
                        
                        return (
                            <Card 
                                className="shadow-sm"
                                style={{
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                    borderRadius: 'var(--slds-c-card-radius-border)'
                                }}
                            >
                                <CardHeader style={{ borderBottom: '1px solid #e0e5ee', paddingTop: '12px', paddingBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                    <CardTitle 
                                        className="text-base font-semibold"
                                        style={{ color: 'var(--slds-g-color-text-default)', fontSize: '0.8rem', margin: 0, lineHeight: 1.2, display: 'flex', alignItems: 'center' }}
                                    >
                                        Youth - Substance Use
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* AC3-5: Youth Header Section */}
                                    <div className="pt-4">
                                        <div 
                                            className="rounded-lg p-4"
                                            style={{ 
                                                backgroundColor: 'var(--slds-g-color-background-alt)',
                                                border: '1px solid var(--slds-g-color-border-base-1)'
                                            }}
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* AC4: Youth Information - All fields read-only (AC5) */}
                                                <div className="flex-1 grid grid-cols-3 gap-4">
                                                    <div>
                                                        <div 
                                                            className="text-xs font-medium uppercase tracking-wide mb-1"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Youth Name
                                                        </div>
                                                        <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {currentYouth.constituentName}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div 
                                                            className="text-xs font-medium uppercase tracking-wide mb-1"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Age
                                                        </div>
                                                        <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            16
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div 
                                                            className="text-xs font-medium uppercase tracking-wide mb-1"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Program
                                                        </div>
                                                        <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {currentYouth.program}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div 
                                                            className="text-xs font-medium uppercase tracking-wide mb-1"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Role
                                                        </div>
                                                        <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            {currentYouth.incidentRole}
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <div 
                                                            className="text-xs font-medium uppercase tracking-wide mb-1"
                                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                        >
                                                            Residency Date Range
                                                        </div>
                                                        <div className="text-sm font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            01/15/2024 - Present
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Substance Use Disclosures Section */}
                                    <div 
                                        className="rounded-lg p-4 space-y-4"
                                        style={{ 
                                            backgroundColor: 'var(--slds-g-color-background-alt-2)',
                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                        }}
                                    >
                                        <h3 
                                            className="text-sm font-semibold"
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Substance Use Disclosures
                                        </h3>

                                        {/* AC6-9: Youth Self-Disclosure */}
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Did the youth self-disclose Substance Use?
                                            </label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="selfDisclosed"
                                                        value="Yes"
                                                        checked={selfDisclosedSubstanceUse === "Yes"}
                                                        onChange={(e) => setSelfDisclosedSubstanceUse(e.target.value)}
                                                        disabled={substanceUseSectionStatus === "complete"}
                                                        className="h-4 w-4"
                                                        style={{ accentColor: '#145F33' }}
                                                    />
                                                    <span className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        Yes
                                                    </span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="selfDisclosed"
                                                        value="No"
                                                        checked={selfDisclosedSubstanceUse === "No"}
                                                        onChange={(e) => setSelfDisclosedSubstanceUse(e.target.value)}
                                                        disabled={substanceUseSectionStatus === "complete"}
                                                        className="h-4 w-4"
                                                        style={{ accentColor: '#145F33' }}
                                                    />
                                                    <span className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        No
                                                    </span>
                                                </label>
                                            </div>

                                            {/* AC7-8: Conditional Display for Yes */}
                                            {selfDisclosedSubstanceUse === "Yes" && (
                                                <div className="mt-3 space-y-3">
                                                    {/* AC7: Instructional Text */}
                                                    <div 
                                                        className="text-sm p-3 rounded"
                                                        style={{ 
                                                            backgroundColor: 'rgba(232, 244, 248, 0.6)',
                                                            border: '1px solid rgba(84, 105, 141, 0.2)',
                                                            color: 'var(--slds-g-color-text-default)'
                                                        }}
                                                    >
                                                        Please verify this is disclosed in the constituent's profile at 'Substance Use &gt; Disclosure'.
                                                    </div>

                                                    {/* AC8-9: Disclosure Button */}
                                                    {substanceUseSectionStatus === "in-progress" && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => toast.info("Opening Substance Use > Disclosure modal (handled in separate user story)")}
                                                            style={{
                                                                backgroundColor: 'var(--color-brand-primary)',
                                                                color: 'white',
                                                                borderRadius: '9999px'
                                                            }}
                                                            className="h-8 px-3 text-xs"
                                                        >
                                                            Disclosure
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* AC10-13: Substance Use Test Administration */}
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Was a substance use test administered?
                                            </label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="testAdministered"
                                                        value="Yes"
                                                        checked={substanceTestAdministered === "Yes"}
                                                        onChange={(e) => setSubstanceTestAdministered(e.target.value)}
                                                        disabled={substanceUseSectionStatus === "complete"}
                                                        className="h-4 w-4"
                                                        style={{ accentColor: '#145F33' }}
                                                    />
                                                    <span className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        Yes
                                                    </span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="testAdministered"
                                                        value="No"
                                                        checked={substanceTestAdministered === "No"}
                                                        onChange={(e) => setSubstanceTestAdministered(e.target.value)}
                                                        disabled={substanceUseSectionStatus === "complete"}
                                                        className="h-4 w-4"
                                                        style={{ accentColor: '#145F33' }}
                                                    />
                                                    <span className="text-sm" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        No
                                                    </span>
                                                </label>
                                            </div>

                                            {/* AC11: Conditional Instructional Text */}
                                            {substanceTestAdministered === "Yes" && (
                                                <div 
                                                    className="mt-3 text-sm p-3 rounded"
                                                    style={{ 
                                                        backgroundColor: 'rgba(232, 244, 248, 0.6)',
                                                        border: '1px solid rgba(84, 105, 141, 0.2)',
                                                        color: 'var(--slds-g-color-text-default)'
                                                    }}
                                                >
                                                    A Substance Use test must be administered and added to the Related Substance Use Tests grid before this tab can be completed.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* AC12-19: Related Substance Use Tests Section - Only show if test administered = Yes */}
                                    {substanceTestAdministered === "Yes" && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 
                                                    className="text-sm font-semibold"
                                                    style={{ color: 'var(--slds-g-color-text-default)' }}
                                                >
                                                    Related Substance Use Tests
                                                </h3>
                                                {/* AC15: Add capability */}
                                                {substanceUseSectionStatus === "in-progress" && (
                                                    <Button
                                                        size="sm"
                                                        onClick={handleAddSubstanceTest}
                                                        style={{
                                                            backgroundColor: 'var(--color-brand-primary)',
                                                            color: 'white',
                                                            borderRadius: '9999px'
                                                        }}
                                                        className="h-7 px-2 text-xs"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        Add Test
                                                    </Button>
                                                )}
                                            </div>

                                            {/* AC14: Table with specified columns */}
                                            {relatedSubstanceTests.length > 0 ? (
                                                <div 
                                                    className="border rounded overflow-hidden"
                                                    style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                                >
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                                <th 
                                                                    className="text-left px-4 py-2 text-xs font-medium uppercase tracking-wide"
                                                                    style={{ 
                                                                        color: 'var(--slds-g-color-text-weak)',
                                                                        borderBottom: '1px solid var(--slds-g-color-border-base-1)'
                                                                    }}
                                                                >
                                                                    Date / Time
                                                                </th>
                                                                <th 
                                                                    className="text-left px-4 py-2 text-xs font-medium uppercase tracking-wide"
                                                                    style={{ 
                                                                        color: 'var(--slds-g-color-text-weak)',
                                                                        borderBottom: '1px solid var(--slds-g-color-border-base-1)'
                                                                    }}
                                                                >
                                                                    Reason
                                                                </th>
                                                                <th 
                                                                    className="text-left px-4 py-2 text-xs font-medium uppercase tracking-wide"
                                                                    style={{ 
                                                                        color: 'var(--slds-g-color-text-weak)',
                                                                        borderBottom: '1px solid var(--slds-g-color-border-base-1)'
                                                                    }}
                                                                >
                                                                    New Use
                                                                </th>
                                                                <th 
                                                                    className="text-left px-4 py-2 text-xs font-medium uppercase tracking-wide"
                                                                    style={{ 
                                                                        color: 'var(--slds-g-color-text-weak)',
                                                                        borderBottom: '1px solid var(--slds-g-color-border-base-1)'
                                                                    }}
                                                                >
                                                                    Results
                                                                </th>
                                                                {substanceUseSectionStatus === "in-progress" && (
                                                                    <th 
                                                                        className="text-left px-4 py-2 text-xs font-medium uppercase tracking-wide"
                                                                        style={{ 
                                                                            color: 'var(--slds-g-color-text-weak)',
                                                                            borderBottom: '1px solid var(--slds-g-color-border-base-1)'
                                                                        }}
                                                                    >
                                                                        Actions
                                                                    </th>
                                                                )}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {relatedSubstanceTests.map((test) => (
                                                                <tr 
                                                                    key={test.id}
                                                                    style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                                                                >
                                                                    <td className="px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                        {test.dateTime}
                                                                    </td>
                                                                    <td className="px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                        {test.reason}
                                                                    </td>
                                                                    <td className="px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                        {test.newUse}
                                                                    </td>
                                                                    <td className="px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                                        {test.results}
                                                                    </td>
                                                                    {/* AC16-17: Edit and Remove capabilities */}
                                                                    {substanceUseSectionStatus === "in-progress" && (
                                                                        <td className="px-4 py-3">
                                                                            <div className="flex items-center gap-2">
                                                                                <button
                                                                                    onClick={() => handleEditSubstanceTest(test.id)}
                                                                                    className="hover:opacity-70"
                                                                                    title="Edit"
                                                                                >
                                                                                    <Edit2 className="h-4 w-4" style={{ color: '#145F33' }} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleRemoveSubstanceTest(test.id)}
                                                                                    className="hover:opacity-70"
                                                                                    title="Remove"
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" style={{ color: '#DC2626' }} />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    )}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div 
                                                    className="text-center py-6 text-sm rounded"
                                                    style={{ 
                                                        color: 'var(--slds-g-color-text-weak)',
                                                        backgroundColor: 'var(--slds-g-color-background-alt)',
                                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                                    }}
                                                >
                                                    No substance use tests added yet
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* AC21-29: Section Actions */}
                                    <div 
                                        className="flex items-center justify-end gap-2 pt-4"
                                        style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}
                                    >
                                        {substanceUseSectionStatus === "in-progress" ? (
                                            <>
                                                {/* AC21: Cancel */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => navigate('/incident-reports')}
                                                    className="h-8 px-3 text-xs"
                                                    style={{ borderRadius: '9999px' }}
                                                >
                                                    Cancel
                                                </Button>
                                                {/* AC21-23: Save */}
                                                <Button
                                                    size="sm"
                                                    onClick={handleSaveYouthSubstanceUse}
                                                    style={{
                                                        backgroundColor: 'var(--color-brand-primary)',
                                                        color: 'white',
                                                        borderRadius: '9999px'
                                                    }}
                                                    className="h-8 px-3 text-xs"
                                                >
                                                    Save
                                                </Button>
                                                {/* AC21, AC24-25: Complete Section */}
                                                <Button
                                                    size="sm"
                                                    onClick={handleCompleteYouthSubstanceUse}
                                                    style={{
                                                        backgroundColor: 'var(--color-brand-primary)',
                                                        color: 'white',
                                                        borderRadius: '9999px'
                                                    }}
                                                    className="h-8 px-3 text-xs"
                                                >
                                                    Complete Section
                                                </Button>
                                            </>
                                        ) : (
                                            /* AC26-29: Re-Open Section */
                                            <Button
                                                size="sm"
                                                onClick={handleReopenYouthSubstanceUse}
                                                style={{
                                                    backgroundColor: 'var(--color-brand-primary)',
                                                    color: 'white',
                                                    borderRadius: '9999px'
                                                }}
                                                className="h-8 px-3 text-xs"
                                            >
                                                Re-Open Section
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })()}

                    {/* Add Debrief Participant Modal */}
                    <Dialog open={isAddingDebriefParticipant} onOpenChange={setIsAddingDebriefParticipant}>
                        <DialogContent aria-describedby={undefined} className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>{getParticipantModalTitle()}</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <label 
                                    className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                >
                                    Select Staff <span className="text-red-600">*</span>
                                </label>
                                <select
                                    value={selectedStaffForDebrief}
                                    onChange={(e) => setSelectedStaffForDebrief(e.target.value)}
                                    className="w-full h-9 text-sm px-3 rounded"
                                    style={{
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <option value="">Select Staff...</option>
                                    <optgroup label="Associated with Incident Report">
                                        {getStaffForDebriefPiclist().associatedStaff.map(staff => (
                                            <option key={staff.id} value={staff.id}>
                                                {staff.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="All Staff">
                                        {getStaffForDebriefPiclist().allStaff.map(staff => (
                                            <option key={staff.id} value={staff.id}>
                                                {staff.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>
                            <DialogFooter>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddingDebriefParticipant(false);
                                        setSelectedStaffForDebrief("");
                                        setCurrentParticipantType(null);
                                    }}
                                    className="h-8 px-3 text-xs"
                                    style={{ borderRadius: '9999px' }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleAddDebriefParticipant}
                                    disabled={!selectedStaffForDebrief}
                                    style={{
                                        backgroundColor: 'var(--color-brand-primary)',
                                        color: 'white',
                                        borderRadius: '9999px'
                                    }}
                                    className="h-8 px-3 text-xs"
                                >
                                    Add
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Load Response Modal */}
                    <Dialog open={showLoadResponseModal} onOpenChange={setShowLoadResponseModal}>
                        <DialogContent aria-describedby={undefined}>
                            <DialogHeader>
                                <DialogTitle>Load Response</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <label 
                                    className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                >
                                    Select Source
                                </label>
                                <select
                                    value={loadResponseSource}
                                    onChange={(e) => setLoadResponseSource(e.target.value)}
                                    className="w-full h-9 text-sm px-3 rounded"
                                    style={{
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <option value="">Select...</option>
                                    <option value="youth-response">Youth X &gt; Response</option>
                                </select>
                            </div>
                            <DialogFooter>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowLoadResponseModal(false)}
                                    className="h-8 px-3 text-xs"
                                    style={{ borderRadius: '9999px' }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleLoadResponse}
                                    disabled={!loadResponseSource}
                                    style={{
                                        backgroundColor: 'var(--color-brand-primary)',
                                        color: 'white',
                                        borderRadius: '9999px'
                                    }}
                                    className="h-8 px-3 text-xs"
                                >
                                    Load
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Load Narrative Modal */}
                    <Dialog open={showLoadNarrativeModal} onOpenChange={setShowLoadNarrativeModal}>
                        <DialogContent aria-describedby={undefined}>
                            <DialogHeader>
                                <DialogTitle>Load Narrative</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <label 
                                    className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                >
                                    Select Source
                                </label>
                                <select
                                    value={loadNarrativeSource}
                                    onChange={(e) => setLoadNarrativeSource(e.target.value)}
                                    className="w-full h-9 text-sm px-3 rounded"
                                    style={{
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <option value="">Select...</option>
                                    <option value="youth-general">Youth X &gt; General &gt; Overview</option>
                                    <option value="youth-narrative">Youth X &gt; Narrative</option>
                                </select>
                            </div>
                            <DialogFooter>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowLoadNarrativeModal(false)}
                                    className="h-8 px-3 text-xs"
                                    style={{ borderRadius: '9999px' }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleLoadNarrative}
                                    disabled={!loadNarrativeSource}
                                    style={{
                                        backgroundColor: 'var(--color-brand-primary)',
                                        color: 'white',
                                        borderRadius: '9999px'
                                    }}
                                    className="h-8 px-3 text-xs"
                                >
                                    Load
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Add/Edit Person Contacted Modal */}
                    <Dialog open={isAddingPersonContacted} onOpenChange={setIsAddingPersonContacted}>
                        <DialogContent aria-describedby={undefined} className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{editingPersonContactedId ? "Edit Person Contacted" : "Add Person Contacted"}</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <div className="space-y-4">
                                    {/* Constituent */}
                                    <div>
                                        <label 
                                            className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Constituent <span className="text-red-600">*</span>
                                        </label>
                                        <select
                                            value={currentPersonContacted.constituentId || ""}
                                            onChange={(e) => {
                                                const constituentId = parseInt(e.target.value);
                                                const constituent = constituents.find(c => c.id === constituentId);
                                                if (constituent) {
                                                    setCurrentPersonContacted({
                                                        ...currentPersonContacted,
                                                        constituentId: constituent.id,
                                                        constituentName: constituent.name
                                                    });
                                                }
                                            }}
                                            className="w-full h-9 text-sm px-3 rounded"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'white'
                                            }}
                                        >
                                            <option value="">Select Constituent...</option>
                                            {constituents.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="mt-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 px-3 text-xs"
                                                style={{ borderRadius: '9999px' }}
                                                onClick={() => setIsAddingConstituent(true)}
                                            >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Add Constituent
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Youth */}
                                    <div>
                                        <label 
                                            className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Youth
                                        </label>
                                        <select
                                            value={currentPersonContacted.youthId || ""}
                                            onChange={(e) => {
                                                const youthId = parseInt(e.target.value);
                                                const youth = getYouthInvolved().find(y => y.constituentId === youthId);
                                                if (youth) {
                                                    // Auto-populate relationship when youth is selected
                                                    setCurrentPersonContacted({
                                                        ...currentPersonContacted,
                                                        youthId: youth.constituentId,
                                                        youthName: youth.constituentName,
                                                        relationship: currentPersonContacted.relationship || "Guardian" // Auto-populate with default
                                                    });
                                                }
                                            }}
                                            className="w-full h-9 text-sm px-3 rounded"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'white'
                                            }}
                                        >
                                            <option value="">Select Youth...</option>
                                            {getYouthInvolved().map(youth => (
                                                <option key={youth.constituentId} value={youth.constituentId}>
                                                    {youth.constituentName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Relationship */}
                                    <div>
                                        <label 
                                            className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Relationship
                                        </label>
                                        <select
                                            value={currentPersonContacted.relationship}
                                            onChange={(e) => setCurrentPersonContacted({ ...currentPersonContacted, relationship: e.target.value })}
                                            className="w-full h-9 text-sm px-3 rounded"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'white'
                                            }}
                                        >
                                            <option value="">Select Relationship...</option>
                                            {RELATIONSHIPS.map(rel => (
                                                <option key={rel} value={rel}>{rel}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Contact Date/Time */}
                                    <div>
                                        <label 
                                            className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Contact Date/Time <span className="text-red-600">*</span>
                                        </label>
                                        <Input
                                            type="datetime-local"
                                            value={currentPersonContacted.contactDateTime}
                                            onChange={(e) => setCurrentPersonContacted({ ...currentPersonContacted, contactDateTime: e.target.value })}
                                            className="h-9 text-sm"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                        />
                                    </div>

                                    {/* Comment */}
                                    <div>
                                        <label 
                                            className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Comment
                                        </label>
                                        <textarea
                                            value={currentPersonContacted.comment}
                                            onChange={(e) => setCurrentPersonContacted({ ...currentPersonContacted, comment: e.target.value })}
                                            placeholder="Enter comments..."
                                            rows={4}
                                            className="w-full px-3 py-2 text-sm rounded resize-none"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'white'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddingPersonContacted(false);
                                        setEditingPersonContactedId(null);
                                    }}
                                    className="h-8 px-3 text-xs"
                                    style={{ borderRadius: '9999px' }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSavePersonContacted}
                                    disabled={!currentPersonContacted.constituentName || !currentPersonContacted.contactDateTime}
                                    style={{
                                        backgroundColor: 'var(--color-brand-primary)',
                                        color: 'white',
                                        borderRadius: '9999px'
                                    }}
                                    className="h-8 px-3 text-xs"
                                >
                                    Save
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Add Constituent Modal */}
                    <Dialog open={isAddingConstituent} onOpenChange={setIsAddingConstituent}>
                        <DialogContent aria-describedby={undefined} className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Add Constituent</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <div className="space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label 
                                            className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Name <span className="text-red-600">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            value={newConstituent.name}
                                            onChange={(e) => setNewConstituent({ ...newConstituent, name: e.target.value })}
                                            placeholder="Last, First"
                                            className="h-9 text-sm"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                                        />
                                    </div>

                                    {/* Type */}
                                    <div>
                                        <label 
                                            className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                            style={{ color: 'var(--slds-g-color-text-weak)' }}
                                        >
                                            Type <span className="text-red-600">*</span>
                                        </label>
                                        <select
                                            value={newConstituent.type}
                                            onChange={(e) => setNewConstituent({ ...newConstituent, type: e.target.value, program: "" })}
                                            className="w-full h-9 text-sm px-3 rounded"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: 'white'
                                            }}
                                        >
                                            <option value="">Select Type...</option>
                                            {CONSTITUENT_TYPES.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Program (only if type is Youth) */}
                                    {newConstituent.type === "Youth" && (
                                        <div>
                                            <label 
                                                className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                            >
                                                Program <span className="text-red-600">*</span>
                                            </label>
                                            <select
                                                value={newConstituent.program}
                                                onChange={(e) => setNewConstituent({ ...newConstituent, program: e.target.value })}
                                                className="w-full h-9 text-sm px-3 rounded"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: 'white'
                                                }}
                                            >
                                                <option value="">Select Program...</option>
                                                {PROGRAMS.map(program => (
                                                    <option key={program} value={program}>{program}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelAddConstituent}
                                    className="h-8 px-3 text-xs"
                                    style={{ borderRadius: '9999px' }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleAddConstituent}
                                    disabled={!newConstituent.name || !newConstituent.type || (newConstituent.type === "Youth" && !newConstituent.program)}
                                    style={{
                                        backgroundColor: 'var(--color-brand-primary)',
                                        color: 'white',
                                        borderRadius: '9999px'
                                    }}
                                    className="h-8 px-3 text-xs"
                                >
                                    Add
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* AC18-19: Add/Edit Substance Use Test Modal */}
                    <Dialog open={isAddingSubstanceTest} onOpenChange={setIsAddingSubstanceTest}>
                        <DialogContent aria-describedby={undefined} className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingSubstanceTestId ? "Edit Substance Use Test" : "Add Substance Use Test"}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <div 
                                    className="rounded-lg p-3 mb-4 text-sm"
                                    style={{ 
                                        backgroundColor: 'rgba(232, 244, 248, 0.6)',
                                        border: '1px solid rgba(84, 105, 141, 0.2)',
                                        color: 'var(--slds-g-color-text-default)'
                                    }}
                                >
                                    <p className="font-medium mb-1">Modal displays:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-2">
                                        <li>All Substance Use Tests associated with the Youth's profile</li>
                                        <li>Option to register a new test (handled in separate user story)</li>
                                    </ul>
                                </div>

                                <div 
                                    className="text-center py-12 rounded"
                                    style={{ 
                                        backgroundColor: 'var(--slds-g-color-background-alt)',
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        color: 'var(--slds-g-color-text-weak)'
                                    }}
                                >
                                    <p className="text-sm">
                                        Substance Use Test selection and registration functionality<br />
                                        will be implemented in a separate user story.
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddingSubstanceTest(false);
                                        setEditingSubstanceTestId(null);
                                    }}
                                    className="h-8 px-3 text-xs"
                                    style={{ borderRadius: '9999px' }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        // Mock: Add a sample test
                                        const newTest = {
                                            id: Date.now().toString(),
                                            dateTime: "04/22/2025 10:30 AM",
                                            reason: "Random Test",
                                            newUse: "No",
                                            results: "Negative"
                                        };
                                        setRelatedSubstanceTests([...relatedSubstanceTests, newTest]);
                                        setIsAddingSubstanceTest(false);
                                        toast.success("Substance use test added");
                                    }}
                                    style={{
                                        backgroundColor: 'var(--color-brand-primary)',
                                        color: 'white',
                                        borderRadius: '9999px'
                                    }}
                                    className="h-8 px-3 text-xs"
                                >
                                    Add Test (Mock)
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
    </>
  );
}
