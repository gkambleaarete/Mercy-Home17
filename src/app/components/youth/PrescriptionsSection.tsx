import { useState } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Plus, Pencil, Trash2, Download, Printer } from "@/app/lib/lucide-icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface Prescription {
    id: number;
    medicationName: string;
    dosage: string;
    packaging: string;
    frequency: string;
    prescriber: string;
    startDate: string;
    endDate: string;
    status: "Active" | "Pending" | "Discontinued" | "Expired";
    category: "Current" | "Pending" | "Archived";
    instructions: string;
    pharmacyNotes: string;
}

interface PrescriptionsSectionProps {
    activeSubTab: "Current" | "Pending" | "Archived" | null;
}

export function PrescriptionsSection({ activeSubTab }: PrescriptionsSectionProps) {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([
        {
            id: 1,
            medicationName: "Sertraline (Zoloft)",
            dosage: "50mg",
            packaging: "Tablet",
            frequency: "Once Daily",
            prescriber: "Dr. Sarah Martinez",
            startDate: "2024-01-15",
            endDate: "2024-07-15",
            status: "Active",
            category: "Current",
            instructions: "Take in the morning with food. May cause drowsiness.",
            pharmacyNotes: "Refill available after 06/15/2024"
        },
        {
            id: 2,
            medicationName: "Methylphenidate (Concerta)",
            dosage: "18mg",
            packaging: "Extended Release Tablet",
            frequency: "Once Daily (Morning)",
            prescriber: "Dr. Michael Chen",
            startDate: "2024-02-01",
            endDate: "2024-08-01",
            status: "Active",
            category: "Current",
            instructions: "Take in morning, do not crush or chew. Monitor for appetite changes.",
            pharmacyNotes: "Controlled substance - requires new prescription for refills"
        },
        {
            id: 3,
            medicationName: "Melatonin",
            dosage: "3mg",
            packaging: "Tablet",
            frequency: "Once Daily (Bedtime)",
            prescriber: "Dr. Sarah Martinez",
            startDate: "2024-01-20",
            endDate: "2024-07-20",
            status: "Active",
            category: "Current",
            instructions: "Take 30 minutes before bedtime. OTC supplement for sleep support.",
            pharmacyNotes: "Available over-the-counter"
        },
        {
            id: 4,
            medicationName: "Risperidone (Risperdal)",
            dosage: "0.5mg",
            packaging: "Tablet",
            frequency: "Twice Daily",
            prescriber: "Dr. Lisa Thompson",
            startDate: "2023-11-10",
            endDate: "2024-05-10",
            status: "Active",
            category: "Current",
            instructions: "Take morning and evening. Monitor for weight changes and movement disorders.",
            pharmacyNotes: "Regular lab work required - next draw 04/15/2024"
        },
        {
            id: 5,
            medicationName: "Fluoxetine (Prozac)",
            dosage: "20mg",
            packaging: "Capsule",
            frequency: "Once Daily",
            prescriber: "Dr. Sarah Martinez",
            startDate: "2024-03-01",
            endDate: "2024-09-01",
            status: "Pending",
            category: "Pending",
            instructions: "Start date pending psychiatric evaluation. Take in morning.",
            pharmacyNotes: "Awaiting insurance approval - PA submitted 02/28/2024"
        },
        {
            id: 6,
            medicationName: "Guanfacine (Intuniv)",
            dosage: "1mg",
            packaging: "Extended Release Tablet",
            frequency: "Once Daily (Bedtime)",
            prescriber: "Dr. Michael Chen",
            startDate: "2024-03-15",
            endDate: "2024-09-15",
            status: "Pending",
            category: "Pending",
            instructions: "For ADHD and aggression management. Do not discontinue abruptly.",
            pharmacyNotes: "Prior authorization in process"
        },
        {
            id: 7,
            medicationName: "Aripiprazole (Abilify)",
            dosage: "5mg",
            packaging: "Tablet",
            frequency: "Once Daily",
            prescriber: "Dr. Lisa Thompson",
            startDate: "2023-08-01",
            endDate: "2024-02-01",
            status: "Discontinued",
            category: "Archived",
            instructions: "Discontinued due to side effects. Replaced with Risperidone.",
            pharmacyNotes: "D/C 02/01/2024 - akathisia reported"
        },
        {
            id: 8,
            medicationName: "Clonidine",
            dosage: "0.1mg",
            packaging: "Tablet",
            frequency: "Twice Daily",
            prescriber: "Dr. Michael Chen",
            startDate: "2023-06-15",
            endDate: "2023-12-15",
            status: "Discontinued",
            category: "Archived",
            instructions: "Discontinued - transitioned to guanfacine for better coverage.",
            pharmacyNotes: "D/C 12/15/2023 - medication change"
        },
        {
            id: 9,
            medicationName: "Omega-3 Fish Oil",
            dosage: "1000mg",
            packaging: "Softgel",
            frequency: "Once Daily",
            prescriber: "Dr. Sarah Martinez",
            startDate: "2023-09-01",
            endDate: "2024-03-01",
            status: "Expired",
            category: "Archived",
            instructions: "Nutritional supplement for mood support.",
            pharmacyNotes: "Prescription expired - not renewed per guardian request"
        },
        {
            id: 10,
            medicationName: "Bupropion (Wellbutrin)",
            dosage: "150mg",
            packaging: "Extended Release Tablet",
            frequency: "Once Daily",
            prescriber: "Dr. Sarah Martinez",
            startDate: "2023-05-01",
            endDate: "2023-11-01",
            status: "Discontinued",
            category: "Archived",
            instructions: "Discontinued due to increased anxiety. Switched to Sertraline.",
            pharmacyNotes: "D/C 11/01/2023 - adverse reaction"
        }
    ]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPrescriptionId, setEditingPrescriptionId] = useState<number | null>(null);

    const [formData, setFormData] = useState<Omit<Prescription, 'id'>>({
        medicationName: "",
        dosage: "",
        packaging: "",
        frequency: "",
        prescriber: "",
        startDate: "",
        endDate: "",
        status: "Active",
        category: "Current",
        instructions: "",
        pharmacyNotes: ""
    });

    const handleDeletePrescription = (id: number) => {
        setPrescriptions(prescriptions.filter(p => p.id !== id));
    };

    const handleEditPrescription = (id: number) => {
        const prescription = prescriptions.find(p => p.id === id);
        if (prescription) {
            setEditingPrescriptionId(id);
            setFormData({
                medicationName: prescription.medicationName,
                dosage: prescription.dosage,
                packaging: prescription.packaging,
                frequency: prescription.frequency,
                prescriber: prescription.prescriber,
                startDate: prescription.startDate,
                endDate: prescription.endDate,
                status: prescription.status,
                category: prescription.category,
                instructions: prescription.instructions,
                pharmacyNotes: prescription.pharmacyNotes
            });
            setIsDialogOpen(true);
        }
    };

    const handleAddPrescription = () => {
        setEditingPrescriptionId(null);
        setFormData({
            medicationName: "",
            dosage: "",
            packaging: "",
            frequency: "",
            prescriber: "",
            startDate: "",
            endDate: "",
            status: "Active",
            category: "Current",
            instructions: "",
            pharmacyNotes: ""
        });
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (editingPrescriptionId) {
            setPrescriptions(prescriptions.map(p =>
                p.id === editingPrescriptionId
                    ? { ...p, ...formData }
                    : p
            ));
        } else {
            const newId = Math.max(...prescriptions.map(p => p.id), 0) + 1;
            setPrescriptions([...prescriptions, { id: newId, ...formData }]);
        }
        setIsDialogOpen(false);
        setEditingPrescriptionId(null);
    };

    const handleCancel = () => {
        setIsDialogOpen(false);
        setEditingPrescriptionId(null);
    };

    const getStatusBadgeStyle = (status: Prescription['status']) => {
        switch (status) {
            case "Active":
                return {
                    backgroundColor: '#4bca81',
                    color: '#fff'
                };
            case "Pending":
                return {
                    backgroundColor: '#ffb75d',
                    color: '#080707'
                };
            case "Discontinued":
                return {
                    backgroundColor: '#706e6b',
                    color: '#fff'
                };
            case "Expired":
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

    const currentPrescriptions = prescriptions.filter(p => p.category === "Current");
    const pendingPrescriptions = prescriptions.filter(p => p.category === "Pending");
    const archivedPrescriptions = prescriptions.filter(p => p.category === "Archived");

    const renderPrescriptionTable = (data: Prescription[], title: string) => (
        <div className="space-y-2">
            <h4 className="text-[13px] font-semibold text-[#080707] px-1">{title}</h4>
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
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '18%' }}>
                                    Medication Name
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '12%' }}>
                                    Dosage/Packaging
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '13%' }}>
                                    Frequency
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '13%' }}>
                                    Prescriber
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '10%' }}>
                                    Start Date
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '10%' }}>
                                    End Date
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '10%' }}>
                                    Status
                                </th>
                                <th className="px-3 py-2 text-right font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '14%' }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-3 py-8 text-center" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        No {title.toLowerCase()} prescriptions found.
                                    </td>
                                </tr>
                            ) : (
                                data.map((prescription, index) => (
                                    <tr
                                        key={prescription.id}
                                        style={{
                                            borderBottom: index < data.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                            backgroundColor: 'var(--slds-g-color-background-base)'
                                        }}
                                    >
                                        <td className="px-3 py-3 text-[#080707] font-medium">{prescription.medicationName}</td>
                                        <td className="px-3 py-3 text-[#080707]">
                                            <div>{prescription.dosage}</div>
                                            <div className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>{prescription.packaging}</div>
                                        </td>
                                        <td className="px-3 py-3 text-[#706e6b]">{prescription.frequency}</td>
                                        <td className="px-3 py-3 text-[#706e6b]">{prescription.prescriber}</td>
                                        <td className="px-3 py-3 text-[#706e6b]">{prescription.startDate}</td>
                                        <td className="px-3 py-3 text-[#706e6b]">{prescription.endDate}</td>
                                        <td className="px-3 py-3">
                                            <Badge
                                                className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                                style={getStatusBadgeStyle(prescription.status)}
                                            >
                                                {prescription.status}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    className="text-[#0176d3] hover:text-[#014486] text-[13px] flex items-center gap-1"
                                                    onClick={() => handleEditPrescription(prescription.id)}
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    className="text-[#c23934] hover:text-[#8a2a27] text-[13px] flex items-center gap-1"
                                                    onClick={() => handleDeletePrescription(prescription.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Current Prescriptions Section */}
            {renderPrescriptionTable(currentPrescriptions, "Current Prescriptions")}

            {/* Pending Prescriptions Section */}
            {renderPrescriptionTable(pendingPrescriptions, "Pending Prescriptions")}

            {/* Archived Prescriptions Section */}
            {renderPrescriptionTable(archivedPrescriptions, "Archived Prescriptions")}

            {/* Add/Edit Prescription Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent
                    className="max-w-4xl max-h-[90vh] flex flex-col"
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
                            {editingPrescriptionId ? "Edit Prescription" : "New Prescription"}
                        </DialogTitle>
                        <DialogDescription className="text-[13px] mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            {editingPrescriptionId ? "Update the prescription details." : "Add a new prescription for the constituent."}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Scrollable Body Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 col-span-2">
                                <Label className="text-[11px] font-medium text-[#080707]">Medication Name</Label>
                                <Input
                                    value={formData.medicationName}
                                    onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
                                    className="h-8 text-[13px] rounded"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="e.g., Sertraline (Zoloft)"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Dosage</Label>
                                <Input
                                    value={formData.dosage}
                                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                                    className="h-8 text-[13px] rounded"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="e.g., 50mg"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Packaging</Label>
                                <Select
                                    value={formData.packaging}
                                    onValueChange={(value) => setFormData({ ...formData, packaging: value })}
                                >
                                    <SelectTrigger
                                        className="h-8 text-[13px] rounded"
                                        style={{
                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                        }}
                                    >
                                        <SelectValue placeholder="Select packaging" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Tablet">Tablet</SelectItem>
                                        <SelectItem value="Capsule">Capsule</SelectItem>
                                        <SelectItem value="Extended Release Tablet">Extended Release Tablet</SelectItem>
                                        <SelectItem value="Softgel">Softgel</SelectItem>
                                        <SelectItem value="Liquid">Liquid</SelectItem>
                                        <SelectItem value="Patch">Patch</SelectItem>
                                        <SelectItem value="Injection">Injection</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Frequency</Label>
                                <Select
                                    value={formData.frequency}
                                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                                >
                                    <SelectTrigger
                                        className="h-8 text-[13px] rounded"
                                        style={{
                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                        }}
                                    >
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Once Daily">Once Daily</SelectItem>
                                        <SelectItem value="Twice Daily">Twice Daily</SelectItem>
                                        <SelectItem value="Three Times Daily">Three Times Daily</SelectItem>
                                        <SelectItem value="Four Times Daily">Four Times Daily</SelectItem>
                                        <SelectItem value="Once Daily (Morning)">Once Daily (Morning)</SelectItem>
                                        <SelectItem value="Once Daily (Bedtime)">Once Daily (Bedtime)</SelectItem>
                                        <SelectItem value="Every Other Day">Every Other Day</SelectItem>
                                        <SelectItem value="As Needed">As Needed</SelectItem>
                                        <SelectItem value="Weekly">Weekly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Prescriber</Label>
                                <Input
                                    value={formData.prescriber}
                                    onChange={(e) => setFormData({ ...formData, prescriber: e.target.value })}
                                    className="h-8 text-[13px] rounded"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="e.g., Dr. Sarah Martinez"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Start Date</Label>
                                <DateInput
value={isoToMdy(formData.startDate)}
                                    onChange={(v) => ((e) => setFormData({ ...formData, startDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
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
value={isoToMdy(formData.endDate)}
                                    onChange={(v) => ((e) => setFormData({ ...formData, endDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
                                    className="h-8 text-[13px] rounded"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: Prescription['status']) => setFormData({ ...formData, status: value })}
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
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Discontinued">Discontinued</SelectItem>
                                        <SelectItem value="Expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value: Prescription['category']) => setFormData({ ...formData, category: value })}
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
                                        <SelectItem value="Current">Current</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5 col-span-2">
                                <Label className="text-[11px] font-medium text-[#080707]">Instructions</Label>
                                <Textarea
                                    value={formData.instructions}
                                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                    className="text-[13px] rounded min-h-[80px]"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="Enter medication instructions and precautions"
                                />
                            </div>
                            <div className="space-y-1.5 col-span-2">
                                <Label className="text-[11px] font-medium text-[#080707]">Pharmacy Notes</Label>
                                <Textarea
                                    value={formData.pharmacyNotes}
                                    onChange={(e) => setFormData({ ...formData, pharmacyNotes: e.target.value })}
                                    className="text-[13px] rounded min-h-[80px]"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="Enter pharmacy notes, refill information, or special handling requirements"
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
                            {editingPrescriptionId ? 'Save' : 'Add'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}