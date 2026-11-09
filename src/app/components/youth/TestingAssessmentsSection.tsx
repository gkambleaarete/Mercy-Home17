import { useState } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Plus, AlertTriangle } from "@/app/lib/lucide-icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, formatMdy } from "../../lib/dateFormat";
import { getDemoUserName } from "../../lib/demoIdentity";

export function TestingAssessmentsSection() {
    const [testRecords, setTestRecords] = useState([
        {
            id: 1,
            date: "2024-09-15",
            test: "WISC-V (Wechsler Intelligence Scale for Children)",
            summary: "Full Scale IQ: 98 (Average). Verbal Comprehension: 102, Visual Spatial: 95, Fluid Reasoning: 100, Working Memory: 92, Processing Speed: 96. Overall cognitive functioning within average range.",
            administeredBy: "Dr. Sarah Thompson, School Psychologist",
            location: "Mercy Home Testing Center",
            purpose: "Educational placement and IEP development",
            recommendations: "Continue with current academic support. Consider additional working memory strategies.",
            followUpRequired: "Yes",
            followUpDate: "2025-03-15",
            createdBy: "Michael Chen"
        },
        {
            id: 2,
            date: "2024-10-20",
            test: "Trauma Symptom Checklist for Children (TSCC)",
            summary: "Elevated scores on Anxiety (T=68) and Post-Traumatic Stress (T=72) scales. Depression and Anger scales within normal limits. Results indicate significant trauma-related symptoms requiring therapeutic intervention.",
            administeredBy: "Dr. Emily Rodriguez, Clinical Psychologist",
            location: "Outpatient Mental Health Clinic",
            purpose: "Trauma assessment for treatment planning",
            recommendations: "Initiate trauma-focused CBT. Weekly individual therapy sessions recommended. Monitor for symptom changes.",
            followUpRequired: "Yes",
            followUpDate: "2025-01-20",
            createdBy: "Amanda Foster"
        },
        {
            id: 3,
            date: "2024-11-10",
            test: "Behavioral Assessment System for Children (BASC-3)",
            summary: "Clinically significant elevations in Hyperactivity (T=75) and Attention Problems (T=71). At-risk scores for Aggression (T=65). Adaptive skills within normal limits. Results consistent with ADHD presentation.",
            administeredBy: "Jennifer Martinez, Licensed Therapist",
            location: "Mercy Home Campus",
            purpose: "Behavioral assessment and medication evaluation",
            recommendations: "Psychiatric evaluation for possible medication management. Implement behavioral intervention plan. Structured daily routine essential.",
            followUpRequired: "Yes",
            followUpDate: "2025-02-10",
            createdBy: "Robert Wilson"
        },
        {
            id: 4,
            date: "2024-12-05",
            test: "Kaufman Test of Educational Achievement (KTEA-3)",
            summary: "Reading: 85 (Low Average), Math: 78 (Below Average), Written Expression: 82 (Low Average). Two-year gap in math skills. Decoding skills stronger than comprehension. Requires intensive academic intervention.",
            administeredBy: "Patricia Moore, Educational Specialist",
            location: "School District Assessment Center",
            purpose: "Academic skills evaluation for IEP",
            recommendations: "Intensive math tutoring 3x weekly. Reading comprehension support. Extended time for assignments. Small group instruction.",
            followUpRequired: "Yes",
            followUpDate: "2025-06-05",
            createdBy: "David Martinez"
        },
        {
            id: 5,
            date: "2025-01-08",
            test: "Conners Comprehensive Behavior Rating Scales",
            summary: "Parent/Teacher ratings show consistent elevation in Inattention (T=73) and Hyperactivity/Impulsivity (T=70). Executive functioning deficits noted. Peer relations within normal range. Social skills age-appropriate.",
            administeredBy: "Dr. James Taylor, Psychiatrist",
            location: "Mercy Home Medical Office",
            purpose: "ADHD medication monitoring and adjustment",
            recommendations: "Continue current medication with dosage increase. Re-evaluate in 3 months. Monitor for side effects. Consider executive function coaching.",
            followUpRequired: "Yes",
            followUpDate: "2025-04-08",
            createdBy: "Lisa Anderson"
        }
    ]);
    
    const [showDialog, setShowDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [recordForm, setRecordForm] = useState({
        date: "",
        test: "",
        summary: "",
        administeredBy: "",
        location: "",
        purpose: "",
        recommendations: "",
        followUpRequired: "",
        followUpDate: ""
    });

    const handleAdd = () => {
        setEditingId(null);
        setRecordForm({
            date: "",
            test: "",
            summary: "",
            administeredBy: "",
            location: "",
            purpose: "",
            recommendations: "",
            followUpRequired: "",
            followUpDate: ""
        });
        setShowDialog(true);
    };

    const handleEdit = (record: any) => {
        setEditingId(record.id);
        setRecordForm({
            date: record.date,
            test: record.test,
            summary: record.summary,
            administeredBy: record.administeredBy || "",
            location: record.location || "",
            purpose: record.purpose || "",
            recommendations: record.recommendations || "",
            followUpRequired: record.followUpRequired || "",
            followUpDate: record.followUpDate || ""
        });
        setShowDialog(true);
    };

    const handleSave = () => {
        if (editingId) {
            setTestRecords(testRecords.map(r => 
                r.id === editingId 
                    ? { ...r, ...recordForm }
                    : r
            ));
        } else {
            const newRecord = {
                id: Math.max(...testRecords.map(r => r.id), 0) + 1,
                ...recordForm,
                createdBy: getDemoUserName()
            };
            setTestRecords([...testRecords, newRecord]);
        }
        setShowDialog(false);
    };

    const handleRowClick = (record: any) => {
        setSelectedRecord(record);
        setShowDetailDialog(true);
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
                    <h3 className="text-[13px] font-semibold text-[#080707]">Testing & Assessments</h3>
                    <Button
                        onClick={handleAdd}
                        className="h-7 px-3 rounded-full text-[11px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white"
                    >
                        <Plus className="h-3 w-3 mr-1" />
                        Create New Test
                    </Button>
                </div>
                <div className="p-4">
                    {testRecords.length === 0 ? (
                        <div className="text-center py-8" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-40" />
                            <p className="text-[13px]">No testing or assessment records</p>
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
                                            Test
                                        </TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            Summary
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {testRecords.map((record, index) => (
                                        <TableRow 
                                            key={record.id}
                                            onClick={() => handleRowClick(record)}
                                            className="cursor-pointer hover:bg-gray-50"
                                            style={{ 
                                                borderBottom: index < testRecords.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                                backgroundColor: 'var(--slds-g-color-background-base)'
                                            }}
                                        >
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] whitespace-nowrap">
                                                {formatMdy(new Date(record.date))}
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707]">
                                                {record.test}
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] max-w-[400px]">
                                                <div className="line-clamp-2">{record.summary}</div>
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
                                <DialogTitle className="text-[18px] font-semibold">Test & Assessment Details</DialogTitle>
                                <DialogDescription className="text-[14px] text-[#525252]">
                                    View complete testing and assessment information.
                                </DialogDescription>
                            </DialogHeader>
                            {selectedRecord && (
                                <div className="py-4">
                                    {/* Test Information */}
                                    <div className="mb-6">
                                        <h3 className="text-[14px] font-semibold mb-3 pb-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: '#080707' }}>
                                            Test Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Date</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">
                                                    {formatMdy(new Date(selectedRecord.date))}
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Test Name</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedRecord.test}</div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Administered By</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedRecord.administeredBy}</div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Location</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedRecord.location}</div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Purpose</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedRecord.purpose}</div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Created By</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedRecord.createdBy}</div>
                                            </div>
                                            <div className="col-span-2">
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Summary</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedRecord.summary}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recommendations & Follow-up */}
                                    <div className="mb-6">
                                        <h3 className="text-[14px] font-semibold mb-3 pb-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: '#080707' }}>
                                            Recommendations & Follow-up
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Recommendations</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedRecord.recommendations || '—'}</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Follow-up Required</Label>
                                                    <div className="text-[13px] mt-1 text-[#080707]">{selectedRecord.followUpRequired || '—'}</div>
                                                </div>
                                                <div>
                                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Follow-up Date</Label>
                                                    <div className="text-[13px] mt-1 text-[#080707]">
                                                        {selectedRecord.followUpDate ? formatMdy(new Date(selectedRecord.followUpDate)) : '—'}
                                                    </div>
                                                </div>
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
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-[18px] font-semibold">
                                    {editingId ? "Edit Test/Assessment" : "Create New Test/Assessment"}
                                </DialogTitle>
                                <DialogDescription className="text-[14px] text-[#525252]">
                                    {editingId ? "Update test and assessment information." : "Add new test or assessment record."}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div>
                                    <Label htmlFor="date" className="text-[11px] font-semibold text-[#080707]">
                                        Date *
                                    </Label>
                                    <DateInput
                                        id="date"
