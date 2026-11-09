import { useState } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Plus, AlertTriangle, Trash2 } from "@/app/lib/lucide-icons";
import { VisuallyHidden } from "../ui/visually-hidden";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, formatMdy } from "../../lib/dateFormat";
import { getDemoUserName } from "../../lib/demoIdentity";

export function TraumaHistorySection() {
    const [traumaRecords, setTraumaRecords] = useState([
        {
            id: 1,
            dateReported: "2024-09-15",
            lastItpInclusion: "2024-10-01",
            subjectOfTrauma: "Youth",
            traumaType: "Witness to Domestic Violence",
            ageAtFirstOccurrence: "Known Age",
            ageAtFirstOccurrenceValue: "5",
            ageAtLastOccurrence: "Known Age",
            ageAtLastOccurrenceValue: "7",
            ongoing: "No",
            description: "Witnessed domestic violence in home environment. Multiple incidents reported by social worker during initial assessment.",
            reportedBy: "Sarah Johnson - DCFS Case Worker",
            createdBy: "Michael Chen",
            developmentalStages: [
                { stage: "Unestablished", impacted: false },
                { stage: "Prenatal (Birth - 2 Months)", impacted: false },
                { stage: "Infancy (3-12 Months)", impacted: false },
                { stage: "Early Childhood (1-3 Years)", impacted: true },
                { stage: "Childhood (4-10 Years)", impacted: true },
                { stage: "Adolescence (11-18 Years)", impacted: false },
                { stage: "Young Adult (19-24 Years)", impacted: false },
                { stage: "Adult (25+ Years)", impacted: false },
                { stage: "Ongoing", impacted: false },
                { stage: "Unknown", impacted: false }
            ],
            impactOnYouth: [
                { id: 1, dateReported: "2024-09-15", description: "Nightmares and difficulty sleeping" },
                { id: 2, dateReported: "2024-10-01", description: "Hypervigilance around conflict" }
            ],
            reportedByPersons: [
                { id: 1, name: "Sarah Johnson", relationship: "DCFS Case Worker" }
            ],
            dcfsHotlineRequired: "No",
            comments: "Youth shows significant progress in managing trauma responses. Regular check-ins with therapist recommended.",
            notes: "Additional notes for internal use."
        },
        {
            id: 2,
            dateReported: "2024-10-20",
            lastItpInclusion: "2024-11-05",
            subjectOfTrauma: "Family",
            traumaType: "Incarceration of Parent or Caregiver",
            ageAtFirstOccurrence: "Known Age",
            ageAtFirstOccurrenceValue: "7",
            ageAtLastOccurrence: "Known Age",
            ageAtLastOccurrenceValue: "7",
            ongoing: "Yes",
            description: "History of abandonment by biological father at age 7. Mother struggled with substance abuse leading to placement.",
            reportedBy: "Dr. Emily Rodriguez - Therapist",
            createdBy: "Amanda Foster",
            developmentalStages: [
                { stage: "Unestablished", impacted: false },
                { stage: "Prenatal (Birth - 2 Months)", impacted: false },
                { stage: "Infancy (3-12 Months)", impacted: false },
                { stage: "Early Childhood (1-3 Years)", impacted: false },
                { stage: "Childhood (4-10 Years)", impacted: true },
                { stage: "Adolescence (11-18 Years)", impacted: true },
                { stage: "Young Adult (19-24 Years)", impacted: false },
                { stage: "Adult (25+ Years)", impacted: false },
                { stage: "Ongoing", impacted: false },
                { stage: "Unknown", impacted: false }
            ],
            impactOnYouth: [
                { id: 1, dateReported: "2024-10-20", description: "Difficulty forming attachments with adults" },
                { id: 2, dateReported: "2024-11-05", description: "Anxiety during transitions" }
            ],
            reportedByPersons: [
                { id: 1, name: "Dr. Emily Rodriguez", relationship: "Therapist" }
            ],
            dcfsHotlineRequired: "Yes",
            comments: "Building trust with primary counselor. Showing improvement in forming healthy attachments.",
            notes: ""
        },
        {
            id: 3,
            dateReported: "2024-11-10",
            lastItpInclusion: "2024-12-01",
            subjectOfTrauma: "Youth",
            traumaType: "Victim of Physical Abuse",
            ageAtFirstOccurrence: "Known Age",
            ageAtFirstOccurrenceValue: "8",
            ageAtLastOccurrence: "Known Age",
            ageAtLastOccurrenceValue: "10",
            ongoing: "No",
            description: "History of physical abuse by stepfather over 2-year period. Scars documented in medical records.",
            reportedBy: "Dr. Patricia Moore - Pediatrician",
            createdBy: "Robert Wilson",
            developmentalStages: [
                { stage: "Unestablished", impacted: false },
                { stage: "Prenatal (Birth - 2 Months)", impacted: false },
                { stage: "Infancy (3-12 Months)", impacted: false },
                { stage: "Early Childhood (1-3 Years)", impacted: false },
                { stage: "Childhood (4-10 Years)", impacted: true },
                { stage: "Adolescence (11-18 Years)", impacted: false },
                { stage: "Young Adult (19-24 Years)", impacted: false },
                { stage: "Adult (25+ Years)", impacted: false },
                { stage: "Ongoing", impacted: false },
                { stage: "Unknown", impacted: false }
            ],
            impactOnYouth: [
                { id: 1, dateReported: "2024-11-10", description: "Fear of male authority figures" },
                { id: 2, dateReported: "2024-11-20", description: "Physical symptoms when approached without warning" }
            ],
            reportedByPersons: [
                { id: 1, name: "Dr. Patricia Moore", relationship: "Pediatrician" }
            ],
            dcfsHotlineRequired: "No",
            comments: "Making progress with male staff members. Participates in sports activities with advance preparation.",
            notes: ""
        }
    ]);
    
    const [showDialog, setShowDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [recordForm, setRecordForm] = useState({
        dateReported: "",
        lastItpInclusion: "",
        subjectOfTrauma: "",
        traumaType: "",
        ageAtFirstOccurrence: "",
        ageAtFirstOccurrenceValue: "",
        ageAtLastOccurrence: "",
        ageAtLastOccurrenceValue: "",
        ongoing: "",
        description: "",
        reportedBy: "",
        developmentalStages: [
            { stage: "Unestablished", impacted: false },
            { stage: "Prenatal (Birth - 2 Months)", impacted: false },
            { stage: "Infancy (3-12 Months)", impacted: false },
            { stage: "Early Childhood (1-3 Years)", impacted: false },
            { stage: "Childhood (4-10 Years)", impacted: false },
            { stage: "Adolescence (11-18 Years)", impacted: false },
            { stage: "Young Adult (19-24 Years)", impacted: false },
            { stage: "Adult (25+ Years)", impacted: false },
            { stage: "Ongoing", impacted: false },
            { stage: "Unknown", impacted: false }
        ],
        impactOnYouth: [] as Array<{ id: number; dateReported: string; description: string }>,
        reportedByPersons: [] as Array<{ id: number; name: string; relationship: string }>,
        dcfsHotlineRequired: "",
        comments: "",
        notes: ""
    });

    const handleAdd = () => {
        setEditingId(null);
        setRecordForm({
            dateReported: "",
            lastItpInclusion: "",
            subjectOfTrauma: "",
            traumaType: "",
            ageAtFirstOccurrence: "",
            ageAtFirstOccurrenceValue: "",
            ageAtLastOccurrence: "",
            ageAtLastOccurrenceValue: "",
            ongoing: "",
            description: "",
            reportedBy: "",
            developmentalStages: [
                { stage: "Unestablished", impacted: false },
                { stage: "Prenatal (Birth - 2 Months)", impacted: false },
                { stage: "Infancy (3-12 Months)", impacted: false },
                { stage: "Early Childhood (1-3 Years)", impacted: false },
                { stage: "Childhood (4-10 Years)", impacted: false },
                { stage: "Adolescence (11-18 Years)", impacted: false },
                { stage: "Young Adult (19-24 Years)", impacted: false },
                { stage: "Adult (25+ Years)", impacted: false },
                { stage: "Ongoing", impacted: false },
                { stage: "Unknown", impacted: false }
            ],
            impactOnYouth: [],
            reportedByPersons: [],
            dcfsHotlineRequired: "",
            comments: "",
            notes: ""
        });
        setShowDialog(true);
    };

    const handleEdit = (record: any) => {
        setEditingId(record.id);
        setRecordForm({
            dateReported: record.dateReported,
            lastItpInclusion: record.lastItpInclusion || "",
            subjectOfTrauma: record.subjectOfTrauma,
            traumaType: record.traumaType,
            ageAtFirstOccurrence: record.ageAtFirstOccurrence,
            ageAtFirstOccurrenceValue: record.ageAtFirstOccurrenceValue || "",
            ageAtLastOccurrence: record.ageAtLastOccurrence,
            ageAtLastOccurrenceValue: record.ageAtLastOccurrenceValue || "",
            ongoing: record.ongoing,
            description: record.description,
            reportedBy: record.reportedBy,
            developmentalStages: record.developmentalStages || [
                { stage: "Unestablished", impacted: false },
                { stage: "Prenatal (Birth - 2 Months)", impacted: false },
                { stage: "Infancy (3-12 Months)", impacted: false },
                { stage: "Early Childhood (1-3 Years)", impacted: false },
                { stage: "Childhood (4-10 Years)", impacted: false },
                { stage: "Adolescence (11-18 Years)", impacted: false },
                { stage: "Young Adult (19-24 Years)", impacted: false },
                { stage: "Adult (25+ Years)", impacted: false },
                { stage: "Ongoing", impacted: false },
                { stage: "Unknown", impacted: false }
            ],
            impactOnYouth: record.impactOnYouth || [],
            reportedByPersons: record.reportedByPersons || [],
            dcfsHotlineRequired: record.dcfsHotlineRequired || "",
            comments: record.comments || "",
            notes: record.notes || ""
        });
        setShowDialog(true);
    };

    const handleSave = () => {
        if (editingId) {
            setTraumaRecords(traumaRecords.map(r => 
                r.id === editingId 
                    ? { ...r, ...recordForm }
                    : r
            ));
        } else {
            const newRecord = {
                id: Math.max(...traumaRecords.map(r => r.id), 0) + 1,
                ...recordForm,
                createdBy: getDemoUserName()
            };
            setTraumaRecords([...traumaRecords, newRecord]);
        }
        setShowDialog(false);
    };

    const handleRowClick = (record: any) => {
        setSelectedRecord(record);
        setShowDetailDialog(true);
    };

    const toggleDevelopmentalStage = (index: number) => {
        const updated = [...recordForm.developmentalStages];
        updated[index].impacted = !updated[index].impacted;
        setRecordForm({ ...recordForm, developmentalStages: updated });
    };

    const addImpactRow = () => {
        const newImpact = {
            id: Math.max(...recordForm.impactOnYouth.map(i => i.id), 0) + 1,
            dateReported: "",
            description: ""
        };
        setRecordForm({ ...recordForm, impactOnYouth: [...recordForm.impactOnYouth, newImpact] });
    };

    const removeImpactRow = (id: number) => {
        setRecordForm({ 
            ...recordForm, 
            impactOnYouth: recordForm.impactOnYouth.filter(i => i.id !== id) 
        });
    };

    const updateImpactRow = (id: number, field: 'dateReported' | 'description', value: string) => {
        setRecordForm({
            ...recordForm,
            impactOnYouth: recordForm.impactOnYouth.map(i =>
                i.id === id ? { ...i, [field]: value } : i
            )
        });
    };

    const addReportedByRow = () => {
        const newReportedBy = {
            id: Math.max(...recordForm.reportedByPersons.map(i => i.id), 0) + 1,
            name: "",
            relationship: ""
        };
        setRecordForm({ ...recordForm, reportedByPersons: [...recordForm.reportedByPersons, newReportedBy] });
    };

    const removeReportedByRow = (id: number) => {
        setRecordForm({ 
            ...recordForm, 
            reportedByPersons: recordForm.reportedByPersons.filter(i => i.id !== id) 
        });
    };

    const updateReportedByRow = (id: number, field: 'name' | 'relationship', value: string) => {
        setRecordForm({
            ...recordForm,
            reportedByPersons: recordForm.reportedByPersons.map(i =>
                i.id === id ? { ...i, [field]: value } : i
            )
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
                    <h3 className="text-[13px] font-semibold text-[#080707]">Trauma History</h3>
                    <Button
                        onClick={handleAdd}
                        className="h-7 px-3 rounded-full text-[11px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white"
                    >
                        <Plus className="h-3 w-3 mr-1" />
                        Create Trauma History
                    </Button>
                </div>
                <div className="p-4">
                    {traumaRecords.length === 0 ? (
                        <div className="text-center py-8" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-40" />
                            <p className="text-[13px]">No trauma history records</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            Date Reported
                                        </TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            Last ITP Inclusion
                                        </TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            Subject
                                        </TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            Trauma Type
                                        </TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            Description
                                        </TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            Reported By
                                        </TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            Created By
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {traumaRecords.map((record, index) => (
                                        <TableRow 
                                            key={record.id}
                                            onClick={() => handleRowClick(record)}
                                            className="cursor-pointer hover:bg-gray-50"
                                            style={{ 
                                                borderBottom: index < traumaRecords.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                                backgroundColor: 'var(--slds-g-color-background-base)'
                                            }}
                                        >
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] whitespace-nowrap">
                                                {formatMdy(new Date(record.dateReported))}
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] whitespace-nowrap">
                                                {record.lastItpInclusion ? formatMdy(new Date(record.lastItpInclusion)) : '—'}
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707]">
                                                {record.subjectOfTrauma}
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707]">
                                                {record.traumaType}
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] max-w-[300px]">
                                                <div className="line-clamp-2">{record.description}</div>
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707]">
                                                {record.reportedBy}
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707]">
                                                {record.createdBy}
                                            </TableCell>
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
                                <DialogTitle className="text-[18px] font-semibold">Trauma History Details</DialogTitle>
                                <DialogDescription className="text-[14px] text-[#525252]">
                                    View complete trauma history information and treatment details.
                                </DialogDescription>
                            </DialogHeader>
                            {selectedRecord && (
                                <div className="py-4">
                                    {/* Primary Information */}
                                    <div className="mb-6">
                                        <h3 className="text-[14px] font-semibold mb-3 pb-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: '#080707' }}>
                                            Trauma Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Date Reported</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">
                                                    {formatMdy(new Date(selectedRecord.dateReported))}
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Last ITP Inclusion</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">
                                                    {selectedRecord.lastItpInclusion ? formatMdy(new Date(selectedRecord.lastItpInclusion)) : 'Not yet included'}
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Subject of Trauma</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedRecord.subjectOfTrauma}</div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Trauma Type</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedRecord.traumaType}</div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Age at First Occurrence</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">
                                                    {selectedRecord.ageAtFirstOccurrence === "Known Age" && selectedRecord.ageAtFirstOccurrenceValue 
                                                        ? `${selectedRecord.ageAtFirstOccurrenceValue} years` 
                                                        : selectedRecord.ageAtFirstOccurrence}
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Age at Last Occurrence</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">
                                                    {selectedRecord.ageAtLastOccurrence === "Known Age" && selectedRecord.ageAtLastOccurrenceValue 
                                                        ? `${selectedRecord.ageAtLastOccurrenceValue} years` 
                                                        : selectedRecord.ageAtLastOccurrence}
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Ongoing</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedRecord.ongoing}</div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">DCFS Hotline Call Required</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedRecord.dcfsHotlineRequired}</div>
                                            </div>
                                            <div className="col-span-2">
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Description</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedRecord.description}</div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Reported By</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedRecord.reportedBy}</div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Created By</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedRecord.createdBy}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Developmental Stages */}
                                    <div className="mb-6">
                                        <h3 className="text-[14px] font-semibold mb-3 pb-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: '#080707' }}>
                                            Developmental Stages Impacted
                                        </h3>
                                        <div className="space-y-2">
                                            {selectedRecord.developmentalStages?.map((stage: any, index: number) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 rounded-sm flex items-center justify-center ${stage.impacted ? 'bg-[#145F33]' : 'bg-gray-200'}`}>
                                                        {stage.impacted && <span className="text-white text-xs">✓</span>}
                                                    </div>
                                                    <span className="text-[13px] text-[#080707]">{stage.stage}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Impact on Youth */}
                                    <div className="mb-6">
                                        <h3 className="text-[14px] font-semibold mb-3 pb-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: '#080707' }}>
                                            Impact on Youth
                                        </h3>
                                        {selectedRecord.impactOnYouth && selectedRecord.impactOnYouth.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2">Date Reported</TableHead>
                                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2">Description</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedRecord.impactOnYouth.map((impact: any) => (
                                                        <TableRow key={impact.id}>
                                                            <TableCell className="px-3 py-2 text-[13px] text-[#080707]">
                                                                {formatMdy(new Date(impact.dateReported))}
                                                            </TableCell>
                                                            <TableCell className="px-3 py-2 text-[13px] text-[#080707]">{impact.description}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="text-[13px] text-[#706e6b]">No impact records</div>
                                        )}
                                    </div>

                                    {/* Reported By Persons */}
                                    <div className="mb-6">
                                        <h3 className="text-[14px] font-semibold mb-3 pb-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: '#080707' }}>
                                            Reported By
                                        </h3>
                                        {selectedRecord.reportedByPersons && selectedRecord.reportedByPersons.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2">Name</TableHead>
                                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2">Relationship to Youth</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedRecord.reportedByPersons.map((person: any) => (
                                                        <TableRow key={person.id}>
                                                            <TableCell className="px-3 py-2 text-[13px] text-[#080707]">{person.name}</TableCell>
                                                            <TableCell className="px-3 py-2 text-[13px] text-[#080707]">{person.relationship}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="text-[13px] text-[#706e6b]">No reported by records</div>
                                        )}
                                    </div>

                                    {/* Comments */}
                                    <div className="mb-6">
                                        <h3 className="text-[14px] font-semibold mb-3 pb-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: '#080707' }}>
                                            Comments
                                        </h3>
                                        <div className="text-[13px] text-[#080707]">{selectedRecord.comments || 'No comments'}</div>
                                    </div>

                                    {/* Additional Notes */}
                                    {selectedRecord.notes && (
                                        <div className="mb-6">
                                            <h3 className="text-[14px] font-semibold mb-3 pb-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: '#080707' }}>
                                                Additional Notes
                                            </h3>
                                            <div className="text-[13px] text-[#080707]">{selectedRecord.notes}</div>
                                        </div>
                                    )}

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
                                                handleEdit(selectedRecord);
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
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-[18px] font-semibold">
                                    {editingId ? "Edit Trauma History" : "Create Trauma History"}
                                </DialogTitle>
                                <DialogDescription className="text-[14px] text-[#525252]">
                                    {editingId ? "Update trauma history information." : "Add new trauma history record."}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="dateReported" className="text-[11px] font-semibold text-[#080707]">
                                            Date Reported *
                                        </Label>
                                        <DateInput
                                            id="dateReported"
value={isoToMdy(recordForm.dateReported)}
                                            onChange={(v) => ((e) => setRecordForm({...recordForm, dateReported: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                            className="mt-1 h-8 text-[13px]"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="lastItpInclusion" className="text-[11px] font-semibold text-[#080707]">
                                            Last ITP Inclusion
                                        </Label>
                                        <DateInput
                                            id="lastItpInclusion"
value={isoToMdy(recordForm.lastItpInclusion)}
                                            onChange={(v) => ((e) => setRecordForm({...recordForm, lastItpInclusion: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                            className="mt-1 h-8 text-[13px]"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <Label htmlFor="subjectOfTrauma" className="text-[11px] font-semibold text-[#080707]">
                                        Subject of Trauma *
                                    </Label>
                                    <Select
                                        value={recordForm.subjectOfTrauma}
                                        onValueChange={(value) => setRecordForm({...recordForm, subjectOfTrauma: value})}
                                    >
                                        <SelectTrigger className="mt-1 h-8 text-[13px]">
                                            <SelectValue placeholder="Select subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Youth">Youth</SelectItem>
                                            <SelectItem value="Family">Family</SelectItem>
                                            <SelectItem value="Caregiver">Caregiver</SelectItem>
                                            <SelectItem value="Community">Community</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="traumaType" className="text-[11px] font-semibold text-[#080707]">
                                        Trauma Type *
                                    </Label>
                                    <Select
                                        value={recordForm.traumaType}
                                        onValueChange={(value) => setRecordForm({...recordForm, traumaType: value})}
                                    >
                                        <SelectTrigger className="mt-1 h-8 text-[13px]">
                                            <SelectValue placeholder="Select trauma type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Witness to Domestic Violence">Witness to Domestic Violence</SelectItem>
                                            <SelectItem value="Witness to Community Violence">Witness to Community Violence</SelectItem>
                                            <SelectItem value="Victim of Domestic Violence">Victim of Domestic Violence</SelectItem>
                                            <SelectItem value="Victim of Community Violence">Victim of Community Violence</SelectItem>
                                            <SelectItem value="Victim of Physical Abuse">Victim of Physical Abuse</SelectItem>
                                            <SelectItem value="Victim of Sexual Abuse">Victim of Sexual Abuse</SelectItem>
                                            <SelectItem value="Victim of Emotional Abuse">Victim of Emotional Abuse</SelectItem>
                                            <SelectItem value="Victim of Neglect">Victim of Neglect</SelectItem>
                                            <SelectItem value="Victim of Bullying">Victim of Bullying</SelectItem>
                                            <SelectItem value="Traumatic Loss">Traumatic Loss</SelectItem>
                                            <SelectItem value="Incarceration of Parent or Caregiver">Incarceration of Parent or Caregiver</SelectItem>
                                            <SelectItem value="Deportation of Parent or Caregiver">Deportation of Parent or Caregiver</SelectItem>
                                            <SelectItem value="Separation from Parent or Caregiver">Separation from Parent or Caregiver</SelectItem>
                                            <SelectItem value="Medical Trauma">Medical Trauma</SelectItem>
                                            <SelectItem value="Natural Disaster">Natural Disaster</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="ageAtFirstOccurrence" className="text-[11px] font-semibold text-[#080707]">
                                            Age at First Occurrence *
                                        </Label>
                                        <Select
                                            value={recordForm.ageAtFirstOccurrence}
                                            onValueChange={(value) => setRecordForm({...recordForm, ageAtFirstOccurrence: value})}
                                        >
                                            <SelectTrigger className="h-8 text-[13px]">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Known Age">Known Age</SelectItem>
                                                <SelectItem value="Pre-Natal">Pre-Natal</SelectItem>
                                                <SelectItem value="Unknown Age">Unknown Age</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {recordForm.ageAtFirstOccurrence === "Known Age" && (
                                            <Input
                                                type="number"
                                                value={recordForm.ageAtFirstOccurrenceValue}
                                                onChange={(e) => setRecordForm({...recordForm, ageAtFirstOccurrenceValue: e.target.value})}
                                                className="h-8 text-[13px]"
                                                placeholder="Enter age"
                                            />
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="ageAtLastOccurrence" className="text-[11px] font-semibold text-[#080707]">
                                            Age at Last Occurrence *
                                        </Label>
                                        <Select
                                            value={recordForm.ageAtLastOccurrence}
                                            onValueChange={(value) => setRecordForm({...recordForm, ageAtLastOccurrence: value})}
                                        >
                                            <SelectTrigger className="h-8 text-[13px]">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Known Age">Known Age</SelectItem>
                                                <SelectItem value="Pre-Natal">Pre-Natal</SelectItem>
                                                <SelectItem value="Unknown Age">Unknown Age</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {recordForm.ageAtLastOccurrence === "Known Age" && (
                                            <Input
                                                type="number"
                                                value={recordForm.ageAtLastOccurrenceValue}
                                                onChange={(e) => setRecordForm({...recordForm, ageAtLastOccurrenceValue: e.target.value})}
                                                className="h-8 text-[13px]"
                                                placeholder="Enter age"
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="ongoing" className="text-[11px] font-semibold text-[#080707]">
                                            Ongoing *
                                        </Label>
                                        <Select
                                            value={recordForm.ongoing}
                                            onValueChange={(value) => setRecordForm({...recordForm, ongoing: value})}
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
                                        <Label htmlFor="dcfsHotlineRequired" className="text-[11px] font-semibold text-[#080707]">
                                            DCFS Hotline Call Currently Required *
                                        </Label>
                                        <Select
                                            value={recordForm.dcfsHotlineRequired}
                                            onValueChange={(value) => setRecordForm({...recordForm, dcfsHotlineRequired: value})}
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
                                    <Label htmlFor="description" className="text-[11px] font-semibold text-[#080707]">
                                        Description *
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={recordForm.description}
                                        onChange={(e) => setRecordForm({...recordForm, description: e.target.value})}
                                        className="mt-1 min-h-[80px] text-[13px]"
                                        placeholder="Describe the trauma history..."
                                    />
                                </div>
                                
                                <div>
                                    <Label htmlFor="reportedBy" className="text-[11px] font-semibold text-[#080707]">
                                        Reported By *
                                    </Label>
                                    <Input
                                        id="reportedBy"
                                        value={recordForm.reportedBy}
                                        onChange={(e) => setRecordForm({...recordForm, reportedBy: e.target.value})}
                                        className="mt-1 h-8 text-[13px]"
                                        placeholder="Name and role of person reporting"
                                    />
                                </div>

                                {/* Developmental Stages Impacted */}
                                <div 
                                    className="p-4 rounded-lg space-y-3"
                                    style={{ 
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: 'var(--slds-g-color-background-alt)'
                                    }}
                                >
                                    <Label className="text-[11px] font-semibold text-[#080707]">
                                        Developmental Stages Impacted
                                    </Label>
                                    <div className="space-y-2">
                                        {recordForm.developmentalStages.map((stage, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={stage.impacted}
                                                    onChange={() => toggleDevelopmentalStage(index)}
                                                    className="w-4 h-4 rounded border-gray-300"
                                                />
                                                <span className="text-[13px] text-[#080707]">{stage.stage}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Impact on Youth */}
                                <div 
                                    className="p-4 rounded-lg space-y-3"
                                    style={{ 
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: 'var(--slds-g-color-background-alt)'
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[11px] font-semibold text-[#080707]">
                                            Impact on Youth
                                        </Label>
                                        <Button
                                            type="button"
                                            onClick={addImpactRow}
                                            className="h-6 px-2 rounded-full text-[10px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white"
                                        >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add Impact
                                        </Button>
                                    </div>
                                    {recordForm.impactOnYouth.length > 0 ? (
                                        <div className="space-y-2">
                                            {recordForm.impactOnYouth.map((impact) => (
                                                <div key={impact.id} className="grid grid-cols-[120px_1fr_auto] gap-2 items-start">
                                                    <DateInput
value={isoToMdy(impact.dateReported)}
                                                        onChange={(v) => ((e) => updateImpactRow(impact.id, 'dateReported', e.target.value))({ target: { value: mdyToIso(v) } })}
                                                        className="h-7 text-[12px]"
                                                        placeholder="Date"
                                                    />
                                                    <Input
                                                        value={impact.description}
                                                        onChange={(e) => updateImpactRow(impact.id, 'description', e.target.value)}
                                                        className="h-7 text-[12px]"
                                                        placeholder="Description"
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={() => removeImpactRow(impact.id)}
                                                        variant="ghost"
                                                        className="h-7 w-7 p-0 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-3 w-3 text-red-600" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-[12px] text-[#706e6b]">No impact records. Click "Add Impact" to create one.</div>
                                    )}
                                </div>

                                {/* Reported By Persons */}
                                <div 
                                    className="p-4 rounded-lg space-y-3"
                                    style={{ 
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: 'var(--slds-g-color-background-alt)'
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[11px] font-semibold text-[#080707]">
                                            Reported By (Persons)
                                        </Label>
                                        <Button
                                            type="button"
                                            onClick={addReportedByRow}
                                            className="h-6 px-2 rounded-full text-[10px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white"
                                        >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add Person
                                        </Button>
                                    </div>
                                    {recordForm.reportedByPersons.length > 0 ? (
                                        <div className="space-y-2">
                                            {recordForm.reportedByPersons.map((person) => (
                                                <div key={person.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
                                                    <Input
                                                        value={person.name}
                                                        onChange={(e) => updateReportedByRow(person.id, 'name', e.target.value)}
                                                        className="h-7 text-[12px]"
                                                        placeholder="Name"
                                                    />
                                                    <Input
                                                        value={person.relationship}
                                                        onChange={(e) => updateReportedByRow(person.id, 'relationship', e.target.value)}
                                                        className="h-7 text-[12px]"
                                                        placeholder="Relationship to Youth"
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={() => removeReportedByRow(person.id)}
                                                        variant="ghost"
                                                        className="h-7 w-7 p-0 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-3 w-3 text-red-600" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-[12px] text-[#706e6b]">No reported by records. Click "Add Person" to create one.</div>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="comments" className="text-[11px] font-semibold text-[#080707]">
                                        Comments
                                    </Label>
                                    <Textarea
                                        id="comments"
                                        value={recordForm.comments}
                                        onChange={(e) => setRecordForm({...recordForm, comments: e.target.value})}
                                        className="mt-1 min-h-[60px] text-[13px]"
                                        placeholder="Enter comments..."
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="notes" className="text-[11px] font-semibold text-[#080707]">
                                        Additional Notes
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        value={recordForm.notes}
                                        onChange={(e) => setRecordForm({...recordForm, notes: e.target.value})}
                                        className="mt-1 min-h-[60px] text-[13px]"
                                        placeholder="Any additional notes..."
                                    />
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
                                    disabled={!recordForm.dateReported || !recordForm.subjectOfTrauma || !recordForm.traumaType || !recordForm.ageAtFirstOccurrence || !recordForm.ageAtLastOccurrence || !recordForm.ongoing || !recordForm.dcfsHotlineRequired || !recordForm.description || !recordForm.reportedBy}
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
