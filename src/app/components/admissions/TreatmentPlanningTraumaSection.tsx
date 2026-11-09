import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
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
import { ChevronRight, Plus, User, Users, Building2, Phone, Mail, CheckSquare, Upload, AlertTriangle, Clock, MapPin, CheckCircle, Pencil, Trash2, ChevronDown, FileText, ChevronUp, Check, X, ChevronLeft, Search, Filter, Calendar, Package, Tag, ClipboardList, ChevronsUpDown, Download, Eye, File, MoreVertical, Edit2 } from "@/app/lib/lucide-icons";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface TreatmentPlanningTraumaSectionProps {
  activeSubSection: any;
  commentsModalOpen: any;
  editCopingSkillData: any;
  editTraumaData: any;
  editingCopingSkillCommentId: any;
  editingTraumaId: any;
  expandedTraumaId: any;
  handleAddCopingSkillComment: any;
  handleAddDevStage: any;
  handleAddImpact: any;
  handleAddReporter: any;
  handleAddTrauma: any;
  handleAddTraumaCommentToRecord: any;
  handleCancelEditCopingSkill: any;
  handleCancelEditCopingSkillComment: any;
  handleCancelEditTrauma: any;
  handleDeleteCopingSkillComment: any;
  handleDeleteDevStage: any;
  handleDeleteImpact: any;
  handleDeleteReporter: any;
  handleDeleteTrauma: any;
  handleDeleteTraumaComment: any;
  handleEditCopingSkillComment: any;
  handleEditTrauma: any;
  handleSaveTrauma: any;
  handleUpdateCopingSkill: any;
  handleUpdateCopingSkillComment: any;
  newCopingSkillComment: any;
  newDevStage: any;
  newImpact: any;
  newReporter: any;
  newTrauma: any;
  newTraumaCommentData: any;
  setCommentsModalOpen: any;
  setEditCopingSkillData: any;
  setEditTraumaData: any;
  setExpandedTraumaId: any;
  setNewCopingSkillComment: any;
  setNewDevStage: any;
  setNewImpact: any;
  setNewReporter: any;
  setNewTrauma: any;
  setNewTraumaCommentData: any;
  setShowAddDevStage: any;
  setShowAddImpact: any;
  setShowAddReporter: any;
  setShowAddTrauma: any;
  setShowAddTraumaComment: any;
  showAddDevStage: any;
  showAddImpact: any;
  showAddReporter: any;
  showAddTrauma: any;
  showAddTraumaComment: any;
  showEditCopingSkillModal: any;
  traumaHistory: any;
  hiddenTabs: string[];
}

