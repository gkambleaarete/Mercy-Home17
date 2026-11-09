import { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Plus, Pencil, Trash2, Eye, RefreshCw, Printer, FileText, ClipboardList, Search, MoreHorizontal } from "@/app/lib/lucide-icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface TreatmentPlan {
    id: number;
    period: string;
    startDate: string;
    endDate: string;
    program: string;
    contributors: string;
    status: "Draft" | "In Progress" | "Complete" | "Pending Review";
    advocate: string;
    therapist: string;
    notes: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    "Draft": { bg: "#e5e7eb", text: "#374151" },
    "In Progress": { bg: "#dbeafe", text: "#1e40af" },
    "Complete": { bg: "#d1fae5", text: "#065f46" },
    "Pending Review": { bg: "#fef3c7", text: "#92400e" }
};

const PROGRAM_OPTIONS = [
    "Bernardin",
    "Cabrini",
    "Cristo Rey",
    "Day School",
    "DeLaSalle",
    "Drexel",
    "Duchesne",
    "Filipino Youth Ministry",
    "Gonzaga",
    "Josephine",
    "Marian",
    "Maryville",
    "Neumann",
    "Ozanam",
    "Seton",
    "Tolton",
    "Visitation"
];

export function IndividualTreatmentPlanSection({ createNewPlanTrigger = 0 }: { createNewPlanTrigger?: number }) {
    const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([
        {
            id: 1,
            period: "01/15/2025 – 07/15/2025",
            startDate: "2025-01-15",
            endDate: "2025-07-15",
            program: "Bernardin",
            contributors: "Dr. Michael Chen, Sarah Johnson",
            status: "In Progress",
            advocate: "Sarah Johnson",
            therapist: "Dr. Michael Chen",
            notes: "Initial treatment plan for behavioral goals and academic support."
        },
        {
            id: 2,
            period: "02/01/2025 – 08/01/2025",
            startDate: "2025-02-01",
            endDate: "2025-08-01",
            program: "Cabrini",
            contributors: "Dr. Lisa Brown, Jennifer Williams, Karen Martinez",
            status: "In Progress",
            advocate: "Jennifer Williams",
            therapist: "Dr. Lisa Brown",
            notes: "Independent living skills focus with career planning."
        },
        {
            id: 3,
            period: "03/10/2025 – 09/10/2025",
            startDate: "2025-03-10",
            endDate: "2025-09-10",
            program: "Duchesne",
            contributors: "Dr. Rebecca Martinez, Michael Torres",
            status: "Pending Review",
            advocate: "Michael Torres",
            therapist: "Dr. Rebecca Martinez",
            notes: "Trauma-informed care plan with family reunification goals."
        },
        {
            id: 4,
            period: "06/01/2024 – 12/01/2024",
            startDate: "2024-06-01",
            endDate: "2024-12-01",
            program: "Maryville",
            contributors: "Dr. Angela White, Tom Richards",
            status: "Complete",
            advocate: "Tom Richards",
            therapist: "Dr. Angela White",
            notes: "Completed plan focused on substance use recovery and coping skills."
        },
        {
            id: 5,
            period: "01/20/2026 – 07/20/2026",
            startDate: "2026-01-20",
            endDate: "2026-07-20",
            program: "Gonzaga",
            contributors: "",
            status: "Draft",
            advocate: "Pending Assignment",
            therapist: "Pending Assignment",
            notes: "New plan being drafted for upcoming program enrollment."
        }
    ]);

    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        startDate: "",
        endDate: "",
        program: "",
        contributors: "",
        status: "Draft" as TreatmentPlan["status"],
        advocate: "",
        therapist: "",
        notes: ""
    });

    const formatDateForDisplay = (dateStr: string) => {
        if (!dateStr) return "";
        const d = new Date(dateStr + "T00:00:00");
        return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
    };

    const handleCreateNewPlan = () => {
        setEditingPlanId(null);
        setIsViewMode(false);
        setFormData({
            startDate: "",
            endDate: "",
            program: "",
            contributors: "",
            status: "Draft",
            advocate: "",
            therapist: "",
            notes: ""
        });
        setIsDialogOpen(true);
    };

    // Listen for external create trigger from parent
    useEffect(() => {
        if (createNewPlanTrigger > 0) {
            handleCreateNewPlan();
        }
    }, [createNewPlanTrigger]);

    const handleEditPlan = () => {
        if (!selectedPlanId) return;
        const plan = treatmentPlans.find(p => p.id === selectedPlanId);
        if (plan) {
            setEditingPlanId(plan.id);
            setIsViewMode(false);
            setFormData({
                startDate: plan.startDate,
                endDate: plan.endDate,
                program: plan.program,
                contributors: plan.contributors,
                status: plan.status,
                advocate: plan.advocate,
                therapist: plan.therapist,
                notes: plan.notes
            });
            setIsDialogOpen(true);
        }
    };

    const handleViewPlan = () => {
        if (!selectedPlanId) return;
        const plan = treatmentPlans.find(p => p.id === selectedPlanId);
        if (plan) {
            setEditingPlanId(plan.id);
            setIsViewMode(true);
            setFormData({
                startDate: plan.startDate,
                endDate: plan.endDate,
                program: plan.program,
                contributors: plan.contributors,
                status: plan.status,
                advocate: plan.advocate,
                therapist: plan.therapist,
                notes: plan.notes
            });
            setIsDialogOpen(true);
        }
    };

    const handleRefresh = () => {
        setSelectedPlanId(null);
    };

    const handleSave = () => {
        const period = `${formatDateForDisplay(formData.startDate)} – ${formatDateForDisplay(formData.endDate)}`;

        if (editingPlanId) {
            setTreatmentPlans(treatmentPlans.map(p =>
                p.id === editingPlanId
                    ? { ...p, ...formData, period }
                    : p
            ));
        } else {
            const newId = Math.max(...treatmentPlans.map(p => p.id), 0) + 1;
            setTreatmentPlans([...treatmentPlans, { id: newId, ...formData, period }]);
        }
        setIsDialogOpen(false);
        setEditingPlanId(null);
        setIsViewMode(false);
    };

    const handleCancel = () => {
        setIsDialogOpen(false);
        setEditingPlanId(null);
        setIsViewMode(false);
    };

    const handleRowClick = (id: number) => {
        setSelectedPlanId(selectedPlanId === id ? null : id);
    };

    const handleRowDoubleClick = (id: number) => {
        setSelectedPlanId(id);
        const plan = treatmentPlans.find(p => p.id === id);
        if (plan) {
            setEditingPlanId(plan.id);
            setIsViewMode(true);
            setFormData({
                startDate: plan.startDate,
                endDate: plan.endDate,
                program: plan.program,
                contributors: plan.contributors,
                status: plan.status,
                advocate: plan.advocate,
                therapist: plan.therapist,
                notes: plan.notes
            });
            setIsDialogOpen(true);
        }
    };

    return (
        <div className="space-y-0">
            {/* Data Table */}
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
                                <th
                                    className="px-3 py-2.5 text-left font-semibold text-[#080707]"
                                    style={{ borderBottom: '2px solid var(--slds-g-color-border-base-1)', width: '28%' }}
                                >
                                    Period
                                </th>
                                <th
                                    className="px-3 py-2.5 text-left font-semibold text-[#080707]"
                                    style={{ borderBottom: '2px solid var(--slds-g-color-border-base-1)', width: '20%' }}
                                >
                                    Program
                                </th>
                                <th
                                    className="px-3 py-2.5 text-left font-semibold text-[#080707]"
                                    style={{ borderBottom: '2px solid var(--slds-g-color-border-base-1)', width: '35%' }}
                                >
                                    Contributors
                                </th>
                                <th
                                    className="px-3 py-2.5 text-left font-semibold text-[#080707]"
                                    style={{ borderBottom: '2px solid var(--slds-g-color-border-base-1)', width: '17%' }}
                                >
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {treatmentPlans.map((plan, index) => {
                                const isSelected = selectedPlanId === plan.id;
                                return (
                                    <tr
                                        key={plan.id}
                                        onClick={() => handleRowClick(plan.id)}
                                        onDoubleClick={() => handleRowDoubleClick(plan.id)}
                                        className="cursor-pointer transition-colors"
                                        style={{
                                            borderBottom: index < treatmentPlans.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                            backgroundColor: isSelected ? '#e8f4fd' : 'var(--slds-g-color-background-base)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) {
                                                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--slds-g-color-background-alt)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--slds-g-color-background-base)';
                                            }
                                        }}
                                    >
                                        <td className="px-3 py-3 text-[#080707]">
                                            {plan.period}
                                        </td>
                                        <td className="px-3 py-3 text-[#080707]">
                                            {plan.program}
                                        </td>
                                        <td className="px-3 py-3 text-[#706e6b]">
                                            {plan.contributors || "—"}
                                        </td>
                                        <td className="px-3 py-3">
                                            <span
                                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                                                style={{
                                                    backgroundColor: STATUS_COLORS[plan.status]?.bg || "#e5e7eb",
                                                    color: STATUS_COLORS[plan.status]?.text || "#374151"
                                                }}
                                            >
                                                {plan.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {treatmentPlans.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-3 py-8 text-center text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        No individual treatment plans found. Click "Create New Plan" to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Record count */}
            <div className="flex items-center justify-between pt-2 px-1">
                <span className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    {treatmentPlans.length} record{treatmentPlans.length !== 1 ? "s" : ""}
                    {selectedPlanId ? " · 1 selected" : ""}
                </span>
            </div>

            {/* Create/Edit/View Plan Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent
                    className="max-w-2xl max-h-[90vh] flex flex-col"
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
                            {isViewMode
                                ? "View Individual Treatment Plan"
                                : editingPlanId
                                    ? "Edit Individual Treatment Plan"
                                    : "New Individual Treatment Plan"
                            }
                        </DialogTitle>
                        <DialogDescription className="text-[13px] mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            {isViewMode
                                ? "Review the treatment plan details below."
                                : editingPlanId
                                    ? "Update the treatment plan details."
                                    : "Create a new individual treatment plan."
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                        {/* Plan Details Header */}
                        <div className="space-y-4">
                            {/* Start / End Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-medium text-[#080707]">Start Date</Label>
                                    {isViewMode ? (
                                        <div className="h-8 flex items-center text-[13px] text-[#080707] px-2 rounded" style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                            {formatDateForDisplay(formData.startDate) || "—"}
                                        </div>
                                    ) : (
                                        <DateInput
value={isoToMdy(formData.startDate)}
                                            onChange={(v) => ((e) => setFormData({ ...formData, startDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
                                            className="h-8 text-[13px] rounded"
                                            style={{
                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                            }}
                                        />
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-medium text-[#080707]">End Date</Label>
                                    {isViewMode ? (
                                        <div className="h-8 flex items-center text-[13px] text-[#080707] px-2 rounded" style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                            {formatDateForDisplay(formData.endDate) || "—"}
                                        </div>
                                    ) : (
                                        <DateInput
value={isoToMdy(formData.endDate)}
                                            onChange={(v) => ((e) => setFormData({ ...formData, endDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
                                            className="h-8 text-[13px] rounded"
                                            style={{
                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Advocate / Therapist */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-medium text-[#080707]">Advocate</Label>
                                    <div className="h-8 flex items-center text-[13px] text-[#080707] px-2 rounded" style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                        {formData.advocate || "Larry Mac"}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-medium text-[#080707]">Therapist</Label>
                                    <div className="h-8 flex items-center text-[13px] text-[#080707] px-2 rounded" style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                        {formData.therapist || "Shelly Belair"}
                                    </div>
                                </div>
                            </div>

                            {/* Program */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-medium text-[#080707]">Program</Label>
                                <div className="h-8 flex items-center text-[13px] text-[#080707] px-2 rounded" style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                    {formData.program || "Bernardin"}
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }} />

                        {/* ITP Schedule */}
                        <div className="space-y-2">
                            <h4 className="text-[13px] font-semibold text-[#080707]">ITP Schedule</h4>
                            <div
                                className="rounded overflow-hidden"
                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                            >
                                <table className="w-full text-[13px]">
                                    <thead>
                                        <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                            <th
                                                className="px-3 py-2 text-left font-semibold text-[#080707]"
                                                style={{ borderBottom: '2px solid var(--slds-g-color-border-base-1)', width: '40%' }}
                                            >
                                                Date
                                            </th>
                                            <th
                                                className="px-3 py-2 text-left font-semibold text-[#080707]"
                                                style={{ borderBottom: '2px solid var(--slds-g-color-border-base-1)', width: '30%' }}
                                            >
                                                Expected
                                            </th>
                                            <th
                                                className="px-3 py-2 text-left font-semibold text-[#080707]"
                                                style={{ borderBottom: '2px solid var(--slds-g-color-border-base-1)', width: '30%' }}
                                            >
                                                Actual
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { label: "Care Planning Meeting", expected: "10/20/2025", actual: "n/a" },
                                            { label: "ITP Date", expected: "11/03/2025", actual: "11/03/2025" },
                                            { label: "Complete Date", expected: "11/10/2025", actual: "n/a" },
                                            { label: "Finalized Date", expected: "11/17/2025", actual: "n/a" }
                                        ].map((row, idx) => (
                                            <tr
                                                key={row.label}
                                                style={{
                                                    borderBottom: idx < 3 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                                }}
                                            >
                                                <td className="px-3 py-2 text-[#080707]">{row.label}</td>
                                                <td className="px-3 py-2 text-[#080707]">{row.expected}</td>
                                                <td className="px-3 py-2" style={{ color: row.actual === "n/a" ? '#706e6b' : '#080707' }}>
                                                    {row.actual}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }} />

                        {/* ITP Content Sections */}
                        <div className="space-y-2">
                            <h4 className="text-[13px] font-semibold text-[#080707]">ITP Content Sections</h4>
                            <div
                                className="rounded overflow-hidden"
                                style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                            >
                                <table className="w-full text-[13px]">
                                    <thead>
                                        <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                            <th
                                                className="px-3 py-2 text-left font-semibold text-[#080707]"
                                                style={{ borderBottom: '2px solid var(--slds-g-color-border-base-1)', width: '35%' }}
                                            >
                                                Section
                                            </th>
                                            <th
                                                className="px-3 py-2 text-left font-semibold text-[#080707]"
                                                style={{ borderBottom: '2px solid var(--slds-g-color-border-base-1)', width: '35%' }}
                                            >
                                                Contributors
                                            </th>
                                            <th
                                                className="px-3 py-2 text-left font-semibold text-[#080707]"
                                                style={{ borderBottom: '2px solid var(--slds-g-color-border-base-1)', width: '30%' }}
                                            >
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { section: "PTP", contributors: "Dr. Michael Chen", status: "In Progress" },
                                            { section: "Triggers and Coping Skills", contributors: "", status: "Not Started" },
                                            { section: "Goals", contributors: "Sarah Johnson", status: "In Progress" },
                                            { section: "Care Planning Meeting", contributors: "", status: "Not Started" },
                                            { section: "Transition Planning", contributors: "", status: "Not Started" },
                                            { section: "Strengths", contributors: "Sarah Johnson", status: "Complete" },
                                            { section: "Milieu Engagement", contributors: "", status: "Not Started" },
                                            { section: "Activities", contributors: "", status: "Not Started" },
                                            { section: "Advocate Notes", contributors: "", status: "Not Started" },
                                            { section: "Family", contributors: "", status: "Not Started" },
                                            { section: "Spirituality", contributors: "", status: "Not Started" },
                                            { section: "Physical Health", contributors: "Dr. Lisa Brown", status: "Complete" },
                                            { section: "Mental Health", contributors: "Dr. Michael Chen", status: "In Progress" },
                                            { section: "Medication", contributors: "Dr. Lisa Brown", status: "Complete" },
                                            { section: "Trauma", contributors: "", status: "Not Started" },
                                            { section: "Therapy", contributors: "Dr. Michael Chen", status: "In Progress" },
                                            { section: "Incidents", contributors: "", status: "Not Started" },
                                            { section: "Substance Use", contributors: "", status: "Not Started" },
                                            { section: "Legal Involvement", contributors: "", status: "Not Started" }
                                        ].map((row, idx, arr) => {
                                            const statusStyle = row.status === "Complete"
                                                ? { bg: "#d1fae5", text: "#065f46" }
                                                : row.status === "In Progress"
                                                    ? { bg: "#dbeafe", text: "#1e40af" }
                                                    : { bg: "#e5e7eb", text: "#374151" };
                                            return (
                                                <tr
                                                    key={row.section}
                                                    className="cursor-pointer transition-colors"
                                                    style={{
                                                        borderBottom: idx < arr.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--slds-g-color-background-alt)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--slds-g-color-background-base)';
                                                    }}
                                                >
                                                    <td className="px-3 py-2">
                                                        <span className="text-[#0070d2] hover:underline cursor-pointer">
                                                            {row.section}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-[#706e6b]">
                                                        {row.contributors || "—"}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <span
                                                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                                                            style={{
                                                                backgroundColor: statusStyle.bg,
                                                                color: statusStyle.text
                                                            }}
                                                        >
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

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
                            {isViewMode ? "Close" : "Cancel"}
                        </Button>
                        {!isViewMode && (
                            <Button
                                onClick={handleSave}
                                className="h-8 px-4 rounded-full text-[13px]"
                                style={{
                                    backgroundColor: '#145F33',
                                    color: 'white'
                                }}
                            >
                                {editingPlanId ? "Save Changes" : "Create Plan"}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}