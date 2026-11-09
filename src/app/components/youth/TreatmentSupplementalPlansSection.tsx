import { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Plus, Pencil, Trash2 } from "@/app/lib/lucide-icons";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, formatMdy, localTodayIso } from "../../lib/dateFormat";

interface TreatmentSupplementalPlansSectionProps {
    addPlanTrigger?: number;
}

export function TreatmentSupplementalPlansSection({ addPlanTrigger = 0 }: TreatmentSupplementalPlansSectionProps) {
    // Supplemental Plans state
    const [supplementalPlans, setSupplementalPlans] = useState([
        { id: 1, planType: "Safety Plan", description: "Comprehensive safety protocols for crisis situations including contact numbers and coping strategies", fileEvaluationDate: "2024-12-01", endDate: "2025-06-01" },
        { id: 2, planType: "Crisis Intervention Plan", description: "Step-by-step procedures for managing acute mental health crises with designated response team", fileEvaluationDate: "2024-12-01", endDate: "2025-06-01" },
        { id: 3, planType: "Family Support Plan", description: "Structured family engagement activities and communication guidelines to strengthen support system", fileEvaluationDate: "2024-12-05", endDate: "2025-06-05" },
        { id: 4, planType: "Educational Support Plan", description: "Academic accommodations and tutoring schedule aligned with IEP goals", fileEvaluationDate: "2024-12-10", endDate: "2025-05-30" }
    ]);
    const [showAddPlan, setShowAddPlan] = useState(false);
    const [newPlan, setNewPlan] = useState({
        planType: "",
        description: "",
        fileEvaluationDate: "",
        endDate: ""
    });
    const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
    const [editPlanData, setEditPlanData] = useState({
        planType: "",
        description: "",
        fileEvaluationDate: "",
        endDate: ""
    });

    // Required Signatures mock data
    const [signatures, setSignatures] = useState([
        { id: 1, role: "Case Manager", name: "Sarah Mitchell", dateSigned: "2025-01-15", status: "Signed" },
        { id: 2, role: "Clinical Supervisor", name: "Dr. James Rivera", dateSigned: "2025-01-16", status: "Signed" },
        { id: 3, role: "Youth/Client", name: "Marcus Thompson", dateSigned: "", status: "Pending" },
        { id: 4, role: "Parent/Guardian", name: "Linda Thompson", dateSigned: "", status: "Pending" },
        { id: 5, role: "Program Director", name: "Angela Price", dateSigned: "2025-01-17", status: "Signed" },
    ]);
    const [showEditSignatures, setShowEditSignatures] = useState(false);

    const [addDialogTab, setAddDialogTab] = useState<"overview" | "plan-details" | "services" | "progress-tracking">("overview");
    const [editDialogTab, setEditDialogTab] = useState<"overview" | "plan-details" | "services" | "progress-tracking">("overview");

    // Services tab state
    const emptyServices = {
        serviceType: "",
        provider: "",
        frequency: "",
        startDate: "",
        notes: ""
    };
    const [newPlanServices, setNewPlanServices] = useState(emptyServices);
    const [editPlanServices, setEditPlanServices] = useState(emptyServices);

    const emptyPlanDetails = {
        agreementType: "",
        reasonsForAgreement: "",
        previousSupports: "",
        youthCommitsTo: "",
        supportSystemCanHelpBy: "",
        expectedBenefits: "",
        expectedConsequences: ""
    };
    const [newPlanDetails, setNewPlanDetails] = useState(emptyPlanDetails);
    const [editPlanDetails, setEditPlanDetails] = useState(emptyPlanDetails);

    // Progress Tracking state
    const [newPlanProgressEntries, setNewPlanProgressEntries] = useState<{date: string; comment: string; createdBy: string}[]>([]);
    const [editPlanProgressEntries, setEditPlanProgressEntries] = useState<{date: string; comment: string; createdBy: string}[]>([]);
    const [showProgressEntryDialog, setShowProgressEntryDialog] = useState(false);
    const [editingProgressIndex, setEditingProgressIndex] = useState<number | null>(null);
    const [progressEntryForm, setProgressEntryForm] = useState({ date: '', comment: '', createdBy: 'Current User' });
    const [progressDialogContext, setProgressDialogContext] = useState<'add' | 'edit'>('add');

    useEffect(() => {
        if (addPlanTrigger > 0) {
            setShowAddPlan(true);
        }
    }, [addPlanTrigger]);

    const handleDeletePlan = (id: number) => {
        setSupplementalPlans(supplementalPlans.filter(p => p.id !== id));
    };

    const handleEditPlan = (id: number) => {
        const plan = supplementalPlans.find(p => p.id === id);
        if (plan) {
            setEditingPlanId(id);
            setEditPlanData({
                planType: plan.planType,
                description: plan.description,
                fileEvaluationDate: plan.fileEvaluationDate,
                endDate: plan.endDate
            });
        }
    };

    const handleSavePlan = () => {
        if (!editPlanData.planType || !editPlanData.description) return;
        
        setSupplementalPlans(supplementalPlans.map(p => {
            if (p.id === editingPlanId) {
                return {
                    ...p,
                    planType: editPlanData.planType,
                    description: editPlanData.description,
                    fileEvaluationDate: editPlanData.fileEvaluationDate,
                    endDate: editPlanData.endDate
                };
            }
            return p;
        }));
        setEditingPlanId(null);
        setEditPlanData({
            planType: "",
            description: "",
            fileEvaluationDate: "",
            endDate: ""
        });
        setEditPlanDetails(emptyPlanDetails);
        setEditPlanProgressEntries([]);
        setEditPlanServices(emptyServices);
        setEditDialogTab("overview");
    };

    const handleCancelEditPlan = () => {
        setEditingPlanId(null);
        setEditPlanData({
            planType: "",
            description: "",
            fileEvaluationDate: "",
            endDate: ""
        });
        setEditPlanDetails(emptyPlanDetails);
        setEditPlanProgressEntries([]);
        setEditPlanServices(emptyServices);
        setEditDialogTab("overview");
    };

    const handleAddPlan = () => {
        if (!newPlan.planType || !newPlan.description) return;
        
        const newId = Math.max(...supplementalPlans.map(p => p.id), 0) + 1;
        setSupplementalPlans([...supplementalPlans, { id: newId, ...newPlan }]);
        setNewPlan({ planType: "", description: "", fileEvaluationDate: "", endDate: "" });
        setNewPlanDetails(emptyPlanDetails);
        setNewPlanProgressEntries([]);
        setNewPlanServices(emptyServices);
        setShowAddPlan(false);
        setAddDialogTab("overview");
    };

    const handleCloseAddDialog = () => {
        setShowAddPlan(false);
        setNewPlan({ planType: "", description: "", fileEvaluationDate: "", endDate: "" });
        setNewPlanDetails(emptyPlanDetails);
        setNewPlanProgressEntries([]);
        setNewPlanServices(emptyServices);
        setAddDialogTab("overview");
    };

    return (
        <div className="space-y-4">
            {/* Add Plan Dialog */}
            <Dialog open={showAddPlan} onOpenChange={(open) => { if (!open) handleCloseAddDialog(); }}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-[15px] text-[#080707]">Add Supplemental Plan</DialogTitle>
                        <DialogDescription className="text-[12px]">
                            Fill in the details below to add a new supplemental plan.
                        </DialogDescription>
                    </DialogHeader>
                    {/* Tabs for Add Plan Dialog */}
                    <div className="flex gap-0" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                        {(["overview", "plan-details", "services", "progress-tracking"] as const).map((tab) => {
                            const labels = { "overview": "Overview", "plan-details": "Plan Details", "services": "Services", "progress-tracking": "Progress Tracking" };
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setAddDialogTab(tab)}
                                    className="px-4 py-2 text-[12px] relative transition-colors"
                                    style={{
                                        color: addDialogTab === tab ? '#145F33' : '#706e6b',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {labels[tab]}
                                    {addDialogTab === tab && (
                                        <span className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: '#145F33' }} />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {addDialogTab === "overview" && (
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Plan Type</Label>
                                <Select
                                    value={newPlan.planType}
                                    onValueChange={(value) => setNewPlan({...newPlan, planType: value})}
                                >
                                    <SelectTrigger className="h-8 text-[13px] rounded w-full px-2 border outline-none">
                                        <SelectValue placeholder="Select plan type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Program Agreement">Program Agreement</SelectItem>
                                        <SelectItem value="Academy Agreement">Academy Agreement</SelectItem>
                                        <SelectItem value="Creative Treatment Intervention">Creative Treatment Intervention</SelectItem>
                                        <SelectItem value="Harm Risk Assessment">Harm Risk Assessment</SelectItem>
                                        <SelectItem value="IEP">IEP</SelectItem>
                                        <SelectItem value="504">504</SelectItem>
                                        <SelectItem value="No Harm Contract">No Harm Contract</SelectItem>
                                        <SelectItem value="Relapse Prevention Plan">Relapse Prevention Plan</SelectItem>
                                        <SelectItem value="Self Harm Safety Plan">Self Harm Safety Plan</SelectItem>
                                        <SelectItem value="Study Time Plan">Study Time Plan</SelectItem>
                                        <SelectItem value="Suicide Prevention Agreement">Suicide Prevention Agreement</SelectItem>
                                        <SelectItem value="Academic Service Plan">Academic Service Plan</SelectItem>
                                        <SelectItem value="Passion Plan">Passion Plan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Re-Evaluation Date</Label>
                                <DateInput
value={isoToMdy(newPlan.fileEvaluationDate)}
                                    onChange={(v) => ((e) => setNewPlan({...newPlan, fileEvaluationDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                    className="h-8 text-[13px] rounded"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">End Date</Label>
                                <DateInput
value={isoToMdy(newPlan.endDate)}
                                    onChange={(v) => ((e) => setNewPlan({...newPlan, endDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                    className="h-8 text-[13px] rounded"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-medium text-[#080707]">Plan Description</Label>
                            <Textarea
                                value={newPlan.description}
                                onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                                className="text-[13px] rounded min-h-[80px]"
                                style={{
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                }}
                                placeholder="Enter plan description"
                            />
                        </div>

                        {/* Required Signatures Section */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-[11px] font-medium text-[#080707]">Required Signatures</Label>
                                <Button
                                    onClick={() => setShowEditSignatures(!showEditSignatures)}
                                    className="h-7 px-2.5 rounded-full text-[11px]"
                                    style={{
                                        backgroundColor: '#145F33',
                                        color: 'white'
                                    }}
                                >
                                    <Pencil className="w-3 h-3 mr-1" />
                                    Edit Signatures
                                </Button>
                            </div>
                            <div
                                className="rounded overflow-hidden"
                                style={{
                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                }}
                            >
                                <table className="w-full text-[12px]">
                                    <thead>
                                        <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                            <th className="px-3 py-1.5 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Role</th>
                                            <th className="px-3 py-1.5 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Name</th>
                                            <th className="px-3 py-1.5 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Date Signed</th>
                                            <th className="px-3 py-1.5 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {signatures.map((sig, index) => (
                                            <tr
                                                key={sig.id}
                                                style={{
                                                    borderBottom: index < signatures.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                                }}
                                            >
                                                <td className="px-3 py-1.5 text-[#080707]">{sig.role}</td>
                                                <td className="px-3 py-1.5 text-[#080707]">{sig.name}</td>
                                                <td className="px-3 py-1.5 text-[#706e6b]">{sig.dateSigned || "—"}</td>
                                                <td className="px-3 py-1.5">
                                                    <span
                                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px]"
                                                        style={{
                                                            backgroundColor: sig.status === "Signed" ? '#e6f7ee' : '#fef3e8',
                                                            color: sig.status === "Signed" ? '#145F33' : '#a5600b'
                                                        }}
                                                    >
                                                        {sig.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    )}

                    {addDialogTab === "plan-details" && (
                        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
                            <p className="text-[12px] text-[#706e6b]" style={{ borderLeft: '3px solid #0176d3', paddingLeft: '8px' }}>
                                Please enter at least one response per field below.
                            </p>

                            {/* Agreement Type */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Agreement Type</Label>
                                <Select
                                    value={newPlanDetails.agreementType}
                                    onValueChange={(value) => setNewPlanDetails({...newPlanDetails, agreementType: value})}
                                >
                                    <SelectTrigger className="h-8 text-[13px]">
                                        <SelectValue placeholder="Please Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Safety">Safety</SelectItem>
                                        <SelectItem value="Hygiene">Hygiene</SelectItem>
                                        <SelectItem value="Budgeting">Budgeting</SelectItem>
                                        <SelectItem value="Behavior">Behavior</SelectItem>
                                        <SelectItem value="Education-School">Education-School</SelectItem>
                                        <SelectItem value="Employment">Employment</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Reasons For Agreement */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Reasons For Agreement</Label>
                                <Textarea
                                    value={newPlanDetails.reasonsForAgreement}
                                    onChange={(e) => setNewPlanDetails({...newPlanDetails, reasonsForAgreement: e.target.value})}
                                    className="text-[13px] rounded min-h-[72px]"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="Describe the reasons this agreement is being created..."
                                />
                            </div>

                            {/* Previous Supports or Interventions */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Previous Supports or Interventions</Label>
                                <Textarea
                                    value={newPlanDetails.previousSupports}
                                    onChange={(e) => setNewPlanDetails({...newPlanDetails, previousSupports: e.target.value})}
                                    className="text-[13px] rounded min-h-[72px]"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="List any supports or interventions previously attempted..."
                                />
                            </div>

                            {/* Youth Commits To */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Youth Commits To</Label>
                                <Textarea
                                    value={newPlanDetails.youthCommitsTo}
                                    onChange={(e) => setNewPlanDetails({...newPlanDetails, youthCommitsTo: e.target.value})}
                                    className="text-[13px] rounded min-h-[72px]"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="Describe what the youth commits to as part of this agreement..."
                                />
                            </div>

                            {/* Support System Can Help By */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Support System Can Help By</Label>
                                <Textarea
                                    value={newPlanDetails.supportSystemCanHelpBy}
                                    onChange={(e) => setNewPlanDetails({...newPlanDetails, supportSystemCanHelpBy: e.target.value})}
                                    className="text-[13px] rounded min-h-[72px]"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="Describe how the support system can assist..."
                                />
                            </div>

                            {/* Expected Benefits if Agreement is Successful */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Expected Benefits if Agreement is Successful</Label>
                                <Textarea
                                    value={newPlanDetails.expectedBenefits}
                                    onChange={(e) => setNewPlanDetails({...newPlanDetails, expectedBenefits: e.target.value})}
                                    className="text-[13px] rounded min-h-[72px]"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="Describe the expected positive outcomes..."
                                />
                            </div>

                            {/* Expected Consequences if Agreement is Not Successful */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Expected Consequences if Agreement is Not Successful</Label>
                                <Textarea
                                    value={newPlanDetails.expectedConsequences}
                                    onChange={(e) => setNewPlanDetails({...newPlanDetails, expectedConsequences: e.target.value})}
                                    className="text-[13px] rounded min-h-[72px]"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="Describe the consequences if the agreement is not followed..."
                                />
                            </div>
                        </div>
                    )}

                    {addDialogTab === "services" && (
                        <div className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-medium text-[#080707]">Service Type</Label>
                                    <Select
                                        value={newPlanServices.serviceType}
                                        onValueChange={(value) => setNewPlanServices({...newPlanServices, serviceType: value})}
                                    >
                                        <SelectTrigger className="h-8 text-[13px]">
                                            <SelectValue placeholder="Select service type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Individual Therapy">Individual Therapy</SelectItem>
                                            <SelectItem value="Group Therapy">Group Therapy</SelectItem>
                                            <SelectItem value="Family Therapy">Family Therapy</SelectItem>
                                            <SelectItem value="Psychiatric Services">Psychiatric Services</SelectItem>
                                            <SelectItem value="Case Management">Case Management</SelectItem>
                                            <SelectItem value="Educational Support">Educational Support</SelectItem>
                                            <SelectItem value="Vocational Training">Vocational Training</SelectItem>
                                            <SelectItem value="Substance Abuse Counseling">Substance Abuse Counseling</SelectItem>
                                            <SelectItem value="Recreational Therapy">Recreational Therapy</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-medium text-[#080707]">Provider</Label>
                                    <Input
                                        value={newPlanServices.provider}
                                        onChange={(e) => setNewPlanServices({...newPlanServices, provider: e.target.value})}
                                        className="h-8 text-[13px] rounded"
                                        style={{
                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                        }}
                                        placeholder="Enter provider name..."
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-medium text-[#080707]">Frequency</Label>
                                    <Select
                                        value={newPlanServices.frequency}
                                        onValueChange={(value) => setNewPlanServices({...newPlanServices, frequency: value})}
                                    >
                                        <SelectTrigger className="h-8 text-[13px]">
                                            <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Daily">Daily</SelectItem>
                                            <SelectItem value="Weekly">Weekly</SelectItem>
                                            <SelectItem value="Bi-Weekly">Bi-Weekly</SelectItem>
                                            <SelectItem value="Monthly">Monthly</SelectItem>
                                            <SelectItem value="As Needed">As Needed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-medium text-[#080707]">Start Date</Label>
                                    <DateInput
value={isoToMdy(newPlanServices.startDate)}
                                        onChange={(v) => ((e) => setNewPlanServices({...newPlanServices, startDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                        className="h-8 text-[13px] rounded"
                                        style={{
                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Notes</Label>
                                <Textarea
                                    value={newPlanServices.notes}
                                    onChange={(e) => setNewPlanServices({...newPlanServices, notes: e.target.value})}
                                    className="text-[13px] rounded min-h-[72px]"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="Additional notes about the service..."
                                />
                            </div>
                        </div>
                    )}

                    {addDialogTab === "progress-tracking" && (
                        <div className="min-h-[200px]">
                            {/* Progress Tracking Header */}
                            <div 
                                className="flex items-center justify-between px-3 py-2 mb-2"
                                style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                            >
                                <span className="text-[13px] font-semibold text-[#080707]">Progress Tracking:</span>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProgressEntryForm({ date: localTodayIso(), comment: '', createdBy: 'Current User' });
                                            setEditingProgressIndex(null);
                                            setProgressDialogContext('add');
                                            setShowProgressEntryDialog(true);
                                        }}
                                        className="text-[12px] text-[#0176d3] hover:underline cursor-pointer bg-transparent border-none p-0"
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (newPlanProgressEntries.length > 0) {
                                                const last = newPlanProgressEntries[newPlanProgressEntries.length - 1];
                                                setProgressEntryForm({ date: last.date, comment: last.comment, createdBy: last.createdBy });
                                                setEditingProgressIndex(newPlanProgressEntries.length - 1);
                                                setProgressDialogContext('add');
                                                setShowProgressEntryDialog(true);
                                            }
                                        }}
                                        className="text-[12px] text-[#0176d3] hover:underline cursor-pointer bg-transparent border-none p-0"
                                        style={{ opacity: newPlanProgressEntries.length === 0 ? 0.4 : 1 }}
                                    >
                                        Modify
                                    </button>
                                </div>
                            </div>
                            {/* Progress Tracking Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <th className="text-[11px] font-semibold text-[#080707] px-3 py-2 w-[120px]">Date</th>
                                            <th className="text-[11px] font-semibold text-[#080707] px-3 py-2">Comment</th>
                                            <th className="text-[11px] font-semibold text-[#080707] px-3 py-2 w-[140px]">Created By</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {newPlanProgressEntries.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="text-center py-8 text-[13px] text-[#706e6b]">
                                                    No progress entries recorded.
                                                </td>
                                            </tr>
                                        ) : (
                                            newPlanProgressEntries.map((entry, idx) => (
                                                <tr 
                                                    key={idx}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                    onClick={() => {
                                                        setProgressEntryForm({ date: entry.date, comment: entry.comment, createdBy: entry.createdBy });
                                                        setEditingProgressIndex(idx);
                                                        setProgressDialogContext('add');
                                                        setShowProgressEntryDialog(true);
                                                    }}
                                                    style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                                                >
                                                    <td className="px-3 py-2 text-[13px] text-[#080707] whitespace-nowrap">
                                                        {formatMdy(new Date(entry.date))}
                                                    </td>
                                                    <td className="px-3 py-2 text-[13px] text-[#080707]">{entry.comment}</td>
                                                    <td className="px-3 py-2 text-[13px] text-[#080707]">{entry.createdBy}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Add/Edit Progress Entry Dialog */}
                            <Dialog open={showProgressEntryDialog} onOpenChange={setShowProgressEntryDialog}>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="text-[16px] font-semibold">
                                            {editingProgressIndex !== null ? 'Modify Progress Entry' : 'Add Progress Entry'}
                                        </DialogTitle>
                                        <DialogDescription className="text-[13px] text-[#706e6b]">
                                            {editingProgressIndex !== null ? 'Update the progress tracking entry.' : 'Add a new progress tracking entry.'}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-2">
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-medium text-[#080707]">Date</Label>
                                            <DateInput
value={isoToMdy(progressEntryForm.date)}
                                                onChange={(v) => ((e) => setProgressEntryForm({...progressEntryForm, date: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                className="h-8 text-[13px]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-medium text-[#080707]">Comment</Label>
                                            <Textarea
                                                value={progressEntryForm.comment}
                                                onChange={(e) => setProgressEntryForm({...progressEntryForm, comment: e.target.value})}
                                                className="text-[13px] min-h-[80px]"
                                                placeholder="Enter progress comment..."
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            onClick={() => setShowProgressEntryDialog(false)}
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
                                            onClick={() => {
                                                const entries = progressDialogContext === 'add' ? newPlanProgressEntries : editPlanProgressEntries;
                                                const setEntries = progressDialogContext === 'add' ? setNewPlanProgressEntries : setEditPlanProgressEntries;
                                                if (editingProgressIndex !== null) {
                                                    const updated = [...entries];
                                                    updated[editingProgressIndex] = { ...progressEntryForm };
                                                    setEntries(updated);
                                                } else {
                                                    setEntries([...entries, { ...progressEntryForm }]);
                                                }
                                                setShowProgressEntryDialog(false);
                                            }}
                                            disabled={!progressEntryForm.date || !progressEntryForm.comment}
                                            className="h-8 px-3 rounded-full text-[13px]"
                                            style={{
                                                backgroundColor: '#145F33',
                                                color: 'white',
                                                opacity: (!progressEntryForm.date || !progressEntryForm.comment) ? 0.5 : 1
                                            }}
                                        >
                                            {editingProgressIndex !== null ? 'Update' : 'Add'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            onClick={handleCloseAddDialog}
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
                            onClick={handleAddPlan}
                            className="h-8 px-3 rounded-full text-[13px]"
                            style={{
                                backgroundColor: '#145F33',
                                color: 'white'
                            }}
                        >
                            Add
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Plan Dialog */}
            <Dialog open={editingPlanId !== null} onOpenChange={(open) => { if (!open) handleCancelEditPlan(); }}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-[15px] text-[#080707]">Edit Supplemental Plan</DialogTitle>
                        <DialogDescription className="text-[12px]">
                            Update the plan details below.
                        </DialogDescription>
                    </DialogHeader>
                    {/* Tabs for Edit Plan Dialog */}
                    <div className="flex gap-0" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                        {(["overview", "plan-details", "services", "progress-tracking"] as const).map((tab) => {
                            const labels = { "overview": "Overview", "plan-details": "Plan Details", "services": "Services", "progress-tracking": "Progress Tracking" };
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setEditDialogTab(tab)}
                                    className="px-4 py-2 text-[12px] relative transition-colors"
                                    style={{
                                        color: editDialogTab === tab ? '#0176d3' : '#706e6b',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {labels[tab]}
                                    {editDialogTab === tab && (
                                        <span className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: '#0176d3' }} />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {editDialogTab === "overview" && (
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Plan Type</Label>
                                <Select
                                    value={editPlanData.planType}
                                    onValueChange={(value) => setEditPlanData({...editPlanData, planType: value})}
                                >
                                    <SelectTrigger className="h-8 text-[13px] rounded w-full px-2 border outline-none">
                                        <SelectValue placeholder="Select plan type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Program Agreement">Program Agreement</SelectItem>
                                        <SelectItem value="Academy Agreement">Academy Agreement</SelectItem>
                                        <SelectItem value="Creative Treatment Intervention">Creative Treatment Intervention</SelectItem>
                                        <SelectItem value="Harm Risk Assessment">Harm Risk Assessment</SelectItem>
                                        <SelectItem value="IEP">IEP</SelectItem>
                                        <SelectItem value="504">504</SelectItem>
                                        <SelectItem value="No Harm Contract">No Harm Contract</SelectItem>
                                        <SelectItem value="Relapse Prevention Plan">Relapse Prevention Plan</SelectItem>
                                        <SelectItem value="Self Harm Safety Plan">Self Harm Safety Plan</SelectItem>
                                        <SelectItem value="Study Time Plan">Study Time Plan</SelectItem>
                                        <SelectItem value="Suicide Prevention Agreement">Suicide Prevention Agreement</SelectItem>
                                        <SelectItem value="Academic Service Plan">Academic Service Plan</SelectItem>
                                        <SelectItem value="Passion Plan">Passion Plan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Re-Evaluation Date</Label>
                                <DateInput
value={isoToMdy(editPlanData.fileEvaluationDate)}
                                    onChange={(v) => ((e) => setEditPlanData({...editPlanData, fileEvaluationDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                    className="h-8 text-[13px] rounded"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">End Date</Label>
                                <DateInput
value={isoToMdy(editPlanData.endDate)}
                                    onChange={(v) => ((e) => setEditPlanData({...editPlanData, endDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                    className="h-8 text-[13px] rounded"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-medium text-[#080707]">Plan Description</Label>
                            <Textarea
                                value={editPlanData.description}
                                onChange={(e) => setEditPlanData({...editPlanData, description: e.target.value})}
                                className="text-[13px] rounded min-h-[60px]"
                                style={{
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                }}
                            />
                        </div>

                        {/* Required Signatures Section */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-[11px] font-medium text-[#080707]">Required Signatures</Label>
                                <Button
                                    onClick={() => setShowEditSignatures(!showEditSignatures)}
                                    className="h-7 px-2.5 rounded-full text-[11px]"
                                    style={{
                                        backgroundColor: '#145F33',
                                        color: 'white'
                                    }}
                                >
                                    <Pencil className="w-3 h-3 mr-1" />
                                    Edit Signatures
                                </Button>
                            </div>
                            <div
                                className="rounded overflow-hidden"
                                style={{
                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                }}
                            >
                                <table className="w-full text-[12px]">
                                    <thead>
                                        <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                            <th className="px-3 py-1.5 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Role</th>
                                            <th className="px-3 py-1.5 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Name</th>
                                            <th className="px-3 py-1.5 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Date Signed</th>
                                            <th className="px-3 py-1.5 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {signatures.map((sig, index) => (
                                            <tr
                                                key={sig.id}
                                                style={{
                                                    borderBottom: index < signatures.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                                }}
                                            >
                                                <td className="px-3 py-1.5 text-[#080707]">{sig.role}</td>
                                                <td className="px-3 py-1.5 text-[#080707]">{sig.name}</td>
                                                <td className="px-3 py-1.5 text-[#706e6b]">{sig.dateSigned || "—"}</td>
                                                <td className="px-3 py-1.5">
                                                    <span
                                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px]"
                                                        style={{
                                                            backgroundColor: sig.status === "Signed" ? '#e6f7ee' : '#fef3e8',
                                                            color: sig.status === "Signed" ? '#145F33' : '#a5600b'
                                                        }}
                                                    >
                                                        {sig.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    )}

                    {editDialogTab === "plan-details" && (
                        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
                            <p className="text-[12px] text-[#706e6b]" style={{ borderLeft: '3px solid #0176d3', paddingLeft: '8px' }}>
                                Please enter at least one response per field below.
                            </p>

                            {/* Agreement Type */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Agreement Type</Label>
                                <Select
                                    value={editPlanDetails.agreementType}
                                    onValueChange={(value) => setEditPlanDetails({...editPlanDetails, agreementType: value})}
                                >
                                    <SelectTrigger className="h-8 text-[13px] rounded w-full px-2 border outline-none">
                                        <SelectValue placeholder="Please Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Safety">Safety</SelectItem>
                                        <SelectItem value="Hygiene">Hygiene</SelectItem>
                                        <SelectItem value="Budgeting">Budgeting</SelectItem>
                                        <SelectItem value="Behavior">Behavior</SelectItem>
                                        <SelectItem value="Education-School">Education-School</SelectItem>
                                        <SelectItem value="Employment">Employment</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Reasons For Agreement */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Reasons For Agreement</Label>
                                <Textarea
                                    value={editPlanDetails.reasonsForAgreement}
                                    onChange={(e) => setEditPlanDetails({...editPlanDetails, reasonsForAgreement: e.target.value})}
                                    className="text-[13px] rounded min-h-[72px]"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="Describe the reasons this agreement is being created..."
                                />
                            </div>

                            {/* Previous Supports or Interventions */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Previous Supports or Interventions</Label>
                                <Textarea
                                    value={editPlanDetails.previousSupports}
                                    onChange={(e) => setEditPlanDetails({...editPlanDetails, previousSupports: e.target.value})}
                                    className="text-[13px] rounded min-h-[72px]"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="List any supports or interventions previously attempted..."
                                />
                            </div>

                            {/* Youth Commits To */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Youth Commits To</Label>
                                <Textarea
                                    value={editPlanDetails.youthCommitsTo}
                                    onChange={(e) => setEditPlanDetails({...editPlanDetails, youthCommitsTo: e.target.value})}
                                    className="text-[13px] rounded min-h-[72px]"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="Describe what the youth commits to as part of this agreement..."
                                />
                            </div>

                            {/* Support System Can Help By */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Support System Can Help By</Label>
                                <Textarea
                                    value={editPlanDetails.supportSystemCanHelpBy}
                                    onChange={(e) => setEditPlanDetails({...editPlanDetails, supportSystemCanHelpBy: e.target.value})}
                                    className="text-[13px] rounded min-h-[72px]"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="Describe how the support system can assist..."
                                />
                            </div>

                            {/* Expected Benefits if Agreement is Successful */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Expected Benefits if Agreement is Successful</Label>
                                <Textarea
                                    value={editPlanDetails.expectedBenefits}
                                    onChange={(e) => setEditPlanDetails({...editPlanDetails, expectedBenefits: e.target.value})}
                                    className="text-[13px] rounded min-h-[72px]"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="Describe the expected positive outcomes..."
                                />
                            </div>

                            {/* Expected Consequences if Agreement is Not Successful */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Expected Consequences if Agreement is Not Successful</Label>
                                <Textarea
                                    value={editPlanDetails.expectedConsequences}
                                    onChange={(e) => setEditPlanDetails({...editPlanDetails, expectedConsequences: e.target.value})}
                                    className="text-[13px] rounded min-h-[72px]"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="Describe the consequences if the agreement is not followed..."
                                />
                            </div>
                        </div>
                    )}

                    {editDialogTab === "services" && (
                        <div className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-medium text-[#080707]">Service Type</Label>
                                    <Select
                                        value={editPlanServices.serviceType}
                                        onValueChange={(value) => setEditPlanServices({...editPlanServices, serviceType: value})}
                                    >
                                        <SelectTrigger className="h-8 text-[13px]">
                                            <SelectValue placeholder="Select service type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Individual Therapy">Individual Therapy</SelectItem>
                                            <SelectItem value="Group Therapy">Group Therapy</SelectItem>
                                            <SelectItem value="Family Therapy">Family Therapy</SelectItem>
                                            <SelectItem value="Psychiatric Services">Psychiatric Services</SelectItem>
                                            <SelectItem value="Case Management">Case Management</SelectItem>
                                            <SelectItem value="Educational Support">Educational Support</SelectItem>
                                            <SelectItem value="Vocational Training">Vocational Training</SelectItem>
                                            <SelectItem value="Substance Abuse Counseling">Substance Abuse Counseling</SelectItem>
                                            <SelectItem value="Recreational Therapy">Recreational Therapy</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-medium text-[#080707]">Provider</Label>
                                    <Input
                                        value={editPlanServices.provider}
                                        onChange={(e) => setEditPlanServices({...editPlanServices, provider: e.target.value})}
                                        className="h-8 text-[13px] rounded"
                                        style={{
                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                        }}
                                        placeholder="Enter provider name..."
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-medium text-[#080707]">Frequency</Label>
                                    <Select
                                        value={editPlanServices.frequency}
                                        onValueChange={(value) => setEditPlanServices({...editPlanServices, frequency: value})}
                                    >
                                        <SelectTrigger className="h-8 text-[13px]">
                                            <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Daily">Daily</SelectItem>
                                            <SelectItem value="Weekly">Weekly</SelectItem>
                                            <SelectItem value="Bi-Weekly">Bi-Weekly</SelectItem>
                                            <SelectItem value="Monthly">Monthly</SelectItem>
                                            <SelectItem value="As Needed">As Needed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-medium text-[#080707]">Start Date</Label>
                                    <DateInput
value={isoToMdy(editPlanServices.startDate)}
                                        onChange={(v) => ((e) => setEditPlanServices({...editPlanServices, startDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                        className="h-8 text-[13px] rounded"
                                        style={{
                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Notes</Label>
                                <Textarea
                                    value={editPlanServices.notes}
                                    onChange={(e) => setEditPlanServices({...editPlanServices, notes: e.target.value})}
                                    className="text-[13px] rounded min-h-[72px]"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="Additional notes about the service..."
                                />
                            </div>
                        </div>
                    )}

                    {editDialogTab === "progress-tracking" && (
                        <div className="min-h-[200px]">
                            {/* Progress Tracking Header */}
                            <div 
                                className="flex items-center justify-between px-3 py-2 mb-2"
                                style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                            >
                                <span className="text-[13px] font-semibold text-[#080707]">Progress Tracking:</span>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProgressEntryForm({ date: localTodayIso(), comment: '', createdBy: 'Current User' });
                                            setEditingProgressIndex(null);
                                            setProgressDialogContext('edit');
                                            setShowProgressEntryDialog(true);
                                        }}
                                        className="text-[12px] text-[#0176d3] hover:underline cursor-pointer bg-transparent border-none p-0"
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (editPlanProgressEntries.length > 0) {
                                                const last = editPlanProgressEntries[editPlanProgressEntries.length - 1];
                                                setProgressEntryForm({ date: last.date, comment: last.comment, createdBy: last.createdBy });
                                                setEditingProgressIndex(editPlanProgressEntries.length - 1);
                                                setProgressDialogContext('edit');
                                                setShowProgressEntryDialog(true);
                                            }
                                        }}
                                        className="text-[12px] text-[#0176d3] hover:underline cursor-pointer bg-transparent border-none p-0"
                                        style={{ opacity: editPlanProgressEntries.length === 0 ? 0.4 : 1 }}
                                    >
                                        Modify
                                    </button>
                                </div>
                            </div>
                            {/* Progress Tracking Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <th className="text-[11px] font-semibold text-[#080707] px-3 py-2 w-[120px]">Date</th>
                                            <th className="text-[11px] font-semibold text-[#080707] px-3 py-2">Comment</th>
                                            <th className="text-[11px] font-semibold text-[#080707] px-3 py-2 w-[140px]">Created By</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {editPlanProgressEntries.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="text-center py-8 text-[13px] text-[#706e6b]">
                                                    No progress entries recorded.
                                                </td>
                                            </tr>
                                        ) : (
                                            editPlanProgressEntries.map((entry, idx) => (
                                                <tr 
                                                    key={idx}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                    onClick={() => {
                                                        setProgressEntryForm({ date: entry.date, comment: entry.comment, createdBy: entry.createdBy });
                                                        setEditingProgressIndex(idx);
                                                        setProgressDialogContext('edit');
                                                        setShowProgressEntryDialog(true);
                                                    }}
                                                    style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                                                >
                                                    <td className="px-3 py-2 text-[13px] text-[#080707] whitespace-nowrap">
                                                        {formatMdy(new Date(entry.date))}
                                                    </td>
                                                    <td className="px-3 py-2 text-[13px] text-[#080707]">{entry.comment}</td>
                                                    <td className="px-3 py-2 text-[13px] text-[#080707]">{entry.createdBy}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            onClick={handleCancelEditPlan}
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
                            onClick={handleSavePlan}
                            className="h-8 px-3 rounded-full text-[13px]"
                            style={{
                                backgroundColor: '#145F33',
                                color: 'white'
                            }}
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Supplemental Plans Table */}
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
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '15%' }}>
                                    Plan Type
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '40%' }}>
                                    Plan Description
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '15%' }}>
                                    Re-Evaluation Date
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '15%' }}>
                                    End Date
                                </th>
                                <th className="px-3 py-2 text-right font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '15%' }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {supplementalPlans.map((plan, index) => (
                                <tr 
                                  key={plan.id}
                                  style={{ 
                                    borderBottom: index < supplementalPlans.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                  }}
                                >
                                    <td className="px-3 py-3 text-[#080707]">{plan.planType}</td>
                                    <td className="px-3 py-3 text-[#706e6b]">{plan.description}</td>
                                    <td className="px-3 py-3 text-[#080707]">{plan.fileEvaluationDate}</td>
                                    <td className="px-3 py-3 text-[#080707]">{plan.endDate}</td>
                                    <td className="px-3 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                className="text-[#0176d3] hover:text-[#014486] text-[13px] flex items-center gap-1"
                                                onClick={() => handleEditPlan(plan.id)}
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                className="text-[#c23934] hover:text-[#8a2a27] text-[13px] flex items-center gap-1"
                                                onClick={() => handleDeletePlan(plan.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}