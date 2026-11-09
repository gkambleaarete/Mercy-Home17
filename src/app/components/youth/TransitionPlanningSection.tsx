import { useState } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Plus, Pencil, Trash2 } from "@/app/lib/lucide-icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface TransitionPlan {
    id: number;
    transitionDate: string;
    plannedUnplanned: "Planned" | "Unplanned";
    type: string;
    nextPlacement: string;
    status: "Pending" | "In Progress" | "Completed" | "Cancelled";
    notes: string;
}

export function TransitionPlanningSection() {
    const [transitionPlans, setTransitionPlans] = useState<TransitionPlan[]>([
        {
            id: 1,
            transitionDate: "2024-03-15",
            plannedUnplanned: "Planned",
            type: "Discharge",
            nextPlacement: "Family Reunification",
            status: "In Progress",
            notes: "Youth has made significant progress. Family therapy sessions completed successfully."
        },
        {
            id: 2,
            transitionDate: "2024-02-20",
            plannedUnplanned: "Planned",
            type: "Transfer",
            nextPlacement: "Independent Living Program",
            status: "Completed",
            notes: "Youth successfully transitioned to independent living skills program."
        },
        {
            id: 3,
            transitionDate: "2024-01-10",
            plannedUnplanned: "Unplanned",
            type: "Emergency Transfer",
            nextPlacement: "Crisis Stabilization Unit",
            status: "Completed",
            notes: "Emergency transfer due to behavioral escalation. Youth stabilized and returned."
        },
        {
            id: 4,
            transitionDate: "2024-04-01",
            plannedUnplanned: "Planned",
            type: "Step Down",
            nextPlacement: "Therapeutic Foster Care",
            status: "Pending",
            notes: "Youth ready for less restrictive environment. Foster family identified and matching process underway."
        },
        {
            id: 5,
            transitionDate: "2024-05-15",
            plannedUnplanned: "Planned",
            type: "Discharge",
            nextPlacement: "Adoption Placement",
            status: "Pending",
            notes: "Adoption finalization scheduled. Pre-placement visits in progress."
        }
    ]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState<number | null>(null);

    const [formData, setFormData] = useState<Omit<TransitionPlan, 'id'>>({
        transitionDate: "",
        plannedUnplanned: "Planned",
        type: "",
        nextPlacement: "",
        status: "Pending",
        notes: ""
    });

    const handleDeletePlan = (id: number) => {
        setTransitionPlans(transitionPlans.filter(p => p.id !== id));
    };

    const handleEditPlan = (id: number) => {
        const plan = transitionPlans.find(p => p.id === id);
        if (plan) {
            setEditingPlanId(id);
            setFormData({
                transitionDate: plan.transitionDate,
                plannedUnplanned: plan.plannedUnplanned,
                type: plan.type,
                nextPlacement: plan.nextPlacement,
                status: plan.status,
                notes: plan.notes
            });
            setIsDialogOpen(true);
        }
    };

    const handleAddPlan = () => {
        setEditingPlanId(null);
        setFormData({
            transitionDate: "",
            plannedUnplanned: "Planned",
            type: "",
            nextPlacement: "",
            status: "Pending",
            notes: ""
        });
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (editingPlanId) {
            setTransitionPlans(transitionPlans.map(p =>
                p.id === editingPlanId
                    ? { ...p, ...formData }
                    : p
            ));
        } else {
            const newId = Math.max(...transitionPlans.map(p => p.id), 0) + 1;
            setTransitionPlans([...transitionPlans, { id: newId, ...formData }]);
        }
        setIsDialogOpen(false);
        setEditingPlanId(null);
    };

    const handleCancel = () => {
        setIsDialogOpen(false);
        setEditingPlanId(null);
    };

    const getStatusBadgeStyle = (status: TransitionPlan['status']) => {
        switch (status) {
            case "Completed":
                return {
                    backgroundColor: '#4bca81',
                    color: '#fff'
                };
            case "In Progress":
                return {
                    backgroundColor: '#0176d3',
                    color: '#fff'
                };
            case "Pending":
                return {
                    backgroundColor: '#ffb75d',
                    color: '#080707'
                };
            case "Cancelled":
                return {
                    backgroundColor: '#c23934',
                    color: '#fff'
                };
            default:
                return {
                    backgroundColor: '#706e6b',
                    color: '#fff'
                };
        }
    };

    const getPlannedUnplannedBadgeStyle = (type: "Planned" | "Unplanned") => {
        return type === "Planned"
            ? {
                backgroundColor: '#ecf3fe',
                color: '#014486',
                border: '1px solid #c9deff'
            }
            : {
                backgroundColor: '#feded8',
                color: '#8a2a27',
                border: '1px solid #ffa199'
            };
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-[#080707]">Transition Planning</h3>
                <Button
                    onClick={handleAddPlan}
                    className="h-8 px-3 rounded-full text-[13px]"
                    style={{
                        backgroundColor: '#145F33',
                        color: 'white'
                    }}
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Create Report
                </Button>
            </div>

            {/* Transition Planning Table */}
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
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '12%' }}>
                                    Transition Date
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '14%' }}>
                                    Planned/Unplanned
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '16%' }}>
                                    Type
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '30%' }}>
                                    Next Placement
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '14%' }}>
                                    Status
                                </th>
                                <th className="px-3 py-2 text-right font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '14%' }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {transitionPlans.map((plan, index) => (
                                <tr
                                    key={plan.id}
                                    style={{
                                        borderBottom: index < transitionPlans.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                    }}
                                >
                                    <td className="px-3 py-3 text-[#080707]">{plan.transitionDate}</td>
                                    <td className="px-3 py-3">
                                        <Badge
                                            className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                            style={getPlannedUnplannedBadgeStyle(plan.plannedUnplanned)}
                                        >
                                            {plan.plannedUnplanned}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-3 text-[#080707]">{plan.type}</td>
                                    <td className="px-3 py-3 text-[#706e6b]">{plan.nextPlacement}</td>
                                    <td className="px-3 py-3">
                                        <Badge
                                            className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                            style={getStatusBadgeStyle(plan.status)}
                                        >
                                            {plan.status}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                className="text-[#0176d3] hover:text-[#014486] text-[13px] flex items-center gap-1"
                                                onClick={() => handleEditPlan(plan.id)}
                                                title="Edit"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                className="text-[#c23934] hover:text-[#8a2a27] text-[13px] flex items-center gap-1"
                                                onClick={() => handleDeletePlan(plan.id)}
                                                title="Delete"
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

            {/* Add/Edit Transition Plan Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                            {editingPlanId ? "Edit Transition Plan" : "New Transition Plan"}
                        </DialogTitle>
                        <DialogDescription className="text-[13px] mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            {editingPlanId ? "Update the transition plan details." : "Create a new transition plan for the constituent."}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Scrollable Body Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Transition Date</Label>
                                <DateInput
value={isoToMdy(formData.transitionDate)}
                                    onChange={(v) => ((e) => setFormData({ ...formData, transitionDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
                                    className="h-8 text-[13px] rounded"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Planned/Unplanned</Label>
                                <Select
                                    value={formData.plannedUnplanned}
                                    onValueChange={(value: "Planned" | "Unplanned") => setFormData({ ...formData, plannedUnplanned: value })}
                                >
                                    <SelectTrigger
                                        className="h-8 text-[13px] rounded"
                                        style={{
                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                        }}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Planned">Planned</SelectItem>
                                        <SelectItem value="Unplanned">Unplanned</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                                >
                                    <SelectTrigger
                                        className="h-8 text-[13px] rounded"
                                        style={{
                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                        }}
                                    >
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Discharge">Discharge</SelectItem>
                                        <SelectItem value="Transfer">Transfer</SelectItem>
                                        <SelectItem value="Step Down">Step Down</SelectItem>
                                        <SelectItem value="Step Up">Step Up</SelectItem>
                                        <SelectItem value="Emergency Transfer">Emergency Transfer</SelectItem>
                                        <SelectItem value="Placement Change">Placement Change</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: TransitionPlan['status']) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger
                                        className="h-8 text-[13px] rounded"
                                        style={{
                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                        }}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5 col-span-2">
                                <Label className="text-[11px] font-medium text-[#080707]">Next Placement</Label>
                                <Input
                                    value={formData.nextPlacement}
                                    onChange={(e) => setFormData({ ...formData, nextPlacement: e.target.value })}
                                    className="h-8 text-[13px] rounded"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="Enter next placement destination"
                                />
                            </div>
                            <div className="space-y-1.5 col-span-2">
                                <Label className="text-[11px] font-medium text-[#080707]">Notes</Label>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="text-[13px] rounded min-h-[100px]"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="Enter transition plan notes and details"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer with Action Buttons */}
                    <DialogFooter
                        className="px-6 py-4 border-t flex-row justify-end gap-2"
                        style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                    >
                        <Button
                            onClick={handleCancel}
                            className="h-8 px-4 rounded-full text-[13px]"
                            style={{
                                backgroundColor: 'transparent',
                                color: '#706e6b',
                                border: '1px solid var(--slds-g-color-border-base-1)'
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="h-8 px-4 rounded-full text-[13px]"
                            style={{
                                backgroundColor: '#145F33',
                                color: 'white'
                            }}
                        >
                            {editingPlanId ? 'Save' : 'Add'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}