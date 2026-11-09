import { useState } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Plus, AlertTriangle } from "@/app/lib/lucide-icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, formatMdy } from "../../lib/dateFormat";

export function CPIHoldsSection() {
    const [cpiHolds, setCpiHolds] = useState([
        {
            id: 1,
            startDate: "2024-11-15",
            endDate: "2024-12-15",
            type: "Financial",
            details: "Outstanding tuition balance from previous semester requiring payment plan completion",
            status: "Active"
        },
        {
            id: 2,
            startDate: "2024-12-01",
            endDate: null,
            type: "Academic",
            details: "Incomplete coursework from Fall 2024 semester - requires submission of final project",
            status: "Active"
        },
        {
            id: 3,
            startDate: "2024-10-20",
            endDate: "2024-11-20",
            type: "Behavioral",
            details: "Violation of campus conduct policy - completed restorative justice program",
            status: "Resolved"
        },
        {
            id: 4,
            startDate: "2025-01-08",
            endDate: null,
            type: "Administrative",
            details: "Missing required documentation for program eligibility verification",
            status: "Active"
        },
        {
            id: 5,
            startDate: "2024-09-10",
            endDate: "2024-10-10",
            type: "Medical",
            details: "Required health screening not completed - now up to date with all medical requirements",
            status: "Resolved"
        },
        {
            id: 6,
            startDate: "2024-12-20",
            endDate: null,
            type: "Financial",
            details: "Pending reimbursement approval for program-related expenses",
            status: "Pending Review"
        },
        {
            id: 7,
            startDate: "2025-01-05",
            endDate: null,
            type: "Academic",
            details: "GPA below program minimum threshold - enrolled in academic support services",
            status: "Active"
        },
        {
            id: 8,
            startDate: "2024-11-01",
            endDate: "2024-12-01",
            type: "Attendance",
            details: "Excessive absences in November - attendance improved and hold lifted",
            status: "Resolved"
        }
    ]);
    
    const [showHoldDialog, setShowHoldDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [selectedHold, setSelectedHold] = useState<any>(null);
    const [editingHoldId, setEditingHoldId] = useState<number | null>(null);
    const [holdForm, setHoldForm] = useState({
        startDate: "",
        endDate: "",
        type: "",
        details: "",
        status: ""
    });

    const handleAddHold = () => {
        setEditingHoldId(null);
        setHoldForm({
            startDate: "",
            endDate: "",
            type: "",
            details: "",
            status: ""
        });
        setShowHoldDialog(true);
    };

    const handleSaveHold = () => {
        if (editingHoldId) {
            setCpiHolds(cpiHolds.map(h => 
                h.id === editingHoldId 
                    ? { ...h, ...holdForm }
                    : h
            ));
        } else {
            const newHold = {
                id: Math.max(...cpiHolds.map(h => h.id), 0) + 1,
                ...holdForm
            };
            setCpiHolds([...cpiHolds, newHold]);
        }
        setShowHoldDialog(false);
    };

    const handleRowClick = (hold: any) => {
        setSelectedHold(hold);
        setShowDetailDialog(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Active":
                return "#c23934"; // Red
            case "Resolved":
                return "#4caf50"; // Green
            case "Pending Review":
                return "#ff9800"; // Orange
            default:
                return "#706e6b"; // Gray
        }
    };

    return (
        <div className="p-6 max-w-6xl">
            <div 
                className="overflow-hidden"
                style={{
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    borderRadius: 'var(--slds-c-card-radius-border)',
                    backgroundColor: 'var(--slds-g-color-background-base)'
                }}
            >
                <div 
                    className="px-4 py-3 flex items-center justify-between"
                    style={{
                        borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                        backgroundColor: 'var(--slds-g-color-background-alt)'
                    }}
                >
                    <h3 className="text-[13px] font-semibold text-[#080707]">Eligibility for CPI Holds</h3>
                    <Button
                        onClick={handleAddHold}
                        className="h-7 px-3 rounded-full text-[11px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white"
                    >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                    </Button>
                </div>
                <div className="p-4">
                    {cpiHolds.length === 0 ? (
                        <div className="text-center py-8" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-40" />
                            <p className="text-[13px]">No CPI holds on record</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            Start Date
                                        </TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            End Date
                                        </TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            Type
                                        </TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            Details
                                        </TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            Status
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cpiHolds.map((hold, index) => (
                                        <TableRow 
                                            key={hold.id}
                                            onClick={() => handleRowClick(hold)}
                                            className="cursor-pointer hover:bg-gray-50"
                                            style={{ 
                                                borderBottom: index < cpiHolds.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none'
                                            }}
                                        >
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] whitespace-nowrap">
                                                {formatMdy(new Date(hold.startDate))}
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] whitespace-nowrap">
                                                {hold.endDate ? formatMdy(new Date(hold.endDate)) : '—'}
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707]">
                                                {hold.type}
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] max-w-[400px]">
                                                <div className="line-clamp-2">{hold.details}</div>
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px]">
                                                <span 
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium"
                                                    style={{ 
                                                        backgroundColor: getStatusColor(hold.status) + '15',
                                                        color: getStatusColor(hold.status)
                                                    }}
                                                >
                                                    {hold.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Detail View Dialog */}
                    <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader className="relative">
                                <DialogTitle className="text-[18px] font-semibold">CPI Hold Details</DialogTitle>
                                <DialogDescription className="text-[14px] text-[#525252]">
                                    View complete information about this CPI hold.
                                </DialogDescription>
                            </DialogHeader>
                            {selectedHold && (
                                <div className="py-4">
                                    {/* Primary Information - Matches Table Columns */}
                                    <div className="mb-6">
                                        <h3 className="text-[14px] font-semibold mb-3 pb-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: '#080707' }}>
                                            Hold Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Start Date</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">
                                                    {formatMdy(new Date(selectedHold.startDate))}
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">End Date</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">
                                                    {selectedHold.endDate ? formatMdy(new Date(selectedHold.endDate)) : 'Ongoing'}
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Type</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedHold.type}</div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Status</Label>
                                                <div className="mt-1">
                                                    <span 
                                                        className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium"
                                                        style={{ 
                                                            backgroundColor: getStatusColor(selectedHold.status) + '15',
                                                            color: getStatusColor(selectedHold.status)
                                                        }}
                                                    >
                                                        {selectedHold.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details Section */}
                                    <div className="mb-4">
                                        <h3 className="text-[14px] font-semibold mb-3 pb-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: '#080707' }}>
                                            Details
                                        </h3>
                                        <div>
                                            <Label className="text-[11px] font-semibold text-[#706e6b]">Description</Label>
                                            <div className="text-[13px] mt-1 text-[#080707]">{selectedHold.details}</div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        <Button
                                            onClick={() => setShowDetailDialog(false)}
                                            className="h-9 px-4 rounded-full text-[13px] font-medium"
                                            style={{
                                                backgroundColor: '#145F33',
                                                color: 'white'
                                            }}
                                        >
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Add/Edit Hold Dialog */}
                    <Dialog open={showHoldDialog} onOpenChange={setShowHoldDialog}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-[18px] font-semibold">
                                    {editingHoldId ? 'Edit CPI Hold' : 'Add CPI Hold'}
                                </DialogTitle>
                                <DialogDescription className="text-[14px] text-[#525252]">
                                    {editingHoldId ? 'Update the details of the existing CPI hold.' : 'Add a new CPI hold record.'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                {/* Type */}
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold text-[#080707]">Type *</Label>
                                    <Select
                                        value={holdForm.type}
                                        onValueChange={(value) => setHoldForm({...holdForm, type: value})}
                                    >
                                        <SelectTrigger className="h-9 text-[13px]">
                                            <SelectValue placeholder="Select hold type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Financial">Financial</SelectItem>
                                            <SelectItem value="Academic">Academic</SelectItem>
                                            <SelectItem value="Behavioral">Behavioral</SelectItem>
                                            <SelectItem value="Administrative">Administrative</SelectItem>
                                            <SelectItem value="Medical">Medical</SelectItem>
                                            <SelectItem value="Attendance">Attendance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Date Range */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-[#080707]">Start Date *</Label>
                                        <DateInput
value={isoToMdy(holdForm.startDate)}
                                            onChange={(v) => ((e) => setHoldForm({...holdForm, startDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                            className="h-9 text-[13px]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-[#080707]">End Date</Label>
                                        <DateInput
value={isoToMdy(holdForm.endDate)}
                                            onChange={(v) => ((e) => setHoldForm({...holdForm, endDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                            className="h-9 text-[13px]"
                                            placeholder="Leave blank for ongoing"
                                        />
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold text-[#080707]">Status *</Label>
                                    <Select
                                        value={holdForm.status}
                                        onValueChange={(value) => setHoldForm({...holdForm, status: value})}
                                    >
                                        <SelectTrigger className="h-9 text-[13px]">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Resolved">Resolved</SelectItem>
                                            <SelectItem value="Pending Review">Pending Review</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Details */}
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold text-[#080707]">Details *</Label>
                                    <Textarea
                                        value={holdForm.details}
                                        onChange={(e) => setHoldForm({...holdForm, details: e.target.value})}
                                        className="min-h-[100px] text-[13px] resize-none"
                                        placeholder="Describe the hold details and requirements..."
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                    <Button
                                        onClick={() => setShowHoldDialog(false)}
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
                                        onClick={handleSaveHold}
                                        disabled={!holdForm.type || !holdForm.startDate || !holdForm.details || !holdForm.status}
                                        className="h-9 px-4 rounded-full text-[13px] font-medium"
                                        style={{
                                            backgroundColor: '#145F33',
                                            color: 'white',
                                            opacity: (!holdForm.type || !holdForm.startDate || !holdForm.details || !holdForm.status) ? 0.5 : 1
                                        }}
                                    >
                                        {editingHoldId ? 'Update Hold' : 'Add Hold'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}