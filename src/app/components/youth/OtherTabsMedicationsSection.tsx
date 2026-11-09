import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
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
import { ChevronRight, Plus, User, Users, Building2, Phone, Mail, CheckSquare, Upload, AlertTriangle, Clock, MapPin, CheckCircle, Pencil, Trash2, ChevronDown, FileText, ChevronUp, Check, X, ChevronLeft, Search, Filter, Calendar, Package, Tag, ClipboardList, ChevronsUpDown, Download, Eye, File, MoreVertical , Calculator, Save } from "@/app/lib/lucide-icons";
import { PrescriptionsSection } from "./PrescriptionsSection";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface OtherTabsMedicationsSectionProps {
  HorizontalTabNav: any;
  activeHorizontalTab: any;
  setActiveHorizontalTab: any;
  addTimeRange: any;
  
  countTypeOptions: any;
  
  
  dosingPeriodOptions: any;
  
  
  
  handleAddPrescription: any;
  handleSavePrescription: any;
  handleViewAllMedications: any;
  isAddPrescriptionDialogOpen: any;
  isMedHistoryDialogOpen: any;
  
  
  medicationHistory: any;
  medicationOptions: any;
  
  packageOptions: any;
  
  prescriptionForm: any;
  removeTimeRange: any;
  
  selectedMedication: any;
  setIsAddPrescriptionDialogOpen: any;
  setIsMedHistoryDialogOpen: any;
  setPrescriptionForm: any;
  
  
  tabs: any;
  
  youthId: any;
}

