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

export function LegalInvolvementSection() {
    const [legalRecords, setLegalRecords] = useState([
        {
            id: 1,
            date: "2024-12-15",
            courtType: "Juvenile Court",
            levelOfCrime: "Misdemeanor",
            description: "Petty theft at local convenience store. Youth took snacks without paying.",
            status: "Pending"
        },
        {
            id: 2,
            date: "2024-11-03",
            courtType: "Family Court",
            levelOfCrime: "N/A",
            description: "Custody hearing regarding placement with biological mother. Court ordered continued placement at Mercy Home.",
            status: "Closed"
        },
        {
            id: 3,
            date: "2024-10-20",
            courtType: "Juvenile Court",
            levelOfCrime: "Felony",
            description: "Assault charges stemming from altercation at previous school. Youth accepted plea deal with probation.",
            status: "Active"
        },
        {
            id: 4,
            date: "2024-09-08",
            courtType: "Juvenile Court",
            levelOfCrime: "Misdemeanor",
            description: "Truancy violation - missed 15+ days of school without valid excuse. Referred to court by school district.",
            status: "Closed"
        },
        {
            id: 5,
            date: "2024-08-12",
            courtType: "Criminal Court",
            levelOfCrime: "Felony",
            description: "Breaking and entering at abandoned warehouse. Youth was with peer group. Charges reduced to trespassing.",
            status: "Active"
        },
        {
            id: 6,
            date: "2024-07-25",
            courtType: "Family Court",
            levelOfCrime: "N/A",
            description: "Permanency hearing to review progress toward reunification goals. Court extended timeline by 6 months.",
            status: "Active"
        }
    ]);
    
    const [showDialog, setShowDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [recordForm, setRecordForm] = useState({
        date: "",
        courtType: "",
        levelOfCrime: "",
        description: "",
        status: ""
    });

    const handleAdd = () => {
        setEditingId(null);
        setRecordForm({
            date: "",
            courtType: "",
            levelOfCrime: "",
            description: "",
            status: ""
        });
        setShowDialog(true);
    };

    const handleSave = () => {
        if (editingId) {
            setLegalRecords(legalRecords.map(r => 
                r.id === editingId 
                    ? { ...r, ...recordForm }
                    : r
            ));
        } else {
            const newRecord = {
                id: Math.max(...legalRecords.map(r => r.id), 0) + 1,
                ...recordForm
            };
            setLegalRecords([...legalRecords, newRecord]);
        }
        setShowDialog(false);
    };

    const handleRowClick = (record: any) => {
        setSelectedRecord(record);
        setShowDetailDialog(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Active":
                return "#2196f3"; // Blue
            case "Pending":
                return "#ff9800"; // Orange
            case "Closed":
                return "#706e6b"; // Gray
            default:
                return "#706e6b";
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case "Felony":
                return "#c23934"; // Red
            case "Misdemeanor":
                return "#ff9800"; // Orange
            case "N/A":
                return "#706e6b"; // Gray
            default:
                return "#706e6b";
        }
    };

    return (
        <div className="py-6 max-w-6xl">
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
                    <h3 className="text-[13px] font-semibold text-[#080707]">Legal Involvement</h3>
                    <Button
                        onClick={handleAdd}
                        className="h-7 px-3 rounded-full text-[11px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white"
                    >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                    </Button>
                </div>
                <div className="p-4">
                    {legalRecords.length === 0 ? (
                        <div className="text-center py-8" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-40" />
                            <p className="text-[13px]">No legal involvement records</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            Date
                                        </TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            Court Type
                                        </TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            Level of Crime
                                        </TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            Description
                                        </TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            Status
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {legalRecords.map((record, index) => (
                                        <TableRow 
                                            key={record.id}
                                            onClick={() => handleRowClick(record)}
                                            className="cursor-pointer hover:bg-gray-50"
                                            style={{ 
                                                borderBottom: index < legalRecords.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none'
                                            }}
                                        >
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] whitespace-nowrap">
                                                {formatMdy(new Date(record.date))}
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] whitespace-nowrap">
                                                {record.courtType}
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px]">
                                                <span 
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium"
                                                    style={{ 
                                                        backgroundColor: getLevelColor(record.levelOfCrime) + '15',
                                                        color: getLevelColor(record.levelOfCrime)
                                                    }}
                                                >
                                                    {record.levelOfCrime}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] max-w-[400px]">
                                                <div className="line-clamp-2">{record.description}</div>
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px]">
                                                <span 
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium"
                                                    style={{ 
                                                        backgroundColor: getStatusColor(record.status) + '15',
                                                        color: getStatusColor(record.status)
                                                    }}
                                                >
                                                    {record.status}
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
                                <DialogTitle className="text-[18px] font-semibold">Legal Involvement Details</DialogTitle>
                                <DialogDescription className="text-[14px] text-[#525252]">
                                    View complete information about this legal record.
                                </DialogDescription>
                            </DialogHeader>
                            {selectedRecord && (
                                <div className="py-4">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <Label className="text-[11px] font-semibold text-[#706e6b]">Date</Label>
                                            <div className="text-[13px] mt-1 text-[#080707]">
                                                {formatMdy(new Date(selectedRecord.date))}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-[11px] font-semibold text-[#706e6b]">Court Type</Label>
                                            <div className="text-[13px] mt-1 text-[#080707]">{selectedRecord.courtType}</div>
                                        </div>
                                        <div>
                                            <Label className="text-[11px] font-semibold text-[#706e6b]">Level of Crime</Label>
                                            <div className="mt-1">
                                                <span 
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium"
                                                    style={{ 
                                                        backgroundColor: getLevelColor(selectedRecord.levelOfCrime) + '15',
                                                        color: getLevelColor(selectedRecord.levelOfCrime)
                                                    }}
                                                >
                                                    {selectedRecord.levelOfCrime}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-[11px] font-semibold text-[#706e6b]">Status</Label>
                                            <div className="mt-1">
                                                <span 
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium"
                                                    style={{ 
                                                        backgroundColor: getStatusColor(selectedRecord.status) + '15',
                                                        color: getStatusColor(selectedRecord.status)
                                                    }}
                                                >
                                                    {selectedRecord.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <Label className="text-[11px] font-semibold text-[#706e6b]">Description</Label>
                                            <div className="text-[13px] mt-1 text-[#080707]">{selectedRecord.description}</div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-2 pt-6" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)', marginTop: '24px' }}>
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

                    {/* Add/Edit Dialog */}
                    <Dialog open={showDialog} onOpenChange={setShowDialog}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-[18px] font-semibold">
                                    {editingId ? 'Edit Legal Involvement' : 'Add Legal Involvement'}
                                </DialogTitle>
                                <DialogDescription className="text-[14px] text-[#525252]">
                                    {editingId ? 'Update the legal involvement details.' : 'Add a new legal involvement record.'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                {/* Date & Court Type */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-[#080707]">Date *</Label>
                                        <DateInput
value={isoToMdy(recordForm.date)}
                                            onChange={(v) => ((e) => setRecordForm({...recordForm, date: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                            className="h-9 text-[13px]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-[#080707]">Court Type *</Label>
                                        <Select
                                            value={recordForm.courtType}
                                            onValueChange={(value) => setRecordForm({...recordForm, courtType: value})}
                                        >
                                            <SelectTrigger className="h-9 text-[13px]">
                                                <SelectValue placeholder="Select court type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Juvenile Court">Juvenile Court</SelectItem>
                                                <SelectItem value="Family Court">Family Court</SelectItem>
                                                <SelectItem value="Criminal Court">Criminal Court</SelectItem>
                                                <SelectItem value="Traffic Court">Traffic Court</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Level of Crime & Status */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-[#080707]">Level of Crime *</Label>
                                        <Select
                                            value={recordForm.levelOfCrime}
                                            onValueChange={(value) => setRecordForm({...recordForm, levelOfCrime: value})}
                                        >
                                            <SelectTrigger className="h-9 text-[13px]">
                                                <SelectValue placeholder="Select level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Felony">Felony</SelectItem>
                                                <SelectItem value="Misdemeanor">Misdemeanor</SelectItem>
                                                <SelectItem value="Violation">Violation</SelectItem>
                                                <SelectItem value="N/A">N/A</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-[#080707]">Status *</Label>
                                        <Select
                                            value={recordForm.status}
                                            onValueChange={(value) => setRecordForm({...recordForm, status: value})}
                                        >
                                            <SelectTrigger className="h-9 text-[13px]">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Closed">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold text-[#080707]">Description *</Label>
                                    <Textarea
                                        value={recordForm.description}
                                        onChange={(e) => setRecordForm({...recordForm, description: e.target.value})}
                                        className="min-h-[100px] text-[13px] resize-none"
                                        placeholder="Enter detailed description of the legal matter..."
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                    <Button
                                        onClick={() => setShowDialog(false)}
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
                                        onClick={handleSave}
                                        disabled={!recordForm.date || !recordForm.courtType || !recordForm.levelOfCrime || !recordForm.description || !recordForm.status}
                                        className="h-9 px-4 rounded-full text-[13px] font-medium"
                                        style={{
                                            backgroundColor: '#145F33',
                                            color: 'white',
                                            opacity: (!recordForm.date || !recordForm.courtType || !recordForm.levelOfCrime || !recordForm.description || !recordForm.status) ? 0.5 : 1
                                        }}
                                    >
                                        {editingId ? 'Update' : 'Add'}
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