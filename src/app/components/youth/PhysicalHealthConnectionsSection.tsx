import { useState } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Plus, AlertTriangle, Search, X, UserPlus } from "@/app/lib/lucide-icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, formatMdy } from "../../lib/dateFormat";
import { getDemoUserName } from "../../lib/demoIdentity";

export function PhysicalHealthConnectionsSection() {
    const [searchTerm, setSearchTerm] = useState("");
    const [connections, setConnections] = useState([
        {
            id: "HC-2025-001",
            startDateTime: "2025-01-08T09:00",
            endDateTime: "2025-01-08T10:30",
            connection: "Dr. Sarah Chen - Annual Physical Exam",
            attended: "Yes",
            participants: "Youth, Dr. Sarah Chen, Case Manager Lisa Anderson",
            programs: "Primary Care, Preventive Health",
            homeVisit: "No",
            location: "Mercy Home Medical Clinic",
            purpose: "Annual comprehensive physical examination and health screening",
            notes: "Youth is in good overall health. Height: 5'7\", Weight: 145 lbs, BMI: 22.7 (healthy range). Vision and hearing tests normal. All immunizations up to date. Discussed nutrition and exercise. Recommended continuation of current ADHD medication. Follow-up in 12 months.",
            followUpRequired: "Yes",
            followUpDate: "2026-01-08",
            createdBy: "Lisa Anderson"
        },
        {
            id: "HC-2024-089",
            startDateTime: "2024-12-15T14:00",
            endDateTime: "2024-12-15T15:00",
            connection: "Dr. James Taylor - Psychiatric Consultation",
            attended: "Yes",
            participants: "Youth, Dr. James Taylor, Psychiatrist",
            programs: "Mental Health, Medication Management",
            homeVisit: "No",
            location: "Outpatient Mental Health Center",
            purpose: "Quarterly medication management review for ADHD",
            notes: "Youth reports ADHD medication (Adderall XR 20mg) is effective. Focus improved at school and during activities. No significant side effects. Sleep and appetite normal. Mood stable. Continue current medication dosage. Next review in 3 months.",
            followUpRequired: "Yes",
            followUpDate: "2025-03-15",
            createdBy: "Dr. James Taylor"
        },
        {
            id: "HC-2024-067",
            startDateTime: "2024-11-20T10:30",
            endDateTime: "2024-11-20T11:15",
            connection: "Physical Therapy - Knee Rehabilitation",
            attended: "Yes",
            participants: "Youth, Physical Therapist Mark Stevens",
            programs: "Orthopedic Care, Physical Therapy",
            homeVisit: "No",
            location: "Sports Medicine & Rehab Center",
            purpose: "Post-ACL reconstruction therapy - strength and mobility assessment",
            notes: "Excellent progress in knee rehabilitation. Range of motion at 95% of normal. Strength exercises showing improvement. Youth demonstrates good compliance with home exercise program. Cleared for light jogging and non-contact sports. Continue PT exercises at home. Discharge from formal PT - PRN basis only.",
            followUpRequired: "No",
            followUpDate: "",
            createdBy: "Mark Stevens, PT"
        },
        {
            id: "HC-2024-045",
            startDateTime: "2024-10-10T13:00",
            endDateTime: "2024-10-10T13:45",
            connection: "Dental Appointment - Dr. Martinez",
            attended: "Yes",
            participants: "Youth, Dr. Carlos Martinez, Dental Hygienist",
            programs: "Dental Care, Preventive Health",
            homeVisit: "No",
            location: "Community Dental Clinic",
            purpose: "Routine dental cleaning and examination",
            notes: "Routine cleaning completed. One small cavity identified on lower right molar (#30). X-rays taken. Discussed proper brushing technique and flossing. Scheduled filling appointment for next week. Overall oral health is good. Recommended fluoride treatment.",
            followUpRequired: "Yes",
            followUpDate: "2024-10-17",
            createdBy: "Dental Office Staff"
        },
        {
            id: "HC-2024-032",
            startDateTime: "2024-09-25T11:00",
            endDateTime: "2024-09-25T12:00",
            connection: "Allergist - Dr. Emily Rodriguez",
            attended: "Yes",
            participants: "Youth, Dr. Emily Rodriguez, Case Manager",
            programs: "Allergy Management, Specialized Care",
            homeVisit: "No",
            location: "Allergy & Immunology Specialists",
            purpose: "Allergy testing and EpiPen training review",
            notes: "Confirmed tree nut allergy through skin testing. Severe reaction potential. Reviewed proper EpiPen usage with youth and case manager. Youth demonstrated correct technique. Provided two EpiPens (one for youth to carry, one for medical office). Emergency action plan updated. Avoid all tree nuts. Annual follow-up recommended.",
            followUpRequired: "Yes",
            followUpDate: "2025-09-25",
            createdBy: "Amanda Foster"
        },
        {
            id: "HC-2024-018",
            startDateTime: "2024-08-12T15:30",
            endDateTime: "2024-08-12T16:00",
            connection: "Vision Screening - Eye Care Center",
            attended: "Yes",
            participants: "Youth, Optometrist Dr. Rebecca Lee",
            programs: "Vision Care, Medical Equipment",
            homeVisit: "No",
            location: "Family Eye Care Center",
            purpose: "Annual vision examination and prescription update",
            notes: "Vision screening shows myopia (nearsightedness) has progressed slightly. New prescription: -2.50 both eyes (previous -2.25). New glasses ordered. Backup pair recommended. No signs of eye disease or complications. Return in 12 months or sooner if vision changes. Glasses ready for pickup in 1 week.",
            followUpRequired: "Yes",
            followUpDate: "2025-08-12",
            createdBy: "Medical Coordinator"
        }
    ]);
    
    const [showDialog, setShowDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [selectedConnection, setSelectedConnection] = useState<any>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    
    const [connectionForm, setConnectionForm] = useState({
        startDateTime: "",
        endDateTime: "",
        connection: "",
        attended: "",
        participants: "",
        programs: "",
        homeVisit: "",
        location: "",
        purpose: "",
        notes: "",
        followUpRequired: "",
        followUpDate: ""
    });

    const filteredConnections = connections.filter(conn => 
        searchTerm === "" ||
        conn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.connection.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.participants.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.programs.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = () => {
        setEditingId(null);
        setConnectionForm({
            startDateTime: "",
            endDateTime: "",
            connection: "",
            attended: "",
            participants: "",
            programs: "",
            homeVisit: "",
            location: "",
            purpose: "",
            notes: "",
            followUpRequired: "",
            followUpDate: ""
        });
        setShowDialog(true);
    };

    const handleEdit = (record: any) => {
        setEditingId(record.id);
        setConnectionForm({
            startDateTime: record.startDateTime,
            endDateTime: record.endDateTime,
            connection: record.connection,
            attended: record.attended,
            participants: record.participants,
            programs: record.programs,
            homeVisit: record.homeVisit,
            location: record.location || "",
            purpose: record.purpose || "",
            notes: record.notes || "",
            followUpRequired: record.followUpRequired || "",
            followUpDate: record.followUpDate || ""
        });
        setShowDialog(true);
    };

    const handleSave = () => {
        if (editingId) {
            setConnections(connections.map(c => 
                c.id === editingId 
                    ? { ...c, ...connectionForm }
                    : c
            ));
        } else {
            const newConnection = {
                id: `HC-2025-${String(connections.length + 1).padStart(3, '0')}`,
                ...connectionForm,
                createdBy: getDemoUserName()
            };
            setConnections([...connections, newConnection]);
        }
        setShowDialog(false);
    };

    const handleRowClick = (record: any) => {
        setSelectedConnection(record);
        setShowDetailDialog(true);
    };

    const formatDateTime = (dateTimeStr: string) => {
        const date = new Date(dateTimeStr);
        return date.toLocaleString('en-US', { 
            month: '2-digit', 
            day: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                    <h3 className="text-[13px] font-semibold text-[#080707]">Physical Health Connections</h3>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-[#706e6b]" />
                            <Input
                                placeholder="Search connections..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-7 pl-7 pr-3 text-[11px] w-[200px]"
                            />
                        </div>
                        <Button
                            onClick={handleAdd}
                            className="h-7 px-3 rounded-full text-[11px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white"
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Connection
                        </Button>
                    </div>
                </div>
                <div className="p-4">
                    {filteredConnections.length === 0 ? (
                        <div className="text-center py-8" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-40" />
                            <p className="text-[13px]">{searchTerm ? "No connections found matching your search" : "No health connections recorded"}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>ID</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Start Date & Time</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>End Date & Time</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Connection</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Attended</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Participants</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Program(s)</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Home Visit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredConnections.map((record, index) => (
                                        <TableRow 
                                            key={record.id}
                                            onClick={() => handleRowClick(record)}
                                            className="cursor-pointer hover:bg-gray-50"
                                            style={{ 
                                                borderBottom: index < filteredConnections.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                                backgroundColor: 'var(--slds-g-color-background-base)'
                                            }}
                                        >
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] font-medium">{record.id}</TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] whitespace-nowrap">
                                                {formatDateTime(record.startDateTime)}
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] whitespace-nowrap">
                                                {formatDateTime(record.endDateTime)}
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707]">{record.connection}</TableCell>
                                            <TableCell className="px-3 py-3 text-[13px]">
                                                <Badge 
                                                    className={`text-[11px] px-2 py-0.5 ${
                                                        record.attended === "Yes" 
                                                            ? "bg-green-100 text-green-800" 
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {record.attended}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] max-w-[200px]">
                                                <div className="line-clamp-1">{record.participants}</div>
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707]">{record.programs}</TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707]">{record.homeVisit}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Detail View Dialog */}
                    <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader className="relative">
                                <DialogTitle className="text-[18px] font-semibold">Health Connection Details</DialogTitle>
                                <DialogDescription className="text-[14px] text-[#525252]">
                                    Complete health connection information
                                </DialogDescription>
                            </DialogHeader>
                            {selectedConnection && (
                                <div className="py-4">
                                    {/* Basic Information */}
                                    <div className="mb-6">
                                        <h3 className="text-[14px] font-semibold mb-3 pb-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: '#080707' }}>
                                            Connection Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">ID</Label>
                                                <div className="text-[13px] mt-1 text-[#080707] font-medium">{selectedConnection.id}</div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Connection</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedConnection.connection}</div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Start Date & Time</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{formatDateTime(selectedConnection.startDateTime)}</div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">End Date & Time</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{formatDateTime(selectedConnection.endDateTime)}</div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Attended</Label>
                                                <div className="mt-1">
                                                    <Badge className={`text-[11px] ${selectedConnection.attended === "Yes" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                        {selectedConnection.attended}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Home Visit</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedConnection.homeVisit}</div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Location</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedConnection.location}</div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Program(s)</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedConnection.programs}</div>
                                            </div>
                                            <div className="col-span-2">
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Participants</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedConnection.participants}</div>
                                            </div>
                                            <div className="col-span-2">
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Purpose</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedConnection.purpose}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes & Follow-up */}
                                    <div className="mb-6">
                                        <h3 className="text-[14px] font-semibold mb-3 pb-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: '#080707' }}>
                                            Notes & Follow-up
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Notes</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedConnection.notes || '—'}</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Follow-up Required</Label>
                                                    <div className="text-[13px] mt-1 text-[#080707]">{selectedConnection.followUpRequired || '—'}</div>
                                                </div>
                                                <div>
                                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Follow-up Date</Label>
                                                    <div className="text-[13px] mt-1 text-[#080707]">
                                                        {selectedConnection.followUpDate ? formatMdy(new Date(selectedConnection.followUpDate)) : '—'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Created By</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedConnection.createdBy}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        <Button
                                            onClick={() => setShowDetailDialog(false)}
                                            variant="outline"
                                            className="h-8 px-4 rounded-full text-[12px]"
                                        >
                                            Close
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setShowDetailDialog(false);
                                                handleEdit(selectedConnection);
                                            }}
                                            className="h-8 px-4 rounded-full text-[12px] bg-[#145F33] hover:bg-[#0f4a26] text-white"
                                        >
                                            Edit
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
                                    {editingId ? "Edit Health Connection" : "Add Health Connection"}
                                </DialogTitle>
                                <DialogDescription className="text-[14px] text-[#525252]">
                                    {editingId ? "Update health connection information" : "Add new health connection record"}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="startDateTime" className="text-[11px] font-semibold text-[#080707]">Start Date & Time *</Label>
                                        <Input
                                            id="startDateTime"
                                            type="datetime-local"
                                            value={connectionForm.startDateTime}
                                            onChange={(e) => setConnectionForm({...connectionForm, startDateTime: e.target.value})}
                                            className="mt-1 h-8 text-[13px]"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="endDateTime" className="text-[11px] font-semibold text-[#080707]">End Date & Time *</Label>
                                        <Input
                                            id="endDateTime"
                                            type="datetime-local"
                                            value={connectionForm.endDateTime}
                                            onChange={(e) => setConnectionForm({...connectionForm, endDateTime: e.target.value})}
                                            className="mt-1 h-8 text-[13px]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="connection" className="text-[11px] font-semibold text-[#080707]">Connection *</Label>
                                    <Input
                                        id="connection"
                                        value={connectionForm.connection}
                                        onChange={(e) => setConnectionForm({...connectionForm, connection: e.target.value})}
                                        className="mt-1 h-8 text-[13px]"
                                        placeholder="e.g., Dr. Smith - Follow-up Appointment"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="attended" className="text-[11px] font-semibold text-[#080707]">Attended *</Label>
                                        <Select
                                            value={connectionForm.attended}
                                            onValueChange={(value) => setConnectionForm({...connectionForm, attended: value})}
                                        >
                                            <SelectTrigger className="mt-1 h-8 text-[13px]">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                                <SelectItem value="Partial">Partial</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="homeVisit" className="text-[11px] font-semibold text-[#080707]">Home Visit</Label>
                                        <Select
                                            value={connectionForm.homeVisit}
                                            onValueChange={(value) => setConnectionForm({...connectionForm, homeVisit: value})}
                                        >
                                            <SelectTrigger className="mt-1 h-8 text-[13px]">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="location" className="text-[11px] font-semibold text-[#080707]">Location</Label>
                                    <Input
                                        id="location"
                                        value={connectionForm.location}
                                        onChange={(e) => setConnectionForm({...connectionForm, location: e.target.value})}
                                        className="mt-1 h-8 text-[13px]"
                                        placeholder="Location of connection"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="participants" className="text-[11px] font-semibold text-[#080707]">Participants</Label>
                                    <Input
                                        id="participants"
                                        value={connectionForm.participants}
                                        onChange={(e) => setConnectionForm({...connectionForm, participants: e.target.value})}
                                        className="mt-1 h-8 text-[13px]"
                                        placeholder="List all participants"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="programs" className="text-[11px] font-semibold text-[#080707]">Program(s)</Label>
                                    <Input
                                        id="programs"
                                        value={connectionForm.programs}
                                        onChange={(e) => setConnectionForm({...connectionForm, programs: e.target.value})}
                                        className="mt-1 h-8 text-[13px]"
                                        placeholder="Associated programs"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="purpose" className="text-[11px] font-semibold text-[#080707]">Purpose</Label>
                                    <Textarea
                                        id="purpose"
                                        value={connectionForm.purpose}
                                        onChange={(e) => setConnectionForm({...connectionForm, purpose: e.target.value})}
                                        className="mt-1 min-h-[60px] text-[13px]"
                                        placeholder="Purpose of the connection..."
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="notes" className="text-[11px] font-semibold text-[#080707]">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={connectionForm.notes}
                                        onChange={(e) => setConnectionForm({...connectionForm, notes: e.target.value})}
                                        className="mt-1 min-h-[80px] text-[13px]"
                                        placeholder="Detailed notes from the connection..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="followUpRequired" className="text-[11px] font-semibold text-[#080707]">Follow-up Required</Label>
                                        <Select
                                            value={connectionForm.followUpRequired}
                                            onValueChange={(value) => setConnectionForm({...connectionForm, followUpRequired: value})}
                                        >
                                            <SelectTrigger className="mt-1 h-8 text-[13px]">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="followUpDate" className="text-[11px] font-semibold text-[#080707]">Follow-up Date</Label>
                                        <DateInput
                                            id="followUpDate"
value={isoToMdy(connectionForm.followUpDate)}
                                            onChange={(v) => ((e) => setConnectionForm({...connectionForm, followUpDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                            className="mt-1 h-8 text-[13px]"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                <Button
                                    onClick={() => setShowDialog(false)}
                                    variant="outline"
                                    className="h-8 px-4 rounded-full text-[12px]"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    className="h-8 px-4 rounded-full text-[12px] bg-[#145F33] hover:bg-[#0f4a26] text-white"
                                    disabled={!connectionForm.startDateTime || !connectionForm.endDateTime || !connectionForm.connection || !connectionForm.attended}
                                >
                                    {editingId ? "Update" : "Create"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}