export function OtherTabsMedicationsSection({ HorizontalTabNav, activeHorizontalTab, setActiveHorizontalTab, addTimeRange, countTypeOptions, dosingPeriodOptions, handleAddPrescription, handleSavePrescription, handleViewAllMedications, isAddPrescriptionDialogOpen, isMedHistoryDialogOpen, medicationHistory, medicationOptions, packageOptions, prescriptionForm, removeTimeRange, selectedMedication, setIsAddPrescriptionDialogOpen, setIsMedHistoryDialogOpen, setPrescriptionForm, tabs, youthId }: OtherTabsMedicationsSectionProps) {
  const navigate = useNavigate();
  return (
    <>
                <div className="p-6 space-y-6 max-w-6xl">
                    <HorizontalTabNav tabs={tabs} activeTab={activeHorizontalTab} onTabChange={setActiveHorizontalTab} />
                    {activeHorizontalTab === "prescriptions" && (
                        <div 
                            className="overflow-hidden"
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                borderRadius: 'var(--slds-c-card-radius-border)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                        >
                            <div 
                                className="px-4 py-3"
                                style={{
                                    borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                                    backgroundColor: 'var(--slds-g-color-background-alt)'
                                }}
                            >
                                {/* Action Buttons */}
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[13px] font-semibold text-[#080707]">Prescriptions</h3>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => {
                                                if (youthId) {
                                                    navigate(`/youth/${youthId}/medication-count`);
                                                }
                                            }}
                                            className="h-8 px-3 rounded-full text-[13px]"
                                            style={{
                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                color: 'var(--slds-g-color-text-default)',
                                                border: '1px solid var(--slds-g-color-border-base-1)'
                                            }}
                                        >
                                            <Calculator className="w-4 h-4 mr-1" />
                                            Count
                                        </Button>
                                        <Button
                                            onClick={handleAddPrescription}
                                            className="h-8 px-3 rounded-full text-[13px]"
                                            style={{
                                                backgroundColor: '#145F33',
                                                color: 'white'
                                            }}
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            Add Prescription
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4">
                                <PrescriptionsSection activeSubTab={null} />
                            </div>
                        </div>
                    )}
                    {activeHorizontalTab === "medication-history" && (
                        <div 
                            className="overflow-hidden"
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                borderRadius: 'var(--slds-c-card-radius-border)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                        >
                            <div 
                                className="px-4 py-3"
                                style={{
                                    borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                                    backgroundColor: 'var(--slds-g-color-background-alt)'
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[13px] font-semibold text-[#080707]">Medication History</h3>
                                    <Button
                                        onClick={handleViewAllMedications}
                                        className="h-7 px-3 rounded-full text-[12px]"
                                        variant="outline"
                                        style={{
                                            borderColor: 'var(--slds-g-color-border-base-4)',
                                            color: '#145F33'
                                        }}
                                    >
                                        <Eye className="w-3.5 h-3.5 mr-1" />
                                        View
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4">
                                {/* Medication History Table */}
                                <div className="space-y-4">
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
                                                        <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '25%' }}>
                                                            Medication
                                                        </th>
                                                        <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '12%' }}>
                                                            Start Date
                                                        </th>
                                                        <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '12%' }}>
                                                            End Date
                                                        </th>
                                                        <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '15%' }}>
                                                            Dose
                                                        </th>
                                                        <th className="px-3 py-2 text-center font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '11%' }}>
                                                            Psychotropic
                                                        </th>
                                                        <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '25%' }}>
                                                            Details
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {medicationHistory.map((med, index) => (
                                                        <tr key={med.id} style={{ borderBottom: index < medicationHistory.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                            <td className="px-3 py-3 text-[#080707] font-medium">{med.name}</td>
                                                            <td className="px-3 py-3 text-[#706e6b]">{med.startDate}</td>
                                                            <td className="px-3 py-3 text-[#706e6b]">{med.endDate}</td>
                                                            <td className="px-3 py-3 text-[#706e6b]">{med.dose}</td>
                                                            <td className="px-3 py-3 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={med.psychotropic}
                                                                    disabled
                                                                    className="w-4 h-4"
                                                                    style={{ accentColor: '#145F33' }}
                                                                />
                                                            </td>
                                                            <td className="px-3 py-3 text-[#706e6b]">{med.details}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Medication History Detail Dialog */}
                            <Dialog open={isMedHistoryDialogOpen} onOpenChange={setIsMedHistoryDialogOpen}>
                                <DialogContent
                                    className="max-w-3xl max-h-[90vh] flex flex-col"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        padding: 0
                                    }}
                                >
                                    <DialogHeader
                                        className="px-6 pt-6 pb-4 border-b"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                    >
                                        <DialogTitle className="text-[15px] font-semibold text-[#080707]">
                                            Medication History Details
                                        </DialogTitle>
                                        <DialogDescription className="text-[13px] mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Complete medication information and historical record
                                        </DialogDescription>
                                    </DialogHeader>

                                    {/* Scrollable Body Content */}
                                    <div className="flex-1 overflow-y-auto px-6 py-6">
                                        {selectedMedication === null ? (
                                            /* Show All Medications View */
                                            <div className="space-y-4">
                                                {medicationHistory.map((med, index) => (
                                                    <div
                                                        key={med.id}
                                                        className="p-4 rounded-lg"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-alt)',
                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                        }}
                                                    >
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div>
                                                                <h4 className="text-[14px] font-semibold text-[#080707]">{med.name}</h4>
                                                                <p className="text-[12px] text-[#706e6b] mt-0.5">{med.genericName}</p>
                                                            </div>
                                                            <Badge
                                                                className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                                                style={{
                                                                    backgroundColor: med.psychotropic ? '#145F33' : '#706e6b',
                                                                    color: '#fff'
                                                                }}
                                                            >
                                                                {med.psychotropic ? 'Psychotropic' : 'Non-Psychotropic'}
                                                            </Badge>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                                            <div>
                                                                <span className="text-[11px] font-medium text-[#080707]">Dose: </span>
                                                                <span className="text-[12px] text-[#706e6b]">{med.dose}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[11px] font-medium text-[#080707]">Duration: </span>
                                                                <span className="text-[12px] text-[#706e6b]">{med.startDate} - {med.endDate}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="space-y-2">
                                                            <div>
                                                                <span className="text-[11px] font-medium text-[#080707]">Reason: </span>
                                                                <span className="text-[12px] text-[#706e6b]">{med.reason}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[11px] font-medium text-[#080707]">Details: </span>
                                                                <span className="text-[12px] text-[#706e6b]">{med.details}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : selectedMedication && (
                                            <div className="space-y-6">
                                                {/* Basic Information */}
                                                <div>
                                                    <h4 className="text-[13px] font-semibold text-[#080707] mb-3">Basic Information</h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <Label className="text-[11px] font-medium text-[#080707]">Medication Name</Label>
                                                            <div className="text-[13px] text-[#080707] font-medium">{selectedMedication.name}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[11px] font-medium text-[#080707]">Generic Name</Label>
                                                            <div className="text-[13px] text-[#706e6b]">{selectedMedication.genericName}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[11px] font-medium text-[#080707]">Dose</Label>
                                                            <div className="text-[13px] text-[#706e6b]">{selectedMedication.dose}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[11px] font-medium text-[#080707]">Psychotropic</Label>
                                                            <div className="text-[13px] text-[#706e6b]">
                                                                <Badge
                                                                    className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                                                    style={{
                                                                        backgroundColor: selectedMedication.psychotropic ? '#145F33' : '#706e6b',
                                                                        color: '#fff'
                                                                    }}
                                                                >
                                                                    {selectedMedication.psychotropic ? 'Yes' : 'No'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Timeline Information */}
                                                <div>
                                                    <h4 className="text-[13px] font-semibold text-[#080707] mb-3">Timeline</h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <Label className="text-[11px] font-medium text-[#080707]">Start Date</Label>
                                                            <div className="text-[13px] text-[#706e6b]">{selectedMedication.startDate}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[11px] font-medium text-[#080707]">End Date</Label>
                                                            <div className="text-[13px] text-[#706e6b]">{selectedMedication.endDate}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Prescriber & Pharmacy */}
                                                <div>
                                                    <h4 className="text-[13px] font-semibold text-[#080707] mb-3">Prescriber & Pharmacy</h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <Label className="text-[11px] font-medium text-[#080707]">Prescriber</Label>
                                                            <div className="text-[13px] text-[#706e6b]">{selectedMedication.prescriber}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[11px] font-medium text-[#080707]">Pharmacy</Label>
                                                            <div className="text-[13px] text-[#706e6b]">{selectedMedication.pharmacy}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Clinical Information */}
                                                <div>
                                                    <h4 className="text-[13px] font-semibold text-[#080707] mb-3">Clinical Information</h4>
                                                    <div className="space-y-4">
                                                        <div className="space-y-1">
                                                            <Label className="text-[11px] font-medium text-[#080707]">Reason for Prescription</Label>
                                                            <div className="text-[13px] text-[#706e6b]">{selectedMedication.reason}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[11px] font-medium text-[#080707]">Side Effects</Label>
                                                            <div className="text-[13px] text-[#706e6b]">{selectedMedication.sideEffects}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[11px] font-medium text-[#080707]">Reason for Discontinuation</Label>
                                                            <div className="text-[13px] text-[#706e6b]">{selectedMedication.discontinuedReason}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Additional Notes */}
                                                <div>
                                                    <h4 className="text-[13px] font-semibold text-[#080707] mb-3">Additional Notes</h4>
                                                    <div
                                                        className="p-3 rounded text-[13px] text-[#706e6b]"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-alt)',
                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                        }}
                                                    >
                                                        {selectedMedication.notes}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <DialogFooter
                                        className="px-6 py-4 border-t"
                                        style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                    >
                                        <Button
                                            onClick={() => setIsMedHistoryDialogOpen(false)}
                                            className="h-9 px-4 rounded-full text-[13px]"
                                            style={{
                                                backgroundColor: '#145F33',
                                                color: 'white'
                                            }}
                                        >
                                            Close
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}

                    {/* Add Prescription Dialog - Available across all tabs */}
                    <Dialog open={isAddPrescriptionDialogOpen} onOpenChange={setIsAddPrescriptionDialogOpen}>
                        <DialogContent
                            className="max-w-5xl max-h-[90vh] flex flex-col"
                            style={{
                                backgroundColor: 'var(--slds-g-color-background-base)',
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                padding: 0
                            }}
                        >
                            <DialogHeader
                                className="px-6 pt-6 pb-4 border-b"
                                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                            >
                                <DialogTitle className="text-[15px] font-semibold text-[#080707]">
                                    Add Prescription
                                </DialogTitle>
                                <DialogDescription className="text-[13px] mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                    Enter prescription details and dosing information
                                </DialogDescription>
                            </DialogHeader>

                            {/* Scrollable Body Content */}
                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                <div className="space-y-6">
                                    {/* Basic Information */}
                                    <div>
                                        <h4 className="text-[13px] font-semibold text-[#080707] mb-3">Basic Information</h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-medium" style={{ color: '#d8372a' }}>Medication *</Label>
                                                <Select
                                                    value={prescriptionForm.medication}
                                                    onValueChange={(value) => setPrescriptionForm({ ...prescriptionForm, medication: value })}
                                                >
                                                    <SelectTrigger
                                                        className="h-9 text-[13px] rounded"
                                                        style={{
                                                            borderColor: 'var(--slds-g-color-border-base-4)',
                                                            backgroundColor: 'var(--slds-g-color-background-base)'
                                                        }}
                                                    >
                                                        <SelectValue placeholder="Select medication..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {medicationOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-medium" style={{ color: '#d8372a' }}>Package *</Label>
                                                <Select
                                                    value={prescriptionForm.package}
                                                    onValueChange={(value) => setPrescriptionForm({ ...prescriptionForm, package: value })}
                                                >
                                                    <SelectTrigger
                                                        className="h-9 text-[13px] rounded"
                                                        style={{
                                                            borderColor: 'var(--slds-g-color-border-base-4)',
                                                            backgroundColor: 'var(--slds-g-color-background-base)'
                                                        }}
                                                    >
                                                        <SelectValue placeholder="Select package..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {packageOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-medium" style={{ color: '#d8372a' }}>Dose *</Label>
                                                <Input
                                                    value={prescriptionForm.dose}
                                                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dose: e.target.value })}
                                                    placeholder="e.g., 10mg"
                                                    className="h-9 text-[13px] rounded"
                                                    style={{
                                                        borderColor: 'var(--slds-g-color-border-base-4)',
                                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-medium" style={{ color: '#d8372a' }}>Start Date *</Label>
                                                <DateInput
value={isoToMdy(prescriptionForm.startDate)}
                                                    onChange={(v) => ((e) => setPrescriptionForm({ ...prescriptionForm, startDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
                                                    className="h-9 text-[13px] rounded"
                                                    style={{
                                                        borderColor: 'var(--slds-g-color-border-base-4)',
                                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-medium text-[#080707]">End Date</Label>
                                                <DateInput
value={isoToMdy(prescriptionForm.endDate)}
                                                    onChange={(v) => ((e) => setPrescriptionForm({ ...prescriptionForm, endDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
                                                    className="h-9 text-[13px] rounded"
                                                    style={{
                                                        borderColor: 'var(--slds-g-color-border-base-4)',
                                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-1.5 flex items-end">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={prescriptionForm.consentReceived}
                                                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, consentReceived: e.target.checked })}
                                                        className="w-4 h-4 rounded"
                                                        style={{ accentColor: '#145F33' }}
                                                    />
                                                    <span className="text-[13px] text-[#080707]">Consent Received</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dosing Schedule */}
                                    <div>
                                        <h4 className="text-[13px] font-semibold text-[#080707] mb-3">Dosing Schedule</h4>
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-medium" style={{ color: '#d8372a' }}>Dosing Period *</Label>
                                                <Select
                                                    value={prescriptionForm.dosingPeriod}
                                                    onValueChange={(value) => setPrescriptionForm({ ...prescriptionForm, dosingPeriod: value })}
                                                >
                                                    <SelectTrigger
                                                        className="h-9 text-[13px] rounded"
                                                        style={{
                                                            borderColor: 'var(--slds-g-color-border-base-4)',
                                                            backgroundColor: 'var(--slds-g-color-background-base)'
                                                        }}
                                                    >
                                                        <SelectValue placeholder="Select dosing period..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {dosingPeriodOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Days of Week */}
                                            <div>
                                                <Label className="text-[11px] font-medium text-[#080707] mb-1.5 block">Days of Week</Label>
                                                <div className="flex gap-3 flex-wrap">
                                                    {Object.entries(prescriptionForm.days).map(([day, checked]) => (
                                                        <label key={day} className="flex items-center gap-1.5 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={(e) => setPrescriptionForm({
                                                                    ...prescriptionForm,
                                                                    days: { ...prescriptionForm.days, [day]: e.target.checked }
                                                                })}
                                                                className="w-4 h-4 rounded"
                                                                style={{ accentColor: '#145F33' }}
                                                            />
                                                            <span className="text-[13px] text-[#080707] capitalize">{day.slice(0, 3)}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Time Ranges */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <Label className="text-[11px] font-medium text-[#080707]">Time Ranges</Label>
                                                    <Button
                                                        onClick={addTimeRange}
                                                        variant="outline"
                                                        className="h-7 px-2 rounded-full text-[12px]"
                                                        style={{
                                                            borderColor: 'var(--slds-g-color-border-base-4)',
                                                            color: '#145F33'
                                                        }}
                                                    >
                                                        <Plus className="w-3.5 h-3.5 mr-1" />
                                                        Add Range
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    {prescriptionForm.timeRanges.map((range, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <Input
                                                                type="time"
                                                                value={range.from}
                                                                onChange={(e) => {
                                                                    const newRanges = [...prescriptionForm.timeRanges];
                                                                    newRanges[index].from = e.target.value;
                                                                    setPrescriptionForm({ ...prescriptionForm, timeRanges: newRanges });
                                                                }}
                                                                placeholder="From"
                                                                className="h-9 text-[13px] rounded flex-1"
                                                                style={{
                                                                    borderColor: 'var(--slds-g-color-border-base-4)',
                                                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                                                }}
                                                            />
                                                            <span className="text-[13px] text-[#706e6b]">to</span>
                                                            <Input
                                                                type="time"
                                                                value={range.to}
                                                                onChange={(e) => {
                                                                    const newRanges = [...prescriptionForm.timeRanges];
                                                                    newRanges[index].to = e.target.value;
                                                                    setPrescriptionForm({ ...prescriptionForm, timeRanges: newRanges });
                                                                }}
                                                                placeholder="To"
                                                                className="h-9 text-[13px] rounded flex-1"
                                                                style={{
                                                                    borderColor: 'var(--slds-g-color-border-base-4)',
                                                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                                                }}
                                                            />
                                                            {prescriptionForm.timeRanges.length > 1 && (
                                                                <Button
                                                                    onClick={() => removeTimeRange(index)}
                                                                    variant="ghost"
                                                                    className="h-9 w-9 p-0 rounded-full"
                                                                    style={{ color: '#706e6b' }}
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Clinical Information */}
                                    <div>
                                        <h4 className="text-[13px] font-semibold text-[#080707] mb-3">Clinical Information</h4>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-medium text-[#080707]">Treatment Purpose</Label>
                                                    <Input
                                                        value={prescriptionForm.treatmentPurpose}
                                                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, treatmentPurpose: e.target.value })}
                                                        placeholder="e.g., ADHD management, anxiety reduction"
                                                        className="h-9 text-[13px] rounded"
                                                        style={{
                                                            borderColor: 'var(--slds-g-color-border-base-4)',
                                                            backgroundColor: 'var(--slds-g-color-background-base)'
                                                        }}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-medium text-[#080707]">Dosing Limits</Label>
                                                    <Input
                                                        value={prescriptionForm.dosingLimits}
                                                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosingLimits: e.target.value })}
                                                        placeholder="e.g., Maximum 2 doses per day"
                                                        className="h-9 text-[13px] rounded"
                                                        style={{
                                                            borderColor: 'var(--slds-g-color-border-base-4)',
                                                            backgroundColor: 'var(--slds-g-color-background-base)'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-medium text-[#080707]">Count Type</Label>
                                                    <Select
                                                        value={prescriptionForm.countType}
                                                        onValueChange={(value) => setPrescriptionForm({ ...prescriptionForm, countType: value })}
                                                    >
                                                        <SelectTrigger
                                                            className="h-9 text-[13px] rounded"
                                                            style={{
                                                                borderColor: 'var(--slds-g-color-border-base-4)',
                                                                backgroundColor: 'var(--slds-g-color-background-base)'
                                                            }}
                                                        >
                                                            <SelectValue placeholder="Select count type..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {countTypeOptions.map((option) => (
                                                                <SelectItem key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-medium text-[#080707]">Count</Label>
                                                    <Input
                                                        type="number"
                                                        value={prescriptionForm.count}
                                                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, count: e.target.value })}
                                                        placeholder="e.g., 30"
                                                        className="h-9 text-[13px] rounded"
                                                        style={{
                                                            borderColor: 'var(--slds-g-color-border-base-4)',
                                                            backgroundColor: 'var(--slds-g-color-background-base)'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div>
                                        <h4 className="text-[13px] font-semibold text-[#080707] mb-3">Instructions</h4>
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-medium text-[#080707]">Administration Instructions</Label>
                                            <Textarea
                                                value={prescriptionForm.instructions}
                                                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })}
                                                placeholder="Enter detailed instructions for medication administration..."
                                                rows={4}
                                                className="text-[13px] rounded resize-none"
                                                style={{
                                                    borderColor: 'var(--slds-g-color-border-base-4)',
                                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <DialogFooter
                                className="px-6 py-4 border-t flex gap-2"
                                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                            >
                                <Button
                                    onClick={() => setIsAddPrescriptionDialogOpen(false)}
                                    variant="outline"
                                    className="h-9 px-4 rounded-full text-[13px]"
                                    style={{
                                        borderColor: 'var(--slds-g-color-border-base-4)',
                                        color: '#706e6b'
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSavePrescription}
                                    className="h-9 px-4 rounded-full text-[13px]"
                                    style={{
                                        backgroundColor: '#145F33',
                                        color: 'white'
                                    }}
                                >
                                    <Save className="w-4 h-4 mr-1.5" />
                                    Save Prescription
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
    </>
  );
}