value={isoToMdy(recordForm.date)}
                                        onChange={(v) => ((e) => setRecordForm({...recordForm, date: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                        className="mt-1 h-8 text-[13px]"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="test" className="text-[11px] font-semibold text-[#080707]">
                                        Test Name *
                                    </Label>
                                    <Select
                                        value={recordForm.test}
                                        onValueChange={(value) => setRecordForm({...recordForm, test: value})}
                                    >
                                        <SelectTrigger className="mt-1 h-8 text-[13px]">
                                            <SelectValue placeholder="Select test type" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            <SelectItem value="ACEs">ACEs</SelectItem>
                                            <SelectItem value="ACT">ACT</SelectItem>
                                            <SelectItem value="ASEBA - ABCL (Adult Behavior Checklist)">ASEBA - ABCL (Adult Behavior Checklist)</SelectItem>
                                            <SelectItem value="ASEBA - ASR (Adult Self-Report)">ASEBA - ASR (Adult Self-Report)</SelectItem>
                                            <SelectItem value="ASEBA - CBCL (Child Behavior Checklist)">ASEBA - CBCL (Child Behavior Checklist)</SelectItem>
                                            <SelectItem value="ASEBA - TRF (Teacher Report Form)">ASEBA - TRF (Teacher Report Form)</SelectItem>
                                            <SelectItem value="ASEBA - YSR (Youth Self-Report)">ASEBA - YSR (Youth Self-Report)</SelectItem>
                                            <SelectItem value="BRIEF - Adult">BRIEF - Adult</SelectItem>
                                            <SelectItem value="BRIEF - Preschool">BRIEF - Preschool</SelectItem>
                                            <SelectItem value="BRIEF - Self-Report">BRIEF - Self-Report</SelectItem>
                                            <SelectItem value="BRIEF - Teacher">BRIEF - Teacher</SelectItem>
                                            <SelectItem value="BRIEF 2 - Parent">BRIEF 2 - Parent</SelectItem>
                                            <SelectItem value="BRIEF 2 - Self-Report">BRIEF 2 - Self-Report</SelectItem>
                                            <SelectItem value="BRIEF 2 - Teacher">BRIEF 2 - Teacher</SelectItem>
                                            <SelectItem value="Casey Life Skills">Casey Life Skills</SelectItem>
                                            <SelectItem value="CRAFFT">CRAFFT</SelectItem>
                                            <SelectItem value="Educational">Educational</SelectItem>
                                            <SelectItem value="GAIN-SS">GAIN-SS</SelectItem>
                                            <SelectItem value="MAYSI">MAYSI</SelectItem>
                                            <SelectItem value="PHQ-9">PHQ-9</SelectItem>
                                            <SelectItem value="PSC (Pediatric Symptom Checklist)">PSC (Pediatric Symptom Checklist)</SelectItem>
                                            <SelectItem value="PTSD">PTSD</SelectItem>
                                            <SelectItem value="Psychological">Psychological</SelectItem>
                                            <SelectItem value="Risk Assessment">Risk Assessment</SelectItem>
                                            <SelectItem value="SAT">SAT</SelectItem>
                                            <SelectItem value="SDQ (Strengths and Difficulties Questionnaire)">SDQ (Strengths and Difficulties Questionnaire)</SelectItem>
                                            <SelectItem value="WISC-V (Wechsler Intelligence Scale for Children)">WISC-V (Wechsler Intelligence Scale for Children)</SelectItem>
                                            <SelectItem value="WAIS-IV (Wechsler Adult Intelligence Scale)">WAIS-IV (Wechsler Adult Intelligence Scale)</SelectItem>
                                            <SelectItem value="BASC-3 (Behavioral Assessment System for Children)">BASC-3 (Behavioral Assessment System for Children)</SelectItem>
                                            <SelectItem value="KTEA-3 (Kaufman Test of Educational Achievement)">KTEA-3 (Kaufman Test of Educational Achievement)</SelectItem>
                                            <SelectItem value="Conners Rating Scales">Conners Rating Scales</SelectItem>
                                            <SelectItem value="TSCC (Trauma Symptom Checklist for Children)">TSCC (Trauma Symptom Checklist for Children)</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="summary" className="text-[11px] font-semibold text-[#080707]">
                                        Summary *
                                    </Label>
                                    <Textarea
                                        id="summary"
                                        value={recordForm.summary}
                                        onChange={(e) => setRecordForm({...recordForm, summary: e.target.value})}
                                        className="mt-1 min-h-[100px] text-[13px]"
                                        placeholder="Provide a summary of test results and findings..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="administeredBy" className="text-[11px] font-semibold text-[#080707]">
                                            Administered By
                                        </Label>
                                        <Input
                                            id="administeredBy"
                                            value={recordForm.administeredBy}
                                            onChange={(e) => setRecordForm({...recordForm, administeredBy: e.target.value})}
                                            className="mt-1 h-8 text-[13px]"
                                            placeholder="Name and credentials"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="location" className="text-[11px] font-semibold text-[#080707]">
                                            Location
                                        </Label>
                                        <Input
                                            id="location"
                                            value={recordForm.location}
                                            onChange={(e) => setRecordForm({...recordForm, location: e.target.value})}
                                            className="mt-1 h-8 text-[13px]"
                                            placeholder="Testing location"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="purpose" className="text-[11px] font-semibold text-[#080707]">
                                        Purpose
                                    </Label>
                                    <Input
                                        id="purpose"
                                        value={recordForm.purpose}
                                        onChange={(e) => setRecordForm({...recordForm, purpose: e.target.value})}
                                        className="mt-1 h-8 text-[13px]"
                                        placeholder="Reason for testing"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="recommendations" className="text-[11px] font-semibold text-[#080707]">
                                        Recommendations
                                    </Label>
                                    <Textarea
                                        id="recommendations"
                                        value={recordForm.recommendations}
                                        onChange={(e) => setRecordForm({...recordForm, recommendations: e.target.value})}
                                        className="mt-1 min-h-[80px] text-[13px]"
                                        placeholder="Recommendations based on test results..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="followUpRequired" className="text-[11px] font-semibold text-[#080707]">
                                            Follow-up Required
                                        </Label>
                                        <Select
                                            value={recordForm.followUpRequired}
                                            onValueChange={(value) => setRecordForm({...recordForm, followUpRequired: value})}
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
                                        <Label htmlFor="followUpDate" className="text-[11px] font-semibold text-[#080707]">
                                            Follow-up Date
                                        </Label>
                                        <DateInput
                                            id="followUpDate"
value={isoToMdy(recordForm.followUpDate)}
                                            onChange={(v) => ((e) => setRecordForm({...recordForm, followUpDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
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
                                    disabled={!recordForm.date || !recordForm.test || !recordForm.summary}
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