export function TreatmentPlanningTraumaSection({ activeSubSection, commentsModalOpen, editCopingSkillData, editTraumaData, editingCopingSkillCommentId, editingTraumaId, expandedTraumaId, handleAddCopingSkillComment, handleAddDevStage, handleAddImpact, handleAddReporter, handleAddTrauma, handleAddTraumaCommentToRecord, handleCancelEditCopingSkill, handleCancelEditCopingSkillComment, handleCancelEditTrauma, handleDeleteCopingSkillComment, handleDeleteDevStage, handleDeleteImpact, handleDeleteReporter, handleDeleteTrauma, handleDeleteTraumaComment, handleEditCopingSkillComment, handleEditTrauma, handleSaveTrauma, handleUpdateCopingSkill, handleUpdateCopingSkillComment, newCopingSkillComment, newDevStage, newImpact, newReporter, newTrauma, newTraumaCommentData, setCommentsModalOpen, setEditCopingSkillData, setEditTraumaData, setExpandedTraumaId, setNewCopingSkillComment, setNewDevStage, setNewImpact, setNewReporter, setNewTrauma, setNewTraumaCommentData, setShowAddDevStage, setShowAddImpact, setShowAddReporter, setShowAddTrauma, setShowAddTraumaComment, showAddDevStage, showAddImpact, showAddReporter, showAddTrauma, showAddTraumaComment, showEditCopingSkillModal, traumaHistory, hiddenTabs }: TreatmentPlanningTraumaSectionProps) {
  return (
    <>
                    {activeSubSection === "traumaHistory" && !hiddenTabs.includes("traumaHistory") && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[13px] font-semibold text-[#080707]">Trauma History</h3>
                                <Button
                                    onClick={() => setShowAddTrauma(!showAddTrauma)}
                                    className="h-8 px-3 rounded-full text-[13px]"
                                    style={{
                                        backgroundColor: '#145F33',
                                        color: 'white'
                                    }}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Trauma
                                </Button>
                            </div>

                            {/* Add Trauma Modal - COMPLETELY REDESIGNED */}
                            {showAddTrauma && (
                                <div
                                    className="fixed inset-0 flex items-center justify-center z-50"
                                    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                                    onClick={() => setShowAddTrauma(false)}
                                >
                                    <div
                                        className="rounded-lg max-w-6xl w-full mx-4"
                                        style={{
                                            backgroundColor: "#FFFFFF",
                                            border: "1px solid var(--slds-g-color-border-base-1)",
                                            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
                                            maxHeight: "90vh",
                                            overflow: "auto"
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {/* Modal Header */}
                                        <div
                                            className="px-6 py-4 flex items-start justify-between sticky top-0 bg-white z-10"
                                            style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
                                        >
                                            <h2 className="text-[16px] font-semibold text-[#080707]">Add Trauma History</h2>
                                            <button
                                                onClick={() => setShowAddTrauma(false)}
                                                className="text-[#706e6b] hover:text-[#080707]"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Modal Body */}
                                        <div className="px-6 py-4 space-y-4">
                                            {/* Row 1: Date Reported, Last ITP Inclusion */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">
                                                        Date Reported <span className="text-red-600">*</span>
                                                    </Label>
                                                    <DateInput
value={isoToMdy(newTrauma.dateReported)}
                                                        onChange={(v) => ((e) => setNewTrauma({...newTrauma, dateReported: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                        className="h-9 text-[13px] rounded"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                                        }}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">Last ITP Inclusion</Label>
                                                    <DateInput
value={isoToMdy(newTrauma.lastItpInclusion)}
                                                        onChange={(v) => ((e) => setNewTrauma({...newTrauma, lastItpInclusion: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                        className="h-9 text-[13px] rounded"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 2: Subject, Trauma Type */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">
                                                        Subject of Trauma <span className="text-red-600">*</span>
                                                    </Label>
                                                    <select
                                                        value={newTrauma.subject}
                                                        onChange={(e) => setNewTrauma({...newTrauma, subject: e.target.value})}
                                                        className="h-9 text-[13px] rounded w-full px-2.5"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)',
                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                        }}
                                                    >
                                                        <option value="">-- Select Subject --</option>
                                                        <option value="Youth">Youth</option>
                                                        <option value="Family">Family</option>
                                                        <option value="Caregiver">Caregiver</option>
                                                        <option value="Community">Community</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">
                                                        Trauma Type <span className="text-red-600">*</span>
                                                    </Label>
                                                    <select
                                                        value={newTrauma.traumaType}
                                                        onChange={(e) => setNewTrauma({...newTrauma, traumaType: e.target.value})}
                                                        className="h-9 text-[13px] rounded w-full px-2.5"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)',
                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                        }}
                                                    >
                                                        <option value="">-- Select Trauma Type --</option>
                                                        <option value="Physical Abuse">Physical Abuse</option>
                                                        <option value="Sexual Abuse">Sexual Abuse</option>
                                                        <option value="Neglect">Neglect</option>
                                                        <option value="Witness to Domestic Violence">Witness to Domestic Violence</option>
                                                        <option value="Witness to Community Violence">Witness to Community Violence</option>
                                                        <option value="Victim of Domestic Violence">Victim of Domestic Violence</option>
                                                        <option value="Victim of Community Violence">Victim of Community Violence</option>
                                                        <option value="Traumatic Loss">Traumatic Loss</option>
                                                        <option value="Incarceration of Parent or Caregiver">Incarceration of Parent or Caregiver</option>
                                                        <option value="Deportation of Parent or Caregiver">Deportation of Parent or Caregiver</option>
                                                        <option value="Other">Other</option>
                                                        <option value="Victim of Bullying">Victim of Bullying</option>
                                                        <option value="Victim of Peer Violence">Victim of Peer Violence</option>
                                                        <option value="Verbal Abuse">Verbal Abuse</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Row 3: Age of First Occurrence */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">
                                                        Age at First Occurrence <span className="text-red-600">*</span>
                                                    </Label>
                                                    <select
                                                        value={newTrauma.ageOfFirstOccurrence}
                                                        onChange={(e) => setNewTrauma({...newTrauma, ageOfFirstOccurrence: e.target.value})}
                                                        className="h-9 text-[13px] rounded w-full px-2.5"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)',
                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                        }}
                                                    >
                                                        <option value="">-- Select --</option>
                                                        <option value="Known Age">Known Age</option>
                                                        <option value="Pre-Natal">Pre-Natal</option>
                                                        <option value="Unknown Age">Unknown Age</option>
                                                    </select>
                                                </div>
                                                {newTrauma.ageOfFirstOccurrence === "Known Age" && (
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[11px] font-semibold text-[#080707]">Age (Years)</Label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="25"
                                                            value={newTrauma.knownAgeFirst}
                                                            onChange={(e) => setNewTrauma({...newTrauma, knownAgeFirst: e.target.value})}
                                                            className="h-9 text-[13px] rounded"
                                                            style={{
                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                            }}
                                                            placeholder="Enter age"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Row 4: Ongoing */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">
                                                        Ongoing <span className="text-red-600">*</span>
                                                    </Label>
                                                    <select
                                                        value={newTrauma.ongoing}
                                                        onChange={(e) => setNewTrauma({...newTrauma, ongoing: e.target.value})}
                                                        className="h-9 text-[13px] rounded w-full px-2.5"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)',
                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                        }}
                                                    >
                                                        <option value="">-- Select --</option>
                                                        <option value="Yes">Yes</option>
                                                        <option value="No">No</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Row 5: Age of Last Occurrence (conditional) */}
                                            {newTrauma.ongoing === "Yes" && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[11px] font-semibold text-[#080707]">
                                                            Age at Last Occurrence <span className="text-red-600">*</span>
                                                        </Label>
                                                        <select
                                                            value={newTrauma.ageOfLastOccurrence}
                                                            onChange={(e) => setNewTrauma({...newTrauma, ageOfLastOccurrence: e.target.value})}
                                                            className="h-9 text-[13px] rounded w-full px-2.5"
                                                            style={{
                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                borderColor: 'var(--slds-g-color-border-base-1)',
                                                                border: '1px solid var(--slds-g-color-border-base-1)'
                                                            }}
                                                        >
                                                            <option value="">-- Select --</option>
                                                            <option value="Known Age">Known Age</option>
                                                            <option value="Pre-Natal">Pre-Natal</option>
                                                            <option value="Unknown Age">Unknown Age</option>
                                                        </select>
                                                    </div>
                                                    {newTrauma.ageOfLastOccurrence === "Known Age" && (
                                                        <div className="space-y-1.5">
                                                            <Label className="text-[11px] font-semibold text-[#080707]">Age (Years)</Label>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                max="25"
                                                                value={newTrauma.knownAgeLast}
                                                                onChange={(e) => setNewTrauma({...newTrauma, knownAgeLast: e.target.value})}
                                                                className="h-9 text-[13px] rounded"
                                                                style={{
                                                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                                                }}
                                                                placeholder="Enter age"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Description */}
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-semibold text-[#080707]">
                                                    Description <span className="text-red-600">*</span>
                                                </Label>
                                                <Textarea
                                                    value={newTrauma.description}
                                                    onChange={(e) => setNewTrauma({...newTrauma, description: e.target.value})}
                                                    className="text-[13px] rounded min-h-[80px] resize-none"
                                                    style={{
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                    }}
                                                    placeholder="Enter detailed description"
                                                />
                                            </div>

                                            {/* DCFS Hotline Call Required */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">
                                                        DCFS Hotline Call Currently Required <span className="text-red-600">*</span>
                                                    </Label>
                                                    <select
                                                        value={newTrauma.dcfsHotlineRequired}
                                                        onChange={(e) => setNewTrauma({...newTrauma, dcfsHotlineRequired: e.target.value})}
                                                        className="h-9 text-[13px] rounded w-full px-2.5"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)',
                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                        }}
                                                    >
                                                        <option value="">-- Select --</option>
                                                        <option value="Yes">Yes</option>
                                                        <option value="No">No</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Comment */}
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-semibold text-[#080707]">Comment</Label>
                                                <Textarea
                                                    value={newTrauma.comment}
                                                    onChange={(e) => setNewTrauma({...newTrauma, comment: e.target.value})}
                                                    className="text-[13px] rounded min-h-[60px] resize-none"
                                                    style={{
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                    }}
                                                    placeholder="Enter additional comments"
                                                />
                                            </div>
                                        </div>

                                        {/* Modal Footer */}
                                        <div
                                            className="px-6 py-4 flex justify-end gap-2 sticky bottom-0 bg-white"
                                            style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}
                                        >
                                            <Button
                                                onClick={() => setShowAddTrauma(false)}
                                                className="h-9 px-4 rounded-full text-[13px] font-medium"
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    color: '#706e6b',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleAddTrauma}
                                                className="h-9 px-4 rounded-full text-[13px] font-medium"
                                                style={{
                                                    backgroundColor: '#145F33',
                                                    color: 'white'
                                                }}
                                                disabled={!newTrauma.dateReported || !newTrauma.subject || !newTrauma.traumaType || 
                                                    !newTrauma.ageOfFirstOccurrence || !newTrauma.ongoing || !newTrauma.description || 
                                                    !newTrauma.dcfsHotlineRequired || (newTrauma.ongoing === "Yes" && !newTrauma.ageOfLastOccurrence)}
                                            >
                                                Add Trauma
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Trauma History Table */}
                            <div 
                              className="rounded overflow-hidden"
                              style={{
                                border: '1px solid var(--slds-g-color-border-base-1)'
                              }}
                            >
                                <div className="overflow-x-auto">
                                    <table className="w-full text-[13px]">
                                        <thead>
                                            <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '3%' }}>
                                                </th>
                                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '10%' }}>
                                                    Date Reported
                                                </th>
                                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '12%' }}>
                                                    Subject
                                                </th>
                                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '18%' }}>
                                                    Trauma Type
                                                </th>
                                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '10%' }}>
                                                    Age First
                                                </th>
                                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '8%' }}>
                                                    Ongoing
                                                </th>
                                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '12%' }}>
                                                    DCFS Required
                                                </th>
                                                <th className="px-3 py-2 text-center font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '10%' }}>
                                                    Comments
                                                </th>
                                                <th className="px-3 py-2 text-right font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '7%' }}>
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {traumaHistory.map((trauma, index) => (
                                                <React.Fragment key={trauma.id}>
                                                    <tr 
                                                      key={`trauma-row-${trauma.id}`}
                                                      style={{ 
                                                        borderBottom: expandedTraumaId === trauma.id ? 'none' : (index < traumaHistory.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none'),
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        cursor: 'pointer'
                                                      }}
                                                      className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-3 py-3">
                                                            <button
                                                                onClick={() => setExpandedTraumaId(expandedTraumaId === trauma.id ? null : trauma.id)}
                                                                className="text-[#706e6b] hover:text-[#145F33]"
                                                            >
                                                                {expandedTraumaId === trauma.id ? (
                                                                    <ChevronDown className="w-4 h-4" />
                                                                ) : (
                                                                    <ChevronRight className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        </td>
                                                        <td className="px-3 py-3 text-[#080707]">
                                                            {trauma.dateReported}
                                                        </td>
                                                        <td className="px-3 py-3 text-[#080707]">
                                                            {trauma.subject}
                                                        </td>
                                                        <td className="px-3 py-3 text-[#080707]">
                                                            {trauma.traumaType}
                                                        </td>
                                                        <td className="px-3 py-3 text-[#080707]">
                                                            {trauma.ageOfFirstOccurrence === "Known Age" && trauma.knownAgeFirst 
                                                                ? `${trauma.knownAgeFirst} years` 
                                                                : trauma.ageOfFirstOccurrence}
                                                        </td>
                                                        <td className="px-3 py-3 text-[#080707]">
                                                            {trauma.ongoing}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {trauma.dcfsHotlineRequired === "Yes" ? (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: '#fef7e0', color: '#8a6116' }}>
                                                                    Yes
                                                                </span>
                                                            ) : (
                                                                <span className="text-[#080707]">No</span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3 text-center">
                                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-medium" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', color: '#080707' }}>
                                                                {trauma.comments?.length || 0}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditTrauma(trauma.id);
                                                                    }}
                                                                    className="text-[#0176d3] hover:text-[#014486] p-1"
                                                                    title="Edit"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteTrauma(trauma.id);
                                                                    }}
                                                                    className="text-[#c23934] hover:text-[#8a2a27] p-1"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {expandedTraumaId === trauma.id && (
                                                        <tr 
                                                          key={`trauma-details-${trauma.id}`}
                                                          style={{ 
                                                            borderBottom: index < traumaHistory.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                                            backgroundColor: 'var(--slds-g-color-background-alt)'
                                                          }}
                                                        >
                                                            <td colSpan={9} className="px-3 py-4">
                                                                <div className="space-y-4 pl-8">
                                                                    <div className="grid grid-cols-2 gap-6">
                                                                        <div>
                                                                            <div className="text-[11px] font-semibold text-[#706e6b] mb-1">DESCRIPTION</div>
                                                                            <div className="text-[13px] text-[#080707]">{trauma.description}</div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-[11px] font-semibold text-[#706e6b] mb-1">LAST ITP INCLUSION</div>
                                                                            <div className="text-[13px] text-[#080707]">{trauma.lastItpInclusion || 'N/A'}</div>
                                                                        </div>
                                                                    </div>
                                                                    {trauma.ongoing === "Yes" && trauma.ageOfLastOccurrence && (
                                                                        <div>
                                                                            <div className="text-[11px] font-semibold text-[#706e6b] mb-1">AGE AT LAST OCCURRENCE</div>
                                                                            <div className="text-[13px] text-[#080707]">
                                                                                {trauma.ageOfLastOccurrence === "Known Age" && trauma.knownAgeLast 
                                                                                    ? `${trauma.knownAgeLast} years` 
                                                                                    : trauma.ageOfLastOccurrence}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {trauma.comment && (
                                                                        <div>
                                                                            <div className="text-[11px] font-semibold text-[#706e6b] mb-1">COMMENT</div>
                                                                            <div className="text-[13px] text-[#080707]">{trauma.comment}</div>
                                                                        </div>
                                                                    )}
                                                                    {trauma.developmentStagesImpacted && trauma.developmentStagesImpacted.length > 0 && (
                                                                        <div>
                                                                            <div className="text-[11px] font-semibold text-[#706e6b] mb-2">DEVELOPMENT STAGES IMPACTED</div>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {trauma.developmentStagesImpacted.map((stage: any) => (
                                                                                    <span key={stage.id} className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium" style={{ backgroundColor: '#e8f4f8', color: '#014486' }}>
                                                                                        {stage.stage}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {trauma.impactOnYouth && trauma.impactOnYouth.length > 0 && (
                                                                        <div>
                                                                            <div className="text-[11px] font-semibold text-[#706e6b] mb-2">IMPACT ON YOUTH</div>
                                                                            <div className="space-y-2">
                                                                                {trauma.impactOnYouth.map((impact: any) => (
                                                                                    <div key={impact.id} className="flex gap-3 text-[12px]">
                                                                                        <span className="font-semibold text-[#706e6b] min-w-[80px]">{impact.date}:</span>
                                                                                        <span className="text-[#080707]">{impact.description}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {trauma.reportedBy && trauma.reportedBy.length > 0 && (
                                                                        <div>
                                                                            <div className="text-[11px] font-semibold text-[#706e6b] mb-2">REPORTED BY</div>
                                                                            <div className="space-y-1.5">
                                                                                {trauma.reportedBy.map((reporter: any) => (
                                                                                    <div key={reporter.id} className="text-[12px] text-[#080707]">
                                                                                        <span className="font-semibold">{reporter.name}</span> - {reporter.relationship}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {/* Edit Trauma Modal */}
                            {editingTraumaId !== null && (
                                <div
                                    className="fixed inset-0 flex items-center justify-center z-50"
                                    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                                    onClick={handleCancelEditTrauma}
                                >
                                    <div
                                        className="rounded-lg max-w-7xl w-full mx-4"
                                        style={{
                                            backgroundColor: "#FFFFFF",
                                            border: "1px solid var(--slds-g-color-border-base-1)",
                                            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
                                            maxHeight: "90vh",
                                            overflow: "auto"
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {/* Modal Header */}
                                        <div
                                            className="px-6 py-4 flex items-start justify-between sticky top-0 bg-white z-10"
                                            style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
                                        >
                                            <h2 className="text-[16px] font-semibold text-[#080707]">Edit Trauma History</h2>
                                            <button
                                                onClick={handleCancelEditTrauma}
                                                className="text-[#706e6b] hover:text-[#080707]"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Modal Body */}
                                        <div className="px-6 py-4 space-y-5">
                                            {/* Row 1: Date Reported, Last ITP Inclusion */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">
                                                        Date Reported <span className="text-red-600">*</span>
                                                    </Label>
                                                    <DateInput
value={isoToMdy(editTraumaData.dateReported)}
                                                        onChange={(v) => ((e) => setEditTraumaData({...editTraumaData, dateReported: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                        className="h-9 text-[13px] rounded"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                                        }}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">Last ITP Inclusion</Label>
                                                    <DateInput
value={isoToMdy(editTraumaData.lastItpInclusion)}
                                                        onChange={(v) => ((e) => setEditTraumaData({...editTraumaData, lastItpInclusion: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                        className="h-9 text-[13px] rounded"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 2: Subject, Trauma Type */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">
                                                        Subject of Trauma <span className="text-red-600">*</span>
                                                    </Label>
                                                    <select
                                                        value={editTraumaData.subject}
                                                        onChange={(e) => setEditTraumaData({...editTraumaData, subject: e.target.value})}
                                                        className="h-9 text-[13px] rounded w-full px-2.5"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)',
                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                        }}
                                                    >
                                                        <option value="">-- Select Subject --</option>
                                                        <option value="Youth">Youth</option>
                                                        <option value="Family">Family</option>
                                                        <option value="Caregiver">Caregiver</option>
                                                        <option value="Community">Community</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">
                                                        Trauma Type <span className="text-red-600">*</span>
                                                    </Label>
                                                    <select
                                                        value={editTraumaData.traumaType}
                                                        onChange={(e) => setEditTraumaData({...editTraumaData, traumaType: e.target.value})}
                                                        className="h-9 text-[13px] rounded w-full px-2.5"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)',
                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                        }}
                                                    >
                                                        <option value="">-- Select Trauma Type --</option>
                                                        <option value="Physical Abuse">Physical Abuse</option>
                                                        <option value="Sexual Abuse">Sexual Abuse</option>
                                                        <option value="Neglect">Neglect</option>
                                                        <option value="Witness to Domestic Violence">Witness to Domestic Violence</option>
                                                        <option value="Witness to Community Violence">Witness to Community Violence</option>
                                                        <option value="Victim of Domestic Violence">Victim of Domestic Violence</option>
                                                        <option value="Victim of Community Violence">Victim of Community Violence</option>
                                                        <option value="Traumatic Loss">Traumatic Loss</option>
                                                        <option value="Incarceration of Parent or Caregiver">Incarceration of Parent or Caregiver</option>
                                                        <option value="Deportation of Parent or Caregiver">Deportation of Parent or Caregiver</option>
                                                        <option value="Other">Other</option>
                                                        <option value="Victim of Bullying">Victim of Bullying</option>
                                                        <option value="Victim of Peer Violence">Victim of Peer Violence</option>
                                                        <option value="Verbal Abuse">Verbal Abuse</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Row 3: Age of First Occurrence */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">
                                                        Age at First Occurrence <span className="text-red-600">*</span>
                                                    </Label>
                                                    <select
                                                        value={editTraumaData.ageOfFirstOccurrence}
                                                        onChange={(e) => setEditTraumaData({...editTraumaData, ageOfFirstOccurrence: e.target.value})}
                                                        className="h-9 text-[13px] rounded w-full px-2.5"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)',
                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                        }}
                                                    >
                                                        <option value="">-- Select --</option>
                                                        <option value="Known Age">Known Age</option>
                                                        <option value="Pre-Natal">Pre-Natal</option>
                                                        <option value="Unknown Age">Unknown Age</option>
                                                    </select>
                                                </div>
                                                {editTraumaData.ageOfFirstOccurrence === "Known Age" && (
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[11px] font-semibold text-[#080707]">Age (Years)</Label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="25"
                                                            value={editTraumaData.knownAgeFirst}
                                                            onChange={(e) => setEditTraumaData({...editTraumaData, knownAgeFirst: e.target.value})}
                                                            className="h-9 text-[13px] rounded"
                                                            style={{
                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                            }}
                                                            placeholder="Enter age"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Row 4: Ongoing */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">
                                                        Ongoing <span className="text-red-600">*</span>
                                                    </Label>
                                                    <select
                                                        value={editTraumaData.ongoing}
                                                        onChange={(e) => setEditTraumaData({...editTraumaData, ongoing: e.target.value})}
                                                        className="h-9 text-[13px] rounded w-full px-2.5"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)',
                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                        }}
                                                    >
                                                        <option value="">-- Select --</option>
                                                        <option value="Yes">Yes</option>
                                                        <option value="No">No</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Row 5: Age of Last Occurrence (conditional) */}
                                            {editTraumaData.ongoing === "Yes" && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[11px] font-semibold text-[#080707]">
                                                            Age at Last Occurrence <span className="text-red-600">*</span>
                                                        </Label>
                                                        <select
                                                            value={editTraumaData.ageOfLastOccurrence}
                                                            onChange={(e) => setEditTraumaData({...editTraumaData, ageOfLastOccurrence: e.target.value})}
                                                            className="h-9 text-[13px] rounded w-full px-2.5"
                                                            style={{
                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                borderColor: 'var(--slds-g-color-border-base-1)',
                                                                border: '1px solid var(--slds-g-color-border-base-1)'
                                                            }}
                                                        >
                                                            <option value="">-- Select --</option>
                                                            <option value="Known Age">Known Age</option>
                                                            <option value="Pre-Natal">Pre-Natal</option>
                                                            <option value="Unknown Age">Unknown Age</option>
                                                        </select>
                                                    </div>
                                                    {editTraumaData.ageOfLastOccurrence === "Known Age" && (
                                                        <div className="space-y-1.5">
                                                            <Label className="text-[11px] font-semibold text-[#080707]">Age (Years)</Label>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                max="25"
                                                                value={editTraumaData.knownAgeLast}
                                                                onChange={(e) => setEditTraumaData({...editTraumaData, knownAgeLast: e.target.value})}
                                                                className="h-9 text-[13px] rounded"
                                                                style={{
                                                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                                                }}
                                                                placeholder="Enter age"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Description */}
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-semibold text-[#080707]">
                                                    Description <span className="text-red-600">*</span>
                                                </Label>
                                                <Textarea
                                                    value={editTraumaData.description}
                                                    onChange={(e) => setEditTraumaData({...editTraumaData, description: e.target.value})}
                                                    className="text-[13px] rounded min-h-[80px] resize-none"
                                                    style={{
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                    }}
                                                    placeholder="Enter detailed description"
                                                />
                                            </div>

                                            {/* NESTED TABLES SECTION */}
                                            <div className="pt-4 space-y-5" style={{ borderTop: '2px solid var(--slds-g-color-border-base-1)' }}>
                                                
                                                {/* Development Stages Impacted Table */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-[13px] font-semibold text-[#080707]">Development Stages Impacted ({editTraumaData.developmentStagesImpacted.length})</h4>
                                                        <Button
                                                            onClick={() => setShowAddDevStage(!showAddDevStage)}
                                                            className="h-7 px-3 rounded-full text-[11px]"
                                                            style={{
                                                                backgroundColor: '#145F33',
                                                                color: 'white'
                                                            }}
                                                        >
                                                            <Plus className="w-3 h-3 mr-1" />
                                                            Add Stage
                                                        </Button>
                                                    </div>
                                                    
                                                    {showAddDevStage && (
                                                        <div className="mb-3 p-3 rounded" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <div className="space-y-2">
                                                                <Label className="text-[11px] font-semibold text-[#080707]">Select Development Stage</Label>
                                                                <select
                                                                    value={newDevStage}
                                                                    onChange={(e) => setNewDevStage(e.target.value)}
                                                                    className="h-9 text-[13px] rounded w-full px-2.5"
                                                                    style={{
                                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                                        borderColor: 'var(--slds-g-color-border-base-1)',
                                                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                                                    }}
                                                                >
                                                                    <option value="">-- Select Stage --</option>
                                                                    <option value="Intrauterine">Intrauterine</option>
                                                                    <option value="Prenatal (Birth - 2 Months)">Prenatal (Birth - 2 Months)</option>
                                                                    <option value="Infancy (3-12 Months)">Infancy (3-12 Months)</option>
                                                                    <option value="Early Childhood (1-3 Years)">Early Childhood (1-3 Years)</option>
                                                                    <option value="Childhood (4-10 Years)">Childhood (4-10 Years)</option>
                                                                    <option value="Adolescence (11-18 Years)">Adolescence (11-18 Years)</option>
                                                                    <option value="Young Adult (19-24 Years)">Young Adult (19-24 Years)</option>
                                                                    <option value="Adult (25+ Years)">Adult (25+ Years)</option>
                                                                    <option value="Ongoing">Ongoing</option>
                                                                    <option value="Unknown">Unknown</option>
                                                                </select>
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        onClick={() => {
                                                                            setShowAddDevStage(false);
                                                                            setNewDevStage("");
                                                                        }}
                                                                        className="h-7 px-3 rounded-full text-[11px]"
                                                                        style={{
                                                                            backgroundColor: 'transparent',
                                                                            color: '#706e6b',
                                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                                        }}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                    <Button
                                                                        onClick={handleAddDevStage}
                                                                        className="h-7 px-3 rounded-full text-[11px]"
                                                                        style={{
                                                                            backgroundColor: '#145F33',
                                                                            color: 'white'
                                                                        }}
                                                                        disabled={!newDevStage}
                                                                    >
                                                                        Add
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="rounded border" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                        {editTraumaData.developmentStagesImpacted.length > 0 ? (
                                                            <div className="divide-y" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                                {editTraumaData.developmentStagesImpacted.map((stage) => (
                                                                    <div key={stage.id} className="px-3 py-2 flex items-center justify-between hover:bg-gray-50">
                                                                        <span className="text-[13px] text-[#080707]">{stage.stage}</span>
                                                                        <button
                                                                            onClick={() => handleDeleteDevStage(stage.id)}
                                                                            className="text-[#c23934] hover:text-[#8a2a27] p-1"
                                                                            title="Delete"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="px-3 py-4 text-center text-[11px] text-[#706e6b] italic">
                                                                No development stages recorded. Click "Add Stage" to add.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Impact on Youth Table */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-[13px] font-semibold text-[#080707]">Impact on Youth ({editTraumaData.impactOnYouth.length})</h4>
                                                        <Button
                                                            onClick={() => setShowAddImpact(!showAddImpact)}
                                                            className="h-7 px-3 rounded-full text-[11px]"
                                                            style={{
                                                                backgroundColor: '#145F33',
                                                                color: 'white'
                                                            }}
                                                        >
                                                            <Plus className="w-3 h-3 mr-1" />
                                                            Add Impact
                                                        </Button>
                                                    </div>
                                                    
                                                    {showAddImpact && (
                                                        <div className="mb-3 p-3 rounded" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <div className="space-y-3">
                                                                <div className="grid grid-cols-4 gap-3">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[11px] font-semibold text-[#080707]">Date</Label>
                                                                        <DateInput
value={isoToMdy(newImpact.date)}
                                                                            onChange={(v) => ((e) => setNewImpact({...newImpact, date: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                                            className="h-9 text-[13px] rounded"
                                                                            style={{
                                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5 col-span-3">
                                                                        <Label className="text-[11px] font-semibold text-[#080707]">Description</Label>
                                                                        <Input
                                                                            value={newImpact.description}
                                                                            onChange={(e) => setNewImpact({...newImpact, description: e.target.value})}
                                                                            className="h-9 text-[13px] rounded"
                                                                            style={{
                                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                                            }}
                                                                            placeholder="Describe the impact"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        onClick={() => {
                                                                            setShowAddImpact(false);
                                                                            setNewImpact({ date: "", description: "" });
                                                                        }}
                                                                        className="h-7 px-3 rounded-full text-[11px]"
                                                                        style={{
                                                                            backgroundColor: 'transparent',
                                                                            color: '#706e6b',
                                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                                        }}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                    <Button
                                                                        onClick={handleAddImpact}
                                                                        className="h-7 px-3 rounded-full text-[11px]"
                                                                        style={{
                                                                            backgroundColor: '#145F33',
                                                                            color: 'white'
                                                                        }}
                                                                        disabled={!newImpact.date || !newImpact.description}
                                                                    >
                                                                        Add
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="rounded border" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                        {editTraumaData.impactOnYouth.length > 0 ? (
                                                            <table className="w-full text-[13px]">
                                                                <thead>
                                                                    <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                                        <th className="px-3 py-2 text-left font-semibold text-[#080707] text-[11px]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Date</th>
                                                                        <th className="px-3 py-2 text-left font-semibold text-[#080707] text-[11px]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Description</th>
                                                                        <th className="px-3 py-2 text-right font-semibold text-[#080707] text-[11px]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '60px' }}>Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {editTraumaData.impactOnYouth.map((impact) => (
                                                                        <tr key={impact.id} className="hover:bg-gray-50" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                            <td className="px-3 py-2 text-[#080707]">{impact.date}</td>
                                                                            <td className="px-3 py-2 text-[#080707]">{impact.description}</td>
                                                                            <td className="px-3 py-2 text-right">
                                                                                <button
                                                                                    onClick={() => handleDeleteImpact(impact.id)}
                                                                                    className="text-[#c23934] hover:text-[#8a2a27] p-1"
                                                                                    title="Delete"
                                                                                >
                                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        ) : (
                                                            <div className="px-3 py-4 text-center text-[11px] text-[#706e6b] italic">
                                                                No impacts recorded. Click "Add Impact" to add.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Reported By Table */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-[13px] font-semibold text-[#080707]">Reported By ({editTraumaData.reportedBy.length})</h4>
                                                        <Button
                                                            onClick={() => setShowAddReporter(!showAddReporter)}
                                                            className="h-7 px-3 rounded-full text-[11px]"
                                                            style={{
                                                                backgroundColor: '#145F33',
                                                                color: 'white'
                                                            }}
                                                        >
                                                            <Plus className="w-3 h-3 mr-1" />
                                                            Add Reporter
                                                        </Button>
                                                    </div>
                                                    
                                                    {showAddReporter && (
                                                        <div className="mb-3 p-3 rounded" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                            <div className="space-y-3">
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[11px] font-semibold text-[#080707]">Name</Label>
                                                                        <Input
                                                                            value={newReporter.name}
                                                                            onChange={(e) => setNewReporter({...newReporter, name: e.target.value})}
                                                                            className="h-9 text-[13px] rounded"
                                                                            style={{
                                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                                            }}
                                                                            placeholder="Enter name"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[11px] font-semibold text-[#080707]">Relationship to Youth</Label>
                                                                        <Input
                                                                            value={newReporter.relationship}
                                                                            onChange={(e) => setNewReporter({...newReporter, relationship: e.target.value})}
                                                                            className="h-9 text-[13px] rounded"
                                                                            style={{
                                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                                            }}
                                                                            placeholder="e.g., Teacher, Therapist"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        onClick={() => {
                                                                            setShowAddReporter(false);
                                                                            setNewReporter({ name: "", relationship: "" });
                                                                        }}
                                                                        className="h-7 px-3 rounded-full text-[11px]"
                                                                        style={{
                                                                            backgroundColor: 'transparent',
                                                                            color: '#706e6b',
                                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                                        }}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                    <Button
                                                                        onClick={handleAddReporter}
                                                                        className="h-7 px-3 rounded-full text-[11px]"
                                                                        style={{
                                                                            backgroundColor: '#145F33',
                                                                            color: 'white'
                                                                        }}
                                                                        disabled={!newReporter.name || !newReporter.relationship}
                                                                    >
                                                                        Add
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="rounded border" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                        {editTraumaData.reportedBy.length > 0 ? (
                                                            <table className="w-full text-[13px]">
                                                                <thead>
                                                                    <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                                        <th className="px-3 py-2 text-left font-semibold text-[#080707] text-[11px]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Name</th>
                                                                        <th className="px-3 py-2 text-left font-semibold text-[#080707] text-[11px]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Relationship to Youth</th>
                                                                        <th className="px-3 py-2 text-right font-semibold text-[#080707] text-[11px]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '60px' }}>Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {editTraumaData.reportedBy.map((reporter) => (
                                                                        <tr key={reporter.id} className="hover:bg-gray-50" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                            <td className="px-3 py-2 text-[#080707]">{reporter.name}</td>
                                                                            <td className="px-3 py-2 text-[#080707]">{reporter.relationship}</td>
                                                                            <td className="px-3 py-2 text-right">
                                                                                <button
                                                                                    onClick={() => handleDeleteReporter(reporter.id)}
                                                                                    className="text-[#c23934] hover:text-[#8a2a27] p-1"
                                                                                    title="Delete"
                                                                                >
                                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        ) : (
                                                            <div className="px-3 py-4 text-center text-[11px] text-[#706e6b] italic">
                                                                No reporters recorded. Click "Add Reporter" to add.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                            </div>

                                            {/* DCFS Hotline Call Required */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">
                                                        DCFS Hotline Call Currently Required <span className="text-red-600">*</span>
                                                    </Label>
                                                    <select
                                                        value={editTraumaData.dcfsHotlineRequired}
                                                        onChange={(e) => setEditTraumaData({...editTraumaData, dcfsHotlineRequired: e.target.value})}
                                                        className="h-9 text-[13px] rounded w-full px-2.5"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)',
                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                        }}
                                                    >
                                                        <option value="">-- Select --</option>
                                                        <option value="Yes">Yes</option>
                                                        <option value="No">No</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Comment */}
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-semibold text-[#080707]">Comment</Label>
                                                <Textarea
                                                    value={editTraumaData.comment}
                                                    onChange={(e) => setEditTraumaData({...editTraumaData, comment: e.target.value})}
                                                    className="text-[13px] rounded min-h-[60px] resize-none"
                                                    style={{
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                    }}
                                                    placeholder="Enter additional comments"
                                                />
                                            </div>

                                            {/* Comments Management */}
                                            <div className="pt-4" style={{ borderTop: '2px solid var(--slds-g-color-border-base-1)' }}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-[13px] font-semibold text-[#080707]">Comments ({editTraumaData.comments.length})</h4>
                                                    <Button
                                                        onClick={() => setShowAddTraumaComment(!showAddTraumaComment)}
                                                        className="h-7 px-3 rounded-full text-[11px]"
                                                        style={{
                                                            backgroundColor: '#145F33',
                                                            color: 'white'
                                                        }}
                                                    >
                                                        <Plus className="w-3 h-3 mr-1" />
                                                        Add Comment
                                                    </Button>
                                                </div>
                                                
                                                {showAddTraumaComment && (
                                                    <div className="mb-3 p-3 rounded" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                        <div className="space-y-3">
                                                            <div className="grid grid-cols-4 gap-3">
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-[11px] font-semibold text-[#080707]">Date</Label>
                                                                    <DateInput
value={isoToMdy(newTraumaCommentData.date)}
                                                                        onChange={(v) => ((e) => setNewTraumaCommentData({...newTraumaCommentData, date: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                                        className="h-9 text-[13px] rounded"
                                                                        style={{
                                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="space-y-1.5 col-span-3">
                                                                    <Label className="text-[11px] font-semibold text-[#080707]">Comment</Label>
                                                                    <Textarea
                                                                        value={newTraumaCommentData.comment}
                                                                        onChange={(e) => setNewTraumaCommentData({...newTraumaCommentData, comment: e.target.value})}
                                                                        className="h-9 text-[13px] rounded resize-none"
                                                                        style={{
                                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                                                        }}
                                                                        placeholder="Enter comment"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    onClick={() => {
                                                                        setShowAddTraumaComment(false);
                                                                        setNewTraumaCommentData({ date: "", comment: "" });
                                                                    }}
                                                                    className="h-7 px-3 rounded-full text-[11px]"
                                                                    style={{
                                                                        backgroundColor: 'transparent',
                                                                        color: '#706e6b',
                                                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                                                    }}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    onClick={handleAddTraumaCommentToRecord}
                                                                    className="h-7 px-3 rounded-full text-[11px]"
                                                                    style={{
                                                                        backgroundColor: '#145F33',
                                                                        color: 'white'
                                                                    }}
                                                                    disabled={!newTraumaCommentData.date || !newTraumaCommentData.comment}
                                                                >
                                                                    Add
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div className="rounded border" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                    {editTraumaData.comments.length > 0 ? (
                                                        <div className="divide-y" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                            {editTraumaData.comments
                                                                .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                                                                .map((comment: any) => (
                                                                    <div key={comment.id} className="px-3 py-3">
                                                                        <div className="flex items-start justify-between gap-3 mb-1">
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-2 mb-1">
                                                                                    <span className="text-[11px] font-semibold text-[#080707]">{comment.date}</span>
                                                                                    <span className="text-[10px] text-[#706e6b]">by {comment.createdBy}</span>
                                                                                </div>
                                                                                <p className="text-[12px] text-[#080707]">{comment.comment}</p>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => handleDeleteTraumaComment(comment.id)}
                                                                                className="text-[#c23934] hover:text-[#8a2a27] p-1"
                                                                                title="Delete Comment"
                                                                            >
                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    ) : (
                                                        <div className="px-3 py-4 text-center text-[11px] text-[#706e6b] italic">
                                                            No comments yet. Click "Add Comment" to add.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Modal Footer */}
                                        <div
                                            className="px-6 py-4 flex justify-end gap-2 sticky bottom-0 bg-white"
                                            style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}
                                        >
                                            <Button
                                                onClick={handleCancelEditTrauma}
                                                className="h-9 px-4 rounded-full text-[13px] font-medium"
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    color: '#706e6b',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleSaveTrauma}
                                                className="h-9 px-4 rounded-full text-[13px] font-medium"
                                                style={{
                                                    backgroundColor: '#145F33',
                                                    color: 'white'
                                                }}
                                                disabled={!editTraumaData.dateReported || !editTraumaData.subject || !editTraumaData.traumaType || 
                                                    !editTraumaData.ageOfFirstOccurrence || !editTraumaData.ongoing || !editTraumaData.description || 
                                                    !editTraumaData.dcfsHotlineRequired || (editTraumaData.ongoing === "Yes" && !editTraumaData.ageOfLastOccurrence)}
                                            >
                                                Save Changes
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

        {/* Edit Coping Skill Modal */}
        {showEditCopingSkillModal && (
            <div
                className="fixed inset-0 flex items-center justify-center z-50"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                onClick={handleCancelEditCopingSkill}
            >
                <div
                    className="rounded-lg max-w-4xl w-full mx-4"
                    style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid var(--slds-g-color-border-base-1)",
                        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
                        maxHeight: "90vh",
                        overflow: "auto"
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div
                        className="px-6 py-4 flex items-start justify-between sticky top-0 bg-white z-10"
                        style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
                    >
                        <h2 className="text-[16px] font-semibold text-[#080707]">Edit Coping Skill</h2>
                        <button
                            onClick={handleCancelEditCopingSkill}
                            className="text-[#706e6b] hover:text-[#080707]"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="px-6 py-4 space-y-4">
                        {/* Coping Skill Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[#080707]">
                                    Date Reported <span className="text-red-600">*</span>
                                </Label>
                                <DateInput
value={isoToMdy(editCopingSkillData.dateReported)}
                                    onChange={(v) => ((e) => setEditCopingSkillData({...editCopingSkillData, dateReported: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                    className="h-9 text-[13px] rounded"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[#080707]">Last ITP Inclusion</Label>
                                <DateInput
value={isoToMdy(editCopingSkillData.lastITPInclusion)}
                                    onChange={(v) => ((e) => setEditCopingSkillData({...editCopingSkillData, lastITPInclusion: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                    className="h-9 text-[13px] rounded"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[#080707]">
                                    Coping Skill <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    value={editCopingSkillData.copingSkill}
                                    onChange={(e) => setEditCopingSkillData({...editCopingSkillData, copingSkill: e.target.value})}
                                    className="h-9 text-[13px] rounded"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="Enter coping skill"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[#080707]">Effective When</Label>
                                <Input
                                    value={editCopingSkillData.effectiveWhen}
                                    onChange={(e) => setEditCopingSkillData({...editCopingSkillData, effectiveWhen: e.target.value})}
                                    className="h-9 text-[13px] rounded"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="When is this effective?"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-[#080707]">Description</Label>
                            <Textarea
                                value={editCopingSkillData.description}
                                onChange={(e) => setEditCopingSkillData({...editCopingSkillData, description: e.target.value})}
                                className="text-[13px] rounded min-h-[80px] resize-none"
                                style={{
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                }}
                                placeholder="Enter detailed description"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[#080707]">Reported By</Label>
                                <Input
                                    value={editCopingSkillData.reportedBy}
                                    readOnly
                                    disabled
                                    className="h-9 text-[13px] rounded"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-alt)',
                                        borderColor: 'var(--slds-g-color-border-base-1)',
                                        cursor: 'not-allowed',
                                        opacity: 0.6
                                    }}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[#080707]">Created By</Label>
                                <Input
                                    value={editCopingSkillData.createdBy}
                                    readOnly
                                    disabled
                                    className="h-9 text-[13px] rounded"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-alt)',
                                        borderColor: 'var(--slds-g-color-border-base-1)',
                                        cursor: 'not-allowed',
                                        opacity: 0.6
                                    }}
                                />
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-[13px] font-semibold text-[#080707]">
                                    Comments ({editCopingSkillData.comments?.length || 0})
                                </h3>
                            </div>

                            {/* Add Comment Form */}
                            <div className="space-y-3 p-3 rounded mb-3" style={{ backgroundColor: 'var(--slds-g-color-background-alt)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-[#080707]">
                                            Date <span className="text-red-600">*</span>
                                        </Label>
                                        <DateInput
value={isoToMdy(newCopingSkillComment.date)}
                                            onChange={(v) => ((e) => setNewCopingSkillComment({...newCopingSkillComment, date: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                            className="h-9 text-[13px] rounded"
                                            style={{
                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-3">
                                        <Label className="text-[11px] font-semibold text-[#080707]">
                                            Comment <span className="text-red-600">*</span>
                                        </Label>
                                        <Textarea
                                            value={newCopingSkillComment.comment}
                                            onChange={(e) => setNewCopingSkillComment({...newCopingSkillComment, comment: e.target.value})}
                                            className="text-[13px] rounded min-h-[60px] resize-none"
                                            style={{
                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                            }}
                                            placeholder="Enter comment text"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    {editingCopingSkillCommentId && (
                                        <Button
                                            onClick={handleCancelEditCopingSkillComment}
                                            className="h-8 px-4 rounded-full text-[12px]"
                                            style={{
                                                backgroundColor: 'transparent',
                                                color: '#706e6b',
                                                border: '1px solid var(--slds-g-color-border-base-1)'
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                    <Button
                                        onClick={editingCopingSkillCommentId ? handleUpdateCopingSkillComment : handleAddCopingSkillComment}
                                        className="h-8 px-4 rounded-full text-[12px]"
                                        style={{
                                            backgroundColor: '#145F33',
                                            color: 'white'
                                        }}
                                        disabled={!newCopingSkillComment.date || !newCopingSkillComment.comment}
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" />
                                        {editingCopingSkillCommentId ? 'Update Comment' : 'Add Comment'}
                                    </Button>
                                </div>
                            </div>

                            {/* Comments List */}
                            {editCopingSkillData.comments && editCopingSkillData.comments.length > 0 && (
                                <div className="space-y-2">
                                    {editCopingSkillData.comments.map((comment: any) => (
                                        <div
                                            key={comment.id}
                                            className="p-3 rounded"
                                            style={{
                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                border: '1px solid var(--slds-g-color-border-base-1)'
                                            }}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[11px] font-semibold text-[#706e6b]">
                                                    {comment.date}
                                                </span>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditCopingSkillComment(comment)}
                                                        className="text-[#706e6b] hover:text-[#3e3e3c] p-1"
                                                        title="Edit Comment"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCopingSkillComment(comment.id)}
                                                        className="text-[#c23934] hover:text-[#8a2a27] p-1"
                                                        title="Delete Comment"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-[13px] text-[#080707]">{comment.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div
                        className="px-6 py-4 flex justify-end gap-2 sticky bottom-0 bg-white"
                        style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}
                    >
                        <Button
                            onClick={handleCancelEditCopingSkill}
                            className="h-8 px-3 rounded-full text-[13px]"
                            style={{
                                backgroundColor: 'transparent',
                                color: '#706e6b',
                                border: '1px solid var(--slds-g-color-border-base-1)'
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateCopingSkill}
                            className="h-8 px-3 rounded-full text-[13px]"
                            style={{
                                backgroundColor: '#145F33',
                                color: 'white'
                            }}
                            disabled={!editCopingSkillData.dateReported || !editCopingSkillData.copingSkill}
                        >
                            Update
                        </Button>
                    </div>
                </div>
            </div>
        )}

    </>
  );
}
