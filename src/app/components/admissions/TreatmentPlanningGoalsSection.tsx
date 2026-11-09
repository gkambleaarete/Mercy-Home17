import { useState, useMemo, useEffect, useRef, useCallback } from "react";
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
import { ChevronRight, Plus, User, Users, Building2, Phone, Mail, CheckSquare, Upload, AlertTriangle, Clock, MapPin, CheckCircle, Pencil, Trash2, ChevronDown, FileText, ChevronUp, Check, X, ChevronLeft, Search, Filter, Calendar, Package, Tag, ClipboardList, ChevronsUpDown, Download, Eye, File, MoreVertical, Target, MessageSquare } from "@/app/lib/lucide-icons";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, toLocalIso } from "../../lib/dateFormat";

interface TreatmentPlanningGoalsSectionProps {
  activeSubSection: any;
  calculateOverallProgress: any;
  editGoalData: any;
  editGoalType: any;
  editingGoalId: any;
  expandedGoals: any;
  goals: any;
  handleAddGoal: any;
  handleCancelEditGoal: any;
  handleDeleteGoal: any;
  handleEditGoal: any;
  handleSaveGoal: any;
  newGoal: any;
  setEditGoalData: any;
  setExpandedGoals: any;
  setNewGoal: any;
  setShowAddGoal: any;
  setShowAddGoalModal: any;
  setShowEditGoalModal: any;
  showAddGoal: any;
  showAddGoalModal: any;
  showEditGoalModal: any;
  startDate: any;
  targetEnd: any;
  toggleComments: any;
  toggleGoalExpansion: any;
  updateGoalProgress: any;
}

export function TreatmentPlanningGoalsSection({ activeSubSection, calculateOverallProgress, editGoalData, editGoalType, editingGoalId, expandedGoals, goals, handleAddGoal, handleCancelEditGoal, handleDeleteGoal, handleEditGoal, handleSaveGoal, newGoal, setEditGoalData, setExpandedGoals, setNewGoal, setShowAddGoal, setShowAddGoalModal, setShowEditGoalModal, showAddGoal, showAddGoalModal, showEditGoalModal, startDate, targetEnd, toggleComments, toggleGoalExpansion, updateGoalProgress }: TreatmentPlanningGoalsSectionProps) {
  return (
    <>
                    {activeSubSection === "goals" && (
                        <div className="space-y-5">
                            {/* Header Section */}
                            {/* Header Section - Enhanced with Progress Overview */}
                            <div 
                              className="rounded-lg p-6"
                              style={{
                                backgroundColor: 'var(--slds-g-color-background-base)',
                                border: '1px solid var(--slds-g-color-border-base-1)'
                              }}
                            >
                                <div className="mb-4">
                                    <div className="flex items-center justify-between gap-6 mb-3">
                                        <div className="flex items-stretch gap-3 flex-1">
                                            <div className="flex items-center" style={{ color: '#145F33' }}>
                                                <Target className="w-10 h-10" strokeWidth={1.5} />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <h3 className="text-[16px] font-semibold text-[#080707]">Treatment Goals</h3>
                                                <p className="text-[13px] text-[#706e6b] mt-0.5">Marcus Thompson</p>
                                            </div>
                                        </div>
                                        
                                        <Button
                                            onClick={() => {
                                                setNewGoal({
                                                    goal: "",
                                                    goalText: "",
                                                    relatedPTPStatement: "",
                                                    reasonForGoal: "",
                                                    pointPersonName: "",
                                                    outcomeDomain: "",
                                                    startDate: "",
                                                    targetDuration: "",
                                                    targetEndDate: "",
                                                    endDate: "",
                                                    goalPercentage: "",
                                                    targetDate: "",
                                                    category: "",
                                                    parentId: null,
                                                    progress: 0,
                                                    description: "",
                                                    enrollee: "Marcus Thompson",
                                                    badgeType: "",
                                                    enrolleeCount: 0
                                                });
                                                setShowAddGoalModal(true);
                                            }}
                                            className="h-9 px-4 rounded-full text-[13px] font-medium"
                                            style={{
                                                backgroundColor: '#145F33',
                                                color: 'white'
                                            }}
                                        >
                                            <Plus className="w-4 h-4 mr-1.5" />
                                            New Goal
                                        </Button>
                                    </div>
                                    
                                    {/* Overall Progress Stats - Horizontal Bar */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[13px] font-semibold text-[#145F33]">
                                                    {calculateOverallProgress()}%
                                                </span>
                                                <span className="text-[11px] text-[#706e6b]">
                                                    {goals.filter(g => g.parentId === null && g.progress === 100).length}/{goals.filter(g => g.parentId === null).length} Complete
                                                </span>
                                            </div>
                                            <div 
                                              className="h-2 rounded-full overflow-hidden"
                                              style={{ backgroundColor: 'var(--slds-g-color-border-base-1)' }}
                                            >
                                                <div 
                                                  className="h-full rounded-full transition-all duration-300"
                                                  style={{
                                                    width: `${calculateOverallProgress()}%`,
                                                    backgroundColor: '#145F33'
                                                  }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Add Goal Modal - Moved to end of section */}
                            {false && showAddGoal === 'top' && (
                                <div 
                                  className="p-5 rounded"
                                  style={{
                                    backgroundColor: 'var(--slds-g-color-background-alt)',
                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                  }}
                                >
                                    <div className="space-y-4">
                                        {/* Goal Title */}
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-semibold text-[#080707]">Goal Title *</Label>
                                            <Input
                                                value={newGoal.goal}
                                                onChange={(e) => setNewGoal({...newGoal, goal: e.target.value})}
                                                className="h-9 text-[13px] rounded"
                                                style={{
                                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                                }}
                                                placeholder="Enter goal title"
                                            />
                                        </div>

                                        {/* Goal (Rich Text Area) */}
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-semibold text-[#080707]">Goal *</Label>
                                            <Textarea
                                                value={newGoal.goalText}
                                                onChange={(e) => setNewGoal({...newGoal, goalText: e.target.value})}
                                                className="min-h-[80px] text-[13px] rounded resize-none"
                                                style={{
                                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                                }}
                                                placeholder="Enter detailed goal description..."
                                            />
                                        </div>

                                        {/* Related PTP Statement */}
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-semibold text-[#080707]">Related PTP Statement</Label>
                                            <select
                                                value={newGoal.relatedPTPStatement}
                                                onChange={(e) => setNewGoal({...newGoal, relatedPTPStatement: e.target.value})}
                                                className="h-9 text-[13px] rounded w-full px-2.5"
                                                style={{
                                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                <option value="">-- Select PTP Statement --</option>
                                                <option value="Trauma-Informed Care">Trauma-Informed Care</option>
                                                <option value="Family Engagement">Family Engagement</option>
                                                <option value="Life Skills Development">Life Skills Development</option>
                                                <option value="Educational Support">Educational Support</option>
                                                <option value="Mental Health Services">Mental Health Services</option>
                                            </select>
                                        </div>

                                        {/* Reason for Goal (Rich Text Area) */}
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-semibold text-[#080707]">Reason for Goal *</Label>
                                            <Textarea
                                                value={newGoal.reasonForGoal}
                                                onChange={(e) => setNewGoal({...newGoal, reasonForGoal: e.target.value})}
                                                className="min-h-[80px] text-[13px] rounded resize-none"
                                                style={{
                                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                                }}
                                                placeholder="Explain why this goal is important..."
                                            />
                                        </div>

                                        {/* Point Person Section */}
                                        <div>
                                            <div className="mb-2">
                                                <h4 className="text-[12px] font-semibold text-[#080707]">Point Person</h4>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-semibold text-[#080707]">Name *</Label>
                                                <Input
                                                    value={newGoal.pointPersonName}
                                                    onChange={(e) => setNewGoal({...newGoal, pointPersonName: e.target.value})}
                                                    className="h-9 text-[13px] rounded"
                                                    style={{
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                    }}
                                                    placeholder="Enter point person name"
                                                />
                                            </div>
                                        </div>

                                        {/* Outcome Domain */}
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-semibold text-[#080707]">Outcome Domain</Label>
                                            <select
                                                value={newGoal.outcomeDomain}
                                                onChange={(e) => setNewGoal({...newGoal, outcomeDomain: e.target.value})}
                                                className="h-9 text-[13px] rounded w-full px-2.5"
                                                style={{
                                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                <option value="">-- Select Outcome Domain --</option>
                                                <option value="Clinical/Behavioral">Clinical/Behavioral</option>
                                                <option value="Educational">Educational</option>
                                                <option value="Family Engagement">Family Engagement</option>
                                                <option value="Life Skills/Transition">Life Skills/Transition</option>
                                                <option value="Social/Emotional">Social/Emotional</option>
                                                <option value="Physical Health">Physical Health</option>
                                            </select>
                                        </div>

                                        {/* Dates Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-semibold text-[#080707]">Start Date *</Label>
                                                <DateInput
value={isoToMdy(newGoal.startDate)}
                                                    onChange={(v) => ((e) => {
                                                        setNewGoal({...newGoal, startDate: e.target.value});
                                                    })({ target: { value: mdyToIso(v) } })}
                                                    className="h-9 text-[13px] rounded"
                                                    style={{
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-semibold text-[#080707]">Target Duration</Label>
                                                <select
                                                    value={newGoal.targetDuration}
                                                    onChange={(e) => {
                                                        const duration = e.target.value;
                                                        setNewGoal({...newGoal, targetDuration: duration});
                                                        
                                                        // Auto-calculate target end date if start date is set
                                                        if (newGoal.startDate && duration) {
                                                            const startDate = new Date(newGoal.startDate);
                                                            const months = parseInt(duration);
                                                            const targetEnd = new Date(startDate);
                                                            targetEnd.setMonth(targetEnd.getMonth() + months);
                                                            setNewGoal({...newGoal, targetDuration: duration, targetEndDate: toLocalIso(targetEnd)});
                                                        }
                                                    }}
                                                    className="h-9 text-[13px] rounded w-full px-2.5"
                                                    style={{
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        borderColor: 'var(--slds-g-color-border-base-1)',
                                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                                    }}
                                                >
                                                    <option value="">-- Select Duration --</option>
                                                    <option value="1">1 Month</option>
                                                    <option value="3">3 Months</option>
                                                    <option value="3">13 Weeks</option>
                                                    <option value="6">6 Months</option>
                                                    <option value="9">9 Months</option>
                                                    <option value="12">12 Months</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-semibold text-[#080707]">Target End Date</Label>
                                                <DateInput
value={isoToMdy(newGoal.targetEndDate)}
                                                    onChange={(v) => ((e) => setNewGoal({...newGoal, targetEndDate: e.target.value, targetDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                    className="h-9 text-[13px] rounded"
                                                    style={{
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-semibold text-[#080707]">End Date</Label>
                                                <DateInput
value={isoToMdy(newGoal.endDate)}
                                                    onChange={(v) => ((e) => setNewGoal({...newGoal, endDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                    className="h-9 text-[13px] rounded"
                                                    style={{
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Enrollee and Goal Percentage Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-semibold text-[#080707]">Enrollee *</Label>
                                                <Input
                                                    value={newGoal.enrollee}
                                                    onChange={(e) => setNewGoal({...newGoal, enrollee: e.target.value})}
                                                    className="h-9 text-[13px] rounded"
                                                    style={{
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                    }}
                                                    placeholder="Youth name"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-semibold text-[#080707]">Goal Percentage</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={newGoal.goalPercentage}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 100)) {
                                                                setNewGoal({...newGoal, goalPercentage: value});
                                                            }
                                                        }}
                                                        className="h-9 text-[13px] rounded pr-8"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                                        }}
                                                        placeholder="0"
                                                    />
                                                    <span 
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] pointer-events-none"
                                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    >
                                                        %
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-2 mt-5 pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        <Button
                                            onClick={() => {
                                                setShowAddGoal(null);
                                                setNewGoal({ 
                                                    goal: "", 
                                                    goalText: "",
                                                    relatedPTPStatement: "",
                                                    reasonForGoal: "",
                                                    pointPersonName: "",
                                                    outcomeDomain: "",
                                                    startDate: "",
                                                    targetDuration: "",
                                                    targetEndDate: "",
                                                    endDate: "",
                                                    goalPercentage: "",
                                                    targetDate: "", 
                                                    category: "", 
                                                    parentId: null, 
                                                    progress: 0, 
                                                    description: "", 
                                                    enrollee: "",
                                                    badgeType: "",
                                                    enrolleeCount: 0
                                                });
                                            }}
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
                                            onClick={handleAddGoal}
                                            className="h-9 px-4 rounded-full text-[13px] font-medium"
                                            style={{
                                                backgroundColor: '#145F33',
                                                color: 'white'
                                            }}
                                        >
                                            Save Goal
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Simplified Goals Display - Matching Screenshot */}
                            <div className="space-y-3">
                                {goals.filter(g => g.parentId === null).map((parentGoal) => {
                                    const childGoals = goals.filter(g => g.parentId === parentGoal.id);
                                    const isExpanded = expandedGoals.includes(parentGoal.id);
                                    
                                    // Determine icon colors based on category/badge
                                    const getIconStyle = (category: string, badgeType: string) => {
                                        if (badgeType === 'BENEFIT') {
                                            return { bg: '#ffe0ec', color: '#c9184a' };
                                        } else if (category === 'Top Goal') {
                                            return { bg: '#e0f2fe', color: '#075985' };
                                        } else {
                                            return { bg: '#fef3e2', color: '#92400e' };
                                        }
                                    };
                                    
                                    const iconStyle = getIconStyle(parentGoal.category, parentGoal.badgeType || '');
                                    
                                    return (
                                        <div
                                          key={parentGoal.id}
                                          id={`goal-${parentGoal.id}`}
                                          className="rounded overflow-visible"
                                          style={{
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            backgroundColor: 'var(--slds-g-color-background-base)'
                                          }}
                                        >
                                            {/* Parent Goal Card */}
                                            <div 
                                                className="p-4 cursor-pointer"
                                                onClick={() => toggleGoalExpansion(parentGoal.id)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Expand/Collapse Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleGoalExpansion(parentGoal.id);
                                                        }}
                                                        className="mt-1 text-[#706e6b] hover:text-[#145F33]"
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronDown className="w-4 h-4" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    
                                                    {/* Checkbox */}
                                                    <input
                                                        type="checkbox"
                                                        checked={parentGoal.progress === 100}
                                                        onChange={() => updateGoalProgress(parentGoal.id, parentGoal.progress === 100 ? 0 : 100)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="mt-1 h-4 w-4 rounded border-gray-300 bg-white"
                                                        style={{
                                                            accentColor: '#145F33',
                                                            backgroundColor: 'white'
                                                        }}
                                                    />
                                                    
                                                    {/* Goal Content */}
                                                    <div className="flex-1 min-w-0" onClick={(e) => {
                                                        if (false && editingGoalId === parentGoal.id) {
                                                            e.stopPropagation();
                                                        }
                                                    }}>
                                                        {false && editingGoalId === parentGoal.id ? (
                                                            /* Edit Form for Parent Goal */
                                                            <div className="space-y-4">
                                                                {/* Goal Title */}
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-[11px] font-semibold text-[#080707]">Goal Title *</Label>
                                                                    <Input
                                                                        value={editGoalData.goal}
                                                                        onChange={(e) => setEditGoalData({...editGoalData, goal: e.target.value})}
                                                                        className="h-9 text-[13px] rounded"
                                                                        style={{
                                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                                                        }}
                                                                        placeholder="Enter goal title"
                                                                    />
                                                                </div>

                                                                {/* Goal (Rich Text Area) */}
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-[11px] font-semibold text-[#080707]">Goal *</Label>
                                                                    <Textarea
                                                                        value={editGoalData.goalText}
                                                                        onChange={(e) => setEditGoalData({...editGoalData, goalText: e.target.value})}
                                                                        className="min-h-[80px] text-[13px] rounded resize-none"
                                                                        style={{
                                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                                                        }}
                                                                        placeholder="Enter detailed goal description..."
                                                                    />
                                                                </div>

                                                                {/* Related PTP Statement */}
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-[11px] font-semibold text-[#080707]">Related PTP Statement</Label>
                                                                    <select
                                                                        value={editGoalData.relatedPTPStatement}
                                                                        onChange={(e) => setEditGoalData({...editGoalData, relatedPTPStatement: e.target.value})}
                                                                        className="h-9 text-[13px] rounded w-full px-2.5"
                                                                        style={{
                                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                                            borderColor: 'var(--slds-g-color-border-base-1)',
                                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                                        }}
                                                                    >
                                                                        <option value="">-- Select PTP Statement --</option>
                                                                        <option value="Trauma-Informed Care">Trauma-Informed Care</option>
                                                                        <option value="Family Engagement">Family Engagement</option>
                                                                        <option value="Life Skills Development">Life Skills Development</option>
                                                                        <option value="Educational Support">Educational Support</option>
                                                                        <option value="Mental Health Services">Mental Health Services</option>
                                                                    </select>
                                                                </div>

                                                                {/* Reason for Goal (Rich Text Area) */}
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-[11px] font-semibold text-[#080707]">Reason for Goal *</Label>
                                                                    <Textarea
                                                                        value={editGoalData.reasonForGoal}
                                                                        onChange={(e) => setEditGoalData({...editGoalData, reasonForGoal: e.target.value})}
                                                                        className="min-h-[80px] text-[13px] rounded resize-none"
                                                                        style={{
                                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                                                        }}
                                                                        placeholder="Explain why this goal is important..."
                                                                    />
                                                                </div>

                                                                {/* Point Person Section */}
                                                                <div>
                                                                    <div className="mb-2">
                                                                        <h4 className="text-[12px] font-semibold text-[#080707]">Point Person</h4>
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[11px] font-semibold text-[#080707]">Name *</Label>
                                                                        <Input
                                                                            value={editGoalData.pointPersonName}
                                                                            onChange={(e) => setEditGoalData({...editGoalData, pointPersonName: e.target.value})}
                                                                            className="h-9 text-[13px] rounded"
                                                                            style={{
                                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                                            }}
                                                                            placeholder="Enter point person name"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Outcome Domain */}
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-[11px] font-semibold text-[#080707]">Outcome Domain</Label>
                                                                    <select
                                                                        value={editGoalData.outcomeDomain}
                                                                        onChange={(e) => setEditGoalData({...editGoalData, outcomeDomain: e.target.value})}
                                                                        className="h-9 text-[13px] rounded w-full px-2.5"
                                                                        style={{
                                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                                            borderColor: 'var(--slds-g-color-border-base-1)',
                                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                                        }}
                                                                    >
                                                                        <option value="">-- Select Outcome Domain --</option>
                                                                        <option value="Clinical/Behavioral">Clinical/Behavioral</option>
                                                                        <option value="Educational">Educational</option>
                                                                        <option value="Family Engagement">Family Engagement</option>
                                                                        <option value="Life Skills/Transition">Life Skills/Transition</option>
                                                                        <option value="Social/Emotional">Social/Emotional</option>
                                                                        <option value="Physical Health">Physical Health</option>
                                                                    </select>
                                                                </div>

                                                                {/* Dates Row */}
                                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[11px] font-semibold text-[#080707]">Start Date *</Label>
                                                                        <DateInput
value={isoToMdy(editGoalData.startDate)}
                                                                            onChange={(v) => ((e) => setEditGoalData({...editGoalData, startDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                                            className="h-9 text-[13px] rounded"
                                                                            style={{
                                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[11px] font-semibold text-[#080707]">Target Duration</Label>
                                                                        <select
                                                                            value={editGoalData.targetDuration}
                                                                            onChange={(e) => {
                                                                                const duration = e.target.value;
                                                                                setEditGoalData({...editGoalData, targetDuration: duration});
                                                                                
                                                                                // Auto-calculate target end date if start date is set
                                                                                if (editGoalData.startDate && duration) {
                                                                                    const startDate = new Date(editGoalData.startDate);
                                                                                    const months = parseInt(duration);
                                                                                    const targetEnd = new Date(startDate);
                                                                                    targetEnd.setMonth(targetEnd.getMonth() + months);
                                                                                    setEditGoalData({...editGoalData, targetDuration: duration, targetEndDate: toLocalIso(targetEnd)});
                                                                                }
                                                                            }}
                                                                            className="h-9 text-[13px] rounded w-full px-2.5"
                                                                            style={{
                                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                borderColor: 'var(--slds-g-color-border-base-1)',
                                                                                border: '1px solid var(--slds-g-color-border-base-1)'
                                                                            }}
                                                                        >
                                                                            <option value="">-- Select Duration --</option>
                                                                            <option value="3">3 Months</option>
                                                                            <option value="6">6 Months</option>
                                                                            <option value="9">9 Months</option>
                                                                            <option value="12">12 Months</option>
                                                                            <option value="18">18 Months</option>
                                                                            <option value="24">24 Months</option>
                                                                        </select>
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[11px] font-semibold text-[#080707]">Target End Date</Label>
                                                                        <DateInput
value={isoToMdy(editGoalData.targetEndDate)}
                                                                            onChange={(v) => ((e) => setEditGoalData({...editGoalData, targetEndDate: e.target.value, targetDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                                            className="h-9 text-[13px] rounded"
                                                                            style={{
                                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[11px] font-semibold text-[#080707]">End Date</Label>
                                                                        <DateInput
value={isoToMdy(editGoalData.endDate)}
                                                                            onChange={(v) => ((e) => setEditGoalData({...editGoalData, endDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                                            className="h-9 text-[13px] rounded"
                                                                            style={{
                                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Enrollee, Category, and Progress Row */}
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[11px] font-semibold text-[#080707]">Enrollee *</Label>
                                                                        <Input
                                                                            value={editGoalData.enrollee}
                                                                            onChange={(e) => setEditGoalData({...editGoalData, enrollee: e.target.value})}
                                                                            className="h-9 text-[13px] rounded"
                                                                            style={{
                                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                                            }}
                                                                            placeholder="Youth name"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[11px] font-semibold text-[#080707]">Category</Label>
                                                                        <Input
                                                                            value={editGoalData.category}
                                                                            onChange={(e) => setEditGoalData({...editGoalData, category: e.target.value})}
                                                                            className="h-9 text-[13px] rounded"
                                                                            style={{
                                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                                            }}
                                                                            placeholder="e.g., Clinical, Education"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[11px] font-semibold text-[#080707]">Progress (%)</Label>
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            value={editGoalData.progress}
                                                                            onChange={(e) => setEditGoalData({...editGoalData, progress: parseInt(e.target.value) || 0})}
                                                                            className="h-9 text-[13px] rounded"
                                                                            style={{
                                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Description */}
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-[11px] font-semibold text-[#080707]">Description</Label>
                                                                    <Textarea
                                                                        value={editGoalData.description}
                                                                        onChange={(e) => setEditGoalData({...editGoalData, description: e.target.value})}
                                                                        className="min-h-[80px] text-[13px] rounded resize-none"
                                                                        style={{
                                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                                                        }}
                                                                        placeholder="Enter goal description..."
                                                                    />
                                                                </div>

                                                                {/* Youth Notes */}
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-[11px] font-semibold text-[#080707]">Youth Notes</Label>
                                                                    <Textarea
                                                                        value={editGoalData.youthNotes}
                                                                        onChange={(e) => setEditGoalData({...editGoalData, youthNotes: e.target.value})}
                                                                        className="text-[13px] rounded min-h-[60px] resize-none"
                                                                        style={{
                                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                                                        }}
                                                                        placeholder="Youth's thoughts on this goal"
                                                                    />
                                                                </div>

                                                                {/* Action Buttons */}
                                                                <div className="flex justify-end gap-2 pt-2" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                    <Button
                                                                        onClick={handleCancelEditGoal}
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
                                                                        onClick={handleSaveGoal}
                                                                        className="h-9 px-4 rounded-full text-[13px] font-medium"
                                                                        style={{
                                                                            backgroundColor: '#145F33',
                                                                            color: 'white'
                                                                        }}
                                                                    >
                                                                        Save Goal
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            /* Display Mode - Enhanced with Action Icons */
                                                            <>
                                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                                    <div className="flex items-center gap-2 flex-1">
                                                                        <h4 className="text-[13px] font-semibold text-[#080707]">
                                                                            {parentGoal.goal}
                                                                        </h4>
                                                                        {parentGoal.badgeType && (
                                                                            <Badge 
                                                                              className="rounded text-[10px] px-2 py-0.5"
                                                                              style={{
                                                                                backgroundColor: 'var(--slds-g-color-background-alt)',
                                                                                color: '#706e6b',
                                                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                                                fontWeight: 'normal'
                                                                              }}
                                                                            >
                                                                                {parentGoal.badgeType}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    {/* Action Icons */}
                                                                    <div className="flex items-center gap-1">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleEditGoal(parentGoal.id);
                                                                            }}
                                                                            className="p-1.5 rounded hover:bg-[#f3f2f2] transition-colors group relative"
                                                                        >
                                                                            <Pencil className="w-3.5 h-3.5 text-[#706e6b] hover:text-[#3e3e3c]" />
                                                                            <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-[#145F33] text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                                                Edit Goal
                                                                            </div>
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                // Expand the major goal if not already expanded
                                                                                if (!expandedGoals.includes(parentGoal.id)) {
                                                                                    setExpandedGoals(prev => [...prev, parentGoal.id]);
                                                                                    // Wait for expansion animation, then scroll to Intermediate Goal Definitions
                                                                                    setTimeout(() => {
                                                                                        const goalElement = document.getElementById(`goal-${parentGoal.id}`);
                                                                                        if (goalElement) {
                                                                                            const intermediateSection = goalElement.querySelector('[data-section="intermediate-goals"]');
                                                                                            if (intermediateSection) {
                                                                                                intermediateSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                                                                            }
                                                                                        }
                                                                                    }, 300);
                                                                                } else {
                                                                                    // Already expanded, just scroll to section
                                                                                    const goalElement = document.getElementById(`goal-${parentGoal.id}`);
                                                                                    if (goalElement) {
                                                                                        const intermediateSection = goalElement.querySelector('[data-section="intermediate-goals"]');
                                                                                        if (intermediateSection) {
                                                                                            intermediateSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }}
                                                                            className="px-2 py-1.5 rounded hover:bg-[#f3f2f2] transition-colors relative group overflow-visible"
                                                                        >
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="text-[11px] font-semibold text-[#145F33]">{childGoals.length}</span>
                                                                                <Target className="w-3.5 h-3.5 text-[#145F33]" />
                                                                            </div>
                                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#145F33] text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[9999] shadow-lg">
                                                                                View Intermediate Goals ({childGoals.length})
                                                                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#145F33]"></div>
                                                                            </div>
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                toggleComments(parentGoal);
                                                                            }}
                                                                            className="p-1.5 rounded hover:bg-[#f3f2f2] transition-colors relative group"
                                                                        >
                                                                            <MessageSquare className="w-3.5 h-3.5 text-[#706e6b]" />
                                                                            {parentGoal.comments && parentGoal.comments.length > 0 && (
                                                                                <span className="absolute -top-1 -right-1 bg-[#145F33] text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                                                                                    {parentGoal.comments.length}
                                                                                </span>
                                                                            )}
                                                                            <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-[#145F33] text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                                                View & Add Comments
                                                                            </div>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Progress Bar */}
                                                                <div className="mb-3">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--slds-g-color-border-base-1)' }}>
                                                                            <div 
                                                                                className="h-full rounded-full transition-all duration-300"
                                                                                style={{
                                                                                    width: `${parentGoal.progress}%`,
                                                                                    backgroundColor: parentGoal.progress === 100 ? '#145F33' : '#0176D3'
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-[11px] text-[#706e6b] font-medium min-w-[35px] text-right">
                                                                            {parentGoal.progress}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Show detailed info only when expanded */}
                                                                {isExpanded && (
                                                                    <>
                                                                        {/* Expanded: Enhanced Details */}
                                                                        <div className="space-y-4 text-[11px] mt-4">
                                                                            {/* Related PTP Statement, Enrollee, Point Person, Outcome Domain - 4 Column Row */}
                                                                            <div className="grid grid-cols-4 gap-4 pb-3 border-b" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                                                <div>
                                                                                    <span className="text-[#706e6b] font-medium text-[11px]">Related PTP Statement:</span>
                                                                                    <p className="text-[#080707] mt-1.5 text-[11px]">{parentGoal.relatedPTPStatement}</p>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-[#706e6b] font-medium text-[11px]">Enrollee:</span>
                                                                                    <p className="text-[#080707] mt-1.5 text-[11px]">{parentGoal.enrollee}</p>
                                                                                </div>
                                                                                {parentGoal.pointPersonName && (
                                                                                    <div>
                                                                                        <span className="text-[#706e6b] font-medium text-[11px]">Point Person:</span>
                                                                                        <p className="text-[#080707] mt-1.5 text-[11px]">{parentGoal.pointPersonName}</p>
                                                                                    </div>
                                                                                )}
                                                                                {parentGoal.outcomeDomain && (
                                                                                    <div>
                                                                                        <span className="text-[#706e6b] font-medium text-[11px]">Outcome Domain:</span>
                                                                                        <p className="text-[#080707] mt-1.5 text-[11px]">{parentGoal.outcomeDomain}</p>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            
                                                                            {parentGoal.reasonForGoal && (
                                                                                <div className="pb-3 border-b" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                                                    <span className="text-[#706e6b] font-medium text-[11px]">Reason for Goal:</span>
                                                                                    <p className="text-[#080707] mt-2 leading-relaxed text-[11px]">{parentGoal.reasonForGoal}</p>
                                                                                </div>
                                                                            )}
                                                                            
                                                                            {parentGoal.youthNotes && (
                                                                                <div className="pb-3 border-b" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                                                    <span className="text-[#706e6b] font-medium text-[11px]">Youth Notes:</span>
                                                                                    <p className="text-[#080707] mt-2 leading-relaxed italic text-[11px]">{parentGoal.youthNotes}</p>
                                                                                </div>
                                                                            )}
                                                                            
                                                                            {(parentGoal.startDate || parentGoal.targetEndDate) && (
                                                                                <div className="grid grid-cols-3 gap-4">
                                                                                    {parentGoal.startDate && (
                                                                                        <div>
                                                                                            <span className="text-[#706e6b] font-medium text-[11px]">Start Date:</span>
                                                                                            <p className="text-[#080707] mt-1.5 text-[11px]">{parentGoal.startDate}</p>
                                                                                        </div>
                                                                                    )}
                                                                                    {parentGoal.targetEndDate && (
                                                                                        <div>
                                                                                            <span className="text-[#706e6b] font-medium text-[11px]">Target End:</span>
                                                                                            <p className="text-[#080707] mt-1.5 text-[11px]">{parentGoal.targetEndDate}</p>
                                                                                        </div>
                                                                                    )}
                                                                                    <div>
                                                                                        <span className="text-[#706e6b] font-medium text-[11px]">Status:</span>
                                                                                        <p className="text-[#080707] mt-1.5 text-[11px]">{parentGoal.status}</p>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Content: Intermediate Goals */}
                                            {isExpanded && childGoals.length > 0 && (
                                                <div 
                                                  className="px-5 pb-5 pt-0"
                                                  style={{
                                                    borderTop: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: '#fafaf9'
                                                  }}
                                                >
                                                    <div className="pt-5" data-section="intermediate-goals">
                                                        <h5 className="text-[11px] font-semibold text-[#080707] mb-4">
                                                            Intermediate Goal Definitions ({childGoals.length})
                                                        </h5>
                                                        
                                                        <div className="space-y-3">
                                                            {childGoals.map((childGoal, index) => (
                                                                    <div 
                                                                      key={childGoal.id}
                                                                      className="p-4 rounded"
                                                                      style={{
                                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                                                      }}
                                                                    >
                                                                        {false && editingGoalId === childGoal.id ? (
                                                                            /* Edit Form for Child Goal */
                                                                            <div className="space-y-3">
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                                    <div className="space-y-1.5">
                                                                                        <Label className="text-[11px] font-medium text-[#080707]">Goal</Label>
                                                                                        <Input
                                                                                            value={editGoalData.goal}
                                                                                            onChange={(e) => setEditGoalData({...editGoalData, goal: e.target.value})}
                                                                                            className="h-8 text-[13px] rounded"
                                                                                            style={{
                                                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                    <div className="space-y-1.5">
                                                                                        <Label className="text-[11px] font-medium text-[#080707]">Target Date</Label>
                                                                                        <DateInput
value={isoToMdy(editGoalData.targetDate)}
                                                                                            onChange={(v) => ((e) => setEditGoalData({...editGoalData, targetDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                                                            className="h-8 text-[13px] rounded"
                                                                                            style={{
                                                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                    <div className="space-y-1.5">
                                                                                        <Label className="text-[11px] font-medium text-[#080707]">Category</Label>
                                                                                        <Input
                                                                                            value={editGoalData.category}
                                                                                            onChange={(e) => setEditGoalData({...editGoalData, category: e.target.value})}
                                                                                            className="h-8 text-[13px] rounded"
                                                                                            style={{
                                                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                                                            }}
                                                                                            placeholder="e.g., Clinical, Education, Family"
                                                                                        />
                                                                                    </div>
                                                                                    <div className="space-y-1.5">
                                                                                        <Label className="text-[11px] font-medium text-[#080707]">Progress (%)</Label>
                                                                                        <Input
                                                                                            type="number"
                                                                                            min="0"
                                                                                            max="100"
                                                                                            value={editGoalData.progress}
                                                                                            onChange={(e) => setEditGoalData({...editGoalData, progress: parseInt(e.target.value) || 0})}
                                                                                            className="h-8 text-[13px] rounded"
                                                                                            style={{
                                                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                                <div className="space-y-1.5">
                                                                                    <Label className="text-[11px] font-medium text-[#080707]">Youth Notes</Label>
                                                                                    <Textarea
                                                                                        value={editGoalData.youthNotes}
                                                                                        onChange={(e) => setEditGoalData({...editGoalData, youthNotes: e.target.value})}
                                                                                        className="text-[13px] rounded min-h-[60px]"
                                                                                        style={{
                                                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                                                                        }}
                                                                                        placeholder="Youth's thoughts on this goal"
                                                                                    />
                                                                                </div>
                                                                                <div className="flex justify-end gap-2">
                                                                                    <Button
                                                                                        onClick={handleCancelEditGoal}
                                                                                        className="h-7 px-3 rounded-full text-[12px]"
                                                                                        style={{
                                                                                            backgroundColor: 'transparent',
                                                                                            color: '#706e6b',
                                                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                                                        }}
                                                                                    >
                                                                                        Cancel
                                                                                    </Button>
                                                                                    <Button
                                                                                        onClick={handleSaveGoal}
                                                                                        className="h-7 px-3 rounded-full text-[12px]"
                                                                                        style={{
                                                                                            backgroundColor: '#145F33',
                                                                                            color: 'white'
                                                                                        }}
                                                                                    >
                                                                                        Save Goal
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            /* Display Mode for Child Goal - Clean Minimal Layout */
                                                                            <>
                                                                                <div className="flex items-start gap-3">
                                                                                    {/* Checkbox for quick complete/incomplete */}
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={childGoal.progress === 100}
                                                                                        onChange={() => updateGoalProgress(childGoal.id, childGoal.progress === 100 ? 0 : 100)}
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                        className="mt-0.5 h-4 w-4 rounded border-gray-300 bg-white flex-shrink-0"
                                                                                        style={{
                                                                                            accentColor: '#145F33',
                                                                                            backgroundColor: 'white'
                                                                                        }}
                                                                                    />
                                                                                    
                                                                                    {/* Content - Minimal Layout */}
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="flex items-start justify-between gap-3 mb-1">
                                                                                            <div className="text-[12px] text-[#080707] font-medium">{childGoal.goal}</div>
                                                                                            <div className="flex items-center gap-1">
                                                                                                <button
                                                                                                    onClick={() => handleEditGoal(childGoal.id)}
                                                                                                    className="p-1 rounded hover:bg-[#f3f2f2] transition-colors"
                                                                                                    title="Edit Goal"
                                                                                                >
                                                                                                    <Pencil className="w-3.5 h-3.5 text-[#0176d3] hover:text-[#014486]" />
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={() => handleDeleteGoal(childGoal.id)}
                                                                                                    className="p-1 rounded hover:bg-[#f3f2f2] transition-colors"
                                                                                                    title="Delete Goal"
                                                                                                >
                                                                                                    <Trash2 className="w-3.5 h-3.5 text-[#c23934] hover:text-[#8a2a27]" />
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                        
                                                                                        {childGoal.description && (
                                                                                            <div className="text-[11px] text-[#706e6b] mb-2">{childGoal.description}</div>
                                                                                        )}
                                                                                        
                                                                                        {/* Progress Bar */}
                                                                                        <div className="flex items-center gap-2 mb-2">
                                                                                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--slds-g-color-border-base-1)' }}>
                                                                                                <div 
                                                                                                    className="h-full rounded-full transition-all duration-300"
                                                                                                    style={{
                                                                                                        width: `${childGoal.progress}%`,
                                                                                                        backgroundColor: childGoal.progress === 100 ? '#145F33' : '#0176D3'
                                                                                                    }}
                                                                                                />
                                                                                            </div>
                                                                                            <span className="text-[10px] font-semibold text-[#706e6b] min-w-[32px] text-right">
                                                                                                {childGoal.progress}%
                                                                                            </span>
                                                                                        </div>
                                                                                        
                                                                                        {/* Metadata Row */}
                                                                                        <div className="flex items-center gap-3 text-[10px] text-[#706e6b]">
                                                                                            {childGoal.targetDate && (
                                                                                                <span>Target: {childGoal.targetDate}</span>
                                                                                            )}
                                                                                            {childGoal.category && (
                                                                                                <span className="px-2 py-0.5 rounded" style={{ backgroundColor: '#f3f2f2' }}>
                                                                                                    {childGoal.category}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            
                                                            {/* Add Intermediate Goal Button */}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setNewGoal({
                                                                        goal: "",
                                                                        goalText: "",
                                                                        relatedPTPStatement: "",
                                                                        reasonForGoal: "",
                                                                        pointPersonName: "",
                                                                        outcomeDomain: "",
                                                                        startDate: "",
                                                                        targetDuration: "",
                                                                        targetEndDate: "",
                                                                        endDate: "",
                                                                        goalPercentage: "",
                                                                        targetDate: "",
                                                                        category: "",
                                                                        parentId: parentGoal.id,
                                                                        progress: 0,
                                                                        description: "",
                                                                        enrollee: "Marcus Thompson",
                                                                        badgeType: "",
                                                                        enrolleeCount: 0
                                                                    });
                                                                    setShowAddGoalModal(true);
                                                                }}
                                                                className="w-full mt-3 p-3 rounded text-[13px] font-medium flex items-center justify-center gap-2 transition-colors"
                                                                style={{
                                                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                                                    border: '1px dashed var(--slds-g-color-border-base-1)',
                                                                    color: '#145F33'
                                                                }}
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                                Add Intermediate Goal
                                                            </button>
                                                            
                                                            {/* Add Goal Form within Sub-goals */}
                                                            {false && showAddGoal === parentGoal.id && (
                                                                <div 
                                                                  className="mt-2 p-4 rounded space-y-3"
                                                                  style={{
                                                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                                  }}
                                                                >
                                                                    <div className="space-y-3">
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                            <div className="space-y-1.5">
                                                                                <Label className="text-[11px] font-medium text-[#080707]">Goal Title</Label>
                                                                                <Input
                                                                                    value={newGoal.goal}
                                                                                    onChange={(e) => setNewGoal({...newGoal, goal: e.target.value})}
                                                                                    className="h-8 text-[13px] rounded"
                                                                                    style={{
                                                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                                                    }}
                                                                                    placeholder="Enter goal title"
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-1.5">
                                                                                <Label className="text-[11px] font-medium text-[#080707]">Enrollee</Label>
                                                                                <Input
                                                                                    value={newGoal.enrollee}
                                                                                    onChange={(e) => setNewGoal({...newGoal, enrollee: e.target.value})}
                                                                                    className="h-8 text-[13px] rounded"
                                                                                    style={{
                                                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                                                    }}
                                                                                    placeholder="Youth name"
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-1.5 md:col-span-2">
                                                                                <Label className="text-[11px] font-medium text-[#080707]">Description</Label>
                                                                                <Textarea
                                                                                    value={newGoal.description}
                                                                                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                                                                                    className="text-[13px] rounded min-h-[60px] resize-none"
                                                                                    style={{
                                                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                                                    }}
                                                                                    placeholder="Enter detailed goal description"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex justify-end gap-2">
                                                                        <Button
                                                                            onClick={() => setShowAddGoal(null)}
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
                                                                            onClick={handleAddGoal}
                                                                            className="h-8 px-3 rounded-full text-[13px]"
                                                                            style={{
                                                                                backgroundColor: '#145F33',
                                                                                color: 'white'
                                                                            }}
                                                                        >
                                                                            Add Goal
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                            )}
                                        </div>
                                    );
                                })}

                            </div>

                            {/* Add/Edit Goal Modal */}
                            <Dialog open={showAddGoalModal || showEditGoalModal} onOpenChange={(open) => {
                                if (!open) {
                                    setShowAddGoalModal(false);
                                    setShowEditGoalModal(false);
                                    setNewGoal({
                                        goal: "",
                                        goalText: "",
                                        relatedPTPStatement: "",
                                        reasonForGoal: "",
                                        pointPersonName: "",
                                        outcomeDomain: "",
                                        startDate: "",
                                        targetDuration: "",
                                        targetEndDate: "",
                                        endDate: "",
                                        goalPercentage: "",
                                        targetDate: "",
                                        category: "",
                                        parentId: null,
                                        progress: 0,
                                        description: "",
                                        enrollee: "",
                                        badgeType: "",
                                        enrolleeCount: 0
                                    });
                                }
                            }}>
                                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
                                    <DialogHeader>
                                        <DialogTitle className="text-[16px] font-semibold text-[#080707]">
                                            {showEditGoalModal 
                                                ? (editGoalType === 'intermediate' ? 'Edit Intermediate Goal' : 'Edit Major Goal')
                                                : (newGoal.parentId ? 'New Intermediate Goal' : 'New Major Goal')
                                            }
                                        </DialogTitle>
                                        <DialogDescription className="text-[13px] text-[#706e6b]">
                                            {showEditGoalModal 
                                                ? 'Update goal details and track progress toward completion.'
                                                : (newGoal.parentId 
                                                    ? 'Create an intermediate goal that supports the parent major goal.'
                                                    : 'Create a new major goal for the youth\'s treatment plan.'
                                                )
                                            }
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-4">
                                        {/* Goal Title */}
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#706e6b]">Goal Title *</Label>
                                            <Input
                                                value={showEditGoalModal ? editGoalData.goal : newGoal.goal}
                                                onChange={(e) => showEditGoalModal 
                                                    ? setEditGoalData({...editGoalData, goal: e.target.value})
                                                    : setNewGoal({...newGoal, goal: e.target.value})
                                                }
                                                className="h-9 text-[13px] rounded"
                                                style={{
                                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                                }}
                                                placeholder="Enter goal title"
                                            />
                                        </div>

                                        {/* Related PTP Statement */}
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#706e6b]">Related PTP Statement</Label>
                                            <select
                                                value={showEditGoalModal ? editGoalData.relatedPTPStatement : newGoal.relatedPTPStatement}
                                                onChange={(e) => showEditGoalModal
                                                    ? setEditGoalData({...editGoalData, relatedPTPStatement: e.target.value})
                                                    : setNewGoal({...newGoal, relatedPTPStatement: e.target.value})
                                                }
                                                className="h-9 text-[13px] rounded w-full px-2.5"
                                                style={{
                                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                <option value="">-- Select PTP Statement --</option>
                                                <option value="Trauma-Informed Care">Trauma-Informed Care</option>
                                                <option value="Family Engagement">Family Engagement</option>
                                                <option value="Life Skills Development">Life Skills Development</option>
                                                <option value="Educational Support">Educational Support</option>
                                                <option value="Mental Health Services">Mental Health Services</option>
                                            </select>
                                        </div>

                                        {/* Reason for Goal */}
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#706e6b]">Reason for Goal *</Label>
                                            <Textarea
                                                value={showEditGoalModal ? editGoalData.reasonForGoal : newGoal.reasonForGoal}
                                                onChange={(e) => showEditGoalModal
                                                    ? setEditGoalData({...editGoalData, reasonForGoal: e.target.value})
                                                    : setNewGoal({...newGoal, reasonForGoal: e.target.value})
                                                }
                                                className="min-h-[80px] text-[13px] rounded resize-none"
                                                style={{
                                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                                }}
                                                placeholder="Explain why this goal is important..."
                                            />
                                        </div>

                                        {/* Point Person */}
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#706e6b]">Point Person *</Label>
                                            <Input
                                                value={showEditGoalModal ? editGoalData.pointPersonName : newGoal.pointPersonName}
                                                onChange={(e) => showEditGoalModal
                                                    ? setEditGoalData({...editGoalData, pointPersonName: e.target.value})
                                                    : setNewGoal({...newGoal, pointPersonName: e.target.value})
                                                }
                                                className="h-9 text-[13px] rounded"
                                                style={{
                                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                                }}
                                                placeholder="Enter point person name"
                                            />
                                        </div>

                                        {/* Outcome Domain */}
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#706e6b]">Outcome Domain</Label>
                                            <select
                                                value={showEditGoalModal ? editGoalData.outcomeDomain : newGoal.outcomeDomain}
                                                onChange={(e) => showEditGoalModal
                                                    ? setEditGoalData({...editGoalData, outcomeDomain: e.target.value})
                                                    : setNewGoal({...newGoal, outcomeDomain: e.target.value})
                                                }
                                                className="h-9 text-[13px] rounded w-full px-2.5"
                                                style={{
                                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                <option value="">-- Select Outcome Domain --</option>
                                                <option value="Clinical/Behavioral">Clinical/Behavioral</option>
                                                <option value="Educational">Educational</option>
                                                <option value="Family Engagement">Family Engagement</option>
                                                <option value="Life Skills/Transition">Life Skills/Transition</option>
                                                <option value="Social/Emotional">Social/Emotional</option>
                                                <option value="Physical Health">Physical Health</option>
                                            </select>
                                        </div>

                                        {/* Dates Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#706e6b]">Start Date *</Label>
                                                <DateInput
value={isoToMdy(showEditGoalModal ? editGoalData.startDate : newGoal.startDate)}
                                                    onChange={(v) => ((e) => showEditGoalModal
                                                        ? setEditGoalData({...editGoalData, startDate: e.target.value})
                                                        : setNewGoal({...newGoal, startDate: e.target.value})
                                                    )({ target: { value: mdyToIso(v) } })}
                                                    className="h-9 text-[13px] rounded"
                                                    style={{
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#706e6b]">Target Duration</Label>
                                                <select
                                                    value={showEditGoalModal ? editGoalData.targetDuration : newGoal.targetDuration}
                                                    onChange={(e) => {
                                                        const duration = e.target.value;
                                                        const data = showEditGoalModal ? editGoalData : newGoal;
                                                        const setData = showEditGoalModal ? setEditGoalData : setNewGoal;
                                                        
                                                        setData({...data, targetDuration: duration});
                                                        
                                                        // Auto-calculate target end date if start date is set
                                                        if (data.startDate && duration) {
                                                            const startDate = new Date(data.startDate);
                                                            const months = duration === "13weeks" ? 3 : parseInt(duration);
                                                            const targetEnd = new Date(startDate);
                                                            targetEnd.setMonth(targetEnd.getMonth() + months);
                                                            setData({...data, targetDuration: duration, targetEndDate: toLocalIso(targetEnd), targetDate: toLocalIso(targetEnd)});
                                                        }
                                                    }}
                                                    className="h-9 text-[13px] rounded w-full px-2.5"
                                                    style={{
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        borderColor: 'var(--slds-g-color-border-base-1)',
                                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                                    }}
                                                >
                                                    <option value="">-- Select Duration --</option>
                                                    <option value="1">1 Month</option>
                                                    <option value="3">3 Months</option>
                                                    <option value="13weeks">13 Weeks</option>
                                                    <option value="6">6 Months</option>
                                                    <option value="9">9 Months</option>
                                                    <option value="12">12 Months</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#706e6b]">Target End Date *</Label>
                                                <DateInput
value={isoToMdy(showEditGoalModal ? editGoalData.targetEndDate : newGoal.targetEndDate)}
                                                    onChange={(v) => ((e) => showEditGoalModal
                                                        ? setEditGoalData({...editGoalData, targetEndDate: e.target.value, targetDate: e.target.value})
                                                        : setNewGoal({...newGoal, targetEndDate: e.target.value, targetDate: e.target.value})
                                                    )({ target: { value: mdyToIso(v) } })}
                                                    className="h-9 text-[13px] rounded"
                                                    style={{
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#706e6b]">End Date</Label>
                                                <DateInput
value={isoToMdy(showEditGoalModal ? editGoalData.endDate : newGoal.endDate)}
                                                    onChange={(v) => ((e) => showEditGoalModal
                                                        ? setEditGoalData({...editGoalData, endDate: e.target.value})
                                                        : setNewGoal({...newGoal, endDate: e.target.value})
                                                    )({ target: { value: mdyToIso(v) } })}
                                                    className="h-9 text-[13px] rounded"
                                                    style={{
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Enrollee and Category Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#706e6b]">Enrollee *</Label>
                                                <Input
                                                    value={showEditGoalModal ? editGoalData.enrollee : newGoal.enrollee}
                                                    onChange={(e) => showEditGoalModal
                                                        ? setEditGoalData({...editGoalData, enrollee: e.target.value})
                                                        : setNewGoal({...newGoal, enrollee: e.target.value})
                                                    }
                                                    className="h-9 text-[13px] rounded"
                                                    style={{
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                    }}
                                                    placeholder="Youth name"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#706e6b]">Category</Label>
                                                <Input
                                                    value={showEditGoalModal 
                                                        ? (editGoalData.parentId ? "Intermediate Goal" : "Major Goal")
                                                        : (newGoal.parentId ? "Intermediate Goal" : "Major Goal")
                                                    }
                                                    disabled
                                                    className="h-9 text-[13px] rounded"
                                                    style={{
                                                        backgroundColor: 'var(--slds-g-color-background-alt)',
                                                        borderColor: 'var(--slds-g-color-border-base-1)',
                                                        color: 'var(--slds-g-color-text-weak)',
                                                        cursor: 'not-allowed'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Progress (%) */}
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#706e6b]">Progress (%)</Label>
                                            <select
                                                value={showEditGoalModal ? editGoalData.progress : newGoal.progress}
                                                onChange={(e) => showEditGoalModal
                                                    ? setEditGoalData({...editGoalData, progress: parseInt(e.target.value)})
                                                    : setNewGoal({...newGoal, progress: parseInt(e.target.value)})
                                                }
                                                className="h-9 text-[13px] rounded w-full px-2.5"
                                                style={{
                                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                                }}
                                            >
                                                <option value="0">0%</option>
                                                <option value="25">25%</option>
                                                <option value="50">50%</option>
                                                <option value="75">75%</option>
                                                <option value="100">100%</option>
                                            </select>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <div className="flex justify-end gap-2 w-full">
                                            <Button
                                                onClick={() => {
                                                    setShowAddGoalModal(false);
                                                    setShowEditGoalModal(false);
                                                }}
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
                                                onClick={() => {
                                                    if (showEditGoalModal) {
                                                        handleSaveGoal();
                                                    } else {
                                                        handleAddGoal();
                                                    }
                                                    setShowAddGoalModal(false);
                                                    setShowEditGoalModal(false);
                                                }}
                                                className="h-9 px-4 rounded-full text-[13px] font-medium"
                                                style={{
                                                    backgroundColor: '#145F33',
                                                    color: 'white'
                                                }}
                                            >
                                                Save Goal
                                            </Button>
                                        </div>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                        </div>
                    )}

                    {/* Strengths Tab Content */}
    </>
  );
}
